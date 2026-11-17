/**
 * Constructive algorithm tracers: three of the nine builders of
 * Utilities/Problem_Types/Constructive_Algorithms/Python/constructive.py.
 *   'permutation' construct_permutation(n, k), drawn with ZigzagView: zig-zag 1, k+1, 2, k, ...
 *                 (differences k, k-1, ..., 1), then k+2..n; None when k is out of range.
 *   'graph'       construct_graph(degrees), drawn with GraphView: Havel-Hakimi on a heap of
 *                 (-degree, node) tuples, so the largest remaining degree pops first and equal
 *                 degrees pop by smaller index; None when the heap runs dry.
 *   'matrix'      construct_matrix(row_sums, col_sums), drawn with Grid: None when the totals
 *                 differ, otherwise the north-west corner fill, val = min(row left, column left).
 * Golden fixtures (__fixtures__/mathAndProblemTypes.json) pin every result, and for the graph
 * every heap pop and push.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GridState } from '../renderers/Grid';
import type { GraphEdgeView, GraphNodeView, GraphState } from '../renderers/GraphView';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

/* ---------- shared input helpers ---------- */

function ints(text: string, what: string, lo: number, hi: number): number[] {
  const toks = text
    .replace(/[[\]()]/g, ' ')
    .split(/[\s,]+/)
    .filter(Boolean);
  return toks.map((t) => {
    if (!/^-?\d+$/.test(t)) throw new InputError(`${what}: "${t}" is not a whole number.`);
    const v = Number(t) + 0;
    if (v < lo || v > hi) throw new InputError(`${what} go from ${lo} to ${hi} here (got ${t}).`);
    return v;
  });
}

/* =====================================================================
 * construct_permutation(n, k)
 * ===================================================================== */

export interface PermInput {
  n: number;
  k: number;
}

export const PERM_LIMITS = { maxN: 16 };

/** "n 7, k 3", "7 3" or "construct_permutation(7, 3)". */
export function parsePerm(text: string): PermInput {
  const named = text.match(/^\s*n\s*[:=]?\s*(-?\d+)\s*[,;]?\s*k\s*[:=]?\s*(-?\d+)\s*$/i);
  const plain = text.replace(/construct_permutation/i, '').match(/^\s*\(?\s*(-?\d+)\s*[,\s]\s*(-?\d+)\s*\)?\s*$/);
  const m = named ?? plain;
  if (!m) throw new InputError('Write n and k, e.g. "n 7, k 3" for a permutation of 1..7 with exactly 3 distinct adjacent differences.');
  const n = Number(m[1]);
  const k = Number(m[2]);
  if (n < -5 || n > PERM_LIMITS.maxN) throw new InputError(`n goes up to ${PERM_LIMITS.maxN} here, so every value fits on the chart (got ${n}).`);
  if (k < -5 || k > PERM_LIMITS.maxN + 2) throw new InputError(`k goes from -5 to ${PERM_LIMITS.maxN + 2} here (got ${k}).`);
  return { n, k };
}

export const PERM_CODE = [
  'def construct_permutation(n, k):',
  '    if n < 1: return None',
  '    if n == 1: return [1] if k == 0 else None',
  '    if k < 1 or k >= n: return None        # impossible',
  '    perm = []',
  '    lo, hi = 1, k + 1',
  '    take_low = True',
  '    while lo <= hi:',
  '        if take_low: perm.append(lo); lo += 1',
  '        else: perm.append(hi); hi -= 1',
  '        take_low = not take_low',
  '    perm.extend(range(k + 2, n + 1))        # differences 1, or at most k',
  '    return perm',
];

export interface ZigzagState {
  n: number;
  /** The permutation so far: value at each position. */
  perm: number[];
  /** Role of each placed value. */
  roles: Role[];
  /** The difference |perm[i+1] - perm[i]| of each segment, and whether it was new. */
  diffs: Array<{ value: number; fresh: boolean; role: Role }>;
  /** The zig-zag range lo..hi still to place (null outside the loop). */
  pool: { lo: number; hi: number } | null;
  /** Distinct differences so far, in the order they appeared. */
  distinct: number[];
  /** The run's longest list of distinct differences, which the strip reserves room for. */
  ghostDistinct?: number[];
  /** Whole-result status: good = returned, bad = None. */
  status?: 'good' | 'bad';
}

