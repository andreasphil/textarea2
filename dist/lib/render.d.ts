export type T2RenderFn = (context: {
    value: string;
    oldValue: string;
    out: HTMLElement;
}) => void;
export declare function createPlaintextRender(): T2RenderFn;
