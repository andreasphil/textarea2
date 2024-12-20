import { type T2Plugin, T2PluginContext } from ".";
import { replaceRange, splitAt } from "../lib/text";
import { Textarea2 } from "../textarea2";

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

export class AutocompletePlugin implements T2Plugin {
  #unsubscribe: AbortController | undefined = undefined;

  #t2: Textarea2 | undefined = undefined;

  #menu: HTMLMenuElement;

  #completions: AutoComplete[];

  constructor(completions: AutoComplete[]) {
    this.#menu = this.#createMenuElement();
    this.#completions = completions;
  }

  connected(context: T2PluginContext) {
    this.#unsubscribe = new AbortController();
    this.#t2 = context.t2;

    this.#t2.appendChild(this.#menu);

    this.#t2.addEventListener("keyup", this.#keyup.bind(this), {
      signal: this.#unsubscribe.signal,
    });

    this.#t2.addEventListener("keydown", this.#keydown.bind(this), {
      signal: this.#unsubscribe.signal,
    });
  }

  disconnected() {
    this.#unsubscribe?.abort();
  }

  // Keybindings ------------------------------------------

  #keydown(event: KeyboardEvent) {
    if (!this.#activeAc) return;

    if (event.key === "ArrowDown") {
      const next = this.#activeAc.focusedIndex + 1;
      const len = this.#activeAc.filteredCommands.length;
      this.#activeAc.focusedIndex = Math.min(len - 1, next);
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      const next = this.#activeAc.focusedIndex - 1;
      this.#activeAc.focusedIndex = Math.max(next, 0);
      event.preventDefault();
    } else if (event.key === "Enter") {
      const command = this.#activeAc.focusedCommand;
      if (!command) return;
      this.#execAutocomplete(command);
      event.preventDefault();
    }
  }

  #keyup(event: KeyboardEvent) {
    const allowedKeys = [
      "Alt",
      "ArrowDown",
      "ArrowUp",
      "Backspace",
      "Control",
      "Meta",
      "Shift",
    ];

    // No autocomplete context existing yet -> check if we need to create one
    if (!this.#activeAc) {
      const mode = this.#completions.find((i) => i.trigger === event.key);
      if (mode) this.#initAutocomplete(mode);
    }

    // Autocomplete was interrupted -> reset
    else if (!allowedKeys.includes(event.key) && !event.key.match(/^\w$/)) {
      this.#endAutocomplete();
    }

    // User is typing -> update current command
    else if (this.#activeAc.mode) {
      const cursor = this.#activeAc.start;
      const exp = new RegExp(`^\\${this.#activeAc.mode.trigger}(\\w*)`);

      this.#t2?.act(({ value }) => {
        const currentText = value().substring(cursor);
        const match = currentText.match(exp);

        if (match) this.#activeAc!.query = match[1];
        else this.#endAutocomplete();
      });
    }
  }

  // Autocomplete lifecycle -------------------------------

  #activeAc: ActiveAc | null = null;

  async #initAutocomplete(mode: AutoComplete) {
    const ac = new ActiveAc();
    ac.onRender = (state) => this.#render(state);
    ac.mode = mode;

    this.#t2?.act(({ selectionStart }) => {
      ac.start = selectionStart() - 1;
    });

    this.#determineMenuPosition().then(({ x, y }) => {
      ac.menuPosition = [x, y];
    });

    this.#activeAc = ac;
  }

  #execAutocomplete(command: AutoCompleteCommand) {
    // Run and get result
    let result: string | undefined = undefined;
    if (typeof command.value === "function") result = command.value();
    else if (typeof command.value === "string") result = command.value;
    result ??= "";

    // Apply changes
    this.#t2?.act(({ value, selectionEnd, select }) => {
      if (!this.#activeAc) return;

      const next = replaceRange(
        value(),
        this.#activeAc.start,
        selectionEnd() + 1,
        result
      );

      value(next);

      const newStart = this.#activeAc.start + result.length;
      select({ to: "absolute", start: newStart });
    });

    this.#endAutocomplete();
  }

  #endAutocomplete() {
    this.#activeAc = null;
    this.#toggleMenu(false);
  }

  // Rendering --------------------------------------------

  #createMenuElement(): HTMLMenuElement {
    const menu = document.createElement("menu");
    menu.setAttribute("role", "menu");
    menu.popover = "manual";
    menu.classList.add("t2-autocomplete");

    return menu;
  }

  async #determineMenuPosition(): Promise<{ x: string; y: string }> {
    return new Promise((resolve) => {
      this.#t2?.act(({ value, selectionStart }) => {
        const splitValue = splitAt(value(), selectionStart() - 1);

        const helper = document.createElement("div");
        helper.classList.add("t2-autocomplete-position-helper");

        const before = document.createElement("span");
        before.textContent = splitValue[0];
        helper.appendChild(before);

        const cursor = document.createElement("span");
        helper.appendChild(cursor);

        const after = document.createElement("span");
        after.textContent = splitValue[1];
        helper.appendChild(after);

        this.#t2?.appendChild(helper);

        requestAnimationFrame(() => {
          const rect = cursor.getBoundingClientRect();
          this.#t2?.removeChild(helper);

          resolve({ x: `${rect.left}px`, y: `${rect.bottom}px` });
        });
      });
    });
  }

  #toggleMenu(visible: boolean) {
    try {
      visible ? this.#menu.showPopover() : this.#menu.hidePopover();
    } catch {
    } finally {
      if (visible) this.#menu.dataset.popoverOpen = "true";
      else delete this.#menu.dataset.popoverOpen;
    }
  }

  #render(state: ActiveAc) {
    // Position
    this.#menu.style.setProperty("--t2-autocomplete-x", state.menuPosition[0]);
    this.#menu.style.setProperty("--t2-autocomplete-y", state.menuPosition[1]);

    // Items based on filtered commands
    this.#menu.innerHTML = "";

    if (!state.filteredCommands.length) {
      this.#menu.innerHTML = "";
      this.#toggleMenu(false);
      return;
    }

    state.filteredCommands
      .map((command, i) => {
        const li = document.createElement("li");

        const button = document.createElement("button");
        if (state.focusedIndex === i) button.dataset.active = "true";
        button.addEventListener("click", () => {
          this.#execAutocomplete(command);
        });

        if (typeof command.icon === "string") {
          button.textContent = `${command.icon} ${command.name}`;
        } else if (command.icon instanceof Element) {
          button.appendChild(command.icon);
          button.append(command.name);
        } else {
          button.textContent = command.name;
        }

        li.appendChild(button);
        return li;
      })
      .forEach((el) => this.#menu.appendChild(el));

    this.#toggleMenu(true);
  }
}

