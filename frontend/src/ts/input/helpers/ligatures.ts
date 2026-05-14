const ligatureInputOverrides = new Map<string, string>([
  ["œ", "oe"],
  ["Œ", "OE"],
  ["æ", "ae"],
  ["Æ", "AE"],
]);

export function getMatchingLigatureOverride(
  data: string,
  targetChar: string | undefined,
): string | null {
  if (targetChar === undefined) return null;

  const override = ligatureInputOverrides.get(targetChar);
  if (override?.[0] !== data) return null;

  return targetChar;
}

export function shouldIgnoreLigatureCompletion(
  data: string,
  testInput: string,
  currentWord: string,
): boolean {
  const previousTargetChar = currentWord[testInput.length - 1];
  if (previousTargetChar === undefined) return false;

  const override = ligatureInputOverrides.get(previousTargetChar);
  if (override === undefined) return false;

  return testInput.endsWith(previousTargetChar) && data === override.slice(1);
}