export interface PermRun {
  frames: Array<Frame<ZigzagState>>;
  result: number[] | null;
}

export function permTrace({ n, k }: PermInput): PermRun {
  const frames: Array<Frame<ZigzagState>> = [];
  const perm: number[] = [];
  const diffs: ZigzagState['diffs'] = [];
  const distinct: number[] = [];
  let pool: ZigzagState['pool'] = null;
  const size = Math.max(n, 1);

  const snap = (line: number, caption: string, o: { last?: Role; status?: 'good' | 'bad'; segRole?: Role } = {}) => {
    frames.push({
      line,
      caption,
      vars: [
        ['n', n],
        ['k', k],
        ['perm', `[${perm.join(', ')}]`],
        ['distinct differences', distinct.length],
        ...(pool ? ([['lo', pool.lo], ['hi', pool.hi]] as Array<[string, number]>) : []),
      ],
      state: {
        n: size,
        perm: [...perm],
        roles: perm.map((_, i) => (o.status === 'good' ? 'good' : i === perm.length - 1 && o.last ? o.last : 'idle')),
        diffs: diffs.map((d, i) => ({ ...d, role: o.status === 'good' ? 'done' : i === diffs.length - 1 && o.segRole ? o.segRole : d.fresh ? 'done' : 'idle' })),
        pool: pool ? { ...pool } : null,
        distinct: [...distinct],
        status: o.status,
      },
    });
  };

  if (n < 1) {
    snap(1, `construct_permutation(${n}, ${k}): n < 1 means there is nothing to permute, so the function returns None.`, { status: 'bad' });
    return { frames, result: null };
  }
  if (n === 1) {
    if (k === 0) {
      perm.push(1);
      snap(2, 'construct_permutation(1, 0): [1] has no adjacent pairs, so it has exactly 0 distinct differences: return [1].', { status: 'good' });
      return { frames, result: [1] };
    }
    snap(2, `construct_permutation(1, ${k}): a single number has no adjacent pairs, so only k = 0 works; k = ${k} returns None.`, { status: 'bad' });
    return { frames, result: null };
  }
  if (k < 1 || k >= n) {
    snap(
      3,
      k < 1
        ? `construct_permutation(${n}, ${k}): two different numbers always differ, so ${n} >= 2 numbers have at least 1 distinct difference. k = ${k} is impossible: return None.`
        : `construct_permutation(${n}, ${k}): ${n} numbers have ${n - 1} adjacent pairs, so at most ${n - 1} distinct differences. k = ${k} is impossible: return None.`,
      { status: 'bad' },
    );
    return { frames, result: null };
  }
  pool = { lo: 1, hi: k + 1 };
  snap(5, `construct_permutation(${n}, ${k}): zig-zag through 1..${k + 1}, alternately the smallest and the largest number left. The differences then shrink by one each step: ${k}, ${k - 1}, ..., 1.`);
  let takeLow = true;
  const place = (v: number, line: number, why: string) => {
    perm.push(v);
    if (perm.length > 1) {
      const d = Math.abs(v - perm[perm.length - 2]);
      const fresh = !distinct.includes(d);
      if (fresh) distinct.push(d);
      diffs.push({ value: d, fresh, role: 'active' });
      snap(line, `${why} |${v} - ${perm[perm.length - 2]}| = ${d}: ${fresh ? `a new difference (${distinct.length} so far)` : `already seen, still ${distinct.length} distinct`}.`, { last: 'active', segRole: 'active' });
    } else {
      snap(line, `${why} The first number has no difference yet.`, { last: 'active' });
    }
  };
  while (pool.lo <= pool.hi) {
    if (takeLow) {
      const v = pool.lo;
      pool.lo += 1;
      place(v, 8, `take_low: append lo = ${v}, the smallest number left in the zig-zag range.`);
    } else {
      const v = pool.hi;
      pool.hi -= 1;
      place(v, 9, `append hi = ${v}, the largest number left in the zig-zag range.`);
    }
    takeLow = !takeLow;
  }
  pool = null;
  for (let v = k + 2; v <= n; v++) {
    place(
      v,
      11,
      v === k + 2
        ? `The zig-zag ended at ${perm[perm.length - 1]}, so the tail k+2..n = ${k + 2}..${n} starts: append ${v}.`
        : `append ${v}: the tail climbs by 1.`,
    );
  }
  snap(
    12,
    `Done: [${perm.join(', ')}] uses every number of 1..${n} once, and its differences take exactly ${distinct.length} distinct value${distinct.length === 1 ? '' : 's'}: ${[...distinct].sort((a, b) => b - a).join(', ')}.`,
    { status: 'good' },
  );
  return { frames, result: [...perm] };
}

