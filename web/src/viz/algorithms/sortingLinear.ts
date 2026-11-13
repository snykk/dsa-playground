/**
 * Step tracers for the linear-time (distribution) sorts: counting sort, LSD radix
 * sort and bucket sort. They mirror the Python implementations in
 * Algorithms/Sorting/{Counting Sort,Radix Sort,Bucket Sort}/Python (pinned by the
 * golden fixtures in __fixtures__/sortingLinear.json) and record BucketScene
 * snapshots: the input as bars, auxiliary rows and the bins that fill up.
 *
 * Every tracer ends with a frame whose bars hold the sorted array, all marked done.
 * None of them compares two values with each other (except the insertion sort that
 * finishes each bucket), which is the point of these algorithms.
 */
import { InputError, parseIntList, randomInts, type Frame, type Role } from '../core/types';
import type { BarItem } from '../renderers/ArrayBars';
import type { Bin, BinCell, BucketSceneState } from '../renderers/BucketScene';
import type { SceneCell } from '../renderers/ArrayScene';

export type LinearFrame = Frame<BucketSceneState>;
type Vars = Array<[string, string | number]>;

// ---------------------------------------------------------------- input helpers

export const COUNTING_MAX_SPREAD = 24;

/** 2 to 16 whole numbers (negatives allowed) at most COUNTING_MAX_SPREAD apart. */
export function parseCountingInput(text: string): number[] {
  const values = parseIntList(text, { min: 2, max: 16 });
  const spread = Math.max(...values) - Math.min(...values);
  if (spread > COUNTING_MAX_SPREAD) {
    throw new InputError(
      `Counting sort needs one count slot per possible value, so the largest and smallest value may be at most ${COUNTING_MAX_SPREAD} apart (yours are ${spread}).`,
    );
  }
  return values;
}

export function randomCountingInput(): string {
  const lo = Math.random() < 0.3 ? -5 : 0;
  return randomInts(8 + Math.floor(Math.random() * 6), lo, lo + 9).join(', ');
}

export function parseRadixInput(text: string): number[] {
  return parseIntList(text, { min: 2, max: 16 });
}

export function randomRadixInput(): string {
  return randomInts(8 + Math.floor(Math.random() * 6), 0, 999).join(', ');
}

/** 2 to 16 decimals in [0, 1], e.g. "0.78 .17 1". */
export function parseUnitInput(text: string): number[] {
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  if (tokens.length < 2 || tokens.length > 16) throw new InputError(`Enter between 2 and 16 values (got ${tokens.length}).`);
  return tokens.map((t) => {
    if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) throw new InputError(`"${t}" is not a decimal number between 0 and 1.`);
    const v = Number(t);
    if (v > 1) throw new InputError(`${t} is above 1.0: bucket sort here expects values in [0, 1].`);
    return v;
  });
}

export function randomUnitInput(): string {
  const n = 8 + Math.floor(Math.random() * 6);
  return Array.from({ length: n }, () => (Math.floor(Math.random() * 100) / 100).toFixed(2)).join(', ');
}

// ---------------------------------------------------------------- shared helpers

const bars = (items: BarItem[], roles: Role[], pointers?: Record<number, string>) => ({ items: items.map((it) => ({ ...it })), roles, pointers });

const cells = (values: Array<number | null>, roleOf: (i: number) => Role | undefined): SceneCell[] =>
  values.map((value, i) => ({ value, role: roleOf(i) }));

// ---------------------------------------------------------------- counting sort

