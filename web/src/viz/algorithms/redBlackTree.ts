/**
 * Red-black tree tracer: BST insert as a red node, then the insert fix-up with every case named
 * (case 1 uncle red: recolor; case 2 triangle: rotate at the parent; case 3 line: recolor and
 * rotate at the grandparent; each with its mirror), plus search, find_min and find_max.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Red_Black_Tree/Python/red_black_tree.py:
 * RedBlackTree.insert / _insert_fixup / _left_rotate / _right_rotate / _search_recursive /
 * find_min / find_max / height. The Python NIL sentinel is null here (it is black). Equal keys go
 * right (insert tests `z.data < x.data`), so duplicates become extra nodes. There is no delete in
 * the repository, so there is none here. height() counts NODES (empty tree 0, one node 1).
 * Golden fixtures (__fixtures__/binaryTrees.json, section redBlack) pin colours, shape and results.
 *
 * Input: "insert 10 20 30 40 50 25, search 25"  (bare numbers insert; ?k searches; min, max)
 */
import type { Frame, Role } from '../core/types';
import type { TreeState } from '../renderers/TreeView';
import { collectViews, formatKeyOp, opsStrip, parseKeyScript, pyList, type BNode, type KeyOp, type KeyScript } from './binaryTreesCommon';

export const RB_LIMITS = { maxOps: 30, maxKeys: 15 };

export function parseRedBlack(text: string): KeyScript {
  return parseKeyScript(text, {
    kinds: ['insert', 'search', 'min', 'max'],
    maxOps: RB_LIMITS.maxOps,
    maxKeys: RB_LIMITS.maxKeys,
    multiset: true,
    example: 'Write e.g. "insert 10 20 30 40, search 30, min, max" (or "10 20 30 ?30"); keys 0..999. There is no delete.',
  });
}

export const RB_CODE = [
  'insert(data): z = RBNode(data, RED); y = NIL; x = root',
  '  while x != NIL: y = x; x = x.left if z.data < x.data else x.right',
  '  z.parent = y; make z the root, or y.left / y.right; _insert_fixup(z)',
  '_insert_fixup(z): while z.parent.color == RED:',
  '  p = z.parent; g = p.parent; y = uncle (g.right if p == g.left, else g.left)',
  '  if y.color == RED:                              # case 1: uncle red',
  '    p.color = BLACK; y.color = BLACK; g.color = RED; z = g',
  '  else: if z is an inner child:                   # case 2: triangle',
  '      z = p; rotate z outward (left_rotate if p == g.left, else right_rotate)',
  '    z.parent.color = BLACK; z.parent.parent.color = RED   # case 3: line',
  '    rotate the grandparent the other way (right_rotate if p was g.left, else left_rotate)',
  'root.color = BLACK',
  'search(data): node == NIL: return False; node.data == data: return True',
  '  return search(node.left) if data < node.data else search(node.right)',
  'find_min() / find_max(): follow left / right links from the root',
];

type Color = 'red' | 'black';

interface Node extends BNode {
  data: number;
  color: Color;
  left: Node | null;
  right: Node | null;
  parent: Node | null;
}

/** [data, 'R' | 'B', left, right], or null for NIL. */
export type RbNested = null | [number, 'R' | 'B', RbNested, RbNested];

export interface RbStep {
  op: KeyOp;
  result: boolean | number | null;
  tree: RbNested;
  /** Rotations done by this operation, in order: "L 10" = left rotation at 10. */
  rotations: string[];
  /** Fix-up cases met, in order: 1, 2, 3 (mirrors included). */
  cases: number[];
}

export interface RbRun {
  frames: Array<Frame<TreeState>>;
  steps: RbStep[];
}

function nested(n: Node | null): RbNested {
  return n ? [n.data, n.color === 'red' ? 'R' : 'B', nested(n.left), nested(n.right)] : null;
}

/** Height in nodes, as RedBlackTree.height() returns it (NIL is 0). */
function heightNodes(n: Node | null): number {
  return n ? 1 + Math.max(heightNodes(n.left), heightNodes(n.right)) : 0;
}

