import { T2RenderFn } from "./lib/render";
import { type T2Plugin } from "./plugins";
import "./textarea2.css";
export { type T2RenderFn } from "./lib/render";
export type T2Context = {
    focus: (selection?: T2Selection) => void;
    insertAt: (value: string, position: number) => void;
    select: (selection: T2Selection) => void;
    selectedLines: () => [from: number, to: number];
    selectionEnd: () => number;
    selectionStart: () => number;
    type: (value: string) => void;
    value: (newValue?: string) => string;
};
export type T2Selection = {
    to: "absolute";
    start: number;
    end?: number;
} | {
    to: "relative";
    delta: number;
    collapse?: boolean;
} | {
    to: "startOfLine";
    startOf: number;
} | {
    to: "endOfLine";
    endOf: number;
} | {
    to: "lines";
    start: number;
    end: number;
};
export declare class Textarea2 extends HTMLElement {
    #private;
    static define(tag?: string): void;
    static get observedAttributes(): never[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    setRender(factory: () => T2RenderFn): void;
    use(...plugins: T2Plugin[]): {
        use: (...plugins: T2Plugin[]) => /*elided*/ any;
    };
    act(callback: (c: T2Context) => void | Promise<void>): Promise<void>;
}
