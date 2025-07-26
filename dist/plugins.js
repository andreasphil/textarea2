import { r as y, a as g, s as d, f as w, j as h, d as f, b as L, c as b, h as x, i as C, m as k, k as v } from "./text-BeGDkh5s.js";
class D {
  #s = void 0;
  #e = void 0;
  #t;
  #n;
  constructor(e) {
    this.#t = this.#h(), this.#n = e;
  }
  connected(e) {
    this.#s = new AbortController(), this.#e = e.t2, this.#e.appendChild(this.#t), this.#e.addEventListener("keyup", this.#d.bind(this), {
      signal: this.#s.signal
    }), this.#e.addEventListener("keydown", this.#o.bind(this), {
      signal: this.#s.signal
    });
  }
  disconnected() {
    this.#s?.abort();
  }
  // Keybindings ------------------------------------------
  #o(e) {
    if (this.#i) {
      if (e.key === "ArrowDown") {
        const t = this.#i.focusedIndex + 1, s = this.#i.filteredCommands.length;
        this.#i.focusedIndex = Math.min(s - 1, t), e.preventDefault();
      } else if (e.key === "ArrowUp") {
        const t = this.#i.focusedIndex - 1;
        this.#i.focusedIndex = Math.max(t, 0), e.preventDefault();
      } else if (e.key === "Enter") {
        const t = this.#i.focusedCommand;
        if (!t) return;
        this.#l(t), e.preventDefault();
      }
    }
  }
  #d(e) {
    const t = [
      "Alt",
      "ArrowDown",
      "ArrowUp",
      "Backspace",
      "Control",
      "Meta",
      "Shift"
    ];
    if (!this.#i && !["ArrowUp", "ArrowDown"].includes(e.key))
      this.#e?.act(({ selectionStart: s, selectionEnd: n, value: i }) => {
        const o = s();
        if (o !== n()) return;
        const r = i().slice(o - 1, o), l = this.#n.find((a) => a.trigger === r);
        l && this.#c(l);
      });
    else if (!t.includes(e.key) && !e.key.match(/^\w$/))
      this.#r();
    else if (this.#i?.mode) {
      const s = this.#i.start, n = new RegExp(`^\\${this.#i.mode.trigger}(\\w*)`);
      this.#e?.act(({ value: i }) => {
        const r = i().substring(s).match(n);
        r ? this.#i.query = r[1] : this.#r();
      });
    }
  }
  // Autocomplete lifecycle -------------------------------
  #i = null;
  async #c(e) {
    const t = new A();
    t.onRender = (s) => this.#f(s), t.mode = e, this.#e?.act(({ selectionStart: s }) => {
      t.start = s() - 1;
    }), this.#u().then(({ x: s, y: n }) => {
      t.menuPosition = [s, n];
    }), this.#i = t;
  }
  #l(e) {
    let t;
    typeof e.value == "function" ? t = e.value() : typeof e.value == "string" && (t = e.value), t ??= "", this.#e?.act(({ value: s, selectionEnd: n, select: i }) => {
      if (!this.#i) return;
      const o = y(
        s(),
        this.#i.start,
        n() + 1,
        t
      );
      s(o);
      const r = this.#i.start + t.length;
      i({ to: "absolute", start: r });
    }), this.#r();
  }
  #r() {
    this.#i = null, this.#a(!1);
  }
  // Rendering --------------------------------------------
  #h() {
    const e = document.createElement("menu");
    return e.setAttribute("role", "menu"), e.popover = "manual", e.classList.add("t2-autocomplete"), e;
  }
  async #u() {
    return new Promise((e) => {
      this.#e?.act(({ value: t, selectionStart: s }) => {
        const n = g(t(), s() - 1), i = document.createElement("div");
        i.classList.add("t2-autocomplete-position-helper");
        const o = document.createElement("span");
        o.textContent = n[0], i.appendChild(o);
        const r = document.createElement("span");
        i.appendChild(r);
        const l = document.createElement("span");
        l.textContent = n[1], i.appendChild(l), this.#e?.appendChild(i), requestAnimationFrame(() => {
          const a = r.getBoundingClientRect();
          this.#e?.removeChild(i), e({ x: `${a.left}px`, y: `${a.bottom}px` });
        });
      });
    });
  }
  #a(e) {
    try {
      e ? this.#t.showPopover() : this.#t.hidePopover();
    } catch {
    } finally {
      e ? this.#t.dataset.popoverOpen = "true" : delete this.#t.dataset.popoverOpen;
    }
  }
  #f(e) {
    if (this.#t.style.setProperty("--t2-autocomplete-x", e.menuPosition[0]), this.#t.style.setProperty("--t2-autocomplete-y", e.menuPosition[1]), this.#t.innerHTML = "", !e.filteredCommands.length) {
      this.#t.innerHTML = "", this.#a(!1);
      return;
    }
    e.filteredCommands.map((t, s) => {
      const n = document.createElement("li"), i = document.createElement("button");
      return e.focusedIndex === s && i.setAttribute("active", "true"), i.addEventListener("click", () => {
        this.#l(t);
      }), typeof t.icon == "string" ? i.textContent = `${t.icon} ${t.name}` : t.icon instanceof Element ? (i.appendChild(t.icon), i.append(t.name)) : i.textContent = t.name, n.appendChild(i), n;
    }).forEach((t) => this.#t.appendChild(t)), this.#a(!0);
  }
}
class A {
  #s = 0;
  #e = ["0px", "0px"];
  #t = void 0;
  #n = "";
  start = 0;
  onRender = () => {
  };
  constructor() {
  }
  #o() {
    this.onRender(this);
  }
  get filteredCommands() {
    if (!this.mode) return [];
    const e = Array.isArray(this.mode.commands) ? this.mode.commands : this.mode.commands();
    if (!e?.length) return [];
    let t;
    if (!this.query)
      t = e.filter((s) => s.initial);
    else {
      const s = this.query.toLowerCase();
      t = e.filter((n) => n.name.toLowerCase().includes(s));
    }
    return t;
  }
  get focusedCommand() {
    return this.filteredCommands[this.focusedIndex];
  }
  get focusedIndex() {
    return this.#s;
  }
  set focusedIndex(e) {
    this.#s = e, this.#o();
  }
  get menuPosition() {
    return this.#e;
  }
  set menuPosition(e) {
    this.#e = e, this.#o();
  }
  get mode() {
    return this.#t;
  }
  set mode(e) {
    this.#t = e, this.#o();
  }
  get query() {
    return this.#n;
  }
  set query(e) {
    this.#n = e, this.#o();
  }
}
class O {
  #s = void 0;
  #e = void 0;
  connected(e) {
    this.#s = new AbortController(), this.#e = e.t2, e.textarea.addEventListener("keydown", this.#t.bind(this), {
      signal: this.#s.signal
    });
  }
  disconnected() {
    this.#s?.abort();
  }
  #t(e) {
    let t = !0;
    e.altKey && e.key === "ArrowDown" ? this.#n("down") : e.altKey && e.key === "ArrowUp" ? this.#n("up") : t = !1, t && e.preventDefault();
  }
  #n(e) {
    this.#e?.act(({ selectedLines: t, select: s, value: n }) => {
      const i = d(n()), [o, r] = t(), l = e === "up" ? o - 1 : o + 1;
      if (o !== r || l < 0 || l >= i.length) return;
      const a = w(i[o], i[l]);
      i[o] = a[0], i[l] = a[1], n(h(i)), s({ to: "endOfLine", endOf: l });
    });
  }
}
class I {
  #s = void 0;
  #e = void 0;
  connected(e) {
    this.#s = new AbortController(), this.#e = e.t2, e.textarea.addEventListener("keydown", this.#t.bind(this), {
      signal: this.#s.signal
    });
  }
  disconnected() {
    this.#s?.abort();
  }
  #t(e) {
    let t = !0;
    this.#e?.act(async (s) => {
      if (s.selectionStart() !== s.selectionEnd()) {
        t = !1;
        return;
      }
      const [n] = s.selectedLines();
      e.key === "x" && e.metaKey ? (await navigator.clipboard.writeText(d(s.value())[n]), s.value(f(s.value(), n)), s.select({ to: "endOfLine", endOf: Math.max(n - 1, 0) })) : e.key === "c" && e.metaKey ? navigator.clipboard.writeText(d(s.value())[n]) : e.key === "k" && e.shiftKey && e.metaKey ? (s.value(f(s.value(), n)), s.select({ to: "endOfLine", endOf: n })) : e.key === "d" && e.shiftKey && e.metaKey ? (s.value(L(s.value(), n)), s.select({ to: "endOfLine", endOf: n + 1 })) : t = !1;
    }), t && e.preventDefault();
  }
}
const E = b;
class K {
  #s = void 0;
  #e = void 0;
  #t;
  constructor(e = Object.values(E)) {
    this.#t = e;
  }
  connected(e) {
    this.#s = new AbortController(), this.#e = e.t2, e.textarea.addEventListener("keydown", this.#n.bind(this), {
      signal: this.#s.signal
    }), e.textarea.addEventListener("paste", this.#o.bind(this), {
      signal: this.#s.signal
    });
  }
  disconnected() {
    this.#s?.abort();
  }
  #n(e) {
    !this.#t.length || e.key !== "Enter" || (e.preventDefault(), this.#e?.act(({ value: t, selectionStart: s, selectedLines: n, select: i }) => {
      const o = d(t()), [r] = n(), l = x(t(), s()), a = C(o[r], this.#t, l);
      o.splice(r, 1, a.currentLine), a.nextLine !== null && o.splice(r + 1, 0, a.nextLine), t(h(o)), a.didContinue ? i({ to: "relative", delta: a.marker.length + 1 }) : a.didEnd ? i({ to: "startOfLine", startOf: r }) : i({ to: "relative", delta: 1 });
    }));
  }
  #o(e) {
    const t = e.clipboardData?.getData("text/plain");
    t && this.#e?.act(({ value: s, selectedLines: n, select: i }) => {
      const o = d(s()), [r, l] = n();
      if (r !== l) return;
      const a = k(o[r], t, this.#t);
      a !== null && (e.preventDefault(), o[r] = a.currentLine, s(h(o)), i({
        to: "relative",
        delta: a.currentLine.length - a.marker.length,
        collapse: !0
      }));
    });
  }
}
class M {
  #s = void 0;
  #e = void 0;
  connected(e) {
    this.#s = new AbortController(), this.#e = e.t2, e.textarea.addEventListener("keydown", this.#t.bind(this), {
      signal: this.#s.signal
    });
  }
  disconnected() {
    this.#s?.abort();
  }
  #t(e) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const t = e.shiftKey ? "outdent" : "indent";
    this.#e?.act(({ select: s, selectedLines: n, value: i }) => {
      const o = d(i()), [r, l] = n(), a = o.slice(r, l + 1), u = v(a, t);
      a.every((p, m) => p === u[m]) || (o.splice(r, l - r + 1, ...u), i(h(o)), s(r === l ? { to: "relative", delta: t === "indent" ? 1 : -1 } : { to: "lines", start: r, end: l }));
    });
  }
}
export {
  D as AutocompletePlugin,
  O as FlipLinesPlugin,
  I as FullLineEditsPlugin,
  K as ListsPlugin,
  M as TabsPlugin,
  E as defaultContinueListRules
};
