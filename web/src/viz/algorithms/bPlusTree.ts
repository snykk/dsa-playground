/**
 * B+ tree tracer, drawn with MultiwayTreeView (key-cell nodes, leaves linked by `next`).
 *
 * Mirrors Data_Structures/Non_Linear/Trees/B_Plus_Tree/Python/b_plus_tree.py, class
 * BPlusTree(min_degree=3): _find_leaf, search, insert / _insert_non_full / _split_child,
 * range_search and traverse. The repository has no delete.
 * Leaves hold the (key, value) pairs and the `next` pointers; internal nodes hold separators.
 * A full node (2t - 1 keys) is split before the insert enters it. A leaf split keeps
 * keys[:t-1], moves keys[t-1:] to a new right leaf, relinks the chain and COPIES the new leaf's
 * first key up; an internal split moves keys[t-1] UP and keeps it in neither half.
 * Descending, a key equal to a separator goes right (`key >= keys[i]`). insert first looks
 * the key up and, if the leaf has it, overwrites the value and returns (the tree is a map).
 * traverse() reaches the leftmost leaf through children[0] (v0.2.0 fix), then follows `next`.
 * Golden fixtures (__fixtures__/multiwayTrees.json, section bPlusTree) pin the tree, the leaf
 * chain, every result and every split after each operation.
 *
 * Input: "t 2; 10 20 30=x ?20 25..65 traverse"   (42 inserts with an automatic value a, b, c...)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { MwCell, MwFloat, MwNode, MwState } from '../renderers/MultiwayTreeView';
import type { StripItem } from '../ui/molecules/Strip';
import { BTREE_LIMITS, PYTHON_DEFAULT_T, parseKeyToken, splitDegree } from './bTree';

/* ---------- input ---------- */

export type BPOp =
  | { kind: 'insert'; key: number; value: string }
  | { kind: 'search'; key: number }
  | { kind: 'range'; lo: number; hi: number }
  | { kind: 'traverse' };

export interface BPlusInput {
  t: number;
  ops: BPOp[];
}

export const BPLUS_LIMITS = { minT: 2, maxT: 5, maxOps: 30, maxKeys: 24, maxKey: BTREE_LIMITS.maxKey };

const EXAMPLE = 'Write 42 or 42=x (insert), ?42 (search), 25..65 (range search) or traverse, for example "t 2; 10 20 30 ?20 15..30".';

/** The automatic value of the n-th insert of a script: a, b, c, ... */
export const autoValue = (n: number) => 'abcdefghijklmnopqrstuvwxyz'[n % 26];

function parseValue(token: string, segment: string): string {
  if (!/^[A-Za-z0-9_]{1,3}$/.test(token)) throw new InputError(`"${segment}": a value is a word of 1 to 3 letters or digits.`);
  return token;
}