/* =====================================================================
 * construct_graph(degrees): Havel-Hakimi
 * ===================================================================== */

export const GRAPH_LIMITS = { maxNodes: 10, maxDegree: 9 };

/** "3 3 2 2 2" or "[3, 3, 2, 2, 2]": the degree of each node 0..n-1. */
export function parseDegrees(text: string): number[] {
  const body = text.replace(/construct_graph/i, '');
  const degrees = ints(body, 'Degrees', 0, GRAPH_LIMITS.maxDegree);
  if (degrees.length === 0) throw new InputError('Give the degree of every node, e.g. "3 3 2 2 2".');
  if (degrees.length > GRAPH_LIMITS.maxNodes) throw new InputError(`At most ${GRAPH_LIMITS.maxNodes} nodes here (got ${degrees.length}).`);
  return degrees;
}

export const GRAPH_CODE = [
  'def construct_graph(degrees):',
  '    edges = []',
  '    pq = [(-d, i) for i, d in enumerate(degrees) if d > 0]   # max heap by degree',
  '    heapq.heapify(pq)',
  '    while pq:',
  '        neg_deg, u = heapq.heappop(pq); deg = -neg_deg',
  '        if deg == 0: continue              # never: only d > 0 enter the heap',
  '        neighbors = []',
  '        for _ in range(deg):',
  '            if not pq: return None         # impossible',
  '            neighbors.append(heapq.heappop(pq))',
  '        for neg_d, v in neighbors:',
  '            edges.append((u, v)); d = -neg_d',
  '            if d > 1: heapq.heappush(pq, (-(d - 1), v))',
  '    return edges',
];

/** A heap operation as the fixtures record it: ["pop" | "push", degree, node]. */
export type HeapOp = ['pop' | 'push', number, number];

export interface GraphRun {
  frames: Array<Frame<GraphState>>;
  result: Array<[number, number]> | null;
  ops: HeapOp[];
}

