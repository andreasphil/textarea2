function u(e) {
  return e.split(`
`);
}
function g(e) {
  return e.join(`
`);
}
function o(e, n) {
  return [e.slice(0, n), e.slice(n)];
}
function p(e, n) {
  const t = u(e).toSpliced(n, 1);
  return g(t);
}
function f(e, n) {
  let t = u(e);
  return !t.length || n > t.length ? e : g([...t.slice(0, n), t[n], ...t.slice(n)]);
}
function L(e, n) {
  return [n, e];
}
function b(e, n, t, i) {
  return e.substring(0, n) + i + e.substring(t - 1);
}
function m(e, n, t = n) {
  const i = u(e);
  let s = 0, a = -1, l = -1;
  t < n && ([n, t] = [t, n]);
  for (let r = 0; r < i.length && (a < 0 || l < 0); r++) {
    const c = i[r], h = s, d = h + c.length;
    n >= h && n <= d && (a = r), t >= h && t <= d && (l = r), s += c.length + 1;
  }
  return [Math.max(a, 0), l === -1 ? i.length - 1 : l];
}
function M(e, n, t = n) {
  const i = u(e), s = i.map((r) => r.length);
  n = Math.max(n, 0), t = Math.min(t, i.length - 1), t < n && ([n, t] = [t, n]);
  let a = s.slice(0, n).reduce((r, c) => r + c, 0);
  a += n;
  let l = s.slice(n, t + 1).reduce((r, c) => r + c, a);
  return l += t - n, [a, l];
}
function S(e, n) {
  if (n > e.length || n < 0) return;
  const i = e.slice(0, n).lastIndexOf(`
`) + 1;
  return n - i;
}
const k = {
  unordered: { pattern: /^\t*[-*] /, next: "same" },
  indent: { pattern: /^\t+/, next: "same" },
  numbered: {
    pattern: /^\t*\d+\. /,
    next: (e) => `${Number.parseInt(e) + 1}. `
  }
};
function C(e, n, t = e.length) {
  let i, s = null, a = null;
  for (let c = 0; c < n.length && !i; c++)
    s = e.match(n[c].pattern), s && (i = n[c].next);
  const l = o(e, t);
  l[0] && s && i && (a = i === "same" ? s[0] : i(s[0]), l[1] = a + l[1]);
  const r = l[0] === (s == null ? void 0 : s[0]) && t === e.length;
  return r && (l[0] = ""), {
    currentLine: l[0],
    nextLine: r ? null : l[1] ?? null,
    didContinue: !!(l[0] && a),
    didEnd: !!(r && a),
    marker: a
  };
}
function j(e, n, t) {
  let i = null, s = null;
  for (let a = 0; a < t.length && !i; a++) {
    const l = e.match(t[a].pattern);
    l && e.length === l[0].length && (i = t[a].pattern, s = n.match(i));
  }
  return i && s ? { currentLine: e.replace(i, n), marker: s[0] } : null;
}
function x(e, n = "indent") {
  return n === "indent" ? e.map((t) => `	${t}`) : e.map((t) => t.startsWith("	") ? t.slice(1) : t);
}
export {
  o as a,
  f as b,
  k as c,
  p as d,
  M as e,
  L as f,
  m as g,
  S as h,
  C as i,
  g as j,
  x as k,
  j as m,
  b as r,
  u as s
};
