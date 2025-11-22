import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { render as baseRender, cleanup } from "../lib/test";
import { Textarea2 } from "../textarea2";
import { createPlaintextRender } from "./render";

function render() {
  const result = baseRender();
  result.textarea2.setRender(createPlaintextRender);
  return result;
}

describe("renderPlainText", () => {
  beforeAll(() => {
    Textarea2.define();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders a single line of text", () => {
    const { output, textarea } = render();
    textarea.value = "Line 1";

    expect(output.children).toHaveLength(1);
    expect(output).toHaveTextContent("Line 1");
  });

  test("renders multiple lines if text", () => {
    const { output, textarea } = render();
    textarea.value = "Line 1\nLine 2\nLine 3\nLine 4";

    expect(output.children).toHaveLength(4);
    expect(output).toHaveTextContent("Line 1Line 2Line 3Line 4");
  });

  test("inserts a line", async () => {
    const { output, textarea, user } = render();
    textarea.value = "Line 1\nLine 2\nLine 3\nLine 4";

    await user.type(textarea, "\nNew line", { initialSelectionStart: 6 });

    expect(output.children).toHaveLength(5);
    expect(output).toHaveTextContent("Line 1New lineLine 2Line 3Line 4");
  });

  test("updates a line", async () => {
    const { output, textarea, user } = render();
    textarea.value = "Line 1\nLine 2\nLine 3\nLine 4";

    await user.type(textarea, " new content", { initialSelectionStart: 11 });

    expect(output.children).toHaveLength(4);
    expect(output).toHaveTextContent("Line 1Line new content 2Line 3Line 4");
  });

  test("deletes a line", async () => {
    const { output, textarea, user } = render();
    textarea.value = "Line 1\nLine 2\nLine 3\nLine 4";

    await user.type(textarea, "{Backspace>7/}", { initialSelectionStart: 13 });

    expect(output.children).toHaveLength(3);
    expect(output).toHaveTextContent("Line 1Line 3Line 4");
  });
});
