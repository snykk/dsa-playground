/**
 * Treap tracer (split / merge formulation): insert splits the treap at the key and merges the
 * left part, the new node and the right part; delete splits at the key and drops the minimum of
 * the right part (which is the key) before merging back. contains is a plain BST walk.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Treap/Python/treap.py: _split / _merge / _drop_min and
 * Treap.insert / delete / __contains__. Python draws each new node's priority with random.random()
 * (only after the duplicate check, so a rejected insert draws nothing). Here the draws come from
 * mulberry32(seed) (the seeded generator of skipList.ts), and "insert 6@0.7" fixes a priority
 * without drawing. Merge keeps the higher priority on top; on a tie (not strictly greater) the
 * right treap's root wins. Golden fixtures (__fixtures__/binaryTrees.json, section treap) run the
 * Python class with the same draws and pin shape, priorities, results and the number of draws.
 *
 * Input: "seed 7; insert 5 2 8 6, delete 5, search 8"  (also "insert 6@0.7", "?6", "-5")
 */
import type { Frame, Role } from '../core/types';
import type { TreeState } from '../renderers/TreeView';
import { collectViews, formatKeyOp, opsStrip, parseKeyScript, pyList, type BNode, type KeyOp, type KeyScript } from './binaryTreesCommon';
import { mulberry32 } from './skipList';

export const TREAP_LIMITS = { maxOps: 24, maxKeys: 12 };

export function parseTreap(text: string): KeyScript {
  return parseKeyScript(text, {
    kinds: ['insert', 'search', 'delete'],
    maxOps: TREAP_LIMITS.maxOps,
    maxKeys: TREAP_LIMITS.maxKeys,
    priorities: true,
    example: 'Write e.g. "seed 7; insert 5 2 8 6, delete 5, search 8"; "insert 6@0.7" fixes a priority; keys 0..999.',
  });
}

export const TREAP_CODE = [
  'insert(key): if key in self: return False',
  '  new_node = _Node(key)          # priority = random.random()',
  '  left, right = _split(root, key)',
  '  root = _merge(_merge(left, new_node), right); size += 1; return True',
  'delete(key): if key not in self: return False',
  '  left, rest = _split(root, key)   # rest: keys >= key; key is its minimum',
  '  root = _merge(left, _drop_min(rest)); size -= 1; return True',
  '_split(node, key): if node is None: return None, None',
  '  if node.key < key: l, r = _split(node.right, key); node.right = l; return node, r',
  '  else: l, r = _split(node.left, key); node.left = r; return l, node',
  '_merge(a, b): if a is None: return b; if b is None: return a',
  '  if a.priority > b.priority: a.right = _merge(a.right, b); return a',
  '  else: b.left = _merge(a, b.left); return b',
  '_drop_min(node): if node.left is None: return node.right',
  '  node.left = _drop_min(node.left); return node',
  '__contains__(key): walk down: equal -> True; key < node.key ? left : right',
];

interface Node extends BNode {
  key: number;
  priority: number;
  left: Node | null;
  right: Node | null;
}

export type TreapNested = null | [number, number, TreapNested, TreapNested];

export interface TreapStep {
  op: KeyOp;
  result: boolean;
  tree: TreapNested;
  /** random() calls made by this operation. */
  draws: number;
}

export interface TreapRun {
  frames: Array<Frame<TreeState>>;
  steps: TreapStep[];
}

function nested(n: Node | null): TreapNested {
  return n ? [n.key, n.priority, nested(n.left), nested(n.right)] : null;
}

/** A priority for captions and the node's second line: 3 decimals, more when two would look equal. */
export function fmtPriority(p: number, digits = 3): string {
  return p.toFixed(digits);
}

function comparePriorities(a: number, b: number): [string, string] {
  let d = 3;
  while (d < 12 && a !== b && a.toFixed(d) === b.toFixed(d)) d++;
  return [a.toFixed(d), b.toFixed(d)];
}

