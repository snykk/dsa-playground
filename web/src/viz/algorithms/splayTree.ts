/**
 * Splay tree tracer: every access splays (zig, zig-zig, zig-zag, each named), a search or a
 * delete that misses splays the last node it reached, and delete splits the tree at the splayed
 * key, splays the maximum of the left half and hangs the right half under it.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Splay_Tree/Python/splay_tree.py: SplayTree._splay /
 * _right_rotate / _left_rotate / _search_node / insert / search / delete / find_min / find_max.
 * Keys only: insert(key) stores the value None, so search returns None on a hit and on a miss
 * (the caption says which). Golden fixtures (__fixtures__/binaryTrees.json, section splay) pin the
 * shape, every result and the rotation sequence of every operation.
 *
 * Input: "insert 1 2 3 4 5, search 1, delete 3"  (bare numbers insert; ?k search; -k delete; min, max)
 */
import type { Frame, Role } from '../core/types';
import type { TreeState } from '../renderers/TreeView';
import { collectViews, formatKeyOp, opsStrip, parseKeyScript, pyList, subtreeIds, type BNode, type KeyOp, type KeyScript } from './binaryTreesCommon';

export const SPLAY_LIMITS = { maxOps: 30, maxKeys: 10 };

export function parseSplay(text: string): KeyScript {
  return parseKeyScript(text, {
    kinds: ['insert', 'search', 'delete', 'min', 'max'],
    maxOps: SPLAY_LIMITS.maxOps,
    maxKeys: SPLAY_LIMITS.maxKeys,
    example: 'Write e.g. "insert 1 2 3 4 5, search 1, delete 3, min" (or "1 2 3 ?1 -3"); keys 0..999.',
  });
}

export const SPLAY_CODE = [
  '_splay(x): while x.parent is not None:',
  '  p = x.parent; g = p.parent',
  '  if g is None: rotate at p (right if x == p.left, else left)          # zig',
  '  elif x, p are both left (or both right) children: rotate at g, then at p   # zig-zig',
  '  else: rotate at p, then at g                                          # zig-zag',
  'insert(key): walk down from the root; key found: node.value = value; _splay(node)',
  '  attach SplayNode(key) at the empty spot; _splay(new_node)',
  'search(key): node = _search_node(key)      # the key, or the last node visited',
  '  _splay(node); return node.value if node.key == key else None',
  'delete(key): node = _search_node(key); if node.key != key: _splay(node); return False',
  '  _splay(node); left, right = node.left, node.right; clear their parents',
  '  if left is None: root = right; elif right is None: root = left',
  '  else: root = left; _splay(max of left); max_left.right = right; root = max_left',
  'find_min() / find_max(): walk to the end of the left / right spine; _splay(it)',
];

interface Node extends BNode {
  key: number;
  left: Node | null;
  right: Node | null;
  parent: Node | null;
}

export type Nested = null | [number, Nested, Nested];

export interface SplayStep {
  op: KeyOp;
  /** search: null (the stored value is None either way), plus `found`; delete: a boolean; min/max: a key or null. */
  result: boolean | number | null;
  found?: boolean;
  tree: Nested;
  /** Rotations in order: "R 5" = _right_rotate at the node with key 5. */
  rotations: string[];
}

export interface SplayRun {
  frames: Array<Frame<TreeState>>;
  steps: SplayStep[];
}

function nested(n: Node | null): Nested {
  return n ? [n.key, nested(n.left), nested(n.right)] : null;
}

interface SnapOpts {
  roles?: Record<number, Role>;
  tags?: Record<number, string>;
  path?: number[];
  /** Trees drawn side by side instead of the root (delete's two halves). */
  forest?: Array<{ node: Node; label?: string }>;
  vars?: Array<[string, string | number]>;
}

