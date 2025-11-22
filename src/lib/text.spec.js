import { describe, expect, test } from "vitest";
import {
  continueList,
  continueListRules,
  deleteLine,
  duplicateLine,
  extendSelectionToFullLines,
  flipLines,
  getCursorInLine,
  getSelectedLines,
  indent,
  joinLines,
  mergeList,
  replaceRange,
  splitAt,
  splitLines,
} from "./text";

describe("text", () => {
  describe("splitLines", () => {
    test("splits a string into a list of lines", () => {
      expect(splitLines("foo\nbar\nbaz")).toEqual(["foo", "bar", "baz"]);
    });

    test("splits a string with a single line", () => {
      expect(splitLines("foo")).toEqual(["foo"]);
    });

    test("splits empty string", () => {
      expect(splitLines("")).toEqual([""]);
    });
  });

  describe("joinLines", () => {
    test("joins a list of lines into a single string", () => {
      expect(joinLines(["foo", "bar", "baz"])).toBe("foo\nbar\nbaz");
    });

    test("joins a list of lines with a single line", () => {
      expect(joinLines(["foo"])).toBe("foo");
    });

    test("joins a list of lines with an empty line", () => {
      expect(joinLines([""])).toBe("");
    });
  });

  describe("splitAt", () => {
    test("splits a string in two at the specified index", () => {
      expect(splitAt("foobarbaz", 3)).toEqual(["foo", "barbaz"]);
    });

    test("splits a string at the start", () => {
      expect(splitAt("foobarbaz", 0)).toEqual(["", "foobarbaz"]);
    });

    test("splits a string at the end", () => {
      expect(splitAt("foobarbaz", 9)).toEqual(["foobarbaz", ""]);
    });

    test("splits a string with an index out of bounds", () => {
      expect(splitAt("foobarbaz", 100)).toEqual(["foobarbaz", ""]);
    });
  });

  describe("deleteLine", () => {
    test("deletes a line in the middle", () => {
      expect(deleteLine("1\n2\n3", 1)).toEqual("1\n3");
    });

    test("deletes a line at the start", () => {
      expect(deleteLine("1\n2\n3", 0)).toEqual("2\n3");
    });

    test("deletes a line at the end", () => {
      expect(deleteLine("1\n2\n3", 2)).toEqual("1\n2");
    });

    test("doesn't crash if the input is empty", () => {
      expect(deleteLine("", 1)).toEqual("");
    });

    test("doesn't crash if the index is out of bounds", () => {
      expect(deleteLine("1\n2\n3", 100)).toEqual("1\n2\n3");
    });
  });

  describe("duplicateLine", () => {
    test("duplicates a line in the middle", () => {
      expect(duplicateLine("1\n2\n3", 1)).toEqual("1\n2\n2\n3");
    });

    test("duplicates a line at the start", () => {
      expect(duplicateLine("1\n2\n3", 0)).toEqual("1\n1\n2\n3");
    });

    test("duplicates a line at the end", () => {
      expect(duplicateLine("1\n2\n3", 2)).toEqual("1\n2\n3\n3");
    });

    test("doesn't crash if the input is empty", () => {
      expect(duplicateLine("", 1)).toEqual("\n");
    });

    test("doesn't crash if the index is out of bounds", () => {
      expect(duplicateLine("1\n2\n3", 100)).toEqual("1\n2\n3");
    });
  });

  describe("flipLines", () => {
    test("flips two lines", () => {
      expect(flipLines("foo", "bar")).toEqual(["bar", "foo"]);
    });
  });

  describe("replaceRange", () => {
    test("replaces a range in the middle", () => {
      expect(replaceRange("one two three", 4, 8, "four")).toEqual(
        "one four three"
      );
    });

    test("replaces a range at the start", () => {
      expect(replaceRange("one two three", 0, 4, "four")).toEqual(
        "four two three"
      );
    });

    test("replaces a range at the end", () => {
      expect(replaceRange("one two three", 8, 14, "four")).toEqual(
        "one two four"
      );
    });

    test("doesn't crash if the input is empty", () => {
      expect(replaceRange("", 0, 0, "four")).toEqual("four");
    });

    test("doesn't crash if the start index is out of bounds", () => {
      expect(replaceRange("one two three", -5, 8, "four")).toEqual(
        "four three"
      );
    });

    test("doesn't crash if the end index is out of bounds", () => {
      expect(replaceRange("one two three", 8, 99, "four")).toEqual(
        "one two four"
      );
    });

    test("inserts a string if from and to are identical", () => {
      expect(replaceRange("one two three", 4, 5, "four ")).toEqual(
        "one four two three"
      );
    });
  });

  describe("getSelectedLines", () => {
    const example = "foo\nbar\nbaz\n\nqux";

    test("returns the line numbers of the first and last selected line", () => {
      expect(getSelectedLines(example, 1, 9)).toEqual([0, 2]);
    });

    test("returns the line numbers when the selection is reversed", () => {
      expect(getSelectedLines(example, 9, 1)).toEqual([0, 2]);
    });

    test("returns the line numbers when the selection is a single line", () => {
      expect(getSelectedLines(example, 1, 3)).toEqual([0, 0]);
    });

    test("returns the line numbers when the selection is empty", () => {
      expect(getSelectedLines(example, 1)).toEqual([0, 0]);
    });

    test("returns the line numbers when start is out of bounds", () => {
      expect(getSelectedLines(example, -5, 10)).toEqual([0, 2]);
    });

    test("returns the line numbers when end is out of bounds", () => {
      expect(getSelectedLines(example, 1, 100)).toEqual([0, 4]);
    });

    test("returns the line numbers when start and end are out of bounds", () => {
      expect(getSelectedLines(example, -100, 100)).toEqual([0, 4]);
    });

    test("returns the line numbers when start exactly matches the start of a line", () => {
      expect(getSelectedLines(example, 4, 10)).toEqual([1, 2]);
    });

    test("returns the line numbers when end exactly matches the end of a line", () => {
      expect(getSelectedLines(example, 1, 7)).toEqual([0, 1]);
    });

    test("returns the line numbers when start and end exactly match the bounds of a line", () => {
      expect(getSelectedLines(example, 4, 7)).toEqual([1, 1]);
    });

    test("returns the line number if there is only one line", () => {
      expect(getSelectedLines("foo", 0, 3)).toEqual([0, 0]);
    });
  });

  describe("extendSelectionToFullLines", () => {
    const example = "foo\nbar\nbaz\n\nqux";

    test("returns the range of the first and last selected line", () => {
      expect(extendSelectionToFullLines(example, 1, 2)).toEqual([4, 11]);
    });

    test("returns the range when the selection is reversed", () => {
      expect(extendSelectionToFullLines(example, 2, 1)).toEqual([4, 11]);
    });

    test("returns the range when the selection is a single line", () => {
      expect(extendSelectionToFullLines(example, 2, 2)).toEqual([8, 11]);
    });

    test("returns the range when the selection is empty", () => {
      expect(extendSelectionToFullLines(example, 2)).toEqual([8, 11]);
    });

    test("returns the range when start is out of bounds", () => {
      expect(extendSelectionToFullLines(example, -1, 2)).toEqual([0, 11]);
    });

    test("returns the range when end is out of bounds", () => {
      expect(extendSelectionToFullLines(example, 2, 100)).toEqual([8, 16]);
    });

    test("returns the range when start and end are out of bounds", () => {
      expect(extendSelectionToFullLines(example, -100, 100)).toEqual([0, 16]);
    });

    test("returns the range if there is only one line", () => {
      expect(extendSelectionToFullLines("foo", 0)).toEqual([0, 3]);
    });
  });

  describe("getCursorInLine", () => {
    const example = "foo\nbar\nbaz\n\nqux";

    test("returns the position in a line", () => {
      expect(getCursorInLine(example, 6)).toBe(2);
    });

    test("returns the position in a line when the cursor is negative", () => {
      expect(getCursorInLine(example, -100)).toBeUndefined();
    });

    test("returns the position in a line when the cursor is out of bounds", () => {
      expect(getCursorInLine(example, 100)).toBeUndefined();
    });

    test("returns the position in a line when the cursor is at the start of the line", () => {
      expect(getCursorInLine(example, 4)).toBe(0);
    });

    test("returns the position in a line when the cursor is at the end of the line", () => {
      expect(getCursorInLine(example, 7)).toBe(3);
    });

    test("returns the position in a line when the line is empty", () => {
      expect(getCursorInLine(example, 12)).toBe(0);
    });

    test("returns the position in a line if there is only one line", () => {
      expect(getCursorInLine("foo", 2)).toBe(2);
    });

    test("returns the position in the first line", () => {
      expect(getCursorInLine(example, 1)).toBe(1);
    });
  });

  describe("continueList", () => {
    const rules = Object.values(continueListRules);

    test("continues a list with the same marker", () => {
      const continued = continueList("- foo", rules);
      expect(continued).toStrictEqual({
        currentLine: "- foo",
        nextLine: "- ",
        marker: "- ",
        didContinue: true,
        didEnd: false,
      });
    });

    test("continues a list with a custom marker", () => {
      const continued = continueList("1. foo", rules);
      expect(continued).toStrictEqual({
        currentLine: "1. foo",
        nextLine: "2. ",
        marker: "2. ",
        didContinue: true,
        didEnd: false,
      });
    });

    test("adds an empty line if there is no list", () => {
      const continued = continueList("foo", rules);
      expect(continued).toStrictEqual({
        currentLine: "foo",
        nextLine: "",
        marker: null,
        didContinue: false,
        didEnd: false,
      });
    });

    test("splits a line when continuing a list", () => {
      const continued = continueList("- foo bar", rules, 6);
      expect(continued).toStrictEqual({
        currentLine: "- foo ",
        nextLine: "- bar",
        marker: "- ",
        didContinue: true,
        didEnd: false,
      });
    });

    test("splits a line when there is no list", () => {
      const continued = continueList("foo bar", rules, 4);
      expect(continued).toStrictEqual({
        currentLine: "foo ",
        nextLine: "bar",
        marker: null,
        didContinue: false,
        didEnd: false,
      });
    });

    test("ends a list when continuing an empty item", () => {
      const continued = continueList("- ", rules);
      expect(continued).toStrictEqual({
        currentLine: "",
        nextLine: null,
        marker: "- ",
        didContinue: false,
        didEnd: true,
      });
    });

    test("continues an unordered list with *", () => {
      const continued = continueList("* foo", [continueListRules.unordered]);
      expect(continued).toStrictEqual({
        currentLine: "* foo",
        nextLine: "* ",
        marker: "* ",
        didContinue: true,
        didEnd: false,
      });
    });

    test("continues an unordered list with -", () => {
      const continued = continueList("- foo", [continueListRules.unordered]);
      expect(continued).toStrictEqual({
        currentLine: "- foo",
        nextLine: "- ",
        marker: "- ",
        didContinue: true,
        didEnd: false,
      });
    });

    test("continues a numbered list", () => {
      const continued = continueList("1. foo", [continueListRules.numbered]);
      expect(continued).toStrictEqual({
        currentLine: "1. foo",
        nextLine: "2. ",
        marker: "2. ",
        didContinue: true,
        didEnd: false,
      });
    });

    test("continues indentation", () => {
      const continued = continueList("\tfoo", [continueListRules.indent]);
      expect(continued).toStrictEqual({
        currentLine: "\tfoo",
        nextLine: "\t",
        marker: "\t",
        didContinue: true,
        didEnd: false,
      });
    });

    test("inserts a blank line when continuing with the cursor at the start of the line", () => {
      const continued = continueList("- Foo", rules, 0);
      expect(continued).toStrictEqual({
        currentLine: "",
        nextLine: "- Foo",
        marker: null,
        didContinue: false,
        didEnd: false,
      });
    });
  });

  describe("mergeList", () => {
    const rules = Object.values(continueListRules);

    test("merges the inserted text with the current line", () => {
      expect(mergeList("- ", "- foo", rules)).toStrictEqual({
        currentLine: "- foo",
        marker: "- ",
      });
    });

    test("doesn't merge when the current line has content other than the list marker", () => {
      expect(mergeList("- foo", "- bar", rules)).toBeNull();
    });

    test("doesn't merge when the current line has no list marker", () => {
      expect(mergeList("foo", "- bar", rules)).toBeNull();
    });

    test("doesn't merge when the inserted line has no list marker", () => {
      expect(mergeList("- foo", "bar", rules)).toBeNull();
    });

    test("doesn't merge when the inserted line has a different type of list marker", () => {
      expect(mergeList("- foo", "1. bar", rules)).toBeNull();
    });

    test("merges two different list markers if they're of the same type", () => {
      const rule = {
        pattern: /\t*\[.\] /,

        /** @param {string} match */
        next: (match) => match.replace(/\[.\]/, "[ ]"),
      };

      expect(mergeList("\t[ ] ", "\t[x] bar", [rule])).toEqual({
        currentLine: "\t[x] bar",
        marker: "\t[x] ",
      });
    });
  });

  describe("indent", () => {
    test("indents a line", () => {
      expect(indent(["foo"])).toEqual(["\tfoo"]);
    });

    test("indents multiple lines", () => {
      expect(indent(["foo", "bar"])).toEqual(["\tfoo", "\tbar"]);
    });

    test("outdents a line", () => {
      expect(indent(["\tfoo"], "outdent")).toEqual(["foo"]);
    });

    test("outdents multiple lines", () => {
      expect(indent(["\tfoo", "\tbar"], "outdent")).toEqual(["foo", "bar"]);
    });

    test("outdents a line when the line is not indented", () => {
      expect(indent(["foo"], "outdent")).toEqual(["foo"]);
    });

    test("outdents multiple lines when the lines are not indented", () => {
      expect(indent(["foo", "bar"], "outdent")).toEqual(["foo", "bar"]);
    });

    test("indents a line when the line is already indented", () => {
      expect(indent(["\tfoo"])).toEqual(["\t\tfoo"]);
    });

    test("indents multiple lines when the lines are already indented", () => {
      expect(indent(["\tfoo", "\tbar"])).toEqual(["\t\tfoo", "\t\tbar"]);
    });
  });
});
