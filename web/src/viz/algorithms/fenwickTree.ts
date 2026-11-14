/**
 * Fenwick tree (binary indexed tree) tracer, drawn with SegmentTreeView: cell i (1-based) is a
 * block over the lowbit(i) array positions that end at i, one row per block length, and the
 * column labels show i in binary with its lowest set bit underlined.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Fenwick_Tree/Python/fenwick_tree.py:
 * FenwickTree.__init__ / _check / _lsb / update / prefix_sum / query / get.
 * The constructor makes tree = [0] * (n + 1) and calls update(i, arr[i]) for every i. update
 * adds a delta and climbs with index += index & -index while index <= n; prefix_sum adds cells
 * and descends with index -= index & -index while index > 0; query is prefix_sum(right), minus
 * prefix_sum(left - 1) unless left == 0; get(i) is query(i, i). Any index outside 0..n-1, or
 * left > right, raises IndexError (an index of -1 used to make update loop forever).
 * Golden fixtures (__fixtures__/rangeQueries.json) pin the tree after the build and after every
 * operation, every result and the cells each operation writes or reads.
 *
 * Input: "[1, 3, 5, 7, 9, 11]; prefix 4, update 2 5, query 1 4, get 2"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { SegBlock, SegmentTreeState } from '../renderers/SegmentTreeView';
import type { StripItem } from '../ui/molecules/Strip';
import { opStrip, parseArrayScript, signed } from './segmentTree';

export type FenOp =
  | { kind: 'update'; index: number; delta: number }
  | { kind: 'prefix'; index: number }
  | { kind: 'query'; left: number; right: number }
  | { kind: 'get'; index: number };

export interface FenInput {
  arr: number[];
  ops: FenOp[];
}

export const FEN_LIMITS = { maxLen: 16, maxOps: 12, lo: -99, hi: 99, delta: 50 };

const FEN_NAMES: Record<string, FenOp['kind']> = {
  update: 'update',
  u: 'update',
  add: 'update',
  prefix: 'prefix',
  prefix_sum: 'prefix',
  prefixsum: 'prefix',
  p: 'prefix',
  query: 'query',
  q: 'query',
  sum: 'query',
  get: 'get',
  g: 'get',
};

export function parseFenwick(text: string): FenInput {
  const { values, calls } = parseArrayScript(text, { ...FEN_LIMITS, argLo: -50, argHi: 50, example: '"[1, 3, 5, 7, 9, 11]; prefix 4, update 2 5, query 1 4"' });
  if (calls.length > FEN_LIMITS.maxOps) throw new InputError(`At most ${FEN_LIMITS.maxOps} operations, please (got ${calls.length}).`);
  const ops = calls.map((c): FenOp => {
    const kind = FEN_NAMES[c.name];
    if (!kind) throw new InputError(`Unknown operation "${c.name}" in "${c.text}". Use update i delta, prefix i, query l r or get i.`);
    const want = kind === 'update' || kind === 'query' ? 2 : 1;
    if (c.args.length !== want) {
      throw new InputError(
        kind === 'update' ? `"${c.text}": update takes an index and a delta, as in "update 2 5".` : kind === 'query' ? `"${c.text}": query takes two indices, as in "query 1 4".` : `"${c.text}": ${kind} takes one index, as in "${kind} 4".`,
      );
    }
    return kind === 'update' ? { kind, index: c.args[0], delta: c.args[1] } : kind === 'query' ? { kind, left: c.args[0], right: c.args[1] } : { kind, index: c.args[0] };
  });
  return { arr: values, ops };
}

export function formatFenOp(op: FenOp): string {
  return op.kind === 'update' ? `update(${op.index}, ${op.delta})` : op.kind === 'prefix' ? `prefix_sum(${op.index})` : op.kind === 'query' ? `query(${op.left}, ${op.right})` : `get(${op.index})`;
}

export const FEN_CODE = [
  'FenwickTree(arr): tree = [0] * (n + 1); for i in range(n): update(i, arr[i])',
  'update(index, delta): _check(index)        # IndexError unless 0 <= index < n',
  '  index += 1                                # 1-based inside',
  '  while index <= n: tree[index] += delta',
  '    index += index & -index                 # climb to the next cell that covers it',
  'prefix_sum(index): _check(index); index += 1; result = 0',
  '  while index > 0: result += tree[index]',
  '    index -= index & -index                 # jump over the block just added',
  '  return result',
  'query(left, right): _check(left); _check(right); left > right: IndexError',
  '  if left == 0: return prefix_sum(right)',
  '  return prefix_sum(right) - prefix_sum(left - 1)',
  'get(index): return query(index, index)',
];

export interface FenStep {
  op: FenOp;
  result?: number | null;
  error?: 'IndexError';
  tree: number[];
  /** update: the cells written; prefix_sum / query / get: the cells read, in order. */
  touched: number[];
}

