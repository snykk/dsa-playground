import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeTree } from '../renderers/TreeView';
import { frameProblems, type KeyOp } from './binaryTreesCommon';
import { parseRedBlack, RB_CODE, rbProblems, redBlackTrace, type RbNested } from './redBlackTree';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/binaryTrees.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const toOp = (op: [string, number?]): KeyOp => (op[1] === undefined ? { kind: op[0] as KeyOp['kind'] } : { kind: op[0] as KeyOp['kind'], key: op[1] });

const inorder = (t: RbNested): number[] => (t ? [...inorder(t[2]), t[0], ...inorder(t[3])] : []);
const heightNodes = (t: RbNested): number => (t ? 1 + Math.max(heightNodes(t[2]), heightNodes(t[3])) : 0);

describe('redBlackTrace', () => {
  it('keeps the red-black rules and the sorted multiset of keys after every operation (random scripts)', () => {
    const rand = rng(31);
    for (let t = 0; t < 200; t++) {
      const ops: KeyOp[] = [];
      let inserts = 0;
      const hi = [5, 20, 200][t % 3];
      for (let i = 0, n = 1 + Math.floor(rand() * 29); i < n; i++) {
        const r = rand();
        if (inserts < 15 && r < 0.7) {
          ops.push({ kind: 'insert', key: Math.floor(rand() * hi) });
          inserts++;
        } else if (r < 0.9) ops.push({ kind: 'search', key: Math.floor(rand() * hi) });
        else ops.push({ kind: rand() < 0.5 ? 'min' : 'max' });
      }
      const run = redBlackTrace({ ops });
      expect(frameProblems(run.frames, RB_CODE.length)).toEqual([]);
      const keys: number[] = [];
      ops.forEach((op, i) => {
        if (op.kind === 'insert') {
          keys.push(op.key!);
          keys.sort((a, b) => a - b);
        }
        const step = run.steps[i];
        expect(rbProblems(step.tree)).toEqual([]);
        expect(inorder(step.tree)).toEqual(keys);
        if (op.kind === 'search') expect(step.result).toBe(keys.includes(op.key!));
        if (op.kind === 'min') expect(step.result).toBe(keys.length ? keys[0] : null);
        if (op.kind === 'max') expect(step.result).toBe(keys.length ? keys[keys.length - 1] : null);
        expect(step.rotations.length).toBeLessThanOrEqual(2);
      });
      // Every drawn node carries its colour, so the B / R marker is always there.
      for (const f of run.frames) expect(f.state.nodes.every((n) => n.color === 'red' || n.color === 'black')).toBe(true);
    }
  });

  it('matches the Python RedBlackTree: colours, shape, results and rotations (golden fixtures)', () => {
    const cases = fixtures.redBlack as Array<{ ops: Array<[string, number?]>; steps: Array<{ result: unknown; tree: RbNested; rotations: string[]; height: number; size: number }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = redBlackTrace({ ops: c.ops.map(toOp) });
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = JSON.stringify(c.ops.slice(0, i + 1));
        expect(got.result, where).toEqual(want.result);
        expect(got.tree, where).toEqual(want.tree);
        expect(got.rotations, where).toEqual(want.rotations);
        expect(heightNodes(got.tree)).toBe(want.height);
        expect(inorder(got.tree).length).toBe(want.size);
      });
    }
  });

  it('names the cases: line, triangle and uncle-red recolor', () => {
    expect(redBlackTrace(parseRedBlack('10 20 30')).steps[2]).toMatchObject({ cases: [3], rotations: ['L 10'] });
    expect(redBlackTrace(parseRedBlack('30 10 20')).steps[2]).toMatchObject({ cases: [2, 3], rotations: ['L 10', 'R 30'] });
    const recolor = redBlackTrace(parseRedBlack('20 10 30 40'));
    expect(recolor.steps[3]).toMatchObject({ cases: [1], rotations: [] });
    expect(recolor.steps[3].tree).toEqual([20, 'B', [10, 'B', null, null], [30, 'B', null, [40, 'R', null, null]]]);
    const run = redBlackTrace(parseRedBlack('10 20 30 40 50 25'));
    expect(run.frames.some((f) => f.caption.startsWith('Case 1 (uncle red)'))).toBe(true);
    expect(run.frames.some((f) => f.caption.startsWith('Case 3 (line, mirrored)'))).toBe(true);
    expect(run.steps[5].tree).toEqual([20, 'B', [10, 'B', null, null], [40, 'R', [30, 'B', [25, 'R', null, null], null], [50, 'B', null, null]]]);
  });

  it('a rotation moves nodes: their columns change between two frames', () => {
    const frames = stabilizeTree(redBlackTrace(parseRedBlack('10 20 30')).frames);
    const at = frames.findIndex((f) => f.caption.startsWith('Rotated left at 10'));
    expect(at).toBeGreaterThan(0);
    expect(frames[at].state.root).not.toBe(frames[at - 1].state.root);
  });

  it('stays under 2000 frames on the largest input', () => {
    const text = `insert ${Array.from({ length: 15 }, (_, i) => i + 1).join(' ')} search ${Array.from({ length: 13 }, (_, i) => i * 2).join(' ')} min max`;
    const run = redBlackTrace(parseRedBlack(text));
    expect(run.frames.length).toBeLessThan(2000);
  });
});

describe('parseRedBlack', () => {
  it('reads verbs, short forms, duplicates and min / max', () => {
    expect(parseRedBlack('insert 5 5 search 5 ?6 +7 min max').ops).toEqual([
      { kind: 'insert', key: 5 },
      { kind: 'insert', key: 5 },
      { kind: 'search', key: 5 },
      { kind: 'search', key: 6 },
      { kind: 'insert', key: 7 },
      { kind: 'min' },
      { kind: 'max' },
    ]);
  });
  it.each(['', '-5', 'delete 5', '1000', '5@0.5', Array.from({ length: 16 }, () => '1').join(' ')])('rejects %j', (bad) => expect(() => parseRedBlack(bad)).toThrow(InputError));
});
