/** @import { IndentMode }  from "../lib/text.js" */
/** @import { T2PluginContext } from "./index.js" */
/** @import { Textarea2 } from "../textarea2.js" */
export class TabsPlugin {
    /** @param {T2PluginContext} context */
    connected(context: T2PluginContext): void;
    disconnected(): void;
    #private;
}
import type { T2PluginContext } from "./index.js";
