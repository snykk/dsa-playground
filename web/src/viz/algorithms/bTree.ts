/**
 * B-tree tracer, drawn with MultiwayTreeView (a node is a row of key cells).
 *
 * Mirrors Data_Structures/Non_Linear/Trees/B_Tree/Python/b_tree.py, class BTree(min_degree=3):
 * search / _search_recursive, insert / _insert_non_full / _split_child (the one-pass CLRS insert
 * that splits every full node before entering it), delete / _delete_recursive /
 * _delete_internal_node / _get_predecessor / _get_successor / _fill_child / _borrow_from_left /
 * _borrow_from_right / _merge_children.
 * A node holds t - 1 to 2t - 1 keys (the root 0 to 2t - 1). A split keeps keys[:t-1] in the full
 * node, moves keys[t-1] (the median) up into the parent and keys[t:] into a new right sibling.
 * Ties follow the Python code: insert does not check for duplicates (a second copy is stored),
 * and after a split an equal median sends the key left (`if keys[i] < key: i += 1`).
 * search returns (node, index) or None; delete returns None (the C++ and Go versions return a bool).
 * Golden fixtures (__fixtures__/multiwayTrees.json, section bTree) pin the tree after every
 * operation, every search result and every split, borrow, merge, predecessor and successor.
 *
 * Input: "t 2; 10 20 30 -20 ?30"   (42 or +42 inserts, -42 deletes, ?42 searches; t defaults to 3)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { MwCell, MwFloat, MwNode, MwState } from '../renderers/MultiwayTreeView';
import type { StripItem } from '../ui/molecules/Strip';

/* ---------- input ---------- */

export type BOp = { kind: 'insert' | 'delete' | 'search'; key: number };

export interface BTreeInput {
  t: number;
  ops: BOp[];
}

/** The Python default: BTree(min_degree=3), 2 to 5 keys per node. */
export const PYTHON_DEFAULT_T = 3;

export const BTREE_LIMITS = { minT: 2, maxT: 5, maxOps: 30, maxKeys: 24, maxKey: 999 };

const OP_WORDS: Record<string, BOp['kind']> = {
  insert: 'insert',
  ins: 'insert',
  add: 'insert',
  delete: 'delete',
  del: 'delete',
  remove: 'delete',
  rm: 'delete',
  search: 'search',
  find: 'search',
  get: 'search',
};

/** "t 2; ..." or "min_degree = 2, ...": the degree, and the rest of the script. */
export function splitDegree(text: string): { t?: number; rest: string } {
  const m = text.match(/^\s*(?:t|min_degree)\s*[:=]?\s*(-?\d+)\s*(?:[;,\n]|$)/i);
  if (!m) return { rest: text };
  return { t: Number(m[1]), rest: text.slice(m[0].length) };
}

/** A key 0..max: the visualizer draws three digits per cell. */
export function parseKeyToken(token: string, max: number, segment = token): number {
  if (!/^\d{1,3}$/.test(token)) throw new InputError(`"${segment}": keys are whole numbers from 0 to ${max}.`);
  const v = Number(token);
  if (v > max) throw new InputError(`"${segment}": keys are whole numbers from 0 to ${max}.`);
  return v;
}

/**
 * Operation tokens shared by the B-tree and the B+ tree: "42" or "+42" inserts, "-42" deletes,
 * "?42" searches, and the words insert / delete / search followed by a key.
 */
export function parseKeyOps(rest: string, allowed: Array<BOp['kind']>, example: string): BOp[] {
  const tokens = rest.split(/[\s,;]+/).filter(Boolean);
  const ops: BOp[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const word = OP_WORDS[tok.toLowerCase()];
    let op: BOp;
    if (word) {
      const next = tokens[i + 1];
      if (next === undefined) throw new InputError(`"${tok}" needs a key after it, as in "${word} 42".`);
      op = { kind: word, key: parseKeyToken(next, BTREE_LIMITS.maxKey, `${tok} ${next}`) };
      i++;
    } else {
      const m = tok.match(/^([+?-]?)(.*)$/)!;
      if (!/^\d+$/.test(m[2])) throw new InputError(`"${tok}" is not an operation. ${example}`);
      op = { kind: m[1] === '-' ? 'delete' : m[1] === '?' ? 'search' : 'insert', key: parseKeyToken(m[2], BTREE_LIMITS.maxKey, tok) };
    }
    if (!allowed.includes(op.kind)) throw new InputError(`"${tok}": this tree has no ${op.kind}. ${example}`);
    ops.push(op);
  }
  return ops;
}

