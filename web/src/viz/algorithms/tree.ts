/**
 * Binary search tree and AVL tree tracers.
 *
 * Input is a list of operations on keys 0..999:
 *   "50 30 70"  insert,  "-30"  delete,  "?60"  search
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { TreeState } from '../renderers/TreeView';

export type Op = { kind: 'insert' | 'delete' | 'search'; key: number };

export function parseOps(text: string, { maxOps = 30 } = {}): Op[] {
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  if (tokens.length === 0) throw new InputError('Enter some keys, e.g. "50 30 70 -30 ?70".');
  if (tokens.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${tokens.length}).`);
  return tokens.map((t) => {
    const m = t.match(/^([+?-]?)(\d{1,3})$/);
    if (!m) throw new InputError(`"${t}" is not an operation. Use 42 (insert), -42 (delete) or ?42 (search); keys are 0..999.`);
    const kind = m[1] === '-' ? 'delete' : m[1] === '?' ? 'search' : 'insert';
    return { kind, key: Number(m[2]) };
  });
}

interface TNode {
  key: number;
  left: TNode | null;
  right: TNode | null;
  height: number;
}

const h = (n: TNode | null) => (n ? n.height : 0);
const bf = (n: TNode) => h(n.left) - h(n.right);
const update = (n: TNode) => {
  n.height = 1 + Math.max(h(n.left), h(n.right));
};

interface SnapOpts {
  roles?: Record<number, Role>;
  outlined?: number[];
  vars?: Array<[string, string | number]>;
}

class TreeRecorder {
  root: TNode | null = null;
  frames: Array<Frame<TreeState>> = [];

  constructor(readonly avl: boolean) {}

  snap(line: number | undefined, caption: string, o: SnapOpts = {}) {
    const nodes: TreeState['nodes'] = [];
    const walk = (n: TNode | null) => {
      if (!n) return;
      nodes.push({
        id: n.key,
        key: n.key,
        left: n.left?.key ?? null,
        right: n.right?.key ?? null,
        role: o.roles?.[n.key] ?? 'idle',
        badge: this.avl ? signed(bf(n)) : undefined,
        outlined: o.outlined?.includes(n.key),
      });
      walk(n.left);
      walk(n.right);
    };
    walk(this.root);
    this.frames.push({
      line,
      caption,
      state: { nodes, root: this.root?.key ?? null, badgeLabel: this.avl ? 'balance factor' : undefined },
      vars: [...(o.vars ?? []), ['size', nodes.length], ['height', h(this.root)]],
    });
  }
}

const signed = (x: number) => (x > 0 ? `+${x}` : String(x));

/** Recompute heights bottom-up (BST mode keeps them for the height counter). */
function fixHeights(n: TNode | null): number {
  if (!n) return 0;
  n.height = 1 + Math.max(fixHeights(n.left), fixHeights(n.right));
  return n.height;
}

function searchOp(r: TreeRecorder, key: number, line: number) {
  let node = r.root;
  const path: Record<number, Role> = {};
  while (node) {
    if (key === node.key) {
      r.snap(line, `Found ${key}.`, { roles: { ...path, [node.key]: 'good' }, vars: [['key', key]] });
      return;
    }
    const dir = key < node.key ? 'left' : 'right';
    r.snap(line, `${key} ${key < node.key ? '<' : '>'} ${node.key}: go ${dir}.`, { roles: { ...path, [node.key]: 'active' }, vars: [['key', key]] });
    path[node.key] = 'compare';
    node = key < node.key ? node.left : node.right;
  }
  r.snap(line, `Reached an empty spot: ${key} is not in the tree.`, { roles: path, vars: [['key', key]] });
}

// ---------------------------------------------------------------- BST

function bstInsert(r: TreeRecorder, key: number) {
  if (!r.root) {
    r.root = { key, left: null, right: null, height: 1 };
    r.snap(2, `The tree is empty: ${key} becomes the root.`, { roles: { [key]: 'done' }, vars: [['key', key]] });
    return;
  }
  const path: Record<number, Role> = {};
  let node = r.root;
  for (;;) {
    if (key === node.key) {
      r.snap(1, `${key} is already in the tree: a BST stores each key once.`, { roles: { ...path, [node.key]: 'active' }, vars: [['key', key]] });
      return;
    }
    const goLeft = key < node.key;
    r.snap(1, `${key} ${goLeft ? '<' : '>'} ${node.key}: go ${goLeft ? 'left' : 'right'}.`, { roles: { ...path, [node.key]: 'active' }, vars: [['key', key]] });
    path[node.key] = 'compare';
    const next = goLeft ? node.left : node.right;
    if (!next) {
      const leaf = { key, left: null, right: null, height: 1 };
      if (goLeft) node.left = leaf;
      else node.right = leaf;
      fixHeights(r.root);
      r.snap(2, `Empty ${goLeft ? 'left' : 'right'} child of ${node.key}: attach ${key} there.`, { roles: { ...path, [key]: 'done' }, vars: [['key', key]] });
      return;
    }
    node = next;
  }
}

