/**
 * Helpers shared by the backtracking tracers (nQueens.ts, sudoku.ts, ratInMaze.ts,
 * graphColoring.ts): the step budget of a run and the grid reader.
 *
 * A search can take far more steps than a reader can follow, so every parser first counts the
 * steps of its input with the tracer in counting mode (no pictures are built) and refuses an
 * input that needs more than MAX_FRAMES, saying how many it would need.
 */
import { InputError } from '../core/types';

/** The most steps one run may have. */
export const MAX_FRAMES = 2000;

/** A counting run stops here, so a huge search cannot freeze the page while it is counted. */
export const COUNT_CEILING = 60000;

/** Thrown by a counting run that passes COUNT_CEILING. */
export class StepCeiling extends Error {}

/** Counts the steps of a run in counting mode. */
export class StepCounter {
  count = 0;
  constructor(readonly ceiling = COUNT_CEILING) {}
  tick() {
    this.count += 1;
    if (this.count > this.ceiling) throw new StepCeiling();
  }
}

/** Run a tracer in counting mode: the number of steps, or Infinity past the ceiling. */
export function countSteps(run: (counter: StepCounter) => void): number {
  const counter = new StepCounter();
  try {
    run(counter);
  } catch (e) {
    if (e instanceof StepCeiling) return Infinity;
    throw e;
  }
  return counter.count;
}

/** 4688 -> "4,688". */
export function commas(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** The friendly error for an input whose run is too long to watch. */
export function tooLong(steps: number, what: string, hint: string): InputError {
  const size = Number.isFinite(steps) ? `${commas(steps)} steps` : `more than ${commas(COUNT_CEILING)} steps`;
  return new InputError(`${what} takes ${size}, more than the ${commas(MAX_FRAMES)} the player shows. ${hint}`);
}

/**
 * Rows of single-character cells: "1000/1101/0101" or "1000 1101 0101". Rows are separated by
 * slashes, commas, semicolons, bars or spaces; `cell` maps a character to its value or
 * undefined when the character is not allowed.
 */
export function parseRows<T>(text: string, cell: (ch: string) => T | undefined, describe: string): T[][] {
  const rows = text
    .split(/[\s/,;|]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return rows.map((row) =>
    [...row].map((ch) => {
      const v = cell(ch);
      if (v === undefined) throw new InputError(`"${ch}" in "${row}" is not ${describe}.`);
      return v;
    }),
  );
}
