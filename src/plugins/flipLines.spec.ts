import { screen } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { render as baseRender, cleanup } from "../lib/test";
import { Textarea2 } from "../textarea2";
import { FlipLinesPlugin } from "./flipLines";

function render() {
  const result = baseRender();
  result.textarea2.use(new FlipLinesPlugin());
  return result;
}

describe("flip lines", () => {
  beforeAll(() => {
    Textarea2.define();
  });

  afterEach(() => {
    cleanup();
  });

  test("moves a line down", async () => {
    const { textarea, user } = render();
    textarea.value = "a\nb\nc";

    await user.type(screen.getByRole("textbox"), "{Alt>}{ArrowDown}{/Alt}", {
      initialSelectionStart: 2,
    });

    expect(textarea).toHaveValue("a\nc\nb");
    expect(textarea.selectionStart).toBe(5);
  });

  test("moves a line up", async () => {
    const { textarea, user } = render();
    textarea.value = "a\nb\nc";

    await user.type(screen.getByRole("textbox"), "{Alt>}{ArrowUp}{/Alt}", {
      initialSelectionStart: 2,
    });

    expect(textarea).toHaveValue("b\na\nc");
    expect(textarea.selectionStart).toBe(1);
  });

  test("does not do anything when there is only one line", async () => {
    const { textarea, user } = render();
    textarea.value = "a";

    await user.type(screen.getByRole("textbox"), "{Alt>}{ArrowDown}{/Alt}", {
      initialSelectionStart: 0,
    });

    expect(textarea).toHaveValue("a");
    expect(textarea.selectionStart).toBe(0);
  });

  test("does not do anything when going past the last line", async () => {
    const { textarea, user } = render();
    textarea.value = "a\nb\nc";

    await user.type(screen.getByRole("textbox"), "{Alt>}{ArrowDown}{/Alt}", {
      initialSelectionStart: 4,
    });

    expect(textarea).toHaveValue("a\nb\nc");
    expect(textarea.selectionStart).toBe(4);
  });

  test("does not do anything when going before the first line", async () => {
    const { textarea, user } = render();
    textarea.value = "a\nb\nc";

    await user.type(screen.getByRole("textbox"), "{Alt>}{ArrowUp}{/Alt}", {
      initialSelectionStart: 0,
    });

    expect(textarea).toHaveValue("a\nb\nc");
    expect(textarea.selectionStart).toBe(0);
  });
});
