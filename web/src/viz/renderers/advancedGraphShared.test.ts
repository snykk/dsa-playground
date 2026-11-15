import { describe, expect, it } from 'vitest';
import type { Frame } from '../core/types';
import { edgeShapes, stabilizeStrips, stripCells, type Pt, type ReservedStrip } from './advancedGraphShared';

const control = (d: string) => {
  const m = d.match(/Q([-\d.]+),([-\d.]+)/);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
};

describe('edgeShapes', () => {
  const pos = new Map<string, Pt>([
    ['a', { x: 100, y: 100 }],
    ['b', { x: 300, y: 100 }],
    ['c', { x: 500, y: 100 }],
    ['d', { x: 300, y: 300 }],
  ]);

  it('draws a lone edge with nothing in its way as a straight line', () => {
    const s = edgeShapes([{ id: 'e', from: 'a', to: 'd' }], pos, 20);
    expect(s.get('e')!.d).toMatch(/^M[-\d.]+,[-\d.]+ L/);
    expect(s.get('e')!.bend).toBe(0);
  });

  it('bends anti-parallel and parallel edges to different sides', () => {
    const s = edgeShapes(
      [
        { id: 'ab', from: 'a', to: 'b' },
        { id: 'ba', from: 'b', to: 'a' },
        { id: 'ab2', from: 'a', to: 'b' },
      ],
      pos,
      20,
    );
    const ys = ['ab', 'ba', 'ab2'].map((id) => control(s.get(id)!.d)?.y ?? 100);
    expect(new Set(ys).size).toBe(3);
    expect(ys[0]).toBeLessThan(ys[1]);
  });

  it('bends an edge around a vertex in its way, away from the center', () => {
    const s = edgeShapes([{ id: 'ac', from: 'a', to: 'c' }], pos, 20, { center: { x: 300, y: 200 } });
    const c = control(s.get('ac')!.d)!;
    // b sits on the line a -> c, the center is below it: the curve goes over the top of b.
    expect(c.y).toBeLessThanOrEqual(100 - 2 * 32);
  });

  it('draws a self-loop as a closed curve pointing the given way', () => {
    const s = edgeShapes([{ id: 'loop', from: 'a', to: 'a' }], pos, 20, { loopAngle: () => Math.PI / 2 });
    expect(s.get('loop')!.d).toMatch(/^M[-\d.]+,[-\d.]+ C/);
    expect(s.get('loop')!.label.y).toBeGreaterThan(100 + 20);
  });
});

describe('stabilizeStrips', () => {
  const frame = (strips: ReservedStrip[]): Frame<{ strips: ReservedStrip[] }> => ({ caption: 'step', state: { strips } });
  const s = (label: string, ...texts: string[]): ReservedStrip => ({ label, items: texts.map((text) => ({ text })) });

  it('reserves the items a growing list still gets, and pads any other list to its largest size', () => {
    const frames = stabilizeStrips([
      frame([s('Paths', 'p1'), s('Stack', 'a')]),
      frame([s('Paths', 'p1', 'p2'), s('Stack', 'a', 'bcd', 'e')]),
      frame([s('Paths', 'p1', 'p2', 'p3'), s('Stack')]),
    ]);
    expect(frames.map((f) => f.state.strips[0].reserve)).toEqual([['p2', 'p3'], ['p3'], []]);
    expect(frames.map((f) => f.state.strips[1].reserve)).toEqual([['bcd', 'bcd'], [], ['bcd', 'bcd', 'bcd']]);
    expect(frames.map((f) => f.state.strips[1].slot)).toEqual(['bcd', 'bcd', 'bcd']);
    expect(frames[0].state.strips[0].slot).toBeUndefined();
  });

  it('gives every frame the same number of places, the placeholder sharing the first one', () => {
    const e = (...texts: string[]) => ({ ...s('Stack', ...texts), empty: '(empty)' });
    const growing = stabilizeStrips([frame([e()]), frame([e('a', 'b')])]).map((f) => stripCells(f.state.strips[0]));
    expect(growing.map((c) => c.length)).toEqual([2, 2]);
    expect(growing[0]).toEqual([
      { visible: { text: '(empty)' }, ghosts: ['a', '(empty)'] },
      { visible: undefined, ghosts: ['b'] },
    ]);
    expect(growing[1][0]).toEqual({ visible: { text: 'a' }, ghosts: ['(empty)'] });
    const free = stabilizeStrips([frame([e('a', 'b')]), frame([e()]), frame([e('c')])]).map((f) => stripCells(f.state.strips[0]));
    expect(free.map((c) => c.length)).toEqual([2, 2, 2]);
    expect(free[1][0]).toEqual({ visible: { text: '(empty)' }, ghosts: ['a', 'a', '(empty)'] });
    expect(free[2]).toEqual([
      { visible: { text: 'c' }, ghosts: ['a', '(empty)'] },
      { visible: undefined, ghosts: ['a', 'a'] },
    ]);
  });
});
