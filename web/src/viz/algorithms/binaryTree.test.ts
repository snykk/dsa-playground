import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeTree } from '../renderers/TreeView';
import { BINARY_TREE_CODE, binaryTreeTrace, parseBinaryTree, type BinaryTreeOp, type Nested } from './binaryTree';
import { frameProblems } from './binaryTreesCommon';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/binaryTrees.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const toOp = (op: [string, number?]): BinaryTreeOp => (op[0] === 'insert' || op[0] === 'search' ? { kind: op[0], value: op[1]! } : ({ kind: op[0] } as BinaryTreeOp));

/** Reference model: level-order insert into a complete tree is just an array; node i has children 2i + 1 and 2i + 2. */
function model(values: number[]) {
  const kid = (i: number) => (i < values.length ? i : -1);
  const pre = (i: number): number[] => (i < 0 ? [] : [values[i], ...pre(kid(2 * i + 1)), ...pre(kid(2 * i + 2))]);
  const ino = (i: number): number[] => (i < 0 ? [] : [...ino(kid(2 * i + 1)), values[i], ...ino(kid(2 * i + 2))]);
  const post = (i: number): number[] => (i < 0 ? [] : [...post(kid(2 * i + 1)), ...post(kid(2 * i + 2)), values[i]]);
  const nest = (i: number): Nested => (i < 0 ? null : [values[i], nest(kid(2 * i + 1)), nest(kid(2 * i + 2))]);
  return {
    tree: nest(kid(0)),
    inorder: ino(kid(0)),
    preorder: pre(kid(0)),
    postorder: post(kid(0)),
    level: [...values],
    height: values.length ? Math.floor(Math.log2(values.length)) : -1,
    size: values.length,
  };
}

function randomOps(rand: () => number): BinaryTreeOp[] {
  const ops: BinaryTreeOp[] = [];
  let inserts = 0;
  const kinds = ['inorder', 'preorder', 'postorder', 'level', 'height', 'size'] as const;
  for (let i = 0, n = 1 + Math.floor(rand() * 29); i < n; i++) {
    const r = rand();
    if (inserts < 15 && r < 0.55) {
      ops.push({ kind: 'insert', value: Math.floor(rand() * 20) });
      inserts++;
    } else if (r < 0.7) ops.push({ kind: 'search', value: Math.floor(rand() * 20) });
    else ops.push({ kind: kinds[Math.floor(rand() * kinds.length)] });
  }
  return ops;
}

describe('binaryTreeTrace', () => {
  it('agrees with an array model of the complete tree on random scripts, and every frame is well formed', () => {
    const rand = rng(21);
    for (let t = 0; t < 150; t++) {
      const ops = randomOps(rand);
      const run = binaryTreeTrace(ops);
      expect(frameProblems(run.frames, BINARY_TREE_CODE.length)).toEqual([]);
      const values: number[] = [];
      ops.forEach((op, i) => {
        if (op.kind === 'insert') values.push(op.value);
        const m = model(values);
        const step = run.steps[i];
        expect(step.tree).toEqual(m.tree);
        if (op.kind === 'search') expect(step.result).toBe(values.includes(op.value));
        else if (op.kind !== 'insert') expect(step.result).toEqual(m[op.kind]);
        else expect(step.result).toBeNull();
      });
    }
  });

  it('matches the Python BinaryTree (golden fixtures)', () => {
    const cases = fixtures.binaryTree as Array<{ ops: Array<[string, number?]>; steps: Array<{ result: unknown; tree: Nested }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(30);
    for (const c of cases) {
      const run = binaryTreeTrace(c.ops.map(toOp));
      c.steps.forEach((want, i) => {
        expect(run.steps[i].result, JSON.stringify(c.ops.slice(0, i + 1))).toEqual(want.result);
        expect(run.steps[i].tree).toEqual(want.tree);
      });
    }
  });

  it('grows the output one node at a time during a traversal', () => {
    const run = binaryTreeTrace(parseBinaryTree('insert 1 2 3 4 5 6 7, inorder'));
    const outputs = run.frames.map((f) => f.state.strips?.find((s) => s.label === 'Result')?.items.filter((x) => x.text !== '[ ]').map((x) => x.text).join(' ')).filter((x) => x !== undefined);
    expect(outputs).toContain('4 2 5');
    expect(outputs[outputs.length - 1]).toBe('4 2 5 1 6 3 7');
    expect(run.steps[7].result).toEqual([4, 2, 5, 1, 6, 3, 7]);
  });

  it('height counts edges: -1 empty, 0 for one node', () => {
    const run = binaryTreeTrace(parseBinaryTree('height, insert 4, height, insert 5 6 7, height'));
    expect(run.steps.filter((s) => s.op.kind === 'height').map((s) => s.result)).toEqual([-1, 0, 2]);
  });

  it('keeps one picture size for a run and stays under 2000 frames on the largest input', () => {
    const text = `insert ${Array.from({ length: 15 }, (_, i) => i + 1).join(' ')}, inorder, preorder, postorder, level, height, size, search 99, search 15, inorder, preorder, postorder, level, height, size, search 1`;
    const frames = stabilizeTree(binaryTreeTrace(parseBinaryTree(text)).frames);
    expect(frames.length).toBeLessThan(2000);
    expect(new Set(frames.map((f) => JSON.stringify(f.state.extent))).size).toBe(1);
  });
});

describe('parseBinaryTree', () => {
  it('reads values, verbs and short forms', () => {
    expect(parseBinaryTree('1 2 ?2 in pre post level height size search 3 4')).toEqual([
      { kind: 'insert', value: 1 },
      { kind: 'insert', value: 2 },
      { kind: 'search', value: 2 },
      { kind: 'inorder' },
      { kind: 'preorder' },
      { kind: 'postorder' },
      { kind: 'level' },
      { kind: 'height' },
      { kind: 'size' },
      { kind: 'search', value: 3 },
      { kind: 'search', value: 4 },
    ]);
  });
  it.each(['', 'delete 3', '1000', 'x', Array.from({ length: 16 }, (_, i) => i).join(' ')])('rejects %j', (bad) => expect(() => parseBinaryTree(bad)).toThrow(InputError));
});
