/**
 * Knuth's optimization tracer: merging piles at the minimum cost with each cell trying only the
 * splits of its window, drawn with KnuthOptimizationView (Interval DP's IntervalDpView, unchanged,
 * and two strips: the window of the cell being filled, and the splits tried against every split).
 *
 * Mirrors Algorithms/Dynamic_Programming/DP_Optimizations/Knuth_Optimization/Python/knuth_optimization.py:
 *   _fill (through _fill_merge): prefix sums P; dp[i][i] = 0; for length 2..n, for i,
 *     j = i + length - 1: _window gives k = i alone for two piles, otherwise split[i][j-1] to
 *     split[i+1][j]; dp[i][j] = inf, then _try_split for each k of the window in increasing
 *     order: cost = dp[i][k] + dp[k+1][j] + P[j+1] - P[i], kept with split[i][j] = k only on a
 *     strict gain (so the smallest k of the window wins a tie).
 *   _read_merges: the same stack as Interval DP's (see intervalDp.ts).
 * Golden fixtures (__fixtures__/advancedDp.json, section "knuth") pin every _window call
 * (i, j, lo, hi), every _try_split call (i, k, j, dp[i][j] before, cost), the final tables, the
 * cost, the merges and the number of splits tried.
 *
 * Input: the pile sizes, "3, 2, 4, 1", parsed as for Interval DP.
 */
import type { Frame, Role } from '../core/types';
import type { DpTableState, DtCell, DtChip, DtTable } from '../renderers/DpTableView';
import type { KnuthState } from '../renderers/KnuthOptimizationView';
import type { TdNode, TreeDpState } from '../renderers/TreeDpView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { rangeName, type MergeStep, type SplitCall } from './intervalDp';

export { INTERVAL_LIMITS as KNUTH_LIMITS, parseIntervalDp as parseKnuth, type IntervalDpInput as KnuthInput } from './intervalDp';

export const KNUTH_CODE = [
  'P = prefix sums of piles; dp[i][i] = 0          # one pile: nothing to merge',
  'for length in range(2, n + 1):                  # the windows read the last diagonal',
  '  for i in range(n - length + 1): j = i + length - 1; dp[i][j] = inf',
  '    lo, hi = (i, i) if length == 2 else (split[i][j - 1], split[i + 1][j])',
  '    for k in range(lo, hi + 1):                 # only the window, not every k in i..j-1',
  '      cost = dp[i][k] + dp[k + 1][j] + P[j + 1] - P[i]',
  '      if cost < dp[i][j]: dp[i][j] = cost; split[i][j] = k   # strict: the smallest k wins a tie',
  'stack = [(0, n - 1)]; pop a range, read split, push its two parts',
  'when both parts of i..j are built: merges.append((i, split[i][j], j))',
  'return dp[0][n - 1], merges',
];

/** One _window call: [i, j, lo, hi], as the fixture records it. */
export type WindowCall = [number, number, number, number];

