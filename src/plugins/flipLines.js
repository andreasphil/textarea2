import { flipLines, joinLines, splitLines } from "../lib/text.js";

/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */

export class FlipLinesPlugin {
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
    let handled = true;

    if (event.altKey && event.key === "ArrowDown") this.#flip("down");
    else if (event.altKey && event.key === "ArrowUp") this.#flip("up");
    else handled = false;

    if (handled) event.preventDefault();
  }

  /** @param {"up" | "down"} direction */
  #flip(direction) {
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
