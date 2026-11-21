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

/**
 * Every frame: a caption, a line in range, unique vertices, children and pills that exist, a full
 * row. Returns one readable line per problem, so a test asserts once per run instead of once per node.
 */
export function treeFrameProblems(frames: Array<Frame<RootedTreeState>>, codeLines: number): string[] {
  const out: string[] = [];
  for (const f of frames) {
    if (f.caption.length <= 10) out.push(`caption too short: "${f.caption}"`);
    if (f.line !== undefined && (f.line < 0 || f.line >= codeLines)) out.push(`line ${f.line} outside 0..${codeLines - 1}: ${f.caption}`);
    const keys = new Set<string>();
    for (const t of f.state.trees) {
      const ids = t.nodes.map((n) => n.id);
      if (new Set(ids).size !== ids.length) out.push(`tree ${t.id} repeats node ids [${ids}]: ${f.caption}`);
      const has = new Set(ids);
      if (t.root !== null && !has.has(t.root)) out.push(`tree ${t.id}: root ${t.root} is not drawn: ${f.caption}`);
      for (const n of t.nodes) {
        keys.add(`${t.id}/${n.id}`);
        for (const c of n.children) if (!has.has(c)) out.push(`tree ${t.id}: child ${c} of ${n.id} is not drawn: ${f.caption}`);
      }
      for (const id of Object.keys(t.edges ?? {})) if (!has.has(id)) out.push(`tree ${t.id}: an edge style for ${id}, which is not drawn: ${f.caption}`);
      for (const c of t.chains ?? []) for (const id of c.nodes) if (!has.has(id)) out.push(`tree ${t.id}: chain node ${id} is not drawn: ${f.caption}`);
    }
    for (const t of f.state.trees) for (const n of t.nodes) if (n.from && !keys.has(n.from)) out.push(`tree ${t.id}: ${n.id} flies in from ${n.from}, which is not drawn: ${f.caption}`);
    for (const p of f.state.pills ?? []) if (!keys.has(p.at)) out.push(`a pill at ${p.at}, which is not drawn: ${f.caption}`);
  }
  return out;
}

export function expectTreeFramesWellFormed(frames: Array<Frame<RootedTreeState>>, codeLines: number) {
  expect(treeFrameProblems(frames, codeLines)).toEqual([]);
}
