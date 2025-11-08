function splitLines(text) {
	return text.split("\n");
}
function joinLines(lines) {
	return lines.join("\n");
}
function splitAt(text, index) {
	return [text.slice(0, index), text.slice(index)];
}
function deleteLine(text, index) {
	return joinLines(splitLines(text).toSpliced(index, 1));
}
function duplicateLine(text, index) {
	let l = splitLines(text);
	if (!l.length || index > l.length) return text;
	return joinLines([
		...l.slice(0, index),
		l[index],
		...l.slice(index)
	]);
}
function flipLines(a, b) {
	return [b, a];
}
function replaceRange(text, from, to, replaceWith) {
	return text.substring(0, from) + replaceWith + text.substring(to - 1);
}
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
function getCursorInLine(text, cursor) {
	if (cursor > text.length || cursor < 0) return void 0;
	return cursor - (text.slice(0, cursor).lastIndexOf("\n") + 1);
}
const continueListRules = {
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
function continueList(line, rules, cursor = line.length) {
	let matchedRule = void 0;
	let match = null;
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
function mergeList(line, insert, rules) {
	let pattern = null;
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
function indent(lines, mode = "indent") {
	return mode === "indent" ? lines.map((i) => `\t${i}`) : lines.map((i) => i.startsWith("	") ? i.slice(1) : i);
}
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
var AutocompletePlugin = class {
	#unsubscribe = void 0;
	#t2 = void 0;
	#menu;
	#completions;
	constructor(completions) {
		this.#menu = this.#createMenuElement();
		this.#completions = completions;
	}
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
		if (!this.#activeAc && !["ArrowUp", "ArrowDown"].includes(event.key)) this.#t2?.act(({ selectionStart, selectionEnd, value }) => {
			const cursor = selectionStart();
			if (cursor !== selectionEnd()) return;
			const char = value().slice(cursor - 1, cursor);
			const mode = this.#completions.find((i) => i.trigger === char);
			if (mode) this.#initAutocomplete(mode);
		});
		else if (!allowedKeys.includes(event.key) && !event.key.match(/^\w$/)) this.#endAutocomplete();
		else if (this.#activeAc?.mode) {
			const cursor = this.#activeAc.start;
			const exp = /* @__PURE__ */ new RegExp(`^\\${this.#activeAc.mode.trigger}(\\w*)`);
			this.#t2?.act(({ value }) => {
				const match = value().substring(cursor).match(exp);
				if (match) this.#activeAc.query = match[1];
				else this.#endAutocomplete();
			});
		}
	}
	#activeAc = null;
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
	#execAutocomplete(command) {
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
	#createMenuElement() {
		const menu = document.createElement("menu");
		menu.setAttribute("role", "menu");
		menu.popover = "manual";
		menu.classList.add("t2-autocomplete");
		return menu;
	}
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
	#toggleMenu(visible) {
		try {
			visible ? this.#menu.showPopover() : this.#menu.hidePopover();
		} catch {} finally {
			if (visible) this.#menu.dataset.popoverOpen = "true";
			else delete this.#menu.dataset.popoverOpen;
		}
	}
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
			if (state.focusedIndex === i) button.setAttribute("active", "true");
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
var ActiveAc = class {
	#focusedIndex = 0;
	#menuPosition = ["0px", "0px"];
	#mode = void 0;
	#query = "";
	start = 0;
	onRender = () => {};
	constructor() {}
	#render() {
		this.onRender(this);
	}
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
	get focusedCommand() {
		return this.filteredCommands[this.focusedIndex];
	}
	get focusedIndex() {
		return this.#focusedIndex;
	}
	set focusedIndex(value) {
		this.#focusedIndex = value;
		this.#render();
	}
	get menuPosition() {
		return this.#menuPosition;
	}
	set menuPosition(value) {
		this.#menuPosition = value;
		this.#render();
	}
	get mode() {
		return this.#mode;
	}
	set mode(value) {
		this.#mode = value;
		this.#render();
	}
	get query() {
		return this.#query;
	}
	set query(value) {
		this.#query = value;
		this.#render();
	}
};
var FlipLinesPlugin = class {
	#unsubscribe = void 0;
	#t2 = void 0;
	connected(context) {
		this.#unsubscribe = new AbortController();
		this.#t2 = context.t2;
		context.textarea.addEventListener("keydown", this.#keydown.bind(this), { signal: this.#unsubscribe.signal });
	}
	disconnected() {
		this.#unsubscribe?.abort();
	}
	#keydown(event) {
		let handled = true;
		if (event.altKey && event.key === "ArrowDown") this.#flip("down");
		else if (event.altKey && event.key === "ArrowUp") this.#flip("up");
		else handled = false;
		if (handled) event.preventDefault();
	}
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
var FullLineEditsPlugin = class {
	#unsubscribe = void 0;
	#t2 = void 0;
	connected(context) {
		this.#unsubscribe = new AbortController();
		this.#t2 = context.t2;
		context.textarea.addEventListener("keydown", this.#keydown.bind(this), { signal: this.#unsubscribe.signal });
	}
	disconnected() {
		this.#unsubscribe?.abort();
	}
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
const defaultContinueListRules = continueListRules;
var ListsPlugin = class {
	#unsubscribe = void 0;
	#t2 = void 0;
	#rules;
	constructor(rules = Object.values(defaultContinueListRules)) {
		this.#rules = rules;
	}
	connected(context) {
		this.#unsubscribe = new AbortController();
		this.#t2 = context.t2;
		context.textarea.addEventListener("keydown", this.#keydown.bind(this), { signal: this.#unsubscribe.signal });
		context.textarea.addEventListener("paste", this.#paste.bind(this), { signal: this.#unsubscribe.signal });
	}
	disconnected() {
		this.#unsubscribe?.abort();
	}
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
			if (res.didContinue) select({
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
var TabsPlugin = class {
	#unsubscribe = void 0;
	#t2 = void 0;
	connected(context) {
		this.#unsubscribe = new AbortController();
		this.#t2 = context.t2;
		context.textarea.addEventListener("keydown", this.#keydown.bind(this), { signal: this.#unsubscribe.signal });
	}
	disconnected() {
		this.#unsubscribe?.abort();
	}
	#keydown(event) {
		if (event.key !== "Tab") return;
		event.preventDefault();
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
var tag = (strings, ...values) => String.raw({ raw: strings }, ...values);
var css = tag;
var Textarea2 = class Textarea2 extends HTMLElement {
	static define(tag$1 = "textarea-2") {
		customElements.define(tag$1, this);
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
	#textarea = null;
	#output = null;
	#plugins = /* @__PURE__ */ new Set();
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
	#renderFn = createPlaintextRender();
	setRender(factory) {
		this.#renderFn = factory();
		this.#render(true);
	}
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
	use(...plugins) {
		plugins.forEach((plugin) => {
			this.#plugins.add(plugin);
			plugin.setup?.();
			if (this.isConnected) this.#connectPlugin(plugin);
		});
		return { use: this.use.bind(this) };
	}
	#connectPlugin(plugin) {
		plugin.connected({
			t2: this,
			textarea: this.#textarea
		});
	}
	#disconnectPlugin(plugin) {
		plugin.disconnected?.();
	}
	async act(callback) {
		let needsEmitChange = false;
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
	#focus(selection) {
		this.#textarea?.focus();
		if (selection) this.#select(selection);
	}
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
	set #value(value) {
		if (!this.#textarea) return;
		const [selStart, selEnd] = this.#selection;
		this.#textarea.value = value;
		this.#textarea.dispatchEvent(new InputEvent("input", { bubbles: true }));
		this.#textarea.setSelectionRange(selStart, selEnd);
	}
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
	#createOrRecycleOutputElement() {
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
export { AutocompletePlugin, FlipLinesPlugin, FullLineEditsPlugin, ListsPlugin, TabsPlugin, Textarea2, defaultContinueListRules };
