/**
 * Greedy tracers: activity selection (earliest finish first) and the fractional
 * knapsack (highest value per unit of weight first).
 *
 * Both mirror the repository's Python code, tie-breaking included, and golden
 * fixtures (scripts/gen_greedy_fixtures.py) pin them to it:
 *   Algorithms/Greedy/Activity_Selection/Python/activity_selection.py (activity_selection)
 *   Algorithms/Greedy/Fractional_Knapsack/Python/fractional_knapsack.py (fractional_knapsack)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { IntervalTimelineState, IntervalView } from '../renderers/IntervalTimeline';
import { fmtNum, fmtRatio, type KnapsackFillState, type KnapsackItemView } from '../renderers/KnapsackFill';
import type { StripItem } from '../ui/molecules/Strip';

const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

// ---------------------------------------------------------------- activity selection

export interface Activity {
  /** 0-based position in the input, like the indices the Python code returns. */
  id: number;
  start: number;
  finish: number;
}

export interface ActivityRun {
  frames: Array<Frame<IntervalTimelineState>>;
  /** Selected activity ids in selection order. */
  selected: number[];
}

export function parseActivities(text: string, { max = 14, lo = -99, hi = 999 } = {}): Activity[] {
  const tokens = text
    .split(/[,;\n]+/)
    .map((t) => t.replace(/\s+/g, ''))
    .filter(Boolean);
  if (tokens.length === 0) throw new InputError('Enter activities as start-finish pairs, e.g. "1-4, 3-5, 0-6".');
  if (tokens.length > max) throw new InputError(`At most ${max} activities, please (got ${tokens.length}).`);
  return tokens.map((t, id) => {
    const m = t.match(/^(-?\d+)(?:-|:|\.\.)(-?\d+)$/);
    if (!m) throw new InputError(`Cannot read "${t}". Write each activity as start-finish, e.g. "3-5" (negative times like "-4--2").`);
    const start = Number(m[1]);
    const finish = Number(m[2]);
    for (const v of [start, finish]) {
      if (v < lo || v > hi) throw new InputError(`${v} is outside the supported time range ${lo}..${hi}.`);
    }
    if (start >= finish) throw new InputError(`Activity "${t}" must start before it finishes.`);
    return { id, start, finish };
  });
}

