import {
  continueList,
  continueListRules,
  getCursorInLine,
  joinLines,
  mergeList,
  splitLines,
} from "../lib/text.js";
import { Textarea2 } from "../textarea2.js";

/** @import { T2PluginContext } from "./index.js" */

// Re-create the internal type so it gets included in the dist bundle
/** @typedef {import("../lib/text.js").ContinueListRule} ContinueListRule */

export const defaultContinueListRules = continueListRules;

export class ListsPlugin {
  /** @type {AbortController | undefined} */
  #unsubscribe = undefined;

  /** @type {Textarea2 | undefined} */
  #t2 = undefined;

  /** @type {ContinueListRule[]} */
  #rules;

  /** @param {ContinueListRule[]} [rules] */
  constructor(rules = Object.values(defaultContinueListRules)) {
    this.#rules = rules;
  }

  /** @param {T2PluginContext} context */
  connected(context) {
    this.#unsubscribe = new AbortController();
    this.#t2 = context.t2;

    context.textarea.addEventListener("keydown", this.#keydown.bind(this), {
      signal: this.#unsubscribe.signal,
    });

    context.textarea.addEventListener("paste", this.#paste.bind(this), {
      signal: this.#unsubscribe.signal,
    });
  }

  disconnected() {
    this.#unsubscribe?.abort();
  }

  /** @param {KeyboardEvent} event */
  #keydown(event) {
    if (!this.#rules.length || event.key !== "Enter") return;
    event.preventDefault();

    this.#t2?.act(({ value, selectionStart, selectedLines, select }) => {
      const lines = splitLines(value());
      const [lineNr] = selectedLines();
      const cursor = getCursorInLine(value(), selectionStart());

      const res = continueList(lines[lineNr], this.#rules, cursor);
      lines.splice(lineNr, 1, res.currentLine);
      if (res.nextLine !== null) lines.splice(lineNr + 1, 0, res.nextLine);
      value(joinLines(lines));

      if (res.didContinue && res.marker) {
        select({ to: "relative", delta: res.marker.length + 1 });
      } else if (res.didEnd) {
        select({ to: "startOfLine", startOf: lineNr });
      } else select({ to: "relative", delta: 1 });
    });
  }

  /** @param {ClipboardEvent} event */
  #paste(event) {
    const payload = event.clipboardData?.getData("text/plain");
    if (!payload) return;

    this.#t2?.act(({ value, selectedLines, select }) => {
      const lines = splitLines(value());
      const [fromLine, toLine] = selectedLines();
      if (fromLine !== toLine) return;

      const merge = mergeList(lines[fromLine], payload, this.#rules);
      if (merge === null) return;

      event.preventDefault();

      lines[fromLine] = merge.currentLine;
      value(joinLines(lines));

      select({
        to: "relative",
        delta: merge.currentLine.length - merge.marker.length,
        collapse: true,
      });
    });
  }
}