/** Internal state used by the autocompletion menu */
class ActiveAc {
  #focusedIndex = 0;

  #menuPosition: [string, string] = ["0px", "0px"];

  #mode: AutoComplete | undefined = undefined;

  #query: string = "";

  start: number = 0;

  onRender: (state: ActiveAc) => void = () => {};

  constructor() {}

  #render() {
    this.onRender(this);
  }

  get filteredCommands(): AutoCompleteCommand[] {
    if (!this.mode) return [];

    const resolvedCommands = Array.isArray(this.mode.commands)
      ? this.mode.commands
      : this.mode.commands();

    if (!resolvedCommands?.length) return [];

    let commands;

    if (!this.query) {
      commands = resolvedCommands.filter((i) => i.initial);
    } else {
      const lowercaseQuery = this.query.toLowerCase();
      commands = resolvedCommands.filter((i) => {
        const commandStr = i.name.toLowerCase();
        return commandStr.includes(lowercaseQuery);
      });
    }

    return commands;
  }

  get focusedCommand(): AutoCompleteCommand | undefined {
    return this.filteredCommands[this.focusedIndex];
  }

  get focusedIndex(): number {
    return this.#focusedIndex;
  }

  set focusedIndex(value: number) {
    this.#focusedIndex = value;
    this.#render();
  }

  get menuPosition(): [string, string] {
    return this.#menuPosition;
  }

  set menuPosition(value: [string, string]) {
    this.#menuPosition = value;
    this.#render();
  }

  get mode(): AutoComplete | undefined {
    return this.#mode;
  }

  set mode(value: AutoComplete | undefined) {
    this.#mode = value;
    this.#render();
  }

  get query(): string {
    return this.#query;
  }

  set query(value: string) {
    this.#query = value;
    this.#render();
  }
}
