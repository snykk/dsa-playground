/**
 * Binary tree tracer: level-order insert, the three depth-first traversals, level order,
 * search, height and size, drawn with TreeView plus the call stack or queue and the output.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Binary_Tree/Python/binary_tree.py: BinaryTree.insert
 * (a deque scanned in level order: the first node with a free left, then right, slot gets the
 * value), search / _search_recursive (node, then left subtree `or` right subtree), the recursive
 * inorder / preorder / postorder traversals, level_order_traversal (a deque), height (in edges:
 * an empty tree is -1, a leaf 0) and size. Duplicates are stored as separate nodes.
 * Golden fixtures (__fixtures__/binaryTrees.json, section binaryTree) pin the tree and every result.
 *
 * Input: "insert 1 2 3 4 5, inorder, preorder, search 5, height"  (bare numbers insert; ?5 searches)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { TreeState } from '../renderers/TreeView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { collectViews, opsStrip, pyList, type BNode } from './binaryTreesCommon';

export type BinaryTreeOp =
  | { kind: 'insert' | 'search'; value: number }
  | { kind: 'inorder' | 'preorder' | 'postorder' | 'level' | 'height' | 'size' };

export const BINARY_TREE_LIMITS = { maxOps: 30, maxNodes: 15 };

const WORDS: Record<string, BinaryTreeOp['kind'] | 'insert-mode' | 'search-mode'> = {
  insert: 'insert-mode',
  ins: 'insert-mode',
  i: 'insert-mode',
  add: 'insert-mode',
  search: 'search-mode',
  find: 'search-mode',
  s: 'search-mode',
  inorder: 'inorder',
  in: 'inorder',
  inorder_traversal: 'inorder',
  preorder: 'preorder',
  pre: 'preorder',
  preorder_traversal: 'preorder',
  postorder: 'postorder',
  post: 'postorder',
  postorder_traversal: 'postorder',
  level: 'level',
  levelorder: 'level',
  level_order: 'level',
  level_order_traversal: 'level',
  bfs: 'level',
  height: 'height',
  size: 'size',
};

const EXAMPLE = 'Write e.g. "insert 1 2 3 4 5, inorder, preorder, postorder, level, search 5, height, size".';

export function parseBinaryTree(text: string): BinaryTreeOp[] {
  const tokens = text
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter(Boolean);
  const ops: BinaryTreeOp[] = [];
  let mode: 'insert' | 'search' = 'insert';
  for (const t of tokens) {
    if (/^[a-z_]+$/.test(t)) {
      const w = WORDS[t];
      if (!w) throw new InputError(`"${t}" is not an operation. ${EXAMPLE}`);
      if (w === 'insert-mode') mode = 'insert';
      else if (w === 'search-mode') mode = 'search';
      else ops.push({ kind: w } as BinaryTreeOp);
      continue;
    }
    const m = t.match(/^([+?]?)(\d{1,4})$/);
    if (!m) throw new InputError(`"${t}" is not a value or an operation. Values are whole numbers 0..999. ${EXAMPLE}`);
    const value = Number(m[2]);
    if (value > 999) throw new InputError(`Values go from 0 to 999 (got ${m[2]}).`);
    ops.push({ kind: m[1] === '?' ? 'search' : m[1] === '+' ? 'insert' : mode, value });
  }
  if (ops.length === 0) throw new InputError(`Add at least one operation. ${EXAMPLE}`);
  if (ops.length > BINARY_TREE_LIMITS.maxOps) throw new InputError(`At most ${BINARY_TREE_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  const inserts = ops.filter((o) => o.kind === 'insert').length;
  if (inserts > BINARY_TREE_LIMITS.maxNodes) throw new InputError(`At most ${BINARY_TREE_LIMITS.maxNodes} inserts (there is no delete), so the tree fits on screen (got ${inserts}).`);
  return ops;
}

export function formatBinaryTreeOp(op: BinaryTreeOp): string {
  switch (op.kind) {
    case 'insert':
      return `insert(${op.value})`;
    case 'search':
      return `search(${op.value})`;
    case 'level':
      return 'level_order()';
    case 'height':
    case 'size':
      return `${op.kind}()`;
    default:
      return `${op.kind}()`;
  }
}

export const BINARY_TREE_CODE = [
  'insert(data): if root is None: root = TreeNode(data); return',
  '  queue = deque([root]); while queue:',
  '    node = queue.popleft()',
  '    if node.left is None: node.left = TreeNode(data); return',
  '    elif node.right is None: node.right = TreeNode(data); return',
  '    else: queue.append(node.left); queue.append(node.right)',
  'search(data) -> _search(root): if node is None: return False',
  '  if node.data == data: return True',
  '  return _search(node.left) or _search(node.right)',
  'inorder(node): if node: inorder(node.left)',
  '  result.append(node.data); inorder(node.right)',
  'preorder(node): if node: result.append(node.data)',
  '  preorder(node.left); preorder(node.right)',
  'postorder(node): if node: postorder(node.left); postorder(node.right)',
  '  result.append(node.data)',
  'level_order(): queue = deque([root]); while queue:',
  '  node = queue.popleft(); result.append(node.data)',
  '  if node.left: queue.append(node.left); if node.right: queue.append(node.right)',
  'height(node): if node is None: return -1        # edges: a leaf is 0',
  '  return 1 + max(height(node.left), height(node.right))',
  'size(node): if node is None: return 0',
  '  return 1 + size(node.left) + size(node.right)',
];

interface Node extends BNode {
  data: number;
  left: Node | null;
  right: Node | null;
}

export type BinaryTreeResult = number[] | number | boolean | null;

export interface BinaryTreeStep {
  op: BinaryTreeOp;
  result: BinaryTreeResult;
  /** The tree as nested [data, left, right] (null for an empty child). */
  tree: Nested;
}

