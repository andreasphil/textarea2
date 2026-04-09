/** @import { Textarea2 } from "../textarea2.js"  */
export function cleanup(): void;
/**
 * @param {string} [html]
 * @returns {{user: import("@testing-library/user-event").UserEvent, textarea2: Textarea2, textarea: HTMLTextAreaElement, output: HTMLElement}}
 */
export function render(html?: string): {
    user: import("@testing-library/user-event").UserEvent;
    textarea2: Textarea2;
    textarea: HTMLTextAreaElement;
    output: HTMLElement;
};
import type { Textarea2 } from "../textarea2.js";
