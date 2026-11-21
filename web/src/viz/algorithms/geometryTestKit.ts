/**
 * Shared by the geometry tests: a seeded generator and the frame checks every plane tracer
 * must pass (a caption, a pseudocode line in range, unique ids per kind of shape, finite
 * coordinates).
 */
import { expect } from 'vitest';
import type { Frame } from '../core/types';
import type { PlaneState, XY } from '../renderers/PlaneView';

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/**
 * Every frame: a caption, a line in range, unique ids per kind of shape, finite coordinates.
 * Returns one readable line per problem, so a test asserts once per run instead of once per shape.
 */
export function planeFrameProblems(frames: Array<Frame<PlaneState>>, codeLines: number): string[] {
  const out: string[] = [];
  if (frames.length === 0) out.push('no frames');
  for (const f of frames) {
    if (f.caption.length <= 10) out.push(`caption too short at label ${JSON.stringify(f.state.label)}: "${f.caption}"`);
    if (f.line !== undefined && (f.line < 0 || f.line >= codeLines)) out.push(`line ${f.line} outside 0..${codeLines - 1}: ${f.caption}`);
    const s = f.state;
    const groups: Array<[string, Array<{ id: string }>]> = [
      ['points', s.points],
      ['segments', s.segments ?? []],
      ['lines', s.lines ?? []],
      ['polygons', s.polygons ?? []],
      ['circles', s.circles ?? []],
      ['bands', s.bands ?? []],
      ['arcs', s.arcs ?? []],
      ['texts', s.texts ?? []],
    ];
    for (const [kind, g] of groups) {
      const ids = g.map((x) => x.id);
      if (new Set(ids).size !== ids.length) out.push(`repeated ${kind} ids [${ids}]: ${f.caption}`);
    }
    const finite = (p: XY) => Number.isFinite(p[0]) && Number.isFinite(p[1]);
    for (const p of s.points) if (!finite(p.at)) out.push(`point ${p.id} at (${p.at}) is not finite: ${f.caption}`);
    for (const g of s.segments ?? []) if (!(finite(g.a) && finite(g.b))) out.push(`segment ${g.id} has an end that is not finite: ${f.caption}`);
    for (const g of s.polygons ?? []) if (!g.pts.every(finite)) out.push(`polygon ${g.id} has a vertex that is not finite: ${f.caption}`);
  }
  return out;
}

export function expectWellFormedPlane(frames: Array<Frame<PlaneState>>, codeLines: number) {
  expect(planeFrameProblems(frames, codeLines)).toEqual([]);
}

/** toBeCloseTo(expected, digits) as plain code: equal infinities, or a difference under 10^-digits / 2. */
export function closeTo(received: number, expected: number, digits: number): boolean {
  if (received === Infinity && expected === Infinity) return true;
  if (received === -Infinity && expected === -Infinity) return true;
  return Math.abs(expected - received) < 10 ** -digits / 2;
}