export function splayTrace({ ops }: KeyScript): SplayRun {
  let root: Node | null = null;
  let nextId = 1;
  let current = -1;
  const frames: Array<Frame<TreeState>> = [];
  const steps: SplayStep[] = [];
  const labels = ops.map(formatKeyOp);
  let rotations: string[] = [];
  let access = 0;
  let accessDepth = 0;
  /** While delete splays inside the left half, both halves are drawn side by side. */
  let forestView: (() => NonNullable<SnapOpts['forest']>) | undefined;

  const depthOf = (n: Node) => {
    let d = 0;
    for (let c = n.parent; c; c = c.parent) d++;
    return d;
  };
  const height = (n: Node | null): number => (n ? 1 + Math.max(height(n.left), height(n.right)) : -1);

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const onPath = new Set(o.path ?? []);
    const forest = o.forest ?? forestView?.();
    const roots = forest ? forest.map((t) => t.node) : [root];
    frames.push({
      line,
      caption,
      state: {
        nodes: collectViews(roots, (n: Node) => ({
          key: n.key,
          role: o.roles?.[n.id] ?? 'idle',
          tag: o.tags?.[n.id],
          edgeRole: onPath.has(n.id) ? 'compare' : undefined,
        })),
        root: root?.id ?? null,
        forest: forest?.map((t) => ({ root: t.node.id, label: t.label })),
        strips: [opsStrip(labels, current)],
      },
      vars: [...(o.vars ?? []), ['height (edges)', height(root)], ['last access depth', accessDepth], ['rotations so far', access]],
    });
  };

  /** _right_rotate(x): x's left child y moves up. */
  const rightRotate = (x: Node) => {
    const y = x.left;
    if (!y) return;
    x.left = y.right;
    if (y.right) y.right.parent = x;
    y.parent = x.parent;
    if (!x.parent) root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.right = x;
    x.parent = y;
    rotations.push(`R ${x.key}`);
    access++;
  };
  const leftRotate = (x: Node) => {
    const y = x.right;
    if (!y) return;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
    rotations.push(`L ${x.key}`);
    access++;
  };

  /** _splay(node), one frame for the case and one per rotation. `within` names the tree being splayed (delete). */
  const splay = (x: Node, why: string) => {
    if (!x.parent) {
      snap(0, `_splay(${x.key}): ${why} ${x.key} is already ${forestView ? 'the root of the left half' : 'the root'}, so there is nothing to rotate.`, { roles: { [x.id]: 'done' } });
      return;
    }
    snap(0, `_splay(${x.key}): ${why} ${x.key} is at depth ${depthOf(x)}; each step below lifts it one or two levels.`, { roles: { [x.id]: 'active' }, tags: { [x.id]: 'x' } });
    while (x.parent) {
      const p = x.parent;
      const g = p.parent;
      const tags: Record<number, string> = { [x.id]: 'x', [p.id]: 'p' };
      if (g) tags[g.id] = 'g';
      const roles: Record<number, Role> = { [x.id]: 'active', [p.id]: 'compare', ...(g ? { [g.id]: 'compare' as Role } : {}) };
      if (!g) {
        const isLeft = x === p.left;
        snap(2, `Zig: the parent p = ${p.key} is the root and x = ${x.key} is its ${isLeft ? 'left' : 'right'} child, so one ${isLeft ? 'right' : 'left'} rotation at p finishes the splay.`, { roles, tags, vars: [['case', 'zig']] });
        if (isLeft) rightRotate(p);
        else leftRotate(p);
        snap(2, `Rotated ${isLeft ? 'right' : 'left'} at ${p.key}: ${x.key} is the root now, and ${p.key} its ${isLeft ? 'right' : 'left'} child.`, {
          roles: { [x.id]: 'done', [p.id]: 'compare' },
          vars: [['case', 'zig']],
        });
      } else if ((x === p.left && p === g.left) || (x === p.right && p === g.right)) {
        const isLeft = x === p.left;
        const dir = isLeft ? 'right' : 'left';
        snap(
          3,
          `Zig-zig: x = ${x.key} and p = ${p.key} are both ${isLeft ? 'left' : 'right'} children. Rotate ${dir} at the grandparent g = ${g.key} first, then ${dir} at p. Rotating g first is what roughly halves the depth of the whole path.`,
          { roles, tags, vars: [['case', 'zig-zig']] },
        );
        if (isLeft) rightRotate(g);
        else leftRotate(g);
        snap(3, `First rotation (${dir} at g = ${g.key}): p = ${p.key} moved up and took g as its ${isLeft ? 'right' : 'left'} child.`, {
          roles: { [x.id]: 'active', [p.id]: 'compare', [g.id]: 'compare' },
          tags,
          vars: [['case', 'zig-zig']],
        });
        if (isLeft) rightRotate(p);
        else leftRotate(p);
        snap(3, `Second rotation (${dir} at p = ${p.key}): x = ${x.key} is two levels higher, with p and g hanging off its ${isLeft ? 'right' : 'left'} side.`, {
          roles: { [x.id]: 'active', [p.id]: 'compare', [g.id]: 'compare' },
          tags,
          vars: [['case', 'zig-zig']],
        });
      } else {
        const xLeft = x === p.left;
        const first = xLeft ? 'right' : 'left';
        const second = xLeft ? 'left' : 'right';
        snap(
          4,
          `Zig-zag: x = ${x.key} is a ${xLeft ? 'left' : 'right'} child but p = ${p.key} is a ${xLeft ? 'right' : 'left'} child. Rotate ${first} at p, then ${second} at g = ${g.key}: x ends up above both, with p and g as its children.`,
          { roles, tags, vars: [['case', 'zig-zag']] },
        );
        if (xLeft) rightRotate(p);
        else leftRotate(p);
        snap(4, `First rotation (${first} at p = ${p.key}): x = ${x.key} took p's place under g; the zig-zag is now a straight line.`, {
          roles: { [x.id]: 'active', [p.id]: 'compare', [g.id]: 'compare' },
          tags,
          vars: [['case', 'zig-zag']],
        });
        if (xLeft) leftRotate(g);
        else rightRotate(g);
        snap(4, `Second rotation (${second} at g = ${g.key}): x = ${x.key} is two levels higher, between its old parent and grandparent.`, {
          roles: { [x.id]: 'active', [p.id]: 'compare', [g.id]: 'compare' },
          tags,
          vars: [['case', 'zig-zag']],
        });
      }
    }
  };

  /** _search_node(key): the node with the key, or the last node visited (null only for an empty tree). */
  const searchNode = (key: number, line: number): Node | null => {
    let n = root;
    const seen: Record<number, Role> = {};
    const path: number[] = [];
    while (n) {
      if (key === n.key) {
        accessDepth = path.length;
        return n;
      }
      const left = key < n.key;
      const next = left ? n.left : n.right;
      snap(line, `${key} ${left ? '<' : '>'} ${n.key}: ${next ? `go ${left ? 'left' : 'right'}` : `${n.key} has no ${left ? 'left' : 'right'} child, so ${key} is not in the tree and ${n.key} is the last node visited`}.`, {
        roles: { ...seen, [n.id]: 'active' },
        path: [...path],
        vars: [['key', key]],
      });
      if (!next) {
        accessDepth = path.length;
        return n;
      }
      seen[n.id] = 'compare';
      n = next;
      path.push(n.id);
    }
    return null;
  };

  const insert = (key: number) => {
    if (!root) {
      root = { id: nextId++, key, left: null, right: null, parent: null };
      accessDepth = 0;
      snap(5, `The tree is empty: ${key} becomes the root (no splay needed).`, { roles: { [root.id]: 'done' }, vars: [['key', key]] });
      return;
    }
    let cur: Node | null = root;
    let parent: Node | null = null;
    const seen: Record<number, Role> = {};
    const path: number[] = [];
    while (cur) {
      parent = cur;
      if (key === cur.key) {
        accessDepth = path.length;
        snap(5, `${key} is already in the tree: insert overwrites its value and splays it, because it was just accessed.`, { roles: { ...seen, [cur.id]: 'good' }, path, vars: [['key', key]] });
        splay(cur, `An access, so splay ${key} to the root.`);
        return;
      }
      const left: boolean = key < cur.key;
      snap(5, `${key} ${left ? '<' : '>'} ${cur.key}: go ${left ? 'left' : 'right'}.`, { roles: { ...seen, [cur.id]: 'active' }, path: [...path], vars: [['key', key]] });
      seen[cur.id] = 'compare';
      cur = left ? cur.left : cur.right;
      if (cur) path.push(cur.id);
    }
    const node: Node = { id: nextId++, key, left: null, right: null, parent };
    if (key < parent!.key) parent!.left = node;
    else parent!.right = node;
    accessDepth = path.length + 1;
    snap(6, `Attach ${key} as the ${parent!.left === node ? 'left' : 'right'} child of ${parent!.key}, like a plain BST insert.`, {
      roles: { ...seen, [node.id]: 'active' },
      path: [...path, node.id],
      vars: [['key', key]],
    });
    splay(node, `Every access splays, and an insert is an access: bring ${key} to the root.`);
  };

  const search = (key: number): { result: null; found: boolean } => {
    if (!root) {
      snap(7, `search(${key}): the tree is empty, so _search_node returns None and search returns None without splaying.`, { vars: [['key', key]] });
      return { result: null, found: false };
    }
    const node = searchNode(key, 7)!;
    const hit = node.key === key;
    snap(7, hit ? `Found ${key} at depth ${accessDepth}.` : `${key} is missing. _search_node returns the last node it reached, ${node.key}.`, {
      roles: { [node.id]: hit ? 'good' : 'active' },
      vars: [['key', key]],
    });
    splay(
      node,
      hit
        ? `A hit splays the key to the root, so the next access to it is cheap.`
        : `A miss still splays that last node: otherwise repeated misses below a deep path would each cost O(n) and the amortized O(log n) bound would fail.`,
    );
    snap(8, hit ? `search returns the stored value (None here: this script stores keys only), and ${key} is the root.` : `${node.key} != ${key}, so search returns None, with ${node.key} now at the root.`, {
      roles: { [root!.id]: hit ? 'good' : 'done' },
      vars: [['key', key]],
    });
    return { result: null, found: hit };
  };

  const remove = (key: number): boolean => {
    if (!root) {
      snap(9, `delete(${key}): the tree is empty, so there is nothing to splay: delete returns False.`, { vars: [['key', key]] });
      return false;
    }
    const node = searchNode(key, 9)!;
    if (node.key !== key) {
      snap(9, `${key} is not in the tree. A failed delete still splays the last node visited, ${node.key}, to pay for the walk.`, { roles: { [node.id]: 'active' }, vars: [['key', key]] });
      splay(node, 'Splay the last node visited.');
      snap(9, `delete returns False; ${node.key} is now the root.`, { roles: { [node.id]: 'done' }, vars: [['key', key]] });
      return false;
    }
    snap(9, `Found ${key}. Step 1: splay it to the root, so both of its subtrees hang directly under it.`, { roles: { [node.id]: 'bad' }, vars: [['key', key]] });
    splay(node, `Bring the node to delete to the top.`);
    const left = node.left;
    const right = node.right;
    if (left) left.parent = null;
    if (right) right.parent = null;
    node.left = null;
    node.right = null;
    const halves: NonNullable<SnapOpts['forest']> = [];
    if (left) halves.push({ node: left, label: 'left half' });
    halves.push({ node, label: 'deleted' });
    if (right) halves.push({ node: right, label: 'right half' });
    snap(10, `Step 2: detach ${key}'s subtrees and clear their parent pointers (a dangling pointer would let a later splay climb back into the deleted node). Every key on the left is smaller than every key on the right.`, {
      roles: { [node.id]: 'bad' },
      forest: halves,
      vars: [['key', key]],
    });
    if (!left || !right) {
      root = left ?? right;
      snap(11, root ? `One half is empty, so the other half (rooted at ${root.key}) is the whole tree: delete returns True.` : `Both halves are empty: the tree is now empty and delete returns True.`, {
        roles: root ? { [root.id]: 'done' } : {},
        vars: [['key', key]],
      });
      return true;
    }
    root = left;
    let maxLeft = left;
    const path: number[] = [];
    const seen: Record<number, Role> = {};
    forestView = () => [
      { node: root!, label: 'left half' },
      { node: right, label: 'right half' },
    ];
    while (maxLeft.right) {
      snap(12, `Step 3: find the maximum of the left half: ${maxLeft.key} has a right child, keep going right.`, { roles: { ...seen, [maxLeft.id]: 'active' }, path: [...path] });
      seen[maxLeft.id] = 'compare';
      maxLeft = maxLeft.right;
      path.push(maxLeft.id);
    }
    snap(12, `${maxLeft.key} is the largest key of the left half. Splay it inside that half (root = left for now): afterwards it has no right child.`, {
      roles: { ...seen, [maxLeft.id]: 'active' },
      path,
    });
    splay(maxLeft, `Splaying inside the left half stops at its top, since that root has no parent.`);
    forestView = undefined;
    maxLeft.right = right;
    right.parent = maxLeft;
    root = maxLeft;
    snap(12, `Step 4: ${maxLeft.key} has no right child, and every key of the right half is larger, so hang the right half (rooted at ${right.key}) there. delete returns True.`, {
      roles: { [maxLeft.id]: 'done', ...Object.fromEntries(subtreeIds(right).map((id) => [id, 'compare' as Role])) },
      vars: [['key', key]],
    });
    return true;
  };

  const extreme = (kind: 'min' | 'max'): number | null => {
    if (!root) {
      snap(13, `find_${kind}(): the tree is empty, so it returns None.`);
      return null;
    }
    let n = root;
    const seen: Record<number, Role> = {};
    const path: number[] = [];
    for (;;) {
      const next = kind === 'min' ? n.left : n.right;
      if (!next) break;
      snap(13, `${n.key} has a ${kind === 'min' ? 'left' : 'right'} child: keep going ${kind === 'min' ? 'left' : 'right'}.`, { roles: { ...seen, [n.id]: 'active' }, path: [...path] });
      seen[n.id] = 'compare';
      n = next;
      path.push(n.id);
    }
    accessDepth = path.length;
    snap(13, `${n.key} is the ${kind === 'min' ? 'smallest' : 'largest'} key. Finding it is an access, so splay it.`, { roles: { ...seen, [n.id]: 'good' }, path });
    splay(n, `find_${kind} splays the key it returns.`);
    snap(13, `find_${kind}() returns ${n.key}, now the root.`, { roles: { [n.id]: 'good' } });
    return n.key;
  };

  snap(undefined, 'SplayTree(): an empty tree. There is no balance data: every access moves the accessed node to the root by rotations (splaying).');
  ops.forEach((op, i) => {
    current = i;
    rotations = [];
    let result: SplayStep['result'] = null;
    let found: boolean | undefined;
    if (op.kind === 'insert') insert(op.key!);
    else if (op.kind === 'search') ({ result, found } = search(op.key!));
    else if (op.kind === 'delete') result = remove(op.key!);
    else result = extreme(op.kind as 'min' | 'max');
    steps.push({ op, result, found, tree: nested(root), rotations: [...rotations] });
  });
  current = ops.length;
  const keys: number[] = [];
  const stack: Node[] = [];
  let c = root as Node | null;
  while (stack.length || c) {
    while (c) {
      stack.push(c);
      c = c.left;
    }
    c = stack.pop()!;
    keys.push(c.key);
    c = c.right;
  }
  snap(undefined, `Done: in-order ${pyList(keys)}, height ${height(root)} (edges), ${access} rotations in total.`);
  return { frames, steps };
}