export function activityRun(acts: Activity[]): ActivityRun {
  const frames: Array<Frame<IntervalTimelineState>> = [];
  const lane = new Map(acts.map((a) => [a.id, a.id]));
  const role = new Map<number, Role>(acts.map((a) => [a.id, 'idle']));
  const selected: number[] = [];
  let lastFinish: number | undefined;
  let note = 'lanes in input order';
  const name = (a: Activity) => `#${a.id}`;
  const span = (a: Activity) => `[${a.start}, ${a.finish})`;

  const push = (
    line: number | undefined,
    caption: string,
    extra: { focus?: number; focusRole?: Role; conflict?: IntervalView['conflict'] } = {},
    vars: Array<[string, string | number]> = [],
  ) => {
    const intervals = acts.map(
      (a): IntervalView => ({
        id: a.id,
        label: String(a.id),
        start: a.start,
        end: a.finish,
        lane: lane.get(a.id)!,
        role: a.id === extra.focus && extra.focusRole ? extra.focusRole : role.get(a.id)!,
        conflict: a.id === extra.focus ? extra.conflict : undefined,
      }),
    );
    const chosen = selected.map((id): StripItem => ({ text: `#${id} ${span(acts[id])}`, role: 'done' }));
    frames.push({
      line,
      caption,
      vars: [...vars, ['last_finish', lastFinish ?? '-'], ['selected', selected.length]],
      state: {
        intervals,
        note,
        marker: lastFinish === undefined ? undefined : { at: lastFinish, label: `last_finish = ${lastFinish}` },
        strips: [{ label: 'Selected', items: chosen.length ? chosen : [{ text: '(none yet)' }] }],
      },
    });
  };

  push(
    undefined,
    `${plural(acts.length, 'activity', 'activities')} in input order. Each bar is [start, finish): one person can do one activity at a time, and the next may start exactly when the last one finishes.`,
  );

  // sorted(enumerate(activities), key=finish) is stable: equal finish times keep input order.
  const sorted = [...acts].sort((a, b) => a.finish - b.finish);
  sorted.forEach((a, k) => lane.set(a.id, k));
  note = 'lanes sorted by finish time';
  const ties = sorted.some((a, k) => k > 0 && sorted[k - 1].finish === a.finish);
  push(
    0,
    `Sort by finish time${ties ? ' (equal finish times keep their input order)' : ''}. Why finish time? The activity that ends first leaves the most room for everything after it.`,
  );

  const first = sorted[0];
  selected.push(first.id);
  lastFinish = first.finish;
  role.set(first.id, 'done');
  push(
    1,
    `${name(first)} ${span(first)} finishes first: select it. Exchange argument: any optimal schedule can swap its first activity for ${name(first)}, which ends no later, so nothing after it breaks.`,
    { focus: first.id, focusRole: 'good' },
    [['activity', name(first)], ['start', first.start], ['finish', first.finish]],
  );

  for (const a of sorted.slice(1)) {
    const lf = lastFinish;
    const actVars: Array<[string, string | number]> = [['activity', name(a)], ['start', a.start], ['finish', a.finish]];
    push(3, `Next by finish time: ${name(a)} ${span(a)}. It fits only if it starts at or after last_finish = ${lf}.`, { focus: a.id, focusRole: 'compare' }, actVars);
    if (a.start >= lf) {
      selected.push(a.id);
      lastFinish = a.finish;
      role.set(a.id, 'done');
      push(
        4,
        `${a.start} >= ${lf}: ${name(a)} starts after the last selected activity ends. Select it; last_finish = ${a.finish}. Among the activities that still fit, it ends first, so it again leaves the most room.`,
        { focus: a.id, focusRole: 'good' },
        actVars,
      );
    } else {
      const last = acts[selected[selected.length - 1]];
      role.set(a.id, 'muted');
      push(
        5,
        `${a.start} < ${lf}: ${name(a)} overlaps ${name(last)} (busy until ${lf}). Skip it: keeping ${name(last)} is never worse, because it finishes no later than ${name(a)}.`,
        { focus: a.id, focusRole: 'bad', conflict: { from: a.start, to: Math.min(a.finish, lf) } },
        actVars,
      );
    }
  }

  push(
    undefined,
    `Done: ${plural(selected.length, 'activity', 'activities')} selected (${selected.map((id) => `#${id}`).join(', ')}). No schedule fits more: after every pick, greedy's last finish time is the earliest any schedule with that many activities can reach ("greedy stays ahead").`,
  );
  return { frames, selected };
}

export const activitySelection = (acts: Activity[]) => activityRun(acts).frames;

// ---------------------------------------------------------------- fractional knapsack

export interface KnapsackItem {
  id: number;
  weight: number;
  value: number;
}

export interface FractionalInput {
  capacity: number;
  items: KnapsackItem[];
}

export interface FractionalRun {
  frames: Array<Frame<KnapsackFillState>>;
  total: number;
  /** Like the Python result: (value, weight, fraction) in packing order. */
  selected: Array<{ id: number; value: number; weight: number; fraction: number }>;
}

