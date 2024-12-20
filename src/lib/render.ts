import { splitLines } from "./text";

export type T2RenderFn = (context: {
  value: string;
  oldValue: string;
  out: HTMLElement;
}) => void;

export function createPlaintextRender(): T2RenderFn {
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