export interface KnuthRun {
  frames: Array<Frame<KnuthState>>;
  windows: WindowCall[];
  calls: SplitCall[];
  dp: number[][];
  split: number[][];
  cost: number;
  merges: MergeStep[];
  /** Splits tried with the windows, and by the plain interval DP: (n^3 - n) / 6. */
  tries: number;
  plain: number;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const kList = (lo: number, hi: number) => (lo === hi ? `k = ${lo}` : `k = ${lo} to ${hi}`);

export function knuthTrace({ piles }: { piles: number[] }): KnuthRun {
  const n = piles.length;
  const P = [0];
  piles.forEach((p, t) => P.push(P[t] + p));
  const sum = (i: number, j: number) => P[j + 1] - P[i];
  const dp: Array<Array<number | null>> = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : null)));
  const split: number[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => -1));
  const frames: Array<Frame<KnuthState>> = [];
  const windows: WindowCall[] = [];
  const calls: SplitCall[] = [];
  const merges: MergeStep[] = [];
  const headers = Array.from({ length: n }, (_, t) => String(t));
  const plainTotal = (n ** 3 - n) / 6;
  let tries = 0;
  let plainSoFar = 0;

  // The merge tree as far as it has been read back: the ranges seen, and those already merged.
  const seen = new Set<string>();
  const merged = new Set<string>();
  let treeRoot: string | null = null;
  const nodeId = (i: number, j: number) => `r${i}-${j}`;

  interface Look {
    /** Roles of dp cells and split cells, keyed "i,j". */
    cells?: Record<string, Role>;
    splitCells?: Record<string, Role>;
    /** The cell being filled: its row and column headers are highlighted. */
    at?: [number, number];
    /** Piles highlighted in the chips row. */
    piles?: [number, number];
    /** The node of the tree being read or merged. */
    node?: string;
    /** The window strip: the cell, its window, the k being tried and how many are done. */
    window?: { i: number; j: number; lo: number; hi: number; current?: number; done: number };
    vars?: Array<[string, string | number]>;
  }

  const table = (id: string, title: string, value: (i: number, j: number) => string | null, roles: Record<string, Role>, at?: [number, number]): DtTable => ({
    id,
    title,
    corner: 'i \\ j',
    rowHeaders: headers,
    colHeaders: headers,
    cells: Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j): DtCell | null => {
        if (i > j || (id === 'split' && i === j)) return { text: '', role: 'muted' };
        const text = value(i, j);
        const role = roles[`${i},${j}`];
        if (text === null) return role ? { text: '', role } : null;
        return role ? { text, role } : { text };
      }),
    ),
    rowRoles: at ? { [at[0]]: 'active' } : undefined,
    colRoles: at ? { [at[1]]: 'active' } : undefined,
  });

  const mergeStrip = (): StripItem[] =>
    merges.map(([i, k, j]) => ({ text: `${sum(i, k)} + ${sum(k + 1, j)} = ${sum(i, j)}`, role: 'done' as Role }));

  const tree = (active?: string): TreeDpState | undefined => {
    if (treeRoot === null) return undefined;
    const nodes: TdNode[] = [];
    const edges: Record<string, Role> = {};
    const visit = (i: number, j: number) => {
      const id = nodeId(i, j);
      const open = i < j && seen.has(id);
      const k = split[i][j];
      const children = open ? [nodeId(i, k), nodeId(k + 1, j)] : [];
      const role: Role | undefined = id === active ? 'active' : merged.has(id) ? 'done' : undefined;
      nodes.push({ id, label: String(sum(i, j)), tag: i === j ? `${i}` : `${i}-${j}`, children, role, cells: [{ text: String(dp[i][j]) }] });
      if (open) {
        for (const c of children) if (merged.has(id)) edges[c] = 'done';
        visit(i, k);
        visit(k + 1, j);
      }
    };
    visit(0, n - 1);
    const total = merges.reduce((s, [i, , j]) => s + sum(i, j), 0);
    return {
      label: `Merge tree read back from split: ${nodes.length} node${nodes.length === 1 ? '' : 's'}, ${plural(merges.length, 'merge')} done so far`,
      root: treeRoot,
      nodes,
      cellNames: ['cost'],
      edges,
      totals: [{ label: 'merged', value: String(total), role: merges.length === n - 1 ? 'done' : undefined }],
      strips: merges.length ? [{ label: 'Merges, in order (left + right = cost)', items: mergeStrip() }] : undefined,
    };
  };

  const strips = (look: Look): StripData[] => {
    const out: StripData[] = [];
    const w = look.window;
    if (w) {
      const skipped = w.j - w.i - (w.hi - w.lo + 1);
      const items: StripItem[] = [];
      for (let k = w.lo; k <= w.hi; k++) {
        const role: Role | undefined = k === w.current ? 'active' : k - w.lo < w.done ? 'done' : undefined;
        items.push(role ? { text: `k = ${k}`, role } : { text: `k = ${k}` });
      }
      out.push({ label: `Window of dp[${w.i}][${w.j}] (${skipped} of its ${plural(w.j - w.i, 'split')} skipped)`, items });
    }
    const finished = treeRoot !== null || n <= 1;
    out.push({
      label: 'Splits tried so far',
      items: [{ text: `with windows: ${tries}`, role: finished ? 'done' : 'active' }, { text: `every split: ${plainSoFar}` }],
    });
    return out;
  };

  const snap = (line: number | undefined, caption: string, look: Look = {}) => {
    const chips: DtChip[] = piles.map((p, t) => ({
      text: String(p),
      sub: String(t),
      role: look.piles && t >= look.piles[0] && t <= look.piles[1] ? 'compare' : undefined,
    }));
    const dpState: DpTableState = {
      label: `dp table for piles ${piles.join(', ')}`,
      chips: [{ label: 'piles', chips }],
      tables: [table('dp', 'dp[i][j]: cheapest merge of piles i..j', (i, j) => (dp[i][j] === null ? null : String(dp[i][j])), look.cells ?? {}, look.at)],
    };
    const splitState: DpTableState = {
      label: 'split table: the smallest best k of each range, which bounds the windows of the next diagonal',
      tables: [table('split', 'split[i][j]: the k kept', (i, j) => (split[i][j] < 0 ? null : String(split[i][j])), look.splitCells ?? {}, look.at)],
    };
    frames.push({
      line,
      caption,
      vars: look.vars,
      state: {
        label: `Knuth's optimization on piles ${piles.join(', ')}`,
        dp: dpState,
        split: splitState,
        tree: tree(look.node),
        strips: strips(look),
      },
    });
  };

  if (n === 1) {
    treeRoot = nodeId(0, 0);
    snap(0, `One pile needs no merge: dp[0][0] = 0, and merge_piles returns 0 with no merges and no split tried.`, {
      cells: { '0,0': 'done' },
      node: treeRoot,
      vars: [['n', 1], ['cost', 0]],
    });
    return { frames, windows, calls, dp: [[0]], split, cost: 0, merges, tries, plain: plainTotal };
  }

  snap(
    0,
    `dp[i][j] is the cheapest way to merge piles i..j into one pile, and split[i][j] the smallest k of the best last merge. ` +
      `With the prefix sums P = ${P.join(', ')}, sum(i..j) = P[j+1] - P[i]. ` +
      `Each cell will try only the splits between split[i][j-1] and split[i+1][j].`,
    { vars: [['n', n], ['P', P.join(', ')]] },
  );

  for (let length = 2; length <= n; length++) {
    const count = n - length + 1;
    snap(
      1,
      length === 2
        ? `Length 2: ${plural(count, 'range')} of two piles. A range of two has one split, k = i, so its window is that split alone.`
        : `Length ${length}: ${plural(count, 'range')} of ${length} piles. The window of dp[i][j] runs from split[i][j-1] to split[i+1][j], two cells of length ${length - 1}, already final.`,
      { vars: [['length', length]] },
    );
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      const [lo, hi] = length === 2 ? [i, i] : [split[i][j - 1], split[i + 1][j]];
      windows.push([i, j, lo, hi]);
      plainSoFar += j - i;
      const bounds: Record<string, Role> = length === 2 ? {} : { [`${i},${j - 1}`]: 'compare', [`${i + 1},${j}`]: 'compare' };
      const width = hi - lo + 1;
      snap(
        3,
        length === 2
          ? `dp[${i}][${j}]: two piles, one split, k = ${i}.`
          : `dp[${i}][${j}]: its window runs from split[${i}][${j - 1}] = ${lo} to split[${i + 1}][${j}] = ${hi}, so it tries ${kList(lo, hi)}: ` +
              `${plural(width, 'split')} of the ${j - i} from ${i} to ${j - 1}.`,
        {
          cells: { [`${i},${j}`]: 'active' },
          splitCells: { ...bounds, [`${i},${j}`]: 'active' },
          at: [i, j],
          piles: [i, j],
          window: { i, j, lo, hi, done: 0 },
          vars: [['i', i], ['j', j], ['lo', lo], ['hi', hi]],
        },
      );
      const s = sum(i, j);
      let best = Infinity;
      for (let k = lo; k <= hi; k++) {
        const left = dp[i][k]!;
        const right = dp[k + 1][j]!;
        const cost = left + right + s;
        calls.push([i, k, j, best, cost]);
        tries++;
        const before = best;
        const better = cost < best;
        if (better) {
          best = cost;
          split[i][j] = k;
        }
        dp[i][j] = best;
        const verdict =
          before === Infinity
            ? `The first split of the window, so it is the best so far: split[${i}][${j}] = ${k}.`
            : better
              ? `Less than ${before}, so it is kept: split[${i}][${j}] = ${k}.`
              : cost === before
                ? `Equal to ${before}: a tie keeps the smaller split, ${split[i][j]}.`
                : `More than ${before}: split[${i}][${j}] stays ${split[i][j]}.`;
        snap(
          better ? 6 : 5,
          `dp[${i}][${j}], last merge after pile ${k}: dp[${i}][${k}] + dp[${k + 1}][${j}] + sum(${i}..${j}) = ${left} + ${right} + ${s} = ${cost}. ${verdict}`,
          {
            cells: { [`${i},${k}`]: 'compare', [`${k + 1},${j}`]: 'compare', [`${i},${j}`]: 'active' },
            splitCells: { ...bounds, [`${i},${j}`]: 'active' },
            at: [i, j],
            piles: [i, j],
            window: { i, j, lo, hi, current: k, done: k - lo },
            vars: [['i', i], ['j', j], ['k', k], ['cost', cost], ['best', best]],
          },
        );
      }
      const k = split[i][j];
      const skipped = j - i - width;
      snap(
        2,
        `dp[${i}][${j}] = ${best}, kept with split[${i}][${j}] = ${k}: the cheapest way to merge ${rangeName(i, j)} ends by joining ${rangeName(i, k)} with ${rangeName(k + 1, j)}. ` +
          (skipped === 0 ? `The window held every split of this range.` : `The ${plural(skipped, 'split')} outside the window ${skipped === 1 ? 'was' : 'were'} never tried.`),
        {
          cells: { [`${i},${j}`]: 'done' },
          splitCells: { [`${i},${j}`]: 'done' },
          at: [i, j],
          window: { i, j, lo, hi, done: width },
          vars: [['i', i], ['j', j], ['dp[i][j]', best], ['split[i][j]', k]],
        },
      );
    }
  }

  // Read the merges back, as _read_merges does: an explicit stack, post-order.
  const cost = dp[0][n - 1]!;
  treeRoot = nodeId(0, n - 1);
  const onTree = (): Record<string, Role> => {
    const roles: Record<string, Role> = {};
    for (const id of merged) {
      const [i, j] = id.slice(1).split('-').map(Number);
      roles[`${i},${j}`] = 'done';
    }
    return roles;
  };
  const stack: Array<[number, number, boolean]> = [[0, n - 1, false]];
  while (stack.length) {
    const [lo, hi, partsBuilt] = stack.pop()!;
    if (lo === hi) continue;
    const k = split[lo][hi];
    const id = nodeId(lo, hi);
    if (!partsBuilt) {
      seen.add(id);
      stack.push([lo, hi, true], [k + 1, hi, false], [lo, k, false]);
      snap(
        7,
        `split[${lo}][${hi}] = ${k}: ${rangeName(lo, hi)} (a pile of ${sum(lo, hi)}) is made by joining ${rangeName(lo, k)} with ${rangeName(k + 1, hi)}. ` +
          `Both parts are built first, the left one before the right one.`,
        { cells: { ...onTree(), [`${lo},${hi}`]: 'active' }, splitCells: { ...onTree(), [`${lo},${hi}`]: 'active' }, at: [lo, hi], piles: [lo, hi], node: id, vars: [['i', lo], ['j', hi], ['split[i][j]', k]] },
      );
    } else {
      merges.push([lo, k, hi]);
      merged.add(id);
      const total = merges.reduce((s, [i, , j]) => s + sum(i, j), 0);
      snap(
        8,
        `Merge ${rangeName(lo, k)} (size ${sum(lo, k)}) with ${rangeName(k + 1, hi)} (size ${sum(k + 1, hi)}): a pile of ${sum(lo, hi)}, which costs ${sum(lo, hi)}. ` +
          `Merged so far: ${total}.`,
        { cells: onTree(), splitCells: onTree(), at: [lo, hi], piles: [lo, hi], node: id, vars: [['merge', `(${lo}, ${k}, ${hi})`], ['cost', sum(lo, hi)], ['total', total]] },
      );
    }
  }
  snap(
    9,
    `Done: merge_piles returns dp[0][${n - 1}] = ${cost}, the same as Interval DP, and the ${plural(merges.length, 'merge')} read back cost ${merges.map(([i, , j]) => sum(i, j)).join(' + ')} = ${cost}. ` +
      `The windows held ${plural(tries, 'split')}; trying every split takes ${plainTotal}.`,
    { cells: onTree(), splitCells: onTree(), vars: [['cost', cost], ['tries', tries], ['every split', plainTotal]] },
  );
  return { frames, windows, calls, dp: dp.map((row) => row.map((v) => v ?? 0)), split, cost, merges, tries, plain: plainTotal };
}