const BTREE_EXAMPLE = 'Write 42 (insert), -42 (delete) or ?42 (search), separated by spaces, for example "t 2; 10 20 30 -20 ?30".';

/** Parse "t 2; 10 20 30 -20 ?30". Without a degree the tree gets the Python default t = 3. */
export function parseBTree(text: string): BTreeInput {
  const { t, rest } = splitDegree(text);
  if (t !== undefined && (t < BTREE_LIMITS.minT || t > BTREE_LIMITS.maxT)) {
    throw new InputError(
      t < 2
        ? `The minimum degree t must be at least 2 (got ${t}): with t = 1 a node could hold 1 key and no split would leave t - 1 = 0 keys per half.`
        : `t goes up to ${BTREE_LIMITS.maxT} here, so a full node (2t - 1 keys) still fits on screen (got ${t}).`,
    );
  }
  const ops = parseKeyOps(rest, ['insert', 'delete', 'search'], BTREE_EXAMPLE);
  if (ops.length === 0) throw new InputError(`Add at least one operation. ${BTREE_EXAMPLE}`);
  if (ops.length > BTREE_LIMITS.maxOps) throw new InputError(`At most ${BTREE_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  // Replay the multiset of keys (insert stores duplicates), so the tree stays a readable size.
  const count = new Map<number, number>();
  let size = 0;
  for (const op of ops) {
    if (op.kind === 'insert') {
      count.set(op.key, (count.get(op.key) ?? 0) + 1);
      size++;
      if (size > BTREE_LIMITS.maxKeys) throw new InputError(`At most ${BTREE_LIMITS.maxKeys} keys in the tree at once, so every node fits on screen.`);
    } else if (op.kind === 'delete' && (count.get(op.key) ?? 0) > 0) {
      count.set(op.key, count.get(op.key)! - 1);
      size--;
    }
  }
  return { t: t ?? PYTHON_DEFAULT_T, ops };
}

export function formatBOp(op: BOp): string {
  return `${op.kind}(${op.key})`;
}

/* ---------- pseudocode (reads like b_tree.py) ---------- */

export const BTREE_CODE = [
  'search(k): i = 0; while i < len(keys) and k > keys[i]: i += 1',
  '  if i < len(keys) and keys[i] == k: return (node, i)',
  '  if leaf: return None   else: search children[i]',
  'insert(k): if len(root.keys) == 2t - 1:            # full root',
  '    new_root = Node(); new_root.children = [root]; split_child(new_root, 0)',
  '  insert_non_full(root, k)',
  'insert_non_full(node, k): if leaf: shift keys > k right, write k',
  '  else: i = number of keys <= k (scan from the right)',
  '    if len(children[i].keys) == 2t - 1: split_child(node, i)',
  '      if keys[i] < k: i += 1',
  '    insert_non_full(children[i], k)',
  'split_child(parent, i): full = children[i]; mid = t - 1',
  '  new.keys = full.keys[mid+1:]; full.keys = full.keys[:mid]  (children too)',
  '  parent.keys.insert(i, full.keys[mid]); parent.children.insert(i + 1, new)',
  'delete(k): delete_recursive(root, k)',
  '  if len(root.keys) == 0 and not root.leaf: root = root.children[0]',
  'delete_recursive(node, k): i = 0; while i < len(keys) and keys[i] < k: i += 1',
  '  if keys[i] == k and leaf: keys.pop(i)                  # case 1',
  '  if keys[i] == k and internal: delete_internal_node(node, i)   # case 2',
  '  if leaf: return                                       # k is not in the tree',
  '  if len(children[i].keys) == t - 1: fill_child(node, i)',
  '  if i > len(keys): i -= 1;  delete_recursive(children[i], k)',
  'delete_internal_node: left child has > t - 1 keys: keys[i] = predecessor; delete it below',
  '  elif right child has > t - 1 keys: keys[i] = successor; delete it below',
  '  else: merge_children(node, i); delete_recursive(children[i], k)',
  'fill_child(p, i): left sibling has > t - 1 keys: borrow_from_left',
  '  elif right sibling has > t - 1 keys: borrow_from_right',
  '  elif i < len(p.keys): merge_children(p, i)  else: merge_children(p, i - 1)',
  'borrow: the separator moves down into the child; the sibling\'s end key (and child) moves up',
  'merge_children(p, i): children[i] += [p.keys.pop(i)] + children[i+1]; drop children[i+1]',
];

const L = {
  scan: 0,
  found: 1,
  descend: 2,
  rootFull: 3,
  newRoot: 4,
  insertRoot: 5,
  leaf: 6,
  child: 7,
  splitChild: 8,
  afterSplit: 9,
  recurse: 10,
  split: 11,
  splitMove: 12,
  splitUp: 13,
  delete: 14,
  shrink: 15,
  delScan: 16,
  case1: 17,
  case2: 18,
  notFound: 19,
  fill: 20,
  adjust: 21,
  case2a: 22,
  case2b: 23,
  case2c: 24,
  borrowLeft: 25,
  borrowRight: 26,
  merge: 27,
  borrow: 28,
  mergeDo: 29,
};

/* ---------- tracer ---------- */

interface Entry {
  id: string;
  v: number;
}

interface BNode {
  id: string;
  keys: Entry[];
  children: BNode[];
  leaf: boolean;
}

/** A node as nested lists: [keys, children] (children is [] for a leaf), as the fixture stores it. */
export type BDump = [number[], BDump[]];

export type BEvent = [string, number];

export interface BTreeStep {
  op: BOp;
  /** search: [the keys of the node, the index] for Python's (node, index), or null for None; insert / delete: null. */
  result: [number[], number] | null;
  tree: BDump;
  /** Every split ("split", median), borrow ("borrowLeft" / "borrowRight", separator), merge ("merge", separator), "pred" and "succ". */
  events: BEvent[];
}

export interface BTreeRun {
  frames: Array<Frame<MwState>>;
  steps: BTreeStep[];
}

interface Snap {
  nodes?: Record<string, Role>;
  keys?: Record<string, Role>;
  edges?: Record<string, Role>;
  tags?: Record<string, string>;
  floating?: MwFloat[];
  /** A ghost slot opened at this index of this node (the shift before a key is written). */
  hole?: { node: string; at: number };
  vars?: Array<[string, string | number]>;
}

const show = (n: BNode) => `[${n.keys.map((e) => e.v).join(' ')}]`;
const list = (xs: Entry[]) => xs.map((e) => e.v).join(', ');
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function dumpBTree(n: BNode): BDump {
  return [n.keys.map((e) => e.v), n.children.map(dumpBTree)];
}

export function bTreeTrace(input: BTreeInput): BTreeRun {
  const { t, ops } = input;
  const maxKeys = 2 * t - 1;
  const minKeys = t - 1;
  let nodeSerial = 0;
  let keySerial = 0;
  const newNode = (leaf: boolean): BNode => ({ id: `n${nodeSerial++}`, keys: [], children: [], leaf });
  const newEntry = (v: number): Entry => ({ id: `k${keySerial++}`, v });
  let root = newNode(true);
  const frames: Array<Frame<MwState>> = [];
  const steps: BTreeStep[] = [];
  let current = -1;
  let events: BEvent[] = [];
  let visited = 0;
  /** Edges walked by the current operation (keyed by the child id). */
  let path: Record<string, Role> = {};

  const height = () => {
    let h = 1;
    for (let n = root; !n.leaf; n = n.children[0]) h++;
    return h;
  };
  const size = () => {
    let s = 0;
    const walk = (n: BNode) => {
      s += n.keys.length;
      n.children.forEach(walk);
    };
    walk(root);
    return s;
  };

  const opStrip = () => ({
    label: 'Operations',
    items: ops.map((op, i): StripItem => ({ text: formatBOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  });

  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const nodes: MwNode[] = [];
    const walk = (n: BNode) => {
      const keys: MwCell[] = n.keys.map((e) => ({ id: e.id, label: String(e.v), role: o.keys?.[e.id] }));
      if (o.hole?.node === n.id) keys.splice(o.hole.at, 0, { id: `hole:${n.id}`, label: '', ghost: true });
      nodes.push({ id: n.id, keys, children: n.children.map((c) => c.id), role: o.nodes?.[n.id], tag: o.tags?.[n.id] });
      n.children.forEach(walk);
    };
    walk(root);
    frames.push({
      line,
      caption,
      vars: [
        ...(o.vars ?? []),
        ['t (min_degree)', t],
        ['keys per node', `${minKeys}..${maxKeys} (root 0..${maxKeys})`],
        ['keys stored', size()],
        ['height (levels)', height()],
        ['nodes visited by this operation', visited],
      ],
      state: { nodes, root: root.id, edgeRoles: { ...path, ...(o.edges ?? {}) }, floating: o.floating, strips: [opStrip()] },
    });
  };

  /** The key being inserted, deleted or searched, hovering over the node the code is in. */
  let probe: { id: string; label: string; role: Role; tag: string } | null = null;
  const fl = (n: BNode, slot?: number): MwFloat[] =>
    probe ? [{ cell: { id: probe.id, label: probe.label, role: probe.role }, anchor: n.id, slot, tag: probe.tag }] : [];

  /* ----- split_child ----- */

  const splitChild = (parent: BNode, index: number, hover: BNode) => {
    const full = parent.children[index];
    const mid = minKeys;
    const median = full.keys[mid];
    const right = full.keys.slice(mid + 1);
    const keyRoles: Record<string, Role> = { [median.id]: 'active' };
    for (const e of right) keyRoles[e.id] = 'compare';
    snap(
      L.split,
      `split_child(parent, ${index}): the child ${show(full)} is full (2t - 1 = ${maxKeys} keys). mid = t - 1 = ${mid}, so the median keys[${mid}] = ${median.v} moves up, ` +
        `and the ${plural(right.length, 'key')} after it (${list(right)}) ${right.length === 1 ? 'goes' : 'go'} to a new right sibling${full.leaf ? '' : `, together with the last ${t} children`}.`,
      { nodes: { [full.id]: 'active' }, keys: keyRoles, tags: { [full.id]: `full: ${maxKeys} keys` }, edges: { [full.id]: 'active' }, floating: fl(hover) },
    );
    const fresh = newNode(full.leaf);
    fresh.keys = right;
    full.keys = full.keys.slice(0, mid);
    if (!full.leaf) {
      fresh.children = full.children.slice(mid + 1);
      full.children = full.children.slice(0, mid + 1);
    }
    parent.keys.splice(index, 0, median);
    parent.children.splice(index + 1, 0, fresh);
    events.push(['split', median.v]);
    const done: Record<string, Role> = { [median.id]: 'active' };
    snap(
      L.splitUp,
      `${median.v} is now keys[${index}] of the parent, with ${show(full)} on its left and ${show(fresh)} on its right: each half has t - 1 = ${plural(minKeys, 'key')}, ` +
        `so either can take another key. The parent had room for ${median.v} because it is never full when its child splits.`,
      { nodes: { [full.id]: 'done', [fresh.id]: 'done' }, keys: done, edges: { [full.id]: 'done', [fresh.id]: 'done' }, floating: fl(hover) },
    );
  };

  /* ----- search ----- */

  const search = (key: number): [number[], number] | null => {
    let node = root;
    for (;;) {
      visited++;
      let i = 0;
      while (i < node.keys.length && key > node.keys[i].v) i++;
      const passed = node.keys.slice(0, i);
      const roles: Record<string, Role> = {};
      for (const e of passed) roles[e.id] = 'compare';
      const lead = passed.length ? `${list(passed)} ${passed.length === 1 ? 'is' : 'are'} smaller than ${key}, so i = ${i}` : `i = 0`;
      if (i < node.keys.length && node.keys[i].v === key) {
        roles[node.keys[i].id] = 'good';
        snap(L.found, `${lead}, and keys[${i}] == ${key}: search returns (node ${show(node)}, ${i}).`, { nodes: { [node.id]: 'good' }, keys: roles, floating: fl(node, i) });
        return [node.keys.map((e) => e.v), i];
      }
      if (i < node.keys.length) roles[node.keys[i].id] = 'compare';
      if (node.leaf) {
        snap(
          L.descend,
          `${lead}${i < node.keys.length ? `, and keys[${i}] = ${node.keys[i].v} is not ${key}` : ''}. This is a leaf, so ${key} is not in the tree: search returns None.`,
          { nodes: { [node.id]: 'bad' }, keys: roles, floating: fl(node, i) },
        );
        return null;
      }
      const child = node.children[i];
      snap(
        L.descend,
        `${lead}${i < node.keys.length ? `, and ${key} < keys[${i}] = ${node.keys[i].v}` : ` (past the last key)`}: ${key} can only be in children[${i}], so go down there.`,
        { nodes: { [node.id]: 'compare' }, keys: roles, edges: { [child.id]: 'compare' }, floating: fl(node, i) },
      );
      path[child.id] = 'compare';
      node = child;
    }
  };

  /* ----- insert ----- */

  const insertNonFull = (node: BNode, key: number, entry: Entry) => {
    visited++;
    if (node.leaf) {
      let i = node.keys.length - 1;
      while (i >= 0 && node.keys[i].v > key) i--;
      const pos = i + 1;
      const bigger = node.keys.slice(pos);
      const roles: Record<string, Role> = {};
      for (const e of bigger) roles[e.id] = 'compare';
      snap(
        L.leaf,
        (node.keys.length ? `${show(node)} is a leaf with room (${node.keys.length} < ${maxKeys} keys). Python appends a slot and ` : `The root is an empty leaf: Python appends a slot, `) +
          (bigger.length ? `shifts the keys greater than ${key} (${list(bigger)}) one place right, ` : node.keys.length ? `no key is greater than ${key}, so nothing shifts: ` : '') +
          `${key} goes to index ${pos}.`,
        { nodes: { [node.id]: 'compare' }, keys: roles, hole: { node: node.id, at: pos }, floating: fl(node, pos) },
      );
      node.keys.splice(pos, 0, entry);
      probe = null;
      snap(L.leaf, `keys[${pos}] = ${key}: the leaf is ${show(node)}. Every insert ends in a leaf, so the tree only grows taller when the root splits.`, {
        nodes: { [node.id]: 'done' },
        keys: { [entry.id]: 'done' },
      });
      return;
    }
    let i = node.keys.length - 1;
    while (i >= 0 && node.keys[i].v > key) i--;
    i++;
    const bigger = node.keys.slice(i);
    const roles: Record<string, Role> = {};
    for (const e of bigger) roles[e.id] = 'compare';
    const child = node.children[i];
    const full = child.keys.length === maxKeys;
    snap(
      L.child,
      (bigger.length ? `Scanning from the right, ${list(bigger)} ${bigger.length === 1 ? 'is' : 'are'} greater than ${key}` : `No key is greater than ${key}`) +
        `, so ${key} belongs in children[${i}] ${show(child)}.` +
        (full ? ` That child is full (${maxKeys} keys): split it before going down, so a split never has to travel back up.` : ` It has room, so go down.`),
      { nodes: { [node.id]: 'compare', [child.id]: full ? 'active' : 'compare' }, keys: roles, edges: { [child.id]: 'compare' }, tags: full ? { [child.id]: 'full' } : {}, floating: fl(node) },
    );
    if (full) {
      splitChild(node, i, node);
      const med = node.keys[i];
      const right = med.v < key;
      if (right) i++;
      snap(
        L.afterSplit,
        right
          ? `After the split keys[${i - 1}] = ${med.v} < ${key}, so ${key} goes to the right half: i = ${i}.`
          : `After the split keys[${i}] = ${med.v}${med.v === key ? ` equals ${key}, and only a smaller median sends the key right,` : ` > ${key},`} so ${key} stays in the left half: i = ${i}.`,
        { nodes: { [node.children[i].id]: 'compare' }, keys: { [med.id]: 'compare' }, edges: { [node.children[i].id]: 'compare' }, floating: fl(node) },
      );
    }
    path[node.children[i].id] = 'compare';
    insertNonFull(node.children[i], key, entry);
  };

  const insert = (key: number) => {
    const entry = newEntry(key);
    probe = { id: entry.id, label: String(key), role: 'active', tag: 'insert' };
    const copies = countOf(key);
    snap(
      L.insertRoot,
      `insert(${key}): start at the root.` + (copies ? ` ${key} is already stored; insert does not check, so a second copy goes into the tree.` : ''),
      { nodes: { [root.id]: 'compare' }, floating: fl(root) },
    );
    if (root.keys.length === maxKeys) {
      const old = root;
      const fresh = newNode(false);
      fresh.children.push(old);
      root = fresh;
      snap(
        L.newRoot,
        `The root ${show(old)} is full (2t - 1 = ${maxKeys} keys). Before descending, a new empty root goes above it with the old root as children[0], ` +
          `so the split below has a parent to receive the median. This is the only way the tree grows taller.`,
        { nodes: { [fresh.id]: 'active', [old.id]: 'active' }, tags: { [old.id]: 'full', [fresh.id]: 'new root' }, edges: { [old.id]: 'active' }, floating: fl(fresh) },
      );
      splitChild(fresh, 0, fresh);
    }
    insertNonFull(root, key, entry);
  };

  const countOf = (key: number) => {
    let c = 0;
    const walk = (n: BNode) => {
      c += n.keys.filter((e) => e.v === key).length;
      n.children.forEach(walk);
    };
    walk(root);
    return c;
  };

  /* ----- delete ----- */

  const mergeChildren = (parent: BNode, index: number, why: string) => {
    const left = parent.children[index];
    const right = parent.children[index + 1];
    const sep = parent.keys[index];
    const total = left.keys.length + 1 + right.keys.length;
    snap(
      L.merge,
      `${why} merge_children(parent, ${index}): ${show(left)}, the separator ${sep.v} and ${show(right)} become one node of ${total} keys (at most 2t - 1 = ${maxKeys}, because both sides have t - 1).`,
      { nodes: { [left.id]: 'active', [right.id]: 'active' }, keys: { [sep.id]: 'active' }, edges: { [left.id]: 'active', [right.id]: 'active' }, floating: fl(parent) },
    );
    left.keys.push(parent.keys.splice(index, 1)[0]);
    left.keys.push(...right.keys);
    if (!left.leaf) left.children.push(...right.children);
    parent.children.splice(index + 1, 1);
    events.push(['merge', sep.v]);
    snap(
      L.mergeDo,
      `Merged into ${show(left)}. The parent lost the separator ${sep.v} and one child` +
        (parent === root && parent.keys.length === 0 ? `: the root has no keys left, and delete() will replace it by its only child at the end.` : '.'),
      { nodes: { [left.id]: 'done', ...(parent.keys.length === 0 ? { [parent.id]: 'muted' as Role } : {}) }, keys: { [sep.id]: 'done' }, edges: { [left.id]: 'done' }, floating: fl(parent) },
    );
  };

  const borrowFromLeft = (parent: BNode, index: number) => {
    const child = parent.children[index];
    const sib = parent.children[index - 1];
    const sep = parent.keys[index - 1];
    const up = sib.keys[sib.keys.length - 1];
    const moved = child.leaf ? null : sib.children[sib.children.length - 1];
    snap(
      L.borrow,
      `Borrow from the left sibling ${show(sib)}: the separator ${sep.v} moves down to the front of the child, and the sibling's last key ${up.v} moves up to take its place` +
        (moved ? `; the sibling's last child ${show(moved)} moves across with it.` : '.') +
        ` The order holds: ${up.v} <= ${sep.v} <= every key of the child.`,
      { nodes: { [child.id]: 'active', [sib.id]: 'compare' }, keys: { [sep.id]: 'active', [up.id]: 'active' }, edges: moved ? { [moved.id]: 'active' } : {}, floating: fl(parent) },
    );
    child.keys.unshift(sep);
    parent.keys[index - 1] = sib.keys.pop()!;
    if (!child.leaf) child.children.unshift(sib.children.pop()!);
    events.push(['borrowLeft', sep.v]);
    snap(L.borrow, `The child is now ${show(child)} (${child.keys.length} > t - 1 keys), so a delete inside it cannot leave it too small.`, {
      nodes: { [child.id]: 'done' },
      keys: { [sep.id]: 'done', [up.id]: 'done' },
      floating: fl(parent),
    });
  };

  const borrowFromRight = (parent: BNode, index: number) => {
    const child = parent.children[index];
    const sib = parent.children[index + 1];
    const sep = parent.keys[index];
    const up = sib.keys[0];
    const moved = child.leaf ? null : sib.children[0];
    snap(
      L.borrow,
      `Borrow from the right sibling ${show(sib)}: the separator ${sep.v} moves down to the end of the child, and the sibling's first key ${up.v} moves up to take its place` +
        (moved ? `; the sibling's first child ${show(moved)} moves across with it.` : '.') +
        ` The order holds: every key of the child <= ${sep.v} <= ${up.v}.`,
      { nodes: { [child.id]: 'active', [sib.id]: 'compare' }, keys: { [sep.id]: 'active', [up.id]: 'active' }, edges: moved ? { [moved.id]: 'active' } : {}, floating: fl(parent) },
    );
    child.keys.push(sep);
    parent.keys[index] = sib.keys.shift()!;
    if (!child.leaf) child.children.push(sib.children.shift()!);
    events.push(['borrowRight', sep.v]);
    snap(L.borrow, `The child is now ${show(child)} (${child.keys.length} > t - 1 keys), so a delete inside it cannot leave it too small.`, {
      nodes: { [child.id]: 'done' },
      keys: { [sep.id]: 'done', [up.id]: 'done' },
      floating: fl(parent),
    });
  };

  const fillChild = (parent: BNode, index: number) => {
    const child = parent.children[index];
    const left = index > 0 ? parent.children[index - 1] : null;
    const right = index < parent.children.length - 1 ? parent.children[index + 1] : null;
    if (left && left.keys.length > minKeys) {
      snap(L.borrowLeft, `fill_child: the left sibling ${show(left)} has ${left.keys.length} > t - 1 keys, so it can lend one.`, {
        nodes: { [child.id]: 'active', [left.id]: 'compare' },
        floating: fl(parent),
      });
      borrowFromLeft(parent, index);
    } else if (right && right.keys.length > minKeys) {
      snap(
        L.borrowRight,
        `fill_child: ${left ? `the left sibling ${show(left)} has only t - 1 keys` : 'there is no left sibling'}, but the right sibling ${show(right)} has ${right.keys.length} > t - 1, so it lends one.`,
        { nodes: { [child.id]: 'active', [right.id]: 'compare' }, floating: fl(parent) },
      );
      borrowFromRight(parent, index);
    } else if (index < parent.keys.length) {
      mergeChildren(parent, index, `fill_child: no sibling can spare a key (${left ? `left ${show(left)}` : 'no left sibling'}, right ${show(right!)}), so merge the child with its right sibling.`);
    } else {
      mergeChildren(parent, index - 1, `fill_child: the left sibling ${show(left!)} has only t - 1 keys and this is the last child, so merge it into its left sibling.`);
    }
  };

  const deleteRecursive = (node: BNode, key: number) => {
    visited++;
    let i = 0;
    while (i < node.keys.length && node.keys[i].v < key) i++;
    const passed = node.keys.slice(0, i);
    const roles: Record<string, Role> = {};
    for (const e of passed) roles[e.id] = 'compare';
    const lead = passed.length ? `${list(passed)} ${passed.length === 1 ? 'is' : 'are'} smaller than ${key}, so i = ${i}` : 'i = 0';
    if (i < node.keys.length && node.keys[i].v === key) {
      const e = node.keys[i];
      if (node.leaf) {
        snap(L.case1, `${lead}, and keys[${i}] == ${key} in a leaf (case 1): pop it.`, { nodes: { [node.id]: 'compare' }, keys: { ...roles, [e.id]: 'bad' }, floating: fl(node, i) });
        node.keys.splice(i, 1);
        probe = null;
        snap(
          L.case1,
          `${key} is gone and the leaf is ${show(node)}` +
            (node === root ? '.' : `: it still has at least t - 1 = ${plural(minKeys, 'key')}, because every node on the way down was topped up before the descent entered it.`),
          { nodes: { [node.id]: 'done' } },
        );
        return;
      }
      snap(
        L.case2,
        `${lead}, and keys[${i}] == ${key} in an internal node (case 2). It cannot just be removed: it separates children[${i}] and children[${i + 1}], so a key from below must replace it, or the two children merge.`,
        { nodes: { [node.id]: 'compare' }, keys: { ...roles, [e.id]: 'bad' }, edges: { [node.children[i].id]: 'compare', [node.children[i + 1].id]: 'compare' }, floating: fl(node, i) },
      );
      deleteInternalNode(node, i);
      return;
    }
    if (i < node.keys.length) roles[node.keys[i].id] = 'compare';
    if (node.leaf) {
      probe = null;
      snap(L.notFound, `${lead}${i < node.keys.length ? `, and keys[${i}] = ${node.keys[i].v} is not ${key}` : ''}. This is a leaf, so ${key} is not in the tree: nothing to delete (delete returns None either way).`, {
        nodes: { [node.id]: 'bad' },
        keys: roles,
      });
      return;
    }
    const child = node.children[i];
    const minimal = child.keys.length === minKeys;
    snap(
      L.delScan,
      `${lead}: ${key} is not in this node and can only be in children[${i}] ${show(child)}.` +
        (minimal ? ` That child has only t - 1 = ${minKeys} ${minKeys === 1 ? 'key' : 'keys'}: deleting below it could leave it too small, so fill it first.` : ` It has more than t - 1 keys, so go down.`),
      { nodes: { [node.id]: 'compare', [child.id]: minimal ? 'active' : 'compare' }, keys: roles, edges: { [child.id]: 'compare' }, tags: minimal ? { [child.id]: 't - 1 keys' } : {}, floating: fl(node) },
    );
    if (minimal) fillChild(node, i);
    if (i > node.keys.length) {
      i -= 1;
      snap(L.adjust, `The last child merged into its left sibling, so i > len(keys): i = ${i}, and ${key} is now in children[${i}] ${show(node.children[i])}.`, {
        nodes: { [node.children[i].id]: 'compare' },
        edges: { [node.children[i].id]: 'compare' },
        floating: fl(node),
      });
    }
    path[node.children[i].id] = 'compare';
    deleteRecursive(node.children[i], key);
  };

  const deleteInternalNode = (node: BNode, index: number) => {
    const e = node.keys[index];
    const key = e.v;
    const left = node.children[index];
    const right = node.children[index + 1];
    if (left.keys.length > minKeys || right.keys.length > minKeys) {
      const usePred = left.keys.length > minKeys;
      const spine: Record<string, Role> = {};
      let p = usePred ? left : right;
      spine[p.id] = 'compare';
      while (!p.leaf) {
        p = usePred ? p.children[p.children.length - 1] : p.children[0];
        spine[p.id] = 'compare';
      }
      const donor = usePred ? p.keys[p.keys.length - 1] : p.keys[0];
      events.push([usePred ? 'pred' : 'succ', donor.v]);
      snap(
        usePred ? L.case2a : L.case2b,
        usePred
          ? `Case 2a: the left child ${show(left)} has ${left.keys.length} > t - 1 keys. The predecessor of ${key} is the largest key of the left subtree: follow the last child down to ${donor.v}.`
          : `Case 2b: the left child has only t - 1 keys, but the right child ${show(right)} has ${right.keys.length}. The successor of ${key} is the smallest key of the right subtree: follow the first child down to ${donor.v}.`,
        { nodes: { [node.id]: 'compare' }, keys: { [e.id]: 'bad', [donor.id]: 'active' }, edges: spine, floating: fl(node, index) },
      );
      // keys[index] = predecessor: the donor's value now lives in both places until the delete below removes the leaf copy.
      const copy = newEntry(donor.v);
      const slot = p.keys.indexOf(donor);
      p.keys[slot] = copy;
      node.keys[index] = donor;
      probe = { id: `probe:${keySerial++}`, label: String(donor.v), role: 'compare', tag: 'delete' };
      snap(
        usePred ? L.case2a : L.case2b,
        `keys[${index}] = ${donor.v}: the ${usePred ? 'predecessor' : 'successor'} replaces ${key}, so ${key} is gone. ${donor.v} now appears twice; delete it from the ${usePred ? 'left' : 'right'} child next, with the same rules.`,
        { nodes: { [node.id]: 'done' }, keys: { [donor.id]: 'done', [copy.id]: 'muted' }, edges: spine, floating: fl(usePred ? left : right) },
      );
      path[(usePred ? left : right).id] = 'compare';
      deleteRecursive(usePred ? left : right, donor.v);
      return;
    }
    mergeChildren(node, index, `Case 2c: both children have only t - 1 keys, so neither can give up a key.`);
    path[node.children[index].id] = 'compare';
    deleteRecursive(node.children[index], key);
  };

  const del = (key: number) => {
    probe = { id: `probe:${keySerial++}`, label: String(key), role: 'compare', tag: 'delete' };
    snap(L.delete, `delete(${key}): one pass down from the root. A child with only t - 1 keys is topped up before the pass enters it, so the key can be removed without walking back up.`, {
      nodes: { [root.id]: 'compare' },
      floating: fl(root),
    });
    deleteRecursive(root, key);
    probe = null;
    if (root.keys.length === 0 && !root.leaf) {
      const old = root;
      root = root.children[0];
      snap(L.shrink, `The root ${show(old)} has no keys left: its only child ${show(root)} becomes the root, and the tree is one level shorter. All leaves move up together.`, {
        nodes: { [root.id]: 'done' },
      });
    }
  };

  snap(
    undefined,
    `BTree(min_degree=${t}): an empty root leaf. Every node except the root holds t - 1 = ${minKeys} to 2t - 1 = ${maxKeys} keys, and all leaves stay at the same depth.`,
  );

  ops.forEach((op, idx) => {
    current = idx;
    events = [];
    visited = 0;
    path = {};
    let result: [number[], number] | null = null;
    if (op.kind === 'insert') insert(op.key);
    else if (op.kind === 'delete') del(op.key);
    else {
      probe = { id: `probe:${keySerial++}`, label: String(op.key), role: 'compare', tag: 'search' };
      snap(L.scan, `search(${op.key}): in each node, skip the keys smaller than ${op.key}; stop at the first key that is >= ${op.key}.`, { nodes: { [root.id]: 'compare' }, floating: fl(root) });
      result = search(op.key);
      probe = null;
    }
    probe = null;
    steps.push({ op, result, tree: dumpBTree(root), events });
  });

  current = ops.length;
  path = {};
  visited = 0;
  const all: number[] = [];
  const walk = (n: BNode) => {
    n.keys.forEach((e, i) => {
      if (!n.leaf) walk(n.children[i]);
      all.push(e.v);
    });
    if (!n.leaf) walk(n.children[n.children.length - 1]);
  };
  walk(root);
  snap(undefined, `Done. traverse() gives ${all.length ? all.join(', ') : 'nothing (the tree is empty)'}: always sorted, ${plural(height(), 'level')} deep.`);
  return { frames, steps };
}
