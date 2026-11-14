/**
 * Lazy segment tree tracer (recursive, range add and range sum), drawn with SegmentTreeView:
 * one row per depth, each node a block over its segment, its tag a pill inside the block.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Segment_Tree_Lazy_Propagation/Python/segment_tree_lazy.py:
 * LazySegmentTree.__init__ / _build / _push_down / update_range / _update_range / query / _query.
 * Node 1 covers [0, n - 1], node [s, e] splits at mid = (s + e) // 2 into 2 * node and
 * 2 * node + 1, and tree and lazy are lists of 4n. Both operations take the same three cases:
 * no overlap returns (0), a fully covered node is changed or read whole (an update adds
 * val * length to its sum and val to its tag), and a partial overlap pushes the tag down,
 * recurses into both halves and (an update) rebuilds the sum. There is no index validation: a
 * range is clipped by the recursion, and an empty tree does nothing.
 * Golden fixtures (__fixtures__/rangeQueries.json) pin the tree and lazy arrays after every
 * operation, every result, the recursion's calls in order and every push-down.
 *
 * Input: "[1, 3, 5, 7, 9, 11]; add 1 4 3, query 3 3"   (update_range, update, q are other names)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { SegBlock, SegFlyer, SegmentTreeState } from '../renderers/SegmentTreeView';
import type { StripItem } from '../ui/molecules/Strip';
import { floorDiv, opStrip, parseArrayScript, signed } from './segmentTree';

export type LazyOp = { kind: 'add'; left: number; right: number; value: number } | { kind: 'query'; left: number; right: number };

export interface LazyInput {
  arr: number[];
  ops: LazyOp[];
}

export const LAZY_LIMITS = { maxLen: 16, maxOps: 12, lo: -99, hi: 99, delta: 20 };

const LAZY_NAMES: Record<string, LazyOp['kind']> = {
  add: 'add',
  update: 'add',
  update_range: 'add',
  updaterange: 'add',
  u: 'add',
  query: 'query',
  q: 'query',
  sum: 'query',
};

export function parseLazy(text: string): LazyInput {
  const { values, calls } = parseArrayScript(text, { ...LAZY_LIMITS, argLo: -20, argHi: 20, example: '"[1, 3, 5, 7, 9, 11]; add 1 4 3, query 3 3"' });
  if (calls.length > LAZY_LIMITS.maxOps) throw new InputError(`At most ${LAZY_LIMITS.maxOps} operations, please (got ${calls.length}).`);
  const ops = calls.map((c): LazyOp => {
    const kind = LAZY_NAMES[c.name];
    if (!kind) throw new InputError(`Unknown operation "${c.name}" in "${c.text}". Use add l r value (update_range) or query l r.`);
    if (kind === 'add') {
      if (c.args.length !== 3) throw new InputError(`"${c.text}": add takes a range and a value, as in "add 1 4 3".`);
      return { kind, left: c.args[0], right: c.args[1], value: c.args[2] };
    }
    if (c.args.length !== 2) throw new InputError(`"${c.text}": query takes two indices, as in "query 3 3".`);
    return { kind, left: c.args[0], right: c.args[1] };
  });
  return { arr: values, ops };
}

export function formatLazyOp(op: LazyOp): string {
  return op.kind === 'add' ? `update_range(${op.left}, ${op.right}, ${op.value})` : `query(${op.left}, ${op.right})`;
}

export const LAZY_CODE = [
  'LazySegmentTree(arr): tree = [0] * 4n; lazy = [0] * 4n; if n > 0: _build(arr, 1, 0, n - 1)',
  '_build(node, start, end): if start == end: tree[node] = arr[start]',
  '  else: build [start, mid] and [mid + 1, end]; tree[node] = tree[2node] + tree[2node + 1]',
  'update_range(left, right, val): if n == 0: return; _update_range(1, 0, n - 1, ...)',
  '_update_range(node, start, end, left, right, val):',
  '  if right < start or end < left: return                    # no overlap',
  '  if left <= start and end <= right:                        # full cover: stop here',
  '    tree[node] += val * (end - start + 1); lazy[node] += val; return',
  '  _push_down(node, start, end)                              # partial: look inside',
  '  _update_range(2node, start, mid, ...); _update_range(2node + 1, mid + 1, end, ...)',
  '  tree[node] = tree[2node] + tree[2node + 1]',
  'query(left, right): if n == 0: return 0; return _query(1, 0, n - 1, left, right)',
  '_query(node, start, end, left, right):',
  '  if right < start or end < left: return 0',
  '  if left <= start and end <= right: return tree[node]',
  '  _push_down(node, start, end)',
  '  return _query(2node, start, mid, ...) + _query(2node + 1, mid + 1, end, ...)',
  '_push_down(node, start, end): if lazy[node] != 0:',
  '  each child: tree[child] += lazy[node] * (child length); lazy[child] += lazy[node]',
  '  lazy[node] = 0',
];

const L = {
  init: 0,
  leaf: 1,
  inner: 2,
  update: 3,
  noOverlapU: 5,
  fullU: 7,
  partialU: 8,
  rebuild: 10,
  query: 11,
  noOverlapQ: 13,
  fullQ: 14,
  partialQ: 15,
  combine: 16,
  push: 18,
  pushed: 19,
};

export interface LazyStep {
  op: LazyOp;
  result: number | null;
  tree: number[];
  lazy: number[];
  /** Every (node, start, end) call of _update_range / _query, in order. */
  visits: Array<[number, number, number]>;
  /** Nodes whose non-zero tag was pushed down, in order. */
  pushes: number[];
}

