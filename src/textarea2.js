import { createPlaintextRender } from "./lib/render.js";
import * as Text from "./lib/text.js";

/** @import { T2RenderFn } from "./lib/render.js" */
/** @import { T2Plugin } from "./plugins/index.js" */

/**
 * @typedef {object} T2Context
 * @property {(selection?: T2Selection) => void} focus
 * @property {(value: string, position: number) => void} insertAt
 * @property {(selection: T2Selection) => void} select
 * @property {() => [number, number]} selectedLines
 * @property {() => number} selectionEnd
 * @property {() => number} selectionStart
 * @property {(value: string) => void} type
 * @property {(newValue?: string) => string} value
 */

/**
 * @typedef {object} T2SelectionAbsolute
 * @property {"absolute"} to
 * @property {number} start
 * @property {number} [end]
 */

/**
 * @typedef {object} T2SelectionRelative
 * @property {"relative"} to
 * @property {number} delta
 * @property {boolean} [collapse]
 */

/**
 * @typedef {object} T2SelectionStartOfLine
 * @property {"startOfLine"} to
 * @property {number} startOf
 */

/**
 * @typedef {object} T2SelectionEndOfLine
 * @property {"endOfLine"} to
 * @property {number} endOf
 */

/**
 * @typedef {object} T2SelectionLines
 * @property {"lines"} to
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {T2SelectionAbsolute | T2SelectionRelative | T2SelectionStartOfLine | T2SelectionEndOfLine | T2SelectionLines} T2Selection
 */

export * from "./plugins/index.js";

/**
 * @param {TemplateStringsArray} strings
 * @param {...unknown} values
 * @returns {string}
 */
const tag = (strings, ...values) => String.raw({ raw: strings }, ...values);

const css = tag;

export class Textarea2 extends HTMLElement {
  // Static properties + configuration ----------------------

  static define(tag = "textarea-2") {
    customElements.define(tag, this);
  }

  static get observedAttributes() {
    return [];
  }

