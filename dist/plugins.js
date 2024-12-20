var ce = Object.defineProperty;
var X = (r) => {
  throw TypeError(r);
};
var he = (r, e, t) => e in r ? ce(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var z = (r, e, t) => he(r, typeof e != "symbol" ? e + "" : e, t), G = (r, e, t) => e.has(r) || X("Cannot " + t);
var i = (r, e, t) => (G(r, e, "read from private field"), t ? t.call(r) : e.get(r)), d = (r, e, t) => e.has(r) ? X("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), f = (r, e, t, o) => (G(r, e, "write to private field"), o ? o.call(r, t) : e.set(r, t), t), l = (r, e, t) => (G(r, e, "access private method"), t);
import { r as ue, a as fe, s as O, f as pe, j as N, d as Y, b as me, c as ye, h as ge, i as Le, m as we, k as be } from "./text-DdwPLt1P.js";
var b, L, g, M, c, Z, _, p, ee, J, B, te, ie, H, se;
class Ae {
  constructor(e) {
    d(this, c);
    d(this, b);
    d(this, L);
    d(this, g);
    d(this, M);
    // Autocomplete lifecycle -------------------------------
    d(this, p, null);
    f(this, g, l(this, c, te).call(this)), f(this, M, e);
  }
  connected(e) {
    f(this, b, new AbortController()), f(this, L, e.t2), i(this, L).appendChild(i(this, g)), i(this, L).addEventListener("keyup", l(this, c, _).bind(this), {
      signal: i(this, b).signal
    }), i(this, L).addEventListener("keydown", l(this, c, Z).bind(this), {
      signal: i(this, b).signal
    });
  }
  disconnected() {
    var e;
    (e = i(this, b)) == null || e.abort();
  }
}
b = new WeakMap(), L = new WeakMap(), g = new WeakMap(), M = new WeakMap(), c = new WeakSet(), // Keybindings ------------------------------------------
Z = function(e) {
  if (i(this, p)) {
    if (e.key === "ArrowDown") {
      const t = i(this, p).focusedIndex + 1, o = i(this, p).filteredCommands.length;
      i(this, p).focusedIndex = Math.min(o - 1, t), e.preventDefault();
    } else if (e.key === "ArrowUp") {
      const t = i(this, p).focusedIndex - 1;
      i(this, p).focusedIndex = Math.max(t, 0), e.preventDefault();
    } else if (e.key === "Enter") {
      const t = i(this, p).focusedCommand;
      if (!t) return;
      l(this, c, J).call(this, t), e.preventDefault();
    }
  }
}, _ = function(e) {
  var o;
  const t = [
    "Alt",
    "ArrowDown",
    "ArrowUp",
    "Backspace",
    "Control",
    "Meta",
    "Shift"
  ];
  if (i(this, p)) {
    if (!t.includes(e.key) && !e.key.match(/^\w$/))
      l(this, c, B).call(this);
    else if (i(this, p).mode) {
      const s = i(this, p).start, n = new RegExp(`^\\${i(this, p).mode.trigger}(\\w*)`);
      (o = i(this, L)) == null || o.act(({ value: a }) => {
        const h = a().substring(s).match(n);
        h ? i(this, p).query = h[1] : l(this, c, B).call(this);
      });
    }
  } else {
    const s = i(this, M).find((n) => n.trigger === e.key);
    s && l(this, c, ee).call(this, s);
  }
}, p = new WeakMap(), ee = async function(e) {
  var o;
  const t = new xe();
  t.onRender = (s) => l(this, c, se).call(this, s), t.mode = e, (o = i(this, L)) == null || o.act(({ selectionStart: s }) => {
    t.start = s() - 1;
  }), l(this, c, ie).call(this).then(({ x: s, y: n }) => {
    t.menuPosition = [s, n];
  }), f(this, p, t);
}, J = function(e) {
  var o;
  let t;
  typeof e.value == "function" ? t = e.value() : typeof e.value == "string" && (t = e.value), t ?? (t = ""), (o = i(this, L)) == null || o.act(({ value: s, selectionEnd: n, select: a }) => {
    if (!i(this, p)) return;
    const u = ue(
      s(),
      i(this, p).start,
      n() + 1,
      t
    );
    s(u);
    const h = i(this, p).start + t.length;
    a({ to: "absolute", start: h });
  }), l(this, c, B).call(this);
}, B = function() {
  f(this, p, null), l(this, c, H).call(this, !1);
}, // Rendering --------------------------------------------
te = function() {
  const e = document.createElement("menu");
  return e.setAttribute("role", "menu"), e.popover = "manual", e.classList.add("t2-autocomplete"), e;
}, ie = async function() {
  return new Promise((e) => {
    var t;
    (t = i(this, L)) == null || t.act(({ value: o, selectionStart: s }) => {
      var y;
      const n = fe(o(), s() - 1), a = document.createElement("div");
      a.classList.add("t2-autocomplete-position-helper");
      const u = document.createElement("span");
      u.textContent = n[0], a.appendChild(u);
      const h = document.createElement("span");
      a.appendChild(h);
      const m = document.createElement("span");
      m.textContent = n[1], a.appendChild(m), (y = i(this, L)) == null || y.appendChild(a), requestAnimationFrame(() => {
        var U;
        const w = h.getBoundingClientRect();
        (U = i(this, L)) == null || U.removeChild(a), e({ x: `${w.left}px`, y: `${w.bottom}px` });
      });
    });
  });
}, H = function(e) {
  try {
    e ? i(this, g).showPopover() : i(this, g).hidePopover();
  } catch {
  } finally {
    e ? i(this, g).dataset.popoverOpen = "true" : delete i(this, g).dataset.popoverOpen;
  }
}, se = function(e) {
  if (i(this, g).style.setProperty("--t2-autocomplete-x", e.menuPosition[0]), i(this, g).style.setProperty("--t2-autocomplete-y", e.menuPosition[1]), i(this, g).innerHTML = "", !e.filteredCommands.length) {
    i(this, g).innerHTML = "", l(this, c, H).call(this, !1);
    return;
  }
  e.filteredCommands.map((t, o) => {
    const s = document.createElement("li"), n = document.createElement("button");
    return e.focusedIndex === o && (n.dataset.active = "true"), n.addEventListener("click", () => {
      l(this, c, J).call(this, t);
    }), typeof t.icon == "string" ? n.textContent = `${t.icon} ${t.name}` : t.icon instanceof Element ? (n.appendChild(t.icon), n.append(t.name)) : n.textContent = t.name, s.appendChild(n), s;
  }).forEach((t) => i(this, g).appendChild(t)), l(this, c, H).call(this, !0);
};
var R, T, q, $, x, K;
class xe {
  constructor() {
    d(this, x);
    d(this, R, 0);
    d(this, T, ["0px", "0px"]);
    d(this, q);
    d(this, $, "");
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
    f(this, R, e), l(this, x, K).call(this);
  }
  get menuPosition() {
    return i(this, T);
  }
  set menuPosition(e) {
    f(this, T, e), l(this, x, K).call(this);
  }
  get mode() {
    return i(this, q);
  }
  set mode(e) {
    f(this, q, e), l(this, x, K).call(this);
  }
  get query() {
    return i(this, $);
  }
  set query(e) {
    f(this, $, e), l(this, x, K).call(this);
  }
}
R = new WeakMap(), T = new WeakMap(), q = new WeakMap(), $ = new WeakMap(), x = new WeakSet(), K = function() {
  this.onRender(this);
};
var A, S, v, ne, W;
class Ee {
  constructor() {
    d(this, v);
    d(this, A);
    d(this, S);
  }
  connected(e) {
    f(this, A, new AbortController()), f(this, S, e.t2), e.textarea.addEventListener("keydown", l(this, v, ne).bind(this), {
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
  e.altKey && e.key === "ArrowDown" ? l(this, v, W).call(this, "down") : e.altKey && e.key === "ArrowUp" ? l(this, v, W).call(this, "up") : t = !1, t && e.preventDefault();
}, W = function(e) {
  var t;
  (t = i(this, S)) == null || t.act(({ selectedLines: o, select: s, value: n }) => {
    const a = O(n()), [u, h] = o(), m = e === "up" ? u - 1 : u + 1;
    if (u !== h || m < 0 || m >= a.length) return;
    const y = pe(a[u], a[m]);
    a[u] = y[0], a[m] = y[1], n(N(a)), s({ to: "endOfLine", endOf: m });
  });
};
var E, j, Q, oe;
class Pe {
  constructor() {
    d(this, Q);
    d(this, E);
    d(this, j);
  }
  connected(e) {
    f(this, E, new AbortController()), f(this, j, e.t2), e.textarea.addEventListener("keydown", l(this, Q, oe).bind(this), {
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
    d(this, I);
    d(this, k);
    d(this, P);
    d(this, C);
    f(this, C, e);
  }
  connected(e) {
    f(this, k, new AbortController()), f(this, P, e.t2), e.textarea.addEventListener("keydown", l(this, I, re).bind(this), {
      signal: i(this, k).signal
    }), e.textarea.addEventListener("paste", l(this, I, ae).bind(this), {
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
    const u = O(o()), [h] = n(), m = ge(o(), s()), y = Le(u[h], i(this, C), m);
    u.splice(h, 1, y.currentLine), y.nextLine !== null && u.splice(h + 1, 0, y.nextLine), o(N(u)), y.didContinue ? a({ to: "relative", delta: y.marker.length + 1 }) : y.didEnd ? a({ to: "startOfLine", startOf: h }) : a({ to: "relative", delta: 1 });
  }));
}, ae = function(e) {
  var o, s;
  const t = (o = e.clipboardData) == null ? void 0 : o.getData("text/plain");
  t && ((s = i(this, P)) == null || s.act(({ value: n, selectedLines: a, select: u }) => {
    const h = O(n()), [m, y] = a();
    if (m !== y) return;
    const w = we(h[m], t, i(this, C));
    w !== null && (e.preventDefault(), h[m] = w.currentLine, n(N(h)), u({
      to: "relative",
      delta: w.currentLine.length - w.marker.length,
      collapse: !0
    }));
  }));
};
var D, F, V, le;
class Oe {
  constructor() {
    d(this, V);
    d(this, D);
    d(this, F);
  }
  connected(e) {
    f(this, D, new AbortController()), f(this, F, e.t2), e.textarea.addEventListener("keydown", l(this, V, le).bind(this), {
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
    const u = O(a()), [h, m] = n(), y = u.slice(h, m + 1), w = be(y, t);
    y.every((U, de) => U === w[de]) || (u.splice(h, m - h + 1, ...w), a(N(u)), s(h === m ? { to: "relative", delta: t === "indent" ? 1 : -1 } : { to: "lines", start: h, end: m }));
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
