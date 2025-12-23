export * from "./plugins/index.js";
export class Textarea2 extends HTMLElement {
    static define(tag?: string): void;
    static get observedAttributes(): never[];
    static get "__#private@#style"(): string;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    /** @param {() => T2RenderFn} factory */
    setRender(factory: () => T2RenderFn): void;
    /**
     * @param {...T2Plugin} plugins
     * @returns {{use: (...plugins: T2Plugin[]) => any}}
     */
    use(...plugins: T2Plugin[]): {
        use: (...plugins: T2Plugin[]) => any;
    };
    /**
     * @param {(c: T2Context) => void | Promise<void>} callback
     * @returns {Promise<void>}
     */
    act(callback: (c: T2Context) => void | Promise<void>): Promise<void>;
    #private;
}
export type T2Context = {
    focus: (selection?: T2Selection) => void;
    insertAt: (value: string, position: number) => void;
    select: (selection: T2Selection) => void;
    selectedLines: () => [number, number];
    selectionEnd: () => number;
    selectionStart: () => number;
    type: (value: string) => void;
    value: (newValue?: string) => string;
};
export type T2SelectionAbsolute = {
    to: "absolute";
    start: number;
    end?: number | undefined;
};
export type T2SelectionRelative = {
    to: "relative";
    delta: number;
    collapse?: boolean | undefined;
};
export type T2SelectionStartOfLine = {
    to: "startOfLine";
    startOf: number;
};
export type T2SelectionEndOfLine = {
    to: "endOfLine";
    endOf: number;
};
export type T2SelectionLines = {
    to: "lines";
    start: number;
    end: number;
};
export type T2Selection = T2SelectionAbsolute | T2SelectionRelative | T2SelectionStartOfLine | T2SelectionEndOfLine | T2SelectionLines;
import type { T2RenderFn } from "./lib/render.js";
import type { T2Plugin } from "./plugins/index.js";
