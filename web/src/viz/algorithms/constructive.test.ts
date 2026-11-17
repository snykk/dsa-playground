import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { GRAPH_CODE, graphTrace, parseDegrees, parsePerm, parseSums, PERM_CODE, permTrace, SUMS_CODE, sumsTrace, type HeapOp } from './constructive';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/mathAndProblemTypes.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function expectFrames<S>(frames: Array<Frame<S>>, lines: number) {
  expect(frames.length).toBeGreaterThan(0);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
  }
}

const distinctDiffs = (p: number[]) => new Set(p.slice(1).map((v, i) => Math.abs(v - p[i]))).size;

/** Erdos-Gallai: is the sequence the degree sequence of a simple graph? */
function graphical(degrees: number[]): boolean {
  const d = [...degrees].sort((a, b) => b - a);
  if (d.reduce((s, x) => s + x, 0) % 2) return false;
  for (let k = 1; k <= d.length; k++) {
    const left = d.slice(0, k).reduce((s, x) => s + x, 0);
    const right = k * (k - 1) + d.slice(k).reduce((s, x) => s + Math.min(x, k), 0);
    if (left > right) return false;
  }
  return true;
}

describe('construct_permutation', () => {
  it('returns a permutation with exactly k distinct differences, or None out of range', () => {
    for (let n = -1; n <= 16; n++) {
      for (let k = -2; k <= n + 2; k++) {
        const run = permTrace({ n, k });
        const valid = (n === 1 && k === 0) || (n >= 2 && k >= 1 && k <= n - 1);
        expectFrames(run.frames, PERM_CODE.length);
        if (!valid) {
          expect(run.result, `${n} ${k}`).toBeNull();
          expect(run.frames[run.frames.length - 1].state.status).toBe('bad');
          continue;
        }
        expect([...run.result!].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i + 1));
        expect(distinctDiffs(run.result!), `${n} ${k}`).toBe(k);
        const last = run.frames[run.frames.length - 1].state;
        expect(last.status).toBe('good');
        expect(last.distinct.length).toBe(k);
      }
    }
  });

  it('zig-zags 1, k+1, 2, k, ... and the differences shrink by one: n 7, k 3', () => {
    const run = permTrace(parsePerm('n 7, k 3'));
    expect(run.result).toEqual([1, 4, 2, 3, 5, 6, 7]);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.diffs.map((d) => d.value)).toEqual([3, 2, 1, 2, 1, 1]);
    expect(last.diffs.map((d) => d.fresh)).toEqual([true, true, true, false, false, false]);
    // While zig-zagging, the range lo..hi shrinks from both ends.
    const pools = run.frames.filter((f) => f.state.pool).map((f) => `${f.state.pool!.lo}..${f.state.pool!.hi}`);
    expect(pools).toEqual(['1..4', '2..4', '2..3', '3..3', '3..2']);
  });

  it('matches the Python function (golden fixtures)', () => {
    const list = fixtures.permutation as Array<{ n: number; k: number; result: number[] | null }>;
    expect(list.length).toBeGreaterThanOrEqual(100);
    for (const c of list) expect(permTrace({ n: c.n, k: c.k }).result, `${c.n} ${c.k}`).toEqual(c.result);
  });
});

