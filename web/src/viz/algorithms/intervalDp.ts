/**
 * Interval DP tracer: merging piles at the minimum cost, drawn with IntervalDpView (two
 * DpTableViews, dp and split, and a TreeDpView for the merge tree once it is read back).
 *
 * Mirrors Algorithms/Dynamic_Programming/Advanced_DP/Interval_DP/Python/interval_dp.py:
 *   _fill_merge: prefix sums P; dp[i][i] = 0; for length 2..n, for i, j = i + length - 1:
 *     dp[i][j] = inf, then _try_split for k = i..j-1, which computes
 *     cost = dp[i][k] + dp[k+1][j] + P[j+1] - P[i] and keeps it, with split[i][j] = k, only on
 *     a strict gain (so the smallest k wins a tie).
 *   _read_merges: a stack of (lo, hi, parts_built), starting with (0, n - 1); a single pile is
 *     skipped; an unexpanded range pushes itself back as expanded, then its right and its left
 *     part; an expanded range appends the merge (lo, split[lo][hi], hi).
 * Golden fixtures (__fixtures__/advancedDp.json, section "intervalDp") pin every _try_split
 * call (i, k, j, dp[i][j] before, cost), the final tables, the cost and the merges.
 *
 * Input: the pile sizes, "3, 2, 4, 1".
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { DpTableState, DtCell, DtChip, DtTable } from '../renderers/DpTableView';
import type { IntervalDpState } from '../renderers/IntervalDpView';
import type { TdNode, TreeDpState } from '../renderers/TreeDpView';
import type { StripItem } from '../ui/molecules/Strip';

export interface IntervalDpInput {
  piles: number[];
}

export const INTERVAL_LIMITS = { maxPiles: 8, maxSize: 99 };

export function parseIntervalDp(text: string): IntervalDpInput {
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  if (tokens.length === 0) throw new InputError('Enter the pile sizes, for example "3, 2, 4, 1". (merge_piles([]) returns 0: with no piles there is nothing to draw.)');
  if (tokens.length > INTERVAL_LIMITS.maxPiles) {
    throw new InputError(`At most ${INTERVAL_LIMITS.maxPiles} piles here, so both tables fit on screen (got ${tokens.length}).`);
  }
  const piles = tokens.map((tok) => {
    if (!/^-?\d+$/.test(tok)) throw new InputError(`"${tok}" is not a pile size: use whole numbers.`);
    const v = Number(tok);
    if (v < 0) throw new InputError(`Pile ${tok}: a size below 0 makes the code raise ValueError. Use 0 to ${INTERVAL_LIMITS.maxSize}.`);
    if (v > INTERVAL_LIMITS.maxSize) throw new InputError(`Pile sizes go up to ${INTERVAL_LIMITS.maxSize} here (got ${tok}).`);
    return v;
  });
  return { piles };
}

export const INTERVAL_CODE = [
  'P = prefix sums of piles; dp[i][i] = 0          # one pile: nothing to merge',
  'for length in range(2, n + 1):                  # shorter ranges first',
  '  for i in range(n - length + 1): j = i + length - 1; dp[i][j] = inf',
  '    for k in range(i, j):                       # last merge: i..k with k+1..j',
  '      cost = dp[i][k] + dp[k + 1][j] + P[j + 1] - P[i]',
  '      if cost < dp[i][j]: dp[i][j] = cost; split[i][j] = k   # strict: the smallest k wins a tie',
  'stack = [(0, n - 1)]; pop a range, read split, push its two parts',
  'when both parts of i..j are built: merges.append((i, split[i][j], j))',
  'return dp[0][n - 1], merges',
];

/** One _try_split call: [i, k, j, dp[i][j] before (Infinity for inf), cost], as the fixture records it. */
export type SplitCall = [number, number, number, number, number];
export type MergeStep = [number, number, number];

export interface IntervalRun {
  frames: Array<Frame<IntervalDpState>>;
  calls: SplitCall[];
  dp: number[][];
  split: number[][];
  cost: number;
  merges: MergeStep[];
}