interface Piece {
  node: Node | null;
  label?: string;
}

interface SnapOpts {
  roles?: Record<number, Role>;
  tags?: Record<number, string>;
  path?: number[];
  vars?: Array<[string, string | number]>;
}

export function treapTrace({ ops, seed = 1 }: KeyScript): TreapRun {
  const rand = mulberry32(seed);
  let root: Node | null = null;
  let size = 0;
  let nextId = 1;
  let current = -1;
  let draws = 0;
  const frames: Array<Frame<TreeState>> = [];
  const steps: TreapStep[] = [];
  const labels = ops.map(formatKeyOp);
  /** What is drawn: the treap, or the pieces of a split / merge. */
  let pieces: Piece[] | null = null;
  const height = (n: Node | null): number => (n ? 1 + Math.max(height(n.left), height(n.right)) : -1);

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const onPath = new Set(o.path ?? []);
    const shown = (pieces ?? [{ node: root }]).filter((p): p is { node: Node; label?: string } => p.node !== null);
    frames.push({
      line,
      caption,
      state: {
        nodes: collectViews(
          shown.map((p) => p.node),
          (n: Node) => ({
            key: n.key,
            sub: fmtPriority(n.priority),
            role: o.roles?.[n.id] ?? 'idle',
            tag: o.tags?.[n.id],
            edgeRole: onPath.has(n.id) ? 'compare' : undefined,
          }),
        ),
        root: pieces ? (shown[0]?.node.id ?? null) : (root?.id ?? null),
        forest: pieces ? shown.map((p) => ({ root: p.node.id, label: p.label })) : undefined,
        strips: [opsStrip(labels, current)],
      },
      vars: [...(o.vars ?? []), ['len()', size], ['height (edges)', height(root)], ['seed', seed], ['random() calls', draws]],
    });
  };

  /** __contains__(key), drawn as a walk. */
  const contains = (key: number, line: number, intro: string): Node | null => {
    let n = root;
    const seen: Record<number, Role> = {};
    const path: number[] = [];
    while (n) {
      if (n.key === key) {
        snap(line, `${intro}${key} == ${n.key}: the key is in the treap.`, { roles: { ...seen, [n.id]: 'good' }, path, vars: [['key', key]] });
        return n;
      }
      const left = key < n.key;
      snap(line, `${intro}${key} ${left ? '<' : '>'} ${n.key}: go ${left ? 'left' : 'right'} (priorities play no part in a search).`, {
        roles: { ...seen, [n.id]: 'active' },
        path: [...path],
        vars: [['key', key]],
      });
      intro = '';
      seen[n.id] = 'compare';
      n = left ? n.left : n.right;
      if (n) path.push(n.id);
    }
    snap(line, `${intro}Fell off the tree: ${key} is not in the treap.`, { roles: seen, vars: [['key', key]] });
    return null;
  };

  /** _split(node, key), with one frame per node on the split path, then the two parts. */
  const split = (top: Node | null, key: number, before: Piece[], after: Piece[], labelL: string, labelR: string): [Node | null, Node | null] => {
    const tags: Record<number, string> = {};
    const decided: Record<number, Role> = {};
    const rec = (node: Node | null): [Node | null, Node | null] => {
      if (!node) return [null, null];
      const goesLeft = node.key < key;
      tags[node.id] = goesLeft ? 'L' : 'R';
      snap(
        goesLeft ? 8 : 9,
        goesLeft
          ? `_split at ${key}: ${node.key} < ${key}, so ${node.key} and its whole left subtree go to the left part. Its right subtree may hold both kinds of key: split it too.`
          : `_split at ${key}: ${node.key} >= ${key}, so ${node.key} and its whole right subtree go to the right part. Split its left subtree.`,
        { roles: { ...decided, [node.id]: 'active' }, tags: { ...tags }, vars: [['split at', key]] },
      );
      decided[node.id] = 'compare';
      if (goesLeft) {
        const [l, r] = rec(node.right);
        node.right = l;
        return [node, r];
      }
      const [l, r] = rec(node.left);
      node.left = r;
      return [l, node];
    };
    pieces = before;
    const [l, r] = rec(top);
    pieces = after.map((p) => (p.label === labelL ? { node: l, label: labelL } : p.label === labelR ? { node: r, label: labelR } : p));
    return [l, r];
  };

  /** _merge(a, b), with one frame per decision, then the merged result. */
  const merge = (a: Node | null, b: Node | null): Node | null => {
    if (!a || !b) {
      const only = a ?? b;
      snap(10, `_merge: one side is empty, so the merge just returns the other side${only ? ` (rooted at ${only.key})` : ''}.`, { roles: only ? { [only.id]: 'active' } : {} });
      return only;
    }
    const [pa, pb] = comparePriorities(a.priority, b.priority);
    if (a.priority > b.priority) {
      snap(11, `_merge: compare the roots. ${a.key} (priority ${pa}) > ${b.key} (priority ${pb}), so ${a.key} stays on top; ${b.key}'s keys are all larger, so merge them into ${a.key}'s right subtree.`, {
        roles: { [a.id]: 'active', [b.id]: 'compare' },
      });
      a.right = merge(a.right, b);
      return a;
    }
    snap(
      12,
      `_merge: compare the roots. ${a.key} (priority ${pa}) is not greater than ${b.key} (priority ${pb}), so ${b.key} stays on top; ${a.key}'s keys are all smaller, so merge them into ${b.key}'s left subtree.` +
        (a.priority === b.priority ? ' (A tie: the right side wins, because the test is strictly greater.)' : ''),
      { roles: { [b.id]: 'active', [a.id]: 'compare' } },
    );
    b.left = merge(a, b.left);
    return b;
  };

  const insert = (key: number, fixed?: number): boolean => {
    if (contains(key, 0, `insert(${key}): first, \`key in self\`. `)) {
      snap(0, `${key} is already in the treap: insert returns False, and no priority is drawn.`, { vars: [['key', key]] });
      return false;
    }
    let priority: number;
    if (fixed !== undefined) priority = fixed;
    else {
      priority = rand();
      draws++;
    }
    const node: Node = { id: nextId++, key, priority, left: null, right: null };
    pieces = [{ node: root }, { node, label: 'new' }];
    snap(
      1,
      fixed !== undefined
        ? `_Node(${key}) with the priority ${fmtPriority(priority)} fixed by the script (instead of random.random()).`
        : `_Node(${key}) draws its priority: random.random() = ${fmtPriority(priority)} (draw ${draws} from seed ${seed}).`,
      { roles: { [node.id]: 'active' }, vars: [['key', key], ['priority', fmtPriority(priority)]] },
    );
    const wasEmpty = root === null;
    const [l, r] = split(root, key, [{ node: root }, { node, label: 'new' }], [{ node: null, label: `keys < ${key}` }, { node, label: 'new' }, { node: null, label: `keys > ${key}` }], `keys < ${key}`, `keys > ${key}`);
    if (wasEmpty) snap(2, `The treap is empty, so _split(None, ${key}) returns (None, None) and the merges just return the new node.`, { roles: { [node.id]: 'active' }, vars: [['key', key]] });
    else snap(2, `The split is done: ${l ? `the left part (rooted at ${l.key})` : 'the left part is empty'}, the new node, and ${r ? `the right part (rooted at ${r.key})` : 'an empty right part'}. Each part is still a valid treap, and their keys are in order.`, {
      roles: { [node.id]: 'active' },
      vars: [['key', key]],
    });
    const lm = merge(l, node);
    pieces = [{ node: lm, label: 'merged' }, { node: r, label: `keys > ${key}` }];
    snap(3, `_merge(left, new_node) is done: ${key} sits where its priority puts it in the left part. Now merge with the right part.`, { roles: { [node.id]: 'done' }, vars: [['key', key]] });
    root = merge(lm, r);
    pieces = null;
    size++;
    snap(3, `Inserted ${key}: keys are in BST order and every parent's priority is at least its children's. insert returns True.`, { roles: { [node.id]: 'done' }, vars: [['key', key]] });
    return true;
  };

  const remove = (key: number): boolean => {
    const target = contains(key, 4, `delete(${key}): first, \`key not in self\`. `);
    if (!target) {
      snap(4, `${key} is not in the treap: delete returns False.`, { vars: [['key', key]] });
      return false;
    }
    const [l, rest] = split(root, key, [{ node: root }], [{ node: null, label: `keys < ${key}` }, { node: null, label: `keys >= ${key}` }], `keys < ${key}`, `keys >= ${key}`);
    snap(5, `The split is done. rest holds the keys >= ${key}, and ${key} is present, so it is the smallest key of rest. (Splitting at ${key} + 1 instead would overflow at the largest integer and mean nothing for float keys.)`, {
      roles: { [target.id]: 'bad' },
      vars: [['key', key]],
    });
    // _drop_min(rest): walk the left spine, then splice the minimum out.
    const seen: Record<number, Role> = {};
    const path: number[] = [];
    let n = rest!;
    while (n.left) {
      snap(14, `_drop_min: ${n.key} has a left child, so the minimum is further left.`, { roles: { ...seen, [n.id]: 'active', [target.id]: 'bad' }, path: [...path] });
      seen[n.id] = 'compare';
      n = n.left;
      path.push(n.id);
    }
    snap(13, `_drop_min: ${n.key} has no left child, so it is the minimum: return its right subtree${n.right ? ` (rooted at ${n.right.key})` : ' (empty)'} in its place.`, {
      roles: { ...seen, [n.id]: 'bad' },
      path,
    });
    const dropMin = (x: Node): Node | null => {
      if (!x.left) return x.right;
      x.left = dropMin(x.left);
      return x;
    };
    const rest2 = dropMin(rest!);
    target.left = null;
    target.right = null;
    pieces = [{ node: l, label: `keys < ${key}` }, { node: target, label: 'removed' }, { node: rest2, label: `keys > ${key}` }];
    snap(13, `${key} is out. Merge the two remaining parts.`, { roles: { [target.id]: 'bad' } });
    pieces = [{ node: l, label: `keys < ${key}` }, { node: rest2, label: `keys > ${key}` }];
    root = merge(l, rest2);
    pieces = null;
    size--;
    snap(6, `Deleted ${key}. Both orders hold again: BST on keys, max-heap on priorities. delete returns True.`, { roles: root ? { [root.id]: 'done' } : {}, vars: [['key', key]] });
    return true;
  };

  snap(undefined, `Treap(), with random() drawing from seed ${seed}: an empty treap. Each node gets a random priority; the tree is a BST on keys and a max-heap on priorities (the number under each node).`);
  ops.forEach((op, i) => {
    current = i;
    const before = draws;
    let result: boolean;
    if (op.kind === 'insert') result = insert(op.key!, op.priority);
    else if (op.kind === 'delete') result = remove(op.key!);
    else {
      result = contains(op.key!, 15, `${op.key} in treap: `) !== null;
      snap(15, `\`${op.key} in treap\` is ${result ? 'True' : 'False'}.`, { vars: [['key', op.key!]] });
    }
    steps.push({ op, result, tree: nested(root), draws: draws - before });
  });
  current = ops.length;
  const keys: number[] = [];
  const walk = (n: Node | null) => {
    if (!n) return;
    walk(n.left);
    keys.push(n.key);
    walk(n.right);
  };
  walk(root);
  snap(undefined, `Done: ${size} key${size === 1 ? '' : 's'}, in-order ${pyList(keys)}, height ${height(root)} (edges). The shape depends only on the priorities: rerun with another seed to get another tree.`);
  return { frames, steps };
}
