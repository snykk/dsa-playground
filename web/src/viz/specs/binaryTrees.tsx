import { BINARY_TREE_CODE, binaryTreeTrace, parseBinaryTree, type BinaryTreeOp } from '../algorithms/binaryTree';
import type { KeyScript } from '../algorithms/binaryTreesCommon';
import { CARTESIAN_CODE, cartesianTrace, parseCartesian, type CartesianInput } from '../algorithms/cartesianTree';
import { INTERVAL_CODE, intervalTrace, parseInterval, type IntervalOp } from '../algorithms/intervalTree';
import { parseRedBlack, RB_CODE, redBlackTrace } from '../algorithms/redBlackTree';
import { parseSplay, SPLAY_CODE, splayTrace } from '../algorithms/splayTree';
import { parseTreap, TREAP_CODE, treapTrace } from '../algorithms/treap';
import type { VizSpec } from '../core/types';
import { stabilizeTree, TreeView, type TreeState } from '../renderers/TreeView';
import { SYM } from '../ui/symbols';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const distinct = (count: number, lo: number, hi: number): number[] => {
  const s = new Set<number>();
  while (s.size < count) s.add(rint(lo, hi));
  return [...s];
};

/* ---------- binary tree ---------- */

export const binaryTreeSpec: VizSpec<BinaryTreeOp[], TreeState> = {
  id: 'binary-tree-traversals',
  title: 'Binary Tree',
  inputKind: 'binary-tree-ops',
  inputLabel: 'Operations',
  inputHelp:
    'Values 0..999 are inserted in level order ("insert 1 2 3" or just "1 2 3"); then any of: inorder (in), preorder (pre), postorder (post), level, search 5 (or ?5), height, size. ' +
    'Up to 15 inserts and 30 operations; duplicates are allowed.',
  examples: [
    { label: 'Seven nodes, every order', value: 'insert 1 2 3 4 5 6 7, preorder, inorder, postorder, level' },
    { label: 'Level-order insert', value: 'insert 1 2 3 4 5, insert 6, level' },
    { label: 'Search hit and miss', value: 'insert 8 3 5 1 9, search 5, search 7' },
    { label: 'Height (edges) and size', value: 'insert 1 2 3 4 5 6 7 8, height, size' },
    { label: 'Empty tree', value: 'inorder, height, size, insert 4, height' },
  ],
  randomInput: () => {
    const vals = Array.from({ length: rint(5, 10) }, () => rint(1, 50));
    const order = pick(['preorder', 'inorder', 'postorder', 'level']);
    return `insert ${vals.join(' ')}, ${order}, search ${pick([...vals, rint(51, 99)])}, height`;
  },
  parse: parseBinaryTree,
  trace: (ops) => stabilizeTree(binaryTreeTrace(ops).frames),
  render: (state) => <TreeView state={state} />,
  pseudocode: BINARY_TREE_CODE,
  legend: [
    { role: 'active', label: 'current node' },
    { role: 'compare', label: 'open call on the stack, or waiting in the queue' },
    { role: 'done', label: 'emitted (in the result), or just inserted' },
    { role: 'good', label: `found (${SYM.check})` },
  ],
  complexity: { time: 'O(n) per traversal, insert, search, height or size', space: 'O(h) recursion; O(n) queue for level order and insert' },
};

/* ---------- red-black tree ---------- */

export const redBlackSpec: VizSpec<KeyScript, TreeState> = {
  id: 'red-black-tree',
  title: 'Red-Black Tree',
  inputKind: 'rb-ops',
  inputLabel: 'Operations',
  inputHelp:
    'Keys 0..999: "insert 10 20 30" (or just "10 20 30"), "search 20" (or ?20), min, max. Duplicates are kept as extra nodes. ' +
    'There is no delete (the repository has none). Up to 15 keys and 30 operations. Black nodes are dark and marked B; red nodes have a red ring and are marked R.',
  examples: [
    { label: 'Textbook: 10 20 30 40 50 25', value: 'insert 10 20 30 40 50 25, search 25' },
    { label: 'Triangle: case 2, then 3', value: 'insert 30 10 20' },
    { label: 'Sorted input stays balanced', value: 'insert 1 2 3 4 5 6 7 8 9 10' },
    { label: 'Several fix-ups: 41 38 31 12 19 8', value: 'insert 41 38 31 12 19 8, min, max' },
    { label: 'Duplicates', value: 'insert 5 5 5 5, search 5, search 6' },
  ],
  randomInput: () => `insert ${distinct(rint(6, 10), 1, 99).join(' ')}, search ${rint(1, 99)}`,
  parse: parseRedBlack,
  trace: (input) => stabilizeTree(redBlackTrace(input).frames),
  render: (state) => <TreeView state={state} />,
  pseudocode: RB_CODE,
  legend: [
    { role: 'active', label: 'z and its red parent, or the current node (halo)' },
    { role: 'compare', label: 'path walked, uncle and grandparent (halo)' },
    { role: 'done', label: 'recolored or rotated into place (halo)' },
    { role: 'good', label: `found (${SYM.check})` },
  ],
  complexity: { time: 'O(log n) search and insert; at most 2 rotations per insert', space: 'O(n); insert needs O(1) extra' },
};

