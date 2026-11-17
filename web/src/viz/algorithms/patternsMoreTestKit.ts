/**
 * Shared helpers for the tests of the second problem-pattern set (meet in the middle, bit
 * manipulation, DP patterns, coordinate compression, graph traversal problems,
 * inclusion-exclusion): the golden fixture, a seeded generator and frame checks.
 */
import { readFileSync } from 'node:fs';
import { expect } from 'vitest';
import type { Frame } from '../core/types';
import type { PatternLanesState } from '../renderers/PatternLanes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FIXTURES: Record<string, any[]> = JSON.parse(readFileSync(new URL('./__fixtures__/patternsMore.json', import.meta.url), 'utf8'));

/** A small linear congruential generator: the same random cases on every run. */
export function rng(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  return Object.assign(next, {
    int: (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: <T>(xs: readonly T[]): T => xs[Math.floor(next() * xs.length)],
  });
}

/**
 * Every frame: a caption, a line inside the pseudocode, and vars that are pairs. The checks run in
 * plain code and collect every problem, so one expect covers a whole run (an expect per cell made
 * the random-input tests slow under load).
 */
export function framesProblems<S>(frames: Array<Frame<S>>, codeLines: number): string[] {
  const problems: string[] = [];
  if (frames.length === 0) problems.push('no frames');
  for (const f of frames) {
    if (!(f.caption.length > 10)) problems.push(`caption too short: "${f.caption}"`);
    if (f.line !== undefined && !(f.line >= 0 && f.line < codeLines)) problems.push(`${f.caption}: line ${f.line} outside 0..${codeLines - 1}`);
    for (const v of f.vars ?? []) if (v.length !== 2) problems.push(`${f.caption}: a var that is not a pair`);
  }
  return problems;
}

export function expectFramesWellFormed<S>(frames: Array<Frame<S>>, codeLines: number) {
  expect(framesProblems(frames, codeLines)).toEqual([]);
}

/** PatternLanes frames: unique cell ids, cells in a lane that exists, arrows and markers that point at cells. */
export function expectLanesWellFormed(frames: Array<Frame<PatternLanesState>>, codeLines: number) {
  const problems = framesProblems(frames, codeLines);
  for (const f of frames) {
    const lanes = f.state.lanes.length;
    const ids = new Set<string>();
    const slots = new Set<string>();
    for (const c of f.state.cells) {
      if (ids.has(c.id)) problems.push(`${f.caption}: two cells with id ${c.id}`);
      ids.add(c.id);
      if (!(c.lane < lanes)) problems.push(`${f.caption}: cell ${c.id} in lane ${c.lane} of ${lanes}`);
      if (!(c.col >= 0)) problems.push(`${f.caption}: cell ${c.id} at column ${c.col}`);
      const slot = `${c.lane}:${c.col}`;
      if (slots.has(slot)) problems.push(`${f.caption}: two cells at ${slot}`);
      slots.add(slot);
    }
    for (const a of f.state.arrows ?? []) {
      if (!ids.has(a.from) || !ids.has(a.to)) problems.push(`${f.caption}: arrow ${a.from} -> ${a.to} to a missing cell`);
    }
    for (const m of f.state.markers ?? []) if (!(m.lane < lanes)) problems.push(`${f.caption}: marker in lane ${m.lane} of ${lanes}`);
  }
  expect(problems).toEqual([]);
}
