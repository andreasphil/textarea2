var M = (h) => {
  throw TypeError(h);
};
var y = (h, r, t) => r.has(h) || M("Cannot " + t);
var i = (h, r, t) => (y(h, r, "read from private field"), t ? t.call(h) : r.get(h)), b = (h, r, t) => r.has(h) ? M("Cannot add the same private member more than once") : r instanceof WeakSet ? r.add(h) : r.set(h, t), u = (h, r, t, s) => (y(h, r, "write to private field"), s ? s.call(h, t) : r.set(h, t), t), l = (h, r, t) => (y(h, r, "access private method"), t);
import { s as F, e as O, a as P, g as D } from "./text-DdwPLt1P.js";
function I() {
  return ({ value: h, out: r }) => {
    const t = F(h), s = Array.from(r.children);
    for (t.forEach((n, c) => {
      let d;
      c < s.length ? d = s[c] : (d = document.createElement("div"), r.appendChild(d)), d.textContent = n;
    }); r.children.length > t.length && r.lastChild; )
      r.removeChild(r.lastChild);
  };
}
var a, f, E, m, S, e, C, R, p, A, L, w, H, g, v, T, V, o, k, j, q;
class G extends HTMLElement {
  // Lifecycle --------------------------------------------
  constructor() {
    super();
    b(this, e);
    // Internal state ---------------------------------------
    b(this, a, null);
    b(this, f, null);
    b(this, E, /* @__PURE__ */ new Set());
    b(this, m, "");
    // Presentation -----------------------------------------
    b(this, S, I());
  }
  // Static properties + configuration --------------------
  static define(t = "textarea-2") {
    customElements.define(t, this);
  }
  static get observedAttributes() {
    return [];
  }
  connectedCallback() {
    const t = this.querySelector("textarea");
    if (!t) throw new Error("Could not find a textarea to use");
    l(this, e, j).call(this, t), u(this, m, t.value), u(this, a, t);
    const s = l(this, e, q).call(this);
    u(this, f, s), this.addEventListener("click", () => l(this, e, A).call(this)), l(this, e, C).call(this, !0), i(this, E).forEach((n) => l(this, e, R).call(this, n));
  }
  disconnectedCallback() {
    i(this, E).forEach((t) => l(this, e, p).call(this, t));
  }
  attributeChangedCallback() {
  }
  setRender(t) {
    u(this, S, t()), l(this, e, C).call(this, !0);
  }
  // Plugins ----------------------------------------------
  use(...t) {
    return t.forEach((s) => {
      var n;
      i(this, E).add(s), (n = s.setup) == null || n.call(s), this.isConnected && l(this, e, R).call(this, s);
    }), { use: this.use.bind(this) };
  }
  // Public interface -------------------------------------
  async act(t) {
    var d;
    let s = !1;
    const n = (x) => (typeof x == "string" && (u(this, e, x, k), s = !0), i(this, e, o)), c = {
      focus: l(this, e, A).bind(this),
      insertAt: l(this, e, w).bind(this),
      select: l(this, e, L).bind(this),
      selectedLines: () => i(this, e, V),
      selectionEnd: () => i(this, e, v),
      selectionStart: () => i(this, e, g),
      type: l(this, e, H).bind(this),
      value: n
    };
    await t(c), s && ((d = i(this, a)) == null || d.dispatchEvent(new Event("change", { bubbles: !0 })));
  }
}
a = new WeakMap(), f = new WeakMap(), E = new WeakMap(), m = new WeakMap(), S = new WeakMap(), e = new WeakSet(), C = function(t = !1) {
  if (!i(this, f) || i(this, f).getAttribute("custom") !== null) return;
  let s = i(this, m);
  t && (i(this, f).innerHTML = "", s = ""), i(this, S).call(this, { value: i(this, e, o), oldValue: s, out: i(this, f) });
}, R = function(t) {
  t.connected({ t2: this, textarea: i(this, a) });
}, p = function(t) {
  var s;
  (s = t.disconnected) == null || s.call(t);
}, // Internal utilities -----------------------------------
A = function(t) {
  var s;
  (s = i(this, a)) == null || s.focus(), t && l(this, e, L).call(this, t);
}, L = function(t) {
  if (i(this, a)) {
    if (t.to === "absolute")
      i(this, a).setSelectionRange(t.start, t.end ?? t.start);
    else if (t.to === "relative") {
      const s = i(this, e, g) + t.delta, n = t.collapse ? s : i(this, e, v) + t.delta;
      i(this, a).setSelectionRange(s, n);
    } else if (t.to === "startOfLine") {
      const [s] = O(
        i(this, e, o),
        t.startOf
      );
      i(this, a).setSelectionRange(s, s);
    } else if (t.to === "endOfLine") {
      const [, s] = O(i(this, e, o), t.endOf);
      i(this, a).setSelectionRange(s, s);
    } else if (t.to === "lines") {
      const { start: s, end: n } = t, [c, d] = O(i(this, e, o), s, n);
      i(this, a).setSelectionRange(c, d);
    }
  }
}, w = function(t, s) {
  let [n, c] = i(this, e, T);
  s <= n ? (n += t.length, c += t.length) : s > n && s < c && (c += t.length);
  const [d, x] = P(i(this, e, o), Math.max(s, 0));
  u(this, e, d + t + x, k), l(this, e, L).call(this, { to: "absolute", start: n, end: c });
}, H = function(t) {
  l(this, e, w).call(this, t, i(this, e, g));
}, g = function() {
  var t;
  return ((t = i(this, a)) == null ? void 0 : t.selectionStart) ?? 0;
}, v = function() {
  var t;
  return ((t = i(this, a)) == null ? void 0 : t.selectionEnd) ?? 0;
}, T = function() {
  return [i(this, e, g), i(this, e, v)];
}, V = function() {
  return D(
    i(this, e, o),
    i(this, e, g),
    i(this, e, v)
  );
}, o = function() {
  var t;
  return ((t = i(this, a)) == null ? void 0 : t.value) ?? "";
}, k = function(t) {
  if (!i(this, a)) return;
  const [s, n] = i(this, e, T);
  i(this, a).value = t, i(this, a).dispatchEvent(new InputEvent("input", { bubbles: !0 })), i(this, a).setSelectionRange(s, n);
}, j = function(t) {
  const s = () => {
    l(this, e, C).call(this), u(this, m, i(this, e, o));
  };
  t.addEventListener("input", () => {
    s();
  });
  const n = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value"
  );
  Object.defineProperty(t, "value", {
    get() {
      var c;
      return (c = n == null ? void 0 : n.get) == null ? void 0 : c.call(t);
    },
    set(c) {
      var d;
      (d = n == null ? void 0 : n.set) == null || d.call(t, c), s();
    },
    configurable: !0,
    enumerable: !0
  });
}, q = function() {
  let t = this.querySelector(".t2-output");
  return t || (t = document.createElement("div"), t.classList.add("t2-output"), this.appendChild(t)), t.setAttribute("aria-hidden", "true"), t.dataset.testid = "output", t;
};
export {
  G as Textarea2
};
