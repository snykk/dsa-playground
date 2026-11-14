import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { BTREE_CODE, BTREE_LIMITS, bTreeTrace, parseBTree, type BDump, type BOp } from './bTree';
import { expectWellFormed, rng } from './multiwayTreesTestKit';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/multiwayTrees.json', import.meta.url), 'utf8'));

/** Fill bounds, sorted keys within the bounds of the parent, k + 1 children, equal leaf depth. */
function checkInvariants(tree: BDump, t: number): number[] {
  const keys: number[] = [];
  const walk = (node: BDump, isRoot: boolean, lo: number | null, hi: number | null): number => {
    const [ks, cs] = node;
    expect(ks.length).toBeLessThanOrEqual(2 * t - 1);
    if (!isRoot) expect(ks.length).toBeGreaterThanOrEqual(t - 1);
    else if (cs.length) expect(ks.length).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < ks.length; i++) expect(ks[i - 1]).toBeLessThanOrEqual(ks[i]);
    for (const k of ks) {
      if (lo !== null) expect(k).toBeGreaterThanOrEqual(lo);
      if (hi !== null) expect(k).toBeLessThanOrEqual(hi);
    }
    if (cs.length === 0) {
      keys.push(...ks);
      return 0;
    }
    expect(cs.length).toBe(ks.length + 1);
    const depths = new Set<number>();
    cs.forEach((c, i) => {
      depths.add(walk(c, false, i === 0 ? lo : ks[i - 1], i === ks.length ? hi : ks[i]));
      if (i < ks.length) keys.push(ks[i]);
    });
    expect(depths.size).toBe(1);
    return [...depths][0] + 1;
  };
  walk(tree, true, null, null);
  return keys;
}

function randomOps(rand: () => number, count: number): BOp[] {
  const pool = Array.from({ length: 4 + Math.floor(rand() * 26) }, () => Math.floor(rand() * 100));
  const ops: BOp[] = [];
  let live = 0;
  for (let i = 0; i < count; i++) {
    const key = pool[Math.floor(rand() * pool.length)];
    const r = rand();
    if (r < 0.55 && live < BTREE_LIMITS.maxKeys) {
      ops.push({ kind: 'insert', key });
      live++;
    } else if (r < 0.85) ops.push({ kind: 'delete', key });
    else ops.push({ kind: 'search', key });
  }
  return ops;
}

describe('bTreeTrace against a sorted multiset', () => {
  it('keeps the same keys and every B-tree invariant after each operation', () => {
    const rand = rng(31);
    for (let trial = 0; trial < 160; trial++) {
      const t = 2 + Math.floor(rand() * 4);
      const ops = randomOps(rand, 1 + Math.floor(rand() * BTREE_LIMITS.maxOps));
      const run = bTreeTrace({ t, ops });
      const model: number[] = [];
      expect(run.steps.length).toBe(ops.length);
      ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'insert') {
          model.push(op.key);
          model.sort((a, b) => a - b);
        } else if (op.kind === 'delete') {
          const at = model.indexOf(op.key);
          if (at >= 0) model.splice(at, 1);
        } else {
          expect(step.result !== null, `search ${op.key}`).toBe(model.includes(op.key));
          if (step.result) expect(step.result[0][step.result[1]]).toBe(op.key);
        }
        expect(checkInvariants(step.tree, t)).toEqual(model);
      });
      expectWellFormed(run.frames, BTREE_CODE.length);
    }
  });

  it('draws the final tree with every frame role cleared', () => {
    const run = bTreeTrace(parseBTree('t 2; 1 2 3 4 5 6 7 8 9 -4 -8 ?5'));
    const last = run.frames[run.frames.length - 1].state;
    expect(last.nodes.every((n) => !n.role && (n.keys ?? []).every((k) => !k.role))).toBe(true);
    expect(last.floating).toBeUndefined();
  });
});

