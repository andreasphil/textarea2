/**
 * @typedef {object} T2RenderContext
 * @property {string} value
 * @property {string} oldValue
 * @property {HTMLElement} out
 */
/** @typedef {(context: T2RenderContext) => void} T2RenderFn */
/** @returns {T2RenderFn} Render function */
export function createPlaintextRender(): T2RenderFn;
export type T2RenderContext = {
    value: string;
    oldValue: string;
    out: HTMLElement;
};
export type T2RenderFn = (context: T2RenderContext) => void;
