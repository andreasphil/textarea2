import { screen } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { cleanup, render } from "./lib/test";
import { type T2Plugin } from "./plugins";
import { Textarea2 } from "./textarea2";

describe("textarea2", () => {
  beforeAll(() => {
    Textarea2.define();
  });

  afterEach(() => {
    cleanup();
  });

  describe("render", () => {
    test("renders", () => {
      render();

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    test.todo("throws if no textarea is passed in the slot", async () => {
      // Not sure how to test this...
    });

    test("initially renders the output", () => {
      const { output } = render(
        `<textarea-2><textarea>Test</textarea></textarea-2>`
      );

      expect(output).toHaveTextContent("Test");
    });

    test("re-renders the output on user interaction", async () => {
      const { output, textarea, user } = render();
      expect(output).not.toHaveTextContent(/.+/);

      await user.type(textarea, "Test");

      expect(output).toHaveTextContent("Test");
    });

    test("re-renders the output on programmatic value change", () => {
      const { output, textarea } = render();
      expect(output).not.toHaveTextContent(/.+/);

      textarea.value = "Test";

      expect(output).toHaveTextContent("Test");
    });

    test("renders multiple lines of text", () => {
      const { output, textarea } = render();

      textarea.value = "Foo\nBar";

      expect(output).toHaveTextContent("FooBar");
      expect(output.children).toHaveLength(2);
    });

    test("reuses an existing output element", () => {
      const { output } = render(`<textarea-2>
        <textarea>Test</textarea>
        <div class="t2-output" data-testid="output" data-existing="true">Test</div>
      </textarea-2>`);

      expect(output).toHaveAttribute("data-existing", "true");
    });

    test("syncs the content of an existing output element", () => {
      const { output } = render(`<textarea-2>
        <textarea>Test</textarea>
        <div class="t2-output" data-testid="output" data-existing="true"></div>
      </textarea-2>`);

      expect(output).toHaveAttribute("data-existing", "true");
      expect(output).toHaveTextContent("Test");
    });

    test("calls a custom renderer", async () => {
      const { textarea, textarea2, user } = render();
      const renderFn = vi.fn();

      textarea2.setRender(() => renderFn);
      await user.type(textarea, "foo bar");

      expect(renderFn).toHaveBeenLastCalledWith({
        value: "foo bar",
        oldValue: "foo ba",
        out: expect.any(HTMLElement),
      });
    });

    test("does a full re-render when switching renderers before user interaction", () => {
      const { textarea, textarea2 } = render();
      const renderFn = vi.fn();
      textarea.value = "foo bar";

      textarea2.setRender(() => renderFn);

      expect(renderFn).toHaveBeenLastCalledWith({
        value: "foo bar",
        oldValue: "",
        out: expect.any(HTMLElement),
      });
    });

    test("does a full re-render when switching renderers after user interaction", async () => {
      const { textarea, textarea2, user } = render();
      const renderFn = vi.fn();

      await user.type(textarea, "foo bar");
      textarea2.setRender(() => renderFn);

      expect(renderFn).toHaveBeenLastCalledWith({
        value: "foo bar",
        oldValue: "",
        out: expect.any(HTMLElement),
      });
    });

    test("incrementally re-renders when keeping the same renderer", async () => {
      const { textarea, textarea2, user } = render();
      const renderFn = vi.fn();

      textarea2.setRender(() => renderFn);
      await user.type(textarea, "foo bar");

      expect(renderFn).toHaveBeenCalledTimes(8);
      expect(renderFn).toHaveBeenLastCalledWith({
        value: "foo bar",
        oldValue: "foo ba",
        out: expect.any(HTMLElement),
      });
    });

    test("does not render initially when disabling automatic rendering", () => {
      const { output } = render(`<textarea-2>
        <textarea>Foo</textarea>
        <div class="t2-output" data-testid="output" custom>Bar</div>
      </textarea-2>`);

      expect(output).toHaveTextContent("Bar");
    });

    test("does not re-render on user interaction when disabling automatic rendering", async () => {
      const { output, textarea, user } = render(`<textarea-2>
        <textarea>Foo</textarea>
        <div class="t2-output" data-testid="output" custom>Bar</div>
      </textarea-2>`);

      await user.type(textarea, " Test");

      expect(output).toHaveTextContent("Bar");
    });

    test("does not call a custom renderer when disabling automatic rendering", async () => {
      const { textarea, textarea2, user } = render(`<textarea-2>
        <textarea></textarea>
        <div class="t2-output" data-testid="output" custom></div>
      </textarea-2>`);
      const renderFn = vi.fn();

      textarea2.setRender(() => renderFn);
      await user.type(textarea, "foo bar");

      expect(renderFn).not.toHaveBeenCalled();
    });
  });

  describe("value", () => {
    test("can be edited", async () => {
      const { textarea, user } = render();

      await user.type(textarea, "Hello world!");

      expect(textarea).toHaveValue("Hello world!");
    });

    test("returns the value", async () => {
      let result;
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ value }) => {
        result = value();
      });

      expect(result).toBe("Hello world!");
    });

    test("returns a live reference to the value", async () => {
      let resultBefore, resultAfter;
      const { textarea2 } = render();

      await textarea2.act(({ value }) => {
        resultBefore = value();
        resultAfter = value("Hello world!");
      });

      expect(resultBefore).toBeFalsy();
      expect(resultAfter).toBe("Hello world!");
    });

    test("sets the value", async () => {
      let result;
      const { textarea, textarea2 } = render();

      await textarea2.act(({ value }) => {
        result = value("Hello world!");
      });

      expect(result).toBe("Hello world!");
      expect(textarea.value).toBe("Hello world!");
    });

    test("clears the value", async () => {
      let result;
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ value }) => {
        result = value("");
      });

      expect(result).toBe("");
      expect(textarea.value).toBe("");
    });

    test("restores the cursor position when the value is set", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";
      textarea.selectionStart = 5;

      await textarea2.act(({ value }) => {
        value("foo bar");
      });

      expect(textarea.selectionStart).toBe(5);
    });

    test("emits an input event when the value is set", async () => {
      const { textarea, textarea2 } = render();
      const handler = vi.fn();
      textarea.addEventListener("input", handler);

      await textarea2.act(({ value }) => {
        value("Hello world!");
      });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          target: textarea,
        })
      );
    });

    test("emits a change event when the value is set", async () => {
      const { textarea, textarea2 } = render();
      const handler = vi.fn();
      textarea.addEventListener("change", handler);

      await textarea2.act(({ value }) => {
        value("Hello world!");
      });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          target: textarea,
        })
      );
    });

    test("emits a single change event for multiple changes in the same act()", async () => {
      const { textarea, textarea2 } = render();
      const handler = vi.fn();
      textarea.addEventListener("change", handler);

      await textarea2.act(({ value }) => {
        value("Hello ...");
        value("... world!");
      });

      expect(handler).toHaveBeenCalledOnce();
    });
  });

  describe("plugin lifecycle", () => {
    test("runs plugin setup", () => {
      const { textarea2 } = render();
      const plugin: T2Plugin = {
        setup: vi.fn(),
        connected: vi.fn(),
        disconnected: vi.fn(),
      };

      textarea2.use(plugin);

      expect(plugin.setup).toHaveBeenCalled();
    });

    test("runs plugin connected", () => {
      const { textarea2 } = render();
      const plugin: T2Plugin = {
        setup: vi.fn(),
        connected: vi.fn(),
        disconnected: vi.fn(),
      };

      textarea2.use(plugin);

      expect(plugin.connected).toHaveBeenCalled();
    });

    test("runs plugin disconnected", () => {
      const { textarea2 } = render();
      const plugin: T2Plugin = {
        setup: vi.fn(),
        connected: vi.fn(),
        disconnected: vi.fn(),
      };

      textarea2.use(plugin);
      cleanup();

      expect(plugin.disconnected).toHaveBeenCalled();
    });

    test("does not run plugin connected on a disconnected component", () => {
      const { textarea2 } = render();
      const plugin: T2Plugin = {
        setup: vi.fn(),
        connected: vi.fn(),
        disconnected: vi.fn(),
      };

      cleanup();
      textarea2.use(plugin);

      expect(plugin.disconnected).not.toHaveBeenCalled();
    });

    test("adds multiple plugins", () => {
      const { textarea2 } = render();
      const plugin1: T2Plugin = {
        setup: vi.fn(),
        connected: vi.fn(),
        disconnected: vi.fn(),
      };
      const plugin2: T2Plugin = {
        setup: vi.fn(),
        connected: vi.fn(),
        disconnected: vi.fn(),
      };

      textarea2.use(plugin1, plugin2);

      expect(plugin1.setup).toHaveBeenCalled();
      expect(plugin2.setup).toHaveBeenCalled();
    });

    test("allows chaining plugins", () => {
      const { textarea2 } = render();
      const plugin1: T2Plugin = {
        setup: vi.fn(),
        connected: vi.fn(),
        disconnected: vi.fn(),
      };
      const plugin2: T2Plugin = {
        setup: vi.fn(),
        connected: vi.fn(),
        disconnected: vi.fn(),
      };

      textarea2.use(plugin1).use(plugin2);

      expect(plugin1.setup).toHaveBeenCalled();
      expect(plugin2.setup).toHaveBeenCalled();
    });
  });

  describe("set selection", () => {
    test("sets the cursor position to an absolute position", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ select }) => {
        select({ to: "absolute", start: 5, end: 5 });
      });

      expect(textarea.selectionStart).toBe(5);
      expect(textarea.selectionEnd).toBe(5);
    });

    test("makes an absolute selection of a range", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ select }) => {
        select({ to: "absolute", start: 0, end: 5 });
      });

      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe(5);
      expect(textarea).toHaveSelection("Hello");
    });

    test("makes a relative selection", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";
      textarea.setSelectionRange(3, 3);

      await textarea2.act(({ select }) => {
        select({ to: "relative", delta: 6 });
      });

      expect(textarea.selectionStart).toBe(9);
      expect(textarea.selectionEnd).toBe(9);
    });

    test("makes a relative selection with a negative value", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";
      textarea.setSelectionRange(3, 3);

      await textarea2.act(({ select }) => {
        select({ to: "relative", delta: -3 });
      });

      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe(0);
    });

    test("makes a relative selection if a range is selected", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";
      textarea.setSelectionRange(3, 6);

      await textarea2.act(({ select }) => {
        select({ to: "relative", delta: 3 });
      });

      expect(textarea.selectionStart).toBe(6);
      expect(textarea.selectionEnd).toBe(9);
      expect(textarea).toHaveSelection("wor");
    });

    test("collapses a range when making a relative selection", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";
      textarea.setSelectionRange(3, 6);

      await textarea2.act(({ select }) => {
        select({ to: "relative", delta: 3, collapse: true });
      });

      expect(textarea.selectionStart).toBe(6);
      expect(textarea.selectionEnd).toBe(6);
    });

    test("selects the start of a line", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello\nworld!";
      textarea.setSelectionRange(7, 7);

      await textarea2.act(({ select }) => {
        select({ to: "startOfLine", startOf: 1 });
      });

      expect(textarea.selectionStart).toBe(6);
      expect(textarea.selectionEnd).toBe(6);
    });

    test("selects the end of a line", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello\nworld!";
      textarea.setSelectionRange(7, 7);

      await textarea2.act(({ select }) => {
        select({ to: "endOfLine", endOf: 1 });
      });

      expect(textarea.selectionStart).toBe(12);
      expect(textarea.selectionEnd).toBe(12);
    });

    test("selects multiple lines", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello\nworld!";
      textarea.setSelectionRange(7, 7);

      await textarea2.act(({ select }) => {
        select({ to: "lines", start: 0, end: 1 });
      });

      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe(12);
      expect(textarea).toHaveSelection("Hello\nworld!");
    });
  });

  describe("get selection", () => {
    test("provides the selected lines", async () => {
      let result;
      const { textarea, textarea2 } = render();
      textarea.value = "Hello\nworld!";
      textarea.setSelectionRange(2, 8);

      await textarea2.act(({ selectedLines }) => {
        result = selectedLines();
      });

      expect(result).toEqual([0, 1]);
    });

    test("provides a live reference to selected lines", async () => {
      let resultBefore, resultAfter;
      const { textarea, textarea2 } = render();
      textarea.value = "Hello\nworld!";
      textarea.setSelectionRange(2, 8);

      await textarea2.act(({ selectedLines, select }) => {
        resultBefore = selectedLines();
        select({ to: "lines", start: 0, end: 0 });
        resultAfter = selectedLines();
      });

      expect(resultBefore).toEqual([0, 1]);
      expect(resultAfter).toEqual([0, 0]);
    });

    test("provides the selection start", async () => {
      let result;
      const { textarea, textarea2 } = render();
      textarea.value = "Hello\nworld!";
      textarea.selectionStart = 2;

      await textarea2.act(({ selectionStart }) => {
        result = selectionStart();
      });

      expect(result).toBe(2);
    });

    test("provides a live reference to the selection start", async () => {
      let resultBefore, resultAfter;
      const { textarea, textarea2 } = render();
      textarea.value = "Hello\nworld!";
      textarea.selectionStart = 2;

      await textarea2.act(({ selectionStart, select }) => {
        resultBefore = selectionStart();
        select({ to: "absolute", start: 4 });
        resultAfter = selectionStart();
      });

      expect(resultBefore).toBe(2);
      expect(resultAfter).toBe(4);
    });

    test("provides the selection end", async () => {
      let result;
      const { textarea, textarea2 } = render();
      textarea.value = "Hello\nworld!";
      textarea.setSelectionRange(2, 8);

      await textarea2.act(({ selectionEnd }) => {
        result = selectionEnd();
      });

      expect(result).toBe(8);
    });

    test("provides a live reference to the selection end", async () => {
      let resultBefore, resultAfter;
      const { textarea, textarea2 } = render();
      textarea.value = "Hello\nworld!";
      textarea.setSelectionRange(2, 4);

      await textarea2.act(({ selectionEnd, select }) => {
        resultBefore = selectionEnd();
        select({ to: "relative", delta: 2 });
        resultAfter = selectionEnd();
      });

      expect(resultBefore).toBe(4);
      expect(resultAfter).toBe(6);
    });
  });

  describe("focus", () => {
    test("focuses the textarea", async () => {
      const { textarea, textarea2 } = render();

      await textarea2.act(({ focus }) => {
        focus();
      });

      expect(textarea).toHaveFocus();
    });

    test("sets a selection when focusing", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ focus }) => {
        focus({ to: "absolute", start: 0, end: 5 });
      });

      expect(textarea).toHaveFocus();
      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe(5);
      expect(textarea).toHaveSelection("Hello");
    });
  });

  describe("insert text", () => {
    test("inserts text anywhere in the textarea", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert }) => {
        insert("test ", 6);
      });

      expect(textarea).toHaveValue("Hello test world!");
    });

    test("inserts text inside a range", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert, select }) => {
        select({ to: "absolute", start: 0, end: 12 });
        insert("test ", 6);
      });

      expect(textarea).toHaveValue("Hello test world!");
      expect(textarea).toHaveSelection("Hello test world!");
    });

    test("adjusts selection when inserting at the cursor position", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert, select }) => {
        select({ to: "absolute", start: 6 });
        insert("test ", 6);
      });

      expect(textarea.selectionStart).toBe(11);
    });

    test("keeps selection when inserting after the cursor", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert, select }) => {
        select({ to: "absolute", start: 6 });
        insert("oo", 7);
      });

      expect(textarea).toHaveValue("Hello wooorld!");
      expect(textarea.selectionStart).toBe(6);
    });

    test("adjusts selection when inserting before the cursor", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert, select }) => {
        select({ to: "absolute", start: 6 });
        insert("oo", 5);
      });

      expect(textarea).toHaveValue("Hellooo world!");
      expect(textarea.selectionStart).toBe(8);
    });

    test("keeps selection when inserting after a range", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert, select }) => {
        select({ to: "absolute", start: 0, end: 5 });
        insert("oo", 7);
      });

      expect(textarea).toHaveValue("Hello wooorld!");
      expect(textarea).toHaveSelection("Hello");
    });

    test("adjusts selection when inserting before a range", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert, select }) => {
        select({ to: "absolute", start: 0, end: 5 });
        insert("test ", 0);
      });

      expect(textarea).toHaveValue("test Hello world!");
      expect(textarea).toHaveSelection("Hello");
    });

    test("keeps selection when inserting at the start of a range", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert, select }) => {
        select({ to: "absolute", start: 6, end: 11 });
        insert("test ", 6);
      });

      expect(textarea).toHaveValue("Hello test world!");
      expect(textarea).toHaveSelection("world");
    });

    test("keeps selection when inserting at the end of a range", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert, select }) => {
        select({ to: "absolute", start: 6, end: 11 });
        insert(" test", 11);
      });

      expect(textarea).toHaveValue("Hello world test!");
      expect(textarea).toHaveSelection("world");
    });

    test("inserts at the beginning if the position is negative", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert }) => {
        insert("test ", -1);
      });

      expect(textarea).toHaveValue("test Hello world!");
    });

    test("inserts at the end if the position is out of range", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ insertAt: insert }) => {
        insert(" test", 1000);
      });

      expect(textarea).toHaveValue("Hello world! test");
    });
  });

  describe("typing", () => {
    test("types text at the cursor position", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ type, select }) => {
        select({ to: "absolute", start: 6 });
        type("test ");
      });

      expect(textarea).toHaveValue("Hello test world!");
    });

    test("adjusts selection when typing", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ type, select }) => {
        select({ to: "absolute", start: 5 });
        type(" test");
      });

      expect(textarea).toHaveValue("Hello test world!");
      expect(textarea.selectionStart).toBe(10);
    });

    test("adjusts selection range when typing", async () => {
      const { textarea, textarea2 } = render();
      textarea.value = "Hello world!";

      await textarea2.act(({ type, select }) => {
        select({ to: "absolute", start: 0, end: 6 });
        type("test ");
      });

      expect(textarea).toHaveValue("test Hello world!");
      expect(textarea).toHaveSelection("Hello ");
    });
  });
});