export function countingSort(values: number[]): LinearFrame[] {
  const n = values.length;
  const frames: LinearFrame[] = [];
  const items: BarItem[] = values.map((value, id) => ({ id, value }));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const k = max - min + 1;
  const count = new Array<number>(k).fill(0);
  const output = new Array<number | null>(n).fill(null);
  const outputIds = new Array<number>(n).fill(-1);
  const slots = Array.from({ length: k }, (_, j) => min + j);

  const snap = (
    line: number | undefined,
    caption: string,
    o: { roles?: Record<number, Role>; pointers?: Record<number, string>; countRoles?: Record<number, Role>; outRoles?: Record<number, Role>; vars?: Vars } = {},
  ) => {
    frames.push({
      line,
      caption,
      state: {
        array: bars(items, items.map((_, i) => o.roles?.[i] ?? 'idle'), o.pointers),
        rows: [
          { label: 'value', cells: cells(slots, (j) => o.countRoles?.[j] && 'idle') },
          { label: 'count', cells: cells(count, (j) => o.countRoles?.[j]) },
          { label: 'output', cells: cells(output, (i) => o.outRoles?.[i] ?? (output[i] === null ? undefined : 'done')) },
        ],
      },
      vars: [...(o.vars ?? []), ['n', n], ['k', k]],
    });
  };

  snap(undefined, `Start with ${n} values from ${min} to ${max}: ${k} count slots, one per possible value. No two values are ever compared.`);
  snap(0, `count has k = max - min + 1 = ${k} slots, slot j counting the value ${min} + j${min < 0 ? ' (the shift by min handles negatives)' : ''}.`);

  // 1. count occurrences
  const seen = new Set<number>();
  for (let i = 0; i < n; i++) {
    const s = values[i] - min;
    count[s]++;
    const roles: Record<number, Role> = { [i]: 'compare' };
    seen.forEach((p) => (roles[p] = 'muted'));
    seen.add(i);
    snap(1, `Read ${values[i]}: count[${values[i]} - ${min}] becomes ${count[s]}.`, {
      roles,
      pointers: { [i]: 'i' },
      countRoles: { [s]: 'active' },
      vars: [['x', values[i]]],
    });
  }

  // 2. running totals
  snap(2, 'Turn the counts into running totals: count[j] becomes the number of values <= min + j, i.e. one past the last slot of that value in the output.');
  for (let j = 1; j < k; j++) {
    count[j] += count[j - 1];
    snap(2, `count[${j}] = count[${j}] + count[${j - 1}] = ${count[j]}.`, { countRoles: { [j]: 'active', [j - 1]: 'compare' }, vars: [['j', j]] });
  }

  // 3. place back to front
  const placed = new Set<number>();
  for (let i = n - 1; i >= 0; i--) {
    const x = values[i];
    const s = x - min;
    count[s]--;
    const pos = count[s];
    output[pos] = x;
    outputIds[pos] = i;
    const roles: Record<number, Role> = { [i]: 'active' };
    placed.forEach((p) => (roles[p] = 'muted'));
    placed.add(i);
    snap(5, `Take ${x} from the back: count[${s}] drops to ${pos}, so ${x} goes to output[${pos}]. Going backwards keeps equal values in input order (stable).`, {
      roles,
      pointers: { [i]: 'i' },
      countRoles: { [s]: 'active' },
      outRoles: { [pos]: 'active' },
      vars: [['i', i], ['x', x]],
    });
  }

  // 4. copy back
  const sorted = outputIds.map((id) => items[id]);
  for (let i = 0; i < n; i++) items[i] = sorted[i];
  frames.push({
    line: 6,
    caption: `Counting sort finished: the output holds the sorted array (0 comparisons, ${n} placements, ${k} count slots).`,
    state: {
      array: bars(items, items.map(() => 'done')),
      rows: [
        { label: 'value', cells: cells(slots, () => undefined) },
        { label: 'count', cells: cells(count, () => undefined) },
        { label: 'output', cells: cells(output, () => 'done') },
      ],
    },
    vars: [['n', n], ['k', k]],
  });
  return frames;
}

// ---------------------------------------------------------------- radix sort (LSD)

