/** Test helpers shared by the backtracking tracer tests (not a test file itself). */
import { readFileSync } from 'node:fs';
import { expect } from 'vitest';
import type { Frame } from '../core/types';
import type { BoardState } from '../renderers/BoardView';
import type { GraphState } from '../renderers/GraphView';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fixtures: Record<string, any[]> = JSON.parse(readFileSync(new URL('./__fixtures__/backtracking.json', import.meta.url), 'utf8'));

/** A small seeded generator, so every random case is the same on every run. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** What is wrong with a frame's caption, pseudocode line and variables, as readable lines. */
function captionAndLineProblems(f: Frame<unknown>, codeLines: number): string[] {
  const out: string[] = [];
  if (f.caption.length <= 10) out.push(`caption of ${f.caption.length} characters, want more than 10: "${f.caption}"`);
  if (f.line !== undefined && (f.line < 0 || f.line >= codeLines)) out.push(`line ${f.line} outside 0..${codeLines - 1}: ${f.caption}`);
  for (const [name, value] of f.vars ?? []) {
    if (name.length === 0) out.push(`a variable with an empty name: ${f.caption}`);
    if (String(value).length === 0) out.push(`variable ${name} shows an empty value: ${f.caption}`);
  }
  return out;
}

/**
 * Every frame: a caption and a line in range, a board of rows x cols, a cursor, bands, rays and a
 * path on the board (an arrow may point off it), a non-empty text for every open call, and a
 * picture that differs from the step before (a step never changes only the text). Returns one
 * readable line per problem, so a test asserts once per run instead of once per cell.
 */
export function boardFrameProblems(frames: Array<Frame<BoardState>>, codeLines: number): string[] {
  const out: string[] = [];
  let previous = '';
  for (const f of frames) {
    out.push(...captionAndLineProblems(f, codeLines));
    const s = f.state;
    const on = (r: number, c: number) => r >= 0 && r < s.rows && c >= 0 && c < s.cols;
    if (s.cells.length !== s.rows) out.push(`${s.cells.length} rows of cells, want ${s.rows}: ${f.caption}`);
    s.cells.forEach((row, r) => {
      if (row.length !== s.cols) out.push(`row ${r} has ${row.length} cells, want ${s.cols}: ${f.caption}`);
    });
    if (s.cursor && !on(s.cursor.r, s.cursor.c)) out.push(`cursor (${s.cursor.r}, ${s.cursor.c}) off the board: ${f.caption}`);
    for (const b of s.bands ?? []) {
      if (!(on(b.r0, b.c0) && on(b.r1, b.c1) && b.r0 <= b.r1 && b.c0 <= b.c1)) out.push(`band (${b.r0}, ${b.c0})-(${b.r1}, ${b.c1}) off the board or reversed: ${f.caption}`);
    }
    for (const l of s.lines ?? []) {
      if (!on(...l.from)) out.push(`line from (${l.from}) off the board: ${f.caption}`);
      if (!l.arrow && !on(...l.to)) out.push(`line to (${l.to}) off the board: ${f.caption}`);
      if (l.arrow && Math.abs(l.to[0] - l.from[0]) + Math.abs(l.to[1] - l.from[1]) !== 1) out.push(`arrow (${l.from}) -> (${l.to}) is not one step long: ${f.caption}`);
    }
    for (const [r, c] of s.path ?? []) if (!on(r, c)) out.push(`path cell (${r}, ${c}) off the board: ${f.caption}`);
    s.stack.forEach((item, i) => {
      if (item.text.length === 0) out.push(`stack entry ${i} has no text: ${f.caption}`);
    });
    const picture = JSON.stringify(s);
    if (picture === previous) out.push(`the picture did not change at "${f.caption}"`);
    previous = picture;
  }
  return out;
}

export function expectBoardFrames(frames: Array<Frame<BoardState>>, codeLines: number) {
  expect(boardFrameProblems(frames, codeLines)).toEqual([]);
}

/** Every frame: a caption and a line in range, unique vertex ids, edges between drawn vertices, a changing picture. */
export function graphFrameProblems(frames: Array<Frame<GraphState>>, codeLines: number): string[] {
  const out: string[] = [];
  let previous = '';
  for (const f of frames) {
    out.push(...captionAndLineProblems(f, codeLines));
    const ids = f.state.nodes.map((n) => n.id);
    if (new Set(ids).size !== ids.length) out.push(`repeated vertex ids [${ids}]: ${f.caption}`);
    const drawn = new Set(ids);
    for (const e of f.state.edges) {
      if (!(drawn.has(e.from) && drawn.has(e.to))) out.push(`edge ${e.id} (${e.from} -> ${e.to}) has an end that is not drawn: ${f.caption}`);
    }
    const edgeIds = f.state.edges.map((e) => e.id);
    if (new Set(edgeIds).size !== edgeIds.length) out.push(`repeated edge ids [${edgeIds}]: ${f.caption}`);
    const picture = JSON.stringify(f.state);
    if (picture === previous) out.push(`the picture did not change at "${f.caption}"`);
    previous = picture;
  }
  return out;
}

export function expectGraphFrames(frames: Array<Frame<GraphState>>, codeLines: number) {
  expect(graphFrameProblems(frames, codeLines)).toEqual([]);
}