export type Nested = null | [number, Nested, Nested];

export interface BinaryTreeRun {
  frames: Array<Frame<TreeState>>;
  steps: BinaryTreeStep[];
}

function nested(n: Node | null): Nested {
  return n ? [n.data, nested(n.left), nested(n.right)] : null;
}

interface SnapOpts {
  roles?: Record<number, Role>;
  /** Edges (by child id) on the current call path. */
  path?: number[];
  badges?: Map<number, string>;
  badgeLabel?: string;
  side?: StripData;
  output?: number[];
  vars?: Array<[string, string | number]>;
}

export function binaryTreeTrace(ops: BinaryTreeOp[]): BinaryTreeRun {
  let root: Node | null = null;
  let nextId = 1;
  let current = -1;
  const frames: Array<Frame<TreeState>> = [];
  const steps: BinaryTreeStep[] = [];
  const labels = ops.map(formatBinaryTreeOp);
  const size = (n: Node | null): number => (n ? 1 + size(n.left) + size(n.right) : 0);
  const height = (n: Node | null): number => (n ? 1 + Math.max(height(n.left), height(n.right)) : -1);

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const onPath = new Set(o.path ?? []);
    const strips: StripData[] = [opsStrip(labels, current)];
    if (o.side) strips.push(o.side);
    if (o.output) strips.push({ label: 'Result', items: o.output.length ? o.output.map((v) => ({ text: String(v), role: 'done' as Role })) : [{ text: '[ ]' }] });
    frames.push({
      line,
      caption,
      state: {
        nodes: collectViews([root], (n: Node) => ({
          key: n.data,
          role: o.roles?.[n.id] ?? 'idle',
          badge: o.badges?.get(n.id),
          edgeRole: onPath.has(n.id) ? 'compare' : undefined,
        })),
        root: root?.id ?? null,
        badgeLabel: o.badgeLabel,
        strips,
      },
      vars: [...(o.vars ?? []), ['size()', size(root)], ['height()', height(root)]],
    });
  };

  const stackStrip = (name: string, calls: Node[]): StripData => ({
    label: 'Call stack (bottom first)',
    items: calls.length ? calls.map((n, i): StripItem => ({ text: `${name}(${n.data})`, role: i === calls.length - 1 ? 'active' : 'compare' })) : [{ text: 'empty' }],
  });
  const queueStrip = (q: Node[]): StripData => ({
    label: 'Queue (front first)',
    items: q.length ? q.map((n, i): StripItem => ({ text: String(n.data), role: i === 0 ? 'compare' : undefined })) : [{ text: 'empty' }],
  });

  snap(undefined, 'BinaryTree(): an empty tree. Inserts fill the tree level by level, left to right, so it stays complete; values are not ordered.');

  const insert = (value: number) => {
    const fresh: Node = { id: nextId++, data: value, left: null, right: null };
    if (!root) {
      root = fresh;
      snap(0, `The tree is empty, so ${value} becomes the root.`, { roles: { [fresh.id]: 'done' }, vars: [['data', value]] });
      return;
    }
    const queue: Node[] = [root];
    snap(1, `insert(${value}): look for the first free child slot in level order. The queue starts with the root ${root.data}.`, {
      roles: { [root.id]: 'compare' },
      side: queueStrip(queue),
      vars: [['data', value]],
    });
    const seen: Record<number, Role> = {};
    while (queue.length) {
      const node = queue.shift()!;
      if (!node.left || !node.right) {
        const side = node.left ? 'right' : 'left';
        if (!node.left) node.left = fresh;
        else node.right = fresh;
        snap(node.left === fresh ? 3 : 4, `Pop ${node.data}: its ${side} slot is free, so ${value} becomes its ${side} child. That is the next free spot in level order, so the tree stays complete.`, {
          roles: { ...seen, [node.id]: 'active', [fresh.id]: 'done' },
          side: queueStrip(queue),
          vars: [['data', value], ['node', node.data]],
        });
        return;
      }
      queue.push(node.left, node.right);
      seen[node.id] = 'compare';
      snap(5, `Pop ${node.data}: both children are taken. Queue them (left ${node.left.data}, then right ${node.right.data}) so the next level is scanned left to right.`, {
        roles: { ...seen, [node.id]: 'active' },
        side: queueStrip(queue),
        vars: [['data', value], ['node', node.data]],
      });
    }
  };

  const search = (value: number): boolean => {
    if (!root) {
      snap(6, `search(${value}): the root is None, so _search returns False at once.`, { vars: [['data', value]] });
      return false;
    }
    const visited: Record<number, Role> = {};
    const calls: Node[] = [];
    const rec = (n: Node): boolean => {
      calls.push(n);
      const path = calls.slice(1).map((c) => c.id);
      if (n.data === value) {
        snap(7, `${n.data} == ${value}: this call returns True. Every open call is in the middle of "left or right", and \`or\` stops at the first True, so nothing to the right is searched.`, {
          roles: { ...visited, [n.id]: 'good' },
          path,
          side: stackStrip('_search', calls),
          vars: [['data', value], ['node', n.data]],
        });
        calls.pop();
        return true;
      }
      const kids = n.left && n.right ? 'search the left subtree, then the right one' : n.left ? 'search its left subtree' : 'it has no children, so both recursive calls get None and return False';
      snap(n.left ? 8 : 6, `${n.data} != ${value}: with no ordering to follow, ${kids}.`, {
        roles: { ...visited, [n.id]: 'active' },
        path,
        side: stackStrip('_search', calls),
        vars: [['data', value], ['node', n.data]],
      });
      visited[n.id] = 'compare';
      const hit = (n.left !== null && rec(n.left)) || (n.right !== null && rec(n.right));
      calls.pop();
      return hit;
    };
    const found = rec(root);
    if (!found) {
      snap(6, `Every node was compared and none holds ${value}: search returns False. An unordered tree cannot skip a subtree, so a miss always costs n comparisons.`, {
        roles: visited,
        vars: [['data', value]],
      });
    }
    return found;
  };

  const depthFirst = (order: 'inorder' | 'preorder' | 'postorder'): number[] => {
    const out: number[] = [];
    const emitted: Record<number, Role> = {};
    const calls: Node[] = [];
    const rule = order === 'inorder' ? 'left, node, right' : order === 'preorder' ? 'node, left, right' : 'left, right, node';
    if (!root) {
      snap(order === 'inorder' ? 9 : order === 'preorder' ? 11 : 13, `${order}: the root is None, so the result stays empty: [].`, { output: out });
      return out;
    }
    snap(order === 'inorder' ? 9 : order === 'preorder' ? 11 : 13, `${order}_traversal(): visit every node recursively in the order ${rule}.`, { output: out, side: stackStrip(order, []) });
    const shot = (line: number, caption: string, n: Node) =>
      snap(line, caption, {
        roles: { ...rolesOf(calls, n), ...emitted, [n.id]: 'active' },
        path: calls.slice(1).map((c) => c.id),
        side: stackStrip(order, calls),
        output: out,
      });
    const rolesOf = (open: Node[], cur: Node) => {
      const r: Record<number, Role> = {};
      for (const c of open) if (c !== cur && !emitted[c.id]) r[c.id] = 'compare';
      return r;
    };
    const emit = (n: Node) => {
      out.push(n.data);
      emitted[n.id] = 'done';
    };
    const rec = (n: Node) => {
      calls.push(n);
      if (order === 'preorder') {
        emit(n);
        shot(11, `Pre-order emits ${n.data} as soon as it is reached, before its subtrees.${n.left || n.right ? ` Then ${n.left ? `its left child ${n.left.data}` : `its right child ${n.right!.data}`}.` : ' It is a leaf, so the call returns.'}`, n);
        if (n.left) rec(n.left);
        if (n.right) rec(n.right);
      } else if (order === 'inorder') {
        if (n.left) {
          shot(9, `Enter ${n.data}: in-order must finish the left subtree (rooted at ${n.left.data}) before ${n.data} itself.`, n);
          rec(n.left);
          emit(n);
          shot(10, `The left subtree of ${n.data} is done, so emit ${n.data}.${n.right ? ` Then its right subtree, rooted at ${n.right.data}.` : ' It has no right child, so the call returns.'}`, n);
        } else {
          emit(n);
          shot(10, `${n.data} has no left child, so it is emitted right away.${n.right ? ` Then its right subtree, rooted at ${n.right.data}.` : ' It has no right child either: the call returns.'}`, n);
        }
        if (n.right) rec(n.right);
      } else {
        if (n.left || n.right) {
          shot(13, `Enter ${n.data}: post-order emits a node only after both of its subtrees, so go to ${n.left ? `the left child ${n.left.data}` : `the right child ${n.right!.data}`} first.`, n);
          if (n.left) rec(n.left);
          if (n.right) rec(n.right);
          emit(n);
          shot(14, `Both subtrees of ${n.data} are done, so emit ${n.data} now.`, n);
        } else {
          emit(n);
          shot(14, `${n.data} is a leaf: both recursive calls get None, so emit ${n.data}.`, n);
        }
      }
      calls.pop();
    };
    rec(root);
    snap(order === 'inorder' ? 10 : order === 'preorder' ? 12 : 14, `${order}_traversal() returns ${pyList(out)}.${order === 'inorder' ? ' It is not sorted: only a binary search tree gives sorted in-order output.' : ''}`, {
      roles: emitted,
      output: out,
    });
    return out;
  };

  const levelOrder = (): number[] => {
    const out: number[] = [];
    if (!root) {
      snap(15, 'level_order_traversal(): the root is None, so it returns [].', { output: out });
      return out;
    }
    const queue: Node[] = [root];
    const emitted: Record<number, Role> = {};
    snap(15, `Level order visits the tree breadth first: a queue starts with the root ${root.data}.`, { roles: { [root.id]: 'compare' }, side: queueStrip(queue), output: out });
    while (queue.length) {
      const node = queue.shift()!;
      out.push(node.data);
      emitted[node.id] = 'done';
      const kids = [node.left, node.right].filter((c): c is Node => c !== null);
      queue.push(...kids);
      const queued: Record<number, Role> = {};
      for (const q of queue) queued[q.id] = 'compare';
      snap(kids.length ? 17 : 16, `Pop ${node.data} from the front and emit it.${kids.length ? ` Append its ${kids.length === 2 ? `children ${kids[0].data} and ${kids[1].data}` : `child ${kids[0].data}`} to the back, so the next level follows this one.` : ' It has no children to queue.'}`, {
        roles: { ...emitted, ...queued, [node.id]: 'active' },
        side: queueStrip(queue),
        output: out,
      });
    }
    snap(16, `The queue is empty: level_order_traversal() returns ${pyList(out)}, top to bottom and left to right.`, { roles: emitted, output: out });
    return out;
  };

  const measure = (what: 'height' | 'size'): number => {
    const line = what === 'height' ? 18 : 20;
    if (!root) {
      snap(line, `${what}(): the root is None, so it returns ${what === 'height' ? -1 : 0}${what === 'height' ? ' (height counts edges, so an empty tree is -1)' : ''}.`);
      return what === 'height' ? -1 : 0;
    }
    const badges = new Map<number, string>();
    const done: Record<number, Role> = {};
    const label = what === 'height' ? 'height of each subtree, in edges' : 'size of each subtree';
    const rec = (n: Node): number => {
      const a = n.left ? rec(n.left) : what === 'height' ? -1 : 0;
      const b = n.right ? rec(n.right) : what === 'height' ? -1 : 0;
      const v = what === 'height' ? 1 + Math.max(a, b) : 1 + a + b;
      badges.set(n.id, String(v));
      const leaf = !n.left && !n.right;
      const parts = what === 'height' ? `1 + max(${a}, ${b}) = ${v}` : `1 + ${a} + ${b} = ${v}`;
      snap(line + 1, `${what}(${n.data}) = ${parts}${leaf ? (what === 'height' ? ': a leaf, because each missing child counts -1' : ': a leaf, each missing child counts 0') : ', from the values its children returned'}.`, {
        roles: { ...done, [n.id]: 'active' },
        badges: new Map(badges),
        badgeLabel: label,
        vars: [[what, v]],
      });
      done[n.id] = 'done';
      return v;
    };
    const v = rec(root);
    snap(line + 1, `${what}() returns ${v}${what === 'height' ? ': the number of edges on the longest root-to-leaf path. Level-order inserts keep it at floor(log2 n)' : ': one per node'}.`, {
      roles: done,
      badges,
      badgeLabel: label,
    });
    return v;
  };

  ops.forEach((op, i) => {
    current = i;
    let result: BinaryTreeResult = null;
    switch (op.kind) {
      case 'insert':
        insert(op.value);
        break;
      case 'search':
        result = search(op.value);
        break;
      case 'inorder':
      case 'preorder':
      case 'postorder':
        result = depthFirst(op.kind);
        break;
      case 'level':
        result = levelOrder();
        break;
      default:
        result = measure(op.kind);
    }
    steps.push({ op, result, tree: nested(root) });
  });
  current = ops.length;
  snap(undefined, `Done: ${size(root)} node${size(root) === 1 ? '' : 's'}, height ${height(root)} (in edges). In-order: ${pyList(levelFree(root))}.`);
  return { frames, steps };
}

function levelFree(n: Node | null): number[] {
  return n ? [...levelFree(n.left), n.data, ...levelFree(n.right)] : [];
}
