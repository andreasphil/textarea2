import { type T2Plugin, T2PluginContext } from ".";
export type AutoComplete = {
    /** The unique identifier of the autocomplete mode. Can be any string. */
    id: string;
    /**
     * Character that triggers the autocomplete when the user types it. Note that
     * this MUST have a `length` of exactly 1.
     */
    trigger: string;
    /** Commands associated with this autocomplete mode. */
    commands: AutoCompleteCommand[] | (() => AutoCompleteCommand[]);
};
export type AutoCompleteCommand = {
    /** The unique identifier of the command. Can be any string. */
    id: string;
    /** The visible name of the command. */
    name: string;
    /**
     * Icon of the command. Should be a string (which will be inserted as
     * text content) or an HTML element (which will be inserted as-is).
     */
    icon?: string | Element;
    /**
     * Value of the command. If the value is a string or returns a string,
     * the autocomplete sequence will be replaced by that string. If the
     * value is undefined or returns undefined, the autocomplete sequence
     * will be removed. This can still be useful if you want to run some
     * functionality without inserting any text.
     */
    value: string | (() => string | undefined);
    /**
     * If set to true, the command will be shown by default when the menu is
     * opened, but no query has been entered yet. You can use this to display
     * an initial list of items immediately when the trigger char is typed.
     */
    initial?: boolean;
};
export declare class AutocompletePlugin implements T2Plugin {
    #private;
    constructor(completions: AutoComplete[]);
    connected(context: T2PluginContext): void;
    disconnected(): void;
}
