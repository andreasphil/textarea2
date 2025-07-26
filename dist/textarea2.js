import { s as l, e as a, a as c, g as u } from "./text-BeGDkh5s.js";
function d() {
  return ({ value: h, out: t }) => {
    const e = l(h), s = Array.from(t.children);
    for (e.forEach((i, n) => {
      let r;
      n < s.length ? r = s[n] : (r = document.createElement("div"), t.appendChild(r)), r.textContent = i;
    }); t.children.length > e.length && t.lastChild; )
      t.removeChild(t.lastChild);
  };
}
class f extends HTMLElement {
  // Static properties + configuration --------------------
  static define(t = "textarea-2") {
    customElements.define(t, this);
  }
  static get observedAttributes() {
    return [];
  }
  // Internal state ---------------------------------------
  #t = null;
  #s = null;
  #r = /* @__PURE__ */ new Set();
  #a = "";
  // Lifecycle --------------------------------------------
  constructor() {
    super();
  }
  connectedCallback() {
    const t = this.querySelector("textarea");
    if (!t) throw new Error("Could not find a textarea to use");
    this.#v(t), this.#a = t.value, this.#t = t;
    const e = this.#m();
    this.#s = e, this.addEventListener("click", () => this.#d()), this.#h(!0), this.#r.forEach((s) => this.#u(s));
  }
  disconnectedCallback() {
    this.#r.forEach((t) => this.#g(t));
  }
  attributeChangedCallback() {
  }
  // Presentation -----------------------------------------
  #c = d();
  setRender(t) {
    this.#c = t(), this.#h(!0);
  }
  #h(t = !1) {
    if (!this.#s || this.#s.getAttribute("custom") !== null) return;
    let e = this.#a;
    t && (this.#s.innerHTML = "", e = ""), this.#c({ value: this.#e, oldValue: e, out: this.#s });
  }
  // Plugins ----------------------------------------------
  use(...t) {
    return t.forEach((e) => {
      this.#r.add(e), e.setup?.(), this.isConnected && this.#u(e);
    }), { use: this.use.bind(this) };
  }
  #u(t) {
    t.connected({ t2: this, textarea: this.#t });
  }
  #g(t) {
    t.disconnected?.();
  }
  // Public interface -------------------------------------
  async act(t) {
    let e = !1;
    const s = (n) => (typeof n == "string" && (this.#e = n, e = !0), this.#e), i = {
      focus: this.#d.bind(this),
      insertAt: this.#o.bind(this),
      select: this.#l.bind(this),
      selectedLines: () => this.#E,
      selectionEnd: () => this.#n,
      selectionStart: () => this.#i,
      type: this.#b.bind(this),
      value: s
    };
    await t(i), e && this.#t?.dispatchEvent(new Event("change", { bubbles: !0 }));
  }
  // Internal utilities -----------------------------------
  #d(t) {
    this.#t?.focus(), t && this.#l(t);
  }
  #l(t) {
    if (this.#t) {
      if (t.to === "absolute")
        this.#t.setSelectionRange(t.start, t.end ?? t.start);
      else if (t.to === "relative") {
        const e = this.#i + t.delta, s = t.collapse ? e : this.#n + t.delta;
        this.#t.setSelectionRange(e, s);
      } else if (t.to === "startOfLine") {
        const [e] = a(
          this.#e,
          t.startOf
        );
        this.#t.setSelectionRange(e, e);
      } else if (t.to === "endOfLine") {
        const [, e] = a(this.#e, t.endOf);
        this.#t.setSelectionRange(e, e);
      } else if (t.to === "lines") {
        const { start: e, end: s } = t, [i, n] = a(this.#e, e, s);
        this.#t.setSelectionRange(i, n);
      }
    }
  }
  #o(t, e) {
    let [s, i] = this.#f;
    e <= s ? (s += t.length, i += t.length) : e > s && e < i && (i += t.length);
    const [n, r] = c(this.#e, Math.max(e, 0));
    this.#e = n + t + r, this.#l({ to: "absolute", start: s, end: i });
  }
  #b(t) {
    this.#o(t, this.#i);
  }
  get #i() {
    return this.#t?.selectionStart ?? 0;
  }
  get #n() {
    return this.#t?.selectionEnd ?? 0;
  }
  get #f() {
    return [this.#i, this.#n];
  }
  get #E() {
    return u(
      this.#e,
      this.#i,
      this.#n
    );
  }
  get #e() {
    return this.#t?.value ?? "";
  }
  set #e(t) {
    if (!this.#t) return;
    const [e, s] = this.#f;
    this.#t.value = t, this.#t.dispatchEvent(new InputEvent("input", { bubbles: !0 })), this.#t.setSelectionRange(e, s);
  }
  #v(t) {
    const e = () => {
      this.#h(), this.#a = this.#e;
    };
    t.addEventListener("input", () => {
      e();
    });
    const s = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    );
    Object.defineProperty(t, "value", {
      get() {
        return s?.get?.call(t);
      },
      set(i) {
        s?.set?.call(t, i), e();
      },
      configurable: !0,
      enumerable: !0
    });
  }
  #m() {
    let t = this.querySelector(".t2-output");
    return t || (t = document.createElement("div"), t.classList.add("t2-output"), this.appendChild(t)), t.setAttribute("aria-hidden", "true"), t.dataset.testid = "output", t;
  }
}
export {
  f as Textarea2
};
