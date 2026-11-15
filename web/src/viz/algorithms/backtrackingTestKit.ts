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

function expectCaptionAndLine(f: Frame<unknown>, codeLines: number) {
  expect(f.caption.length).toBeGreaterThan(10);
  if (f.line !== undefined) {
    expect(f.line).toBeGreaterThanOrEqual(0);
    expect(f.line).toBeLessThan(codeLines);
  }
  for (const [name, value] of f.vars ?? []) {
    expect(name.length).toBeGreaterThan(0);
    expect(String(value).length).toBeGreaterThan(0);
  }
}

/**
 * Every frame: a caption and a line in range, a board of rows x cols, a cursor, bands, rays and a
 * path on the board (an arrow may point off it), a non-empty text for every open call, and a
 * picture that differs from the step before (a step never changes only the text).
 */
export function expectBoardFrames(frames: Array<Frame<BoardState>>, codeLines: number) {
  let previous = '';
  for (const f of frames) {
    expectCaptionAndLine(f, codeLines);
    const s = f.state;
    const on = (r: number, c: number) => r >= 0 && r < s.rows && c >= 0 && c < s.cols;
    expect(s.cells.length).toBe(s.rows);
    for (const row of s.cells) expect(row.length).toBe(s.cols);
    if (s.cursor) expect(on(s.cursor.r, s.cursor.c), f.caption).toBe(true);
    for (const b of s.bands ?? []) expect(on(b.r0, b.c0) && on(b.r1, b.c1) && b.r0 <= b.r1 && b.c0 <= b.c1, f.caption).toBe(true);
    for (const l of s.lines ?? []) {
      expect(on(...l.from), f.caption).toBe(true);
      if (!l.arrow) expect(on(...l.to), f.caption).toBe(true);
      else expect(Math.abs(l.to[0] - l.from[0]) + Math.abs(l.to[1] - l.from[1])).toBe(1);
    }
    for (const [r, c] of s.path ?? []) expect(on(r, c)).toBe(true);
    for (const it of s.stack) expect(it.text.length).toBeGreaterThan(0);
    const picture = JSON.stringify(s);
    expect(picture, `the picture did not change at "${f.caption}"`).not.toBe(previous);
    previous = picture;
  }
}

/** Every frame: a caption and a line in range, unique vertex ids, edges between drawn vertices, a changing picture. */
export function expectGraphFrames(frames: Array<Frame<GraphState>>, codeLines: number) {
  let previous = '';
  for (const f of frames) {
    expectCaptionAndLine(f, codeLines);
    const ids = f.state.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    const drawn = new Set(ids);
    for (const e of f.state.edges) {
      expect(drawn.has(e.from) && drawn.has(e.to), f.caption).toBe(true);
    }
    const edgeIds = f.state.edges.map((e) => e.id);
    expect(new Set(edgeIds).size).toBe(edgeIds.length);
    const picture = JSON.stringify(f.state);
    expect(picture, `the picture did not change at "${f.caption}"`).not.toBe(previous);
    previous = picture;
  }
}
