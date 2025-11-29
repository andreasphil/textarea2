import { deleteLine, duplicateLine, splitLines } from "../lib/text.js";

/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */

export class FullLineEditsPlugin {
  /** @type {AbortController | undefined} */
  #unsubscribe = undefined;

  /** @type {Textarea2 | undefined} */
  #t2 = undefined;

  /** @param {T2PluginContext} context */
  connected(context) {
    this.#unsubscribe = new AbortController();
    this.#t2 = context.t2;

    context.textarea.addEventListener("keydown", this.#keydown.bind(this), {
      signal: this.#unsubscribe.signal,
    });
  }

  disconnected() {
    this.#unsubscribe?.abort();
  }

  /** @param {KeyboardEvent} event */
  #keydown(event) {
    let prevent = true;

    this.#t2?.act(async (c) => {
      if (c.selectionStart() !== c.selectionEnd()) {
        prevent = false;
        return;
      }

      const [lineNr] = c.selectedLines();

      if (event.key === "x" && event.metaKey) {
        await navigator.clipboard.writeText(splitLines(c.value())[lineNr]);
        c.value(deleteLine(c.value(), lineNr));
        c.select({ to: "endOfLine", endOf: Math.max(lineNr - 1, 0) });
      } else if (event.key === "c" && event.metaKey) {
        navigator.clipboard.writeText(splitLines(c.value())[lineNr]);
      } else if (event.key === "k" && event.shiftKey && event.metaKey) {
        c.value(deleteLine(c.value(), lineNr));
        c.select({ to: "endOfLine", endOf: lineNr });
      } else if (event.key === "d" && event.shiftKey && event.metaKey) {
        c.value(duplicateLine(c.value(), lineNr));
        c.select({ to: "endOfLine", endOf: lineNr + 1 });
      } else prevent = false;
    });

    if (prevent) event.preventDefault();
  }
}
