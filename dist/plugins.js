var ce = Object.defineProperty;
var X = (r) => {
  throw TypeError(r);
};
var he = (r, e, t) => e in r ? ce(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var z = (r, e, t) => he(r, typeof e != "symbol" ? e + "" : e, t), G = (r, e, t) => e.has(r) || X("Cannot " + t);
var i = (r, e, t) => (G(r, e, "read from private field"), t ? t.call(r) : e.get(r)), h = (r, e, t) => e.has(r) ? X("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), m = (r, e, t, o) => (G(r, e, "write to private field"), o ? o.call(r, t) : e.set(r, t), t), d = (r, e, t) => (G(r, e, "access private method"), t);
import { r as ue, a as fe, s as O, f as pe, j as N, d as Y, b as me, c as ye, h as ge, i as Le, m as we, k as be } from "./text-DdwPLt1P.js";
var b, g, L, M, u, Z, _, y, ee, J, B, te, ie, H, se;
class Ae {
  constructor(e) {
    h(this, u);
    h(this, b);
    h(this, g);
    h(this, L);
    h(this, M);
    // Autocomplete lifecycle -------------------------------
    h(this, y, null);
    m(this, L, d(this, u, te).call(this)), m(this, M, e);
  }
  connected(e) {
    m(this, b, new AbortController()), m(this, g, e.t2), i(this, g).appendChild(i(this, L)), i(this, g).addEventListener("keyup", d(this, u, _).bind(this), {
      signal: i(this, b).signal
    }), i(this, g).addEventListener("keydown", d(this, u, Z).bind(this), {
      signal: i(this, b).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, b)) == null || e.abort();
  }
}
b = new WeakMap(), g = new WeakMap(), L = new WeakMap(), M = new WeakMap(), u = new WeakSet(), // Keybindings ------------------------------------------
Z = function(e) {
  if (i(this, y)) {
    if (e.key === "ArrowDown") {
      const t = i(this, y).focusedIndex + 1, o = i(this, y).filteredCommands.length;
      i(this, y).focusedIndex = Math.min(o - 1, t), e.preventDefault();
    } else if (e.key === "ArrowUp") {
      const t = i(this, y).focusedIndex - 1;
      i(this, y).focusedIndex = Math.max(t, 0), e.preventDefault();
    } else if (e.key === "Enter") {
      const t = i(this, y).focusedCommand;
      if (!t) return;
      d(this, u, J).call(this, t), e.preventDefault();
    }
  }
}, _ = function(e) {
  var o, s;
  const t = [
    "Alt",
    "ArrowDown",
    "ArrowUp",
    "Backspace",
    "Control",
    "Meta",
    "Shift"
  ];
  if (!i(this, y))
    (o = i(this, g)) == null || o.act(({ selectionStart: n, selectionEnd: a, value: c }) => {
      const l = n();
      if (l !== a()) return;
      const f = c().slice(l - 1, l), p = i(this, M).find((w) => w.trigger === f);
      p && d(this, u, ee).call(this, p);
    });
  else if (!t.includes(e.key) && !e.key.match(/^\w$/))
    d(this, u, B).call(this);
  else if (i(this, y).mode) {
    const n = i(this, y).start, a = new RegExp(`^\\${i(this, y).mode.trigger}(\\w*)`);
    (s = i(this, g)) == null || s.act(({ value: c }) => {
      const f = c().substring(n).match(a);
      f ? i(this, y).query = f[1] : d(this, u, B).call(this);
    });
  }
}, y = new WeakMap(), ee = async function(e) {
  var o;
  const t = new xe();
  t.onRender = (s) => d(this, u, se).call(this, s), t.mode = e, (o = i(this, g)) == null || o.act(({ selectionStart: s }) => {
    t.start = s() - 1;
  }), d(this, u, ie).call(this).then(({ x: s, y: n }) => {
    t.menuPosition = [s, n];
  }), m(this, y, t);
}, J = function(e) {
  var o;
  let t;
  typeof e.value == "function" ? t = e.value() : typeof e.value == "string" && (t = e.value), t ?? (t = ""), (o = i(this, g)) == null || o.act(({ value: s, selectionEnd: n, select: a }) => {
    if (!i(this, y)) return;
    const c = ue(
      s(),
      i(this, y).start,
      n() + 1,
      t
    );
    s(c);
    const l = i(this, y).start + t.length;
    a({ to: "absolute", start: l });
  }), d(this, u, B).call(this);
}, B = function() {
  m(this, y, null), d(this, u, H).call(this, !1);
}, // Rendering --------------------------------------------
te = function() {
  const e = document.createElement("menu");
  return e.setAttribute("role", "menu"), e.popover = "manual", e.classList.add("t2-autocomplete"), e;
}, ie = async function() {
  return new Promise((e) => {
    var t;
    (t = i(this, g)) == null || t.act(({ value: o, selectionStart: s }) => {
      var p;
      const n = fe(o(), s() - 1), a = document.createElement("div");
      a.classList.add("t2-autocomplete-position-helper");
      const c = document.createElement("span");
      c.textContent = n[0], a.appendChild(c);
      const l = document.createElement("span");
      a.appendChild(l);
      const f = document.createElement("span");
      f.textContent = n[1], a.appendChild(f), (p = i(this, g)) == null || p.appendChild(a), requestAnimationFrame(() => {
        var U;
        const w = l.getBoundingClientRect();
        (U = i(this, g)) == null || U.removeChild(a), e({ x: `${w.left}px`, y: `${w.bottom}px` });
      });
    });
  });
}, H = function(e) {
  try {
    e ? i(this, L).showPopover() : i(this, L).hidePopover();
  } catch {
  } finally {
    e ? i(this, L).dataset.popoverOpen = "true" : delete i(this, L).dataset.popoverOpen;
  }
}, se = function(e) {
  if (i(this, L).style.setProperty("--t2-autocomplete-x", e.menuPosition[0]), i(this, L).style.setProperty("--t2-autocomplete-y", e.menuPosition[1]), i(this, L).innerHTML = "", !e.filteredCommands.length) {
    i(this, L).innerHTML = "", d(this, u, H).call(this, !1);
    return;
  }
  e.filteredCommands.map((t, o) => {
    const s = document.createElement("li"), n = document.createElement("button");
    return e.focusedIndex === o && (n.dataset.active = "true"), n.addEventListener("click", () => {
      d(this, u, J).call(this, t);
    }), typeof t.icon == "string" ? n.textContent = `${t.icon} ${t.name}` : t.icon instanceof Element ? (n.appendChild(t.icon), n.append(t.name)) : n.textContent = t.name, s.appendChild(n), s;
  }).forEach((t) => i(this, L).appendChild(t)), d(this, u, H).call(this, !0);
};
var R, T, q, $, x, K;
class xe {
  constructor() {
    h(this, x);
    h(this, R, 0);
    h(this, T, ["0px", "0px"]);
    h(this, q);
    h(this, $, "");
    z(this, "start", 0);
    z(this, "onRender", () => {
    });
  }
  get filteredCommands() {
    if (!this.mode) return [];
    const e = Array.isArray(this.mode.commands) ? this.mode.commands : this.mode.commands();
    if (!(e != null && e.length)) return [];
    let t;
    if (!this.query)
      t = e.filter((o) => o.initial);
    else {
      const o = this.query.toLowerCase();
      t = e.filter((s) => s.name.toLowerCase().includes(o));
    }
    return t;
  }
  get focusedCommand() {
    return this.filteredCommands[this.focusedIndex];
  }
  get focusedIndex() {
    return i(this, R);
  }
  set focusedIndex(e) {
    m(this, R, e), d(this, x, K).call(this);
  }
  get menuPosition() {
    return i(this, T);
  }
  set menuPosition(e) {
    m(this, T, e), d(this, x, K).call(this);
  }
  get mode() {
    return i(this, q);
  }
  set mode(e) {
    m(this, q, e), d(this, x, K).call(this);
  }
  get query() {
    return i(this, $);
  }
  set query(e) {
    m(this, $, e), d(this, x, K).call(this);
  }
}
R = new WeakMap(), T = new WeakMap(), q = new WeakMap(), $ = new WeakMap(), x = new WeakSet(), K = function() {
  this.onRender(this);
};
var A, S, v, ne, W;
class Ee {
  constructor() {
    h(this, v);
    h(this, A);
    h(this, S);
  }
  connected(e) {
    m(this, A, new AbortController()), m(this, S, e.t2), e.textarea.addEventListener("keydown", d(this, v, ne).bind(this), {
      signal: i(this, A).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, A)) == null || e.abort();
  }
}
A = new WeakMap(), S = new WeakMap(), v = new WeakSet(), ne = function(e) {
  let t = !0;
  e.altKey && e.key === "ArrowDown" ? d(this, v, W).call(this, "down") : e.altKey && e.key === "ArrowUp" ? d(this, v, W).call(this, "up") : t = !1, t && e.preventDefault();
}, W = function(e) {
  var t;
  (t = i(this, S)) == null || t.act(({ selectedLines: o, select: s, value: n }) => {
    const a = O(n()), [c, l] = o(), f = e === "up" ? c - 1 : c + 1;
    if (c !== l || f < 0 || f >= a.length) return;
    const p = pe(a[c], a[f]);
    a[c] = p[0], a[f] = p[1], n(N(a)), s({ to: "endOfLine", endOf: f });
  });
};
var E, j, Q, oe;
class Pe {
  constructor() {
    h(this, Q);
    h(this, E);
    h(this, j);
  }
  connected(e) {
    m(this, E, new AbortController()), m(this, j, e.t2), e.textarea.addEventListener("keydown", d(this, Q, oe).bind(this), {
      signal: i(this, E).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, E)) == null || e.abort();
  }
}
E = new WeakMap(), j = new WeakMap(), Q = new WeakSet(), oe = function(e) {
  var o;
  let t = !0;
  (o = i(this, j)) == null || o.act(async (s) => {
    if (s.selectionStart() !== s.selectionEnd()) {
      t = !1;
      return;
    }
    const [n] = s.selectedLines();
    e.key === "x" && e.metaKey ? (await navigator.clipboard.writeText(O(s.value())[n]), s.value(Y(s.value(), n)), s.select({ to: "endOfLine", endOf: Math.max(n - 1, 0) })) : e.key === "c" && e.metaKey ? navigator.clipboard.writeText(O(s.value())[n]) : e.key === "k" && e.shiftKey && e.metaKey ? (s.value(Y(s.value(), n)), s.select({ to: "endOfLine", endOf: n })) : e.key === "d" && e.shiftKey && e.metaKey ? (s.value(me(s.value(), n)), s.select({ to: "endOfLine", endOf: n + 1 })) : t = !1;
  }), t && e.preventDefault();
};
const ke = ye;
var k, P, C, I, re, ae;
class De {
  constructor(e = Object.values(ke)) {
    h(this, I);
    h(this, k);
    h(this, P);
    h(this, C);
    m(this, C, e);
  }
  connected(e) {
    m(this, k, new AbortController()), m(this, P, e.t2), e.textarea.addEventListener("keydown", d(this, I, re).bind(this), {
      signal: i(this, k).signal
    }), e.textarea.addEventListener("paste", d(this, I, ae).bind(this), {
      signal: i(this, k).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, k)) == null || e.abort();
  }
}
k = new WeakMap(), P = new WeakMap(), C = new WeakMap(), I = new WeakSet(), re = function(e) {
  var t;
  !i(this, C).length || e.key !== "Enter" || (e.preventDefault(), (t = i(this, P)) == null || t.act(({ value: o, selectionStart: s, selectedLines: n, select: a }) => {
    const c = O(o()), [l] = n(), f = ge(o(), s()), p = Le(c[l], i(this, C), f);
    c.splice(l, 1, p.currentLine), p.nextLine !== null && c.splice(l + 1, 0, p.nextLine), o(N(c)), p.didContinue ? a({ to: "relative", delta: p.marker.length + 1 }) : p.didEnd ? a({ to: "startOfLine", startOf: l }) : a({ to: "relative", delta: 1 });
  }));
}, ae = function(e) {
  var o, s;
  const t = (o = e.clipboardData) == null ? void 0 : o.getData("text/plain");
  t && ((s = i(this, P)) == null || s.act(({ value: n, selectedLines: a, select: c }) => {
    const l = O(n()), [f, p] = a();
    if (f !== p) return;
    const w = we(l[f], t, i(this, C));
    w !== null && (e.preventDefault(), l[f] = w.currentLine, n(N(l)), c({
      to: "relative",
      delta: w.currentLine.length - w.marker.length,
      collapse: !0
    }));
  }));
};
var D, F, V, le;
class Oe {
  constructor() {
    h(this, V);
    h(this, D);
    h(this, F);
  }
  connected(e) {
    m(this, D, new AbortController()), m(this, F, e.t2), e.textarea.addEventListener("keydown", d(this, V, le).bind(this), {
      signal: i(this, D).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, D)) == null || e.abort();
  }
}
D = new WeakMap(), F = new WeakMap(), V = new WeakSet(), le = function(e) {
  var o;
  if (e.key !== "Tab") return;
  e.preventDefault();
  const t = e.shiftKey ? "outdent" : "indent";
  (o = i(this, F)) == null || o.act(({ select: s, selectedLines: n, value: a }) => {
    const c = O(a()), [l, f] = n(), p = c.slice(l, f + 1), w = be(p, t);
    p.every((U, de) => U === w[de]) || (c.splice(l, f - l + 1, ...w), a(N(c)), s(l === f ? { to: "relative", delta: t === "indent" ? 1 : -1 } : { to: "lines", start: l, end: f }));
  });
};
export {
  Ae as AutocompletePlugin,
  Ee as FlipLinesPlugin,
  Pe as FullLineEditsPlugin,
  De as ListsPlugin,
  Oe as TabsPlugin,
  ke as defaultContinueListRules
};