describe('construct_graph (Havel-Hakimi)', () => {
  it('builds a simple graph with the given degrees exactly when Erdos-Gallai allows one', () => {
    const rand = rng(51);
    for (let t = 0; t < 300; t++) {
      const n = 1 + Math.floor(rand() * 10);
      const degrees = Array.from({ length: n }, () => Math.floor(rand() * Math.min(10, n + 1)));
      const run = graphTrace(degrees);
      expectFrames(run.frames, GRAPH_CODE.length);
      if (!graphical(degrees)) {
        expect(run.result, degrees.join(' ')).toBeNull();
        continue;
      }
      expect(run.result, degrees.join(' ')).not.toBeNull();
      const got = Array(n).fill(0);
      const seen = new Set<string>();
      for (const [u, v] of run.result!) {
        expect(u).not.toBe(v);
        const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
        got[u] += 1;
        got[v] += 1;
      }
      expect(got).toEqual(degrees);
      // Every edge drawn joins two drawn nodes.
      for (const f of run.frames) {
        const ids = new Set(f.state.nodes.map((x) => x.id));
        for (const e of f.state.edges) expect(ids.has(e.from) && ids.has(e.to)).toBe(true);
      }
    }
  });

  it('pops the largest degree first and breaks ties by the smaller node: [3, 3, 2, 2, 2]', () => {
    const run = graphTrace(parseDegrees('3 3 2 2 2'));
    expect(run.result).toEqual([
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 4],
      [1, 2],
      [3, 4],
    ]);
    expect(run.ops.slice(0, 4)).toEqual([
      ['pop', 3, 0],
      ['pop', 3, 1],
      ['pop', 2, 2],
      ['pop', 2, 3],
    ]);
    expect(graphTrace(parseDegrees('3 1 1')).result).toBeNull();
  });

  it('matches the Python function, every heap pop and push (golden fixtures)', () => {
    const list = fixtures.havelHakimi as Array<{ degrees: number[]; result: Array<[number, number]> | null; ops: HeapOp[] }>;
    expect(list.length).toBeGreaterThanOrEqual(40);
    for (const c of list) {
      const run = graphTrace(c.degrees);
      expect(run.result, c.degrees.join(' ')).toEqual(c.result);
      expect(run.ops, c.degrees.join(' ')).toEqual(c.ops);
    }
  });
});

describe('construct_matrix (north-west corner)', () => {
  it('meets every row and column sum, or returns None when the totals differ', () => {
    const rand = rng(52);
    for (let t = 0; t < 200; t++) {
      const n = 1 + Math.floor(rand() * 6);
      const m = 1 + Math.floor(rand() * 6);
      const rows = Array.from({ length: n }, () => Math.floor(rand() * 12));
      const cols = Array.from({ length: m }, () => Math.floor(rand() * 12));
      const diff = rows.reduce((s, x) => s + x, 0) - cols.reduce((s, x) => s + x, 0);
      if (rand() < 0.7 && diff !== 0) {
        // make the totals agree most of the time
        if (diff > 0) cols[0] += diff;
        else rows[0] -= diff;
      }
      const run = sumsTrace({ rows, cols });
      expectFrames(run.frames, SUMS_CODE.length);
      const equal = rows.reduce((s, x) => s + x, 0) === cols.reduce((s, x) => s + x, 0);
      if (!equal) {
        expect(run.result).toBeNull();
        continue;
      }
      const M = run.result!;
      expect(M.map((r) => r.reduce((s, x) => s + x, 0))).toEqual(rows);
      expect(cols.map((_, j) => M.reduce((s, r) => s + r[j], 0))).toEqual(cols);
      expect(M.flat().every((x) => x >= 0)).toBe(true);
      expect(run.frames.length).toBe(n * m + 2);
    }
  });

  it('matches the Python function (golden fixtures)', () => {
    const list = fixtures.northwestCorner as Array<{ rows: number[]; cols: number[]; result: number[][] | null }>;
    expect(list.length).toBeGreaterThanOrEqual(30);
    for (const c of list) expect(sumsTrace({ rows: c.rows, cols: c.cols }).result).toEqual(c.result);
  });
});

describe('constructive parsers', () => {
  it('read their inputs', () => {
    expect(parsePerm('n 7, k 3')).toEqual({ n: 7, k: 3 });
    expect(parsePerm('construct_permutation(7, 3)')).toEqual({ n: 7, k: 3 });
    expect(parsePerm('5 0')).toEqual({ n: 5, k: 0 });
    expect(parseDegrees('[3, 3, 2, 2, 2]')).toEqual([3, 3, 2, 2, 2]);
    expect(parseSums('rows 3 2; cols 1 4')).toEqual({ rows: [3, 2], cols: [1, 4] });
    expect(parseSums('3 2 | 1 4')).toEqual({ rows: [3, 2], cols: [1, 4] });
  });

  it('give friendly errors', () => {
    expect(() => parsePerm('7')).toThrow(InputError);
    expect(() => parsePerm('n 17, k 3')).toThrow(/up to 16/);
    expect(() => parseDegrees('')).toThrow(/degree/);
    expect(() => parseDegrees('1 2 3 4 5 6 7 8 9 1 1')).toThrow(/10 nodes/);
    expect(() => parseDegrees('10 1')).toThrow(/0 to 9/);
    expect(() => parseSums('rows 3 2')).toThrow(/column sums/);
    expect(() => parseSums('rows -1; cols 1')).toThrow(/0 to 99/);
  });
});