export function graphTrace(degrees: number[]): GraphRun {
  const n = degrees.length;
  const frames: Array<Frame<GraphState>> = [];
  const ops: HeapOp[] = [];
  const edges: Array<[number, number]> = [];
  const left = [...degrees];
  /** The heap as a sorted list: largest degree first, then smaller index (the tuple order). */
  let pq: Array<[number, number]> = [];
  const sortPq = () => pq.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const W = 600;
  const H = 380;
  const r = n <= 2 ? 90 : 140;
  const pos = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { x: W / 2 + r * Math.cos(a), y: H / 2 + 6 + r * Math.sin(a) };
  });

  const snap = (line: number, caption: string, o: { nodes?: Record<number, Role>; edges?: Record<number, Role>; popped?: Array<[number, number]>; status?: 'good' | 'bad' } = {}) => {
    const nodes: GraphNodeView[] = pos.map((p, i) => ({
      id: String(i),
      x: p.x,
      y: p.y,
      role: o.status === 'good' ? 'good' : (o.nodes?.[i] ?? (left[i] === 0 ? 'done' : 'idle')),
      badge: left[i] === 0 ? `deg ${degrees[i]}` : `needs ${left[i]}`,
    }));
    const ev: GraphEdgeView[] = edges.map(([u, v], id) => ({ id, from: String(u), to: String(v), directed: false, weight: 0, role: o.edges?.[id] ?? 'idle' }));
    const heap: StripItem[] = pq.length ? pq.map(([d, v]) => ({ text: `${v} (${d})` })) : [{ text: SYM.emptySet, role: 'muted' }];
    frames.push({
      line,
      caption,
      vars: [
        ['edges', edges.length],
        ['heap size', pq.length],
        ['degree sum left', left.reduce((s, d) => s + d, 0)],
      ],
      state: {
        nodes,
        edges: ev,
        showWeights: false,
        strips: [
          { label: 'Heap: node (degree), next pop first', items: heap },
          { label: 'Popped', items: o.popped?.length ? o.popped.map(([d, v]): StripItem => ({ text: `${v} (${d})`, role: 'compare' })) : [{ text: SYM.emptySet, role: 'muted' }] },
        ],
      },
    });
  };

  pq = degrees.flatMap((d, i): Array<[number, number]> => (d > 0 ? [[d, i]] : []));
  sortPq();
  const zeros = degrees.filter((d) => d === 0).length;
  snap(
    3,
    `heapify ${pq.length} (-degree, node) tuple${pq.length === 1 ? '' : 's'}: the heap pops the largest degree first, and equal degrees by the smaller node.` +
      (zeros ? ` ${zeros} node${zeros > 1 ? 's' : ''} with degree 0 never enter${zeros > 1 ? '' : 's'}.` : '') +
      ` Degree sum ${degrees.reduce((s, d) => s + d, 0)}: every edge uses up 2.`,
  );
  while (pq.length) {
    const [deg, u] = pq.shift()!;
    ops.push(['pop', deg, u]);
    snap(5, `Pop node ${u}, which still needs ${deg} edge${deg > 1 ? 's' : ''}: the largest remaining degree. Havel-Hakimi joins it to the next ${deg} largest.`, { nodes: { [u]: 'active' } });
    const popped: Array<[number, number]> = [];
    for (let t = 0; t < deg; t++) {
      if (!pq.length) {
        const hl: Record<number, Role> = { [u]: 'bad' };
        for (const [, v] of popped) hl[v] = 'compare';
        snap(
          9,
          `The heap is empty after ${popped.length} neighbor${popped.length === 1 ? '' : 's'}, but node ${u} needs ${deg}: no simple graph has this degree sequence, so construct_graph returns None.`,
          { nodes: hl, popped, status: 'bad' },
        );
        return { frames, result: null, ops };
      }
      const [d, v] = pq.shift()!;
      ops.push(['pop', d, v]);
      popped.push([d, v]);
      const hl: Record<number, Role> = { [u]: 'active' };
      for (const [, w] of popped) hl[w] = 'compare';
      snap(10, `Pop node ${v} (needs ${d}) as neighbor ${popped.length} of ${deg}.`, { nodes: hl, popped });
    }
    popped.forEach(([d, v], idx) => {
      edges.push([u, v]);
      left[u] -= 1;
      left[v] -= 1;
      const hl: Record<number, Role> = { [u]: 'active', [v]: 'compare' };
      let tail: string;
      if (d > 1) {
        pq.push([d - 1, v]);
        sortPq();
        ops.push(['push', d - 1, v]);
        tail = `node ${v} still needs ${d - 1}, so it goes back on the heap.`;
      } else {
        tail = `node ${v} is satisfied and stays off the heap.`;
      }
      snap(d > 1 ? 13 : 12, `Add edge (${u}, ${v}): ${tail}`, { nodes: hl, edges: { [edges.length - 1]: 'active' }, popped: popped.slice(idx + 1) });
    });
  }
  snap(
    14,
    `The heap is empty, so every degree is met: edges = ${edges.map(([u, v]) => `(${u},${v})`).join(' ') || '[]'}. No edge repeats, because a popped node never comes back.`,
    { status: 'good' },
  );
  return { frames, result: edges, ops };
}

/* =====================================================================
 * construct_matrix(row_sums, col_sums): north-west corner rule
 * ===================================================================== */

export interface MatrixSumsInput {
  rows: number[];
  cols: number[];
}

export const SUMS_LIMITS = { maxSide: 6, maxSum: 99 };

/** "rows 3 2; cols 1 4" or "3 2 | 1 4". */
export function parseSums(text: string): MatrixSumsInput {
  const named = text.match(/^\s*rows?\s*[:=]?\s*(.*?)\s*[;\n|]\s*col(?:umn)?s?\s*[:=]?\s*(.*?)\s*$/i);
  const parts = named ? [named[1], named[2]] : text.split(/[;|\n]/).map((s) => s.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) throw new InputError('Give the row sums and the column sums: "rows 3 2; cols 1 4".');
  const rows = ints(parts[0], 'Row sums', 0, SUMS_LIMITS.maxSum);
  const cols = ints(parts[1], 'Column sums', 0, SUMS_LIMITS.maxSum);
  if (rows.length > SUMS_LIMITS.maxSide || cols.length > SUMS_LIMITS.maxSide) throw new InputError(`At most ${SUMS_LIMITS.maxSide} rows and ${SUMS_LIMITS.maxSide} columns here.`);
  return { rows, cols };
}

