import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CENTROID_CODE, centroidTrace, parseCentroid, type CentroidCall } from './centroid';
import { adjacency } from './heavyLight';
import { expectTreeFramesWellFormed, randomTree } from './treeDecompositionTestKit';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/specializedTechniques.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Sizes of the components left when `drop` is removed from `piece` (a set of nodes). */
function componentsWithout(adj: number[][], piece: Set<number>, drop: number): number[] {
  const seen = new Set([drop]);
  const sizes: number[] = [];
  for (const start of piece) {
    if (seen.has(start)) continue;
    let count = 0;
    const stack = [start];
    seen.add(start);
    while (stack.length) {
      const x = stack.pop()!;
      count += 1;
      for (const v of adj[x]) {
        if (piece.has(v) && !seen.has(v)) {
          seen.add(v);
          stack.push(v);
        }
      }
    }
    sizes.push(count);
  }
  return sizes;
}

describe('centroidTrace matches centroid_decomposition.py (golden fixtures)', () => {
  const cases = fixtures.centroid as Array<{ n: number; edges: Array<[number, number]>; root: number; calls: CentroidCall[]; parent: number[]; tree: number[][] }>;

  it('every decompose call (sizes written and read, the centroid), the parent array and get_centroid_tree()', () => {
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = centroidTrace({ n: c.n, edges: c.edges, root: c.root });
      const where = `${JSON.stringify(c.edges)} root ${c.root}`;
      expect(run.calls, where).toEqual(c.calls);
      expect(run.parent, where).toEqual(c.parent);
      expect(run.tree, where).toEqual(c.tree);
    }
  });
});

describe('centroidTrace against brute force', () => {
  it('each centroid leaves pieces of at most half, the centroid tree has one root and at most floor(log2 n) + 1 levels', () => {
    const rand = rng(31);
    for (let t = 0; t < 150; t++) {
      const n = 1 + Math.floor(rand() * 16);
      const edges = randomTree(rand, n);
      const root = Math.floor(rand() * n);
      const run = centroidTrace({ n, edges, root });
      const adj = adjacency(n, edges);
      expect(run.calls.length).toBe(n);
      expect(new Set(run.calls.map((c) => c.centroid)).size).toBe(n);
      expect(run.parent.filter((p) => p === -1).length).toBe(1);
      // Each call's piece is the set of nodes not removed before it that are reachable from u.
      const removed = new Set<number>();
      for (const call of run.calls) {
        const piece = new Set([call.u]);
        const stack = [call.u];
        while (stack.length) {
          const x = stack.pop()!;
          for (const v of adj[x]) if (!removed.has(v) && !piece.has(v)) piece.add(v), stack.push(v);
        }
        expect(call.total).toBe(piece.size);
        expect(piece.has(call.centroid)).toBe(true);
        for (const s of componentsWithout(adj, piece, call.centroid)) expect(s).toBeLessThanOrEqual(Math.floor(call.total / 2));
        removed.add(call.centroid);
      }
      for (let v = 0; v < n; v++) {
        let d = 1;
        for (let x = v; run.parent[x] !== -1; x = run.parent[x]) d += 1;
        expect(d).toBeLessThanOrEqual(Math.floor(Math.log2(n)) + 1);
      }
      expectTreeFramesWellFormed(run.frames, CENTROID_CODE.length);
    }
  });
});

describe('centroidTrace scenarios', () => {
  it('the article tree: parent = [2, -1, 1, 1, 1, 2, 4]', () => {
    const run = centroidTrace(parseCentroid('0-1 0-2 1-3 1-4 2-5 4-6'));
    expect(run.parent).toEqual([2, -1, 1, 1, 1, 2, 4]);
    expect(run.calls.map((c) => [c.u, c.p, c.centroid])).toEqual([
      [0, -1, 1],
      [0, 1, 2],
      [0, 2, 0],
      [5, 2, 5],
      [3, 1, 3],
      [4, 1, 4],
      [6, 4, 6],
    ]);
  });

  it('a path of 15 gives the balanced centroid tree of the article', () => {
    const path = Array.from({ length: 14 }, (_, i) => `${i}-${i + 1}`).join(' ');
    expect(centroidTrace(parseCentroid(path)).parent).toEqual([1, 3, 1, 7, 5, 3, 5, -1, 9, 11, 9, 7, 13, 11, 13]);
  });

  it('a removed centroid flies from the tree into the centroid tree', () => {
    const run = centroidTrace(parseCentroid('0-1 0-2 1-3 1-4 2-5 4-6'));
    const lift = run.frames.findIndex((f) => f.state.trees[1].nodes.some((n) => n.from));
    const node = run.frames[lift].state.trees[1].nodes.find((n) => n.from)!;
    expect([node.id, node.from, node.hidden]).toEqual(['1', 't/1', false]);
    expect(run.frames[lift + 1].state.trees[1].nodes.find((n) => n.id === '1')!.from).toBeUndefined();
    // The walk: pointer u moves from 0 to 1.
    expect(run.frames.slice(0, lift).flatMap((f) => (f.state.pills ?? []).map((p) => p.at))).toEqual(['t/1', 't/1']);
  });

  it('shows the call stack of the recursion', () => {
    const run = centroidTrace(parseCentroid('0-1 0-2 1-3 1-4 2-5 4-6'));
    const deepest = Math.max(...run.frames.map((f) => f.state.strips![0].items.length));
    expect(deepest).toBe(3);
  });

  it('a single node is its own centroid', () => {
    const run = centroidTrace(parseCentroid('n 1'));
    expect(run.parent).toEqual([-1]);
    expect(run.tree).toEqual([[]]);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const star = Array.from({ length: 15 }, (_, i) => `0-${i + 1}`).join(' ');
    const path = Array.from({ length: 15 }, (_, i) => `${i}-${i + 1}`).join(' ');
    expect(centroidTrace(parseCentroid(star)).frames.length).toBeLessThan(300);
    expect(centroidTrace(parseCentroid(path)).frames.length).toBeLessThan(300);
  });
});

describe('parseCentroid', () => {
  it('reads the edges and an optional root', () => {
    expect(parseCentroid('0-1 0-2; root 2')).toEqual({
      n: 3,
      edges: [
        [0, 1],
        [0, 2],
      ],
      root: 2,
    });
    expect(parseCentroid('0-1').root).toBe(0);
  });

  it('rejects operations: the code has none', () => {
    expect(() => parseCentroid('0-1; lca 0 1')).toThrow(/no queries/);
    expect(() => parseCentroid('0-1; root 5')).toThrow(/IndexError/);
  });
});
