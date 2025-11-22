import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

/** @import { Textarea2 } from "../textarea2.js"  */

export function cleanup() {
  document.body.innerHTML = "";
}

/**
 * @param {string} [html]
 * @returns {{user: import("@testing-library/user-event").UserEvent, textarea2: Textarea2, textarea: HTMLTextAreaElement, output: HTMLElement}}
 */
export function render(
  html = `<textarea-2><textarea></textarea></textarea-2>`
) {
  document.body.innerHTML = html;

  /** @type {Textarea2 | null} */
  const textarea2 = document.body.querySelector("textarea-2");
  if (!textarea2) throw new Error("Failed to render textarea-2 element");

  return {
    user: userEvent.setup(),
    textarea2,
    textarea: screen.getByRole("textbox"),
    output: screen.getByTestId("output"),
  };
}
