import { screen } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { render as baseRender, cleanup } from "../lib/test";
import { Textarea2 } from "../textarea2";
import { type AutoComplete, AutocompletePlugin } from "./autocomplete";

const exampleCompletions: AutoComplete[] = [
  {
    trigger: "/",
    id: "command",
    commands: [
      { id: "test1", name: "Test", icon: "🤔", value: "test.todo" },
      { id: "test2", name: "Example", icon: "🫣", value: "example" },
    ],
  },
];

function render(completions = exampleCompletions) {
  const result = baseRender();
  result.textarea2.use(new AutocompletePlugin(completions));
  return result;
}

// Workaround while JSOM has no support for :popover-open selector
function expectToBeVisible(el: HTMLElement) {
  expect(el).toHaveAttribute("data-popover-open", "true");
}

function expectNotToBeVisible(el: HTMLElement) {
  expect(el).not.toHaveAttribute("data-popover-open");
}

describe("autocomplete", () => {
  beforeAll(() => {
    Textarea2.define();
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  test("shows the menu with commands", async () => {
    const { user } = render();

    await user.type(screen.getByRole("textbox"), "/t");

    expectToBeVisible(screen.getByRole("menu"));
    expect(screen.getByRole("button", { name: "🤔 Test" })).toBeInTheDocument();
  });

  test("doesn't show the menu outside of autocompleting", async () => {
    render();

    expectNotToBeVisible(screen.getByRole("menu"));
  });

  test("doesn't show the menu if no commands are found", async () => {
    const { user } = render();

    await user.type(screen.getByRole("textbox"), "/zzz");

    expectNotToBeVisible(screen.getByRole("menu"));
  });

  test("doesn't show the menu if no query has been typed yet", async () => {
    const { user } = render();

    await user.type(screen.getByRole("textbox"), "/");

    expectNotToBeVisible(screen.getByRole("menu"));
  });

  test("marks the first command as focused", async () => {
    const { user } = render();

    await user.type(screen.getByRole("textbox"), "/e");

    const items = screen.getAllByRole("button");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("data-active", "true");
    expect(items[1]).not.toHaveAttribute("data-active");
  });

  test("moves the focus up and down", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/e");

    let items = screen.getAllByRole("button");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("data-active", "true");
    expect(items[1]).not.toHaveAttribute("data-active");

    await user.type(textbox, "{ArrowDown}");
    items = screen.getAllByRole("button");
    expect(items[0]).not.toHaveAttribute("data-active");
    expect(items[1]).toHaveAttribute("data-active", "true");

    await user.type(textbox, "{ArrowUp}");
    items = screen.getAllByRole("button");
    expect(items[0]).toHaveAttribute("data-active", "true");
    expect(items[1]).not.toHaveAttribute("data-active");
  });

  test("doesn't move the focus past the last element", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/e");

    let items = screen.getAllByRole("button");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("data-active", "true");
    expect(items[1]).not.toHaveAttribute("data-active");

    await user.type(textbox, "{ArrowDown}{ArrowDown}");
    items = screen.getAllByRole("button");
    expect(items[0]).not.toHaveAttribute("data-active");
    expect(items[1]).toHaveAttribute("data-active", "true");
  });

  test("doesn't move the focus before the first element", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/e");

    let items = screen.getAllByRole("button");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("data-active", "true");
    expect(items[1]).not.toHaveAttribute("data-active");

    await user.type(textbox, "{ArrowUp}");
    items = screen.getAllByRole("button");
    expect(items[0]).toHaveAttribute("data-active", "true");
    expect(items[1]).not.toHaveAttribute("data-active");
  });

  test("hides the menu when the trigger is deleted", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/t");
    expectToBeVisible(screen.getByRole("menu"));

    await user.type(textbox, "{Backspace}{Backspace}");
    expectNotToBeVisible(screen.getByRole("menu"));
  });

  test("hides the menu when typing a non-word character", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/t");
    expectToBeVisible(screen.getByRole("menu"));

    await user.type(textbox, "-");
    expectNotToBeVisible(screen.getByRole("menu"));
  });

  test("keeps the menu open when pressing modifier keys", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/t");
    expectToBeVisible(screen.getByRole("menu"));

    await user.type(textbox, "{Alt}");
    expectToBeVisible(screen.getByRole("menu"));

    await user.type(textbox, "{Control}");
    expectToBeVisible(screen.getByRole("menu"));

    await user.type(textbox, "{Meta}");
    expectToBeVisible(screen.getByRole("menu"));

    await user.type(textbox, "{Shift}");
    expectToBeVisible(screen.getByRole("menu"));
  });

  test("replaces the command with a static string", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Hello /t{Enter}");

    expect(textbox).toHaveValue("Hello test.todo");
  });

  test("replaces the command with a dynamic string", async () => {
    const value = vi.fn().mockReturnValue("foo");
    const { user } = render([
      {
        id: "0",
        trigger: "/",
        commands: [{ id: "1", name: "Test", value }],
      },
    ]);

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Hello /t{Enter}");

    expect(textbox).toHaveValue("Hello foo");
    expect(value).toHaveBeenCalled();
  });

  test("deletes the command when the value returns undefined", async () => {
    const value = vi.fn().mockReturnValue(undefined);
    const { user } = render([
      {
        id: "0",
        trigger: "/",
        commands: [{ id: "1", name: "Test", value }],
      },
    ]);

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Hello /t{Enter}");

    expect(textbox).toHaveValue("Hello ");
    expect(value).toHaveBeenCalled();
  });

  test("runs a command on button click", async () => {
    const value = vi.fn().mockReturnValue("foo");
    const { user } = render([
      {
        id: "0",
        trigger: "/",
        commands: [{ id: "1", name: "Test", value }],
      },
    ]);

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Hello /t");
    await user.click(screen.getByRole("button", { name: "Test" }));

    expect(textbox).toHaveValue("Hello foo");
    expect(value).toHaveBeenCalled();
  });

  test("hides the menu after running a command", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Hello /t");
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.type(textbox, "{Enter}");
    expectNotToBeVisible(screen.getByRole("menu"));
  });

  test("displays the command's name", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/t");
    expect(screen.getByRole("button", { name: /Test/ })).toBeInTheDocument();
  });

  test("displays the command's icon from a string", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/t");
    expect(screen.getByRole("button", { name: /🤔/ })).toBeInTheDocument();
  });

  test("displays the command's icon from an HTML element", async () => {
    const icon = document.createElement("span");
    icon.textContent = "👀";
    const { user } = render([
      {
        id: "0",
        trigger: "/",
        commands: [{ id: "test1", name: "Test", icon, value: "test.todo" }],
      },
    ]);

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/t");
    expect(screen.getByRole("button", { name: /👀/ })).toBeInTheDocument();
  });

  test("filters commands by their names", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/e");
    expect(screen.getAllByRole("button")).toHaveLength(2);

    await user.type(textbox, "/ex");
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  test("filter is not case-sensitive", async () => {
    const { user } = render();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/TEST");
    expect(screen.getByRole("button", { name: /Test/ })).toBeInTheDocument();
  });

  test("shows initial commands when the query is empty", async () => {
    const value = vi.fn().mockReturnValue("foo");
    const { user } = render([
      {
        id: "0",
        trigger: "/",
        commands: [{ id: "1", name: "Initial", value, initial: true }],
      },
    ]);

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/");
    expect(screen.getByRole("button", { name: "Initial" })).toBeInTheDocument();
  });

  test("resolves dynamic commands", async () => {
    const commands = vi
      .fn()
      .mockReturnValue([
        { id: "1", name: "Dynamic", value: "Foo", initial: true },
      ]);
    const { user } = render([{ id: "0", trigger: "/", commands }]);

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "/");
    expect(screen.getByRole("button", { name: "Dynamic" })).toBeInTheDocument();
  });
});