/** Parse "t 2; 10 20 30=x ?20 25..65 traverse". Without a degree the tree gets the Python default t = 3. */
export function parseBPlusTree(text: string): BPlusInput {
  const { t, rest } = splitDegree(text);
  if (t !== undefined && (t < BPLUS_LIMITS.minT || t > BPLUS_LIMITS.maxT)) {
    throw new InputError(
      t < 2 ? `The minimum degree t must be at least 2 (got ${t}).` : `t goes up to ${BPLUS_LIMITS.maxT} here, so a full node (2t - 1 keys) still fits on screen (got ${t}).`,
    );
  }
  const tokens = rest.split(/[\s,;]+/).filter(Boolean);
  const ops: BPOp[] = [];
  let inserts = 0;
  const key = (tok: string, seg: string) => parseKeyToken(tok, BPLUS_LIMITS.maxKey, seg);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const low = tok.toLowerCase();
    const next = (n: number) => {
      const got = tokens.slice(i + 1, i + 1 + n);
      if (got.length < n) throw new InputError(`"${tok}" needs ${n === 1 ? 'a key' : 'two keys'} after it. ${EXAMPLE}`);
      i += n;
      return got;
    };
    let m: RegExpMatchArray | null;
    if (low === 'traverse' || low === 'all' || low === 'scan') ops.push({ kind: 'traverse' });
    else if (low === 'insert' || low === 'add') {
      const [k] = next(1);
      const kv = k.match(/^(\d+)(?:=(.*))?$/);
      if (!kv) throw new InputError(`"${tok} ${k}": write insert 42 or insert 42=x.`);
      ops.push({ kind: 'insert', key: key(kv[1], `${tok} ${k}`), value: kv[2] !== undefined ? parseValue(kv[2], `${tok} ${k}`) : autoValue(inserts) });
      inserts++;
    } else if (low === 'search' || low === 'find' || low === 'get') {
      const [k] = next(1);
      ops.push({ kind: 'search', key: key(k, `${tok} ${k}`) });
    } else if (low === 'range' || low === 'range_search') {
      const [a, b] = next(2);
      ops.push({ kind: 'range', lo: key(a, `${tok} ${a} ${b}`), hi: key(b, `${tok} ${a} ${b}`) });
    } else if ((m = tok.match(/^(\d+)\.\.(\d+)$/))) ops.push({ kind: 'range', lo: key(m[1], tok), hi: key(m[2], tok) });
    else if ((m = tok.match(/^\?(\d+)$/))) ops.push({ kind: 'search', key: key(m[1], tok) });
    else if ((m = tok.match(/^\+?(\d+)(?:=(.*))?$/))) {
      ops.push({ kind: 'insert', key: key(m[1], tok), value: m[2] !== undefined ? parseValue(m[2], tok) : autoValue(inserts) });
      inserts++;
    } else if (/^-\d+$/.test(tok)) throw new InputError(`"${tok}": the repository's B+ tree has no delete. ${EXAMPLE}`);
    else throw new InputError(`"${tok}" is not an operation. ${EXAMPLE}`);
  }
  if (ops.length === 0) throw new InputError(`Add at least one operation. ${EXAMPLE}`);
  if (ops.length > BPLUS_LIMITS.maxOps) throw new InputError(`At most ${BPLUS_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  const keys = new Set(ops.flatMap((op) => (op.kind === 'insert' ? [op.key] : [])));
  if (keys.size > BPLUS_LIMITS.maxKeys) throw new InputError(`At most ${BPLUS_LIMITS.maxKeys} different keys, so every leaf fits on screen (got ${keys.size}).`);
  return { t: t ?? PYTHON_DEFAULT_T, ops };
}

export function formatBPOp(op: BPOp): string {
  switch (op.kind) {
    case 'insert':
      return `insert(${op.key}, '${op.value}')`;
    case 'search':
      return `search(${op.key})`;
    case 'range':
      return `range_search(${op.lo}, ${op.hi})`;
    default:
      return 'traverse()';
  }
}

/* ---------- pseudocode (reads like b_plus_tree.py) ---------- */

export const BPLUS_CODE = [
  '_find_leaf(k): node = root',
  '  while not node.is_leaf: i = 0; while i < len(keys) and k >= keys[i]: i += 1; node = children[i]',
  'search(k): leaf = _find_leaf(k); return the value of k in leaf, else None',
  'insert(k, v): leaf = _find_leaf(k); if k in leaf.keys: overwrite its value; return',
  '  if len(root.keys) == 2t - 1: new_root.children = [root]; split_child(new_root, 0)',
  '  insert_non_full(root, k, v)',
  'insert_non_full(node, k, v): if leaf: insert (k, v) before the first key > k',
  '  else: i = number of keys <= k; if children[i] is full: split_child(node, i)',
  '    if k >= keys[i]: i += 1;  insert_non_full(children[i], k, v)',
  'split_child(parent, i): full = children[i]; mid = t - 1',
  '  leaf: new.keys = full.keys[mid:]; full.keys = full.keys[:mid]   (values too)',
  '    new.next = full.next; full.next = new; promote = new.keys[0]   # copy up',
  '  internal: new.keys = keys[mid+1:]; promote = keys[mid]; full.keys = keys[:mid]   # push up',
  '  parent.keys.insert(i, promote); parent.children.insert(i + 1, new)',
  'range_search(lo, hi): leaf = _find_leaf(lo)',
  '  while leaf: for key in leaf: lo <= key <= hi: append (key, value); key > hi: return result',
  '    leaf = leaf.next',
  'traverse(): leaf = root; while not leaf.is_leaf: leaf = leaf.children[0]',
  '  while leaf: append every (key, value) of leaf; leaf = leaf.next',
];

const L = {
  find: 0,
  findStep: 1,
  search: 2,
  insert: 3,
  rootFull: 4,
  insertRoot: 5,
  leaf: 6,
  child: 7,
  afterSplit: 8,
  split: 9,
  leafSplit: 10,
  link: 11,
  innerSplit: 12,
  promote: 13,
  range: 14,
  rangeScan: 15,
  rangeNext: 16,
  traverse: 17,
  traverseScan: 18,
};

/* ---------- tracer ---------- */

interface Sep {
  id: string;
  v: number;
}

interface LeafEntry {
  id: string;
  v: number;
  value: string;
}

interface PNode {
  id: string;
  leaf: boolean;
  /** Separators of an internal node. */
  keys: Sep[];
  /** Entries of a leaf. */
  entries: LeafEntry[];
  children: PNode[];
  next: PNode | null;
}

/** A node as the fixture stores it: ["L", [[key, value], ...]] or ["I", keys, children]. */
export type BPDump = ['L', Array<[number, string]>] | ['I', number[], BPDump[]];

export type BPEvent = ['leafSplit' | 'innerSplit', number];

export interface BPlusStep {
  op: BPOp;
  /** search: the value or null (None); range / traverse: the [key, value] pairs; insert: null. */
  result: string | null | Array<[number, string]>;
  tree: BPDump;
  /** The keys of every leaf, following `next` from the leftmost leaf. */
  chain: number[][];
  events: BPEvent[];
}

export interface BPlusRun {
  frames: Array<Frame<MwState>>;
  steps: BPlusStep[];
}

interface Snap {
  nodes?: Record<string, Role>;
  keys?: Record<string, Role>;
  edges?: Record<string, Role>;
  links?: Record<string, Role>;
  tags?: Record<string, string>;
  floating?: MwFloat[];
  hole?: { node: string; at: number };
  /** Values shown in place of the stored ones (an overwrite in progress). */
  values?: Record<string, string>;
  result?: StripItem[];
  vars?: Array<[string, string | number]>;
}

const nodeKeys = (n: PNode): number[] => (n.leaf ? n.entries.map((e) => e.v) : n.keys.map((s) => s.v));
const show = (n: PNode) => `[${nodeKeys(n).join(' ')}]`;
const keyCount = (n: PNode) => (n.leaf ? n.entries.length : n.keys.length);
const pair = (e: LeafEntry) => `(${e.v}, '${e.value}')`;
const leafName = (n: PNode) => (n.entries.length ? `the leaf ${show(n)}` : 'the empty root leaf');

export function dumpBPlusTree(n: PNode): BPDump {
  return n.leaf ? ['L', n.entries.map((e): [number, string] => [e.v, e.value])] : ['I', n.keys.map((s) => s.v), n.children.map(dumpBPlusTree)];
}

export function bPlusTrace(input: BPlusInput): BPlusRun {
  const { t, ops } = input;
  const maxKeys = 2 * t - 1;
  const mid = t - 1;
  let serial = 0;
  const newNode = (leaf: boolean): PNode => ({ id: `n${serial++}`, leaf, keys: [], entries: [], children: [], next: null });
  const newSep = (v: number): Sep => ({ id: `s${serial++}`, v });
  let root = newNode(true);
  const frames: Array<Frame<MwState>> = [];
  const steps: BPlusStep[] = [];
  let current = -1;
  let events: BPEvent[] = [];
  let path: Record<string, Role> = {};
  let visited = 0;
  let probe: MwCell & { tag: string } = { id: 'probe', label: '', tag: '' };
  let probeOn = false;

  const leftmost = () => {
    let n = root;
    while (!n.leaf) n = n.children[0];
    return n;
  };
  const chainOf = (): PNode[] => {
    const out: PNode[] = [];
    for (let n: PNode | null = leftmost(); n; n = n.next) out.push(n);
    return out;
  };
  const height = () => {
    let h = 1;
    for (let n = root; !n.leaf; n = n.children[0]) h++;
    return h;
  };

  const opStrip = () => ({
    label: 'Operations',
    items: ops.map((op, i): StripItem => ({ text: formatBPOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  });

  const fl = (n: PNode, slot?: number): MwFloat[] => (probeOn ? [{ cell: { id: probe.id, label: probe.label, role: probe.role }, anchor: n.id, slot, tag: probe.tag }] : []);

  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const nodes: MwNode[] = [];
    const walk = (n: PNode) => {
      const keys: MwCell[] = n.leaf
        ? n.entries.map((e) => ({ id: e.id, label: String(e.v), sub: o.values?.[e.id] ?? e.value, role: o.keys?.[e.id] }))
        : n.keys.map((s) => ({ id: s.id, label: String(s.v), role: o.keys?.[s.id] }));
      if (o.hole?.node === n.id) keys.splice(o.hole.at, 0, { id: `hole:${n.id}`, label: '', sub: n.leaf ? '' : undefined, ghost: true });
      nodes.push({ id: n.id, keys, children: n.children.map((c) => c.id), role: o.nodes?.[n.id], tag: o.tags?.[n.id] });
      n.children.forEach(walk);
    };
    walk(root);
    const strips = [opStrip()];
    if (o.result) strips.push({ label: 'Result', items: o.result.length ? o.result : [{ text: '[]', role: 'muted' }] });
    frames.push({
      line,
      caption,
      vars: [
        ...(o.vars ?? []),
        ['t (min_degree)', t],
        ['keys per node', `${mid}..${maxKeys} (root 0..${maxKeys})`],
        ['pairs stored', chainOf().reduce((s, n) => s + n.entries.length, 0)],
        ['height (levels)', height()],
        ['nodes visited by this operation', visited],
      ],
      state: {
        nodes,
        root: root.id,
        edgeRoles: { ...path, ...(o.edges ?? {}) },
        chain: chainOf().map((n) => n.id),
        chainRoles: o.links,
        floating: o.floating,
        strips,
      },
    });
  };

  /** _find_leaf(key): one frame per internal node; returns the leaf. */
  const findLeaf = (key: number, why: string): PNode => {
    let node = root;
    while (!node.leaf) {
      visited++;
      let i = 0;
      while (i < node.keys.length && key >= node.keys[i].v) i++;
      const roles: Record<string, Role> = {};
      node.keys.slice(0, i).forEach((s) => (roles[s.id] = 'compare'));
      const child = node.children[i];
      const passed = node.keys.slice(0, i).map((s) => s.v);
      snap(
        L.findStep,
        `${why}: ${passed.length ? `${key} >= ${passed.join(', ')}` : `${key} < ${node.keys[0].v}`}` +
          (passed.length && i < node.keys.length ? ` and ${key} < ${node.keys[i].v}` : '') +
          `, so i = ${i}: go to children[${i}] ${show(child)}.` +
          (passed.includes(key) ? ` A key equal to a separator goes right: the separator is the smallest key of its right subtree.` : ''),
        { nodes: { [node.id]: 'compare' }, keys: roles, edges: { [child.id]: 'compare' }, floating: fl(node, i) },
      );
      path[child.id] = 'compare';
      node = child;
    }
    visited++;
    return node;
  };

  /* ----- split_child ----- */

  const splitChild = (parent: PNode, index: number, hover: PNode) => {
    const full = parent.children[index];
    if (full.leaf) {
      const right = full.entries.slice(mid);
      const roles: Record<string, Role> = {};
      right.forEach((e) => (roles[e.id] = 'compare'));
      snap(
        L.leafSplit,
        `split_child(parent, ${index}): the leaf ${show(full)} is full (2t - 1 = ${maxKeys} keys). mid = t - 1 = ${mid}: keys[${mid}:] = ${right.map((e) => e.v).join(', ')} (with their values) move to a new right leaf, keys[:${mid}] stay.`,
        { nodes: { [full.id]: 'active' }, keys: roles, tags: { [full.id]: `full: ${maxKeys} keys` }, edges: { [full.id]: 'active' }, floating: fl(hover) },
      );
      const fresh = newNode(true);
      fresh.entries = right;
      full.entries = full.entries.slice(0, mid);
      fresh.next = full.next;
      full.next = fresh;
      const copy = newSep(fresh.entries[0].v);
      events.push(['leafSplit', copy.v]);
      // Drawn in two steps: the new leaf joins the parent while the copy hovers over its first
      // key, then the copy takes its place among the separators (Python inserts both at once).
      parent.children.splice(index + 1, 0, fresh);
      snap(
        L.link,
        `The new leaf ${show(fresh)} takes over full.next${fresh.next ? ` (the leaf ${show(fresh.next)})` : ' (None)'}, and full.next points to the new leaf, so the chain still visits every key in order. ` +
          `promote_key = new.keys[0] = ${copy.v} is COPIED: it stays in the leaf, where its value lives.`,
        {
          nodes: { [full.id]: 'done', [fresh.id]: 'done' },
          keys: { [fresh.entries[0].id]: 'compare' },
          links: { [full.id]: 'active', ...(fresh.next ? { [fresh.id]: 'active' } : {}) },
          edges: { [fresh.id]: 'active' },
          floating: [...fl(hover), { cell: { id: copy.id, label: String(copy.v), role: 'active' }, anchor: fresh.id, slot: 0, tag: 'copy' }],
        },
      );
      parent.keys.splice(index, 0, copy);
      snap(
        L.promote,
        `parent.keys.insert(${index}, ${copy.v}): the separator ${copy.v} now steers searches for keys >= ${copy.v} to the new leaf. ${copy.v} is in the tree twice: as a separator and in its leaf.`,
        { nodes: { [parent.id]: 'done' }, keys: { [copy.id]: 'active', [fresh.entries[0].id]: 'compare' }, edges: { [fresh.id]: 'done', [full.id]: 'done' }, floating: fl(hover) },
      );
      return;
    }
    const median = full.keys[mid];
    const right = full.keys.slice(mid + 1);
    const roles: Record<string, Role> = { [median.id]: 'active' };
    right.forEach((s) => (roles[s.id] = 'compare'));
    snap(
      L.innerSplit,
      `split_child(parent, ${index}): the internal node ${show(full)} is full (${maxKeys} keys). mid = t - 1 = ${mid}: the median ${median.v} moves UP, ` +
        `keys[${mid + 1}:] = ${right.map((s) => s.v).join(', ')} and the last ${t} children go to a new right node. Unlike a leaf split, ${median.v} stays in neither half.`,
      { nodes: { [full.id]: 'active' }, keys: roles, tags: { [full.id]: `full: ${maxKeys} keys` }, edges: { [full.id]: 'active' }, floating: fl(hover) },
    );
    const fresh = newNode(false);
    fresh.keys = right;
    fresh.children = full.children.slice(mid + 1);
    full.keys = full.keys.slice(0, mid);
    full.children = full.children.slice(0, mid + 1);
    parent.keys.splice(index, 0, median);
    parent.children.splice(index + 1, 0, fresh);
    events.push(['innerSplit', median.v]);
    snap(
      L.promote,
      `${median.v} moved up into the parent (pushed, not copied: an internal node holds only separators, and the leaf with ${median.v} still holds the key itself). ${show(full)} and ${show(fresh)} keep t - 1 = ${mid} key${mid === 1 ? '' : 's'} each.`,
      { nodes: { [full.id]: 'done', [fresh.id]: 'done' }, keys: { [median.id]: 'active' }, edges: { [full.id]: 'done', [fresh.id]: 'done' }, floating: fl(hover) },
    );
  };

  /* ----- insert ----- */

  const insertNonFull = (node: PNode, key: number, value: string) => {
    visited++;
    if (node.leaf) {
      let i = 0;
      while (i < node.entries.length && node.entries[i].v < key) i++;
      const bigger = node.entries.slice(i);
      const roles: Record<string, Role> = {};
      bigger.forEach((e) => (roles[e.id] = 'compare'));
      snap(
        L.leaf,
        (node.entries.length ? `${show(node)} is a leaf with room (${node.entries.length} < ${maxKeys} keys). ${key} goes before the first key greater than it: ` : `The root is an empty leaf: `) +
          (bigger.length
            ? `${bigger.map((e) => e.v).join(', ')} ${bigger.length === 1 ? 'shifts' : 'shift'} right (keys and values), and ${key} lands at index ${i}.`
            : node.entries.length
              ? `there is none, so it goes at the end (index ${i}).`
              : `${key} goes to index 0.`),
        { nodes: { [node.id]: 'compare' }, keys: roles, hole: { node: node.id, at: i }, floating: fl(node, i) },
      );
      const entry: LeafEntry = { id: probe.id, v: key, value };
      node.entries.splice(i, 0, entry);
      probeOn = false;
      snap(L.leaf, `keys.insert(${i}, ${key}) and values.insert(${i}, '${value}'): the leaf is ${show(node)}. Only leaves hold values.`, {
        nodes: { [node.id]: 'done' },
        keys: { [entry.id]: 'done' },
      });
      return;
    }
    let i = 0;
    while (i < node.keys.length && key >= node.keys[i].v) i++;
    const child = node.children[i];
    const full = keyCount(child) === maxKeys;
    const roles: Record<string, Role> = {};
    node.keys.slice(0, i).forEach((s) => (roles[s.id] = 'compare'));
    snap(
      L.child,
      `${i ? `${key} >= ${node.keys.slice(0, i).map((s) => s.v).join(', ')}` : `${key} < ${node.keys[0].v}`}, so i = ${i}: the key belongs under children[${i}] ${show(child)}.` +
        (full ? ` That child is full (${maxKeys} keys): split it before going down.` : ' It has room, so go down.'),
      { nodes: { [node.id]: 'compare', [child.id]: full ? 'active' : 'compare' }, keys: roles, edges: { [child.id]: 'compare' }, tags: full ? { [child.id]: 'full' } : {}, floating: fl(node, i) },
    );
    if (full) {
      splitChild(node, i, node);
      const sep = node.keys[i];
      const right = key >= sep.v;
      if (right) i++;
      snap(
        L.afterSplit,
        right ? `${key} >= the new separator ${sep.v}, so it goes to the right half: i = ${i}.` : `${key} < the new separator ${sep.v}, so it stays in the left half: i = ${i}.`,
        { nodes: { [node.children[i].id]: 'compare' }, keys: { [sep.id]: 'compare' }, edges: { [node.children[i].id]: 'compare' }, floating: fl(node) },
      );
    }
    path[node.children[i].id] = 'compare';
    insertNonFull(node.children[i], key, value);
  };

  const insert = (key: number, value: string) => {
    probe = { id: `e${serial++}`, label: String(key), role: 'active', tag: 'insert' };
    probeOn = true;
    snap(L.insert, `insert(${key}, '${value}'): first _find_leaf(${key}), to see whether the key is already stored.`, { nodes: { [root.id]: 'compare' }, floating: fl(root) });
    const leaf = findLeaf(key, 'Looking for the leaf');
    const at = leaf.entries.findIndex((e) => e.v === key);
    if (at >= 0) {
      const e = leaf.entries[at];
      const old = e.value;
      const roles: Record<string, Role> = {};
      leaf.entries.slice(0, at).forEach((x) => (roles[x.id] = 'compare'));
      snap(L.insert, `${key} is already in the leaf ${show(leaf)} with the value '${old}'. The tree is a map: overwrite the value and return, without changing the shape.`, {
        nodes: { [leaf.id]: 'compare' },
        keys: { ...roles, [e.id]: 'good' },
        floating: fl(leaf, at),
      });
      e.value = value;
      probeOn = false;
      snap(L.insert, `leaf.values[${at}] = '${value}' (was '${old}'). Nothing else changes.`, { nodes: { [leaf.id]: 'done' }, keys: { [e.id]: 'active' } });
      return;
    }
    snap(L.insert, `${key} is not in ${leafName(leaf)}: it is a new key. Insert it with a second pass from the root, splitting full nodes on the way down.`, {
      nodes: { [leaf.id]: 'compare' },
      floating: fl(leaf),
    });
    path = {};
    if (keyCount(root) === maxKeys) {
      const old = root;
      const fresh = newNode(false);
      fresh.children.push(old);
      root = fresh;
      snap(
        L.rootFull,
        `The root ${show(old)} is full (${maxKeys} keys). A new empty root goes above it, with the old root as children[0], so the split has a parent to receive the promoted key. The tree grows one level.`,
        { nodes: { [fresh.id]: 'active', [old.id]: 'active' }, tags: { [old.id]: 'full', [fresh.id]: 'new root' }, edges: { [old.id]: 'active' }, floating: fl(fresh) },
      );
      splitChild(fresh, 0, fresh);
    }
    insertNonFull(root, key, value);
  };

  /* ----- search, range_search, traverse ----- */

  const search = (key: number): string | null => {
    probe = { id: `p${serial++}`, label: String(key), role: 'compare', tag: 'search' };
    probeOn = true;
    snap(L.search, `search(${key}): descend to the one leaf that could hold ${key}. Even a separator equal to ${key} does not end the search: values live only in the leaves.`, {
      nodes: { [root.id]: 'compare' },
      floating: fl(root),
    });
    const leaf = findLeaf(key, 'Descending');
    const at = leaf.entries.findIndex((e) => e.v === key);
    const roles: Record<string, Role> = {};
    leaf.entries.slice(0, at >= 0 ? at : leaf.entries.length).forEach((e) => (roles[e.id] = 'compare'));
    probeOn = false;
    if (at >= 0) {
      const e = leaf.entries[at];
      snap(L.search, `The leaf ${show(leaf)} holds ${key} at index ${at}: search returns '${e.value}'.`, { nodes: { [leaf.id]: 'good' }, keys: { ...roles, [e.id]: 'good' } });
      return e.value;
    }
    snap(L.search, `${leafName(leaf)[0].toUpperCase()}${leafName(leaf).slice(1)} does not hold ${key}, and no other leaf can: search returns None.`, { nodes: { [leaf.id]: 'bad' }, keys: roles });
    return null;
  };

  const rangeSearch = (lo: number, hi: number): Array<[number, string]> => {
    probe = { id: `p${serial++}`, label: String(lo), role: 'compare', tag: `${lo}..${hi}` };
    probeOn = true;
    const result: LeafEntry[] = [];
    const items = () => result.map((e): StripItem => ({ text: pair(e), role: 'good' }));
    snap(L.range, `range_search(${lo}, ${hi}): find the leaf for ${lo}, then read the leaves left to right along next.${lo > hi ? ` The range is empty (${lo} > ${hi}), so the scan will stop at its first key.` : ''}`, {
      nodes: { [root.id]: 'compare' },
      floating: fl(root),
      result: items(),
    });
    let leaf: PNode | null = findLeaf(lo, 'Descending');
    probeOn = false;
    while (leaf) {
      const roles: Record<string, Role> = {};
      const took: number[] = [];
      const skipped: number[] = [];
      let stop: LeafEntry | null = null;
      for (const e of leaf.entries) {
        if (lo <= e.v && e.v <= hi) {
          result.push(e);
          took.push(e.v);
          roles[e.id] = 'good';
        } else if (e.v > hi) {
          stop = e;
          roles[e.id] = 'bad';
          break;
        } else {
          skipped.push(e.v);
          roles[e.id] = 'muted';
        }
      }
      const parts = [
        skipped.length ? `${skipped.join(', ')} ${skipped.length === 1 ? 'is' : 'are'} below ${lo} (skipped)` : '',
        took.length ? `${took.join(', ')} ${took.length === 1 ? 'is' : 'are'} in range (appended)` : '',
        stop ? `${stop.v} > ${hi}, so return the result` : '',
      ].filter(Boolean);
      const lead = `Leaf ${show(leaf)}: ${parts.join('; ') || 'no keys'}`;
      if (stop) {
        snap(L.rangeScan, `${lead}. Every later key is larger, so the scan stops without reading another leaf.`, { nodes: { [leaf.id]: 'compare' }, keys: roles, result: items() });
        return result.map((e): [number, string] => [e.v, e.value]);
      }
      const next: PNode | null = leaf.next;
      snap(L.rangeNext, `${lead}. ${next ? `No key above ${hi} yet, so follow leaf.next to ${show(next)}.` : `leaf.next is None: the chain ends, so return the result.`}`, {
        nodes: { [leaf.id]: 'compare', ...(next ? { [next.id]: 'active' as Role } : {}) },
        keys: roles,
        links: next ? { [leaf.id]: 'active' } : {},
        result: items(),
      });
      leaf = next;
      if (leaf) visited++;
    }
    return result.map((e): [number, string] => [e.v, e.value]);
  };

  const traverse = (): Array<[number, string]> => {
    const result: LeafEntry[] = [];
    const items = () => result.map((e): StripItem => ({ text: pair(e), role: 'good' }));
    let leaf: PNode = root;
    snap(L.traverse, `traverse(): leaf = root, then follow children[0] down to the leftmost leaf (no key comparisons, so any key type works).`, {
      nodes: { [root.id]: 'compare' },
      result: items(),
    });
    while (!leaf.leaf) {
      visited++;
      const child: PNode = leaf.children[0];
      path[child.id] = 'compare';
      snap(L.traverse, `${show(leaf)} is not a leaf: go to children[0] ${show(child)}.`, { nodes: { [child.id]: 'compare' }, result: items() });
      leaf = child;
    }
    visited++;
    for (let cur: PNode | null = leaf; cur; cur = cur.next) {
      const roles: Record<string, Role> = {};
      cur.entries.forEach((e) => {
        result.push(e);
        roles[e.id] = 'good';
      });
      const next: PNode | null = cur.next;
      snap(
        L.traverseScan,
        `Append every pair of ${show(cur)}. ${next ? `Then leaf = leaf.next ${show(next)}.` : `leaf.next is None: done, ${result.length} pair${result.length === 1 ? '' : 's'} in key order.`}`,
        { nodes: { [cur.id]: 'compare' }, keys: roles, links: next ? { [cur.id]: 'active' } : {}, result: items() },
      );
      if (next) visited++;
    }
    return result.map((e): [number, string] => [e.v, e.value]);
  };

  snap(
    undefined,
    `BPlusTree(min_degree=${t}): an empty root leaf. Every node except the root holds t - 1 = ${mid} to 2t - 1 = ${maxKeys} keys. Leaves hold the (key, value) pairs and are linked by next.`,
  );

  ops.forEach((op, idx) => {
    current = idx;
    events = [];
    path = {};
    visited = 0;
    probeOn = false;
    let result: BPlusStep['result'] = null;
    if (op.kind === 'insert') insert(op.key, op.value);
    else if (op.kind === 'search') result = search(op.key);
    else if (op.kind === 'range') result = rangeSearch(op.lo, op.hi);
    else result = traverse();
    probeOn = false;
    steps.push({ op, result, tree: dumpBPlusTree(root), chain: chainOf().map((n) => n.entries.map((e) => e.v)), events });
  });

  current = ops.length;
  path = {};
  visited = 0;
  const leaves = chainOf();
  snap(
    undefined,
    `Done: ${leaves.reduce((s, n) => s + n.entries.length, 0)} pairs in ${leaves.length} linked leaves, ${height()} level${height() === 1 ? '' : 's'} deep. Every search reads exactly one node per level.`,
  );
  return { frames, steps };
}
