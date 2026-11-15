import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { parseTsp, TSP_CODE, tspBrute, tspTrace, type TspRun } from './bitmaskDp';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedDp.json', import.meta.url), 'utf8'));
const num = (v: number | string) => (v === 'inf' ? Infinity : (v as number));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Every frame: a caption, a line in range, the same tables and chips, unique ids. */
function expectWellFormed(run: TspRun) {
  const shape = (i: number) => JSON.stringify(run.frames[i].state.tables.map((t) => [t.id, t.rowHeaders, t.colHeaders, t.cells.map((r) => r.length)]));
  for (let i = 0; i < run.frames.length; i++) {
    const f = run.frames[i];
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(TSP_CODE.length);
    }
    const ids = f.state.tables.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(shape(i), 'the picture keeps one size').toBe(shape(0));
  }
}

/** Brute force for one cell: the cheapest path 0 -> ... -> last over exactly the cities of mask. */
function cellBrute(dist: number[][], mask: number, last: number): number {
  if (!(mask & 1) || !(mask & (1 << last))) return Infinity;
  if (last === 0) return mask === 1 ? 0 : Infinity;
  const middle = Array.from({ length: dist.length }, (_, i) => i).filter((i) => i !== 0 && i !== last && mask & (1 << i));
  let best = Infinity;
  const permute = (k: number) => {
    if (k === middle.length) {
      let cost = 0;
      let at = 0;
      for (const c of [...middle, last]) {
        cost += dist[at][c];
        at = c;
      }
      best = Math.min(best, cost);
      return;
    }
    for (let i = k; i < middle.length; i++) {
      [middle[k], middle[i]] = [middle[i], middle[k]];
      permute(k + 1);
      [middle[k], middle[i]] = [middle[i], middle[k]];
    }
  };
  permute(0);
  return best;
}

function randomMatrix(rand: () => number): number[][] {
  const n = 1 + Math.floor(rand() * 6);
  const holes = [0, 0, 0.2, 0.5][Math.floor(rand() * 4)];
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? (rand() < 0.8 ? 0 : Math.floor(rand() * 5)) : rand() < holes ? Infinity : Math.floor(rand() * 50) - 5)),
  );
}

describe('tspTrace matches traveling_salesman_dp (golden fixtures)', () => {
  it('fills every cell of the table and returns the same result', () => {
    const cases = fixtures.tsp as Array<{ dist: Array<Array<number | string>>; dp: Array<Array<number | string>>; result: number | string }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const dist = c.dist.map((r) => r.map(num));
      const run = tspTrace({ dist });
      expect(run.dp, JSON.stringify(c.dist)).toEqual(c.dp.map((r) => r.map(num)));
      expect(run.result).toBe(num(c.result));
    }
  });
});

describe('tspTrace against brute force', () => {
  it('agrees with every ordering of the cities, cell by cell, on random matrices', () => {
    const rand = rng(31);
    for (let t = 0; t < 150; t++) {
      const dist = randomMatrix(rand);
      const run = tspTrace({ dist });
      expect(run.result, JSON.stringify(dist)).toBe(tspBrute(dist));
      for (let mask = 0; mask < 1 << dist.length; mask++) {
        for (let last = 0; last < dist.length; last++) expect(run.dp[mask][last], `${mask},${last}`).toBe(cellBrute(dist, mask, last));
      }
      expectWellFormed(run);
    }
  });

  it('shows the table it computes: the last frame holds the final cells', () => {
    const dist = [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ];
    const run = tspTrace({ dist });
    const table = run.frames[run.frames.length - 1].state.tables[0];
    expect(table.rowHeaders).toEqual(['0001', '0011', '0101', '0111', '1001', '1011', '1101', '1111']);
    expect(table.cells[7].map((c) => c?.text)).toEqual([String.fromCodePoint(0x221e), '70', '65', '75']);
    // the two closing choices that tie at 80 are marked
    expect(table.cells[7].map((c) => c?.role)).toEqual(['muted', 'done', 'done', undefined]);
    expect(run.result).toBe(80);
  });
});

describe('tspTrace edge cases', () => {
  it('returns 0 for no cities and dist[0][0] for one city, as the code does', () => {
    expect(tspTrace(parseTsp('[]')).result).toBe(0);
    expect(tspTrace(parseTsp('[]')).frames).toHaveLength(1);
    expect(tspTrace(parseTsp('[[0]]')).result).toBe(0);
    expect(tspTrace(parseTsp('5')).result).toBe(5);
    expect(tspTrace(parseTsp('0 7; 7 0')).result).toBe(14);
  });

  it('returns inf, not 0, when no tour exists (the audit bug)', () => {
    const run = tspTrace(parseTsp('0 1 inf; 1 0 inf; inf inf 0'));
    expect(run.result).toBe(Infinity);
    const last = run.frames[run.frames.length - 1];
    expect(last.caption).toMatch(/float\('inf'\)/);
    expect(last.state.tables[0].cells[3].every((c) => c?.role === 'bad')).toBe(true);
  });

  it('stays well under 2000 frames for six cities', () => {
    const six = Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) => (i === j ? 0 : 1 + ((i * 7 + j * 3) % 9))));
    const run = tspTrace({ dist: six });
    expect(run.frames.length).toBeLessThan(2000);
    expect(run.frames[0].state.tables.map((t) => t.rowHeaders.length)).toEqual([16, 16, 6]);
  });
});

describe('parseTsp', () => {
  it('reads rows, Python lists and missing edges', () => {
    expect(parseTsp('0 1; 1 0').dist).toEqual([
      [0, 1],
      [1, 0],
    ]);
    expect(parseTsp('[[0, 2, inf], [2, 0, 3], [x, 3, 0]]').dist).toEqual([
      [0, 2, Infinity],
      [2, 0, 3],
      [Infinity, 3, 0],
    ]);
    expect(parseTsp('[]').dist).toEqual([]);
  });

  it('gives friendly errors', () => {
    expect(() => parseTsp('0 1; 1')).toThrow(InputError);
    expect(() => parseTsp('0 1; 1')).toThrow(/needs 2/);
    expect(() => parseTsp('0 a; 1 0')).toThrow(/not a distance/);
    expect(() => parseTsp('0 5000; 1 0')).toThrow(/-99 to 999/);
    const seven = Array.from({ length: 7 }, () => Array.from({ length: 7 }, () => '1').join(' ')).join('; ');
    expect(() => parseTsp(seven)).toThrow(/At most 6 cities/);
  });
});
