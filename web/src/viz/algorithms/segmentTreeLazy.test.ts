import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Frame } from '../core/types';
import type { SegmentTreeState } from '../renderers/SegmentTreeView';
import { LAZY_CODE, lazyTrace, parseLazy, type LazyOp } from './segmentTreeLazy';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/rangeQueries.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Every frame: a caption, a line in range, blocks inside the picture, unique ids (one assertion per frame). */
function expectWellFormed(frames: Array<Frame<SegmentTreeState>>) {
  for (const f of frames) {
    const s = f.state;
    const problems: string[] = [];
    if (f.caption.length <= 10) problems.push('short caption');
    if (f.line !== undefined && !(f.line >= 0 && f.line < LAZY_CODE.length)) problems.push(`line ${f.line}`);
    if (new Set(s.blocks.map((b) => b.id)).size !== s.blocks.length) problems.push('duplicate block ids');
    for (const b of s.blocks) if (!(b.lo >= 0 && b.hi < s.columns && b.row < s.rows)) problems.push(`block ${b.id} outside the picture`);
    const flyers = (s.flyers ?? []).map((x) => x.id);
    if (new Set(flyers).size !== flyers.length) problems.push('duplicate flyers');
    expect(problems, f.caption).toEqual([]);
  }
}

/**
 * The lazy invariant: a node's sum plus what its ancestors' tags still owe it equals the true
 * sum of its segment.
 */
function expectInvariant(tree: number[], lazy: number[], model: number[]) {
  const n = model.length;
  const wrong: string[] = [];
  const walk = (node: number, start: number, end: number, owed: number) => {
    let want = 0;
    for (let i = start; i <= end; i++) want += model[i];
    if (tree[node] + owed * (end - start + 1) !== want) wrong.push(`node ${node} [${start}, ${end}]`);
    if (start === end) return;
    const mid = Math.floor((start + end) / 2);
    walk(2 * node, start, mid, owed + lazy[node]);
    walk(2 * node + 1, mid + 1, end, owed + lazy[node]);
  };
  if (n > 0) walk(1, 0, n - 1, 0);
  expect(wrong).toEqual([]);
}

function randomOps(rand: () => number, n: number, count: number): LazyOp[] {
  const ops: LazyOp[] = [];
  for (let k = 0; k < count; k++) {
    let l: number;
    let r: number;
    if (rand() < 0.15) {
      l = Math.floor(rand() * (n + 6)) - 3;
      r = l + Math.floor(rand() * 8) - 2;
    } else {
      l = Math.floor(rand() * Math.max(n, 1));
      r = l + Math.floor(rand() * Math.max(n - l, 1));
    }
    ops.push(rand() < 0.5 ? { kind: 'add', left: l, right: r, value: Math.floor(rand() * 41) - 20 } : { kind: 'query', left: l, right: r });
  }
  return ops;
}

