import { screen } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { cleanup, render as baseRender } from "../lib/test";
import { Textarea2 } from "../textarea2";
import { ListsPlugin } from "./lists";

/** @param {import("../lib/text").ContinueListRule[]} [customRules]  */
function render(customRules) {
  const result = baseRender();
  result.textarea2.use(new ListsPlugin(customRules));
  return result;
}

describe("lists", () => {
  beforeAll(() => {
    Textarea2.define();
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("continues dashed lists", async () => {
    const { textarea, user } = render();
    textarea.value = "- Item";

    await user.type(screen.getByRole("textbox"), "{enter}");

    expect(textarea).toHaveValue("- Item\n- ");
    expect(textarea.selectionStart).toBe(9);
  });

  test("continues bullet lists", async () => {
    const { textarea, user } = render();
    textarea.value = "* Item";

    await user.type(screen.getByRole("textbox"), "{enter}");

    expect(textarea).toHaveValue("* Item\n* ");
    expect(textarea.selectionStart).toBe(9);
  });

  test("continues numbered lists", async () => {
    const { textarea, user } = render();
    textarea.value = "1. Item";

    await user.type(screen.getByRole("textbox"), "{enter}");

    expect(textarea).toHaveValue("1. Item\n2. ");
    expect(textarea.selectionStart).toBe(11);
  });

  test("continues indentation with tabs", async () => {
    const { textarea, user } = render();
    textarea.value = "\t\tItem";

    await user.type(screen.getByRole("textbox"), "{enter}");

    expect(textarea).toHaveValue("\t\tItem\n\t\t");
    expect(textarea.selectionStart).toBe(9);
  });

  test("continues a custom list with the same marker", async () => {
    const { textarea, user } = render([{ pattern: /^> /, next: "same" }]);
    textarea.value = "> Item";

    await user.type(screen.getByRole("textbox"), "{enter}");

    expect(textarea).toHaveValue("> Item\n> ");
    expect(textarea.selectionStart).toBe(9);
  });

  test("continues a custom list with a dynamic marker", async () => {
    const next = vi.fn().mockReturnValue("Fooo ");
    const { textarea, user } = render([{ pattern: /^Foo /, next }]);
    textarea.value = "Foo Item";

    await user.type(screen.getByRole("textbox"), "{enter}");

    expect(textarea).toHaveValue("Foo Item\nFooo ");
    expect(next).toHaveBeenCalled();
    expect(textarea.selectionStart).toBe(14);
  });

  test("ends list continuation on an empty list item", async () => {
    const { textarea, user } = render();
    textarea.value = "- ";

    await user.type(screen.getByRole("textbox"), "{enter}");

    expect(textarea).toHaveValue("");
    expect(textarea.selectionStart).toBe(0);
  });

  test("merges dashed lists", async () => {
    const { textarea, user } = render();
    textarea.value = "- ";

    const el = screen.getByRole("textbox");
    await user.click(el);
    await user.paste("- Item");

    expect(textarea).toHaveValue("- Item");
    expect(textarea.selectionStart).toBe(6);
  });

  test("marges bullet lists", async () => {
    const { textarea, user } = render();
    textarea.value = "* ";

    const el = screen.getByRole("textbox");
    await user.click(el);
    await user.paste("* Item");

    expect(textarea).toHaveValue("* Item");
    expect(textarea.selectionStart).toBe(6);
  });

  test("merges numbered lists", async () => {
    const { textarea, user } = render();
    textarea.value = "1. ";

    const el = screen.getByRole("textbox");
    await user.click(el);
    await user.paste("2. Item");

    expect(textarea).toHaveValue("2. Item");
    expect(textarea.selectionStart).toBe(7);
  });

  test("merges indentation with tabs", async () => {
    const { textarea, user } = render();
    textarea.value = "\t";

    const el = screen.getByRole("textbox");
    await user.click(el);
    await user.paste("\tItem");

    expect(textarea).toHaveValue("\tItem");
    expect(textarea.selectionStart).toBe(5);
  });

  test("merges a custom list with the same marker", async () => {
    const { textarea, user } = render([{ pattern: /^> /, next: "same" }]);
    textarea.value = "> ";

    const el = screen.getByRole("textbox");
    await user.click(el);
    await user.paste("> Item");

    expect(textarea).toHaveValue("> Item");
    expect(textarea.selectionStart).toBe(6);
  });

  test("merges a custom list with a dynamic marker", async () => {
    const next = vi.fn().mockReturnValue("Bar ");
    const { textarea, user } = render([{ pattern: /^(Foo|Bar) /, next }]);
    textarea.value = "Foo ";

    const el = screen.getByRole("textbox");
    await user.click(el);
    await user.paste("Bar Item");

    expect(textarea).toHaveValue("Bar Item");
    expect(textarea.selectionStart).toBe(8);
  });
});
