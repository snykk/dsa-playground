import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import fixtures from './__fixtures__/graphStructure.json';
import { formatOp, parseDsu, unionFind, type DsuOp } from './unionFind';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

interface DsuCase {
  n: number;
  ops: Array<[string, number, number?]>;
  steps: Array<{ result: boolean | number; parent: number[]; rank: number[]; count: number }>;
}

const toOp = ([kind, x, y]: [string, number, number?]): DsuOp =>
  kind === 'find' ? { kind: 'find', x } : { kind: kind as 'union' | 'connected', x, y: y! };

describe('unionFind', () => {
  it('agrees with a naive set-labelling reference on random operation lists', () => {
    const rand = rng(77);
    for (let t = 0; t < 200; t++) {
      const n = 2 + Math.floor(rand() * 9);
      const ops: DsuOp[] = [];
      for (let k = 0; k < 1 + Math.floor(rand() * 14); k++) {
        const x = Math.floor(rand() * n);
        const y = Math.floor(rand() * n);
        const r = rand();
        ops.push(r < 0.5 ? { kind: 'union', x, y } : r < 0.75 ? { kind: 'find', x } : { kind: 'connected', x, y });
      }
      const run = unionFind({ n, ops });
      const label = Array.from({ length: n }, (_, i) => i);
      const merge = (a: number, b: number) => {
        const from = label[a];
        const to = label[b];
        for (let i = 0; i < n; i++) if (label[i] === from) label[i] = to;
      };
      expect(run.steps.length).toBe(ops.length);
      ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'union') {
          expect(step.result).toBe(label[op.x] !== label[op.y]);
          merge(op.x, op.y);
        } else if (op.kind === 'connected') {
          expect(step.result).toBe(label[op.x] === label[op.y]);
        }
        // Same partition: two elements share a root exactly when the reference says so.
        const root = (x: number) => {
          while (step.parent[x] !== x) x = step.parent[x];
          return x;
        };
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) expect(root(a) === root(b)).toBe(label[a] === label[b]);
        expect(step.count).toBe(new Set(label).size);
        if (op.kind === 'find') expect(step.result).toBe(root(op.x));
      });
      expect(run.frames.length).toBeGreaterThan(ops.length);
      expect(run.frames.length).toBeLessThan(2000);
      for (const f of run.frames) {
        expect(f.caption.length).toBeGreaterThan(10);
        expect(f.state.nodes.length).toBe(n);
      }
    }
  });

  it('matches the Python UnionFind (golden fixtures): parent, rank and count after every operation', () => {
    const cases = fixtures.dsu as unknown as DsuCase[];
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      const run = unionFind({ n: c.n, ops: c.ops.map(toOp) });
      expect(run.steps.length).toBe(c.steps.length);
      c.steps.forEach((want, i) => {
        expect(run.steps[i].result).toBe(want.result);
        expect(run.steps[i].parent).toEqual(want.parent);
        expect(run.steps[i].rank).toEqual(want.rank);
        expect(run.steps[i].count).toBe(want.count);
      });
    }
  });

  it('final frame is the last snapshot and rank stays below log2(n)', () => {
    const run = unionFind(parseDsu('n 8; union 0 1, union 2 3, union 0 2, union 4 5, union 6 7, union 4 6, union 0 4'));
    const last = run.steps[run.steps.length - 1];
    expect(last.count).toBe(1);
    expect(Math.max(...last.rank)).toBeLessThanOrEqual(3);
    expect(run.frames[run.frames.length - 1].caption).toMatch(/^Done: 1 set/);
  });

  it('path compression flattens a chain', () => {
    // Chain built by unions of unequal rank would stay shallow; compression is visible after a find.
    const run = unionFind(parseDsu('n 4; union 0 1, union 2 3, union 0 2, find 3'));
    const last = run.steps[run.steps.length - 1];
    expect(last.parent[3]).toBe(last.result);
  });
});

describe('parseDsu', () => {
  it('reads the three operations and their short forms', () => {
    const input = parseDsu('n 5; u 0 1, f 2, c(1, 2), union(3,4)');
    expect(input.n).toBe(5);
    expect(input.ops.map(formatOp)).toEqual(['union(0, 1)', 'find(2)', 'connected(1, 2)', 'union(3, 4)']);
  });

  it('infers n from the largest element', () => {
    expect(parseDsu('union 0 6').n).toBe(7);
  });

  it('gives friendly errors', () => {
    expect(() => parseDsu('')).toThrow(InputError);
    expect(() => parseDsu('n 4; union 0 9')).toThrow(/out of range/);
    expect(() => parseDsu('n 4; merge 0 1')).toThrow(/Cannot read/);
    expect(() => parseDsu('n 99; union 0 1')).toThrow(/between 1 and/);
  });
});
