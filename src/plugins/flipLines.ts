import { type T2Plugin, type T2PluginContext } from ".";
import { flipLines, joinLines, splitLines } from "../lib/text";
import { Textarea2 } from "../textarea2";

export class FlipLinesPlugin implements T2Plugin {
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
    let handled = true;

    if (event.altKey && event.key === "ArrowDown") this.#flip("down");
    else if (event.altKey && event.key === "ArrowUp") this.#flip("up");
    else handled = false;

    if (handled) event.preventDefault();
  }

  #flip(direction: "up" | "down"): void {
    this.#t2?.act(({ selectedLines, select, value }) => {
      const newLines = splitLines(value());
      const [line1, line2] = selectedLines();
      const to = direction === "up" ? line1 - 1 : line1 + 1;

      if (line1 !== line2 || to < 0 || to >= newLines.length) return;

      const flipped = flipLines(newLines[line1], newLines[to]);
      newLines[line1] = flipped[0];
      newLines[to] = flipped[1];
      value(joinLines(newLines));

      select({ to: "endOfLine", endOf: to });
    });
  }
}
