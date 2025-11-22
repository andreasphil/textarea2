import { splitLines } from "./text.js";

/**
 * @typedef {object} T2RenderContext
 * @property {string} value
 * @property {string} oldValue
 * @property {HTMLElement} out
 */

/** @typedef {(context: T2RenderContext) => void} T2RenderFn */

/** @returns {T2RenderFn} Render function */
export function createPlaintextRender() {
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

    while (out.children.length > lines.length && out.lastChild) {
      out.removeChild(out.lastChild);
    }
  };
}
