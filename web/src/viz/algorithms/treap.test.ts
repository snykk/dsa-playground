import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeTree } from '../renderers/TreeView';
import { frameProblems, type KeyOp } from './binaryTreesCommon';
import { parseTreap, TREAP_CODE, treapTrace, type TreapNested } from './treap';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/binaryTrees.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const toOp = (op: [string, number, number?]): KeyOp => ({ kind: op[0] as KeyOp['kind'], key: op[1], ...(op[2] !== undefined ? { priority: op[2] } : {}) });
const inorder = (t: TreapNested): number[] => (t ? [...inorder(t[2]), t[0], ...inorder(t[3])] : []);
/** BST order on keys and max-heap order on priorities. */
const valid = (t: TreapNested, lo = -Infinity, hi = Infinity, top = Infinity): boolean =>
  !t || (t[0] > lo && t[0] < hi && t[1] <= top && valid(t[2], lo, t[0], t[1]) && valid(t[3], t[0], hi, t[1]));

describe('treapTrace', () => {
  it('agrees with a Set and keeps both orders on random seeded scripts', () => {
    const rand = rng(51);
    for (let t = 0; t < 200; t++) {
      const ops: KeyOp[] = [];
      for (let i = 0, n = 1 + Math.floor(rand() * 23); i < n; i++) {
        const key = Math.floor(rand() * 15);
        const r = rand();
        if (r < 0.5) ops.push(rand() < 0.2 ? { kind: 'insert', key, priority: Math.floor(rand() * 4) / 4 } : { kind: 'insert', key });
        else if (r < 0.8) ops.push({ kind: 'delete', key });
        else ops.push({ kind: 'search', key });
      }
      const run = treapTrace({ ops, seed: Math.floor(rand() * 1000) });
      expect(frameProblems(run.frames, TREAP_CODE.length)).toEqual([]);
      const set = new Set<number>();
      ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'insert') {
          expect(step.result).toBe(!set.has(op.key!));
          expect(step.draws).toBe(!set.has(op.key!) && op.priority === undefined ? 1 : 0);
          set.add(op.key!);
        } else if (op.kind === 'delete') expect(step.result).toBe(set.delete(op.key!));
        else expect(step.result).toBe(set.has(op.key!));
        expect(inorder(step.tree)).toEqual([...set].sort((a, b) => a - b));
        expect(valid(step.tree)).toBe(true);
      });
    }
  });

  it('matches the Python Treap with the same draws: shape, priorities, results and draw counts (golden fixtures)', () => {
    const cases = fixtures.treap as Array<{ seed: number; ops: Array<[string, number, number?]>; steps: Array<{ result: boolean; tree: TreapNested; draws: number; size: number }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = treapTrace({ ops: c.ops.map(toOp), seed: c.seed });
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `seed ${c.seed} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        expect(got.result, where).toBe(want.result);
        expect(got.tree, where).toEqual(want.tree);
        expect(got.draws, where).toBe(want.draws);
        expect(inorder(got.tree).length).toBe(want.size);
      });
    }
  });

  it('reproduces the article example with fixed priorities', () => {
    const run = treapTrace(parseTreap('insert 5@0.9 2@0.6 8@0.4 6@0.7, delete 5'));
    expect(run.steps[3].tree).toEqual([5, 0.9, [2, 0.6, null, null], [6, 0.7, null, [8, 0.4, null, null]]]);
    expect(run.steps[4].tree).toEqual([6, 0.7, [2, 0.6, null, null], [8, 0.4, null, null]]);
    expect(run.steps.every((s) => s.draws === 0)).toBe(true);
    // A split draws the parts side by side: left part, new node, right part.
    const split = run.frames.find((f) => f.caption.startsWith('The split is done') && f.state.forest?.length === 3)!;
    expect(split.state.forest!.map((t) => t.label)).toEqual(['keys < 6', 'new', 'keys > 6']);
  });

  it('the same seed gives the same tree, another seed may not', () => {
    const a = treapTrace(parseTreap('seed 7; insert 1 2 3 4 5 6 7 8'));
    const b = treapTrace(parseTreap('seed 7; insert 1 2 3 4 5 6 7 8'));
    expect(a.steps[7].tree).toEqual(b.steps[7].tree);
    const shapes = new Set([1, 2, 3, 4, 5].map((s) => JSON.stringify(treapTrace({ ...parseTreap('insert 1 2 3 4 5 6 7 8'), seed: s }).steps[7].tree)));
    expect(shapes.size).toBeGreaterThan(1);
  });

  it('keeps one picture size and stays under 2000 frames on the largest input', () => {
    const text = `seed 3; insert ${Array.from({ length: 12 }, (_, i) => i + 1).join(' ')} delete 1 2 3 4 5 6 search 7 8 9 10 11 12`;
    const frames = stabilizeTree(treapTrace(parseTreap(text)).frames);
    expect(frames.length).toBeLessThan(2000);
    expect(new Set(frames.map((f) => JSON.stringify(f.state.extent))).size).toBe(1);
  });
});

describe('parseTreap', () => {
  it('reads the seed, fixed priorities and every verb', () => {
    expect(parseTreap('seed 9; insert 5@0.9 3, delete 5, ?3 -3 +4').toString).toBeDefined();
    expect(parseTreap('seed 9; insert 5@0.9 3, delete 5, ?3 -3 +4')).toEqual({
      seed: 9,
      ops: [
        { kind: 'insert', key: 5, priority: 0.9 },
        { kind: 'insert', key: 3 },
        { kind: 'delete', key: 5 },
        { kind: 'search', key: 3 },
        { kind: 'delete', key: 3 },
        { kind: 'insert', key: 4 },
      ],
    });
  });
  it.each(['', 'seed', 'seed x 1', 'seed 1 seed 2 3', '5@1.5', 'delete 5@0.5', 'min', Array.from({ length: 13 }, (_, i) => i).join(' ')])('rejects %j', (bad) =>
    expect(() => parseTreap(bad)).toThrow(InputError),
  );
});
