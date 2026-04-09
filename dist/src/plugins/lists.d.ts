/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */
/** @typedef {import("../lib/text.js").ContinueListRule} ContinueListRule */
export const defaultContinueListRules: Record<string, import("../lib/text.js").ContinueListRule>;
export class ListsPlugin {
    /** @param {ContinueListRule[]} [rules] */
    constructor(rules?: ContinueListRule[]);
    /** @param {T2PluginContext} context */
    connected(context: T2PluginContext): void;
    disconnected(): void;
    #private;
}
export type ContinueListRule = import("../lib/text.js").ContinueListRule;
import type { T2PluginContext } from "./index.js";