describe('lazyTrace (segment tree with lazy propagation)', () => {
  it('agrees with a plain array on random scripts, and the lazy invariant holds after every operation', { timeout: 30000 }, () => {
    const rand = rng(23);
    for (let t = 0; t < 150; t++) {
      const n = Math.floor(rand() * 17);
      const arr = Array.from({ length: n }, () => Math.floor(rand() * 199) - 99);
      const ops = randomOps(rand, n, 1 + Math.floor(rand() * 12));
      const run = lazyTrace({ arr, ops });
      const model = [...arr];
      ops.forEach((op, i) => {
        const step = run.steps[i];
        const lo = Math.max(0, op.left);
        const hi = Math.min(n - 1, op.right);
        if (op.kind === 'add') {
          for (let j = lo; j <= hi; j++) model[j] += op.value;
          expect(step.result).toBeNull();
        } else {
          let want = 0;
          for (let j = lo; j <= hi; j++) want += model[j];
          expect(step.result).toBe(want);
        }
        expect(step.tree.length).toBe(4 * n);
        expectInvariant(step.tree, step.lazy, model);
        // Tags are pushed only from nodes the operation passed through.
        for (const p of step.pushes) expect(step.visits.some(([node]) => node === p)).toBe(true);
      });
      // The picture's "a[i] now" row ends on the true values.
      const last = run.frames[run.frames.length - 1].state;
      expect(last.valueRows![0].cells.map((c) => c.value)).toEqual(model);
      expectWellFormed(run.frames);
    }
  });

  it('matches the Python LazySegmentTree (golden fixtures)', () => {
    type Case = { arr: number[]; build: number[]; ops: Array<[string, number, number, number?]>; steps: Array<{ result: number | null; tree: number[]; lazy: number[]; visits: number[][]; pushes: number[] }> };
    const cases = fixtures.lazySegmentTree as Case[];
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const ops = c.ops.map((o): LazyOp => (o[0] === 'add' ? { kind: 'add', left: o[1], right: o[2], value: o[3]! } : { kind: 'query', left: o[1], right: o[2] }));
      const run = lazyTrace({ arr: c.arr, ops });
      expect(run.build).toEqual(c.build);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `${JSON.stringify(c.arr)} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        expect(got.result, where).toBe(want.result);
        expect(got.tree, where).toEqual(want.tree);
        expect(got.lazy, where).toEqual(want.lazy);
        expect(got.visits, where).toEqual(want.visits);
        expect(got.pushes, where).toEqual(want.pushes);
      });
    }
  });

  it('parks tags on the maximal covered nodes, then pushes one down for a later query (the README trace)', () => {
    const run = lazyTrace(parseLazy('[1, 3, 5, 7, 9, 11]; add 1 4 3, query 3 3'));
    const [add, q] = run.steps;
    // Nodes: 1 [0-5], 2 [0-2], 3 [3-5], 4 [0-1], 5 [2], 6 [3-4], 7 [5], 9 [1], 12 [3], 13 [4].
    expect([1, 2, 3, 4, 6].map((p) => add.tree[p])).toEqual([48, 15, 33, 7, 22]);
    expect(add.lazy.map((t, p) => [p, t]).filter(([, t]) => t !== 0)).toEqual([
      [5, 3],
      [6, 3],
      [9, 3],
    ]);
    expect(q.result).toBe(10);
    expect(q.pushes).toEqual([6]);
    expect([q.tree[12], q.lazy[12], q.tree[13], q.lazy[13], q.lazy[6]]).toEqual([10, 3, 12, 3, 0]);
    // The tag travels: first both copies sit in the parent's row, then each lands on its child.
    const split = run.frames.findIndex((f) => f.caption.startsWith('_push_down([3-4])'));
    expect(run.frames[split].state.flyers!.map((f) => [f.id, f.row, f.lo])).toEqual([
      ['p12', 2, 3],
      ['p13', 2, 4],
    ]);
    expect(run.frames[split + 1].state.flyers!.map((f) => [f.id, f.row, f.lo])).toEqual([
      ['p12', 3, 3],
      ['p13', 3, 4],
    ]);
  });

  it('clips ranges outside the array and does nothing on an empty tree', () => {
    const run = lazyTrace(parseLazy('[4, 8, 15, 16]; add -2 1 5, query 2 20, query -5 -1, query 3 1'));
    expect(run.steps.map((s) => s.result)).toEqual([null, 31, 0, 0]);
    const empty = lazyTrace(parseLazy('[]; add -1 0 5, query -3 5'));
    expect(empty.steps.map((s) => s.result)).toEqual([null, 0]);
    expect(empty.steps[0].visits).toEqual([]);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const arr = Array.from({ length: 16 }, (_, i) => i).join(' ');
    const ops = Array.from({ length: 12 }, (_, i) => (i % 2 ? `query ${i % 5} ${15 - (i % 4)}` : `add ${i % 3} ${14 - i} 7`)).join(', ');
    expect(lazyTrace(parseLazy(`${arr}; ${ops}`)).frames.length).toBeLessThan(1000);
  });

  it('parses the update names and rejects bad scripts', () => {
    expect(parseLazy('1 2 3; add 0 2 5, update_range(1, 2, -3), q 0 0').ops).toEqual([
      { kind: 'add', left: 0, right: 2, value: 5 },
      { kind: 'add', left: 1, right: 2, value: -3 },
      { kind: 'query', left: 0, right: 0 },
    ]);
    expect(() => parseLazy('1 2; add 0 1')).toThrow(/range and a value/);
    expect(() => parseLazy('1 2; add 0 1 50')).toThrow(/-20 to 20/);
    expect(() => parseLazy('1 2; get 0')).toThrow(/Unknown operation/);
  });
});
