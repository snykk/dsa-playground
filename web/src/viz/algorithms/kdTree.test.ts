import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeKd } from '../renderers/KdTreeView';
import { KD_CODE, kdTrace, parseKd, type KdOp, type KdShape, type Pt2 } from './kdTree';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/rangeQueries.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const d2 = (a: Pt2, b: Pt2) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

/** K-D order: every point in the left subtree is <= the node on its axis, every point on the right >=. */
function expectKdOrder(t: KdShape, depth = 0, out: number[] = []): number[] {
  if (!t) return out;
  const [id, p, axis, left, right] = t;
  expect(axis).toBe(depth % 2);
  const collect = (s: KdShape): Pt2[] => (s ? [s[1], ...collect(s[3]), ...collect(s[4])] : []);
  for (const q of collect(left)) expect(q[axis]).toBeLessThanOrEqual(p[axis]);
  for (const q of collect(right)) expect(q[axis]).toBeGreaterThanOrEqual(p[axis]);
  out.push(id);
  expectKdOrder(left, depth + 1, out);
  expectKdOrder(right, depth + 1, out);
  return out;
}

const rp = (rand: () => number): Pt2 => [Math.floor(rand() * 10), Math.floor(rand() * 10)];

describe('kdTrace', () => {
  it('agrees with brute force on random point sets, and the tree keeps K-D order', { timeout: 30000 }, () => {
    const rand = rng(37);
    for (let t = 0; t < 150; t++) {
      const m = Math.floor(rand() * 9);
      const points = Array.from({ length: m }, () => rp(rand));
      let room = 10 - m;
      const ops: KdOp[] = Array.from({ length: 1 + Math.floor(rand() * 8) }, (): KdOp => {
        const r = rand();
        if (r < 0.25 && room > 0) {
          room -= 1;
          return { kind: 'insert', point: rp(rand) };
        }
        if (r < 0.65) return { kind: 'nearest', point: rp(rand) };
        const a = rp(rand);
        const b = rp(rand);
        return rand() < 0.9 ? { kind: 'range', lo: [Math.min(a[0], b[0]), Math.min(a[1], b[1])], hi: [Math.max(a[0], b[0]), Math.max(a[1], b[1])] } : { kind: 'range', lo: a, hi: b };
      });
      const run = kdTrace({ points, ops });
      const live: number[] = points.map((_, i) => i);
      ops.forEach((op, k) => {
        const step = run.steps[k];
        if (op.kind === 'insert') live.push(live.length);
        const ids = expectKdOrder(step.tree);
        expect([...ids].sort((a, b) => a - b)).toEqual(live);
        if (op.kind === 'nearest') {
          if (!live.length) expect(step.result).toBeNull();
          else {
            const best = Math.min(...live.map((i) => d2(run.points[i], op.point)));
            expect(d2(run.points[step.result as number], op.point)).toBe(best);
            // Pruning never skips the answer, and a search measures at most every point once (plus the root twice).
            expect(step.visits!.length).toBeLessThanOrEqual(live.length + 1);
          }
        } else if (op.kind === 'range') {
          const want = live.filter((i) => {
            const p = run.points[i];
            return op.lo[0] <= p[0] && p[0] <= op.hi[0] && op.lo[1] <= p[1] && p[1] <= op.hi[1];
          });
          expect([...(step.result as number[])].sort((a, b) => a - b)).toEqual(want);
        }
      });
      for (const f of run.frames) {
        const problems: string[] = [];
        if (f.caption.length <= 10) problems.push('short caption');
        if (f.line !== undefined && !(f.line >= 0 && f.line < KD_CODE.length)) problems.push(`line ${f.line}`);
        const ids = new Set(f.state.nodes.map((n) => n.id));
        if (ids.size !== f.state.nodes.length) problems.push('duplicate node ids');
        for (const n of f.state.nodes) for (const c of [n.left, n.right]) if (c !== null && !ids.has(c)) problems.push(`edge ${n.id} -> ${c} to no node`);
        if (f.state.splits.length !== f.state.nodes.length) problems.push('one split line per node');
        expect(problems, f.caption).toEqual([]);
      }
    }
  });

  it('matches the Python KDTree (golden fixtures)', () => {
    type Case = { points: Pt2[]; build: KdShape; ops: Array<[string, Pt2, Pt2?]>; steps: Array<{ result: number | null | number[]; tree: KdShape; visits?: number[] }> };
    const cases = fixtures.kdTree as Case[];
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const ops = c.ops.map((o): KdOp => (o[0] === 'range' ? { kind: 'range', lo: o[1], hi: o[2]! } : { kind: o[0] as 'insert' | 'nearest', point: o[1] }));
      const run = kdTrace({ points: c.points, ops });
      expect(run.build).toEqual(c.build);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `${JSON.stringify(c.points)} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        expect(got.result, where).toEqual(want.result);
        expect(got.tree, where).toEqual(want.tree);
        if (want.visits) expect(got.visits, where).toEqual(want.visits);
      });
    }
  });

  it('finds (2,3) for (1,3) on the textbook points and prunes the right subtree (the README trace)', () => {
    const run = kdTrace(parseKd('points (7,2) (5,4) (9,6) (2,3) (4,7) (8,1); nearest (1,3), range (3,3) (8,7)'));
    expect(run.build).toEqual([0, [7, 2], 0, [1, [5, 4], 1, [3, [2, 3], 0, null, null], [4, [4, 7], 0, null, null]], [2, [9, 6], 1, [5, [8, 1], 0, null, null], null]]);
    expect(run.steps[0]).toMatchObject({ result: 3, visits: [0, 0, 1, 3] });
    expect(run.steps[1]).toMatchObject({ result: [1, 4], visits: [0, 1, 3, 4, 2, 5] });
    const skips = run.frames.filter((f) => f.caption.includes('>= best_dist'));
    expect(skips.map((f) => f.state.gap!.label)).toEqual(['diff^2 = 1', 'diff^2 = 36']);
    // The circle shrinks: 37, 17, then 1.
    const radii = run.frames.filter((f) => f.state.circle && f.state.query).map((f) => f.state.circle!.r2);
    expect([...new Set(radii)]).toEqual([37, 17, 1]);
  });

  it('turns sorted inserts into a chain, and nearest still answers without recursion', () => {
    const run = kdTrace(parseKd(`points; ${Array.from({ length: 8 }, (_, i) => `insert (${i},${i})`).join(', ')}, nearest (9,9)`));
    let depth = 0;
    for (let t = run.steps[7].tree; t; t = t[4]) depth += 1;
    expect(depth).toBe(8);
    expect(run.points[run.steps[8].result as number]).toEqual([7, 7]);
    const stable = stabilizeKd(run.frames);
    expect(stable.every((f) => f.state.extent!.depth === 7 && f.state.extent!.nodes === 8)).toBe(true);
  });

  it('keeps equal coordinates in input order when building (a stable sort)', () => {
    const run = kdTrace(parseKd('points (3,3) (3,3) (3,5) (3,1) (5,3) (1,3)'));
    // Sorted by x: (1,3) then the four x = 3 points in input order (ids 0, 1, 2, 3), then (5,3); the median is id 2.
    expect(run.build![0]).toBe(2);
    expect(expectKdOrder(run.build)).toHaveLength(6);
  });

  it('parses points and operations', () => {
    expect(parseKd('points (1, 2) (3,4); nn (0,0), box (1,1) (2,2), ins (5,5)')).toEqual({
      points: [
        [1, 2],
        [3, 4],
      ],
      ops: [
        { kind: 'nearest', point: [0, 0] },
        { kind: 'range', lo: [1, 1], hi: [2, 2] },
        { kind: 'insert', point: [5, 5] },
      ],
    });
    expect(parseKd('(1,2)').points).toEqual([[1, 2]]);
    expect(() => parseKd('points (1,2) 3')).toThrow(InputError);
    expect(() => parseKd('points (1,12)')).toThrow(/0 to 9/);
    expect(() => parseKd('points (1,1); range (1,1)')).toThrow(/two corners/);
    expect(() => parseKd('points (1,1); delete (1,1)')).toThrow(/Cannot read/);
    expect(() => parseKd(`points ${Array.from({ length: 10 }, () => '(1,1)').join(' ')}; insert (2,2)`)).toThrow(/inserts included/);
  });
});
