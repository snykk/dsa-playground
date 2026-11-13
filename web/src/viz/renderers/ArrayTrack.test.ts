import { describe, expect, it } from 'vitest';
import type { Frame } from '../core/types';
import { layoutPointerLabels, stabilizeTrack, type ArrayTrackState } from './ArrayTrack';

const frame = (state: ArrayTrackState): Frame<ArrayTrackState> => ({ state, caption: 'step' });

describe('ArrayTrack', () => {
  it('gives every frame the extent of the whole run', () => {
    const frames = [
      frame({ blocks: [], items: [], pointers: [{ name: 'top', slot: -1 }] }),
      frame({
        blocks: [
          { id: 1, row: 0, slots: 4 },
          { id: 2, row: 1, slots: 8 },
        ],
        items: [{ id: 'a', value: 1, slot: 0, row: 1 }],
      }),
      frame({ blocks: [{ id: 2, row: 0, slots: 8 }], items: [{ id: 'b', value: 2, slot: 4, row: -1 }] }),
    ];
    const out = stabilizeTrack(frames);
    for (const f of out) expect(f.state.extent).toEqual({ slots: 8, parking: true, lifted: true, second: true, labels: false, pointerLines: 1 });
    expect(frames[1].state.extent).toBeUndefined();
  });

  it('stacks labels that share a slot and staggers long labels on neighbouring slots', () => {
    const lines = (names: Array<[string, number]>) => layoutPointerLabels(names.map(([name, slot]) => ({ name, slot }))).map((q) => [q.line, q.arrow]);
    expect(lines([['top', 2], ['len', 3]])).toEqual([
      [0, true],
      [0, true],
    ]);
    expect(lines([['front', 0], ['back', 1]])).toEqual([
      [0, true],
      [1, true],
    ]);
    expect(lines([['front', 0], ['back', 0]])).toEqual([
      [0, true],
      [1, false],
    ]);
    expect(lines([['front', 0], ['back', 4]])).toEqual([
      [0, true],
      [0, true],
    ]);
  });
});
