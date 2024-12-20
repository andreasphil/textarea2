import { Textarea2 } from "../textarea2";
export declare function cleanup(): void;
export declare function render(html?: string): {
    user: import("@testing-library/user-event").UserEvent;
    textarea2: Textarea2;
    textarea: HTMLTextAreaElement;
    output: HTMLElement;
};
