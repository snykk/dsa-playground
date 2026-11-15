import { describe, expect, it } from 'vitest';
import type { Frame } from '../core/types';
import { boundsOf, stabilizePlane, type PlaneState } from './PlaneView';

describe('PlaneView bounds', () => {
  it('pads the data box onto whole numbers and keeps at least 4 units each way', () => {
    expect(boundsOf([])).toEqual({ x0: -1, y0: -1, x1: 5, y1: 5 });
    expect(boundsOf([[2, 3]])).toEqual({ x0: 0, y0: 1, x1: 4, y1: 5 });
    const b = boundsOf([
      [0, 0],
      [100, 50],
    ]);
    expect([b.x0, b.y0, b.x1, b.y1]).toEqual([-8, -8, 108, 58]);
  });

  it('gives every frame of a run the same bounds, from everything any frame draws', () => {
    const frame = (s: Partial<PlaneState>): Frame<PlaneState> => ({ caption: 'step', state: { label: 'test', points: [], ...s } });
    const frames = stabilizePlane([
      frame({ points: [{ id: 'a', at: [0, 0] }] }),
      frame({ circles: [{ id: 'c', c: [10, 10], r: 3 }] }),
      frame({ segments: [{ id: 's', a: [-4, 2], b: [1, 1] }], lines: [{ id: 'l', at: [5, 5], dir: [1, 0] }] }),
    ]);
    const all = frames.map((f) => f.state.bounds);
    expect(new Set(all.map((b) => JSON.stringify(b))).size).toBe(1);
    expect(all[0]).toEqual({ x0: -6, y0: -2, x1: 15, y1: 15 });
  });
});
