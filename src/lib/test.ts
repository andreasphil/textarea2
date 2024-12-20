import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { Textarea2 } from "../textarea2";

export function cleanup() {
  document.body.innerHTML = "";
}

export function render(
  html = `<textarea-2><textarea></textarea></textarea-2>`
) {
  document.body.innerHTML = html;

  return {
    user: userEvent.setup(),
    textarea2: document.body.querySelector("textarea-2") as Textarea2,
    textarea: screen.getByRole<HTMLTextAreaElement>("textbox"),
    output: screen.getByTestId("output"),
  };
}