/** "pile 2" or "piles 0..3". */
export const rangeName = (i: number, j: number) => (i === j ? `pile ${i}` : `piles ${i}..${j}`);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function intervalDpTrace({ piles }: IntervalDpInput): IntervalRun {
  const n = piles.length;
  const P = [0];
  piles.forEach((p, t) => P.push(P[t] + p));
  const sum = (i: number, j: number) => P[j + 1] - P[i];
  const dp: Array<Array<number | null>> = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : null)));
  const split: number[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => -1));
  const frames: Array<Frame<IntervalDpState>> = [];
  const calls: SplitCall[] = [];
  const merges: MergeStep[] = [];
  const headers = Array.from({ length: n }, (_, t) => String(t));

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
      label: 'split table: the k of the last merge kept for each range',
      tables: [table('split', 'split[i][j]: the k kept', (i, j) => (split[i][j] < 0 ? null : String(split[i][j])), look.splitCells ?? {}, look.at)],
    };
    frames.push({
      line,
      caption,
      vars: look.vars,
      state: { label: `Interval DP on piles ${piles.join(', ')}`, dp: dpState, split: splitState, tree: tree(look.node) },
    });
  };

  if (n === 1) {
    treeRoot = nodeId(0, 0);
    snap(0, `One pile needs no merge: dp[0][0] = 0, and merge_piles returns 0 with no merges.`, { cells: { '0,0': 'done' }, node: treeRoot, vars: [['n', 1], ['cost', 0]] });
    return { frames, calls, dp: [[0]], split, cost: 0, merges };
  }

  snap(
    0,
    `dp[i][j] is the cheapest way to merge piles i..j into one pile. One pile needs no merge, so the diagonal is 0; the cells below it (i > j) are not used. ` +
      `With the prefix sums P = ${P.join(', ')}, sum(i..j) = P[j+1] - P[i].`,
    { vars: [['n', n], ['P', P.join(', ')]] },
  );

  for (let length = 2; length <= n; length++) {
    const cellsOfLength = Array.from({ length: n - length + 1 }, (_, i) => `dp[${i}][${i + length - 1}]`);
    snap(
      1,
      `Length ${length}: ${plural(cellsOfLength.length, 'range')} of ${length} piles, ${cellsOfLength.join(', ')}. ` +
        `Every split of such a range reads two shorter ranges, all filled on earlier diagonals.`,
      { vars: [['length', length]] },
    );
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      const s = sum(i, j);
      let best = Infinity;
      for (let k = i; k < j; k++) {
        const left = dp[i][k]!;
        const right = dp[k + 1][j]!;
        const cost = left + right + s;
        calls.push([i, k, j, best, cost]);
        const before = best;
        const better = cost < best;
        if (better) {
          best = cost;
          split[i][j] = k;
        }
        dp[i][j] = best;
        const verdict =
          before === Infinity
            ? `The first split tried, so it is the best so far: split[${i}][${j}] = ${k}.`
            : better
              ? `Less than ${before}, so it is kept: split[${i}][${j}] = ${k}.`
              : cost === before
                ? `Equal to ${before}: a tie keeps the smaller split, ${split[i][j]}.`
                : `More than ${before}: split[${i}][${j}] stays ${split[i][j]}.`;
        snap(
          better ? 5 : 4,
          `dp[${i}][${j}], last merge after pile ${k}: dp[${i}][${k}] + dp[${k + 1}][${j}] + sum(${i}..${j}) = ${left} + ${right} + ${s} = ${cost}. ${verdict}`,
          {
            cells: { [`${i},${k}`]: 'compare', [`${k + 1},${j}`]: 'compare', [`${i},${j}`]: 'active' },
            splitCells: { [`${i},${j}`]: 'active' },
            at: [i, j],
            piles: [i, j],
            vars: [['i', i], ['j', j], ['k', k], ['cost', cost], ['best', best]],
          },
        );
      }
      const k = split[i][j];
      snap(
        2,
        `dp[${i}][${j}] = ${best}, kept with split[${i}][${j}] = ${k}: the cheapest way to merge ${rangeName(i, j)} ends by joining ${rangeName(i, k)} with ${rangeName(k + 1, j)}.`,
        { cells: { [`${i},${j}`]: 'done' }, splitCells: { [`${i},${j}`]: 'done' }, at: [i, j], vars: [['i', i], ['j', j], ['dp[i][j]', best], ['split[i][j]', k]] },
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
        6,
        `split[${lo}][${hi}] = ${k}: ${rangeName(lo, hi)} (a pile of ${sum(lo, hi)}) is made by joining ${rangeName(lo, k)} with ${rangeName(k + 1, hi)}. ` +
          `Both parts are built first, the left one before the right one.`,
        { cells: { ...onTree(), [`${lo},${hi}`]: 'active' }, splitCells: { ...onTree(), [`${lo},${hi}`]: 'active' }, at: [lo, hi], piles: [lo, hi], node: id, vars: [['i', lo], ['j', hi], ['split[i][j]', k]] },
      );
    } else {
      merges.push([lo, k, hi]);
      merged.add(id);
      const total = merges.reduce((s, [i, , j]) => s + sum(i, j), 0);
      snap(
        7,
        `Merge ${rangeName(lo, k)} (size ${sum(lo, k)}) with ${rangeName(k + 1, hi)} (size ${sum(k + 1, hi)}): a pile of ${sum(lo, hi)}, which costs ${sum(lo, hi)}. ` +
          `Merged so far: ${total}.`,
        { cells: onTree(), splitCells: onTree(), at: [lo, hi], piles: [lo, hi], node: id, vars: [['merge', `(${lo}, ${k}, ${hi})`], ['cost', sum(lo, hi)], ['total', total]] },
      );
    }
  }
  snap(
    8,
    `Done: merge_piles returns dp[0][${n - 1}] = ${cost}, and the ${plural(merges.length, 'merge')} read back cost ${merges.map(([i, , j]) => sum(i, j)).join(' + ')} = ${cost}.`,
    { cells: onTree(), splitCells: onTree(), vars: [['cost', cost], ['merges', merges.length]] },
  );
  return { frames, calls, dp: dp.map((row) => row.map((v) => v ?? 0)), split, cost, merges };
}