export function radixSort(values: number[]): LinearFrame[] {
  const n = values.length;
  const frames: LinearFrame[] = [];
  let items: BarItem[] = values.map((value, id) => ({ id, value }));
  const offset = Math.min(Math.min(...values), 0);
  const key = (it: BarItem) => it.value - offset;
  const maxKey = Math.max(...values) - offset;

  const binsOf = (lists: BarItem[][], lastRole: Role | undefined, lastBin: number): Bin[] =>
    lists.map((list, d) => ({
      label: String(d),
      head: { value: list.length, role: d === lastBin ? lastRole : undefined } as BinCell,
      items: list.map((it, i) => ({ value: it.value, role: d === lastBin && i === list.length - 1 ? lastRole : undefined })),
    }));

  const snap = (
    line: number | undefined,
    caption: string,
    o: { roles?: Record<number, Role>; pointers?: Record<number, string>; lists?: BarItem[][]; lastRole?: Role; lastBin?: number; arr?: BarItem[]; vars?: Vars } = {},
  ) => {
    const arr = o.arr ?? items;
    frames.push({
      line,
      caption,
      state: {
        array: bars(arr, arr.map((_, i) => o.roles?.[i] ?? 'idle'), o.pointers),
        bins: {
          label: 'digit',
          headLabel: 'count',
          itemsLabel: 'bucket',
          bins: binsOf(o.lists ?? Array.from({ length: 10 }, () => []), o.lastRole, o.lastBin ?? -1),
        },
      },
      vars: [...(o.vars ?? []), ['n', n]],
    });
  };

  snap(
    undefined,
    offset < 0
      ? `Start with ${n} values. The smallest is ${offset}, so every key is value - (${offset}) = value + ${-offset}: never negative, same order.`
      : `Start with ${n} non-negative values. Sort by one decimal digit at a time, least significant first, each pass stable.`,
  );

  let passNo = 0;
  for (let exp = 1; Math.floor(maxKey / exp) > 0; exp *= 10) {
    passNo++;
    const place = exp === 1 ? 'ones' : exp === 10 ? 'tens' : exp === 100 ? 'hundreds' : 'thousands';
    const digitOf = (it: BarItem) => Math.floor(key(it) / exp) % 10;
    snap(1, `Pass ${passNo}: stable-sort by the ${place} digit (exp = ${exp}). Values with a smaller digit go to a lower bucket; ties keep their order.`, {
      vars: [['exp', exp]],
    });
    const lists: BarItem[][] = Array.from({ length: 10 }, () => []);
    const seen = new Set<number>();
    for (let i = 0; i < n; i++) {
      const it = items[i];
      const d = digitOf(it);
      lists[d].push(it);
      const roles: Record<number, Role> = { [i]: 'compare' };
      seen.forEach((p) => (roles[p] = 'muted'));
      seen.add(i);
      snap(3, `${it.value}${offset < 0 ? ` (key ${key(it)})` : ''} has ${place} digit ${d}: append it to bucket ${d}.`, {
        roles,
        pointers: { [i]: 'i' },
        lists: lists.map((l) => [...l]),
        lastRole: 'active',
        lastBin: d,
        vars: [['exp', exp], ['digit', d]],
      });
    }
    // collect buckets 0..9 back into the array
    const out: BarItem[] = [];
    const remaining = lists.map((l) => [...l]);
    for (let d = 0; d < 10; d++) {
      if (lists[d].length === 0) continue;
      const first = out.length;
      out.push(...lists[d]);
      remaining[d] = [];
      const rest = items.filter((it) => !out.includes(it));
      const arr = [...out, ...rest];
      const roles: Record<number, Role> = {};
      arr.forEach((_, i) => (roles[i] = i < out.length ? (i >= first ? 'active' : 'compare') : 'muted'));
      snap(5, `Empty bucket ${d} into the array at positions ${first}..${out.length - 1}, in the order they arrived.`, {
        roles,
        arr,
        lists: remaining.map((l) => [...l]),
        vars: [['exp', exp]],
      });
    }
    items = out;
    const last = Math.floor(maxKey / (exp * 10)) === 0;
    if (!last) {
      snap(1, `After pass ${passNo} the array is sorted by its last ${passNo} digit${passNo > 1 ? 's' : ''}.`, { vars: [['exp', exp]] });
    }
  }

  frames.push({
    line: 6,
    caption:
      passNo === 0
        ? 'Radix sort finished: every key is 0, so there is nothing to sort (0 passes).'
        : `Radix sort finished after ${passNo} pass${passNo > 1 ? 'es' : ''} (one per digit of the largest key ${maxKey}); 0 comparisons.`,
    state: {
      array: bars(items, items.map(() => 'done')),
      bins: { label: 'digit', headLabel: 'count', itemsLabel: 'bucket', bins: binsOf(Array.from({ length: 10 }, () => []), undefined, -1) },
    },
    vars: [['n', n], ['passes', passNo]],
  });
  return frames;
}

// ---------------------------------------------------------------- bucket sort

const fmt = (x: number) => String(x);

