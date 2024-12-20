export declare function splitLines(text: string): string[];
export declare function joinLines(lines: string[]): string;
export declare function splitAt(text: string, index: number): [string, string];
export declare function deleteLine(text: string, index: number): string;
export declare function duplicateLine(text: string, index: number): string;
export declare function flipLines(a: string, b: string): [string, string];
/**
 * Replaces the character range in the specified string with the new value.
 * Similarly to `String.prototype.substring`, characters are replaced from
 * (and including) `from`, up to (but not including) `end`.
 */
export declare function replaceRange(text: string, from: number, to: number, replaceWith: string): string;
export declare function getSelectedLines(text: string, from: number, to?: number): [number, number];
export declare function extendSelectionToFullLines(text: string, from: number, to?: number): [number, number];
/**
 * For a cursor (e.g. selectionStart in a textarea) in a value, returns the
 * position of the cursor relative to the line it is in.
 *
 * @param text The value containing the cursor
 * @param cursor The position of the cursor
 */
export declare function getCursorInLine(text: string, cursor: number): number | undefined;
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
export declare const continueListRules: Record<string, ContinueListRule>;
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
export declare function continueList(line: string, rules: ContinueListRule[], cursor?: number): ContinueListResult;
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
export declare function mergeList(line: string, insert: string, rules: ContinueListRule[]): MergeListResult | null;
export type IndentMode = "indent" | "outdent";
export declare function indent(lines: string[], mode?: IndentMode): string[];
