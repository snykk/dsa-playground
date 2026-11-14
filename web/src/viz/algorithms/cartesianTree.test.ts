import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { layoutTree, stabilizeTree } from '../renderers/TreeView';
import { frameProblems } from './binaryTreesCommon';
import { CARTESIAN_CODE, cartesianTrace, parseCartesian, type CartNested } from './cartesianTree';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/binaryTrees.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const inorder = (t: CartNested): number[] => (t ? [...inorder(t[2]), t[0], ...inorder(t[3])] : []);
const heapOrdered = (t: CartNested, parent = -Infinity): boolean => !t || (t[0] >= parent && heapOrdered(t[2], t[0]) && heapOrdered(t[3], t[0]));

/** Brute force: index of the leftmost minimum, or -1 for an invalid range. */
function rmq(a: number[], l: number, r: number): number {
  if (!a.length || l < 0 || r >= a.length || l > r) return -1;
  let best = l;
  for (let i = l + 1; i <= r; i++) if (a[i] < a[best]) best = i;
  return best;
}

describe('cartesianTrace', () => {
  it('builds the tree whose in-order is the array and answers every range minimum like a brute force', () => {
    const rand = rng(61);
    for (let t = 0; t < 200; t++) {
      const n = Math.floor(rand() * 13);
      const hi = [3, 10, 999][t % 3];
      const array = Array.from({ length: n }, () => Math.floor(rand() * hi) - (t % 2 ? 0 : 5));
      const queries: Array<[number, number]> = Array.from({ length: Math.floor(rand() * 10) }, () => {
        const l = Math.floor(rand() * (n + 2)) - 1;
        return [l, rand() < 0.8 ? l + Math.floor(rand() * Math.max(1, n - l)) : Math.floor(rand() * (n + 2)) - 1];
      });
      const run = cartesianTrace({ array, queries });
      expect(frameProblems(run.frames, CARTESIAN_CODE.length)).toEqual([]);
      expect(inorder(run.tree)).toEqual(array);
      expect(heapOrdered(run.tree)).toBe(true);
      expect(run.results).toEqual(queries.map(([l, r]) => rmq(array, l, r)));
    }
  });

  it('matches the Python CartesianTree: tree, in-order and every get_min_index (golden fixtures)', () => {
    const cases = fixtures.cartesian as Array<{ array: number[]; queries: Array<[number, number]>; tree: CartNested; inorder: number[]; results: number[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = cartesianTrace({ array: c.array, queries: c.queries });
      expect(run.tree, JSON.stringify(c.array)).toEqual(c.tree);
      expect(inorder(run.tree)).toEqual(c.inorder);
      expect(run.results, JSON.stringify(c.queries)).toEqual(c.results);
    }
  });

  it('draws every node in the column of its array index, under which the array row sits', () => {
    const run = cartesianTrace(parseCartesian('9 3 7 1 8 12 10 20 15 18 5; rmq 4 8'));
    for (const f of run.frames) {
      const lay = layoutTree(f.state);
      for (const node of f.state.nodes) if (lay.cell.has(node.id)) expect(lay.cell.get(node.id)!.col).toBe(node.id - 1);
      expect(f.state.axis!.length).toBe(11);
    }
    // The query visits three nodes: 1 (index 3), 5 (index 10) and 8 (index 4).
    expect(run.paths[0]).toEqual([3, 10, 4]);
    expect(run.results).toEqual([4]);
  });

  it('pops only strictly greater values, so the leftmost of equal minima is the ancestor', () => {
    const run = cartesianTrace(parseCartesian('4 2 4 2 4; rmq 0 4, rmq 2 4'));
    expect(run.tree![1]).toBe(1);
    expect(run.results).toEqual([1, 3]);
  });

  it('keeps one picture size and stays under 2000 frames on the largest input', () => {
    const text = `12 11 10 9 8 7 6 5 4 3 2 1; ${Array.from({ length: 10 }, (_, i) => `rmq 0 ${i + 2}`).join(', ')}`;
    const frames = stabilizeTree(cartesianTrace(parseCartesian(text)).frames);
    expect(frames.length).toBeLessThan(2000);
    expect(new Set(frames.map((f) => JSON.stringify(f.state.extent))).size).toBe(1);
  });
});

describe('parseCartesian', () => {
  it('reads the array and queries in several forms', () => {
    expect(parseCartesian('[9, 3, 7, -1]; rmq 0 2, min(1, 3)\nq [2,3]')).toEqual({
      array: [9, 3, 7, -1],
      queries: [
        [0, 2],
        [1, 3],
        [2, 3],
      ],
    });
    expect(parseCartesian('5 4; rmq -1 3').queries).toEqual([[-1, 3]]);
  });
  it.each(['', 'rmq 1 2', '1 2; 3 4', '1 x 3', '1000', '1 2; rmq 1', Array.from({ length: 13 }, () => '1').join(' ')])('rejects %j', (bad) =>
    expect(() => parseCartesian(bad)).toThrow(InputError),
  );
});
