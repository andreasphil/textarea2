import { screen } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { render as baseRender, cleanup } from "../lib/test";
import { Textarea2 } from "../textarea2";
import { TabsPlugin } from "./tabs";

function render() {
  const result = baseRender();
  result.textarea2.use(new TabsPlugin());
  return result;
}

describe("tabs", () => {
  beforeAll(() => {
    Textarea2.define();
  });

  afterEach(() => {
    cleanup();
  });

  test("indents on tab", async () => {
    const { textarea, user } = render();
    textarea.value = "a";

    await user.type(screen.getByRole("textbox"), "{Tab}", {
      initialSelectionStart: 0,
    });

    expect(textarea).toHaveValue("\ta");
    expect(textarea.selectionStart).toBe(1);
  });

  test("indents multiple times", async () => {
    const { textarea, user } = render();
    textarea.value = "\ta";

    await user.type(screen.getByRole("textbox"), "{Tab}", {
      initialSelectionStart: 1,
    });

    expect(textarea).toHaveValue("\t\ta");
  });

  test("outdents on shift + tab", async () => {
    const { textarea, user } = render();
    textarea.value = "\ta";

    await user.type(screen.getByRole("textbox"), "{Shift>}{Tab}{/Shift}", {
      initialSelectionStart: 1,
    });

    expect(textarea).toHaveValue("a");
    expect(textarea.selectionStart).toBe(0);
  });

  test("indents multiple lines", async () => {
    const { textarea, user } = render();
    textarea.value = "foo\nbar";

    await user.type(screen.getByRole("textbox"), "{Tab}", {
      initialSelectionStart: 1,
      initialSelectionEnd: 5,
    });

    expect(textarea).toHaveValue("\tfoo\n\tbar");
    expect(textarea).toHaveSelection("\tfoo\n\tbar");
  });

  test("outdents multiple lines", async () => {
    const { textarea, user } = render();
    textarea.value = "\tfoo\n\tbar";

    await user.type(screen.getByRole("textbox"), "{Shift>}{Tab}{/Shift}", {
      initialSelectionStart: 1,
      initialSelectionEnd: 5,
    });

    expect(textarea).toHaveValue("foo\nbar");
    expect(textarea).toHaveSelection("foo\nbar");
  });

  test("does not do anything when trying to outdent without indentation", async () => {
    const { textarea, user } = render();
    textarea.value = "a";

    await user.type(screen.getByRole("textbox"), "{Shift>}{Tab}{/Shift}", {
      initialSelectionStart: 1,
    });

    expect(textarea).toHaveValue("a");
  });
});
