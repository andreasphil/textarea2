/** @import { Textarea2 } from "../textarea2.js" */

/**
 * @typedef {object} T2PluginContext
 * @property {Textarea2} t2
 * @property {HTMLTextAreaElement} textarea
 */

/**
 * @typedef {object} T2Plugin
 * @property {(() => void)} [setup]
 * @property {(context: T2PluginContext) => void} connected
 * @property {(() => void)} [disconnected]
 */

export * from "./autocomplete.js";
export * from "./flipLines.js";
export * from "./fullLineEdits.js";
export * from "./lists.js";
export * from "./tabs.js";
