import type { ReactNode } from 'react';

/**
 * Visual roles. Colors come from the validated palette (see global.css):
 * idle = neutral, compare = blue, active = orange, done = aqua,
 * good/bad = status green/red and are always paired with a check/cross glyph.
 */
export type Role = 'idle' | 'compare' | 'active' | 'done' | 'good' | 'bad' | 'muted';

/** One step of an algorithm: a full snapshot, so stepping backwards is just an index change. */
export interface Frame<S> {
  state: S;
  /** 0-based index into the spec's pseudocode, if a line is executing. */
  line?: number;
  /** Plain-language explanation of what just happened and why. */
  caption: string;
  /** Variables worth watching at this step. */
  vars?: Array<[string, string | number]>;
}

export interface Example {
  label: string;
  value: string;
}

export interface VizSpec<I, S> {
  id: string;
  title: string;
  /** Specs with the same inputKind share the input box when the user switches tabs. */
  inputKind: string;
  inputLabel: string;
  inputHelp: string;
  examples: Example[];
  randomInput(): string;
  /** Parse user text; throw InputError with a friendly message on bad input. */
  parse(text: string): I;
  trace(input: I): Array<Frame<S>>;
  render(state: S): ReactNode;
  pseudocode: string[];
  legend: Array<{ role: Role; label: string }>;
  complexity: { time: string; space: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyVizSpec = VizSpec<any, any>;

/** Error whose message is shown to the user as-is. */
export class InputError extends Error {}

/** Parse a list of integers ("5, 3 8,-2") with bounds; used by several specs. */
export function parseIntList(
  text: string,
  { min = 1, max = 32, lo = -999, hi = 999, what = 'values' } = {},
): number[] {
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  if (tokens.length < min || tokens.length > max) {
    throw new InputError(`Enter between ${min} and ${max} ${what} (got ${tokens.length}).`);
  }
  return tokens.map((t) => {
    if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number.`);
    const v = Number(t);
    if (v < lo || v > hi) throw new InputError(`${t} is outside the supported range ${lo}..${hi}.`);
    return v;
  });
}

export function randomInts(count: number, lo: number, hi: number): number[] {
  return Array.from({ length: count }, () => lo + Math.floor(Math.random() * (hi - lo + 1)));
}
