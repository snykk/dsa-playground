/**
 * Tracers for linear, binary, ternary and interpolation search.
 *
 * Each one mirrors the iterative Python function of its topic in Algorithms/Searching
 * (linear_search, binary_search, ternary_search, interpolation_search): the same probes
 * in the same order and the same returned index, duplicates included. A probe is one
 * comparison of an array value with the target for equality. The golden fixtures in
 * __fixtures__/searching.json, written by web/scripts/gen_searching_fixtures.py from the
 * Python code, pin both down.
 */
import { InputError, parseIntList, type Frame, type Role } from '../core/types';
import type { SearchGuide, SearchPointer, SearchState } from '../renderers/SearchBars';
import type { StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

export interface SearchInput {
  values: number[];
  target: number;
}

export const MAX_VALUES = 32;

/** "2, 5, 8, 12; target 8": the values, then the target. Sorted searches also check the order. */
export function parseSearch(text: string, { sorted }: { sorted: boolean }): SearchInput {
  const [valuePart, ...options] = text.split(';');
  const values = parseIntList(valuePart, { min: 1, max: MAX_VALUES });
  let target: number | undefined;
  for (const opt of options.map((o) => o.trim()).filter(Boolean)) {
    const m = opt.match(/^(?:(?:target|find)\s*[:=]?\s*)?(-?\d+)$/i);
    if (!m) throw new InputError(`Cannot read "${opt}". Finish with the value to look for, e.g. "; target 23".`);
    target = Number(m[1]);
    if (target < -999 || target > 999) throw new InputError(`The target ${target} is outside the supported range -999..999.`);
  }
  if (target === undefined) throw new InputError('Add the value to look for after a semicolon, e.g. "2, 5, 8, 12; target 8".');
  if (sorted) {
    const k = values.findIndex((v, i) => i > 0 && v < values[i - 1]);
    if (k > 0) {
      throw new InputError(
        `This search needs the values in ascending order, but ${values[k - 1]} comes before ${values[k]}. Sort them first (linear search is the one that works on unsorted data).`,
      );
    }
  }
  return { values, target };
}

export function formatSearch({ values, target }: SearchInput): string {
  return `${values.join(', ')}; target ${target}`;
}

/** Worst-case probe count of binary search on n values: floor(log2 n) + 1. */
export const binaryWorstCase = (n: number) => 32 - Math.clz32(n);

type Vars = Array<[string, string | number]>;

interface SnapOptions {
  range: [number, number];
  pointers?: SearchPointer[];
  roles?: Record<number, Role>;
  guide?: SearchGuide;
  vars?: Vars;
  result?: number;
  strips?: StripData[];
}

const plural = (k: number, word: string) => `${k} ${word}${k === 1 ? '' : 's'}`;
const span = (from: number, to: number) => (from === to ? `a[${from}]` : `a[${from}..${to}]`);
const bounds = (lo: number, hi: number): SearchPointer[] => [
  { name: 'lo', index: lo, kind: 'low' },
  { name: 'hi', index: hi, kind: 'high' },
];
const probeAt = (name: string, index: number): SearchPointer => ({ name, index, kind: 'probe' });
/** Up to two decimals, without trailing zeros: 6, 4.5, 2.24. */
const num = (x: number) => String(Number(x.toFixed(2)));

class Recorder {
  frames: Array<Frame<SearchState>> = [];
  ruledOut = new Set<number>();
  probes: number[] = [];

  constructor(
    readonly values: number[],
    readonly target: number,
    readonly countLabel: string,
    readonly showProbes: boolean,
  ) {}

  /** One equality comparison of a[i] with the target. */
  probe(i: number): boolean {
    this.probes.push(i);
    return this.values[i] === this.target;
  }

  ruleOut(from: number, to: number) {
    for (let k = Math.max(0, from); k <= Math.min(this.values.length - 1, to); k++) this.ruledOut.add(k);
  }

  snap(line: number | undefined, caption: string, o: SnapOptions) {
    const { values, target, probes } = this;
    const roles = values.map((_, i) => o.roles?.[i] ?? (this.ruledOut.has(i) ? 'muted' : 'idle'));
    const strips: StripData[] = [];
    if (this.showProbes) {
      strips.push({
        label: 'Probed',
        items: probes.length
          ? probes.map((i, k) => ({ text: `a[${i}]=${values[i]}`, role: k === probes.length - 1 ? ('compare' as Role) : undefined }))
          : [{ text: 'nothing yet' }],
      });
    }
    this.frames.push({
      line,
      caption,
      vars: [['target', target], ...(o.vars ?? []), [this.countLabel, probes.length]],
      state: {
        values,
        roles,
        target,
        range: { lo: o.range[0], hi: o.range[1] },
        pointers: o.pointers ?? [],
        guide: o.guide,
        probes: [...probes],
        result: o.result,
        strips: [...strips, ...(o.strips ?? [])],
      },
    });
  }
}

/** Probes binary search makes on this input (the loop of binary_search, without frames). */
export function binaryProbeCount(values: number[], target: number): number {
  let lo = 0;
  let hi = values.length - 1;
  let count = 0;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    count++;
    if (values[mid] === target) break;
    if (values[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return count;
}

/** Comparisons linear search makes on this input. */
export function linearProbeCount(values: number[], target: number): number {
  const i = values.indexOf(target);
  return i < 0 ? values.length : i + 1;
}

/** Mirrors linear_search in Algorithms/Searching/Linear Search/Python/linear_search.py. */
export function linearSearch({ values, target }: SearchInput): Array<Frame<SearchState>> {
  const r = new Recorder(values, target, 'comparisons', false);
  const n = values.length;
  r.snap(undefined, `Look for ${target} by comparing the values one by one from the left. Nothing is known about their order, so no value can be skipped.`, {
    range: [0, n - 1],
  });
  for (let i = 0; i < n; i++) {
    const vars: Vars = [['i', i], ['a[i]', values[i]]];
    const at = { range: [i, n - 1] as [number, number], pointers: [probeAt('i', i)], vars };
    if (r.probe(i)) {
      r.snap(1, `Compare a[${i}] = ${values[i]} with the target ${target}: they are equal.`, { ...at, roles: { [i]: 'compare' } });
      const later = values.indexOf(target, i + 1);
      r.snap(
        2,
        `Return ${i}: found after ${plural(i + 1, 'comparison')}. The loop stops at the first match${later >= 0 ? `, so the ${target} at index ${later} is never looked at` : ''}.`,
        { ...at, roles: { [i]: 'good' }, result: i },
      );
      return r.frames;
    }
    const why =
      i === 0
        ? 'Ruling out one index tells us nothing about the others, so move to the next.'
        : i === n - 1
          ? 'That was the last value.'
          : `Rule out index ${i} and move on.`;
    r.snap(1, `a[${i}] = ${values[i]} is not ${target}. ${why}`, { ...at, roles: { [i]: 'compare' } });
    r.ruleOut(i, i);
  }
  r.snap(3, `All ${n} values were compared and none equals ${target}, so return -1. A missing target always costs n = ${n} comparisons: the worst case.`, {
    range: [n, n - 1],
    result: -1,
  });
  return r.frames;
}

/** Mirrors binary_search in Algorithms/Searching/Binary Search/Python/binary_search.py. */
export function binarySearch({ values, target }: SearchInput): Array<Frame<SearchState>> {
  const r = new Recorder(values, target, 'probes', true);
  const n = values.length;
  let lo = 0;
  let hi = n - 1;
  r.snap(
    0,
    `The values are sorted, so comparing ${target} with the middle value tells us which half can still hold it. Start with the whole array: lo = 0, hi = ${hi}.`,
    { range: [lo, hi], pointers: bounds(lo, hi), vars: [['lo', lo], ['hi', hi]] },
  );
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const left = hi - lo + 1;
    r.snap(
      2,
      `lo = ${lo} <= hi = ${hi}, so ${plural(left, 'candidate')} remain${left === 1 ? 's' : ''}. Probe the middle one: mid = ${lo} + floor((${hi} - ${lo}) / 2) = ${mid}.`,
      { range: [lo, hi], pointers: [...bounds(lo, hi), probeAt('mid', mid)], roles: { [mid]: 'compare' }, vars: [['lo', lo], ['hi', hi], ['mid', mid]] },
    );
    const vars: Vars = [['lo', lo], ['hi', hi], ['mid', mid], ['a[mid]', values[mid]]];
    if (r.probe(mid)) {
      const k = r.probes.length;
      const linear = linearProbeCount(values, target);
      r.snap(
        3,
        `a[${mid}] = ${values[mid]} equals the target: return ${mid}. Found with ${plural(k, 'probe')}; a linear scan would need ${linear}.`,
        { range: [lo, hi], pointers: [...bounds(lo, hi), probeAt('mid', mid)], roles: { [mid]: 'good' }, vars, result: mid },
      );
      return r.frames;
    }
    if (values[mid] < target) {
      const from = lo;
      r.ruleOut(lo, mid);
      lo = mid + 1;
      r.snap(
        4,
        `a[${mid}] = ${values[mid]} < ${target}. The array is sorted, so ${span(from, mid)} are all <= ${values[mid]} and cannot be ${target}: drop them and set lo = mid + 1 = ${lo}.`,
        { range: [lo, hi], pointers: [...bounds(lo, hi), probeAt('mid', mid)], vars: [['lo', lo], ['hi', hi], ['mid', mid], ['a[mid]', values[mid]]] },
      );
    } else {
      const to = hi;
      r.ruleOut(mid, hi);
      hi = mid - 1;
      r.snap(
        5,
        `a[${mid}] = ${values[mid]} > ${target}. The array is sorted, so ${span(mid, to)} are all >= ${values[mid]} and cannot be ${target}: drop them and set hi = mid - 1 = ${hi}.`,
        { range: [lo, hi], pointers: [...bounds(lo, hi), probeAt('mid', mid)], vars: [['lo', lo], ['hi', hi], ['mid', mid], ['a[mid]', values[mid]]] },
      );
    }
  }
  const k = r.probes.length;
  r.snap(
    6,
    `lo = ${lo} > hi = ${hi}: no candidates are left, so ${target} is not in the array. Return -1 after ${plural(k, 'probe')} (never more than floor(log2 ${n}) + 1 = ${binaryWorstCase(n)} for ${n} values). Inserted, ${target} would go at index ${lo}.`,
    { range: [lo, hi], pointers: bounds(lo, hi), vars: [['lo', lo], ['hi', hi]], result: -1 },
  );
  return r.frames;
}

/** Mirrors ternary_search in Algorithms/Searching/Ternary Search/Python/ternary_search.py. */
export function ternarySearch({ values, target }: SearchInput): Array<Frame<SearchState>> {
  const r = new Recorder(values, target, 'probes', true);
  const n = values.length;
  let lo = 0;
  let hi = n - 1;
  let rounds = 0;
  r.snap(
    0,
    `Ternary search probes two values per round, about one third and two thirds into the sorted range, and keeps the one part of three that can hold ${target}. Start with lo = 0, hi = ${hi}.`,
    { range: [lo, hi], pointers: bounds(lo, hi), vars: [['lo', lo], ['hi', hi]] },
  );
  const compareWithBinary = () => {
    const b = binaryProbeCount(values, target);
    const k = r.probes.length;
    return `${plural(k, 'probe')} in ${plural(rounds, 'round')}; binary search needs ${b} on this input${k > b ? ' (ternary search pays two probes per round)' : ''}.`;
  };
  while (lo <= hi) {
    rounds++;
    const third = Math.floor((hi - lo) / 3);
    const m1 = lo + third;
    const m2 = hi - third;
    const pointers = [...bounds(lo, hi), probeAt('m1', m1), probeAt('m2', m2)];
    const vars: Vars = [['lo', lo], ['hi', hi], ['m1', m1], ['m2', m2]];
    const probing = { range: [lo, hi] as [number, number], pointers, vars, roles: { [m1]: 'compare', [m2]: 'compare' } as Record<number, Role> };
    r.snap(
      2,
      m1 === m2
        ? `Only index ${m1} is left, so m1 = m2 = ${m1}.`
        : `Cut ${span(lo, hi)} into thirds: m1 = ${lo} + floor((${hi} - ${lo}) / 3) = ${m1} and m2 = ${hi} - floor((${hi} - ${lo}) / 3) = ${m2}.`,
      probing,
    );
    if (r.probe(m1)) {
      r.snap(3, `a[m1] = a[${m1}] = ${target}: return ${m1}. Found with ${compareWithBinary()}`, { ...probing, roles: { [m1]: 'good' }, result: m1 });
      return r.frames;
    }
    r.snap(3, `a[m1] = a[${m1}] = ${values[m1]} is not ${target}, so check m2.`, probing);
    if (r.probe(m2)) {
      r.snap(4, `a[m2] = a[${m2}] = ${target}: return ${m2}. Found with ${compareWithBinary()}`, { ...probing, roles: { [m2]: 'good' }, result: m2 });
      return r.frames;
    }
    r.snap(
      4,
      m1 === m2
        ? `m2 is the same index, so this second comparison cannot succeed (the code makes it anyway).`
        : `a[m2] = a[${m2}] = ${values[m2]} is not ${target} either. Now ${target} is compared with both to choose the third that can hold it.`,
      probing,
    );
    if (target < values[m1]) {
      const to = hi;
      r.ruleOut(m1, hi);
      hi = m1 - 1;
      r.snap(5, `${target} < a[m1] = ${values[m1]}: only the left third can hold it. Drop ${span(m1, to)} and set hi = m1 - 1 = ${hi}.`, {
        range: [lo, hi],
        pointers: [...bounds(lo, hi), probeAt('m1', m1), probeAt('m2', m2)],
        vars,
      });
    } else if (target > values[m2]) {
      const from = lo;
      r.ruleOut(lo, m2);
      lo = m2 + 1;
      r.snap(6, `${target} > a[m2] = ${values[m2]}: only the right third can hold it. Drop ${span(from, m2)} and set lo = m2 + 1 = ${lo}.`, {
        range: [lo, hi],
        pointers: [...bounds(lo, hi), probeAt('m1', m1), probeAt('m2', m2)],
        vars,
      });
    } else {
      const [from, to] = [lo, hi];
      r.ruleOut(lo, m1);
      r.ruleOut(m2, hi);
      lo = m1 + 1;
      hi = m2 - 1;
      r.snap(
        7,
        `a[m1] = ${values[m1]} < ${target} < a[m2] = ${values[m2]}: only the middle third can hold it. Drop ${span(from, m1)} and ${span(m2, to)}; lo = m1 + 1 = ${lo}, hi = m2 - 1 = ${hi}.`,
        { range: [lo, hi], pointers: [...bounds(lo, hi), probeAt('m1', m1), probeAt('m2', m2)], vars },
      );
    }
  }
  r.snap(8, `lo = ${lo} > hi = ${hi}: nothing is left, so return -1. Not found after ${compareWithBinary()}`, {
    range: [lo, hi],
    pointers: bounds(lo, hi),
    vars: [['lo', lo], ['hi', hi]],
    result: -1,
  });
  return r.frames;
}

/** Mirrors interpolation_search in Algorithms/Searching/Interpolation Search/Python/interpolation_search.py. */
export function interpolationSearch({ values, target }: SearchInput): Array<Frame<SearchState>> {
  const r = new Recorder(values, target, 'probes', true);
  const n = values.length;
  const formula = 'pos = lo + (target - a[lo]) * (hi - lo) / (a[hi] - a[lo])';
  let strips: StripData[] = [{ label: 'Probe formula', items: [{ text: formula }] }];
  let lo = 0;
  let hi = n - 1;
  let guide: SearchGuide | undefined;
  let pos: number | undefined;
  const pointers = () => [...bounds(lo, hi), ...(pos === undefined ? [] : [probeAt('pos', pos)])];
  const vars = (): Vars => [['lo', lo], ['hi', hi], ...(pos === undefined ? [] : ([['pos', pos], ['a[pos]', values[pos]]] as Vars))];
  const verdict = () => {
    const k = r.probes.length;
    const b = binaryProbeCount(values, target);
    if (k < b) return `Binary search needs ${b} on this input: when the values grow evenly, the straight line points almost right at the target.`;
    if (k > b) return `Binary search needs only ${b} on this input: these values do not grow evenly, so the straight line keeps missing and each guess gains little.`;
    return `Binary search needs ${b} on this input too.`;
  };

  r.snap(
    0,
    `Interpolation search guesses where ${target} should be from its value, the way you open a dictionary near the end for a word starting with "w". Start with lo = 0, hi = ${hi}.`,
    { range: [lo, hi], pointers: pointers(), vars: vars(), strips },
  );
  for (;;) {
    if (!(lo <= hi && values[lo] <= target && target <= values[hi])) break;
    r.snap(
      1,
      `a[lo] = ${values[lo]} <= ${target} <= a[hi] = ${values[hi]}: if ${target} is present it lies in ${span(lo, hi)}, the values between those two.`,
      { range: [lo, hi], pointers: pointers(), vars: vars(), guide, strips },
    );
    if (lo === hi || values[lo] === values[hi]) {
      pos = undefined;
      r.snap(
        2,
        lo === hi
          ? `Only index ${lo} is left: there is nothing to interpolate, so compare it directly.`
          : `a[lo] = a[hi] = ${values[lo]}, so every value in ${span(lo, hi)} is ${values[lo]}: there is no slope to follow, and the formula would divide by a[hi] - a[lo] = 0. Compare a[lo] directly.`,
        { range: [lo, hi], pointers: pointers(), vars: vars(), roles: { [lo]: 'compare' }, strips },
      );
      const hit = r.probe(lo);
      r.snap(3, hit ? `a[${lo}] = ${target}: return ${lo} after ${plural(r.probes.length, 'probe')}. ${verdict()}` : `a[${lo}] = ${values[lo]} is not ${target}: return -1.`, {
        range: [lo, hi],
        pointers: pointers(),
        vars: vars(),
        roles: { [lo]: hit ? 'good' : 'compare' },
        result: hit ? lo : -1,
        strips,
      });
      return r.frames;
    }
    const offset = ((target - values[lo]) * (hi - lo)) / (values[hi] - values[lo]);
    pos = lo + Math.trunc(offset);
    guide = { lo, hi, estimate: lo + offset, pos };
    const filled = `${lo} + (${target} - ${values[lo]}) * (${hi} - ${lo}) / (${values[hi]} - ${values[lo]})`;
    strips = [{ label: 'Probe formula', items: [{ text: formula }, { text: `= ${filled}` }, { text: `= ${num(lo + offset)}` }, { text: `${SYM.rightArrow} ${pos}`, role: 'compare' }] }];
    r.snap(
      4,
      `The straight line from (${lo}, ${values[lo]}) to (${hi}, ${values[hi]}) reaches ${target} at x = ${filled} = ${num(lo + offset)}. Round down: probe pos = ${pos}.`,
      { range: [lo, hi], pointers: pointers(), vars: vars(), roles: { [pos]: 'compare' }, guide, strips },
    );
    if (r.probe(pos)) {
      r.snap(5, `a[${pos}] = ${target}: return ${pos}. Found with ${plural(r.probes.length, 'probe')}. ${verdict()}`, {
        range: [lo, hi],
        pointers: pointers(),
        vars: vars(),
        roles: { [pos]: 'good' },
        guide,
        result: pos,
        strips,
      });
      return r.frames;
    }
    if (values[pos] > target) {
      const to = hi;
      r.ruleOut(pos, hi);
      hi = pos - 1;
      r.snap(6, `a[${pos}] = ${values[pos]} > ${target}, so ${span(pos, to)} are too big: hi = pos - 1 = ${hi}.`, { range: [lo, hi], pointers: pointers(), vars: vars(), guide, strips });
    } else {
      const from = lo;
      r.ruleOut(lo, pos);
      lo = pos + 1;
      r.snap(7, `a[${pos}] = ${values[pos]} < ${target}, so ${span(from, pos)} are too small: lo = pos + 1 = ${lo}.`, { range: [lo, hi], pointers: pointers(), vars: vars(), guide, strips });
    }
  }
  const why =
    lo > hi
      ? `lo = ${lo} > hi = ${hi}: no values are left`
      : target < values[lo]
        ? `${target} < a[lo] = ${values[lo]}, the smallest value left`
        : `${target} > a[hi] = ${values[hi]}, the largest value left`;
  r.snap(1, `The loop stops: ${why}.`, { range: [lo, hi], pointers: pointers(), vars: vars(), guide, strips });
  r.ruleOut(lo, hi);
  r.snap(8, `So ${target} is not in the array: return -1 after ${plural(r.probes.length, 'probe')}. ${verdict()}`, {
    range: [lo, hi],
    pointers: pointers(),
    vars: vars(),
    result: -1,
    strips,
  });
  return r.frames;
}

export const SEARCHERS = {
  'linear-search': linearSearch,
  'binary-search': binarySearch,
  'ternary-search': ternarySearch,
  'interpolation-search': interpolationSearch,
} as const;

// ---------- random inputs ----------

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** A target that is present about 70% of the time, otherwise a nearby missing value. */
function pickTarget(values: number[]): number {
  if (Math.random() < 0.7) return values[rint(0, values.length - 1)];
  const lo = Math.min(...values) - 3;
  const hi = Math.max(...values) + 3;
  for (let k = 0; k < 50; k++) {
    const t = rint(lo, hi);
    if (!values.includes(t)) return t;
  }
  return hi;
}

function evenlySpread(n: number): number[] {
  const start = rint(1, 15);
  const step = rint(3, 9);
  return Array.from({ length: n }, (_, i) => start + i * step + rint(-1, 1));
}

/** Random input text for each search (sorted ascending except for linear search). */
export function randomSearchInput(kind: 'linear' | 'sorted' | 'interpolation'): string {
  let values: number[];
  if (kind === 'linear') {
    values = Array.from({ length: rint(8, 12) }, () => rint(1, 99));
  } else if (kind === 'sorted') {
    values = evenlySpread(rint(10, 20)).map((v) => v + rint(0, 4));
  } else {
    const n = rint(10, 16);
    const shape = Math.random();
    if (shape < 0.5) values = evenlySpread(n);
    else if (shape < 0.8) values = Array.from({ length: n }, (_, i) => Math.round(2 + 600 * ((i + 1) / n) ** 3));
    else values = Array.from({ length: n }, (_, i) => (i < n - 3 ? rint(1, 30) : rint(400, 900)));
  }
  if (kind !== 'linear') values.sort((a, b) => a - b);
  return formatSearch({ values, target: pickTarget(values) });
}
