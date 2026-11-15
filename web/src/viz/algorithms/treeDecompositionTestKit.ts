/** Test helpers shared by the heavy-light and centroid decomposition tests (random trees, frame checks). */
import { expect } from 'vitest';
import type { Frame } from '../core/types';
import type { RootedTreeState } from '../renderers/RootedTreeView';

/** A random tree on 0..n-1 with shuffled labels and edges in random order. */
export function randomTree(rand: () => number, n: number): Array<[number, number]> {
  const label = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [label[i], label[j]] = [label[j], label[i]];
  }
  const edges: Array<[number, number]> = [];
  for (let v = 1; v < n; v++) {
    const u = rand() < 0.6 ? Math.floor(rand() * v) : Math.max(0, v - 1 - Math.floor(rand() * 2));
    edges.push(rand() < 0.5 ? [label[u], label[v]] : [label[v], label[u]]);
  }
  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [edges[i], edges[j]] = [edges[j], edges[i]];
  }
  return edges;
}

/** Every frame: a caption, a line in range, unique vertices, children and pills that exist, a full row. */
export function expectTreeFramesWellFormed(frames: Array<Frame<RootedTreeState>>, codeLines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
    const keys = new Set<string>();
    for (const t of f.state.trees) {
      const ids = t.nodes.map((n) => n.id);
      expect(new Set(ids).size, f.caption).toBe(ids.length);
      const has = new Set(ids);
      if (t.root !== null) expect(has.has(t.root)).toBe(true);
      for (const n of t.nodes) {
        keys.add(`${t.id}/${n.id}`);
        for (const c of n.children) expect(has.has(c), f.caption).toBe(true);
      }
      for (const id of Object.keys(t.edges ?? {})) expect(has.has(id)).toBe(true);
      for (const c of t.chains ?? []) for (const id of c.nodes) expect(has.has(id)).toBe(true);
    }
    for (const t of f.state.trees) for (const n of t.nodes) if (n.from) expect(keys.has(n.from)).toBe(true);
    for (const p of f.state.pills ?? []) expect(keys.has(p.at), f.caption).toBe(true);
  }
}
