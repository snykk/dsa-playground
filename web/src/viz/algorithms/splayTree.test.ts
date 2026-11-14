import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeTree } from '../renderers/TreeView';
import { frameProblems, type KeyOp } from './binaryTreesCommon';
import { parseSplay, SPLAY_CODE, splayTrace, type Nested } from './splayTree';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/binaryTrees.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const toOp = (op: [string, number?]): KeyOp => (op[1] === undefined ? { kind: op[0] as KeyOp['kind'] } : { kind: op[0] as KeyOp['kind'], key: op[1] });
const inorder = (t: Nested): number[] => (t ? [...inorder(t[1]), t[0], ...inorder(t[2])] : []);
const ordered = (t: Nested, lo = -Infinity, hi = Infinity): boolean => !t || (t[0] > lo && t[0] < hi && ordered(t[1], lo, t[0]) && ordered(t[2], t[0], hi));

describe('splayTrace', () => {
  it('agrees with a Set on random scripts; every access leaves the accessed (or last visited) key at the root', () => {
    const rand = rng(41);
    for (let t = 0; t < 200; t++) {
      const ops: KeyOp[] = [];
      for (let i = 0, n = 1 + Math.floor(rand() * 29); i < n; i++) {
        const key = Math.floor(rand() * 15);
        const r = rand();
        ops.push(r < 0.45 ? { kind: 'insert', key } : r < 0.65 ? { kind: 'search', key } : r < 0.9 ? { kind: 'delete', key } : { kind: rand() < 0.5 ? 'min' : 'max' });
      }
      const run = splayTrace({ ops });
      expect(frameProblems(run.frames, SPLAY_CODE.length)).toEqual([]);
      const set = new Set<number>();
      ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'insert') set.add(op.key!);
        if (op.kind === 'delete') expect(step.result).toBe(set.delete(op.key!));
        if (op.kind === 'search') expect(step.found).toBe(set.has(op.key!));
        const keys = [...set].sort((a, b) => a - b);
        if (op.kind === 'min') expect(step.result).toBe(keys.length ? keys[0] : null);
        if (op.kind === 'max') expect(step.result).toBe(keys.length ? keys[keys.length - 1] : null);
        expect(inorder(step.tree)).toEqual(keys);
        expect(ordered(step.tree)).toBe(true);
        if ((op.kind === 'insert' || (op.kind === 'search' && set.has(op.key!))) && step.tree) expect(step.tree[0]).toBe(op.key);
      });
    }
  });

  it('matches the Python SplayTree: shape, results and every rotation (golden fixtures)', () => {
    const cases = fixtures.splay as Array<{ ops: Array<[string, number?]>; steps: Array<{ result: unknown; found?: boolean; tree: Nested; rotations: string[] }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = splayTrace({ ops: c.ops.map(toOp) });
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = JSON.stringify(c.ops.slice(0, i + 1));
        expect(got.result, where).toEqual(want.result);
        expect(got.tree, where).toEqual(want.tree);
        expect(got.rotations, where).toEqual(want.rotations);
        if (want.found !== undefined) expect(got.found, where).toBe(want.found);
      });
    }
  });

  it('names zig, zig-zig and zig-zag, and a miss splays the last node reached', () => {
    const zigzig = splayTrace(parseSplay('1 2 3 ?1'));
    expect(zigzig.steps[3]).toMatchObject({ rotations: ['R 3', 'R 2'], tree: [1, null, [2, null, [3, null, null]]] });
    expect(zigzig.frames.some((f) => f.caption.startsWith('Zig-zig'))).toBe(true);
    const zigzag = splayTrace(parseSplay('3 1 2'));
    expect(zigzag.steps[2]).toMatchObject({ rotations: ['R 3', 'L 1'], tree: [2, [1, null, null], [3, null, null]] });
    expect(zigzag.frames.some((f) => f.caption.startsWith('Zig-zag'))).toBe(true);
    const miss = splayTrace(parseSplay('10 20 30 ?25'));
    expect(miss.steps[3]).toMatchObject({ found: false, result: null });
    expect(miss.steps[3].tree![0]).toBe(20);
    const delMiss = splayTrace(parseSplay('10 20 30 -5'));
    expect(delMiss.steps[3]).toMatchObject({ result: false });
    expect(delMiss.steps[3].tree![0]).toBe(10);
  });

  it('delete draws the two halves side by side, then joins them under the maximum of the left half', () => {
    const run = splayTrace(parseSplay('50 30 70 20 40 -40'));
    const split = run.frames.find((f) => (f.state.forest?.length ?? 0) === 3)!;
    expect(split.state.forest!.map((t) => t.label)).toEqual(['left half', 'deleted', 'right half']);
    expect(run.steps[5].tree![0]).toBe(30);
    expect(run.steps[5].tree).toEqual([30, [20, null, null], [70, [50, null, null], null]]);
  });

  it('keeps one picture size and stays under 2000 frames on the largest input', () => {
    const text = `insert ${Array.from({ length: 10 }, (_, i) => i + 1).join(' ')} search 1 2 3 4 5 6 7 8 9 10 delete 5 6 7 8 9 10 1 2 3 4`;
    const frames = stabilizeTree(splayTrace(parseSplay(text)).frames);
    expect(frames.length).toBeLessThan(2000);
    expect(new Set(frames.map((f) => JSON.stringify(f.state.extent))).size).toBe(1);
  });
});

describe('parseSplay', () => {
  it('reads every verb and short form', () => {
    expect(parseSplay('1 2 ?2 -1 delete 2 min max find 3').ops).toEqual([
      { kind: 'insert', key: 1 },
      { kind: 'insert', key: 2 },
      { kind: 'search', key: 2 },
      { kind: 'delete', key: 1 },
      { kind: 'delete', key: 2 },
      { kind: 'min' },
      { kind: 'max' },
      { kind: 'search', key: 3 },
    ]);
  });
  it.each(['', 'x', '1000', Array.from({ length: 11 }, (_, i) => i).join(' ')])('rejects %j', (bad) => expect(() => parseSplay(bad)).toThrow(InputError));
});
