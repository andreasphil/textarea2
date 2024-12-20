import { Textarea2 } from "../textarea2";
export * from "./autocomplete";
export * from "./flipLines";
export * from "./fullLineEdits";
export * from "./lists";
export * from "./tabs";
export type T2PluginContext = {
    t2: Textarea2;
    textarea: HTMLTextAreaElement;
};
export type T2Plugin = {
    setup?: () => void;
    connected: (context: T2PluginContext) => void;
    disconnected?: () => void;
};
