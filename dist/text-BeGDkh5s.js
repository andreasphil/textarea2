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
  let a = 0, s = -1, l = -1;
  t < n && ([n, t] = [t, n]);
  for (let r = 0; r < i.length && (s < 0 || l < 0); r++) {
    const c = i[r], h = a, d = h + c.length;
    n >= h && n <= d && (s = r), t >= h && t <= d && (l = r), a += c.length + 1;
  }
  return [Math.max(s, 0), l === -1 ? i.length - 1 : l];
}
function M(e, n, t = n) {
  const i = u(e), a = i.map((r) => r.length);
  n = Math.max(n, 0), t = Math.min(t, i.length - 1), t < n && ([n, t] = [t, n]);
  let s = a.slice(0, n).reduce((r, c) => r + c, 0);
  s += n;
  let l = a.slice(n, t + 1).reduce((r, c) => r + c, s);
  return l += t - n, [s, l];
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
  let i, a = null, s = null;
  for (let c = 0; c < n.length && !i; c++)
    a = e.match(n[c].pattern), a && (i = n[c].next);
  const l = o(e, t);
  l[0] && a && i && (s = i === "same" ? a[0] : i(a[0]), l[1] = s + l[1]);
  const r = l[0] === a?.[0] && t === e.length;
  return r && (l[0] = ""), {
    currentLine: l[0],
    nextLine: r ? null : l[1] ?? null,
    didContinue: !!(l[0] && s),
    didEnd: !!(r && s),
    marker: s
  };
}
function j(e, n, t) {
  let i = null, a = null;
  for (let s = 0; s < t.length && !i; s++) {
    const l = e.match(t[s].pattern);
    l && e.length === l[0].length && (i = t[s].pattern, a = n.match(i));
  }
  return i && a ? { currentLine: e.replace(i, n), marker: a[0] } : null;
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