export function bucketSort(values: number[]): LinearFrame[] {
  const n = values.length;
  const m = n; // as in the Python default: one bucket per value
  const frames: LinearFrame[] = [];
  const items: BarItem[] = values.map((value, id) => ({ id, value }));
  let comparisons = 0;
  let shifts = 0;

  const binsOf = (lists: BarItem[][], o: { binRole?: Record<number, Role>; cellRole?: Record<number, Record<number, Role>> } = {}): Bin[] =>
    lists.map((list, b) => ({
      label: String(b),
      title: `values in [${(b / m).toFixed(2)}, ${((b + 1) / m).toFixed(2)})${b === m - 1 ? ' and 1.0' : ''}`,
      role: o.binRole?.[b],
      items: list.map((it, i) => ({ value: it.value, role: o.cellRole?.[b]?.[i] })),
    }));

  const snap = (
    line: number | undefined,
    caption: string,
    lists: BarItem[][],
    o: { roles?: Record<number, Role>; pointers?: Record<number, string>; arr?: BarItem[]; binRole?: Record<number, Role>; cellRole?: Record<number, Record<number, Role>>; vars?: Vars } = {},
  ) => {
    const arr = o.arr ?? items;
    frames.push({
      line,
      caption,
      state: {
        array: bars(arr, arr.map((_, i) => o.roles?.[i] ?? 'idle'), o.pointers),
        bins: { label: 'bucket', itemsLabel: 'contents', bins: binsOf(lists, o), wide: true },
      },
      vars: [...(o.vars ?? []), ['n', n], ['buckets', m]],
    });
  };

  const empty = () => Array.from({ length: m }, () => [] as BarItem[]);
  snap(undefined, `Start with ${n} values in [0, 1] and ${m} equal-width buckets: bucket b takes [b/${m}, (b+1)/${m}).`, empty());

  // 1. distribute
  const lists = empty();
  const seen = new Set<number>();
  for (let i = 0; i < n; i++) {
    const x = values[i];
    const b = Math.min(Math.floor(m * x), m - 1);
    lists[b].push(items[i]);
    const roles: Record<number, Role> = { [i]: 'compare' };
    seen.forEach((p) => (roles[p] = 'muted'));
    seen.add(i);
    snap(
      3,
      x === 1
        ? `${fmt(x)} * ${m} = ${m} is one past the last bucket, so 1.0 is clamped into bucket ${b}.`
        : `${fmt(x)} * ${m} = ${fmt(m * x)}: floor gives bucket ${b}.`,
      lists.map((l) => [...l]),
      { roles, pointers: { [i]: 'i' }, cellRole: { [b]: { [lists[b].length - 1]: 'active' } }, vars: [['x', fmt(x)], ['bucket', b]] },
    );
  }

  // 2. insertion-sort every bucket
  for (let b = 0; b < m; b++) {
    const list = lists[b];
    if (list.length < 2) continue;
    snap(5, `Bucket ${b} holds ${list.length} values: sort it with insertion sort.`, lists.map((l) => [...l]), { binRole: { [b]: 'compare' }, vars: [['bucket', b]] });
    for (let i = 1; i < list.length; i++) {
      const key = list[i];
      let j = i - 1;
      let moved = 0;
      while (j >= 0) {
        comparisons++;
        if (list[j].value > key.value) {
          list[j + 1] = list[j];
          shifts++;
          moved++;
          j--;
        } else break;
      }
      list[j + 1] = key;
      snap(
        6,
        moved === 0
          ? `Insert ${fmt(key.value)}: it is not smaller than ${fmt(list[j].value)}, so it stays.`
          : `Insert ${fmt(key.value)}: it moves left past ${moved} larger value${moved > 1 ? 's' : ''}.`,
        lists.map((l) => [...l]),
        { binRole: { [b]: 'compare' }, cellRole: { [b]: { [j + 1]: 'active' } }, vars: [['bucket', b], ['comparisons', comparisons]] },
      );
    }
  }
  snap(7, 'Every bucket is sorted, and every value in a lower bucket is smaller than any in a higher one. Concatenate the buckets in order.', lists.map((l) => [...l]));

  // 3. concatenate
  const out: BarItem[] = [];
  const remaining = lists.map((l) => [...l]);
  for (let b = 0; b < m; b++) {
    if (lists[b].length === 0) continue;
    const first = out.length;
    out.push(...lists[b]);
    remaining[b] = [];
    const arr = [...out, ...items.filter((it) => !out.includes(it))];
    const roles: Record<number, Role> = {};
    arr.forEach((_, i) => (roles[i] = i < out.length ? (i >= first ? 'active' : 'compare') : 'muted'));
    snap(7, `Copy bucket ${b} into the array at positions ${first}..${out.length - 1}.`, remaining.map((l) => [...l]), { roles, arr, vars: [['bucket', b]] });
  }

  frames.push({
    line: 8,
    caption: `Bucket sort finished: ${comparisons} comparisons and ${shifts} shifts, all inside buckets.`,
    state: {
      array: bars(out, out.map(() => 'done')),
      bins: { label: 'bucket', itemsLabel: 'contents', bins: binsOf(empty()), wide: true },
    },
    vars: [['n', n], ['buckets', m], ['comparisons', comparisons]],
  });
  return frames;
}

export const LINEAR_SORTERS = {
  'counting-sort': countingSort,
  'radix-sort': radixSort,
  'bucket-sort': bucketSort,
} as const;
