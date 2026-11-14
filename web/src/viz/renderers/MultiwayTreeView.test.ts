import { describe, expect, it } from 'vitest';
import type { Frame } from '../core/types';
import { layoutMultiway, stabilizeMultiway, type MwNode, type MwState } from './MultiwayTreeView';

const frame = (state: MwState): Frame<MwState> => ({ state, caption: 'step' });
const keys = (id: string, labels: number[], children: string[] = []): MwNode => ({
  id,
  keys: labels.map((k) => ({ id: `k${k}`, label: String(k) })),
  children,
});

describe('layoutMultiway', () => {
  it('centers a parent over its children and keeps siblings apart', () => {
    const state: MwState = { nodes: [keys('r', [20, 40], ['a', 'b', 'c']), keys('a', [5, 10]), keys('b', [25, 30, 35]), keys('c', [50])], root: 'r' };
    const l = layoutMultiway(state);
    const [a, b, c, r] = ['a', 'b', 'c', 'r'].map((id) => l.boxes.get(id)!);
    expect([a.depth, b.depth, c.depth, r.depth]).toEqual([1, 1, 1, 0]);
    expect(a.cx + a.w / 2).toBeLessThan(b.cx - b.w / 2);
    expect(b.cx + b.w / 2).toBeLessThan(c.cx - c.w / 2);
    expect(r.cx).toBeCloseTo((a.cx - a.w / 2 + c.cx + c.w / 2) / 2, 0);
    expect(l.rows).toBe(2);
  });

  it('gives a dot node the width of its edge label', () => {
    const dot = (id: string, text: string): MwNode => ({ id, children: [], edge: { text, sub: '[0,9]' } });
    const state: MwState = { nodes: [{ id: 'r', children: ['x', 'y'] }, dot('x', 'abcdefghij$'), dot('y', '$')], root: 'r' };
    const l = layoutMultiway(state);
    const x = l.boxes.get('x')!;
    const y = l.boxes.get('y')!;
    expect(y.cx - x.cx).toBeGreaterThan('abcdefghij$'.length * 3.5);
    expect(l.labelLines).toBe(2);
  });

  it('draws nothing for an empty tree', () => {
    expect(layoutMultiway({ nodes: [], root: null }).boxes.size).toBe(0);
  });
});

describe('stabilizeMultiway', () => {
  it('gives every frame the extent of the whole run, with room for a key hovering over the root', () => {
    const small = frame({ nodes: [keys('r', [1])], root: 'r' });
    const tall = frame({ nodes: [keys('r', [2], ['a', 'b']), keys('a', [1]), keys('b', [3, 4, 5, 6, 7, 8])], root: 'r' });
    const hover = frame({ nodes: [keys('r', [1])], root: 'r', floating: [{ cell: { id: 'p', label: '9' }, anchor: 'r', slot: 1, tag: 'insert' }] });
    const out = stabilizeMultiway([small, tall, hover]);
    const extents = out.map((f) => f.state.extent);
    for (const e of extents) expect(e).toEqual(extents[0]);
    const alone = stabilizeMultiway([small])[0].state.extent!;
    expect(extents[0]!.rows).toBe(2);
    expect(extents[0]!.top).toBeGreaterThan(alone.top);
    expect(extents[0]!.width).toBeGreaterThanOrEqual(alone.width);
  });
});
