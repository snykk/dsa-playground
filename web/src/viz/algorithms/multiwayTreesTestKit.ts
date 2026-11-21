/**
 * Shared checks for the multiway-tree tracer tests (bTree, bPlusTree, trie, suffixTree): every
 * frame must be drawable by MultiwayTreeView. Not a test file itself.
 */
import { expect } from 'vitest';
import type { Frame } from '../core/types';
import { layoutMultiway, type MwState } from '../renderers/MultiwayTreeView';

/** A seeded linear congruential generator, so random scripts are the same on every run. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/**
 * Every frame: a caption that explains, a line in range, unique node ids and key ids, children
 * and floating keys that point at drawn nodes, a chain of drawn leaves, one parent per node,
 * and no two nodes of one row overlapping. Returns one readable line per problem, so a test
 * asserts once per run instead of once per node.
 */
export function wellFormedProblems(frames: Array<Frame<MwState>>, codeLines: number): string[] {
  const out: string[] = [];
  if (frames.length === 0) out.push('no frames');
  for (const f of frames) {
    if (f.caption.length <= 15) out.push(`caption of ${f.caption.length} characters, want more than 15: "${f.caption}"`);
    if (f.line !== undefined && (f.line < 0 || f.line >= codeLines)) out.push(`line ${f.line} outside 0..${codeLines - 1}: ${f.caption}`);
    const s = f.state;
    const ids = s.nodes.map((n) => n.id);
    if (new Set(ids).size !== ids.length) out.push(`repeated node ids [${ids}]: ${f.caption}`);
    const drawn = new Set(ids);
    if (s.root !== null && !drawn.has(s.root)) out.push(`root ${s.root} is not drawn: ${f.caption}`);
    const parents = new Map<string, string>();
    for (const n of s.nodes) {
      for (const c of n.children) {
        if (!drawn.has(c)) out.push(`child ${c} of ${n.id} is not drawn: ${f.caption}`);
        if (parents.has(c)) out.push(`${c} has two parents, ${parents.get(c)} and ${n.id}: ${f.caption}`);
        parents.set(c, n.id);
      }
    }
    // Every node hangs from the root (nothing drawn detached).
    for (const n of s.nodes) if (n.id !== s.root && !parents.has(n.id)) out.push(`${n.id} is detached: ${f.caption}`);
    const cells = [...s.nodes.flatMap((n) => (n.keys ?? []).map((k) => k.id)), ...(s.floating ?? []).map((fl) => fl.cell.id)];
    if (new Set(cells).size !== cells.length) out.push(`repeated key ids [${cells}]: ${f.caption}`);
    for (const fl of s.floating ?? []) if (!drawn.has(fl.anchor)) out.push(`floating key ${fl.cell.id} hangs from ${fl.anchor}, which is not drawn: ${f.caption}`);
    for (const id of s.chain ?? []) if (!drawn.has(id)) out.push(`chain node ${id} is not drawn: ${f.caption}`);
    for (const id of Object.keys(s.chainRoles ?? {})) if (!(s.chain ?? []).includes(id)) out.push(`chain role for ${id}, which is not in the chain: ${f.caption}`);
    const layout = layoutMultiway(s);
    if (layout.boxes.size !== s.nodes.length) out.push(`${layout.boxes.size} boxes laid out for ${s.nodes.length} nodes: ${f.caption}`);
    const rows = new Map<number, Array<{ l: number; r: number }>>();
    for (const b of layout.boxes.values()) rows.set(b.depth, [...(rows.get(b.depth) ?? []), { l: b.cx - b.w / 2, r: b.cx + b.w / 2 }]);
    for (const [depth, row] of rows) {
      row.sort((a, b) => a.l - b.l);
      for (let i = 1; i < row.length; i++) {
        if (!(row[i].l > row[i - 1].r)) out.push(`two boxes overlap on row ${depth} (${row[i - 1].r} >= ${row[i].l}): ${f.caption}`);
      }
    }
  }
  return out;
}

export function expectWellFormed(frames: Array<Frame<MwState>>, codeLines: number) {
  expect(wellFormedProblems(frames, codeLines)).toEqual([]);
}
