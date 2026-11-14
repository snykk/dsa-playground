/**
 * Interval tree tracer: a BST on the low ends (equal lows go right) whose nodes also store max,
 * the largest high in their subtree. Insert raises max along its path; the overlap, point and
 * containment searches prune a left subtree when left.max < q.low and a right subtree when
 * node.low > q.high; delete removes one equal interval (two children: copy the in-order
 * successor's interval up and delete it from the right subtree) and recomputes max on the way back.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Interval_Tree/Python/interval_tree.py: Interval
 * (closed; low > high raises ValueError), IntervalTree.insert / _insert_recursive,
 * search_overlapping / _search_overlapping_recursive, search_containing_point,
 * search_contained_in / _search_contained_recursive, delete / _delete_recursive / _recompute_max.
 * Golden fixtures (__fixtures__/binaryTrees.json, section interval) pin the tree with every max,
 * every result list in order and every ValueError.
 *
 * Input: "insert 15 20, 10 30, 17 19; overlap 22 26, point 18, inside 10 30, delete 10 30"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { TreeState } from '../renderers/TreeView';
import type { StripData } from '../ui/molecules/Strip';
import { collectViews, opsStrip, subtreeIds, type BNode } from './binaryTreesCommon';

export type IntervalOp =
  | { kind: 'insert' | 'delete' | 'overlap' | 'contained'; low: number; high: number }
  | { kind: 'point'; point: number };

export const INTERVAL_LIMITS = { maxOps: 24, maxIntervals: 10, maxValue: 99 };

const VERBS: Record<string, IntervalOp['kind']> = {
  insert: 'insert',
  ins: 'insert',
  i: 'insert',
  add: 'insert',
  delete: 'delete',
  del: 'delete',
  d: 'delete',
  remove: 'delete',
  rm: 'delete',
  overlap: 'overlap',
  overlaps: 'overlap',
  search: 'overlap',
  query: 'overlap',
  q: 'overlap',
  search_overlapping: 'overlap',
  point: 'point',
  at: 'point',
  stab: 'point',
  search_containing_point: 'point',
  inside: 'contained',
  contained: 'contained',
  within: 'contained',
  search_contained_in: 'contained',
};

const EXAMPLE = 'Write e.g. "insert 15 20, 10 30, 5 20; overlap 12 16, point 18, inside 4 25, delete 10 30".';

/** Segments are split on ";", new lines and commas outside brackets; a segment without a verb repeats the last verb. */
export function parseInterval(text: string): IntervalOp[] {
  const segments = text
    .split(/[;\n]|,(?![^[(]*[\])])/)
    .map((s) => s.trim())
    .filter(Boolean);
  const ops: IntervalOp[] = [];
  let verb: IntervalOp['kind'] = 'insert';
  for (const seg of segments) {
    const m = seg.match(/^([A-Za-z_]+)\s*(.*)$/);
    let rest = seg;
    if (m) {
      const v = VERBS[m[1].toLowerCase()];
      if (!v) throw new InputError(`"${m[1]}" is not an operation. ${EXAMPLE}`);
      verb = v;
      rest = m[2];
    }
    const nums = rest.replace(/[[\]()]/g, ' ').split(/[\s,]+/).filter(Boolean);
    for (const t of nums) if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number. ${EXAMPLE}`);
    const vals = nums.map(Number);
    for (const v of vals) if (v < 0 || v > INTERVAL_LIMITS.maxValue) throw new InputError(`Interval ends go from 0 to ${INTERVAL_LIMITS.maxValue} (got ${v}).`);
    if (verb === 'point') {
      if (vals.length === 0) throw new InputError(`"${seg}": point takes a number, as in "point 18".`);
      for (const p of vals) ops.push({ kind: 'point', point: p });
      continue;
    }
    if (vals.length === 0 || vals.length % 2 !== 0) throw new InputError(`"${seg}": ${verb} takes intervals as pairs of numbers, as in "${verb} 15 20".`);
    for (let i = 0; i < vals.length; i += 2) ops.push({ kind: verb, low: vals[i], high: vals[i + 1] });
  }
  if (ops.length === 0) throw new InputError(`Add at least one operation. ${EXAMPLE}`);
  if (ops.length > INTERVAL_LIMITS.maxOps) throw new InputError(`At most ${INTERVAL_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  // Replay the multiset of intervals so the tree stays a readable size.
  const live: string[] = [];
  for (const op of ops) {
    if (op.kind === 'insert' && op.low <= op.high) {
      live.push(`${op.low},${op.high}`);
      if (live.length > INTERVAL_LIMITS.maxIntervals) throw new InputError(`At most ${INTERVAL_LIMITS.maxIntervals} intervals in the tree at once, so every node fits on screen.`);
    } else if (op.kind === 'delete') {
      const at = live.indexOf(`${op.low},${op.high}`);
      if (at >= 0) live.splice(at, 1);
    }
  }
  return ops;
}

export function formatIntervalOp(op: IntervalOp): string {
  switch (op.kind) {
    case 'insert':
      return `insert((${op.low}, ${op.high}))`;
    case 'delete':
      return `delete((${op.low}, ${op.high}))`;
    case 'overlap':
      return `search_overlapping((${op.low}, ${op.high}))`;
    case 'contained':
      return `search_contained_in((${op.low}, ${op.high}))`;
    default:
      return `search_containing_point(${op.point})`;
  }
}

export const INTERVAL_CODE = [
  'Interval(low, high): if low > high: raise ValueError("low must be <= high")',
  '_insert(node, iv): if node is None: return IntervalNode(iv)    # max = iv.high',
  '  if iv.low < node.interval.low: node.left = _insert(node.left, iv)',
  '  else: node.right = _insert(node.right, iv)                   # equal lows go right',
  '  if iv.high > node.max: node.max = iv.high',
  '_search_overlapping(node, q): if node is None: return',
  '  if node.interval.overlaps(q): result.append(node.interval)   # not (high < q.low or q.high < low)',
  '  if node.left and node.left.max >= q.low: _search_overlapping(node.left, q)',
  '  if node.right and node.interval.low <= q.high: _search_overlapping(node.right, q)',
  'search_containing_point(p): return search_overlapping(Interval(p, p))',
  '_search_contained(node, q): same walk; report if q.low <= node.low and node.high <= q.high',
  '_delete(node, iv): if node is None: return None',
  '  if iv.low < node.low: node.left = _delete(node.left, iv); elif iv.low > node.low: node.right = _delete(node.right, iv)',
  '  elif node.high != iv.high: node.right = _delete(node.right, iv)     # same low, other high',
  '  else: no left: return node.right; no right: return node.left',
  '    successor = _find_min(node.right); node.interval = successor.interval',
  '    node.right = _delete(node.right, successor.interval)',
  '  _recompute_max(node); return node       # max = largest of own high, left.max, right.max',
];

interface Node extends BNode {
  low: number;
  high: number;
  max: number;
  left: Node | null;
  right: Node | null;
}

/** [low, high, max, left, right]. */
export type IvNested = null | [number, number, number, IvNested, IvNested];

export interface IntervalStep {
  op: IntervalOp;
  /** Queries: the intervals found, in the order Python appends them; insert / delete: null. */
  result: Array<[number, number]> | null;
  error: string | null;
  tree: IvNested;
}

export interface IntervalRun {
  frames: Array<Frame<TreeState>>;
  steps: IntervalStep[];
}

function nested(n: Node | null): IvNested {
  return n ? [n.low, n.high, n.max, nested(n.left), nested(n.right)] : null;
}

const iv = (lo: number, hi: number) => `[${lo}, ${hi}]`;
const nv = (n: { low: number; high: number }) => iv(n.low, n.high);

interface SnapOpts {
  roles?: Record<number, Role>;
  tags?: Record<number, string>;
  path?: number[];
  muted?: Set<number>;
  result?: Array<[number, number]>;
  /** A rejected interval drawn beside the tree. */
  rejected?: { low: number; high: number };
  vars?: Array<[string, string | number]>;
}

export function intervalTrace(ops: IntervalOp[]): IntervalRun {
  let root: Node | null = null;
  let nextId = 1;
  let current = -1;
  const frames: Array<Frame<TreeState>> = [];
  const steps: IntervalStep[] = [];
  const labels = ops.map(formatIntervalOp);
  const count = (n: Node | null): number => (n ? 1 + count(n.left) + count(n.right) : 0);
  const height = (n: Node | null): number => (n ? 1 + Math.max(height(n.left), height(n.right)) : -1);
  const REJECTED_ID = 9999;

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const onPath = new Set(o.path ?? []);
    const ghost: Node | null = o.rejected ? { id: REJECTED_ID, low: o.rejected.low, high: o.rejected.high, max: o.rejected.high, left: null, right: null } : null;
    const strips: StripData[] = [opsStrip(labels, current)];
    if (o.result) strips.push({ label: 'Result', items: o.result.length ? o.result.map(([a, b]) => ({ text: iv(a, b), role: 'done' as Role })) : [{ text: '[ ]' }] });
    frames.push({
      line,
      caption,
      state: {
        nodes: collectViews([root, ghost], (n: Node) => ({
          key: n.low,
          label: `${n.low},${n.high}`,
          sub: n === ghost ? 'rejected' : `max ${n.max}`,
          role: o.roles?.[n.id] ?? (o.muted?.has(n.id) ? 'muted' : 'idle'),
          tag: o.tags?.[n.id],
          edgeRole: onPath.has(n.id) ? 'compare' : o.muted?.has(n.id) ? 'muted' : undefined,
        })),
        root: root?.id ?? null,
        forest: ghost ? [...(root ? [{ root: root.id }] : []), { root: ghost.id, label: 'ValueError' }] : undefined,
        strips,
      },
      vars: [...(o.vars ?? []), ['size()', count(root)], ['height (edges)', height(root)]],
    });
  };

  const checkInterval = (lo: number, hi: number, name: string): boolean => {
    if (lo <= hi) return true;
    snap(0, `${name}: Interval(${lo}, ${hi}) raises ValueError("low must be <= high"), because ${lo} > ${hi}. Nothing changes, and the script goes on with the next operation.`, {
      rejected: { low: lo, high: hi },
      roles: { [REJECTED_ID]: 'bad' },
    });
    return false;
  };

  const insert = (lo: number, hi: number) => {
    const fresh: Node = { id: nextId++, low: lo, high: hi, max: hi, left: null, right: null };
    if (!root) {
      root = fresh;
      snap(1, `The tree is empty: ${iv(lo, hi)} becomes the root, with max = its own high, ${hi}.`, { roles: { [fresh.id]: 'done' } });
      return;
    }
    const path: Node[] = [];
    const seen: Record<number, Role> = {};
    let n = root;
    for (;;) {
      path.push(n);
      const left = lo < n.low;
      const next = left ? n.left : n.right;
      snap(left ? 2 : 3, `Order by low: ${lo} ${left ? '<' : n.low === lo ? '==' : '>'} ${n.low}, so go ${left ? 'left' : 'right'}${n.low === lo ? ' (equal lows go right)' : ''}${next ? '' : `, where the slot is empty: attach ${iv(lo, hi)} there`}.`, {
        roles: { ...seen, [n.id]: 'active' },
        path: path.slice(1).map((p) => p.id),
      });
      seen[n.id] = 'compare';
      if (!next) {
        if (left) n.left = fresh;
        else n.right = fresh;
        break;
      }
      n = next;
    }
    snap(1, `${iv(lo, hi)} is a new leaf: its max is its own high, ${hi}. Now walk back up and raise max where ${hi} is larger.`, {
      roles: { ...seen, [fresh.id]: 'done' },
      path: [...path.slice(1).map((p) => p.id), fresh.id],
    });
    const raised: string[] = [];
    for (let i = path.length - 1; i >= 0; i--) {
      const p = path[i];
      if (hi > p.max) {
        const old = p.max;
        p.max = hi;
        raised.push(nv(p));
        snap(4, `Back at ${nv(p)}: ${hi} > its max ${old}, so its max becomes ${hi}: the new interval reaches further right than anything else below it.`, {
          roles: { [p.id]: 'active', [fresh.id]: 'done' },
        });
      }
    }
    if (raised.length === 0) {
      snap(4, `On the way back up every max on the path is already >= ${hi}, so nothing changes. Insert touched only one root-to-leaf path: O(h).`, { roles: { [fresh.id]: 'done' } });
    }
  };

  const search = (kind: 'overlap' | 'contained' | 'point', lo: number, hi: number): Array<[number, number]> => {
    const result: Array<[number, number]> = [];
    const q = iv(lo, hi);
    const what = kind === 'contained' ? 'lies inside' : kind === 'point' ? `contains ${lo}` : 'overlaps';
    const line = kind === 'contained' ? 10 : 6;
    if (!root) {
      snap(kind === 'point' ? 9 : 5, `The tree is empty, so the result is [].`, { result });
      return result;
    }
    if (kind === 'point') snap(9, `search_containing_point(${lo}) runs search_overlapping(Interval(${lo}, ${lo})): an interval contains ${lo} exactly when it overlaps [${lo}, ${lo}].`, { result });
    const visited: Record<number, Role> = {};
    const muted = new Set<number>();
    const rec = (n: Node, path: number[]) => {
      const hit = kind === 'contained' ? lo <= n.low && n.high <= hi : !(n.high < lo || hi < n.low);
      if (hit) result.push([n.low, n.high]);
      let test: string;
      if (kind === 'contained') test = hit ? `${lo} <= ${n.low} and ${n.high} <= ${hi}: it lies inside ${q}, add it` : `it does not lie inside ${q}`;
      else if (hit) test = kind === 'point' ? `${n.low} <= ${lo} <= ${n.high}: it contains ${lo}, add it` : `it overlaps ${q}, add it`;
      else test = n.high < lo ? `${n.high} < ${lo}: it ends before the query starts` : `${hi} < ${n.low}: it starts after the query ends`;
      const goLeft = n.left !== null && n.left.max >= lo;
      const goRight = n.right !== null && n.low <= hi;
      const leftText = !n.left ? 'no left child' : goLeft ? `left.max ${n.left.max} >= ${lo}, so the left subtree may hold a match: search it` : `left.max ${n.left.max} < ${lo}: everything on the left ends before ${lo}, skip it`;
      const rightText = !n.right
        ? 'no right child'
        : goRight
          ? `low ${n.low} <= ${hi}, so the right subtree may hold a match${goLeft ? ' (after the left)' : ''}`
          : `low ${n.low} > ${hi}: every interval on the right starts after ${hi}, skip it`;
      if (n.left && !goLeft) subtreeIds(n.left).forEach((id) => muted.add(id));
      if (n.right && !goRight) subtreeIds(n.right).forEach((id) => muted.add(id));
      snap(hit ? line : goLeft || goRight ? (goLeft ? 7 : 8) : line, `${nv(n)}: ${test}. Left: ${leftText}. Right: ${rightText}.`, {
        roles: { ...visited, [n.id]: hit ? 'good' : 'active' },
        path,
        muted: new Set(muted),
        result: [...result],
        vars: [['query', kind === 'point' ? String(lo) : q]],
      });
      visited[n.id] = hit ? 'good' : 'compare';
      if (goLeft) rec(n.left!, [...path, n.left!.id]);
      if (goRight) rec(n.right!, [...path, n.right!.id]);
    };
    rec(root, []);
    const pruned = muted.size;
    snap(kind === 'contained' ? 10 : 5, `Done: ${result.length} interval${result.length === 1 ? '' : 's'} ${what === 'overlaps' ? `overlap ${q}` : kind === 'point' ? `contain ${lo}` : `lie inside ${q}`}. ${Object.keys(visited).length} node${Object.keys(visited).length === 1 ? ' was' : 's were'} visited and ${pruned} skipped by the max and low tests.`, {
      roles: visited,
      muted,
      result: [...result],
    });
    return result;
  };

  const remove = (lo: number, hi: number) => {
    let ghostId: number | null = null;
    const rec = (n: Node | null, tLo: number, tHi: number, path: number[], replacing: boolean): Node | null => {
      if (!n) {
        snap(11, `Reached an empty spot: ${iv(tLo, tHi)} is not in the tree, so nothing is deleted (delete returns None; it does not raise).`, { path });
        return null;
      }
      if (tLo !== n.low || tHi !== n.high) {
        // Walk on: by low, or to the right when only the high differs.
        const left = tLo < n.low;
        const sameLow = tLo === n.low;
        snap(sameLow ? 13 : 12, sameLow ? `${nv(n)} has the same low ${tLo} but high ${n.high} != ${tHi}: equal lows sit to the right, so keep looking right.` : `${tLo} ${left ? '<' : '>'} ${n.low}: go ${left ? 'left' : 'right'}.`, {
          roles: { [n.id]: 'active', ...(ghostId !== null ? { [ghostId]: 'bad' as Role } : {}) },
          path,
        });
        if (left) n.left = rec(n.left, tLo, tHi, n.left ? [...path, n.left.id] : path, replacing);
        else n.right = rec(n.right, tLo, tHi, n.right ? [...path, n.right.id] : path, replacing);
      } else if (!n.left || !n.right) {
        const child = n.left ?? n.right;
        snap(14, `Found ${nv(n)}${replacing ? ' (the old copy of the successor)' : ''}. It has ${child ? `one child, ${nv(child)}, which takes its place` : 'no children: just remove it'}.`, { roles: { [n.id]: 'bad', ...(child ? { [child.id]: 'active' as Role } : {}) }, path });
        return child;
      } else {
        snap(15, `Found ${nv(n)}. It has two children, so it takes the interval of its in-order successor: the smallest low in its right subtree.`, { roles: { [n.id]: 'bad' }, path });
        let s = n.right;
        const seen: Record<number, Role> = { [n.id]: 'bad' };
        while (s.left) {
          snap(15, `_find_min: ${nv(s)} has a left child, keep going left.`, { roles: { ...seen, [s.id]: 'active' } });
          seen[s.id] = 'compare';
          s = s.left;
        }
        // node.interval = successor.interval. Swap the drawing ids so the successor's interval glides up.
        const oldId = n.id;
        n.id = s.id;
        s.id = oldId;
        ghostId = s.id;
        const deleted = nv(n);
        n.low = s.low;
        n.high = s.high;
        snap(15, `Copy the successor's interval ${nv(s)} into this node (${deleted} is gone). The old node of ${nv(s)} is still in the right subtree: delete it there.`, {
          roles: { [n.id]: 'active', [s.id]: 'bad' },
          tags: { [s.id]: 'old copy' },
        });
        n.right = rec(n.right, s.low, s.high, [...path, n.right!.id], true);
        ghostId = null;
      }
      const old = n.max;
      n.max = Math.max(n.high, n.left?.max ?? -Infinity, n.right?.max ?? -Infinity);
      if (n.max !== old) {
        snap(17, `Back at ${nv(n)}: recompute max from its own high and its children: ${old} becomes ${n.max}.`, { roles: { [n.id]: 'active' } });
      }
      return n;
    };
    const before = count(root);
    root = rec(root, lo, hi, [], false);
    const after = count(root);
    snap(17, after < before ? `Deleted one ${iv(lo, hi)}. Every max on the path was recomputed on the way back up; the rest of the tree is untouched, so delete is O(h).` : `The tree is unchanged: no interval equal to ${iv(lo, hi)} was stored.`);
  };

  snap(undefined, 'IntervalTree(): an empty tree. Intervals are ordered by low, and every node also stores max, the largest high in its subtree (shown under the node).');
  ops.forEach((op, i) => {
    current = i;
    let result: Array<[number, number]> | null = null;
    let error: string | null = null;
    const lo = op.kind === 'point' ? op.point : op.low;
    const hi = op.kind === 'point' ? op.point : op.high;
    if (!checkInterval(lo, hi, formatIntervalOp(op))) {
      error = 'ValueError';
    } else if (op.kind === 'insert') insert(lo, hi);
    else if (op.kind === 'delete') remove(lo, hi);
    else result = search(op.kind, lo, hi);
    steps.push({ op, result, error, tree: nested(root) });
  });
  current = ops.length;
  const all: string[] = [];
  const walk = (n: Node | null) => {
    if (!n) return;
    walk(n.left);
    all.push(nv(n));
    walk(n.right);
  };
  walk(root);
  snap(undefined, `Done: ${count(root)} interval${count(root) === 1 ? '' : 's'}, in order of low: ${all.join(', ') || '(none)'}.`);
  return { frames, steps };
}
