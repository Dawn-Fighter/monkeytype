import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getInputElementValue,
  setInputElementValue,
} from "../../../src/ts/input/input-element";
import { onInsertText } from "../../../src/ts/input/handlers/insert-text";
import {
  getMatchingLigatureOverride,
  shouldIgnoreLigatureCompletion,
} from "../../../src/ts/input/helpers/ligatures";

const mocks = vi.hoisted(() => ({
  currentWord: "",
  input: {
    current: "",
    syncWithInputElement: vi.fn(),
  },
}));

vi.mock("../../../src/ts/test/test-ui", () => ({}));
vi.mock("../../../src/ts/test/test-state", () => ({
  activeWordIndex: 0,
  isActive: true,
}));
vi.mock("../../../src/ts/test/test-logic", () => ({
  startTest: vi.fn(),
}));
vi.mock("../../../src/ts/test/test-input", () => ({
  input: mocks.input,
  corrected: { update: vi.fn() },
  incrementAccuracy: vi.fn(),
  incrementKeypressCount: vi.fn(),
  incrementKeypressErrors: vi.fn(),
  pushKeypressWord: vi.fn(),
  pushMissedWord: vi.fn(),
  setBurstStart: vi.fn(),
  setCurrentNotAfk: vi.fn(),
}));
vi.mock("../../../src/ts/test/test-words", () => ({
  words: {
    getCurrentText: vi.fn(() => mocks.currentWord),
  },
}));
vi.mock("../../../src/ts/input/helpers/fail-or-finish", () => ({
  checkIfFailedDueToDifficulty: vi.fn(),
  checkIfFailedDueToMinBurst: vi.fn(),
  checkIfFinished: vi.fn(),
}));
vi.mock("../../../src/ts/test/funbox/list", () => ({
  findSingleActiveFunboxWithFunction: vi.fn(),
  isFunboxActiveWithProperty: vi.fn(() => false),
}));
vi.mock("../../../src/ts/test/replay", () => ({
  addReplayEvent: vi.fn(),
}));
vi.mock("../../../src/ts/config/store", () => ({
  Config: {
    blindMode: false,
    keymapMode: "off",
    language: "english",
    mode: "words",
    oppositeShiftMode: "off",
    stopOnError: "off",
  },
}));
vi.mock("../../../src/ts/events/keymap", () => ({
  flash: vi.fn(),
}));
vi.mock("../../../src/ts/test/weak-spot", () => ({
  updateScore: vi.fn(),
}));
vi.mock("../../../src/ts/legacy-states/composition", () => ({
  getData: vi.fn(() => ""),
}));
vi.mock("../../../src/ts/input/state", () => ({
  getIncorrectShiftsInARow: vi.fn(() => 0),
  incrementIncorrectShiftsInARow: vi.fn(),
  isCorrectShiftUsed: vi.fn(() => true),
  resetIncorrectShiftsInARow: vi.fn(),
}));
vi.mock("../../../src/ts/states/notifications", () => ({
  showNoticeNotification: vi.fn(),
}));
vi.mock("../../../src/ts/input/helpers/word-navigation", () => ({
  goToNextWord: vi.fn(async () => ({
    increasedWordIndex: false,
    lastBurst: null,
  })),
}));
vi.mock("../../../src/ts/input/handlers/before-insert-text", () => ({
  onBeforeInsertText: vi.fn(),
}));

describe("insert-text ligature input overrides", () => {
  beforeEach(() => {
    mocks.currentWord = "";
    mocks.input.current = "";
    mocks.input.syncWithInputElement.mockImplementation(() => {
      mocks.input.current = getInputElementValue().inputValue;
    });
    setInputElementValue("");
  });

  afterEach(() => {
    vi.clearAllMocks();
    setInputElementValue("");
  });

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
    ["e", "bœ", "bœuf"],
  ])("ignores completion '%s' after '%s'", (data, input, word) => {
    expect(shouldIgnoreLigatureCompletion(data, input, word)).toBe(true);
  });

  it("does not normalize unrelated input", () => {
    expect(getMatchingLigatureOverride("e", "œ")).toBeNull();
    expect(shouldIgnoreLigatureCompletion("u", "œ", "œuvre")).toBe(false);
  });

  it("removes the completion character and keeps input state synced", async () => {
    mocks.currentWord = "œuvre";
    mocks.input.current = "œ";
    setInputElementValue("œe");

    await onInsertText({
      now: performance.now(),
      data: "e",
    });

    expect(getInputElementValue().inputValue).toBe("œ");
    expect(mocks.input.current).toBe("œ");
    expect(mocks.input.syncWithInputElement).toHaveBeenCalledOnce();
  });
});