function bstDelete(r: TreeRecorder, key: number) {
  let parent: TNode | null = null;
  let z = r.root;
  const path: Record<number, Role> = {};
  while (z && z.key !== key) {
    r.snap(4, `Looking for ${key}: ${key} ${key < z.key ? '<' : '>'} ${z.key}, go ${key < z.key ? 'left' : 'right'}.`, { roles: { ...path, [z.key]: 'active' }, vars: [['key', key]] });
    path[z.key] = 'compare';
    parent = z;
    z = key < z.key ? z.left : z.right;
  }
  if (!z) {
    r.snap(4, `${key} is not in the tree: nothing to delete.`, { roles: path, vars: [['key', key]] });
    return;
  }
  const replace = (target: TNode, by: TNode | null, targetParent: TNode | null) => {
    if (!targetParent) r.root = by;
    else if (targetParent.left === target) targetParent.left = by;
    else targetParent.right = by;
  };
  if (!z.left || !z.right) {
    const child = z.left ?? z.right;
    r.snap(child ? 6 : 5, child ? `${key} has one child (${child.key}): splice the child into its place.` : `${key} is a leaf: just remove it.`, {
      roles: { ...path, [key]: 'bad', ...(child ? { [child.key]: 'active' as Role } : {}) },
      vars: [['key', key]],
    });
    replace(z, child, parent);
    fixHeights(r.root);
    r.snap(child ? 6 : 5, `${key} deleted.`, { roles: child ? { [child.key]: 'done' } : {}, vars: [['key', key]] });
    return;
  }
  // Two children: the in-order successor (leftmost node of the right subtree) takes z's place.
  r.snap(7, `${key} has two children. Its in-order successor is the smallest key in its right subtree.`, { roles: { ...path, [key]: 'bad' }, vars: [['key', key]] });
  let succParent = z;
  let succ = z.right;
  const succPath: Record<number, Role> = { [key]: 'bad' };
  while (succ.left) {
    r.snap(7, `${succ.key} has a left child: keep going left.`, { roles: { ...succPath, [succ.key]: 'active' }, vars: [['key', key]] });
    succPath[succ.key] = 'compare';
    succParent = succ;
    succ = succ.left;
  }
  r.snap(7, `${succ.key} has no left child: it is the successor.`, { roles: { ...succPath, [succ.key]: 'active' }, outlined: [succ.key], vars: [['key', key], ['successor', succ.key]] });
  if (succParent !== z) {
    succParent.left = succ.right;
    succ.right = z.right;
  }
  succ.left = z.left;
  replace(z, succ, parent);
  fixHeights(r.root);
  r.snap(8, `${succ.key} takes ${key}'s place (its own right child, if any, moved up to its old spot). In-order order is preserved.`, {
    roles: { [succ.key]: 'done' },
    vars: [['key', key], ['successor', succ.key]],
  });
}

export function bstTrace(ops: Op[]): Array<Frame<TreeState>> {
  const r = new TreeRecorder(false);
  r.snap(undefined, 'Start with an empty binary search tree: smaller keys go left, larger keys go right.');
  for (const op of ops) {
    if (op.kind === 'insert') bstInsert(r, op.key);
    else if (op.kind === 'delete') bstDelete(r, op.key);
    else searchOp(r, op.key, 3);
  }
  r.snap(undefined, `Done. In-order traversal: ${inorder(r.root).join(', ') || '(empty)'} (always sorted).`);
  return r.frames;
}

// ---------------------------------------------------------------- AVL

function rotateRight(y: TNode): TNode {
  const x = y.left!;
  y.left = x.right;
  x.right = y;
  update(y);
  update(x);
  return x;
}

function rotateLeft(x: TNode): TNode {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  update(x);
  update(y);
  return y;
}

/**
 * Rebalance `node` (whose children are already balanced) and return the new subtree root.
 * `attach` writes the returned subtree back into the tree so snapshots stay consistent.
 */
