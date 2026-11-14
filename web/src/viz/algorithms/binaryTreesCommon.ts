/**
 * Shared pieces of the binary-tree lane (binary tree, red-black, splay, treap, Cartesian and
 * interval tree tracers): the operation-script reader for key-based trees and small helpers.
 */
import { InputError, type Frame } from '../core/types';
import type { TreeNodeView, TreeState } from '../renderers/TreeView';
import type { StripItem } from '../ui/molecules/Strip';

export type KeyOpKind = 'insert' | 'delete' | 'search' | 'min' | 'max';

export interface KeyOp {
  kind: KeyOpKind;
  key?: number;
  /** Treap only: a priority fixed by the script ("insert 6@0.7"). */
  priority?: number;
}

export interface KeyScript {
  ops: KeyOp[];
  seed?: number;
}

export interface KeyScriptOptions {
  /** Which verbs this tree has. */
  kinds: KeyOpKind[];
  maxOps: number;
  /** Most distinct keys that may be in the tree at once (so the picture stays legible). */
  maxKeys: number;
  /** Count a repeated insert as a new key (a red-black tree keeps duplicates). */
  multiset?: boolean;
  /** Accept "seed 7" and "6@0.7" (the treap). */
  priorities?: boolean;
  example: string;
}

const VERBS: Record<string, KeyOpKind> = {
  insert: 'insert',
  ins: 'insert',
  i: 'insert',
  add: 'insert',
  put: 'insert',
  search: 'search',
  find: 'search',
  s: 'search',
  contains: 'search',
  has: 'search',
  get: 'search',
  delete: 'delete',
  del: 'delete',
  d: 'delete',
  remove: 'delete',
  rm: 'delete',
  erase: 'delete',
  min: 'min',
  find_min: 'min',
  max: 'max',
  find_max: 'max',
};

/**
 * Read "insert 5 3 8, search 3, delete 5" or the short form "5 3 8 ?3 -5". A verb applies to the
 * numbers after it until the next verb; +k, -k and ?k insert, delete and search one key. Keys are 0..999.
 */
export function parseKeyScript(text: string, o: KeyScriptOptions): KeyScript {
  const tokens = text
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter(Boolean);
  const ops: KeyOp[] = [];
  let mode: KeyOpKind = 'insert';
  let seed: number | undefined;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (o.priorities && t === 'seed') {
      const v = tokens[i + 1];
      if (v === undefined || !/^\d{1,10}$/.test(v)) throw new InputError('Write the seed as a whole number, e.g. "seed 7".');
      if (seed !== undefined) throw new InputError('Give the seed ("seed 7") only once.');
      seed = Number(v);
      if (seed > 4294967295) throw new InputError('The seed must be below 4294967296.');
      i++;
      continue;
    }
    if (/^[a-z_]+$/.test(t)) {
      const kind = VERBS[t];
      if (!kind || !o.kinds.includes(kind)) throw new InputError(`"${t}" is not an operation here. ${o.example}`);
      if (kind === 'min' || kind === 'max') ops.push({ kind });
      else mode = kind;
      continue;
    }
    const m = t.match(/^([+?-]?)(\d{1,4})(?:@(\d*\.?\d+))?$/);
    if (!m) throw new InputError(`"${t}" is not a key or an operation. ${o.example}`);
    const key = Number(m[2]);
    if (key > 999) throw new InputError(`Keys go from 0 to 999 (got ${m[2]}).`);
    const kind: KeyOpKind = m[1] === '+' ? 'insert' : m[1] === '-' ? 'delete' : m[1] === '?' ? 'search' : mode;
    if (!o.kinds.includes(kind)) throw new InputError(`This tree has no ${kind}. ${o.example}`);
    const op: KeyOp = { kind, key };
    if (m[3] !== undefined) {
      if (!o.priorities) throw new InputError(`"${t}": only a treap takes a priority after @.`);
      if (kind !== 'insert') throw new InputError(`"${t}": a priority belongs to an insert, as in "insert 6@0.7".`);
      const p = Number(m[3]);
      if (!(p >= 0 && p < 1)) throw new InputError(`A priority is a number from 0 up to (not including) 1, like random.random() returns (got ${m[3]}).`);
      op.priority = p;
    }
    ops.push(op);
  }
  if (ops.length === 0) throw new InputError(`Add at least one operation. ${o.example}`);
  if (ops.length > o.maxOps) throw new InputError(`At most ${o.maxOps} operations, please (got ${ops.length}).`);
  // Replay the key set so the tree stays a readable size.
  const live = new Map<number, number>();
  for (const op of ops) {
    if (op.kind === 'insert') {
      const n = live.get(op.key!) ?? 0;
      if (n > 0 && !o.multiset) continue;
      live.set(op.key!, n + 1);
      const total = [...live.values()].reduce((a, b) => a + b, 0);
      if (total > o.maxKeys) throw new InputError(`At most ${o.maxKeys} keys in the tree at once, so every node stays legible.`);
    } else if (op.kind === 'delete') {
      const n = live.get(op.key!) ?? 0;
      if (n > 0) live.set(op.key!, n - 1);
    }
  }
  return { ops, seed };
}

