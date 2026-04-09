/**
 * @param {string} text
 * @returns {string[]}
 */
export function splitLines(text: string): string[];
/**
 * @param {string[]} lines
 * @returns {string}
 */
export function joinLines(lines: string[]): string;
/**
 * @param {string} text
 * @param {number} index
 * @returns {[string, string]}
 */
export function splitAt(text: string, index: number): [string, string];
/**
 * @param {string} text
 * @param {number} index
 * @returns {string}
 */
export function deleteLine(text: string, index: number): string;
/**
 * @param {string} text
 * @param {number} index
 * @returns {string}
 */
export function duplicateLine(text: string, index: number): string;
/**
 * @param {string} a
 * @param {string} b
 * @returns {[string, string]}
 */
export function flipLines(a: string, b: string): [string, string];
/**
 * Replaces the character range in the specified string with the new value.
 * Similarly to `String.prototype.substring`, characters are replaced from
 * (and including) `from`, up to (but not including) `end`.
 *
 * @param {string} text
 * @param {number} from
 * @param {number} to
 * @param {string} replaceWith
 * @returns {string}
 */
export function replaceRange(text: string, from: number, to: number, replaceWith: string): string;
/**
 * @param {string} text
 * @param {number} from
 * @param {number} [to]
 * @returns {[number, number]}
 */
export function getSelectedLines(text: string, from: number, to?: number): [number, number];
/**
 * @param {string} text
 * @param {number} from
 * @param {number} [to]
 * @returns {[number, number]}
 */
export function extendSelectionToFullLines(text: string, from: number, to?: number): [number, number];
/**
 * For a cursor (e.g. selectionStart in a textarea) in a value, returns the
 * position of the cursor relative to the line it is in.
 *
 * @param {string} text
 * @param {number} cursor
 * @returns {number | undefined}
 */
export function getCursorInLine(text: string, cursor: number): number | undefined;
/**
 * Given a line and a list of rules, checks if the line is a list as defined by
 * one of the rules. If so, it continues the list on the next line, otherwise
 * an empty next line is returned. If a cursor is given, the line is split at
 * the cursor and the continuation text is inserted between the two parts.
 *
 * @param {string} line
 * @param {ContinueListRule[]} rules
 * @param {number} [cursor]
 * @returns {ContinueListResult} The result of the continuation
 */
export function continueList(line: string, rules: ContinueListRule[], cursor?: number): ContinueListResult;
/**
 * @typedef {object} MergeListResult
 * @property {string} currentLine
 * @property {string} marker
 */
/**
 * Given some already existing line, a string of text that should be inserted
 * in that line, and a list of rules for continuing lists, this function checks
 * if: 1) the existing line is a list; and 2) the new text is also a list. If
 * both are true, both will be consolidated in order to avoid duplicate list
 * markers.
 *
 * @param {string} line
 * @param {string} insert
 * @param {ContinueListRule[]} rules
 * @returns {MergeListResult | null}
 */
export function mergeList(line: string, insert: string, rules: ContinueListRule[]): MergeListResult | null;
/** @typedef {"indent" | "outdent"} IndentMode */
/**
 * @param {string[]} lines
 * @param {IndentMode} [mode]
 * @returns {string[]}
 */
export function indent(lines: string[], mode?: IndentMode): string[];
/**
 * @typedef {object} ContinueListRule
 * @property {RegExp} pattern
 * @property {"same" | ((match: string) => string)} next
 */
/**
 * @typedef {object} ContinueListResult
 * @property {string} currentLine
 * @property {string | null} nextLine
 * @property {string | null} marker
 * @property {boolean} didContinue
 * @property {boolean} didEnd
 */
/**
 * Default rules for list continuation.
 *
 * @type {Record<string, ContinueListRule>}
 */
export const continueListRules: Record<string, ContinueListRule>;
export type MergeListResult = {
    currentLine: string;
    marker: string;
};
export type IndentMode = "indent" | "outdent";
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
