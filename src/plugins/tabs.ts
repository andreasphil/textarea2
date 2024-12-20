import { type T2Plugin, type T2PluginContext } from ".";
import { indent, type IndentMode, joinLines, splitLines } from "../lib/text";
import { Textarea2 } from "../textarea2";

export class TabsPlugin implements T2Plugin {
  #unsubscribe: AbortController | undefined = undefined;
  #t2: Textarea2 | undefined = undefined;

  connected(context: T2PluginContext) {
    this.#unsubscribe = new AbortController();
    this.#t2 = context.t2;

    context.textarea.addEventListener("keydown", this.#keydown.bind(this), {
      signal: this.#unsubscribe.signal,
    });
  }

  disconnected() {
    this.#unsubscribe?.abort();
  }

  #keydown(event: KeyboardEvent): void {
    if (event.key !== "Tab") return;
    event.preventDefault();

    const mode: IndentMode = event.shiftKey ? "outdent" : "indent";

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
