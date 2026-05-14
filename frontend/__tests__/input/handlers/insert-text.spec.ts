import { describe, expect, it } from "vitest";
import {
  getMatchingLigatureOverride,
  shouldIgnoreLigatureCompletion,
} from "../../../src/ts/input/helpers/ligatures";

describe("insert-text ligature input overrides", () => {
  it.each([
    ["o", "œ", "œ"],
    ["O", "Œ", "Œ"],
    ["a", "æ", "æ"],
    ["A", "Æ", "Æ"],
  ])(
    "normalizes '%s' to '%s' when target is '%s'",
    (data, target, expected) => {
      expect(getMatchingLigatureOverride(data, target)).toBe(expected);
    },
  );

  it.each([
    ["e", "œ", "œuvre"],
    ["E", "Œ", "ŒUVRE"],
    ["e", "æ", "æther"],
    ["E", "Æ", "ÆTHER"],
  ])("ignores completion '%s' after '%s'", (data, input, word) => {
    expect(shouldIgnoreLigatureCompletion(data, input, word)).toBe(true);
  });

  it("does not normalize unrelated input", () => {
    expect(getMatchingLigatureOverride("e", "œ")).toBeNull();
    expect(shouldIgnoreLigatureCompletion("u", "œ", "œuvre")).toBe(false);
  });
});