export function formatKeyOp(op: KeyOp): string {
  if (op.kind === 'min' || op.kind === 'max') return `find_${op.kind}()`;
  const name = op.kind === 'search' ? 'search' : op.kind;
  return `${name}(${op.key}${op.priority !== undefined ? `, p=${op.priority}` : ''})`;
}

/** The script as a strip: done operations muted, the current one active. */
export function opsStrip(labels: string[], current: number): { label: string; items: StripItem[] } {
  return {
    label: 'Operations',
    items: labels.map((text, i) => ({ text, role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  };
}

/** Python's repr of a list of ints: [1, 2, 3]. */
export function pyList(xs: Array<number | string>): string {
  return `[${xs.join(', ')}]`;
}

/** A mutable binary node shape every tracer of the lane can snapshot. */
export interface BNode {
  id: number;
  left: BNode | null;
  right: BNode | null;
}

/** Collect the nodes reachable from the given roots (pre-order), mapping each to its view. */
export function collectViews<N extends BNode>(roots: Array<N | null>, view: (n: N) => Omit<TreeNodeView, 'id' | 'left' | 'right'>): TreeNodeView[] {
  const out: TreeNodeView[] = [];
  const seen = new Set<number>();
  const walk = (n: N | null) => {
    if (!n || seen.has(n.id)) return;
    seen.add(n.id);
    out.push({ id: n.id, left: n.left?.id ?? null, right: n.right?.id ?? null, ...view(n) });
    walk(n.left as N | null);
    walk(n.right as N | null);
  };
  roots.forEach(walk);
  return out;
}

/** Ids of every node in a subtree. */
export function subtreeIds(n: BNode | null, out: number[] = []): number[] {
  if (!n) return out;
  out.push(n.id);
  subtreeIds(n.left, out);
  subtreeIds(n.right, out);
  return out;
}

/** Check a frame list for the tests: captions, line range, unique ids, edges that point at nodes of the frame. */
export function frameProblems(frames: Array<Frame<TreeState>>, codeLines: number): string[] {
  const out: string[] = [];
  frames.forEach((f, i) => {
    if (f.caption.length < 10) out.push(`frame ${i}: short caption`);
    if (f.line !== undefined && (f.line < 0 || f.line >= codeLines)) out.push(`frame ${i}: line ${f.line} out of range`);
    const ids = f.state.nodes.map((n) => n.id);
    if (new Set(ids).size !== ids.length) out.push(`frame ${i}: duplicate ids`);
    const has = new Set(ids);
    for (const n of f.state.nodes) {
      for (const c of [n.left, n.right]) if (c !== null && !has.has(c)) out.push(`frame ${i}: edge ${n.id}->${c} to a missing node`);
    }
    if (f.state.root !== null && !has.has(f.state.root)) out.push(`frame ${i}: missing root`);
    for (const t of f.state.forest ?? []) if (!has.has(t.root)) out.push(`frame ${i}: missing forest root`);
    // Every node has at most one parent.
    const parents = new Map<number, number>();
    for (const n of f.state.nodes) {
      for (const c of [n.left, n.right]) {
        if (c === null) continue;
        if (parents.has(c)) out.push(`frame ${i}: node ${c} has two parents`);
        parents.set(c, n.id);
      }
    }
  });
  return out;
}
