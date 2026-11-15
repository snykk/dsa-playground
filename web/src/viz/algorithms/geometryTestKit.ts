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

/** Every frame: a caption, a line in range, unique ids per kind of shape, finite coordinates. */
export function expectWellFormedPlane(frames: Array<Frame<PlaneState>>, codeLines: number) {
  expect(frames.length).toBeGreaterThan(0);
  for (const f of frames) {
    expect(f.caption.length, JSON.stringify(f.state.label)).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
    const s = f.state;
    const groups: Array<Array<{ id: string }>> = [s.points, s.segments ?? [], s.lines ?? [], s.polygons ?? [], s.circles ?? [], s.bands ?? [], s.arcs ?? [], s.texts ?? []];
    for (const g of groups) {
      const ids = g.map((x) => x.id);
      expect(new Set(ids).size, f.caption).toBe(ids.length);
    }
    const finite = (p: XY) => Number.isFinite(p[0]) && Number.isFinite(p[1]);
    for (const p of s.points) expect(finite(p.at), f.caption).toBe(true);
    for (const g of s.segments ?? []) expect(finite(g.a) && finite(g.b), f.caption).toBe(true);
    for (const g of s.polygons ?? []) expect(g.pts.every(finite), f.caption).toBe(true);
  }
}