/* ---------- splay tree ---------- */

export const splaySpec: VizSpec<KeyScript, TreeState> = {
  id: 'splay-tree',
  title: 'Splay Tree',
  inputKind: 'splay-ops',
  inputLabel: 'Operations',
  inputHelp:
    'Keys 0..999: "insert 1 2 3" (or just "1 2 3"), "search 2" (or ?2), "delete 2" (or -2), min, max. Every access splays. ' +
    'Up to 10 keys in the tree and 30 operations.',
  examples: [
    { label: 'Zig-zig on a path', value: 'insert 1 2 3 4 5, search 1' },
    { label: 'Zig-zag', value: 'insert 3 1 2' },
    { label: 'A miss splays too', value: 'insert 10 20 30 40, search 25' },
    { label: 'Delete: split and join', value: 'insert 50 30 70 20 40, delete 40, delete 20' },
    { label: 'Delete when the left child is the max', value: 'insert 1 3 2, delete 2, search 3, delete 6, min, max' },
  ],
  randomInput: () => {
    const keys = distinct(rint(5, 8), 1, 60);
    return `insert ${keys.join(' ')}, search ${pick(keys)}, search ${rint(1, 60)}, delete ${pick(keys)}`;
  },
  parse: parseSplay,
  trace: (input) => stabilizeTree(splayTrace(input).frames),
  render: (state) => <TreeView state={state} />,
  pseudocode: SPLAY_CODE,
  legend: [
    { role: 'active', label: 'x, the node being splayed, or the current node' },
    { role: 'compare', label: 'path walked, p and g' },
    { role: 'done', label: 'at the root' },
    { role: 'good', label: `found (${SYM.check})` },
    { role: 'bad', label: `being deleted (${SYM.cross})` },
  ],
  complexity: { time: 'O(log n) amortized per operation, O(n) worst single operation', space: 'O(n)' },
};

/* ---------- treap ---------- */

export const treapSpec: VizSpec<KeyScript, TreeState> = {
  id: 'treap',
  title: 'Treap',
  inputKind: 'treap-ops',
  inputLabel: 'Seed and operations',
  inputHelp:
    'Optional "seed 7" (default 1) seeds the random priorities, so a run is repeatable. Then keys 0..999: "insert 5 3 8" (or just "5 3 8"), "delete 5" (or -5), "search 3" (or ?3). ' +
    '"insert 6@0.7" fixes a priority instead of drawing one. The number under each node is its priority. Up to 12 keys and 24 operations.',
  examples: [
    { label: 'Fixed priorities (article)', value: 'insert 5@0.9 2@0.6 8@0.4 6@0.7, delete 5' },
    { label: 'Seeded: nine keys', value: 'seed 7; insert 5 3 7 1 9 4 6 2 8, delete 5, search 6' },
    { label: 'Sorted keys stay shallow', value: 'seed 42; insert 1 2 3 4 5 6 7 8 9 10' },
    { label: 'Equal priorities: right wins', value: 'insert 4@0.5 2@0.5 6@0.5, delete 4' },
    { label: 'Duplicates, misses, largest key', value: 'seed 3; insert 1 1 999, delete 2, delete 999, search 999' },
  ],
  randomInput: () => {
    const keys = distinct(rint(5, 8), 1, 60);
    return `seed ${rint(1, 999)}; insert ${keys.join(' ')}, delete ${pick(keys)}, search ${pick(keys)}`;
  },
  parse: parseTreap,
  trace: (input) => stabilizeTree(treapTrace(input).frames),
  render: (state) => <TreeView state={state} />,
  pseudocode: TREAP_CODE,
  legend: [
    { role: 'active', label: 'current node; in a merge, the root that stays on top' },
    { role: 'compare', label: 'path walked, decided by the split, or the other root' },
    { role: 'done', label: 'inserted' },
    { role: 'good', label: `found (${SYM.check})` },
    { role: 'bad', label: `being deleted (${SYM.cross})` },
  ],
  complexity: { time: 'O(log n) expected per operation (split and merge follow one path)', space: 'O(n)' },
};

/* ---------- Cartesian tree ---------- */

