/**
 * UI symbols built from code points, so every source file stays ASCII-only
 * (a repository rule) without escape sequences scattered through the code.
 */
const cp = (code: number) => String.fromCodePoint(code);

export const SYM = {
  check: cp(0x2713),
  cross: cp(0x2715),
  times: cp(0xd7),
  middot: cp(0xb7),
  ellipsis: cp(0x2026),
  infinity: cp(0x221e),
  rightArrow: cp(0x2192),
  leftArrow: cp(0x2190),
  emptySet: cp(0x2205),
  openBox: cp(0x2423),
  squared: cp(0xb2),
} as const;
