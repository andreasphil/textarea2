var ce = Object.defineProperty;
var X = (r) => {
  throw TypeError(r);
};
var he = (r, e, t) => e in r ? ce(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var z = (r, e, t) => he(r, typeof e != "symbol" ? e + "" : e, t), G = (r, e, t) => e.has(r) || X("Cannot " + t);
var i = (r, e, t) => (G(r, e, "read from private field"), t ? t.call(r) : e.get(r)), h = (r, e, t) => e.has(r) ? X("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), m = (r, e, t, o) => (G(r, e, "write to private field"), o ? o.call(r, t) : e.set(r, t), t), l = (r, e, t) => (G(r, e, "access private method"), t);
import { r as ue, a as fe, s as I, f as pe, j as N, d as Y, b as me, c as ye, h as ge, i as we, m as Le, k as be } from "./text-DdwPLt1P.js";
var b, g, w, R, u, Z, _, y, ee, J, B, te, ie, H, se;
class Ae {
  constructor(e) {
    h(this, u);
    h(this, b);
    h(this, g);
    h(this, w);
    h(this, R);
    // Autocomplete lifecycle -------------------------------
    h(this, y, null);
    m(this, w, l(this, u, te).call(this)), m(this, R, e);
  }
  connected(e) {
    m(this, b, new AbortController()), m(this, g, e.t2), i(this, g).appendChild(i(this, w)), i(this, g).addEventListener("keyup", l(this, u, _).bind(this), {
      signal: i(this, b).signal
    }), i(this, g).addEventListener("keydown", l(this, u, Z).bind(this), {
      signal: i(this, b).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, b)) == null || e.abort();
  }
}
b = new WeakMap(), g = new WeakMap(), w = new WeakMap(), R = new WeakMap(), u = new WeakSet(), // Keybindings ------------------------------------------
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
      l(this, u, J).call(this, t), e.preventDefault();
    }
  }
}, _ = function(e) {
  var o, s, n;
  const t = [
    "Alt",
    "ArrowDown",
    "ArrowUp",
    "Backspace",
    "Control",
    "Meta",
    "Shift"
  ];
  if (!i(this, y) && !["ArrowUp", "ArrowDown"].includes(e.key))
    (o = i(this, g)) == null || o.act(({ selectionStart: a, selectionEnd: d, value: c }) => {
      const f = a();
      if (f !== d()) return;
      const p = c().slice(f - 1, f), L = i(this, R).find((A) => A.trigger === p);
      L && l(this, u, ee).call(this, L);
    });
  else if (!t.includes(e.key) && !e.key.match(/^\w$/))
    l(this, u, B).call(this);
  else if ((s = i(this, y)) != null && s.mode) {
    const a = i(this, y).start, d = new RegExp(`^\\${i(this, y).mode.trigger}(\\w*)`);
    (n = i(this, g)) == null || n.act(({ value: c }) => {
      const p = c().substring(a).match(d);
      p ? i(this, y).query = p[1] : l(this, u, B).call(this);
    });
  }
}, y = new WeakMap(), ee = async function(e) {
  var o;
  const t = new xe();
  t.onRender = (s) => l(this, u, se).call(this, s), t.mode = e, (o = i(this, g)) == null || o.act(({ selectionStart: s }) => {
    t.start = s() - 1;
  }), l(this, u, ie).call(this).then(({ x: s, y: n }) => {
    t.menuPosition = [s, n];
  }), m(this, y, t);
}, J = function(e) {
  var o;
  let t;
  typeof e.value == "function" ? t = e.value() : typeof e.value == "string" && (t = e.value), t ?? (t = ""), (o = i(this, g)) == null || o.act(({ value: s, selectionEnd: n, select: a }) => {
    if (!i(this, y)) return;
    const d = ue(
      s(),
      i(this, y).start,
      n() + 1,
      t
    );
    s(d);
    const c = i(this, y).start + t.length;
    a({ to: "absolute", start: c });
  }), l(this, u, B).call(this);
}, B = function() {
  m(this, y, null), l(this, u, H).call(this, !1);
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
      const d = document.createElement("span");
      d.textContent = n[0], a.appendChild(d);
      const c = document.createElement("span");
      a.appendChild(c);
      const f = document.createElement("span");
      f.textContent = n[1], a.appendChild(f), (p = i(this, g)) == null || p.appendChild(a), requestAnimationFrame(() => {
        var A;
        const L = c.getBoundingClientRect();
        (A = i(this, g)) == null || A.removeChild(a), e({ x: `${L.left}px`, y: `${L.bottom}px` });
      });
    });
  });
}, H = function(e) {
  try {
    e ? i(this, w).showPopover() : i(this, w).hidePopover();
  } catch {
  } finally {
    e ? i(this, w).dataset.popoverOpen = "true" : delete i(this, w).dataset.popoverOpen;
  }
}, se = function(e) {
  if (i(this, w).style.setProperty("--t2-autocomplete-x", e.menuPosition[0]), i(this, w).style.setProperty("--t2-autocomplete-y", e.menuPosition[1]), i(this, w).innerHTML = "", !e.filteredCommands.length) {
    i(this, w).innerHTML = "", l(this, u, H).call(this, !1);
    return;
  }
  e.filteredCommands.map((t, o) => {
    const s = document.createElement("li"), n = document.createElement("button");
    return e.focusedIndex === o && (n.dataset.active = "true"), n.addEventListener("click", () => {
      l(this, u, J).call(this, t);
    }), typeof t.icon == "string" ? n.textContent = `${t.icon} ${t.name}` : t.icon instanceof Element ? (n.appendChild(t.icon), n.append(t.name)) : n.textContent = t.name, s.appendChild(n), s;
  }).forEach((t) => i(this, w).appendChild(t)), l(this, u, H).call(this, !0);
};
var T, q, $, S, x, M;
class xe {
  constructor() {
    h(this, x);
    h(this, T, 0);
    h(this, q, ["0px", "0px"]);
    h(this, $);
    h(this, S, "");
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
    return i(this, T);
  }
  set focusedIndex(e) {
    m(this, T, e), l(this, x, M).call(this);
  }
  get menuPosition() {
    return i(this, q);
  }
  set menuPosition(e) {
    m(this, q, e), l(this, x, M).call(this);
  }
  get mode() {
    return i(this, $);
  }
  set mode(e) {
    m(this, $, e), l(this, x, M).call(this);
  }
  get query() {
    return i(this, S);
  }
  set query(e) {
    m(this, S, e), l(this, x, M).call(this);
  }
}
T = new WeakMap(), q = new WeakMap(), $ = new WeakMap(), S = new WeakMap(), x = new WeakSet(), M = function() {
  this.onRender(this);
};
var E, U, v, ne, W;
class Ee {
  constructor() {
    h(this, v);
    h(this, E);
    h(this, U);
  }
  connected(e) {
    m(this, E, new AbortController()), m(this, U, e.t2), e.textarea.addEventListener("keydown", l(this, v, ne).bind(this), {
      signal: i(this, E).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, E)) == null || e.abort();
  }
}
E = new WeakMap(), U = new WeakMap(), v = new WeakSet(), ne = function(e) {
  let t = !0;
  e.altKey && e.key === "ArrowDown" ? l(this, v, W).call(this, "down") : e.altKey && e.key === "ArrowUp" ? l(this, v, W).call(this, "up") : t = !1, t && e.preventDefault();
}, W = function(e) {
  var t;
  (t = i(this, U)) == null || t.act(({ selectedLines: o, select: s, value: n }) => {
    const a = I(n()), [d, c] = o(), f = e === "up" ? d - 1 : d + 1;
    if (d !== c || f < 0 || f >= a.length) return;
    const p = pe(a[d], a[f]);
    a[d] = p[0], a[f] = p[1], n(N(a)), s({ to: "endOfLine", endOf: f });
  });
};
var P, j, Q, oe;
class Pe {
  constructor() {
    h(this, Q);
    h(this, P);
    h(this, j);
  }
  connected(e) {
    m(this, P, new AbortController()), m(this, j, e.t2), e.textarea.addEventListener("keydown", l(this, Q, oe).bind(this), {
      signal: i(this, P).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, P)) == null || e.abort();
  }
}
P = new WeakMap(), j = new WeakMap(), Q = new WeakSet(), oe = function(e) {
  var o;
  let t = !0;
  (o = i(this, j)) == null || o.act(async (s) => {
    if (s.selectionStart() !== s.selectionEnd()) {
      t = !1;
      return;
    }
    const [n] = s.selectedLines();
    e.key === "x" && e.metaKey ? (await navigator.clipboard.writeText(I(s.value())[n]), s.value(Y(s.value(), n)), s.select({ to: "endOfLine", endOf: Math.max(n - 1, 0) })) : e.key === "c" && e.metaKey ? navigator.clipboard.writeText(I(s.value())[n]) : e.key === "k" && e.shiftKey && e.metaKey ? (s.value(Y(s.value(), n)), s.select({ to: "endOfLine", endOf: n })) : e.key === "d" && e.shiftKey && e.metaKey ? (s.value(me(s.value(), n)), s.select({ to: "endOfLine", endOf: n + 1 })) : t = !1;
  }), t && e.preventDefault();
};
const ke = ye;
var k, D, C, K, re, ae;
class De {
  constructor(e = Object.values(ke)) {
    h(this, K);
    h(this, k);
    h(this, D);
    h(this, C);
    m(this, C, e);
  }
  connected(e) {
    m(this, k, new AbortController()), m(this, D, e.t2), e.textarea.addEventListener("keydown", l(this, K, re).bind(this), {
      signal: i(this, k).signal
    }), e.textarea.addEventListener("paste", l(this, K, ae).bind(this), {
      signal: i(this, k).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, k)) == null || e.abort();
  }
}
k = new WeakMap(), D = new WeakMap(), C = new WeakMap(), K = new WeakSet(), re = function(e) {
  var t;
  !i(this, C).length || e.key !== "Enter" || (e.preventDefault(), (t = i(this, D)) == null || t.act(({ value: o, selectionStart: s, selectedLines: n, select: a }) => {
    const d = I(o()), [c] = n(), f = ge(o(), s()), p = we(d[c], i(this, C), f);
    d.splice(c, 1, p.currentLine), p.nextLine !== null && d.splice(c + 1, 0, p.nextLine), o(N(d)), p.didContinue ? a({ to: "relative", delta: p.marker.length + 1 }) : p.didEnd ? a({ to: "startOfLine", startOf: c }) : a({ to: "relative", delta: 1 });
  }));
}, ae = function(e) {
  var o, s;
  const t = (o = e.clipboardData) == null ? void 0 : o.getData("text/plain");
  t && ((s = i(this, D)) == null || s.act(({ value: n, selectedLines: a, select: d }) => {
    const c = I(n()), [f, p] = a();
    if (f !== p) return;
    const L = Le(c[f], t, i(this, C));
    L !== null && (e.preventDefault(), c[f] = L.currentLine, n(N(c)), d({
      to: "relative",
      delta: L.currentLine.length - L.marker.length,
      collapse: !0
    }));
  }));
};
var O, F, V, le;
class Oe {
  constructor() {
    h(this, V);
    h(this, O);
    h(this, F);
  }
  connected(e) {
    m(this, O, new AbortController()), m(this, F, e.t2), e.textarea.addEventListener("keydown", l(this, V, le).bind(this), {
      signal: i(this, O).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, O)) == null || e.abort();
  }
}
O = new WeakMap(), F = new WeakMap(), V = new WeakSet(), le = function(e) {
  var o;
  if (e.key !== "Tab") return;
  e.preventDefault();
  const t = e.shiftKey ? "outdent" : "indent";
  (o = i(this, F)) == null || o.act(({ select: s, selectedLines: n, value: a }) => {
    const d = I(a()), [c, f] = n(), p = d.slice(c, f + 1), L = be(p, t);
    p.every((A, de) => A === L[de]) || (d.splice(c, f - c + 1, ...L), a(N(d)), s(c === f ? { to: "relative", delta: t === "indent" ? 1 : -1 } : { to: "lines", start: c, end: f }));
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
