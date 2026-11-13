import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { avlTrace, bstTrace, parseOps, treeFromState, type Op } from './tree';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function randomOps(rand: () => number, count: number): Op[] {
  const ops: Op[] = [];
  for (let i = 0; i < count; i++) {
    const key = Math.floor(rand() * 40);
    const x = rand();
    ops.push({ kind: x < 0.6 ? 'insert' : x < 0.85 ? 'delete' : 'search', key });
  }
  return ops;
}

function referenceKeys(ops: Op[]): number[] {
  const set = new Set<number>();
  for (const op of ops) {
    if (op.kind === 'insert') set.add(op.key);
    else if (op.kind === 'delete') set.delete(op.key);
  }
  return [...set].sort((a, b) => a - b);
}

describe('parseOps', () => {
  it('reads inserts, deletes and searches', () => {
    expect(parseOps('5 +7 -5 ?7')).toEqual([
      { kind: 'insert', key: 5 },
      { kind: 'insert', key: 7 },
      { kind: 'delete', key: 5 },
      { kind: 'search', key: 7 },
    ]);
  });
  it.each(['', 'x', '1000', '--5'])('rejects %j', (bad) => expect(() => parseOps(bad)).toThrow(InputError));
});

describe.each([
  ['BST', bstTrace, false],
  ['AVL', avlTrace, true],
] as const)('%s', (_name, trace, mustBalance) => {
  it('keeps BST order and the right key set after random operations', () => {
    const rand = rng(mustBalance ? 11 : 5);
    for (let t = 0; t < 150; t++) {
      const ops = randomOps(rand, 1 + Math.floor(rand() * 30));
      const frames = trace(ops);
      const tree = treeFromState(frames[frames.length - 1].state);
      expect(tree.ordered).toBe(true);
      expect(tree.keys).toEqual(referenceKeys(ops));
      if (mustBalance) expect(tree.balanced).toBe(true);
    }
  });

  it('every frame is a well-formed tree', () => {
    const rand = rng(99);
    for (let t = 0; t < 40; t++) {
      for (const f of trace(randomOps(rand, 20))) {
        const tree = treeFromState(f.state);
        expect(tree.ordered).toBe(true);
        expect(tree.keys.length).toBe(f.state.nodes.length); // nothing detached or duplicated
      }
    }
  });

  it('reports search hits and misses', () => {
    const frames = trace(parseOps('50 30 70 ?70 ?65'));
    const captions = frames.map((f) => f.caption);
    expect(captions).toContain('Found 70.');
    expect(captions.some((c) => c.includes('65 is not in the tree'))).toBe(true);
  });
});

describe('AVL rotations', () => {
  it.each([
    ['30 20 10', 20, 'Left-Left'],
    ['10 20 30', 20, 'Right-Right'],
    ['30 10 20', 20, 'Left-Right'],
    ['10 30 20', 20, 'Right-Left'],
  ])('%s rotates into root %i (%s case)', (input, root, label) => {
    const frames = avlTrace(parseOps(input));
    expect(frames[frames.length - 1].state.root).toBe(root);
    expect(frames.some((f) => f.caption.startsWith(`${label} case`))).toBe(true);
  });

  it('keeps sorted input logarithmic instead of a linked list', () => {
    const keys = Array.from({ length: 30 }, (_, i) => i + 1).join(' ');
    const frames = avlTrace(parseOps(keys));
    const height = Object.fromEntries(frames[frames.length - 1].vars ?? []).height;
    expect(height).toBeLessThanOrEqual(6); // AVL height bound ~1.44 log2(31) = 7.1; actual is 5
    const bstHeight = Object.fromEntries(bstTrace(parseOps(keys)).at(-1)!.vars ?? []).height;
    expect(bstHeight).toBe(30);
  });
});