function rebalance(r: TreeRecorder, node: TNode, attach: (n: TNode) => void): TNode {
  update(node);
  const b = bf(node);
  r.snap(1, `Back at ${node.key}: height ${node.height}, balance factor ${signed(b)}${Math.abs(b) > 1 ? ' (unbalanced!)' : ''}.`, {
    roles: { [node.key]: Math.abs(b) > 1 ? 'bad' : 'active' },
    vars: [['node', node.key], ['bf', signed(b)]],
  });
  if (b > 1) {
    const left = node.left!;
    const leftRight = bf(left) < 0;
    const line = leftRight ? 5 : 3;
    if (leftRight) {
      r.snap(line, `Left-Right case at ${node.key}: first rotate ${left.key} left...`, { roles: { [node.key]: 'bad', [left.key]: 'active', [left.right!.key]: 'compare' } });
      node.left = rotateLeft(left);
      attach(node);
      r.snap(line, '...which turns it into a Left-Left case.', { roles: { [node.key]: 'bad', [node.left.key]: 'active' } });
    } else {
      r.snap(line, `Left-Left case at ${node.key}: rotate right.`, { roles: { [node.key]: 'bad', [left.key]: 'active' } });
    }
    const top = rotateRight(node);
    attach(top);
    r.snap(line, `Rotated right: ${top.key} is now the root of this subtree; ${node.key} is its right child.`, {
      roles: { [top.key]: 'done', [node.key]: 'compare' },
    });
    return top;
  }
  if (b < -1) {
    const right = node.right!;
    const rightLeft = bf(right) > 0;
    const line = rightLeft ? 6 : 4;
    if (rightLeft) {
      r.snap(line, `Right-Left case at ${node.key}: first rotate ${right.key} right...`, { roles: { [node.key]: 'bad', [right.key]: 'active', [right.left!.key]: 'compare' } });
      node.right = rotateRight(right);
      attach(node);
      r.snap(line, '...which turns it into a Right-Right case.', { roles: { [node.key]: 'bad', [node.right.key]: 'active' } });
    } else {
      r.snap(line, `Right-Right case at ${node.key}: rotate left.`, { roles: { [node.key]: 'bad', [right.key]: 'active' } });
    }
    const top = rotateLeft(node);
    attach(top);
    r.snap(line, `Rotated left: ${top.key} is now the root of this subtree; ${node.key} is its left child.`, {
      roles: { [top.key]: 'done', [node.key]: 'compare' },
    });
    return top;
  }
  return node;
}

/** Writes a subtree root back into its parent slot (or the tree root). */
type Attach = (n: TNode | null) => void;

function avlInsert(r: TreeRecorder, node: TNode | null, key: number, attach: Attach, path: Record<number, Role>): TNode | null {
  if (!node) {
    const leaf: TNode = { key, left: null, right: null, height: 1 };
    attach(leaf);
    r.snap(0, `Insert ${key} at the empty spot, exactly like a plain BST.`, { roles: { ...path, [key]: 'done' }, vars: [['key', key]] });
    return leaf;
  }
  if (key === node.key) {
    r.snap(0, `${key} is already in the tree.`, { roles: { ...path, [key]: 'active' }, vars: [['key', key]] });
    return node;
  }
  const goLeft = key < node.key;
  r.snap(0, `${key} ${goLeft ? '<' : '>'} ${node.key}: go ${goLeft ? 'left' : 'right'}.`, { roles: { ...path, [node.key]: 'active' }, vars: [['key', key]] });
  const childPath = { ...path, [node.key]: 'compare' as Role };
  const child = goLeft
    ? avlInsert(r, node.left, key, (n) => (node.left = n), childPath)
    : avlInsert(r, node.right, key, (n) => (node.right = n), childPath);
  if (goLeft) node.left = child;
  else node.right = child;
  return rebalance(r, node, (n) => attach(n));
}

function minNode(n: TNode): TNode {
  return n.left ? minNode(n.left) : n;
}