  static get #style() {
    return css`
      @scope {
        :scope {
          cursor: text;
          display: grid;
          grid-template-areas: "stack";

          &:has(textarea:read-only) {
            cursor: unset;
          }

          &[overscroll] > .t2-output {
            padding-bottom: 12lh;
          }
        }

        textarea {
          all: unset;
          caret-color: inherit;
          color: transparent;
          min-height: 1lh;
          padding: 0;
          resize: none;
        }

        :is(textarea, .t2-output) {
          background: inherit;
          box-sizing: border-box;
          display: block;
          font: inherit;
          grid-area: stack;
          overflow: hidden;
          white-space: pre-wrap;
        }

        .t2-output {
          pointer-events: none;

          &::selection {
            background: transparent;
          }

          > * {
            min-height: 1lh;
          }
        }

        .t2-autocomplete {
          inset-inline-start: var(--t2-autocomplete-x, 1rem);
          inset-block-start: var(--t2-autocomplete-y, 1rem);
          margin: 0;
          position: fixed;
        }

        .t2-autocomplete-position-helper {
          grid-area: stack;
          white-space: pre-wrap;
        }
      }
    `;
  }

  // Internal state -----------------------------------------

  /** @type {HTMLTextAreaElement | null} */
  #textarea = null;

  /** @type {HTMLDivElement | null} */
  #output = null;

  /** @type {Set<T2Plugin>} */
  #plugins = new Set();

  /** @type {string} */
  #savedValue = "";

  // Lifecycle ----------------------------------------------

  constructor() {
    super();
  }

  connectedCallback() {
    // Wire up slotted textarea
    const textarea = this.querySelector("textarea");
    if (!textarea) throw new Error("Could not find a textarea to use");
    this.#observeValueChanges(textarea);
    this.#savedValue = textarea.value;
    this.#textarea = textarea;

    // Wire up presentation layer
    const output = this.#createOrRecycleOutputElement();
    this.#output = output;

    // Inject styles
    const node = document.createElement("style");
    node.innerHTML = Textarea2.#style;
    this.insertBefore(node, textarea);

    // Global events
    this.addEventListener("click", () => this.#focus());

    // Initial render pass
    this.#render(true);

    // Connect plugins
    this.#plugins.forEach((plugin) => this.#connectPlugin(plugin));
  }

  disconnectedCallback() {
    // Disconnect plugins
    this.#plugins.forEach((plugin) => this.#disconnectPlugin(plugin));
  }

  attributeChangedCallback() {}

  // Presentation -------------------------------------------

  /** @type {T2RenderFn} */
  #renderFn = createPlaintextRender();

  /** @param {() => T2RenderFn} factory */
  setRender(factory) {
    this.#renderFn = factory();
    this.#render(true);
  }

  /** @param {boolean} [reset] */
  #render(reset = false) {
    if (!this.#output || this.#output.getAttribute("custom") !== null) return;

    let oldValue = this.#savedValue;
    if (reset) {
      this.#output.innerHTML = "";
      oldValue = "";
    }

    this.#renderFn({ value: this.#value, oldValue, out: this.#output });
  }

  // Plugins ------------------------------------------------

  /**
   * @param {...T2Plugin} plugins
   * @returns {{use: (...plugins: T2Plugin[]) => any}}
   */
  use(...plugins) {
    plugins.forEach((plugin) => {
      this.#plugins.add(plugin);

      plugin.setup?.();
      if (this.isConnected) this.#connectPlugin(plugin);
    });

    // Return this method again for chaining
    return { use: this.use.bind(this) };
  }

  /** @param {T2Plugin} plugin */
  #connectPlugin(plugin) {
    if (this.#textarea) {
      plugin.connected({ t2: this, textarea: this.#textarea });
    }
  }

  /** @param {T2Plugin} plugin */
  #disconnectPlugin(plugin) {
    plugin.disconnected?.();
  }

  // Public interface ---------------------------------------

  /**
   * @param {(c: T2Context) => void | Promise<void>} callback
   * @returns {Promise<void>}
   */
  async act(callback) {
    let needsEmitChange = false;

    /**
     * @param {string} [newValue]
     * @returns {string}
     */
    const value = (newValue) => {
      if (typeof newValue === "string") {
        this.#value = newValue;
        needsEmitChange = true;
      }

      return this.#value;
    };

    /** @type {T2Context} */
    const context = {
      focus: this.#focus.bind(this),
      insertAt: this.#insertAt.bind(this),
      select: this.#select.bind(this),
      selectedLines: () => this.#seletedLines,
      selectionEnd: () => this.#selectionEnd,
      selectionStart: () => this.#selectionStart,
      type: this.#type.bind(this),
      value,
    };

    await callback(context);

    if (needsEmitChange) {
      this.#textarea?.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  // Internal utilities -------------------------------------

  /** @param {T2Selection} [selection] */
  #focus(selection) {
    this.#textarea?.focus();
    if (selection) this.#select(selection);
  }

  /** @param {T2Selection} opts */
  #select(opts) {
    if (!this.#textarea) return;

    // Set selection to a new range, ignoring the current selection
    if (opts.to === "absolute") {
      this.#textarea.setSelectionRange(opts.start, opts.end ?? opts.start);
    }

    // Shift the current selection by a delta. If `collapse` is true, the end of
    // the selection will be moved to the start of the selection, even if a range
    // was selected before.
    else if (opts.to === "relative") {
      const start = this.#selectionStart + opts.delta;
      const end = opts.collapse ? start : this.#selectionEnd + opts.delta;
      this.#textarea.setSelectionRange(start, end);
    }

    // Sets the selection to the start of the specified line
    else if (opts.to === "startOfLine") {
      const [start] = Text.extendSelectionToFullLines(
        this.#value,
        opts.startOf
      );
      this.#textarea.setSelectionRange(start, start);
    }

    // Sets the selection to the end of the specified line
    else if (opts.to === "endOfLine") {
      const [, end] = Text.extendSelectionToFullLines(this.#value, opts.endOf);
      this.#textarea.setSelectionRange(end, end);
    }

    // Sets the selection to a range spanning the specified lines
    else if (opts.to === "lines") {
      const { start, end } = opts;
      const [s, e] = Text.extendSelectionToFullLines(this.#value, start, end);
      this.#textarea.setSelectionRange(s, e);
    }
  }

  /**
   * @param {string} value
   * @param {number} position
   */
  #insertAt(value, position) {
    let [selStart, selEnd] = this.#selection;
    if (position <= selStart) {
      selStart += value.length;
      selEnd += value.length;
    } else if (position > selStart && position < selEnd) {
      selEnd += value.length;
    }

    const [before, after] = Text.splitAt(this.#value, Math.max(position, 0));
    this.#value = before + value + after;

    this.#select({ to: "absolute", start: selStart, end: selEnd });
  }

  /** @param {string} value */
  #type(value) {
    this.#insertAt(value, this.#selectionStart);
  }

  get #selectionStart() {
    return this.#textarea?.selectionStart ?? 0;
  }

  get #selectionEnd() {
    return this.#textarea?.selectionEnd ?? 0;
  }

  get #selection() {
    return [this.#selectionStart, this.#selectionEnd];
  }

  get #seletedLines() {
    return Text.getSelectedLines(
      this.#value,
      this.#selectionStart,
      this.#selectionEnd
    );
  }

  get #value() {
    return this.#textarea?.value ?? "";
  }

  /** @param {string} value */
  set #value(value) {
    if (!this.#textarea) return;
    const [selStart, selEnd] = this.#selection;
    this.#textarea.value = value;
    this.#textarea.dispatchEvent(new InputEvent("input", { bubbles: true }));
    this.#textarea.setSelectionRange(selStart, selEnd);
  }

  /** @param {HTMLTextAreaElement} el */
  #observeValueChanges(el) {
    const onValueChange = () => {
      this.#render();
      this.#savedValue = this.#value;
    };

    el.addEventListener("input", () => {
      onValueChange();
    });

    const valueProp = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    );

    Object.defineProperty(el, "value", {
      get() {
        return valueProp?.get?.call(el);
      },

      /** @param {string} value */
      set(value) {
        valueProp?.set?.call(el, value);
        onValueChange();
      },

      configurable: true,
      enumerable: true,
    });
  }

  /** @returns {HTMLDivElement} */
  #createOrRecycleOutputElement() {
    /** @type {HTMLDivElement | null} */
    let output = this.querySelector(".t2-output");

    if (!output) {
      output = document.createElement("div");
      output.classList.add("t2-output");
      this.appendChild(output);
    }

    output.setAttribute("aria-hidden", "true");
    output.dataset.testid = "output";

    return output;
  }
}
