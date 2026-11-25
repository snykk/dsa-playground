/**
 * Unbounded Knapsack tracer, drawn with PatternLanes (through UnboundedKnapsackView).
 *
 * Mirrors Algorithms/Dynamic_Programming/Linear_DP/Unbounded_Knapsack/Python/unbounded_knapsack.py:
 *   _fill_row: dp = [0] * (W + 1) and choice = [-1] * (W + 1); for each item in input order, w
 *     runs UP from the item's weight to W (unbounded_knapsack) or DOWN from W to the weight
 *     (zero_one_knapsack), and _relax sets dp[w] = dp[w - weight] + value and choice[w] = item
 *     only on a strict gain.
 *   unbounded_knapsack_items: from w = W, take choice[w] and subtract its weight, until
 *     choice[w] is -1.
 * Golden fixtures (__fixtures__/dynamicProgramming.json, section "unboundedKnapsack") pin every
 * _relax call (item, w, old dp[w], candidate), the final dp and choice rows and the result, in
 * both directions, and the counts the walk returns.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { LaneArrow, LaneCellView, LaneMarker, PatternLanesState } from '../renderers/PatternLanes';
import type { StripData, StripItem } from '../ui/molecules/Strip';

export interface UnboundedKnapsackInput {
  weights: number[];
  values: number[];
  capacity: number;
}

export const UNBOUNDED_LIMITS = { maxCapacity: 12, maxItems: 5, maxWeight: 12, maxValue: 99 };

export function parseUnboundedKnapsack(text: string): UnboundedKnapsackInput {
  const m = text.match(/^\s*(?:W|cap(?:acity)?)\s*[=:]?\s*(-?\d+)\s*(?:;(.*))?$/i);
  if (!m) throw new InputError('Start with the capacity, then weight:value items: "W=10; 1:1, 3:4, 4:5, 5:7".');
  const capacity = Number(m[1]);
  if (capacity < 0) throw new InputError(`Capacity ${capacity}: the code raises ValueError for a capacity below 0. Use 0 to ${UNBOUNDED_LIMITS.maxCapacity}.`);
  if (capacity > UNBOUNDED_LIMITS.maxCapacity) throw new InputError(`Capacity goes up to ${UNBOUNDED_LIMITS.maxCapacity} here, so the row fits on screen (got ${capacity}).`);
  const weights: number[] = [];
  const values: number[] = [];
  for (const raw of (m[2] ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
    const p = raw.match(/^(-?\d+)\s*:\s*(-?\d+)$/);
    if (!p) throw new InputError(`"${raw}" should look like weight:value, as in 3:4.`);
    const w = Number(p[1]);
    const v = Number(p[2]);
    if (w < 1) throw new InputError(`Item ${raw}: an item of weight ${w} could be taken without end, so the code raises ValueError for every weight below 1.`);
    if (w > UNBOUNDED_LIMITS.maxWeight) throw new InputError(`Item ${raw}: weights go from 1 to ${UNBOUNDED_LIMITS.maxWeight} here.`);
    if (v < 0 || v > UNBOUNDED_LIMITS.maxValue) throw new InputError(`Item ${raw}: values go from 0 to ${UNBOUNDED_LIMITS.maxValue} here.`);
    weights.push(w);
    values.push(v);
  }
  if (weights.length > UNBOUNDED_LIMITS.maxItems) throw new InputError(`At most ${UNBOUNDED_LIMITS.maxItems} items, please (got ${weights.length}).`);
  return { weights, values, capacity };
}

export const UNBOUNDED_CODE = [
  'dp = [0] * (W + 1); choice = [-1] * (W + 1)',
  'for i in range(len(weights)):',
  '  for w in range(weights[i], W + 1):      # up: dp[w - weight] may hold item i',
  '    if dp[w - weights[i]] + values[i] > dp[w]:',
  '      dp[w] = dp[w - weights[i]] + values[i]; choice[w] = i',
  'w = W                                    # read the items back',
  'while choice[w] != -1: counts[choice[w]] += 1; w -= weights[choice[w]]',
  'return dp[W], counts',
];

export const DOWNWARD_CODE = [
  'dp = [0] * (W + 1)',
  'for i in range(len(weights)):',
  '  for w in range(W, weights[i] - 1, -1):   # down: dp[w - weight] is the old value',
  '    if dp[w - weights[i]] + values[i] > dp[w]:',
  '      dp[w] = dp[w - weights[i]] + values[i]',
  'return dp[W]',
];

/** One _relax call: [item, w, old dp[w], dp[w - weight] + value], as the fixture records it. */
export type RelaxCall = [number, number, number, number];

export interface UnboundedRun {
  frames: Array<Frame<PatternLanesState>>;
  relaxations: RelaxCall[];
  dp: number[];
  choice: number[];
  /** counts[i]: copies of item i read back from choice[] (going up only; empty going down). */
  counts: number[];
  value: number;
}