function avlDelete(r: TreeRecorder, node: TNode | null, key: number, attach: Attach, path: Record<number, Role>): TNode | null {
  if (!node) {
    r.snap(0, `${key} is not in the tree: nothing to delete.`, { roles: path, vars: [['key', key]] });
    return null;
  }
  if (key !== node.key) {
    const goLeft = key < node.key;
    r.snap(0, `Looking for ${key}: go ${goLeft ? 'left' : 'right'} at ${node.key}.`, { roles: { ...path, [node.key]: 'active' }, vars: [['key', key]] });
    const childPath = { ...path, [node.key]: 'compare' as Role };
    if (goLeft) node.left = avlDelete(r, node.left, key, (n) => (node.left = n), childPath);
    else node.right = avlDelete(r, node.right, key, (n) => (node.right = n), childPath);
    return rebalance(r, node, (n) => attach(n));
  }
  if (!node.left || !node.right) {
    const child = node.left ?? node.right;
    r.snap(0, child ? `${key} has one child: splice ${child.key} into its place.` : `${key} is a leaf: remove it.`, { roles: { ...path, [key]: 'bad' }, vars: [['key', key]] });
    attach(child);
    r.snap(0, `${key} deleted; now rebalance on the way back up.`, { roles: child ? { [child.key]: 'done' } : {}, vars: [['key', key]] });
    return child;
  }
  const succ = minNode(node.right);
  r.snap(0, `${key} has two children: replace its key with the successor ${succ.key}, then delete ${succ.key} from the right subtree.`, {
    roles: { ...path, [key]: 'bad' },
    outlined: [succ.key],
    vars: [['key', key], ['successor', succ.key]],
  });
  // Move the successor node itself into place so the picture keeps node identities.
  const rightWithout = removeMin(node.right);
  const replacement: TNode = succ;
  replacement.left = node.left;
  replacement.right = rightWithout;
  attach(replacement);
  fixHeights(r.root);
  r.snap(0, `${succ.key} now sits where ${key} was.`, { roles: { [succ.key]: 'done' }, vars: [['key', key]] });
  return rebalanceRightSpine(r, replacement, attach);
}

/** Detach and return the tree without its minimum node (heights refreshed later). */
function removeMin(n: TNode): TNode | null {
  if (!n.left) return n.right;
  n.left = removeMin(n.left);
  return n;
}

/** After removing the successor, every node on the right subtree's left spine may be unbalanced. */
function rebalanceRightSpine(r: TreeRecorder, node: TNode, attach: Attach): TNode {
  const fix = (n: TNode | null, write: Attach): TNode | null => {
    if (!n) return null;
    n.left = fix(n.left, (c) => (n.left = c));
    return rebalance(r, n, (c) => write(c));
  };
  node.right = fix(node.right, (c) => (node.right = c));
  return rebalance(r, node, (c) => attach(c));
}

export function avlTrace(ops: Op[]): Array<Frame<TreeState>> {
  const r = new TreeRecorder(true);
  r.snap(undefined, 'Start with an empty AVL tree. Badges show balance factors: height(left) - height(right) must stay in {-1, 0, +1}.');
  const setRoot: Attach = (n) => {
    r.root = n;
  };
  for (const op of ops) {
    if (op.kind === 'insert') r.root = avlInsert(r, r.root, op.key, setRoot, {});
    else if (op.kind === 'delete') r.root = avlDelete(r, r.root, op.key, setRoot, {});
    else searchOp(r, op.key, 0);
    r.snap(undefined, `After ${op.kind} ${op.key}: height ${h(r.root)} for ${count(r.root)} keys.`);
  }
  r.snap(undefined, `Done. In-order traversal: ${inorder(r.root).join(', ') || '(empty)'}; every balance factor is -1, 0 or +1.`);
  return r.frames;
}

// ---------------------------------------------------------------- helpers for tests

export function inorder(n: TNode | null): number[] {
  return n ? [...inorder(n.left), n.key, ...inorder(n.right)] : [];
}

function count(n: TNode | null): number {
  return n ? 1 + count(n.left) + count(n.right) : 0;
}

/** Rebuild the final tree from a frame (tests check BST order and AVL balance on it). */
export function treeFromState(state: TreeState): { keys: number[]; balanced: boolean; ordered: boolean } {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  let ordered = true;
  let balanced = true;
  const keys: number[] = [];
  const height = (id: number | null, lo: number, hi: number): number => {
    if (id === null) return 0;
    const n = byId.get(id)!;
    if (n.key <= lo || n.key >= hi) ordered = false;
    const hl = height(n.left, lo, n.key);
    keys.push(n.key);
    const hr = height(n.right, n.key, hi);
    if (Math.abs(hl - hr) > 1) balanced = false;
    return 1 + Math.max(hl, hr);
  };
  height(state.root, -Infinity, Infinity);
  return { keys, balanced, ordered };
}
