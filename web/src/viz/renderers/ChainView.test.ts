import { describe, expect, it } from 'vitest';
import type { Frame } from '../core/types';
import { stabilizeChain, type ChainState } from './ChainView';

const frame = (state: ChainState): Frame<ChainState> => ({ state, caption: 'step' });

describe('stabilizeChain', () => {
  it('gives every frame the extent of the whole run', () => {
    const frames = [
      frame({ nodes: [{ id: 1, label: 1, col: 0 }], links: [{ from: 1, to: null }] }),
      frame({
        nodes: [
          { id: 1, label: 1, col: 1 },
          { id: 2, label: 'long:label', col: 0, row: 0.8 },
        ],
        links: [
          { from: 2, to: 1 },
          { from: 1, to: null },
        ],
        pointers: [
          { name: 'head', target: 1 },
          { name: 'curr', target: 1 },
          { name: 'new', target: 2, side: 'below' },
        ],
      }),
      frame({ nodes: [], links: [] }),
    ];
    const out = stabilizeChain(frames);
    expect(out).toHaveLength(3);
    const extents = out.map((f) => f.state.extent);
    for (const e of extents) expect(e).toEqual(extents[0]);
    expect(extents[0]).toMatchObject({
      cols: 2,
      minRow: 0,
      maxRow: 0.8,
      chars: 'long:label'.length,
      nullRight: true,
      nullLeft: false,
      linesAbove: 2,
      linesBelow: 1,
      spacious: true,
    });
    // The input frames are left as they were.
    expect(frames[0].state.extent).toBeUndefined();
  });

  it('routes a link back along a row below it, and a skip over a node above it', () => {
    const circular = stabilizeChain([
      frame({
        nodes: [
          { id: 'a', label: 'a', col: 0 },
          { id: 'b', label: 'b', col: 1 },
          { id: 'c', label: 'c', col: 2 },
        ],
        links: [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'c' },
          { from: 'c', to: 'a' },
          { from: 'a', to: 'c', role: 'active' },
        ],
      }),
    ]);
    expect(circular[0].state.extent).toMatchObject({ arcBelow: true, arcAbove: true, spacious: true });
  });

  it('keeps multi-row tables compact when nothing sits between the rows', () => {
    const buckets = stabilizeChain([
      frame({
        nodes: [
          { id: 'b0', label: '', col: 0, row: 0, shape: 'slot' },
          { id: 'b1', label: '', col: 0, row: 1, shape: 'slot' },
          { id: 'k', label: '8:a', col: 1, row: 1 },
        ],
        links: [{ from: 'b1', to: 'k' }],
        lanes: [
          { row: 0, label: 'bucket 0' },
          { row: 1, label: 'bucket 1' },
        ],
      }),
    ]);
    expect(buckets[0].state.extent).toMatchObject({ lanes: true, spacious: false, maxRow: 1 });
  });
});