export const SUMS_CODE = [
  'def construct_matrix(row_sums, col_sums):',
  '    n, m = len(row_sums), len(col_sums)',
  '    if sum(row_sums) != sum(col_sums): return None    # impossible',
  '    row_sums, col_sums = row_sums.copy(), col_sums.copy()',
  '    matrix = [[0] * m for _ in range(n)]',
  '    for i in range(n):',
  '        for j in range(m):',
  '            val = min(row_sums[i], col_sums[j])',
  '            matrix[i][j] = val',
  '            row_sums[i] -= val; col_sums[j] -= val',
  '    return matrix',
];

export interface MatrixSumsRun {
  frames: Array<Frame<GridState>>;
  result: number[][] | null;
}

export function sumsTrace({ rows, cols }: MatrixSumsInput): MatrixSumsRun {
  const n = rows.length;
  const m = cols.length;
  const frames: Array<Frame<GridState>> = [];
  const r = [...rows];
  const c = [...cols];
  const matrix: Array<Array<number | null>> = Array.from({ length: n }, () => Array(m).fill(null));
  const total = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

  const snap = (line: number, caption: string, roles: Record<string, Role> = {}) => {
    const cells: Array<Array<number | string | null>> = matrix.map((row, i) => [...row, r[i]]);
    cells.push([...c, total(r)]);
    const all: Record<string, Role> = {};
    for (let i = 0; i < n; i++) if (r[i] === 0) all[`${i},${m}`] = 'done';
    for (let j = 0; j < m; j++) if (c[j] === 0) all[`${n},${j}`] = 'done';
    frames.push({
      line,
      caption,
      vars: [
        ['row sums left', `[${r.join(', ')}]`],
        ['column sums left', `[${c.join(', ')}]`],
      ],
      state: {
        corner: '',
        rowHeaders: [...rows.map((_, i) => `row ${i}`), 'col left'],
        colHeaders: [...cols.map((_, j) => `col ${j}`), 'row left'],
        cells,
        roles: { ...all, ...roles },
      },
    });
  };

  if (total(rows) !== total(cols)) {
    const roles: Record<string, Role> = { [`${n},${m}`]: 'active' };
    snap(2, `The row sums total ${total(rows)} but the column sums total ${total(cols)}. Both count every entry of the matrix once, so they must be equal: construct_matrix returns None.`, roles);
    frames[frames.length - 1].state.cells[n][m] = `${total(rows)} vs ${total(cols)}`;
    return { frames, result: null };
  }
  snap(4, `Both sums total ${total(rows)}. Start from the top-left corner with every entry 0 (shown blank until visited); the margins hold what each row and column still needs.`);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const val = Math.min(r[i], c[j]);
      const before = [r[i], c[j]];
      matrix[i][j] = val;
      r[i] -= val;
      c[j] -= val;
      const roles: Record<string, Role> = { [`${i},${j}`]: 'active', [`${i},${m}`]: 'compare', [`${n},${j}`]: 'compare' };
      snap(
        9,
        `Cell (${i}, ${j}): val = min(row ${i} left ${before[0]}, col ${j} left ${before[1]}) = ${val}. ` +
          (val === 0
            ? `${before[0] === 0 ? `Row ${i}` : `Column ${j}`} is already full, so the cell stays 0.`
            : `Taking the most both allow ${r[i] === 0 && c[j] === 0 ? 'finishes row ' + i + ' and column ' + j : r[i] === 0 ? `finishes row ${i}` : `finishes column ${j}`}.`),
        roles,
      );
    }
  }
  const result = matrix.map((row) => row.map((v) => v ?? 0));
  const roles: Record<string, Role> = {};
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) roles[`${i},${j}`] = 'done';
  snap(10, `Done: every row and column sum is met, because each step finishes a row or a column and the two totals are equal. Matrix: ${JSON.stringify(result)}.`, roles);
  return { frames, result };
}
