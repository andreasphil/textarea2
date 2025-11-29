import { indent, joinLines, splitLines } from "../lib/text.js";

/** @import { IndentMode }  from "../lib/text.js" */
/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */

export class TabsPlugin {
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
    if (event.key !== "Tab") return;
    event.preventDefault();

    /** @type {IndentMode} */
    const mode = event.shiftKey ? "outdent" : "indent";

    this.#t2?.act(({ select, selectedLines, value }) => {
      const newLines = splitLines(value());
      const [fromLine, toLine] = selectedLines();
      const toIndent = newLines.slice(fromLine, toLine + 1);
      const indented = indent(toIndent, mode);

      // Nothing to do if nothing has changed
      if (toIndent.every((r, i) => r === indented[i])) return;

      newLines.splice(fromLine, toLine - fromLine + 1, ...indented);
      value(joinLines(newLines));

      if (fromLine === toLine) {
        select({ to: "relative", delta: mode === "indent" ? 1 : -1 });
      } else select({ to: "lines", start: fromLine, end: toLine });
    });
  }
}
