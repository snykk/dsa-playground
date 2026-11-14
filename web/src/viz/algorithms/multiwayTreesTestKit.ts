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
 * and no two nodes of one row overlapping.
 */
export function expectWellFormed(frames: Array<Frame<MwState>>, codeLines: number) {
  expect(frames.length).toBeGreaterThan(0);
  for (const f of frames) {
    expect(f.caption.length, f.caption).toBeGreaterThan(15);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
    const s = f.state;
    const ids = s.nodes.map((n) => n.id);
    expect(new Set(ids).size, f.caption).toBe(ids.length);
    const drawn = new Set(ids);
    if (s.root !== null) expect(drawn.has(s.root), f.caption).toBe(true);
    const parents = new Map<string, string>();
    for (const n of s.nodes) {
      for (const c of n.children) {
        expect(drawn.has(c), `${f.caption}: child ${c}`).toBe(true);
        expect(parents.has(c), `${f.caption}: ${c} has two parents`).toBe(false);
        parents.set(c, n.id);
      }
    }
    // Every node hangs from the root (nothing drawn detached).
    for (const n of s.nodes) if (n.id !== s.root) expect(parents.has(n.id), `${f.caption}: ${n.id} is detached`).toBe(true);
    const cells = [...s.nodes.flatMap((n) => (n.keys ?? []).map((k) => k.id)), ...(s.floating ?? []).map((fl) => fl.cell.id)];
    expect(new Set(cells).size, f.caption).toBe(cells.length);
    for (const fl of s.floating ?? []) expect(drawn.has(fl.anchor), f.caption).toBe(true);
    for (const id of s.chain ?? []) expect(drawn.has(id), f.caption).toBe(true);
    for (const id of Object.keys(s.chainRoles ?? {})) expect(s.chain ?? [], f.caption).toContain(id);
    const layout = layoutMultiway(s);
    expect(layout.boxes.size).toBe(s.nodes.length);
    const rows = new Map<number, Array<{ l: number; r: number }>>();
    for (const b of layout.boxes.values()) rows.set(b.depth, [...(rows.get(b.depth) ?? []), { l: b.cx - b.w / 2, r: b.cx + b.w / 2 }]);
    for (const row of rows.values()) {
      row.sort((a, b) => a.l - b.l);
      for (let i = 1; i < row.length; i++) expect(row[i].l, f.caption).toBeGreaterThan(row[i - 1].r);
    }
  }
}
