import { describe, expect, it } from 'vitest';
import type { Frame } from '../core/types';
import { heapDepth, heapGeometry, heapParent, stabilizeHeap, type HeapState } from './HeapView';

const frame = (state: HeapState): Frame<HeapState> => ({ state, caption: 'step' });
const node = (id: number) => ({ id, label: id });

describe('HeapView layout', () => {
  it('maps array indices to a complete binary tree', () => {
    expect([0, 1, 2, 3, 6, 7, 14].map(heapDepth)).toEqual([0, 1, 1, 2, 2, 3, 3]);
    expect([1, 2, 3, 4, 5, 6].map(heapParent)).toEqual([0, 0, 1, 1, 2, 2]);
    const g = heapGeometry({ slots: 10, markerLines: 0, subs: true });
    for (let i = 1; i < 10; i++) {
      const p = g.node(heapParent(i));
      const c = g.node(i);
      expect(c.y).toBeGreaterThan(p.y);
      // A left child (odd index) sits left of its parent, a right child right of it.
      expect(i % 2 === 1 ? c.x < p.x : c.x > p.x).toBe(true);
    }
    // Leaves never overlap, and the corner spots stay clear of the root.
    expect(g.node(8).x - g.node(7).x).toBeGreaterThanOrEqual(50);
    expect(Math.abs(g.corner('right').x - g.node(0).x)).toBeGreaterThan(80);
    expect(g.cell(1).x - g.cell(0).x).toBe(44);
    expect(g.width).toBeGreaterThanOrEqual(g.cell(9).x + 40);
  });

  it('gives every frame the extent of the whole run', () => {
    const frames = [
      frame({ slots: [node(1)] }),
      frame({ slots: [node(1), node(2), { id: 3, label: 3, sub: 'x' }], markers: [{ index: 2, name: 'i' }, { index: 2, name: 'child' }] }),
      frame({ slots: [] }),
    ];
    const out = stabilizeHeap(frames);
    for (const f of out) expect(f.state.extent).toEqual({ slots: 3, markerLines: 2, subs: true });
    expect(frames[0].state.extent).toBeUndefined();
  });
});
