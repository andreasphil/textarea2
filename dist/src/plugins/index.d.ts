export * from "./autocomplete.js";
export * from "./flipLines.js";
export * from "./fullLineEdits.js";
export * from "./lists.js";
export * from "./tabs.js";
export type T2PluginContext = {
    t2: Textarea2;
    textarea: HTMLTextAreaElement;
};
export type T2Plugin = {
    setup?: (() => void) | undefined;
    connected: (context: T2PluginContext) => void;
    disconnected?: (() => void) | undefined;
};
import type { Textarea2 } from "../textarea2.js";
