import { type T2Plugin, type T2PluginContext } from ".";
import { deleteLine, duplicateLine, splitLines } from "../lib/text";
import { Textarea2 } from "../textarea2";

export class FullLineEditsPlugin implements T2Plugin {
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

  #keydown(event: KeyboardEvent) {
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
