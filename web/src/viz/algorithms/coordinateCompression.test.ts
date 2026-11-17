import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeLanes } from '../renderers/PatternLanes';
import {
  COMPRESS_2D_CODE,
  COMPRESS_CODE,
  compress2dTrace,
  compressCoordinates,
  compressTrace,
  decompressCoordinates,
  parseCompress,
  parsePoints,
} from './coordinateCompression';
import { expectFramesWellFormed, expectLanesWellFormed, FIXTURES, rng } from './patternsMoreTestKit';

describe('compressTrace (compress_coordinates, decompress_coordinates)', () => {
  it('reproduces every golden mapping (in dict order), rank list and decompressed list', () => {
    const cases = FIXTURES.compress as Array<{ coords: number[]; mapping: Array<[number, number]>; ranks: number[]; decompressed: number[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = compressTrace(c.coords);
      expect(run.mapping, JSON.stringify(c.coords)).toEqual(c.mapping);
      expect(run.ranks).toEqual(c.ranks);
      expect(run.decompressed).toEqual(c.decompressed);
    }
  });

  it('keeps order on random values: a < b exactly when rank(a) < rank(b), ranks are 0..k-1', () => {
    const r = rng(61);
    for (let t = 0; t < 200; t++) {
      const span = r.pick([3, 50, 1e9]);
      const coords = Array.from({ length: r.int(0, 12) }, () => r.int(-span, span));
      const run = compressTrace(coords);
      const k = new Set(coords).size;
      expect(new Set(run.ranks).size).toBe(k);
      for (const rank of run.ranks) expect(rank >= 0 && rank < k).toBe(true);
      coords.forEach((a, i) =>
        coords.forEach((b, j) => {
          expect(a < b).toBe(run.ranks[i] < run.ranks[j]);
          expect(a === b).toBe(run.ranks[i] === run.ranks[j]);
        }),
      );
      expect(run.decompressed.map((v, rank) => run.ranks[coords.indexOf(v)] === rank).every(Boolean)).toBe(true);
      expectLanesWellFormed(stabilizeLanes(run.frames), COMPRESS_CODE.length);
    }
  });

  it('glides the first copy of each value down into its rank slot', () => {
    const run = compressTrace(parseCompress('1000, 5, 200, 1000, 5, 50'));
    const sortedFrame = run.frames.find((f) => f.caption.startsWith('sorted()'))!;
    const lane1 = sortedFrame.state.cells.filter((c) => c.lane === 1);
    expect(lane1.map((c) => [c.id, c.text])).toEqual([
      ['v1', '5'],
      ['v5', '50'],
      ['v2', '200'],
      ['v0', '1000'],
    ]);
    const setFrame = run.frames[1].state.cells.filter((c) => c.ghost).map((c) => c.col);
    expect(setFrame).toEqual([3, 4]);
    expect(run.ranks).toEqual([3, 0, 2, 3, 0, 1]);
  });

  it('handles an empty list', () => {
    const run = compressTrace([]);
    expect(run.mapping).toEqual([]);
    expect(run.decompressed).toEqual([]);
    expectLanesWellFormed(stabilizeLanes(run.frames), COMPRESS_CODE.length);
  });
});

describe('compress2dTrace (compress_2d_coordinates)', () => {
  it('reproduces both golden mappings', () => {
    const cases = FIXTURES.compress2d as Array<{ points: Array<[number, number]>; x: Array<[number, number]>; y: Array<[number, number]> }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = compress2dTrace(c.points);
      expect(run.x, JSON.stringify(c.points)).toEqual(c.x);
      expect(run.y).toEqual(c.y);
      expectFramesWellFormed(run.frames, COMPRESS_2D_CODE.length);
      for (const f of run.frames) expect(new Set(f.state.points.map((p) => p.id)).size).toBe(c.points.length);
    }
  });

  it('switches x to ranks before y, then labels every point with its rank pair', () => {
    const run = compress2dTrace(parsePoints('(1000, 500), (5, 10), (200, 300), (5, 500)'));
    expect(run.frames.map((f) => `${f.state.xAxis.mode[0]}${f.state.yAxis.mode[0]}`).slice(0, 4)).toEqual(['vv', 'vv', 'rv', 'rr']);
    expect(run.frames.at(-1)!.state.points.map((p) => p.label)).toEqual(['(2, 2)', '(0, 0)', '(1, 1)', '(0, 2)']);
  });
});

describe('helpers and parsers', () => {
  it('compress and decompress like the Python', () => {
    expect(compressCoordinates([7, -3, 0, -3])).toEqual([
      [-3, 0],
      [0, 1],
      [7, 2],
    ]);
    expect(decompressCoordinates(compressCoordinates([1000, 5, 200, 50]))).toEqual([5, 50, 200, 1000]);
  });

  it('read values and points, with friendly errors', () => {
    expect(parseCompress('1000, 5 200')).toEqual([1000, 5, 200]);
    expect(parseCompress('')).toEqual([]);
    expect(parsePoints('(1, 2), (3,4)')).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(() => parseCompress('1, x')).toThrow(InputError);
    expect(() => parseCompress('2000000000')).toThrow(/10\^9/);
    expect(() => parseCompress(Array.from({ length: 13 }, (_, i) => i).join(','))).toThrow(/At most 12/);
    expect(() => parsePoints('1, 2')).toThrow(/\(x, y\)/);
    expect(() => parsePoints('')).toThrow(/at least one/);
    expect(() => parsePoints(Array.from({ length: 9 }, (_, i) => `(${i}, ${i})`).join(','))).toThrow(/At most 8/);
  });
});
