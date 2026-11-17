/**
 * DP pattern tracers, drawn with PatternLanes: the space-optimized rows of the repository code,
 * not full tables.
 *
 * Mirrors Problem_Patterns/DP_Problem_Patterns/Python/dp_patterns.py:
 *   knapsack_01: one array dp[0..capacity]; for each item, w runs from capacity DOWN to the
 *     item's weight and dp[w] = max(dp[w], dp[w - weight] + value). Going down, dp[w - weight]
 *     still holds the value from before this item, so each item is used at most once.
 *   lcs: swaps the strings so text1 is the longer one, keeps two rows prev and curr of
 *     len(text2) + 1 cells, fills curr left to right and copies it into prev (prev[:] = curr[:]);
 *     curr is never cleared.
 * lis (the tails array with bisect_left) is the same algorithm as Linear_DP's
 * lis_binary_search, so the topic page shows the existing 'lis-tails' visualization.
 * Golden fixtures (__fixtures__/patternsMore.json, sections "knapsack", "lcs", "lis") pin every
 * dp update, every curr row and the results.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { LaneArrow, LaneCellView, LaneMarker, PatternLanesState } from '../renderers/PatternLanes';
import type { StripItem } from '../ui/molecules/Strip';

/* ---------- 0/1 knapsack on one row ---------- */

export interface Knapsack1dInput {
  weights: number[];
  values: number[];
  capacity: number;
}

export const KNAPSACK_LIMITS = { maxCapacity: 15, maxItems: 6, maxWeight: 20, maxValue: 999 };

