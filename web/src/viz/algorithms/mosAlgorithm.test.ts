import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { MosViewState } from '../renderers/MosView';
import { countMoves, MO_CODE, moTrace, parseMo, type MoMove } from './mosAlgorithm';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/specializedTechniques.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function expectWellFormed(frames: Array<Frame<MosViewState>>, n: number, q: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(MO_CODE.length);
    }
    expect(f.state.cells.length).toBe(n);
    expect(f.state.queries.length).toBe(q);
    // Every query keeps its own lane.
    expect(new Set(f.state.queries.map((x) => x.lane)).size).toBe(q);
    expect(new Set(f.state.queries.map((x) => x.id)).size).toBe(q);
    if (!f.state.window) continue;
    const { l, r } = f.state.window;
    expect(l).toBeGreaterThanOrEqual(0);
    expect(r).toBeGreaterThanOrEqual(l - 1);
    expect(r).toBeLessThan(n);
  }
}

const distinct = (arr: number[], l: number, r: number) => new Set(arr.slice(l, r + 1)).size;

describe('moTrace matches mos_algorithm.py (golden fixtures)', () => {
  const cases = fixtures.mosAlgorithm as Array<{ arr: number[]; queries: Array<[number, number]>; blockSize: number; order: number[]; moves: MoMove[]; answers: number[] }>;

  it('block size, the order of the queries, every add and remove, and the answers', () => {
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = moTrace({ arr: c.arr, queries: c.queries });
      const where = `${JSON.stringify(c.arr)} ${JSON.stringify(c.queries)}`;
      expect(run.blockSize, where).toBe(c.blockSize);
      expect(run.order, where).toEqual(c.order);
      expect(run.moves, where).toEqual(c.moves);
      expect(run.answers, where).toEqual(c.answers);
    }
  });
});

describe('moTrace against brute force', () => {
  it('every answer is the number of distinct values, and the window moves exactly as far as the four loops say', () => {
    const rand = rng(7);
    for (let t = 0; t < 200; t++) {
      const n = 1 + Math.floor(rand() * 16);
      const arr = Array.from({ length: n }, () => Math.floor(rand() * (2 + Math.floor(rand() * 6))));
      const queries: Array<[number, number]> = Array.from({ length: 1 + Math.floor(rand() * 8) }, () => {
        const l = Math.floor(rand() * n);
        return [l, l + Math.floor(rand() * (n - l))];
      });
      const run = moTrace({ arr, queries });
      expect(run.answers).toEqual(queries.map(([l, r]) => distinct(arr, l, r)));
      expect(run.order.slice().sort((a, b) => a - b)).toEqual(queries.map((_, i) => i));
      // Sorted by (block of l, r), ties in input order.
      const B = run.blockSize;
      for (let k = 1; k < run.order.length; k++) {
        const [a, b] = [run.order[k - 1], run.order[k]];
        const ka = [Math.floor(queries[a][0] / B), queries[a][1]];
        const kb = [Math.floor(queries[b][0] / B), queries[b][1]];
        expect(ka[0] < kb[0] || (ka[0] === kb[0] && (ka[1] < kb[1] || (ka[1] === kb[1] && a < b)))).toBe(true);
      }
      expect(run.moves.length).toBe(countMoves(run.order.map((i) => queries[i])));
      // After each add or remove the answer is the distinct count of the window, so no count went negative.
      let l = 0;
      let r = -1;
      for (const [kind, i, ans] of run.moves) {
        if (kind === 'add') {
          if (i === l - 1) l = i;
          else r = i;
        } else if (i === l) l += 1;
        else r -= 1;
        expect(ans).toBe(distinct(arr, l, r));
      }
      expectWellFormed(run.frames, n, queries.length);
      // When an answer is stored, the window is that query.
      for (const f of run.frames.filter((x) => x.line === 9)) {
        const q = f.state.queries.find((x) => x.role === 'active')!;
        expect([f.state.window!.l, f.state.window!.r]).toEqual([q.l, q.r]);
      }
    }
  });
});

describe('moTrace scenarios', () => {
  it('the article example: order q2, q0, q4, q3, q1, 17 moves against 37 in input order', () => {
    const run = moTrace(parseMo('[1, 1, 2, 1, 3, 4, 3, 3, 4]; (0, 4) (6, 8) (1, 3) (5, 7) (2, 6)'));
    expect(run.blockSize).toBe(3);
    expect(run.order).toEqual([2, 0, 4, 3, 1]);
    expect(run.moves.length).toBe(17);
    expect(countMoves([[0, 4], [6, 8], [1, 3], [5, 7], [2, 6]])).toBe(37);
    expect(run.answers).toEqual([3, 2, 2, 2, 4]);
  });

  it('the lanes glide from input order to sorted order', () => {
    const run = moTrace(parseMo('[1, 1, 2, 1, 3, 4, 3, 3, 4]; (0, 4) (6, 8) (1, 3) (5, 7) (2, 6)'));
    const lanes = (f: Frame<MosViewState>) => f.state.queries.map((q) => q.lane);
    expect(lanes(run.frames[0])).toEqual([0, 1, 2, 3, 4]);
    expect(lanes(run.frames[1])).toEqual([1, 4, 0, 3, 2]);
  });

  it('equal keys keep their input order (a stable sort)', () => {
    const run = moTrace(parseMo('[2, 7, 2, 7, 2, 7, 2, 7, 2]; (1, 5) (0, 5) (2, 5) (0, 2) (1, 2)'));
    expect(run.order).toEqual([3, 4, 0, 1, 2]);
    expect(run.frames[1].caption).toMatch(/stable/);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const arr = Array.from({ length: 16 }, (_, i) => i % 5);
    const run = moTrace(parseMo(`[${arr.join(', ')}]; (0, 15) (3, 3) (0, 15) (15, 15) (0, 0) (4, 11) (12, 15) (0, 3)`));
    expect(run.frames.length).toBeLessThan(300);
  });
});

describe('parseMo', () => {
  it('reads the array and the queries in several forms', () => {
    expect(parseMo('[1, 2, 3]; (0, 2) (1, 1)').queries).toEqual([
      [0, 2],
      [1, 1],
    ]);
    expect(parseMo('1 2 3; 0 2, 1 1').queries).toEqual([
      [0, 2],
      [1, 1],
    ]);
    expect(parseMo('[4, 4]; queries: [0, 1]').queries).toEqual([[0, 1]]);
  });

  it('gives friendly errors', () => {
    expect(() => parseMo('[1, 2, 3]')).toThrow(InputError);
    expect(() => parseMo('[1, 2, 3];')).toThrow(/at least one/);
    expect(() => parseMo('[1, 2, 3]; (0, 1) (2)')).toThrow(/two indices/);
    expect(() => parseMo('[1, 2, 3]; (2, 1)')).toThrow(/greater than r/);
    expect(() => parseMo('[1, 2, 3]; (0, 3)')).toThrow(/IndexError/);
    expect(() => parseMo('[1, 2, 3]; (-1, 1)')).toThrow(/start at 0/);
    expect(() => parseMo(`[1, 2, 3]; ${Array.from({ length: 9 }, () => '(0, 1)').join(' ')}`)).toThrow(/At most 8/);
    expect(() => parseMo(`[${Array.from({ length: 17 }, () => 1).join(', ')}]; (0, 1)`)).toThrow(/At most 16/);
  });
});
