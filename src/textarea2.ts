import { createPlaintextRender, T2RenderFn } from "./lib/render";
import * as Text from "./lib/text";
import { type T2Plugin } from "./plugins";
import "./textarea2.css";

export { type T2RenderFn } from "./lib/render";

export type T2Context = {
  focus: (selection?: T2Selection) => void;
  insertAt: (value: string, position: number) => void;
  select: (selection: T2Selection) => void;
  selectedLines: () => [from: number, to: number];
  selectionEnd: () => number;
  selectionStart: () => number;
  type: (value: string) => void;
  value: (newValue?: string) => string;
};

export type T2Selection =
  | { to: "absolute"; start: number; end?: number }
  | { to: "relative"; delta: number; collapse?: boolean }
  | { to: "startOfLine"; startOf: number }
  | { to: "endOfLine"; endOf: number }
  | { to: "lines"; start: number; end: number };

export class Textarea2 extends HTMLElement {
  // Static properties + configuration --------------------
  static define(tag = "textarea-2") {
    customElements.define(tag, this);
  }

  static get observedAttributes() {
    return [];
  }

  // Internal state ---------------------------------------

  #textarea: HTMLTextAreaElement | null = null;

  #output: HTMLDivElement | null = null;

  #plugins: Set<T2Plugin> = new Set();

  #savedValue = "";

  // Lifecycle --------------------------------------------

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

  // Presentation -----------------------------------------

  #renderFn: T2RenderFn = createPlaintextRender();

  setRender(factory: () => T2RenderFn) {
    this.#renderFn = factory();
    this.#render(true);
  }

  #render(reset = false) {
    if (!this.#output || this.#output.getAttribute("custom") !== null) return;

    let oldValue = this.#savedValue;
    if (reset) {
      this.#output.innerHTML = "";
      oldValue = "";
    }

    this.#renderFn({ value: this.#value, oldValue, out: this.#output });
  }

  // Plugins ----------------------------------------------

  use(...plugins: T2Plugin[]) {
    plugins.forEach((plugin) => {
      this.#plugins.add(plugin);

      plugin.setup?.();
      if (this.isConnected) this.#connectPlugin(plugin);
    });

    // Return this method again for chaining
    return { use: this.use.bind(this) };
  }

  #connectPlugin(plugin: T2Plugin) {
    plugin.connected({ t2: this, textarea: this.#textarea! });
  }

  #disconnectPlugin(plugin: T2Plugin) {
    plugin.disconnected?.();
  }

  // Public interface -------------------------------------

  async act(callback: (c: T2Context) => void | Promise<void>) {
    let needsEmitChange = false;

    const value = (newValue?: string) => {
      if (typeof newValue === "string") {
        this.#value = newValue;
        needsEmitChange = true;
      }

      return this.#value;
    };

    const context: T2Context = {
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

  // Internal utilities -----------------------------------

  #focus(selection?: T2Selection) {
    this.#textarea?.focus();
    if (selection) this.#select(selection);
  }

  #select(opts: T2Selection) {
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

  #insertAt(value: string, position: number) {
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

  #type(value: string) {
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

  get #value(): string {
    return this.#textarea?.value ?? "";
  }

  set #value(value: string) {
    if (!this.#textarea) return;
    const [selStart, selEnd] = this.#selection;
    this.#textarea.value = value;
    this.#textarea.dispatchEvent(new InputEvent("input", { bubbles: true }));
    this.#textarea.setSelectionRange(selStart, selEnd);
  }

  #observeValueChanges(el: HTMLTextAreaElement) {
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
      set(value: string) {
        valueProp?.set?.call(el, value);
        onValueChange();
      },
      configurable: true,
      enumerable: true,
    });
  }

  #createOrRecycleOutputElement(): HTMLDivElement {
    let output = this.querySelector(".t2-output") as HTMLDivElement;

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