export const cartesianSpec: VizSpec<CartesianInput, TreeState> = {
  id: 'cartesian-tree',
  title: 'Cartesian Tree',
  inputKind: 'cartesian',
  inputLabel: 'Array and queries',
  inputHelp:
    'The array (up to 12 whole numbers, -99..999), then range minimum queries separated by commas: "9 3 7 1 8; rmq 1 4, rmq 0 2". ' +
    'rmq l r is get_min_index(l, r): the index of the leftmost minimum of array[l..r], or -1 for an invalid range. Up to 10 queries.',
  examples: [
    { label: 'Article array', value: '9 3 7 1 8 12 10 20 15 18 5; rmq 4 8, rmq 0 2, rmq 6 10' },
    { label: 'Sorted: a chain', value: '1 2 3 4 5 6 7 8; rmq 2 6, rmq 0 7' },
    { label: 'Equal values: leftmost wins', value: '4 2 4 2 4; rmq 0 4, rmq 2 4' },
    { label: 'Invalid ranges return -1', value: '3 1 2; rmq -1 2, rmq 0 3, rmq 2 1, rmq 1 1' },
  ],
  randomInput: () => {
    const n = rint(6, 10);
    const a = Array.from({ length: n }, () => rint(1, 40));
    const qs = Array.from({ length: rint(2, 3) }, () => {
      const l = rint(0, n - 1);
      return `rmq ${l} ${rint(l, n - 1)}`;
    });
    return `${a.join(' ')}; ${qs.join(', ')}`;
  },
  parse: parseCartesian,
  trace: (input) => stabilizeTree(cartesianTrace(input).frames),
  render: (state) => <TreeView state={state} />,
  pseudocode: CARTESIAN_CODE,
  legend: [
    { role: 'active', label: 'value being read, or the node the query is at' },
    { role: 'compare', label: 'on the stack (the right spine), or the query range' },
    { role: 'done', label: 'subtree hung under the new node' },
    { role: 'good', label: `range minimum (${SYM.check})` },
    { role: 'muted', label: 'array values not read yet' },
  ],
  complexity: { time: 'build O(n); get_min_index O(h), h = n - 1 for sorted input', space: 'O(n)' },
};

/* ---------- interval tree ---------- */

export const intervalSpec: VizSpec<IntervalOp[], TreeState> = {
  id: 'interval-tree',
  title: 'Interval Tree',
  inputKind: 'interval-ops',
  inputLabel: 'Operations',
  inputHelp:
    'Intervals are pairs of numbers 0..99, closed at both ends. "insert 15 20, 10 30" inserts two (a segment without a verb repeats the last one); ' +
    '"overlap 22 26" (search_overlapping), "point 18" (search_containing_point), "inside 10 30" (search_contained_in), "delete 10 30". ' +
    'A pair with low > high raises ValueError. Up to 10 intervals and 24 operations.',
  examples: [
    { label: 'Prune by max (article)', value: 'insert 15 20, 10 30, 17 19, 5 20, 12 15, 30 40; overlap 22 26, overlap 14 16' },
    { label: 'Point and containment', value: 'insert 15 20, 10 30, 17 19, 5 20, 12 15, 30 40; point 18, inside 4 25' },
    { label: 'Delete with two children', value: 'insert 15 20, 10 30, 17 19, 5 20, 12 15, 30 40; delete 10 30, overlap 22 26' },
    { label: 'Touching ends, ValueError', value: 'insert 1 5, 5 9; overlap 5 5, point 9, insert 9 3' },
    { label: 'Sorted lows: a chain', value: 'insert 0 1, 1 2, 2 3, 3 4, 4 5, 5 6; overlap 3 4' },
  ],
  randomInput: () => {
    const ivs = Array.from({ length: rint(5, 8) }, () => {
      const lo = rint(0, 60);
      return `${lo} ${Math.min(99, lo + rint(0, 25))}`;
    });
    const lo = rint(0, 60);
    return `insert ${ivs.join(', ')}; overlap ${lo} ${Math.min(99, lo + rint(0, 15))}, point ${rint(0, 70)}`;
  },
  parse: parseInterval,
  trace: (ops) => stabilizeTree(intervalTrace(ops).frames),
  render: (state) => <TreeView state={state} />,
  pseudocode: INTERVAL_CODE,
  legend: [
    { role: 'active', label: 'current node, or a max being raised' },
    { role: 'compare', label: 'visited or on the path' },
    { role: 'done', label: 'just inserted' },
    { role: 'good', label: `matches the query (${SYM.check})` },
    { role: 'muted', label: 'subtree skipped by the max or low test' },
    { role: 'bad', label: `deleted, or rejected with ValueError (${SYM.cross})` },
  ],
  complexity: { time: 'insert / delete O(h); queries about O(h + k), O(n) worst', space: 'O(n)' },
};