export function parseKnapsack1d(text: string): Knapsack1dInput {
  const m = text.match(/^\s*(?:W|cap(?:acity)?)\s*[=:]?\s*(-?\d+)\s*(?:;(.*))?$/i);
  if (!m) throw new InputError('Start with the capacity, then weight:value items: "W=7; 1:1, 3:4, 4:5, 5:7".');
  const capacity = Number(m[1]);
  if (capacity < 0) {
    throw new InputError(`Capacity ${capacity}: dp = [0] * (capacity + 1) is empty, so dp[capacity] raises IndexError in Python. Use 0 to ${KNAPSACK_LIMITS.maxCapacity}.`);
  }
  if (capacity > KNAPSACK_LIMITS.maxCapacity) throw new InputError(`Capacity goes up to ${KNAPSACK_LIMITS.maxCapacity} here, so the row fits on screen (got ${capacity}).`);
  const weights: number[] = [];
  const values: number[] = [];
  for (const raw of (m[2] ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
    const p = raw.match(/^(-?\d+)\s*:\s*(-?\d+)$/);
    if (!p) throw new InputError(`"${raw}" should look like weight:value, as in 3:4.`);
    const w = Number(p[1]);
    const v = Number(p[2]);
    if (w < 0) throw new InputError(`Item ${raw}: a negative weight makes Python read dp at a negative index (from the end of the list), so weights go from 0 to ${KNAPSACK_LIMITS.maxWeight}.`);
    if (w > KNAPSACK_LIMITS.maxWeight) throw new InputError(`Item ${raw}: weights go from 0 to ${KNAPSACK_LIMITS.maxWeight} here.`);
    if (v < 0 || v > KNAPSACK_LIMITS.maxValue) throw new InputError(`Item ${raw}: values go from 0 to ${KNAPSACK_LIMITS.maxValue} here.`);
    weights.push(w);
    values.push(v);
  }
  if (weights.length > KNAPSACK_LIMITS.maxItems) throw new InputError(`At most ${KNAPSACK_LIMITS.maxItems} items, please (got ${weights.length}).`);
  return { weights, values, capacity };
}

export const KNAPSACK_CODE = [
  'knapsack_01(weights, values, capacity):',
  '  dp = [0] * (capacity + 1)          # dp[w]: best value within capacity w so far',
  '  for i in range(len(weights)):',
  '    for w in range(capacity, weights[i] - 1, -1):   # downwards',
  '      dp[w] = max(dp[w], dp[w - weights[i]] + values[i])',
  '  return dp[capacity]',
];

/** One dp[w] = max(...) line: [item, w, old dp[w], dp[w - weight] + value], as the fixture records it. */
export type KnapsackUpdate = [number, number, number, number];

export interface Knapsack1dRun {
  frames: Array<Frame<PatternLanesState>>;
  updates: KnapsackUpdate[];
  result: number;
}

export function knapsack1dTrace({ weights, values, capacity }: Knapsack1dInput): Knapsack1dRun {
  const frames: Array<Frame<PatternLanesState>> = [];
  const updates: KnapsackUpdate[] = [];
  const dp = Array.from({ length: capacity + 1 }, () => 0);
  const header = dp.map((_, w) => String(w));
  let item = -1;

  const items = (): StripItem[] =>
    weights.length ? weights.map((w, i) => ({ text: `#${i} (w ${w}, v ${values[i]})`, role: i === item ? 'active' : i < item ? 'muted' : undefined })) : [{ text: '(none)' }];

  const snap = (line: number | undefined, caption: string, o: { roles?: Record<number, Role>; arrows?: LaneArrow[]; markers?: LaneMarker[]; headerRoles?: Record<number, Role>; vars?: Array<[string, string | number]> } = {}) => {
    const cells: LaneCellView[] = dp.map((v, w) => ({ id: `d${w}`, lane: 0, col: w, text: String(v), role: o.roles?.[w] }));
    frames.push({
      line,
      caption,
      vars: o.vars,
      state: {
        label: `dp = [${dp.join(', ')}]`,
        lanes: [{ label: 'dp[w]', sub: 'w = capacity', header, headerRoles: o.headerRoles }],
        cells,
        arrows: o.arrows,
        markers: o.markers,
        strips: [{ label: 'Items', items: items() }],
      },
    });
  };

  snap(1, `dp = [0] * ${capacity + 1}: with no items yet, the best value at every capacity 0..${capacity} is 0. One row is all the code keeps.`, { vars: [['capacity', capacity]] });

  weights.forEach((wi, i) => {
    item = i;
    const vi = values[i];
    if (wi > capacity) {
      snap(3, `Item #${i} weighs ${wi} > capacity ${capacity}: range(${capacity}, ${wi - 1}, -1) is empty, so no capacity can hold it and dp does not change.`, {
        roles: Object.fromEntries(dp.map((_, w) => [w, 'muted' as Role])),
        vars: [['i', i], ['weight', wi], ['value', vi]],
      });
      return;
    }
    const small: Record<number, Role> = {};
    for (let w = 0; w < wi; w++) small[w] = 'muted';
    snap(
      3,
      `Item #${i} (weight ${wi}, value ${vi}): w runs from ${capacity} down to ${wi}.` +
        (wi > 0 ? ` Capacities below ${wi} cannot hold it and keep their values.` : ' Its weight is 0, so every capacity can hold it.') +
        ' Going downwards means every dp[w - weight] it reads still holds the value from before this item.',
      { roles: small, vars: [['i', i], ['weight', wi], ['value', vi]] },
    );
    const rewritten: Record<number, Role> = {};
    for (let w = capacity; w >= wi; w--) {
      const old = dp[w];
      const read = dp[w - wi];
      const take = read + vi;
      updates.push([i, w, old, take]);
      const better = take > old;
      dp[w] = Math.max(old, take);
      const roles: Record<number, Role> = { ...small, ...rewritten, [w]: better ? 'active' : 'compare' };
      if (wi > 0) roles[w - wi] = 'compare';
      snap(
        4,
        `dp[${w}] = max(dp[${w}] = ${old}, dp[${w} - ${wi}] + ${vi} = ${read} + ${vi} = ${take}) = ${dp[w]}: ` +
          (better ? `taking item #${i} is better.` : take === old ? 'a tie, so the value stays.' : `skipping item #${i} is better.`) +
          (wi > 0 ? ` dp[${w - wi}] is left of w, so the downward loop has not rewritten it yet: item #${i} is not in it.` : ' With weight 0, dp[w - 0] is dp[w] itself, read before the write.'),
        {
          roles,
          arrows: wi > 0 ? [{ from: `d${w - wi}`, to: `d${w}`, role: better ? 'active' : 'compare', label: `+${vi}` }] : [],
          markers: [{ lane: 0, col: w, text: 'w', role: 'active' }],
          headerRoles: { [w]: 'active' },
          vars: [['i', i], ['w', w], ['dp[w] before', old], ['dp[w - weight] + value', take]],
        },
      );
      rewritten[w] = 'done';
    }
  });

  item = weights.length;
  snap(
    5,
    `Done: return dp[${capacity}] = ${dp[capacity]}, the best total value of items that fit in capacity ${capacity}. Each item updated the row once, from the top down.`,
    { roles: { [capacity]: 'done' }, vars: [['result', dp[capacity]]] },
  );
  return { frames, updates, result: dp[capacity] };
}

/* ---------- LCS on two rows ---------- */

export interface LcsRowsInput {
  a: string;
  b: string;
}

export const LCS_LIMITS = { maxLength: 10 };

export function parseLcsRows(text: string): LcsRowsInput {
  const parts = text.split('|');
  if (parts.length !== 2) throw new InputError('Write two strings separated by "|", as in "abcde | ace".');
  const [a, b] = parts.map((p) => p.trim());
  for (const s of [a, b]) {
    if (!/^[A-Za-z0-9]*$/.test(s)) throw new InputError(`"${s}": use letters and digits only.`);
    if (s.length > LCS_LIMITS.maxLength) throw new InputError(`Keep each string to ${LCS_LIMITS.maxLength} characters (got ${s.length}).`);
  }
  return { a, b };
}

export const LCS_CODE = [
  'lcs(text1, text2):',
  '  if len(text1) < len(text2): text1, text2 = text2, text1   # rows: the shorter string',
  '  m, n = len(text1), len(text2)',
  '  prev = [0] * (n + 1); curr = [0] * (n + 1)',
  '  for i in range(1, m + 1):',
  '    for j in range(1, n + 1):',
  '      if text1[i-1] == text2[j-1]: curr[j] = 1 + prev[j-1]',
  '      else: curr[j] = max(prev[j], curr[j-1])',
  '    prev[:] = curr[:]                 # curr is not cleared',
  '  return prev[n]',
];

export interface LcsRowsRun {
  frames: Array<Frame<PatternLanesState>>;
  /** The strings after the swap. */
  text1: string;
  text2: string;
  /** curr after every i (the value prev[:] = curr[:] copies). */
  rows: number[][];
  result: number;
}

export function lcsRowsTrace({ a, b }: LcsRowsInput): LcsRowsRun {
  const frames: Array<Frame<PatternLanesState>> = [];
  const swapped = a.length < b.length;
  const text1 = swapped ? b : a;
  const text2 = swapped ? a : b;
  const m = text1.length;
  const n = text2.length;
  const prev = Array.from({ length: n + 1 }, () => 0);
  const curr = Array.from({ length: n + 1 }, () => 0);
  // Cell ids carry a row generation: prev[:] = curr[:] hands curr's cells to prev, so they glide up.
  let prevGen = 0;
  let currGen = 1;
  let row = 0;
  // Which row of the full table each list holds: both start as row 0 (zeros).
  let prevRow = 0;
  let currRow = 0;
  const rows: number[][] = [];
  const header = ['-', ...text2.split('')];
  const q = (s: string) => `"${s}"`;

  const strip = (): StripItem[] => (m ? text1.split('').map((ch, k) => ({ text: ch, role: k === row - 1 ? 'active' : k < row - 1 ? 'muted' : undefined })) : [{ text: '(empty)' }]);

  const snap = (
    line: number | undefined,
    caption: string,
    o: { prev?: Record<number, Role>; curr?: Record<number, Role>; arrows?: LaneArrow[]; headerRoles?: Record<number, Role>; vars?: Array<[string, string | number]> } = {},
  ) => {
    const cells: LaneCellView[] = [
      ...prev.map((v, j) => ({ id: `r${prevGen}_${j}`, lane: 0, col: j, text: String(v), role: o.prev?.[j] })),
      ...curr.map((v, j) => ({ id: `r${currGen}_${j}`, lane: 1, col: j, text: String(v), role: o.curr?.[j] })),
    ];
    frames.push({
      line,
      caption,
      vars: o.vars,
      state: {
        label: `text1 ${q(text1)}, text2 ${q(text2)}, prev [${prev.join(', ')}], curr [${curr.join(', ')}]`,
        lanes: [
          { label: 'prev', sub: `row ${prevRow}`, header, headerRoles: o.headerRoles },
          { label: 'curr', sub: `row ${currRow}` },
        ],
        cells,
        arrows: o.arrows,
        strips: [{ label: 'text1 (one row per character)', items: strip() }],
      },
    });
  };

  snap(
    1,
    swapped
      ? `len(${q(a)}) < len(${q(b)}), so the strings swap: text1 = ${q(text1)} (rows), text2 = ${q(text2)} (columns). The rows only need len(text2) + 1 = ${n + 1} cells.`
      : `len(${q(a)}) >= len(${q(b)}): no swap. text1 = ${q(text1)} gives the rows and text2 = ${q(text2)} the ${n + 1} columns, the shorter string.`,
    { vars: [['m', m], ['n', n]] },
  );
  snap(3, `prev and curr start as ${n + 1} zeros: column 0 is the empty prefix of text2, and an LCS with an empty string is 0. Only these two rows of the m x n table exist.`, {
    vars: [['m', m], ['n', n]],
  });

  for (let i = 1; i <= m; i++) {
    row = i;
    if (n > 0) currRow = i;
    const ch = text1[i - 1];
    for (let j = 1; j <= n; j++) {
      const match = ch === text2[j - 1];
      const vars: Array<[string, string | number]> = [['i', i], ['j', j], ['text1[i-1]', ch], ['text2[j-1]', text2[j - 1]]];
      if (match) {
        curr[j] = 1 + prev[j - 1];
        snap(6, `${q(ch)} == ${q(text2[j - 1])}: the match extends the LCS of both shorter prefixes, curr[${j}] = 1 + prev[${j - 1}] = ${curr[j]}.`, {
          prev: { [j - 1]: 'compare' },
          curr: { [j]: 'active' },
          arrows: [{ from: `r${prevGen}_${j - 1}`, to: `r${currGen}_${j}`, role: 'active', label: '+1' }],
          headerRoles: { [j]: 'active' },
          vars,
        });
      } else {
        const up = prev[j];
        const left = curr[j - 1];
        curr[j] = Math.max(up, left);
        snap(
          7,
          `${q(ch)} != ${q(text2[j - 1])}: one of the two last characters is not in the LCS, so curr[${j}] = max(prev[${j}] = ${up}, curr[${j - 1}] = ${left}) = ${curr[j]}.` +
            (j === 1 ? '' : ` curr[${j - 1}] was written a moment ago in this row.`),
          {
            prev: { [j]: 'compare' },
            curr: { [j - 1]: 'compare', [j]: 'active' },
            arrows: [
              { from: `r${prevGen}_${j}`, to: `r${currGen}_${j}`, role: 'compare' },
              { from: `r${currGen}_${j - 1}`, to: `r${currGen}_${j}`, role: 'compare', label: 'max' },
            ],
            headerRoles: { [j]: 'compare' },
            vars,
          },
        );
      }
    }
    rows.push([...curr]);
    // prev[:] = curr[:]: the finished row glides up; curr keeps the same values.
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
    prevRow = i;
    currRow = i;
    prevGen = currGen;
    currGen += 1;
    snap(
      8,
      `Row ${i} (${q(ch)}) is done. prev[:] = curr[:] copies it up for the next character; curr is not cleared, but every curr[j] with j >= 1 is overwritten before it is read.`,
      { prev: Object.fromEntries(prev.map((_, j) => [j, 'done' as Role])), vars: [['i', i]] },
    );
  }
  row = m + 1;
  snap(9, `Done: return prev[${n}] = ${prev[n]}, the length of a longest common subsequence of ${q(a)} and ${q(b)}. Two rows of ${n + 1} cells replaced a ${m + 1} x ${n + 1} table.`, {
    prev: { [n]: 'done' },
    vars: [['result', prev[n]]],
  });
  return { frames, text1, text2, rows, result: prev[n] };
}