/** Same notation as the 0/1 knapsack visualization: "W=50; 10:60, 20:100" (weight:value). */
export function parseFractional(text: string, { maxCapacity = 500, maxItems = 8, maxWeight = 200, maxValue = 999 } = {}): FractionalInput {
  const m = text.match(/^\s*W\s*=\s*(\d+)\s*;(.*)$/i);
  if (!m) throw new InputError('Start with the capacity, then weight:value pairs, e.g. "W=50; 10:60, 20:100, 30:120".');
  const capacity = Number(m[1]);
  if (capacity < 1 || capacity > maxCapacity) throw new InputError(`Capacity must be between 1 and ${maxCapacity}.`);
  const parts = m[2]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0 || parts.length > maxItems) throw new InputError(`Give between 1 and ${maxItems} items.`);
  const items = parts.map((s, id) => {
    const p = s.match(/^(\d+)\s*:\s*(\d+)$/);
    if (!p) throw new InputError(`"${s}" should look like weight:value, e.g. 10:60.`);
    const weight = Number(p[1]);
    const value = Number(p[2]);
    if (weight > maxWeight || value > maxValue) throw new InputError(`Item ${s}: weight 0..${maxWeight}, value 0..${maxValue}.`);
    return { id, weight, value };
  });
  return { capacity, items };
}

/** Best value with whole items only (0/1 knapsack), by trying every subset: at most 2^8. */
export function bestWholeItems(items: KnapsackItem[], capacity: number): { value: number; ids: number[] } {
  let best = { value: 0, ids: [] as number[] };
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let w = 0;
    let v = 0;
    const ids: number[] = [];
    items.forEach((it, k) => {
      if (mask & (1 << k)) {
        w += it.weight;
        v += it.value;
        ids.push(it.id);
      }
    });
    if (w <= capacity && v > best.value) best = { value: v, ids };
  }
  return best;
}

