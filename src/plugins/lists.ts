import { type T2Plugin, type T2PluginContext } from ".";
import {
  continueList,
  continueListRules,
  getCursorInLine,
  joinLines,
  mergeList,
  splitLines,
  type ContinueListRule,
} from "../lib/text";
import { Textarea2 } from "../textarea2";

export { type ContinueListRule } from "../lib/text";

export const defaultContinueListRules = continueListRules;

export class ListsPlugin implements T2Plugin {
  #unsubscribe: AbortController | undefined = undefined;

  #t2: Textarea2 | undefined = undefined;

  #rules: ContinueListRule[];

  constructor(rules = Object.values(defaultContinueListRules)) {
    this.#rules = rules;
  }

  connected(context: T2PluginContext) {
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

  #keydown(event: KeyboardEvent): void {
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

      if (res.didContinue) {
        select({ to: "relative", delta: res.marker!.length + 1 });
      } else if (res.didEnd) {
        select({ to: "startOfLine", startOf: lineNr });
      } else select({ to: "relative", delta: 1 });
    });
  }

  #paste(event: ClipboardEvent): void {
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