describe('bTreeTrace matches b_tree.py (golden fixtures)', () => {
  it('tree, search result and every split, borrow, merge, predecessor and successor after each operation', () => {
    const cases = fixtures.bTree as Array<{ t: number; ops: Array<[BOp['kind'], number]>; steps: Array<{ result: unknown; tree: BDump; events: unknown[] }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const ops = c.ops.map(([kind, key]): BOp => ({ kind, key }));
      const run = bTreeTrace({ t: c.t, ops });
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `t=${c.t} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        expect(got.tree, where).toEqual(want.tree);
        expect(got.result, where).toEqual(want.result);
        expect(got.events, where).toEqual(want.events);
      });
    }
  });
});

describe('bTreeTrace scenarios', () => {
  it('a root split moves the median up into a new root: the key keeps its id and glides', () => {
    const run = bTreeTrace(parseBTree('t 2; 10 20 30 40'));
    expect(run.steps[3].tree).toEqual([[20], [[[10], []], [[30, 40], []]]]);
    const before = run.frames.findIndex((f) => f.caption.startsWith('split_child(parent, 0)'));
    const cell = (i: number) => run.frames[i].state.nodes.flatMap((n) => (n.keys ?? []).map((k) => ({ node: n.id, ...k }))).find((k) => k.label === '20')!;
    const a = cell(before);
    const b = cell(before + 1);
    expect(a.id).toBe(b.id);
    expect(a.node).not.toBe(b.node);
    expect(b.node).toBe(run.frames[before + 1].state.root);
    expect(run.frames[before].state.nodes.find((n) => n.id === a.node)!.tag).toMatch(/full/);
  });

  it('uses the Python default t = 3 and the article walkthrough for t = 2', () => {
    expect(parseBTree('1 2 3').t).toBe(3);
    const run = bTreeTrace(parseBTree('t 2; 10 20 25 40 50 30 35 60 -40 -10 -30 -20'));
    expect(run.steps[7].tree).toEqual([[20, 40], [[[10], []], [[25, 30, 35], []], [[50, 60], []]]]);
    const tree = (i: number) => run.steps[i].tree;
    expect(tree(8)).toEqual([[20, 35], [[[10], []], [[25, 30], []], [[50, 60], []]]]);
    expect(run.steps[8].events).toEqual([['pred', 35]]);
    expect(tree(9)).toEqual([[25, 35], [[[20], []], [[30], []], [[50, 60], []]]]);
    expect(run.steps[9].events).toEqual([['borrowRight', 20]]);
    expect(tree(10)).toEqual([[25, 50], [[[20], []], [[35], []], [[60], []]]]);
    expect(tree(11)).toEqual([[50], [[[25, 35], []], [[60], []]]]);
    expect(run.steps[11].events).toEqual([['merge', 25]]);
  });

  it('deleting the last key of a two-level tree shrinks the root (the tree gets shorter)', () => {
    const run = bTreeTrace(parseBTree('t 2; 1 2 3 4 -4 -3'));
    expect(run.steps[4].tree[1].length).toBe(2);
    expect(run.steps[5].tree).toEqual([[1, 2], []]);
    expect(run.frames.some((f) => /one level shorter/.test(f.caption))).toBe(true);
  });

  it('stores duplicates and deletes one copy at a time', () => {
    const run = bTreeTrace(parseBTree('t 2; 5 5 5 3 5 -5 -5'));
    expect(checkInvariants(run.steps[4].tree, 2)).toEqual([3, 5, 5, 5, 5]);
    expect(checkInvariants(run.steps[6].tree, 2)).toEqual([3, 5, 5]);
  });

  it('stays under 2000 frames on the largest input', () => {
    for (const t of [2, 3, 5]) {
      const keys = Array.from({ length: BTREE_LIMITS.maxKeys }, (_, i) => (i * 37) % 100);
      const text = `t ${t}; ${keys.join(' ')} ${keys.slice(0, 6).map((k) => `-${k}`).join(' ')}`;
      const run = bTreeTrace(parseBTree(text));
      expect(run.steps.length).toBe(30);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });
});

describe('parseBTree', () => {
  it('reads the degree, the short forms and the words', () => {
    expect(parseBTree('t=4, 1 +2 -3 ?4 insert 5 delete 6 search 7')).toEqual({
      t: 4,
      ops: [
        { kind: 'insert', key: 1 },
        { kind: 'insert', key: 2 },
        { kind: 'delete', key: 3 },
        { kind: 'search', key: 4 },
        { kind: 'insert', key: 5 },
        { kind: 'delete', key: 6 },
        { kind: 'search', key: 7 },
      ],
    });
    expect(parseBTree('min_degree 2; 9').t).toBe(2);
  });

  it('gives friendly errors', () => {
    expect(() => parseBTree('')).toThrow(InputError);
    expect(() => parseBTree('t 1; 5')).toThrow(/at least 2/);
    expect(() => parseBTree('t 6; 5')).toThrow(/up to 5/);
    expect(() => parseBTree('1000')).toThrow(/0 to 999/);
    expect(() => parseBTree('abc')).toThrow(/not an operation/);
    expect(() => parseBTree('insert')).toThrow(/needs a key/);
    expect(() => parseBTree(Array.from({ length: 31 }, (_, i) => String(i)).join(' '))).toThrow(/At most 30/);
    expect(() => parseBTree(Array.from({ length: 25 }, (_, i) => String(i)).join(' '))).toThrow(/24 keys/);
  });
});