export interface FenRun {
  frames: Array<Frame<SegmentTreeState>>;
  build: number[];
  steps: FenStep[];
}

/** i & -i: the value of the lowest set bit. */
export const lowbit = (i: number) => i & -i;

const bitLength = (x: number) => (x <= 0 ? 0 : Math.floor(Math.log2(x)) + 1);

/** "4 (100)" */
const bin = (i: number, width: number) => i.toString(2).padStart(width, '0');

export function fenwickTrace(input: FenInput): FenRun {
  const { arr, ops } = input;
  const n = arr.length;
  const tree: number[] = new Array(n + 1).fill(0);
  const model = new Array(n).fill(0);
  const top = Math.max(0, bitLength(n) - 1);
  const width = Math.max(1, bitLength(n));
  const frames: Array<Frame<SegmentTreeState>> = [];
  const steps: FenStep[] = [];
  const names = ops.map(formatFenOp);
  let current = -1;
  let building = true;

  const covers = (i: number) => (lowbit(i) === 1 ? `a[${i - 1}]` : `a[${i - lowbit(i)}..${i - 1}]`);
  const rowOf = (i: number) => top - Math.log2(lowbit(i));

  interface Snap {
    roles?: Record<number, Role>;
    marker?: number;
    band?: SegmentTreeState['band'];
    vars?: Array<[string, string | number]>;
    sum?: StripItem[];
    note?: string;
    cells?: Record<number, Role>;
    /** A bad 0-based index, pointed at under its column (just outside the row when it is off the end). */
    badIndex?: number;
  }
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const blocks: SegBlock[] = [];
    for (let i = 1; i <= n; i++) {
      blocks.push({ id: `c${i}`, lo: i - lowbit(i), hi: i - 1, row: rowOf(i), value: tree[i], badge: String(i), role: o.roles?.[i] ?? 'idle', title: `tree[${i}] = sum of ${covers(i)}` });
    }
    const strips = [building ? { label: 'Operations', items: [{ text: `building: update(i, arr[i]) for ${n} values`, role: 'active' as Role }] } : opStrip(names, current)];
    if (o.sum) strips.push({ label: 'Sum', items: o.sum.length ? o.sum : [{ text: 'nothing added yet' }] });
    const m = o.marker;
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n]],
      state: {
        label: `Fenwick tree over ${n} elements: ${blocks.map((b) => `tree[${b.badge}] = ${b.value}`).join(', ')}`,
        columns: Math.max(n, 1),
        rows: top + 1,
        rowLabels: Array.from({ length: top + 1 }, (_, r) => `covers ${2 ** (top - r)}`),
        blocks,
        colTitle: 'i (1-based)',
        colLabels: Array.from({ length: n }, (_, c) => {
          const b = bin(c + 1, width);
          const k = b.length - 1 - Math.log2(lowbit(c + 1));
          return { text: String(c + 1), bits: [{ text: b.slice(0, k) }, { text: b[k], strong: true }, { text: b.slice(k + 1) }].filter((p) => p.text) };
        }),
        valueRows: [{ label: 'a[i - 1]', cells: model.map((v, c) => ({ value: v, role: o.cells?.[c] })) }],
        band: o.band,
        markers:
          o.badIndex !== undefined
            ? [{ name: `index ${o.badIndex}`, row: top, lo: o.badIndex, hi: o.badIndex, role: 'bad' }]
            : m !== undefined && m >= 1 && m <= n
              ? [{ name: 'i', row: rowOf(m), lo: m - lowbit(m), hi: m - 1, role: 'active' }]
              : [],
        note: o.note,
        strips,
      },
    });
  };

  const fmt = (i: number) => `${i} (${bin(i, width)})`;

  /** update(index, delta) after its check: climb and add. */
  const climb = (index: number, delta: number, vars: Array<[string, string | number]>, quiet: boolean): number[] => {
    const touched: number[] = [];
    const roles: Record<number, Role> = {};
    let i = index + 1;
    if (!quiet) {
      snap(2, `index ${index} is valid. index += 1 -> ${i}: inside, cells are numbered from 1, because lowbit(0) = 0 would never move.`, {
        marker: i,
        roles: { [i]: 'active' },
        band: { lo: index, hi: index, label: `a[${index}] ${signed(delta)}`, role: 'active' },
        vars: [...vars, ['index', fmt(i)]],
      });
    }
    while (i <= n) {
      const before = tree[i];
      tree[i] += delta;
      touched.push(i);
      const next = i + lowbit(i);
      snap(
        3,
        `tree[${i}] += ${delta}: ${before} -> ${tree[i]}, because ${lowbit(i) === 1 ? `cell ${i} is a[${index}] itself` : `cell ${i} covers ${covers(i)}, which contains a[${index}]`}. ` +
          `${i} = ${bin(i, width)} has lowest set bit ${lowbit(i)}, so index += ${lowbit(i)} -> ${next}${next > n ? ` (> n = ${n})` : ''}.`,
        {
          marker: i,
          roles: { ...roles, [i]: 'active' },
          band: { lo: index, hi: index, label: `a[${index}] ${signed(delta)}`, role: 'active' },
          vars: [...vars, ['index', fmt(i)], ['lowbit', lowbit(i)]],
        },
      );
      roles[i] = 'done';
      i = next;
    }
    if (!quiet) {
      snap(4, `index = ${i} > n = ${n}: no further cell covers a[${index}], stop. ${touched.length} cell${touched.length === 1 ? '' : 's'} changed: ${touched.join(', ')}.`, {
        roles,
        band: { lo: index, hi: index, label: `a[${index}] ${signed(delta)}`, role: 'active' },
        vars: [...vars, ['index', i]],
      });
    }
    return touched;
  };

  /** prefix_sum(index) after its check: descend and add. `sign` -1 marks the subtracted half of a query. */
  const descend = (index: number, vars: Array<[string, string | number]>, sign: 1 | -1, sum: StripItem[], keep: Record<number, Role>): { result: number; reads: number[] } => {
    let i = index + 1;
    let result = 0;
    const reads: number[] = [];
    const role: Role = sign > 0 ? 'done' : 'compare';
    const roles: Record<number, Role> = { ...keep };
    const band = { lo: 0, hi: index, label: `prefix_sum(${index}) = a[0..${index}]`, role: sign > 0 ? ('done' as Role) : ('compare' as Role) };
    snap(5, `prefix_sum(${index}): index += 1 -> ${i}, result = 0. Each cell to add covers a block that ends where the previous one started.`, {
      marker: i,
      roles,
      band,
      vars: [...vars, ['index', fmt(i)], ['result', 0]],
      sum: [...sum],
    });
    while (i > 0) {
      result += tree[i];
      reads.push(i);
      const next = i - lowbit(i);
      sum.push({ text: `${sign > 0 ? '' : '-'}tree[${i}] = ${tree[i]}`, role });
      snap(
        6,
        `result += tree[${i}] = ${tree[i]} -> ${result}: cell ${i} covers ${covers(i)}. ${i} = ${bin(i, width)} minus its lowest set bit ${lowbit(i)} -> ${next}` +
          (next > 0 ? `, the cell that ends just before that block.` : ': nothing is left.'),
        { marker: i, roles: { ...roles, [i]: 'active' }, band, vars: [...vars, ['index', fmt(i)], ['lowbit', lowbit(i)], ['result', result]], sum: [...sum] },
      );
      roles[i] = role;
      i = next;
    }
    snap(8, `index = 0: stop. prefix_sum(${index}) = ${result}, from ${reads.length} cell${reads.length === 1 ? '' : 's'} for ${index + 1} element${index === 0 ? '' : 's'}.`, {
      roles,
      band,
      vars: [...vars, ['result', result]],
      sum: [...sum],
    });
    Object.assign(keep, roles);
    return { result, reads };
  };

  // ---- build
  snap(0, `FenwickTree(arr): tree = [0] * (n + 1) = ${n + 1} zeros; cell 0 is never used. Each cell i will hold the sum of the lowbit(i) elements ending at a[i - 1]. The constructor fills it with one update per element.`);
  for (let i = 0; i < n; i++) {
    model[i] = arr[i];
    const touched = climb(i, arr[i], [['build', `update(${i}, ${arr[i]})`]], true);
    const roles: Record<number, Role> = {};
    for (const c of touched) roles[c] = 'done';
    snap(0, `update(${i}, ${arr[i]}): cell${touched.length === 1 ? '' : 's'} ${touched.join(', ')} cover${touched.length === 1 ? 's' : ''} a[${i}], so ${touched.length === 1 ? 'it gets' : 'each gets'} ${signed(arr[i])}.`, {
      roles,
      cells: { [i]: 'active' },
      vars: [['i', i]],
    });
  }
  const build = [...tree];
  building = false;
  if (n > 0) snap(undefined, `Built with ${n} updates (O(n log n)). Cell ${2 ** top} covers a[0..${2 ** top - 1}], the longest block.`);

  // ---- operations
  ops.forEach((op, k) => {
    current = k;
    const name = names[k];
    const vars: Array<[string, string | number]> = [['op', name]];
    const bad = (i: number) => !(i >= 0 && i < n);
    const fail = (line: number, why: string) => {
      const where: Snap =
        op.kind === 'query' ? { band: { lo: op.left, hi: op.right, label: `query [${op.left}, ${op.right}]`, role: 'bad' } } : { badIndex: op.index };
      snap(line, `${name} raises IndexError: ${why} Nothing is read or written.`, { ...where, vars, note: `${String.fromCodePoint(0x2715)} IndexError: ${why}` });
      steps.push({ op, error: 'IndexError', tree: [...tree], touched: [] });
    };
    const badText = (i: number) =>
      `index ${i} out of range for size ${n}.` + (i === -1 ? ' Without the check, index + 1 = 0 and 0 & -0 = 0: update would loop forever (fixed in v0.2.0).' : n === 0 ? ' The array is empty.' : ` Valid indices are 0..${n - 1}.`);

    if (op.kind === 'update') {
      if (bad(op.index)) return fail(1, badText(op.index));
      model[op.index] += op.delta;
      const touched = climb(op.index, op.delta, vars, false);
      steps.push({ op, result: null, tree: [...tree], touched });
      return;
    }
    if (op.kind === 'prefix') {
      if (bad(op.index)) return fail(5, badText(op.index));
      const { result, reads } = descend(op.index, vars, 1, [], {});
      steps.push({ op, result, tree: [...tree], touched: reads });
      return;
    }
    const [left, right] = op.kind === 'get' ? [op.index, op.index] : [op.left, op.right];
    const line = op.kind === 'get' ? 12 : 9;
    if (bad(left)) return fail(line, badText(left));
    if (bad(right)) return fail(line, badText(right));
    if (left > right) return fail(line, `left ${left} is greater than right ${right}.`);
    const sum: StripItem[] = [];
    const keep: Record<number, Role> = {};
    if (op.kind === 'get') snap(12, `${name} is query(${left}, ${left}): a Fenwick tree stores no element directly, so even one element costs two prefix sums.`, { vars });
    const band = { lo: left, hi: right, label: `query [${left}, ${right}]`, role: 'done' as Role };
    if (left === 0) {
      snap(10, `left == 0: the answer is just prefix_sum(${right}).`, { vars, band });
      const { result, reads } = descend(right, vars, 1, sum, keep);
      snap(10, `${name} returns ${result}.`, { roles: keep, band, vars: [...vars, ['result', result]], sum });
      steps.push({ op, result, tree: [...tree], touched: reads });
      return;
    }
    snap(11, `left = ${left} > 0: sum a[0..${right}] and subtract a[0..${left - 1}], the part before the range.`, { vars, band });
    const a = descend(right, vars, 1, sum, keep);
    const b = descend(left - 1, vars, -1, sum, keep);
    const result = a.result - b.result;
    const shared = a.reads.filter((c) => b.reads.includes(c));
    snap(
      11,
      `${name} returns ${a.result} - ${b.result} = ${result}.` +
        (shared.length ? ` Cell${shared.length > 1 ? 's' : ''} ${shared.join(', ')} appear${shared.length > 1 ? '' : 's'} in both walks and cancel${shared.length > 1 ? '' : 's'} out.` : '') +
        ' Subtracting works because + has an inverse; min and max do not, so a Fenwick tree cannot answer them for a range.',
      {
        roles: keep,
        band,
        vars: [...vars, ['result', result]],
        sum,
      },
    );
    steps.push({ op, result, tree: [...tree], touched: [...a.reads, ...b.reads] });
  });

  current = ops.length;
  snap(undefined, n === 0 ? 'Done: the tree is empty.' : `Done: ${n} cells for ${n} elements, and no 4n padding. The total is prefix_sum(${n - 1}).`);
  return { frames, build, steps };
}