export interface LazyRun {
  frames: Array<Frame<SegmentTreeState>>;
  build: number[];
  steps: LazyStep[];
}

interface NodeInfo {
  node: number;
  start: number;
  end: number;
  depth: number;
}

const seg = (s: number, e: number) => (s === e ? `[${s}]` : `[${s}-${e}]`);

export function lazyTrace(input: LazyInput): LazyRun {
  const { arr, ops } = input;
  const n = arr.length;
  const tree: number[] = new Array(4 * n).fill(0);
  const lazy: number[] = new Array(4 * n).fill(0);
  const model = [...arr];
  const nodes: NodeInfo[] = [];
  const collect = (node: number, start: number, end: number, depth: number) => {
    nodes.push({ node, start, end, depth });
    if (start === end) return;
    const mid = floorDiv(start + end, 2);
    collect(2 * node, start, mid, depth + 1);
    collect(2 * node + 1, mid + 1, end, depth + 1);
  };
  if (n > 0) collect(1, 0, n - 1, 0);
  const rows = Math.max(1, ...nodes.map((x) => x.depth + 1));
  const frames: Array<Frame<SegmentTreeState>> = [];
  const steps: LazyStep[] = [];
  const names = ops.map(formatLazyOp);
  let current = -1;

  /** Roles that last for the whole operation, the calls on the stack and the parts of a running sum. */
  let roles: Record<number, Role> = {};
  const stack: NodeInfo[] = [];
  let sumParts: StripItem[] | undefined;
  let band: SegmentTreeState['band'];

  const snap = (line: number | undefined, caption: string, o: { roles?: Record<number, Role>; flyers?: SegFlyer[]; hideTags?: number[]; vars?: Array<[string, string | number]> } = {}) => {
    const blocks: SegBlock[] = nodes.map((x) => ({
      id: `n${x.node}`,
      lo: x.start,
      hi: x.end,
      row: x.depth,
      value: tree[x.node],
      badge: String(x.node),
      tag: lazy[x.node] !== 0 && !o.hideTags?.includes(x.node) ? signed(lazy[x.node]) : undefined,
      role: o.roles?.[x.node] ?? roles[x.node] ?? 'idle',
      title: `node ${x.node} = ${seg(x.start, x.end)}: tree ${tree[x.node]}, lazy ${lazy[x.node]}`,
    }));
    const strips = [opStrip(names, current)];
    if (stack.length) strips.push({ label: 'Calls', items: stack.map((c, i) => ({ text: seg(c.start, c.end), role: i === stack.length - 1 ? 'active' : undefined })) });
    if (sumParts) strips.push({ label: 'Sum', items: sumParts.length ? sumParts : [{ text: 'nothing returned yet' }] });
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n], ['tags', lazy.filter((t) => t !== 0).length]],
      state: {
        label: `Lazy segment tree over ${n} elements: ${blocks.map((b) => `${seg(b.lo, b.hi)} sum ${b.value}${b.tag ? ` tag ${b.tag}` : ''}`).join(', ')}`,
        columns: Math.max(n, 1),
        rows,
        blocks,
        tags: true,
        colTitle: 'index',
        colLabels: Array.from({ length: n }, (_, i) => ({ text: String(i) })),
        valueRows: [{ label: 'a[i] now', cells: model.map((v) => ({ value: v })) }],
        band,
        flyers: o.flyers,
        strips,
      },
    });
  };

  // ---- build
  snap(L.init, `LazySegmentTree(arr): tree and lazy are lists of 4n = ${4 * n} zeros.` + (n === 0 ? ' The array is empty, so nothing is built.' : ` _build(arr, 1, 0, ${n - 1}) fills the sums recursively; every tag starts at 0.`));
  const build = (node: number, start: number, end: number) => {
    if (start === end) {
      tree[node] = arr[start];
      snap(L.leaf, `_build reaches the leaf ${seg(start, end)} (node ${node}): tree[${node}] = arr[${start}] = ${arr[start]}.`, { roles: { [node]: 'active' } });
      return;
    }
    const mid = floorDiv(start + end, 2);
    build(2 * node, start, mid);
    build(2 * node + 1, mid + 1, end);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
    snap(L.inner, `Both halves of ${seg(start, end)} are built (mid = (${start} + ${end}) // 2 = ${mid}), so node ${node} = ${tree[2 * node]} + ${tree[2 * node + 1]} = ${tree[node]}.`, {
      roles: { [node]: 'active', [2 * node]: 'compare', [2 * node + 1]: 'compare' },
    });
  };
  if (n > 0) build(1, 0, n - 1);
  const built = [...tree];

  const at = (node: number) => nodes.find((x) => x.node === node)!;
  let visits: Array<[number, number, number]> = [];
  let pushes: number[] = [];

  /** _push_down: two frames, the tag splitting at the parent, then each copy landing on a child. */
  const pushDown = (node: number, start: number, end: number, vars: Array<[string, string | number]>) => {
    if (lazy[node] === 0) return;
    pushes.push(node);
    const t = lazy[node];
    const mid = floorDiv(start + end, 2);
    const left = mid - start + 1;
    const right = end - mid;
    const a = at(2 * node);
    const b = at(2 * node + 1);
    const row = at(node).depth;
    snap(
      L.push,
      `_push_down(${seg(start, end)}): the node holds ${signed(t)}, and the call is about to look at its children, so they must catch up first. ` +
        `The tag is copied to both: ${seg(a.start, a.end)} has ${left} element${left > 1 ? 's' : ''}, ${seg(b.start, b.end)} has ${right}.`,
      {
        roles: { [node]: 'active', [2 * node]: 'compare', [2 * node + 1]: 'compare' },
        flyers: [
          { id: `p${2 * node}`, text: signed(t), row, lo: a.start, hi: a.end },
          { id: `p${2 * node + 1}`, text: signed(t), row, lo: b.start, hi: b.end },
        ],
        hideTags: [node],
        vars: [...vars, ['lazy[node]', t]],
      },
    );
    const before = [tree[2 * node], tree[2 * node + 1], lazy[2 * node], lazy[2 * node + 1]];
    tree[2 * node] += t * left;
    lazy[2 * node] += t;
    tree[2 * node + 1] += t * right;
    lazy[2 * node + 1] += t;
    lazy[node] = 0;
    snap(
      L.pushed,
      `Each child gets sum += ${t} * its length and tag += ${t}: ${seg(a.start, a.end)} ${before[0]} -> ${tree[2 * node]} (tag ${signed(before[2])} -> ${signed(lazy[2 * node])}), ` +
        `${seg(b.start, b.end)} ${before[1]} -> ${tree[2 * node + 1]} (tag ${signed(before[3])} -> ${signed(lazy[2 * node + 1])}). lazy[${node}] = 0: the parent owes nothing now.`,
      {
        roles: { [node]: 'compare', [2 * node]: 'active', [2 * node + 1]: 'active' },
        flyers: [
          { id: `p${2 * node}`, text: signed(t), row: a.depth, lo: a.start, hi: a.end },
          { id: `p${2 * node + 1}`, text: signed(t), row: b.depth, lo: b.start, hi: b.end },
        ],
        hideTags: [2 * node, 2 * node + 1],
        vars,
      },
    );
  };

  const updateRange = (node: number, start: number, end: number, l: number, r: number, val: number) => {
    visits.push([node, start, end]);
    const info = at(node);
    stack.push(info);
    const vars: Array<[string, string | number]> = [['op', names[current]], ['node', `${node} ${seg(start, end)}`]];
    if (r < start || end < l) {
      roles[node] = 'muted';
      snap(L.noOverlapU, `${seg(start, end)} does not overlap [${l}, ${r}] (${r < start ? `${r} < ${start}` : `${end} < ${l}`}): return. Nothing under it changes.`, { roles: { [node]: 'muted' }, vars });
      stack.pop();
      return;
    }
    if (l <= start && end <= r) {
      const old = tree[node];
      tree[node] += val * (end - start + 1);
      lazy[node] += val;
      roles[node] = 'done';
      snap(
        L.fullU,
        `${seg(start, end)} lies inside [${l}, ${r}]: its sum grows by ${val} * ${end - start + 1} = ${val * (end - start + 1)} (${old} -> ${tree[node]}) and its tag becomes ${signed(lazy[node])}. ` +
          (start === end ? 'It is a leaf, so the tag is never used again. Return.' : `Return without visiting its children: the tag says each element under it still owes ${signed(lazy[node])}.`),
        { roles: { [node]: 'active' }, vars },
      );
      stack.pop();
      return;
    }
    roles[node] = 'compare';
    snap(
      L.partialU,
      `${seg(start, end)} overlaps [${l}, ${r}] only partly, so the update must look inside: ` +
        (lazy[node] !== 0 ? `first push its tag ${signed(lazy[node])} down, then recurse into both halves.` : 'it holds no tag, so _push_down does nothing; recurse into both halves.'),
      { roles: { [node]: 'active' }, vars },
    );
    pushDown(node, start, end, vars);
    const mid = floorDiv(start + end, 2);
    updateRange(2 * node, start, mid, l, r, val);
    updateRange(2 * node + 1, mid + 1, end, l, r, val);
    const old = tree[node];
    tree[node] = tree[2 * node] + tree[2 * node + 1];
    snap(L.rebuild, `Back in ${seg(start, end)}: rebuild its sum from the children, ${tree[2 * node]} + ${tree[2 * node + 1]} = ${tree[node]} (was ${old}).`, {
      roles: { [node]: 'active', [2 * node]: 'compare', [2 * node + 1]: 'compare' },
      vars,
    });
    stack.pop();
  };

  const query = (node: number, start: number, end: number, l: number, r: number): number => {
    visits.push([node, start, end]);
    const info = at(node);
    stack.push(info);
    const vars: Array<[string, string | number]> = [['op', names[current]], ['node', `${node} ${seg(start, end)}`]];
    if (r < start || end < l) {
      roles[node] = 'muted';
      snap(L.noOverlapQ, `${seg(start, end)} does not overlap [${l}, ${r}]: return 0.`, { roles: { [node]: 'muted' }, vars });
      stack.pop();
      return 0;
    }
    if (l <= start && end <= r) {
      roles[node] = 'done';
      sumParts = [...(sumParts ?? []), { text: `${seg(start, end)} = ${tree[node]}`, role: 'done' }];
      snap(
        L.fullQ,
        `${seg(start, end)} lies inside [${l}, ${r}]: return its sum ${tree[node]} whole.` +
          (lazy[node] !== 0 ? ` Its own tag ${signed(lazy[node])} is already counted in that sum, so nothing is pushed.` : ''),
        { roles: { [node]: 'active' }, vars },
      );
      stack.pop();
      return tree[node];
    }
    roles[node] = 'compare';
    snap(
      L.partialQ,
      `${seg(start, end)} overlaps [${l}, ${r}] only partly: ` + (lazy[node] !== 0 ? `push its tag ${signed(lazy[node])} down first, then ask both halves.` : 'it holds no tag to push, so ask both halves.'),
      { roles: { [node]: 'active' }, vars },
    );
    pushDown(node, start, end, vars);
    const mid = floorDiv(start + end, 2);
    const a = query(2 * node, start, mid, l, r);
    const b = query(2 * node + 1, mid + 1, end, l, r);
    snap(L.combine, `Back in ${seg(start, end)}: left_sum + right_sum = ${a} + ${b} = ${a + b}.`, { roles: { [node]: 'active', [2 * node]: 'compare', [2 * node + 1]: 'compare' }, vars });
    stack.pop();
    return a + b;
  };

  ops.forEach((op, k) => {
    current = k;
    roles = {};
    visits = [];
    pushes = [];
    sumParts = undefined;
    const name = names[k];
    const clipped = op.left > op.right || op.right < 0 || op.left > n - 1;
    band = { lo: op.left, hi: op.right, label: op.kind === 'add' ? `add ${signed(op.value)} to [${op.left}, ${op.right}]` : `query [${op.left}, ${op.right}]`, role: op.kind === 'add' ? 'active' : 'compare' };
    let result: number | null = null;
    if (op.kind === 'add') {
      if (n === 0) {
        snap(L.update, `${name}: the array is empty, so there is no node 1 and nothing to update. (Without the n == 0 check, a range with left <= -1 <= right would treat the empty root [0, -1] as fully covered and index tree[1] of an empty list.)`, { vars: [['op', name]] });
      } else {
        snap(
          L.update,
          `${name}: start at the root ${seg(0, n - 1)}.` +
            (clipped ? ' The range misses every element, so every call returns at once.' : op.left < 0 || op.right > n - 1 ? ' The range sticks out of the array; there is no index check, so the recursion simply clips it.' : ''),
          { vars: [['op', name]] },
        );
        updateRange(1, 0, n - 1, op.left, op.right, op.value);
        for (let i = Math.max(0, op.left); i <= Math.min(n - 1, op.right); i++) model[i] += op.value;
        const tagged = Object.values(roles).filter((x) => x === 'done').length;
        snap(
          undefined,
          `${name} is done: ${tagged} node${tagged === 1 ? '' : 's'} took the update whole (tagged), ${visits.length} call${visits.length === 1 ? '' : 's'} in all, instead of ${Math.max(0, Math.min(n - 1, op.right) - Math.max(0, op.left) + 1)} element updates.`,
          { vars: [['op', name], ['calls', visits.length]] },
        );
      }
    } else {
      result = 0;
      if (n === 0) {
        snap(L.query, `${name}: the array is empty, so query returns 0 without touching the tree.`, { vars: [['op', name]] });
      } else {
        sumParts = [];
        snap(L.query, `${name}: start at the root ${seg(0, n - 1)}.` + (clipped ? ' The range misses every element, so the answer will be 0.' : ''), { vars: [['op', name]] });
        result = query(1, 0, n - 1, op.left, op.right);
        snap(undefined, `${name} returns ${result}${sumParts.length > 1 ? ` = ${sumParts.map((s) => s.text.split(' = ')[1]).join(' + ')}` : ''}, after ${visits.length} call${visits.length === 1 ? '' : 's'}.`, {
          vars: [['op', name], ['result', result], ['calls', visits.length]],
        });
      }
    }
    steps.push({ op, result, tree: [...tree], lazy: [...lazy], visits, pushes });
  });

  current = ops.length;
  roles = {};
  band = undefined;
  sumParts = undefined;
  const pending = nodes.filter((x) => lazy[x.node] !== 0 && x.start !== x.end).length;
  snap(undefined, n === 0 ? 'Done: the tree is empty.' : `Done: the root holds the total ${tree[1]}.` + (pending ? ` ${pending} inner node${pending === 1 ? '' : 's'} still hold${pending === 1 ? 's' : ''} a tag: those children catch up only when an operation passes through.` : ''));
  return { frames, build: built, steps };
}
