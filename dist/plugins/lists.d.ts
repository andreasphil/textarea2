import { type T2Plugin, type T2PluginContext } from ".";
import { type ContinueListRule } from "../lib/text";
export { type ContinueListRule } from "../lib/text";
export declare const defaultContinueListRules: Record<string, ContinueListRule>;
export declare class ListsPlugin implements T2Plugin {
    #private;
    constructor(rules?: ContinueListRule[]);
    connected(context: T2PluginContext): void;
    disconnected(): void;
}