export function fractionalRun({ capacity, items }: FractionalInput): FractionalRun {
  const frames: Array<Frame<KnapsackFillState>> = [];
  // items_with_ratio = (v, w, v / w if w else inf): a weight-0 item is free.
  const ratio = new Map(items.map((it) => [it.id, it.weight ? it.value / it.weight : Infinity]));
  let order = items.map((it) => it.id);
  const taken = new Map<number, number>(items.map((it) => [it.id, 0]));
  const role = new Map<number, Role>(items.map((it) => [it.id, 'idle']));
  const packed: number[] = [];
  const selected: FractionalRun['selected'] = [];
  let total = 0;
  let remaining = capacity;
  let extraStrips: KnapsackFillState['strips'] = [];
  const byId = new Map(items.map((it) => [it.id, it]));
  const name = (id: number) => `#${id + 1}`;

  const push = (line: number | undefined, caption: string, focus?: { id: number; role: Role }, vars: Array<[string, string | number]> = []) => {
    const views = order.map((id): KnapsackItemView => {
      const it = byId.get(id)!;
      return {
        id,
        label: name(id),
        weight: it.weight,
        value: it.value,
        ratio: ratio.get(id)!,
        taken: taken.get(id)!,
        role: focus?.id === id ? focus.role : role.get(id)!,
      };
    });
    const bag = packed.map((id): StripItem => {
      const t = taken.get(id)!;
      const it = byId.get(id)!;
      return { text: `${name(id)} ${t === 1 ? 'all' : `${fmtNum(t * it.weight)} of ${it.weight}`}`, role: 'done' };
    });
    frames.push({
      line,
      caption,
      vars: [...vars, ['remaining', fmtNum(remaining)], ['total value', fmtNum(total)]],
      state: {
        capacity,
        items: views,
        packed: [...packed],
        strips: [{ label: `Knapsack (value ${fmtNum(total)})`, items: bag.length ? bag : [{ text: '(empty)' }] }, ...(extraStrips ?? [])],
      },
    });
  };

  const zeroWeight = items.filter((it) => it.weight === 0);
  push(
    0,
    `Work out each item's value per unit of weight${zeroWeight.length ? ` (${zeroWeight.map((it) => name(it.id)).join(', ')} weigh${zeroWeight.length === 1 ? 's' : ''} 0: free, so infinite value per unit)` : ''}. In the picture, width = weight and height = value per unit, so each block's area is its value.`,
  );

  // sort(key=ratio, reverse=True) is stable: equal ratios keep their input order.
  order = [...order].sort((a, b) => (ratio.get(a)! === ratio.get(b)! ? 0 : ratio.get(a)! > ratio.get(b)! ? -1 : 1));
  push(
    1,
    `Sort by value per unit, highest first, and start with remaining = ${capacity}. Greedy idea: every unit of capacity should hold the most valuable stuff still available.`,
  );

  for (let k = 0; k < order.length; k++) {
    const id = order[k];
    const it = byId.get(id)!;
    const r = ratio.get(id)!;
    const itemVars: Array<[string, string | number]> = [['item', name(id)], ['weight', it.weight], ['value', it.value], ['value/weight', fmtRatio(r)]];
    if (remaining <= 0) {
      const left = order.slice(k);
      left.forEach((x) => role.set(x, 'muted'));
      push(3, `remaining = 0: the knapsack is full, so stop. ${left.map(name).join(', ')} ${left.length === 1 ? 'stays' : 'stay'} out.`);
      break;
    }
    push(
      2,
      `Next best value per unit: ${name(id)} (weight ${it.weight}, value ${it.value}, ${fmtRatio(r)} per unit). Remaining capacity: ${fmtNum(remaining)}.`,
      { id, role: 'compare' },
      itemVars,
    );
    if (it.weight <= remaining) {
      total += it.value;
      remaining -= it.weight;
      taken.set(id, 1);
      packed.push(id);
      selected.push({ id, value: it.value, weight: it.weight, fraction: 1 });
      role.set(id, 'done');
      push(
        4,
        it.weight === 0
          ? `${name(id)} weighs 0: it costs no capacity, so take all of it for free (+${it.value}).`
          : `${it.weight} <= ${fmtNum(remaining + it.weight)}: the whole item fits. Take all of it (+${it.value}); remaining = ${fmtNum(remaining)}.`,
        { id, role: 'active' },
        itemVars,
      );
    } else {
      const fraction = remaining / it.weight;
      const gained = it.value * fraction;
      total += gained;
      const part = remaining;
      remaining = 0;
      taken.set(id, fraction);
      packed.push(id);
      selected.push({ id, value: it.value, weight: it.weight, fraction });
      role.set(id, 'done');
      push(
        5,
        `${it.weight} > ${fmtNum(part)}: only ${fmtNum(part)} of ${it.weight} fits. Take that fraction, ${fmtNum(part)}/${it.weight} of the value: ${it.value} x ${fmtNum(part)}/${it.weight} = ${fmtNum(gained)}. The knapsack is now full.`,
        { id, role: 'active' },
        itemVars,
      );
    }
  }

  // Contrast with 0/1 knapsack: whole items only.
  const whole = bestWholeItems(items, capacity);
  let greedyWhole = 0;
  let room = capacity;
  for (const id of order) {
    const it = byId.get(id)!;
    if (it.weight <= room) {
      greedyWhole += it.value;
      room -= it.weight;
    }
  }
  extraStrips = [
    {
      label: '0/1 knapsack (whole items)',
      items: [
        { text: `best ${whole.value}: ${whole.ids.length ? whole.ids.map(name).join(' + ') : 'nothing fits'}` },
        { text: `greedy by ratio: ${greedyWhole}` },
      ],
    },
  ];
  const fractionalUsed = selected.some((s) => s.fraction < 1);
  push(
    undefined,
    `Done: total value ${fmtNum(total)}. Exchange argument: swapping any unit of a denser item out for a unit of a less dense one can only lose value, so this is optimal.${
      fractionalUsed
        ? ` With whole items only (0/1 knapsack) the best is ${whole.value}${greedyWhole < whole.value ? `, and greedy by ratio gets just ${greedyWhole}: there greedy fails and the DP is needed` : ''}.`
        : ' No item had to be cut, so the 0/1 answer is the same here.'
    }`,
  );
  return { frames, total, selected };
}

export const fractionalKnapsack = (input: FractionalInput) => fractionalRun(input).frames;