/** Black nodes on the leftmost path (every path has the same count in a valid tree). */
function blackHeight(n: Node | null): number {
  let h = 0;
  for (let c = n; c; c = c.left) if (c.color === 'black') h++;
  return h;
}

interface SnapOpts {
  roles?: Record<number, Role>;
  tags?: Record<number, string>;
  path?: number[];
  vars?: Array<[string, string | number]>;
}

export function redBlackTrace({ ops }: KeyScript): RbRun {
  let root: Node | null = null;
  let nextId = 1;
  let current = -1;
  let size = 0;
  const frames: Array<Frame<TreeState>> = [];
  const steps: RbStep[] = [];
  const labels = ops.map(formatKeyOp);
  let rotations: string[] = [];
  let cases: number[] = [];

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const onPath = new Set(o.path ?? []);
    frames.push({
      line,
      caption,
      state: {
        nodes: collectViews([root], (n: Node) => ({
          key: n.data,
          role: o.roles?.[n.id] ?? 'idle',
          color: n.color,
          tag: o.tags?.[n.id],
          edgeRole: onPath.has(n.id) ? 'compare' : undefined,
        })),
        root: root?.id ?? null,
        strips: [opsStrip(labels, current)],
      },
      vars: [...(o.vars ?? []), ['size()', size], ['height() (nodes)', heightNodes(root)], ['black height', blackHeight(root)]],
    });
  };

  const leftRotate = (x: Node) => {
    const y = x.right!;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
    rotations.push(`L ${x.data}`);
  };
  const rightRotate = (y: Node) => {
    const x = y.left!;
    y.left = x.right;
    if (x.right) x.right.parent = y;
    x.parent = y.parent;
    if (!y.parent) root = x;
    else if (y === y.parent.left) y.parent.left = x;
    else y.parent.right = x;
    x.right = y;
    y.parent = x;
    rotations.push(`R ${y.data}`);
  };

  const colorName = (n: Node | null) => (n ? n.color : 'black');
  const nodeName = (n: Node | null) => (n ? String(n.data) : 'NIL');

  const fixup = (start: Node) => {
    let z = start;
    let first = true;
    while (z.parent && z.parent.color === 'red') {
      const p = z.parent;
      const g = p.parent!; // a red parent is never the root, so g exists
      const leftSide = p === g.left;
      const y = leftSide ? g.right : g.left;
      const tags: Record<number, string> = { [z.id]: 'z', [p.id]: 'p', [g.id]: 'g' };
      if (y) tags[y.id] = 'u';
      const side = leftSide ? 'left' : 'right';
      snap(
        4,
        `${first ? '' : 'Again: '}z = ${z.data} and its parent ${p.data} are both red, which breaks rule 4 (a red node has black children). ` +
          `p is the ${side} child of g = ${g.data}, so the uncle u is g.${leftSide ? 'right' : 'left'} = ${nodeName(y)}, which is ${colorName(y)}${y ? '' : ' (NIL leaves count as black)'}.`,
        { roles: { [z.id]: 'active', [p.id]: 'active', [g.id]: 'compare', ...(y ? { [y.id]: 'compare' as Role } : {}) }, tags, vars: [['z', z.data], ['uncle', nodeName(y)]] },
      );
      first = false;
      if (y && y.color === 'red') {
        cases.push(1);
        p.color = 'black';
        y.color = 'black';
        g.color = 'red';
        z = g;
        snap(
          6,
          `Case 1 (uncle red): recolor p = ${p.data} and u = ${y.data} black and g = ${g.data} red. Each path through g swaps one black node for another, so black heights are unchanged. ` +
            `But g may now be red under a red parent, so z moves up two levels to g.`,
          { roles: { [g.id]: 'active', [p.id]: 'done', [y.id]: 'done' }, tags: { [g.id]: 'z' }, vars: [['case', 1], ['z', z.data]] },
        );
        continue;
      }
      let pp = p;
      if (leftSide ? z === p.right : z === p.left) {
        cases.push(2);
        snap(
          7,
          `Case 2 (triangle${leftSide ? '' : ', mirrored'}): the uncle is black and z = ${z.data} is the ${leftSide ? 'right' : 'left'} child of a ${side} child. ` +
            `Rotate ${leftSide ? 'left' : 'right'} at p = ${p.data} to straighten the triangle into a line; then the old parent plays z.`,
          { roles: { [z.id]: 'active', [p.id]: 'active' }, tags, vars: [['case', 2]] },
        );
        z = p;
        if (leftSide) leftRotate(z);
        else rightRotate(z);
        pp = z.parent!;
        snap(
          8,
          `Rotated ${leftSide ? 'left' : 'right'} at ${z.data}: ${pp.data} moved up and ${z.data} is now its ${side} child, an outer child of g = ${g.data}. Keys stay in order. Now case 3 applies, with z = ${z.data}.`,
          { roles: { [z.id]: 'active', [pp.id]: 'active' }, tags: { [z.id]: 'z', [pp.id]: 'p', [g.id]: 'g' }, vars: [['case', 2], ['z', z.data]] },
        );
      }
      cases.push(3);
      pp.color = 'black';
      g.color = 'red';
      snap(
        9,
        `Case 3 (line${leftSide ? '' : ', mirrored'}): z = ${z.data} is an outer child and the uncle is black. Color p = ${pp.data} black and g = ${g.data} red, then rotate ${leftSide ? 'right' : 'left'} at g.`,
        { roles: { [pp.id]: 'active', [g.id]: 'compare', [z.id]: 'active' }, tags: { [z.id]: 'z', [pp.id]: 'p', [g.id]: 'g' }, vars: [['case', 3]] },
      );
      if (leftSide) rightRotate(g);
      else leftRotate(g);
      snap(
        10,
        `Rotated ${leftSide ? 'right' : 'left'} at ${g.data}: the black ${pp.data} takes g's place with two red children, ${z.data} and ${g.data}. ` +
          `No red node has a red child any more and every black height is as before, so the loop ends.`,
        { roles: { [pp.id]: 'done', [z.id]: 'done', [g.id]: 'done' }, vars: [['case', 3]] },
      );
    }
    return z;
  };

  const insert = (key: number) => {
    const path: number[] = [];
    const seen: Record<number, Role> = {};
    let y: Node | null = null;
    let x = root;
    while (x) {
      const left = key < x.data;
      snap(
        1,
        `${key} ${left ? '<' : key === x.data ? '==' : '>'} ${x.data}: go ${left ? 'left' : 'right'}${key === x.data ? ' (equal keys go right: the code only tests z.data < x.data, so a duplicate becomes another node)' : ''}.`,
        { roles: { ...seen, [x.id]: 'active' }, path: [...path], vars: [['key', key]] },
      );
      seen[x.id] = 'compare';
      y = x;
      x = left ? x.left : x.right;
      if (x) path.push(x.id);
    }
    const z: Node = { id: nextId++, data: key, color: 'red', left: null, right: null, parent: y };
    size++;
    if (!y) root = z;
    else if (key < y.data) y.left = z;
    else y.right = z;
    const where = y ? `the empty ${y.left === z ? 'left' : 'right'} slot of ${y.data}` : 'the root of the empty tree';
    snap(
      2,
      `Attach ${key} at ${where}, colored red. A red node adds no black node to any path, so rule 5 (equal black heights) still holds; only rule 4 or rule 2 can break.`,
      { roles: { ...seen, [z.id]: 'active' }, tags: { [z.id]: 'z' }, path: [...path, z.id], vars: [['key', key]] },
    );
    const z2 = fixup(z);
    const wasRed = root!.color === 'red';
    root!.color = 'black';
    if (z === z2 && z.parent && z.parent.color === 'black' && cases.length === 0) {
      snap(3, `z's parent ${z.parent.data} is black, so no red node has a red child: nothing to fix. The root stays black.`, {
        roles: { [z.id]: 'done' },
        vars: [['key', key]],
      });
    } else {
      snap(
        11,
        wasRed
          ? `${root!.data} is the root and it is red${root === z ? ' (the first key)' : ' (case 1 recolored it)'}: rule 2 says the root is black, so color it black. That adds one black node to every path at once.`
          : `The loop is over and the root ${root!.data} is black: all five rules hold again.`,
        { roles: { [root!.id]: 'done' }, vars: [['key', key]] },
      );
    }
  };

  const search = (key: number): boolean => {
    const seen: Record<number, Role> = {};
    const path: number[] = [];
    let n = root;
    while (n) {
      if (n.data === key) {
        snap(12, `${key} == ${n.data}: search returns True.`, { roles: { ...seen, [n.id]: 'good' }, path, vars: [['key', key]] });
        return true;
      }
      const left = key < n.data;
      snap(13, `${key} ${left ? '<' : '>'} ${n.data}: search the ${left ? 'left' : 'right'} subtree. The colours play no part in a search.`, {
        roles: { ...seen, [n.id]: 'active' },
        path: [...path],
        vars: [['key', key]],
      });
      seen[n.id] = 'compare';
      n = left ? n.left : n.right;
      if (n) path.push(n.id);
    }
    snap(12, `Reached a NIL leaf: ${key} is not in the tree, so search returns False.`, { roles: seen, path, vars: [['key', key]] });
    return false;
  };

  const extreme = (kind: 'min' | 'max'): number | null => {
    if (!root) {
      snap(14, `find_${kind}(): the tree is empty, so it returns None.`);
      return null;
    }
    const seen: Record<number, Role> = {};
    const path: number[] = [];
    let n = root;
    for (;;) {
      const next = kind === 'min' ? n.left : n.right;
      if (!next) break;
      snap(14, `${n.data} has a ${kind === 'min' ? 'left' : 'right'} child, so a ${kind === 'min' ? 'smaller' : 'larger'} key exists: keep going ${kind === 'min' ? 'left' : 'right'}.`, {
        roles: { ...seen, [n.id]: 'active' },
        path: [...path],
      });
      seen[n.id] = 'compare';
      n = next;
      path.push(n.id);
    }
    snap(14, `${n.data} has no ${kind === 'min' ? 'left' : 'right'} child: find_${kind}() returns ${n.data}.`, { roles: { ...seen, [n.id]: 'good' }, path });
    return n.data;
  };

  snap(undefined, 'RedBlackTree(): the root is the NIL sentinel. New keys go in as red leaves; the fix-up then restores the rules with recoloring and at most two rotations.');
  ops.forEach((op, i) => {
    current = i;
    rotations = [];
    cases = [];
    let result: RbStep['result'] = null;
    if (op.kind === 'insert') insert(op.key!);
    else if (op.kind === 'search') result = search(op.key!);
    else result = extreme(op.kind as 'min' | 'max');
    steps.push({ op, result, tree: nested(root), rotations: [...rotations], cases: [...cases] });
  });
  current = ops.length;
  const keys: number[] = [];
  const walk = (n: Node | null) => {
    if (!n) return;
    walk(n.left);
    keys.push(n.data);
    walk(n.right);
  };
  walk(root);
  snap(undefined, `Done: ${size} key${size === 1 ? '' : 's'}, in-order ${pyList(keys)}. Every root-to-NIL path has ${blackHeight(root)} black node${blackHeight(root) === 1 ? '' : 's'}; height() = ${heightNodes(root)} (it counts nodes).`);
  return { frames, steps };
}

/** Rebuild a nested tree and check the red-black rules (tests). Returns the problems found. */
export function rbProblems(t: RbNested): string[] {
  const out: string[] = [];
  if (t && t[1] !== 'B') out.push('red root');
  const rec = (n: RbNested, lo: number, hi: number, parentRed: boolean): number => {
    if (!n) return 1;
    const [k, c, l, r] = n;
    if (k < lo || k > hi) out.push(`order broken at ${k}`);
    if (parentRed && c === 'R') out.push(`red ${k} under a red parent`);
    const bl = rec(l, lo, k, c === 'R');
    const br = rec(r, k, hi, c === 'R');
    if (bl !== br) out.push(`black heights differ under ${k}`);
    return bl + (c === 'B' ? 1 : 0);
  };
  rec(t, -Infinity, Infinity, false);
  return out;
}
