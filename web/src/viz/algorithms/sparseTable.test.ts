import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseSparse, SPARSE_CODE, sparseTrace, type SparseOp } from './sparseTable';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/rangeQueries.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('sparseTrace', () => {
  it('agrees with brute force on random arrays and queries, and every written cell is its window', () => {
    const rand = rng(31);
    for (let t = 0; t < 150; t++) {
      const n = Math.floor(rand() * 17);
      const kind = rand() < 0.5 ? 'min' : 'max';
      const fn = kind === 'min' ? Math.min : Math.max;
      const arr = Array.from({ length: n }, () => Math.floor(rand() * 199) - 99);
      const ops: SparseOp[] = Array.from({ length: 1 + Math.floor(rand() * 12) }, (): SparseOp => {
        const pick = () => (rand() < 0.08 ? [-1, n][Math.floor(rand() * 2)] : Math.floor(rand() * Math.max(n, 1)));
        return rand() < 0.85 ? { kind: 'query', left: pick(), right: pick() } : { kind: 'get', index: pick() };
      });
      const run = sparseTrace({ kind, arr, ops });
      expect(run.logN).toBe(n === 0 ? 0 : Math.floor(Math.log2(n)) + 1);
      expect(run.table).toEqual(arr.map((_, i) => Array.from({ length: run.logN }, (_, j) => (i + 2 ** j <= n ? fn(...arr.slice(i, i + 2 ** j)) : 0))));
      ops.forEach((op, k) => {
        const step = run.steps[k];
        if (op.kind === 'get') {
          if (op.index < 0 || op.index >= n) expect(step.error).toBe('IndexError');
          else expect(step.result).toBe(arr[op.index]);
        } else {
          const l = Math.min(op.left, op.right);
          const r = Math.max(op.left, op.right);
          if (l < 0 || r >= n) expect(step.error).toBe('IndexError');
          else expect(step.result).toBe(fn(...arr.slice(l, r + 1)));
        }
      });
      for (const f of run.frames) {
        const problems: string[] = [];
        if (f.caption.length <= 10) problems.push('short caption');
        if (f.line !== undefined && !(f.line >= 0 && f.line < SPARSE_CODE.length)) problems.push(`line ${f.line}`);
        if (f.state.levels.length !== run.logN) problems.push('one row per level');
        for (const w of f.state.windows) if (w && (w.start < 0 || w.start + w.cells.length > n)) problems.push('window off the array');
        expect(problems, f.caption).toEqual([]);
      }
    }
  });

  it('matches the Python SparseTable (golden fixtures)', () => {
    type Case = { arr: number[]; kind: string; error?: string; logN?: number; table?: number[][]; ops: Array<[string, number, number?]>; steps: Array<{ result?: number; error?: string }> };
    const cases = fixtures.sparseTable as Case[];
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const ops = c.ops.map((o): SparseOp => (o[0] === 'query' ? { kind: 'query', left: o[1], right: o[2]! } : { kind: 'get', index: o[1] }));
      const run = sparseTrace({ kind: c.kind, arr: c.arr, ops });
      if (c.error) {
        expect(run.error).toBe(c.error);
        expect(run.steps).toEqual([]);
        continue;
      }
      expect(run.logN).toBe(c.logN);
      expect(run.table).toEqual(c.table);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        if (want.error) expect(got.error).toBe(want.error);
        else expect(got.result, `${JSON.stringify(c.arr)} ${JSON.stringify(c.ops[i])}`).toBe(want.result);
      });
    }
  });

  it('answers min(a[2..8]) from two windows of 4 that overlap on a[5] (the README trace)', () => {
    const run = sparseTrace(parseSparse('[1, 3, 5, 7, 9, 11, 2, 4, 6, 8]; query 2 8, query 5 2'));
    expect(run.table.map((row) => row[2])).toEqual([1, 3, 5, 2, 2, 2, 2, 0, 0, 0]);
    expect(run.steps.map((s) => s.result)).toEqual([2, 5]);
    const read = run.frames.find((f) => f.caption.startsWith('min(table[2][2], table[5][2])'))!;
    expect(read.caption).toContain('55 instead of 44');
    expect(read.state.windows.map((w) => w && [w.start, w.cells.length])).toEqual([
      [2, 4],
      [5, 4],
    ]);
    expect(run.frames.some((f) => f.caption.includes('swapped to (2, 5)'))).toBe(true);
    // During the build the two halves slide right one cell per frame.
    const level1 = run.frames.filter((f) => f.vars?.some(([k, v]) => k === 'j' && v === 1));
    expect(level1.map((f) => f.state.windows[0]!.start)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('raises ValueError for any kind but min and max, and IndexError on an empty table', () => {
    const bad = sparseTrace(parseSparse('sum [5, 1, 9]; query 0 2'));
    expect(bad.error).toBe('ValueError');
    expect(bad.frames).toHaveLength(1);
    expect(bad.frames[0].caption).toContain('count the overlap twice');
    const empty = sparseTrace(parseSparse('[]; query 0 0, get 0'));
    expect(empty.steps.map((s) => s.error)).toEqual(['IndexError', 'IndexError']);
    expect(sparseTrace(parseSparse('max: 3 1 2; query 0 2')).steps[0].result).toBe(3);
  });

  it('parses the kind and the operations', () => {
    expect(parseSparse('max [4, 2]; q 0 1, g 1')).toEqual({ kind: 'max', arr: [4, 2], ops: [{ kind: 'query', left: 0, right: 1 }, { kind: 'get', index: 1 }] });
    expect(parseSparse('arr = 1 2').kind).toBe('min');
    expect(() => parseSparse('1 2; update 0 1')).toThrow(/no updates/);
    expect(() => parseSparse('minimumvalue 1 2')).toThrow(/too long/);
  });
});
