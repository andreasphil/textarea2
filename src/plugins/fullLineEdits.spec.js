import { screen } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { render as baseRender, cleanup } from "../lib/test";
import { Textarea2 } from "../textarea2";
import { FullLineEditsPlugin } from "./fullLineEdits";

function render() {
  const result = baseRender();
  result.textarea2.use(new FullLineEditsPlugin());
  return result;
}

describe("full line edits", () => {
  beforeAll(() => {
    Textarea2.define();
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  describe("cut", () => {
    test("cuts the current line", async () => {
      const { textarea, user } = render();
      textarea.value = "a\nb\nc";
      vi.spyOn(navigator.clipboard, "writeText");

      await user.type(screen.getByRole("textbox"), "{meta>}x{/meta}", {
        initialSelectionStart: 1,
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("a");
      expect(textarea).toHaveValue("b\nc");
      expect(textarea.selectionStart).toBe(1);
    });

    test("cuts the only line", async () => {
      const { textarea, user } = render();
      textarea.value = "a";
      vi.spyOn(navigator.clipboard, "writeText");

      await user.type(screen.getByRole("textbox"), "{meta>}x{/meta}", {
        initialSelectionStart: 1,
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("a");
      expect(textarea).toHaveValue("");
      expect(textarea.selectionStart).toBe(0);
    });

    test("does not do anything when the textarea is empty", async () => {
      const { textarea, user } = render();
      textarea.value = "";
      vi.spyOn(navigator.clipboard, "writeText");

      await user.type(screen.getByRole("textbox"), "{meta>}x{/meta}");

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("");
      expect(textarea).toHaveValue("");
    });

    test("does not do anything when something is selected", async () => {
      const { textarea, user } = render();
      textarea.value = "a\nb\nc";
      vi.spyOn(navigator.clipboard, "writeText");

      await user.type(screen.getByRole("textbox"), "{meta>}x{/meta}", {
        initialSelectionStart: 2,
        initialSelectionEnd: 3,
      });

      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
      expect(textarea).toHaveValue("a\nx\nc");
    });
  });

  describe("copy", () => {
    test("copies the current line", async () => {
      const { textarea, user } = render();
      textarea.value = "a\nb\nc";
      vi.spyOn(navigator.clipboard, "writeText");

      await user.type(screen.getByRole("textbox"), "{meta>}c{/meta}", {
        initialSelectionStart: 3,
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("b");
      textarea.value = "a\nb\nc";
    });

    test("does not do anything when the textarea is empty", async () => {
      const { textarea, user } = render();
      textarea.value = "";
      vi.spyOn(navigator.clipboard, "writeText");

      await user.type(screen.getByRole("textbox"), "{meta>}c{/meta}");

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("");
      expect(textarea).toHaveValue("");
    });

    test("does not do anything when something is selected", async () => {
      const { textarea, user } = render();
      textarea.value = "a\nb\nc";
      vi.spyOn(navigator.clipboard, "writeText");

      await user.type(screen.getByRole("textbox"), "{meta>}c{/meta}", {
        initialSelectionStart: 2,
        initialSelectionEnd: 3,
      });

      expect(textarea).toHaveValue("a\nc\nc");
    });
  });

  describe("delete", () => {
    test("deletes the current line", async () => {
      const { textarea, user } = render();
      textarea.value = "a\nb\nc";

      await user.type(
        screen.getByRole("textbox"),
        "{meta>}{shift>}k{/meta}{/shift}",
        { initialSelectionStart: 3 }
      );

      textarea.value = "a\nc";
      expect(textarea.selectionStart).toBe(3);
    });

    test("does not do anything when the textarea is empty", async () => {
      const { textarea, user } = render();
      textarea.value = "";

      await user.type(
        screen.getByRole("textbox"),
        "{meta>}{shift>}k{/meta}{/shift}"
      );

      expect(textarea).toHaveValue("");
    });

    test("does not do anything when something is selected", async () => {
      const { textarea, user } = render();
      textarea.value = "a\nb\nc";

      await user.type(
        screen.getByRole("textbox"),
        "{meta>}{shift>}k{/meta}{/shift}",
        { initialSelectionStart: 2, initialSelectionEnd: 3 }
      );

      expect(textarea).toHaveValue("a\nk\nc");
    });
  });

  describe("duplicate", () => {
    test("duplicates the current line", async () => {
      const { textarea, user } = render();
      textarea.value = "a\nb\nc";

      await user.type(
        screen.getByRole("textbox"),
        "{meta>}{shift>}d{/meta}{/shift}",
        { initialSelectionStart: 1 }
      );

      expect(textarea).toHaveValue("a\na\nb\nc");
      expect(textarea.selectionStart).toBe(3);
    });

    test("does not do anything when something is selected", async () => {
      const { textarea, user } = render();
      textarea.value = "a\nb\nc";

      await user.type(
        screen.getByRole("textbox"),
        "{meta>}{shift>}d{/meta}{/shift}",
        { initialSelectionStart: 2, initialSelectionEnd: 3 }
      );

      expect(textarea).toHaveValue("a\nd\nc");
    });
  });
});
