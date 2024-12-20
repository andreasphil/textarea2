import { type T2Plugin, type T2PluginContext } from ".";
export declare class FullLineEditsPlugin implements T2Plugin {
    #private;
    connected(context: T2PluginContext): void;
    disconnected(): void;
}
