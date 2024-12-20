// Manipulating lines -------------------------------------

export function splitLines(text: string): string[] {
  return text.split("\n");
}

export function joinLines(lines: string[]): string {
  return lines.join("\n");
}

export function splitAt(text: string, index: number): [string, string] {
  return [text.slice(0, index), text.slice(index)];
}

export function deleteLine(text: string, index: number): string {
  const result = splitLines(text).toSpliced(index, 1);
  return joinLines(result);
}

export function duplicateLine(text: string, index: number): string {
  let l = splitLines(text);
  if (!l.length || index > l.length) return text;
  return joinLines([...l.slice(0, index), l[index], ...l.slice(index)]);
}

export function flipLines(a: string, b: string): [string, string] {
  return [b, a];
}

/**
 * Replaces the character range in the specified string with the new value.
 * Similarly to `String.prototype.substring`, characters are replaced from
 * (and including) `from`, up to (but not including) `end`.
 */
export function replaceRange(
  text: string,
  from: number,
  to: number,
  replaceWith: string
) {
  return text.substring(0, from) + replaceWith + text.substring(to - 1);
}

// Selection and cursor position --------------------------

export function getSelectedLines(
  text: string,
  from: number,
  to = from
): [number, number] {
  const lines = splitLines(text);
  let cursor = 0;
  let startLine = -1;
  let endLine = -1;
  if (to < from) [from, to] = [to, from];

  for (let i = 0; i < lines.length && (startLine < 0 || endLine < 0); i++) {
    const line = lines[i];
    const lineStart = cursor;
    const lineEnd = lineStart + line.length;

    if (from >= lineStart && from <= lineEnd) startLine = i;
    if (to >= lineStart && to <= lineEnd) endLine = i;

    cursor += line.length + 1;
  }

  return [Math.max(startLine, 0), endLine === -1 ? lines.length - 1 : endLine];
}

export function extendSelectionToFullLines(
  text: string,
  from: number,
  to = from
): [number, number] {
  const lines = splitLines(text);
  const lengths = lines.map((i) => i.length);

  from = Math.max(from, 0);
  to = Math.min(to, lines.length - 1);
  if (to < from) [from, to] = [to, from];

  // Starting at the sum of the lengths of all lines before the first selected
  // line, adjusting for the line breaks which we lost when splitting
  let start = lengths.slice(0, from).reduce((sum, i) => sum + i, 0);
  start += from;

  // Ending at the sum of the lengths of all lines before the last selected
  // line, again adjusting for the line breaks. Since we already calculated this
  // for the start, we can continue from there.
  let end = lengths.slice(from, to + 1).reduce((sum, i) => sum + i, start);
  end += to - from;

  return [start, end];
}

/**
 * For a cursor (e.g. selectionStart in a textarea) in a value, returns the
 * position of the cursor relative to the line it is in.
 *
 * @param text The value containing the cursor
 * @param cursor The position of the cursor
 */
export function getCursorInLine(
  text: string,
  cursor: number
): number | undefined {
  if (cursor > text.length || cursor < 0) return undefined;

  const beforeCursor = text.slice(0, cursor);
  const lineStart = beforeCursor.lastIndexOf("\n") + 1;
  return cursor - lineStart;
}

// List continuation --------------------------------------

export type ContinueListRule = {
  pattern: RegExp;
  next: "same" | ((match: string) => string);
};

export type ContinueListResult = {
  currentLine: string;
  nextLine: string | null;
  marker: string | null;
  didContinue: boolean;
  didEnd: boolean;
};

/** Default rules for list continuation. */
export const continueListRules: Record<string, ContinueListRule> = {
  unordered: { pattern: /^\t*[-*] /, next: "same" },
  indent: { pattern: /^\t+/, next: "same" },
  numbered: {
    pattern: /^\t*\d+\. /,
    next: (match) => `${Number.parseInt(match) + 1}. `,
  },
};

/**
 * Given a line and a list of rules, checks if the line is a list as defined by
 * one of the rules. If so, it continues the list on the next line, otherwise
 * an empty next line is returned. If a cursor is given, the line is split at
 * the cursor and the continuation text is inserted between the two parts.
 *
 * @param line The line to check
 * @param rules The rules to check against
 * @param cursor The cursor position to split the line at, defaults to end of line
 */
export function continueList(
  line: string,
  rules: ContinueListRule[],
  cursor = line.length
): ContinueListResult {
  let matchedRule: ContinueListRule["next"] | undefined = undefined;
  let match: RegExpMatchArray | null = null;
  let nextMarker: string | null = null;

  for (let i = 0; i < rules.length && !matchedRule; i++) {
    match = line.match(rules[i].pattern);
    if (match) matchedRule = rules[i].next;
  }

  const lines = splitAt(line, cursor);

  if (lines[0] && match && matchedRule) {
    nextMarker = matchedRule === "same" ? match[0] : matchedRule(match[0]);
    lines[1] = nextMarker + lines[1];
  }

  const hasEnded = lines[0] === match?.[0] && cursor === line.length;
  if (hasEnded) lines[0] = "";

  return {
    currentLine: lines[0],
    nextLine: hasEnded ? null : lines[1] ?? null,
    didContinue: Boolean(lines[0] && nextMarker),
    didEnd: Boolean(hasEnded && nextMarker),
    marker: nextMarker,
  };
}

export type MergeListResult = {
  currentLine: string;
  marker: string;
};

/**
 * Given some already existing line, a string of text that should be inserted
 * in that line, and a list of rules for continuing lists, this function checks
 * if: 1) the existing line is a list; and 2) the new text is also a list. If
 * both are true, both will be consolidated in order to avoid duplicate list
 * markers.
 *
 * @param line Existing line
 * @param insert Newly inserted content
 * @param rules The rules to check against
 */
export function mergeList(
  line: string,
  insert: string,
  rules: ContinueListRule[]
): MergeListResult | null {
  let pattern: RegExp | null = null;
  let insertMatch: RegExpMatchArray | null = null;

  for (let i = 0; i < rules.length && !pattern; i++) {
    const match = line.match(rules[i].pattern);

    if (match && line.length === match[0].length) {
      pattern = rules[i].pattern;
      insertMatch = insert.match(pattern);
    }
  }

  return pattern && insertMatch
    ? { currentLine: line.replace(pattern, insert), marker: insertMatch[0] }
    : null;
}

// Indentation --------------------------------------------

export type IndentMode = "indent" | "outdent";

export function indent(lines: string[], mode: IndentMode = "indent"): string[] {
  return mode === "indent"
    ? lines.map((i) => `\t${i}`)
    : lines.map((i) => (i.startsWith("\t") ? i.slice(1) : i));
}