/** The row and the choices without frames: what _fill_row returns. */
export function fillRow({ weights, values, capacity }: UnboundedKnapsackInput, upward: boolean): { dp: number[]; choice: number[] } {
  const dp = Array.from({ length: capacity + 1 }, () => 0);
  const choice = Array.from({ length: capacity + 1 }, () => -1);
  weights.forEach((wt, i) => {
    const relax = (w: number) => {
      const cand = dp[w - wt] + values[i];
      if (cand > dp[w]) {
        dp[w] = cand;
        choice[w] = i;
      }
    };
    if (upward) for (let w = wt; w <= capacity; w++) relax(w);
    else for (let w = capacity; w >= wt; w--) relax(w);
  });
  return { dp, choice };
}

const copies = (n: number) => (n === 1 ? '1 copy' : `${n} copies`);

/** Copies of item `item` in the multiset that the walk from w reads back from choice[]. */
function copiesIn(choice: number[], weights: number[], w: number, item: number): number {
  let n = 0;
  for (let x = w; choice[x] !== -1; x -= weights[choice[x]]) if (choice[x] === item) n++;
  return n;
}

export function unboundedKnapsackTrace(input: UnboundedKnapsackInput, upward: boolean): UnboundedRun {
  const { weights, values, capacity } = input;
  const frames: Array<Frame<PatternLanesState>> = [];
  const relaxations: RelaxCall[] = [];
  const dp = Array.from({ length: capacity + 1 }, () => 0);
  const choice = Array.from({ length: capacity + 1 }, () => -1);
  const header = dp.map((_, w) => String(w));
  const code = upward ? UNBOUNDED_CODE : DOWNWARD_CODE;
  const doneLine = code.length - 1;
  let item = -1;
  let taken: StripItem[] | null = null;
  // The other direction on the same input, for the closing comparison.
  const other = fillRow(input, !upward).dp[capacity];

  const itemStrip = (): StripItem[] =>
    weights.length ? weights.map((w, i) => ({ text: `#${i} (${w}, ${values[i]})`, role: i === item ? ('active' as Role) : undefined })) : [{ text: '(none)' }];

  const snap = (
    line: number | undefined,
    caption: string,
    o: { roles?: Record<number, Role>; choiceRoles?: Record<number, Role>; arrows?: LaneArrow[]; markers?: LaneMarker[]; headerRoles?: Record<number, Role>; vars?: Array<[string, string | number]> } = {},
  ) => {
    const cells: LaneCellView[] = dp.map((v, w) => ({ id: `d${w}`, lane: 0, col: w, text: String(v), role: o.roles?.[w] }));
    if (upward) choice.forEach((c, w) => cells.push({ id: `c${w}`, lane: 1, col: w, text: c === -1 ? '-' : `#${c}`, role: o.choiceRoles?.[w] }));
    const strips: StripData[] = [{ label: 'Items (weight, value)', items: itemStrip() }];
    if (taken) strips.push({ label: 'Taken', items: taken.length ? taken : [{ text: '(nothing)' }] });
    frames.push({
      line,
      caption,
      vars: o.vars,
      state: {
        label: `dp = [${dp.join(', ')}]` + (upward ? `, choice = [${choice.join(', ')}]` : ''),
        lanes: [
          { label: 'dp[w]', sub: 'best within w', header, headerRoles: o.headerRoles },
          ...(upward ? [{ label: 'choice[w]', sub: 'item that set it' }] : []),
        ],
        cells,
        arrows: o.arrows,
        markers: o.markers,
        strips,
      },
    });
  };

  snap(
    0,
    `dp[w] is the best value of items that fit in capacity w. With no items yet it is 0 for every w from 0 to ${capacity}` +
      (upward ? ', and choice[w] = -1 (shown as -): no item has raised it.' : '.') +
      ` The row is filled one item at a time, w going ${upward ? 'up' : 'down'}.`,
    { vars: [['W', capacity], ['items', weights.length]] },
  );

  weights.forEach((wt, i) => {
    item = i;
    const vi = values[i];
    if (wt > capacity) {
      snap(2, `Item #${i} weighs ${wt}, more than the capacity ${capacity}: its range of w is empty, so no capacity can hold it and the row does not change.`, {
        vars: [['i', i], ['weight', wt], ['value', vi]],
      });
      return;
    }
    snap(
      1,
      `Item #${i} (weight ${wt}, value ${vi}): w runs from ${upward ? `${wt} up to ${capacity}` : `${capacity} down to ${wt}`}.` +
        (wt > 1 ? ` Capacities below ${wt} cannot hold it and keep their values.` : '') +
        (upward
          ? ' Going up, the cells to the left of w are updated first, so dp[w - weight] may already contain this item.'
          : ' Going down, the cells to the left of w are updated last, so dp[w - weight] still holds the value from before this item.'),
      { vars: [['i', i], ['weight', wt], ['value', vi]] },
    );
    const visited: Record<number, Role> = {};
    for (let k = 0; k <= capacity - wt; k++) {
      const w = upward ? wt + k : capacity - k;
      const rest = w - wt;
      const old = dp[w];
      const read = dp[rest];
      const cand = read + vi;
      relaxations.push([i, w, old, cand]);
      // Copies of this item in the cell read: only going up can it be there already.
      const held = upward ? copiesIn(choice, weights, rest, i) : 0;
      const better = cand > old;
      if (better) {
        dp[w] = cand;
        choice[w] = i;
      }
      const roles: Record<number, Role> = { ...visited, [rest]: 'compare', [w]: better ? 'active' : 'compare' };
      const choiceRoles: Record<number, Role> = better ? { [w]: 'active' } : {};
      if (held > 0) choiceRoles[rest] = 'compare';
      const verdict = better
        ? `taking item #${i} is better, so dp[${w}] = ${cand}${upward ? ` and choice[${w}] = #${i}` : ''}.`
        : cand === old
          ? `a tie, and only a strict gain changes dp[${w}], so it stays ${old}.`
          : `not taking item #${i} is better, so dp[${w}] stays ${old}.`;
      const reuse = upward
        ? held > 0
          ? ` dp[${rest}] already holds ${copies(held)} of item #${i}, put there earlier in this pass, so taking it here makes ${held + 1} copies.`
          : ` dp[${rest}] holds no copy of item #${i}.`
        : ` dp[${rest}] is left of w, where the downward loop has not been yet, so it still holds the value from before item #${i}: the item is used at most once.`;
      snap(better ? 4 : 3, `dp[${w}] = max(dp[${w}] = ${old}, dp[${rest}] + ${vi} = ${read} + ${vi} = ${cand}): ${verdict}${reuse}`, {
        roles,
        choiceRoles,
        arrows: [{ from: `d${rest}`, to: `d${w}`, role: better ? 'active' : 'compare', label: `+${vi}` }],
        markers: [
          { lane: 0, col: w, text: 'w', role: 'active' },
          { lane: 0, col: rest, text: `w-${wt}`, role: 'compare' },
        ],
        headerRoles: { [w]: 'active' },
        vars: [['i', i], ['w', w], ['dp[w] before', old], ['dp[w - weight] + value', cand]],
      });
      visited[w] = 'done';
    }
  });

  item = weights.length;
  const counts: number[] = [];
  if (!upward) {
    snap(
      doneLine,
      `Done: dp[${capacity}] = ${dp[capacity]}, the best value with each item used at most once: the 0/1 knapsack. ` +
        (other > dp[capacity]
          ? `Going up on the same input gives ${other}, because it may take an item again.`
          : `Going up on the same input gives the same ${other}: here no item is worth taking twice.`),
      { roles: { [capacity]: 'done' }, vars: [['result', dp[capacity]]] },
    );
    return { frames, relaxations, dp, choice, counts, value: dp[capacity] };
  }

  snap(
    5,
    `The row is full: dp[${capacity}] = ${dp[capacity]} is the best value within capacity ${capacity}. ` +
      (other < dp[capacity] ? `Going down on the same input gives only ${other}. ` : `Going down on the same input also gives ${other}. `) +
      `To find the items, start at w = ${capacity} and follow choice[w].`,
    { roles: { [capacity]: 'done' }, choiceRoles: { [capacity]: 'compare' }, vars: [['dp[W]', dp[capacity]]] },
  );
  weights.forEach(() => counts.push(0));
  taken = [];
  const path: Record<number, Role> = {};
  let w = capacity;
  while (choice[w] !== -1) {
    const c = choice[w];
    counts[c]++;
    path[w] = 'done';
    taken = counts.flatMap((n, j) => (n ? [{ text: `${n} x #${j}`, role: 'done' as Role }] : []));
    snap(
      6,
      `choice[${w}] = #${c}: take one copy of item #${c} (weight ${weights[c]}, value ${values[c]}) and go on from w = ${w} - ${weights[c]} = ${w - weights[c]}.`,
      {
        roles: { ...path, [w - weights[c]]: 'compare' },
        choiceRoles: { ...path, [w]: 'active' },
        arrows: [{ from: `c${w}`, to: `d${w - weights[c]}`, role: 'done' }],
        vars: [['w', w], ['choice[w]', c], ['copies of #' + c, counts[c]]],
      },
    );
    w -= weights[c];
  }
  path[w] = 'done';
  const weightUsed = counts.reduce((s, n, j) => s + n * weights[j], 0);
  const valueUsed = counts.reduce((s, n, j) => s + n * values[j], 0);
  snap(
    doneLine,
    `choice[${w}] = -1: stop. ` +
      (taken.length
        ? `The items taken weigh ${weightUsed} of ${capacity} and are worth ${valueUsed} = dp[${capacity}].` +
          (weightUsed < capacity ? ` dp[w] is the best value within w, so ${capacity - weightUsed} of the capacity stays empty.` : '')
        : `No item fits or is worth taking, so the bag stays empty and the value is 0.`),
    { roles: { ...path }, choiceRoles: { [w]: 'compare' }, vars: [['value', dp[capacity]], ['weight', weightUsed]] },
  );
  return { frames, relaxations, dp, choice, counts, value: dp[capacity] };
}
