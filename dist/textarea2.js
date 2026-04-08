//#region src/lib/text.js
/**
* @param {string} text
* @returns {string[]}
*/
function splitLines(text) {
	return text.split("\n");
}
/**
* @param {string[]} lines
* @returns {string}
*/
function joinLines(lines) {
	return lines.join("\n");
}
/**
* @param {string} text
* @param {number} index
* @returns {[string, string]}
*/
function splitAt(text, index) {
	return [text.slice(0, index), text.slice(index)];
}
/**
* @param {string} text
* @param {number} index
* @returns {string}
*/
function deleteLine(text, index) {
	return joinLines(splitLines(text).toSpliced(index, 1));
}
/**
* @param {string} text
* @param {number} index
* @returns {string}
*/
function duplicateLine(text, index) {
	let l = splitLines(text);
	if (!l.length || index > l.length) return text;
	return joinLines([
		...l.slice(0, index),
		l[index],
		...l.slice(index)
	]);
}
/**
* @param {string} a
* @param {string} b
* @returns {[string, string]}
*/
function flipLines(a, b) {
	return [b, a];
}
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
function replaceRange(text, from, to, replaceWith) {
	return text.substring(0, from) + replaceWith + text.substring(to - 1);
}
/**
* @param {string} text
* @param {number} from
* @param {number} [to]
* @returns {[number, number]}
*/
function getSelectedLines(text, from, to = from) {
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
/**
* @param {string} text
* @param {number} from
* @param {number} [to]
* @returns {[number, number]}
*/
function extendSelectionToFullLines(text, from, to = from) {
	const lines = splitLines(text);
	const lengths = lines.map((i) => i.length);
	from = Math.max(from, 0);
	to = Math.min(to, lines.length - 1);
	if (to < from) [from, to] = [to, from];
	let start = lengths.slice(0, from).reduce((sum, i) => sum + i, 0);
	start += from;
	let end = lengths.slice(from, to + 1).reduce((sum, i) => sum + i, start);
	end += to - from;
	return [start, end];
}
/**
* For a cursor (e.g. selectionStart in a textarea) in a value, returns the
* position of the cursor relative to the line it is in.
*
* @param {string} text
* @param {number} cursor
* @returns {number | undefined}
*/
function getCursorInLine(text, cursor) {
	if (cursor > text.length || cursor < 0) return void 0;
	return cursor - (text.slice(0, cursor).lastIndexOf("\n") + 1);
}
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
var continueListRules = {
	unordered: {
		pattern: /^\t*[-*] /,
		next: "same"
	},
	indent: {
		pattern: /^\t+/,
		next: "same"
	},
	numbered: {
		pattern: /^\t*\d+\. /,
		next: (match) => `${Number.parseInt(match) + 1}. `
	}
};
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
function continueList(line, rules, cursor = line.length) {
	/** @type {ContinueListRule["next"] | undefined} */
	let matchedRule = void 0;
	/** @type {RegExpMatchArray | null} */
	let match = null;
	/** @type {string | null} */
	let nextMarker = null;
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
		marker: nextMarker
	};
}
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
function mergeList(line, insert, rules) {
	/** @type {RegExp | null} */
	let pattern = null;
	/** @type {RegExpMatchArray | null} */
	let insertMatch = null;
	for (let i = 0; i < rules.length && !pattern; i++) {
		const match = line.match(rules[i].pattern);
		if (match && line.length === match[0].length) {
			pattern = rules[i].pattern;
			insertMatch = insert.match(pattern);
		}
	}
	return pattern && insertMatch ? {
		currentLine: line.replace(pattern, insert),
		marker: insertMatch[0]
	} : null;
}
/** @typedef {"indent" | "outdent"} IndentMode */
/**
* @param {string[]} lines
* @param {IndentMode} [mode]
* @returns {string[]}
*/
function indent(lines, mode = "indent") {
	return mode === "indent" ? lines.map((i) => `\t${i}`) : lines.map((i) => i.startsWith("	") ? i.slice(1) : i);
}
//#endregion
//#region src/lib/render.js
/**
* @typedef {object} T2RenderContext
* @property {string} value
* @property {string} oldValue
* @property {HTMLElement} out
*/
/** @typedef {(context: T2RenderContext) => void} T2RenderFn */
/** @returns {T2RenderFn} Render function */
function createPlaintextRender() {
	return ({ value, out }) => {
		const lines = splitLines(value);
		const els = Array.from(out.children);
		lines.forEach((line, i) => {
			let el;
			if (i < els.length) el = els[i];
			else {
				el = document.createElement("div");
				out.appendChild(el);
			}
			el.textContent = line;
		});
		while (out.children.length > lines.length && out.lastChild) out.removeChild(out.lastChild);
	};
}
//#endregion
//#region src/plugins/autocomplete.js
/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */
/**
* @typedef {object} AutoComplete
* @property {string} id The unique identifier of the autocomplete mode.
* @property {string} trigger Character that triggers the autocomplete when
*  the user types it. Note that this MUST have a `length` of exactly 1.
* @property {AutoCompleteCommand[] | (() => AutoCompleteCommand[])} commands
*  Commands associated with this autocomplete mode.
*/
/**
* @typedef {object} AutoCompleteCommand
* @property {string} id The unique identifier of the command. Can be any string.
* @property {string} name The visible name of the command.
* @property {string | Element} [icon] Icon of the command. Should be a string
*  (which will be inserted as text content) or an HTML element (which will be
*  inserted as-is).
* @property {string | (() => string | undefined)} value Value of the command.
*  If the value is a string or returns a string, the autocomplete sequence will
*  be replaced by that string. If the value is undefined or returns undefined,
*  the autocomplete sequence will be removed. This can still be useful if you
*  want to run some functionality without inserting any text.
* @property {boolean} [initial] If set to true, the command will be shown by
*  default when the menu is opened, but no query has been entered yet. You can
*  use this to display an initial list of items immediately when the trigger
*  char is typed.
*/
var AutocompletePlugin = class {
	/** @type {AbortController | undefined} */
	#unsubscribe = void 0;
	/** @type {Textarea2 | undefined} */
	#t2 = void 0;
	/** @type {HTMLMenuElement} */
	#menu;
	/** @type {AutoComplete[]} */
	#completions;
	/** @param {AutoComplete[]} completions */
	constructor(completions) {
		this.#menu = this.#createMenuElement();
		this.#completions = completions;
	}
	/** @param {T2PluginContext} context */
	connected(context) {
		this.#unsubscribe = new AbortController();
		this.#t2 = context.t2;
		this.#t2.appendChild(this.#menu);
		this.#t2.addEventListener("keyup", this.#keyup.bind(this), { signal: this.#unsubscribe.signal });
		this.#t2.addEventListener("keydown", this.#keydown.bind(this), { signal: this.#unsubscribe.signal });
	}
	disconnected() {
		this.#unsubscribe?.abort();
	}
	/** @param {KeyboardEvent} event */
	#keydown(event) {
		if (!this.#activeAc) return;
		if (event.key === "ArrowDown") {
			const next = this.#activeAc.focusedIndex + 1;
			const len = this.#activeAc.filteredCommands.length;
			this.#activeAc.focusedIndex = Math.min(len - 1, next);
			event.preventDefault();
		} else if (event.key === "ArrowUp") {
			const next = this.#activeAc.focusedIndex - 1;
			this.#activeAc.focusedIndex = Math.max(next, 0);
			event.preventDefault();
		} else if (event.key === "Enter") {
			const command = this.#activeAc.focusedCommand;
			if (!command) return;
			this.#execAutocomplete(command);
			event.preventDefault();
		}
	}
	/** @param {KeyboardEvent} event */
	#keyup(event) {
		const allowedKeys = [
			"Alt",
			"ArrowDown",
			"ArrowUp",
			"Backspace",
			"Control",
			"Meta",
			"Shift"
		];
		if (!this.#activeAc && ![
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight"
		].includes(event.key)) this.#t2?.act(({ selectionStart, selectionEnd, value }) => {
			const cursor = selectionStart();
			if (cursor !== selectionEnd()) return;
			const char = value().slice(cursor - 1, cursor);
			const mode = this.#completions.find((i) => i.trigger === char);
			if (mode) this.#initAutocomplete(mode);
		});
		else if (!allowedKeys.includes(event.key) && !event.key.match(/^\w$/)) this.#endAutocomplete();
		else if (this.#activeAc?.mode) {
			const cursor = this.#activeAc.start;
			const exp = new RegExp(`^\\${this.#activeAc.mode.trigger}(\\w*)`);
			this.#t2?.act(({ value }) => {
				const match = value().substring(cursor).match(exp);
				if (match && this.#activeAc) this.#activeAc.query = match[1];
				else this.#endAutocomplete();
			});
		}
	}
	/** @type {ActiveAc | null} */
	#activeAc = null;
	/** @param {AutoComplete} mode */
	async #initAutocomplete(mode) {
		const ac = new ActiveAc();
		ac.onRender = (state) => this.#render(state);
		ac.mode = mode;
		this.#t2?.act(({ selectionStart }) => {
			ac.start = selectionStart() - 1;
		});
		this.#determineMenuPosition().then(({ x, y }) => {
			ac.menuPosition = [x, y];
		});
		this.#activeAc = ac;
	}
	/** @param {AutoCompleteCommand} command */
	#execAutocomplete(command) {
		/** @type {string | undefined} */
		let result = void 0;
		if (typeof command.value === "function") result = command.value();
		else if (typeof command.value === "string") result = command.value;
		result ??= "";
		this.#t2?.act(({ value, selectionEnd, select }) => {
			if (!this.#activeAc) return;
			value(replaceRange(value(), this.#activeAc.start, selectionEnd() + 1, result));
			select({
				to: "absolute",
				start: this.#activeAc.start + result.length
			});
		});
		this.#endAutocomplete();
	}
	#endAutocomplete() {
		this.#activeAc = null;
		this.#toggleMenu(false);
	}
	/** @returns {HTMLMenuElement} */
	#createMenuElement() {
		const menu = document.createElement("menu");
		menu.setAttribute("role", "menu");
		menu.popover = "manual";
		menu.classList.add("t2-autocomplete");
		return menu;
	}
	/** @returns {Promise<{x: string, y: string}>} */
	async #determineMenuPosition() {
		return new Promise((resolve) => {
			this.#t2?.act(({ value, selectionStart }) => {
				const splitValue = splitAt(value(), selectionStart() - 1);
				const helper = document.createElement("div");
				helper.classList.add("t2-autocomplete-position-helper");
				const before = document.createElement("span");
				before.textContent = splitValue[0];
				helper.appendChild(before);
				const cursor = document.createElement("span");
				helper.appendChild(cursor);
				const after = document.createElement("span");
				after.textContent = splitValue[1];
				helper.appendChild(after);
				this.#t2?.appendChild(helper);
				requestAnimationFrame(() => {
					const rect = cursor.getBoundingClientRect();
					this.#t2?.removeChild(helper);
					resolve({
						x: `${rect.left}px`,
						y: `${rect.bottom}px`
					});
				});
			});
		});
	}
	/** @param {boolean} visible */
	#toggleMenu(visible) {
		try {
			if (visible) this.#menu.showPopover();
			else this.#menu.hidePopover();
		} catch {} finally {
			if (visible) this.#menu.dataset.popoverOpen = "true";
			else delete this.#menu.dataset.popoverOpen;
		}
	}
	/** @param {ActiveAc} state */
	#render(state) {
		this.#menu.style.setProperty("--t2-autocomplete-x", state.menuPosition[0]);
		this.#menu.style.setProperty("--t2-autocomplete-y", state.menuPosition[1]);
		this.#menu.innerHTML = "";
		if (!state.filteredCommands.length) {
			this.#menu.innerHTML = "";
			this.#toggleMenu(false);
			return;
		}
		state.filteredCommands.map((command, i) => {
			const li = document.createElement("li");
			const button = document.createElement("button");
			if (state.focusedIndex === i) button.setAttribute("aria-pressed", "true");
			button.addEventListener("click", () => {
				this.#execAutocomplete(command);
			});
			if (typeof command.icon === "string") button.textContent = `${command.icon} ${command.name}`;
			else if (command.icon instanceof Element) {
				button.appendChild(command.icon);
				button.append(command.name);
			} else button.textContent = command.name;
			li.appendChild(button);
			return li;
		}).forEach((el) => this.#menu.appendChild(el));
		this.#toggleMenu(true);
	}
};
/** Internal state used by the autocompletion menu */
var ActiveAc = class {
	/** @type {number} */
	#focusedIndex = 0;
	/** @type {[string, string]} */
	#menuPosition = ["0px", "0px"];
	/** @type {AutoComplete | undefined} */
	#mode = void 0;
	/** @type {string} */
	#query = "";
	/** @type {number} */
	start = 0;
	/** @type {(state: ActiveAc) => void} */
	onRender = () => {};
	constructor() {}
	#render() {
		this.onRender(this);
	}
	/** @returns {AutoCompleteCommand[]} */
	get filteredCommands() {
		if (!this.mode) return [];
		const resolvedCommands = Array.isArray(this.mode.commands) ? this.mode.commands : this.mode.commands();
		if (!resolvedCommands?.length) return [];
		let commands;
		if (!this.query) commands = resolvedCommands.filter((i) => i.initial);
		else {
			const lowercaseQuery = this.query.toLowerCase();
			commands = resolvedCommands.filter((i) => {
				return i.name.toLowerCase().includes(lowercaseQuery);
			});
		}
		return commands;
	}
	/** @returns {AutoCompleteCommand | undefined} */
	get focusedCommand() {
		return this.filteredCommands[this.focusedIndex];
	}
	/** @returns {number} */
	get focusedIndex() {
		return this.#focusedIndex;
	}
	/** @param {number} value */
	set focusedIndex(value) {
		this.#focusedIndex = value;
		this.#render();
	}
	/** @returns {[string, string]} */
	get menuPosition() {
		return this.#menuPosition;
	}
	/** @param {[string, string]} value */
	set menuPosition(value) {
		this.#menuPosition = value;
		this.#render();
	}
	/** @returns {AutoComplete | undefined} */
	get mode() {
		return this.#mode;
	}
	/** @param {AutoComplete | undefined} value */
	set mode(value) {
		this.#mode = value;
		this.#render();
	}
	/** @returns {string} */
	get query() {
		return this.#query;
	}
	/** @param {string} value */
	set query(value) {
		this.#query = value;
		this.#render();
	}
};
//#endregion
//#region src/plugins/flipLines.js
/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */
var FlipLinesPlugin = class {
	/** @type {AbortController | undefined} */
	#unsubscribe = void 0;
	/** @type {Textarea2 | undefined} */
	#t2 = void 0;
	/** @param {T2PluginContext} context */
	connected(context) {
		this.#unsubscribe = new AbortController();
		this.#t2 = context.t2;
		context.textarea.addEventListener("keydown", this.#keydown.bind(this), { signal: this.#unsubscribe.signal });
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
			select({
				to: "endOfLine",
				endOf: to
			});
		});
	}
};
//#endregion
//#region src/plugins/fullLineEdits.js
/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */
var FullLineEditsPlugin = class {
	/** @type {AbortController | undefined} */
	#unsubscribe = void 0;
	/** @type {Textarea2 | undefined} */
	#t2 = void 0;
	/** @param {T2PluginContext} context */
	connected(context) {
		this.#unsubscribe = new AbortController();
		this.#t2 = context.t2;
		context.textarea.addEventListener("keydown", this.#keydown.bind(this), { signal: this.#unsubscribe.signal });
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
				c.select({
					to: "endOfLine",
					endOf: Math.max(lineNr - 1, 0)
				});
			} else if (event.key === "c" && event.metaKey) navigator.clipboard.writeText(splitLines(c.value())[lineNr]);
			else if (event.key === "k" && event.shiftKey && event.metaKey) {
				c.value(deleteLine(c.value(), lineNr));
				c.select({
					to: "endOfLine",
					endOf: lineNr
				});
			} else if (event.key === "d" && event.shiftKey && event.metaKey) {
				c.value(duplicateLine(c.value(), lineNr));
				c.select({
					to: "endOfLine",
					endOf: lineNr + 1
				});
			} else prevent = false;
		});
		if (prevent) event.preventDefault();
	}
};
//#endregion
//#region src/plugins/lists.js
/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */
/** @typedef {import("../lib/text.js").ContinueListRule} ContinueListRule */
var defaultContinueListRules = continueListRules;
var ListsPlugin = class {
	/** @type {AbortController | undefined} */
	#unsubscribe = void 0;
	/** @type {Textarea2 | undefined} */
	#t2 = void 0;
	/** @type {ContinueListRule[]} */
	#rules;
	/** @param {ContinueListRule[]} [rules] */
	constructor(rules = Object.values(defaultContinueListRules)) {
		this.#rules = rules;
	}
	/** @param {T2PluginContext} context */
	connected(context) {
		this.#unsubscribe = new AbortController();
		this.#t2 = context.t2;
		context.textarea.addEventListener("keydown", this.#keydown.bind(this), { signal: this.#unsubscribe.signal });
		context.textarea.addEventListener("paste", this.#paste.bind(this), { signal: this.#unsubscribe.signal });
	}
	disconnected() {
		this.#unsubscribe?.abort();
	}
	/** @param {KeyboardEvent} event */
	#keydown(event) {
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
			if (res.didContinue && res.marker) select({
				to: "relative",
				delta: res.marker.length + 1
			});
			else if (res.didEnd) select({
				to: "startOfLine",
				startOf: lineNr
			});
			else select({
				to: "relative",
				delta: 1
			});
		});
	}
	/** @param {ClipboardEvent} event */
	#paste(event) {
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
				collapse: true
			});
		});
	}
};
//#endregion
//#region src/plugins/tabs.js
/** @import { IndentMode }  from "../lib/text.js" */
/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */
var TabsPlugin = class {
	/** @type {AbortController | undefined} */
	#unsubscribe = void 0;
	/** @type {Textarea2 | undefined} */
	#t2 = void 0;
	/** @param {T2PluginContext} context */
	connected(context) {
		this.#unsubscribe = new AbortController();
		this.#t2 = context.t2;
		context.textarea.addEventListener("keydown", this.#keydown.bind(this), { signal: this.#unsubscribe.signal });
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
			if (toIndent.every((r, i) => r === indented[i])) return;
			newLines.splice(fromLine, toLine - fromLine + 1, ...indented);
			value(joinLines(newLines));
			if (fromLine === toLine) select({
				to: "relative",
				delta: mode === "indent" ? 1 : -1
			});
			else select({
				to: "lines",
				start: fromLine,
				end: toLine
			});
		});
	}
};
//#endregion
//#region src/textarea2.js
/**
* @param {TemplateStringsArray} strings
* @param {...unknown} values
* @returns {string}
*/
var tag = (strings, ...values) => String.raw({ raw: strings }, ...values);
var css = tag;
var Textarea2 = class Textarea2 extends HTMLElement {
	static define(tag = "textarea-2") {
		customElements.define(tag, this);
	}
	static get observedAttributes() {
		return [];
	}
	static get #style() {
		return css`
      @scope {
        :scope {
          cursor: text;
          display: grid;
          grid-template-areas: "stack";

          &:has(textarea:read-only) {
            cursor: unset;
          }

          &[overscroll] > .t2-output {
            padding-bottom: 12lh;
          }
        }

        textarea {
          all: unset;
          caret-color: inherit;
          color: transparent;
          min-height: 1lh;
          padding: 0;
          resize: none;
        }

        :is(textarea, .t2-output) {
          background: inherit;
          box-sizing: border-box;
          display: block;
          font: inherit;
          grid-area: stack;
          overflow: hidden;
          white-space: pre-wrap;
        }

        .t2-output {
          pointer-events: none;

          &::selection {
            background: transparent;
          }

          > * {
            min-height: 1lh;
          }
        }

        .t2-autocomplete {
          inset-inline-start: var(--t2-autocomplete-x, 1rem);
          inset-block-start: var(--t2-autocomplete-y, 1rem);
          margin: 0;
          position: fixed;
        }

        .t2-autocomplete-position-helper {
          grid-area: stack;
          white-space: pre-wrap;
        }
      }
    `;
	}
	/** @type {HTMLTextAreaElement | null} */
	#textarea = null;
	/** @type {HTMLDivElement | null} */
	#output = null;
	/** @type {Set<T2Plugin>} */
	#plugins = /* @__PURE__ */ new Set();
	/** @type {string} */
	#savedValue = "";
	constructor() {
		super();
	}
	connectedCallback() {
		const textarea = this.querySelector("textarea");
		if (!textarea) throw new Error("Could not find a textarea to use");
		this.#observeValueChanges(textarea);
		this.#savedValue = textarea.value;
		this.#textarea = textarea;
		this.#output = this.#createOrRecycleOutputElement();
		const node = document.createElement("style");
		node.innerHTML = Textarea2.#style;
		this.insertBefore(node, textarea);
		this.addEventListener("click", () => this.#focus());
		this.#render(true);
		this.#plugins.forEach((plugin) => this.#connectPlugin(plugin));
	}
	disconnectedCallback() {
		this.#plugins.forEach((plugin) => this.#disconnectPlugin(plugin));
	}
	attributeChangedCallback() {}
	/** @type {T2RenderFn} */
	#renderFn = createPlaintextRender();
	/** @param {() => T2RenderFn} factory */
	setRender(factory) {
		this.#renderFn = factory();
		this.#render(true);
	}
	/** @param {boolean} [reset] */
	#render(reset = false) {
		if (!this.#output || this.#output.getAttribute("custom") !== null) return;
		let oldValue = this.#savedValue;
		if (reset) {
			this.#output.innerHTML = "";
			oldValue = "";
		}
		this.#renderFn({
			value: this.#value,
			oldValue,
			out: this.#output
		});
	}
	/**
	* @param {...T2Plugin} plugins
	* @returns {{use: (...plugins: T2Plugin[]) => any}}
	*/
	use(...plugins) {
		plugins.forEach((plugin) => {
			this.#plugins.add(plugin);
			plugin.setup?.();
			if (this.isConnected) this.#connectPlugin(plugin);
		});
		return { use: this.use.bind(this) };
	}
	/** @param {T2Plugin} plugin */
	#connectPlugin(plugin) {
		if (this.#textarea) plugin.connected({
			t2: this,
			textarea: this.#textarea
		});
	}
	/** @param {T2Plugin} plugin */
	#disconnectPlugin(plugin) {
		plugin.disconnected?.();
	}
	/**
	* @param {(c: T2Context) => void | Promise<void>} callback
	* @returns {Promise<void>}
	*/
	async act(callback) {
		let needsEmitChange = false;
		/**
		* @param {string} [newValue]
		* @returns {string}
		*/
		const value = (newValue) => {
			if (typeof newValue === "string") {
				this.#value = newValue;
				needsEmitChange = true;
			}
			return this.#value;
		};
		await callback({
			focus: this.#focus.bind(this),
			insertAt: this.#insertAt.bind(this),
			select: this.#select.bind(this),
			selectedLines: () => this.#seletedLines,
			selectionEnd: () => this.#selectionEnd,
			selectionStart: () => this.#selectionStart,
			type: this.#type.bind(this),
			value
		});
		if (needsEmitChange) this.#textarea?.dispatchEvent(new Event("change", { bubbles: true }));
	}
	/** @param {T2Selection} [selection] */
	#focus(selection) {
		this.#textarea?.focus();
		if (selection) this.#select(selection);
	}
	/** @param {T2Selection} opts */
	#select(opts) {
		if (!this.#textarea) return;
		if (opts.to === "absolute") this.#textarea.setSelectionRange(opts.start, opts.end ?? opts.start);
		else if (opts.to === "relative") {
			const start = this.#selectionStart + opts.delta;
			const end = opts.collapse ? start : this.#selectionEnd + opts.delta;
			this.#textarea.setSelectionRange(start, end);
		} else if (opts.to === "startOfLine") {
			const [start] = extendSelectionToFullLines(this.#value, opts.startOf);
			this.#textarea.setSelectionRange(start, start);
		} else if (opts.to === "endOfLine") {
			const [, end] = extendSelectionToFullLines(this.#value, opts.endOf);
			this.#textarea.setSelectionRange(end, end);
		} else if (opts.to === "lines") {
			const { start, end } = opts;
			const [s, e] = extendSelectionToFullLines(this.#value, start, end);
			this.#textarea.setSelectionRange(s, e);
		}
	}
	/**
	* @param {string} value
	* @param {number} position
	*/
	#insertAt(value, position) {
		let [selStart, selEnd] = this.#selection;
		if (position <= selStart) {
			selStart += value.length;
			selEnd += value.length;
		} else if (position > selStart && position < selEnd) selEnd += value.length;
		const [before, after] = splitAt(this.#value, Math.max(position, 0));
		this.#value = before + value + after;
		this.#select({
			to: "absolute",
			start: selStart,
			end: selEnd
		});
	}
	/** @param {string} value */
	#type(value) {
		this.#insertAt(value, this.#selectionStart);
	}
	get #selectionStart() {
		return this.#textarea?.selectionStart ?? 0;
	}
	get #selectionEnd() {
		return this.#textarea?.selectionEnd ?? 0;
	}
	get #selection() {
		return [this.#selectionStart, this.#selectionEnd];
	}
	get #seletedLines() {
		return getSelectedLines(this.#value, this.#selectionStart, this.#selectionEnd);
	}
	get #value() {
		return this.#textarea?.value ?? "";
	}
	/** @param {string} value */
	set #value(value) {
		if (!this.#textarea) return;
		const [selStart, selEnd] = this.#selection;
		this.#textarea.value = value;
		this.#textarea.dispatchEvent(new InputEvent("input", { bubbles: true }));
		this.#textarea.setSelectionRange(selStart, selEnd);
	}
	/** @param {HTMLTextAreaElement} el */
	#observeValueChanges(el) {
		const onValueChange = () => {
			this.#render();
			this.#savedValue = this.#value;
		};
		el.addEventListener("input", () => {
			onValueChange();
		});
		const valueProp = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
		Object.defineProperty(el, "value", {
			get() {
				return valueProp?.get?.call(el);
			},
			set(value) {
				valueProp?.set?.call(el, value);
				onValueChange();
			},
			configurable: true,
			enumerable: true
		});
	}
	/** @returns {HTMLDivElement} */
	#createOrRecycleOutputElement() {
		/** @type {HTMLDivElement | null} */
		let output = this.querySelector(".t2-output");
		if (!output) {
			output = document.createElement("div");
			output.classList.add("t2-output");
			this.appendChild(output);
		}
		output.setAttribute("aria-hidden", "true");
		output.dataset.testid = "output";
		return output;
	}
};
//#endregion
export { AutocompletePlugin, FlipLinesPlugin, FullLineEditsPlugin, ListsPlugin, TabsPlugin, Textarea2, defaultContinueListRules };
