/**
 * Problem-pattern tracers: two pointers, a variable sliding window, prefix sums and
 * the difference array, a monotonic stack, a monotonic queue and binary search on
 * the answer. Each one mirrors a Python function in Problem_Patterns/ (pinned by
 * the golden fixtures in __fixtures__/patterns.json) and records ArrayScene
 * snapshots whose captions name the invariant that makes the pattern work.
 */
import { InputError, parseIntList, type Frame, type Role } from '../core/types';
import type { BarItem } from '../renderers/ArrayBars';
import type { ArraySceneState, SceneCell, SceneRow } from '../renderers/ArrayScene';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

export type PatternFrame = Frame<ArraySceneState>;
type Vars = Array<[string, string | number]>;

// ---------------------------------------------------------------- input helpers

/** "main; key value; key value" -> the main part plus named options (keys lower-cased). */
function splitOptions(text: string, keys: string[], example: string): { main: string; opts: Map<string, string> } {
  const [main, ...rest] = text.split(';');
  const opts = new Map<string, string>();
  for (const raw of rest.map((s) => s.trim()).filter(Boolean)) {
    const m = raw.match(/^([A-Za-z]+)\s*[:=]?\s*(.*)$/);
    const key = m ? m[1].toLowerCase() : '';
    if (!m || !keys.includes(key)) throw new InputError(`Unknown option "${raw}". Write the input like "${example}".`);
    if (opts.has(key)) throw new InputError(`"${key}" is given twice.`);
    opts.set(key, m[2].trim());
  }
  return { main: main.trim(), opts };
}

function intOption(opts: Map<string, string>, key: string, lo: number, hi: number, example: string): number {
  const raw = opts.get(key);
  if (raw === undefined || raw === '') throw new InputError(`Add "${key}" after a semicolon, e.g. "${example}".`);
  if (!/^[+-]?\d+$/.test(raw)) throw new InputError(`${key} must be a whole number (got "${raw}").`);
  const v = Number(raw);
  if (v < lo || v > hi) throw new InputError(`${key} must be between ${lo} and ${hi} (got ${v}).`);
  return v;
}

/** An index range "l-r" (also "l..r" or "l:r") inside 0..n-1. */
function parseRange(raw: string, n: number, what: string): [number, number] {
  const m = raw.match(/^(\d+)\s*(?:-|\.\.|:)\s*(\d+)$/);
  if (!m) throw new InputError(`Cannot read the ${what} "${raw}". Write index ranges like 1-3.`);
  const l = Number(m[1]);
  const r = Number(m[2]);
  if (l > r) throw new InputError(`In the ${what} ${raw} the left index is larger than the right one.`);
  if (r >= n) throw new InputError(`The ${what} ${raw} goes past the last index, ${n - 1}.`);
  return [l, r];
}

/** Comma-separated items of an option, with a count limit. */
function listOption(opts: Map<string, string>, key: string, max: number, example: string): string[] {
  const raw = opts.get(key);
  if (!raw) throw new InputError(`Add "${key} ..." after a semicolon, e.g. "${example}".`);
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length > max) throw new InputError(`At most ${max} ${key === 'add' ? 'updates' : key}, please (got ${parts.length}).`);
  return parts;
}

// ---------------------------------------------------------------- frame helpers

const barsOf = (values: number[]): BarItem[] => values.map((value, id) => ({ id, value }));

/** Pointer labels under the bars; two labels on one index are joined ("L,R"). */
function pointers(...pairs: Array<[number, string] | false | undefined>): Record<number, string> {
  const out: Record<number, string> = {};
  for (const p of pairs) {
    if (!p) continue;
    const [i, label] = p;
    out[i] = out[i] ? `${out[i]},${label}` : label;
  }
  return out;
}

const strip = (label: string, items: Array<string | StripItem>, empty = '(empty)'): StripData => ({
  label,
  items: items.length ? items.map((it) => (typeof it === 'string' ? { text: it } : it)) : [{ text: empty }],
});

function cellsOf(values: Array<string | number | null>, role?: (i: number) => Role | undefined, pointer?: (i: number) => boolean): SceneCell[] {
  return values.map((value, i) => ({ value, role: role?.(i), pointer: pointer?.(i) || undefined }));
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const signed = (v: number) => (v >= 0 ? `+${v}` : `${v}`);

// ---------------------------------------------------------------- two pointers

export interface TwoPointersInput {
  /** Sorted ascending. */
  values: number[];
  target: number;
  /** True when the input was not sorted and the parser sorted it. */
  sortedByUs: boolean;
}

export function parseTwoPointers(text: string): TwoPointersInput {
  const example = '2, 7, 11, 15; target 9';
  const { main, opts } = splitOptions(text, ['target'], example);
  const raw = parseIntList(main, { min: 2, max: 16, lo: -99, hi: 99 });
  const target = intOption(opts, 'target', -999, 999, example);
  const values = [...raw].sort((a, b) => a - b);
  return { values, target, sortedByUs: values.some((v, i) => v !== raw[i]) };
}

/** Mirrors two_sum_sorted (Problem_Patterns/Two Pointers/Python/two_pointers.py). */
export function twoPointersTrace({ values: a, target: t, sortedByUs }: TwoPointersInput): PatternFrame[] {
  const n = a.length;
  const frames: PatternFrame[] = [];
  const ruledOut = new Set<number>();
  const ruledOutItems: StripItem[] = [];
  let L = 0;
  let R = n - 1;
  let steps = 0;
  let found: [number, number] | null = null;
  let check: StripItem[] = [];

  const snap = (line: number | undefined, caption: string, roles: Record<number, Role> = {}) => {
    const role = (i: number): Role =>
      roles[i] ?? (found && (i === found[0] || i === found[1]) ? 'done' : ruledOut.has(i) ? 'muted' : 'idle');
    const vars: Vars = [['L', L], ['R', R], ['target', t], ['steps', steps]];
    if (found) vars.push(['pair', `(${found[0]}, ${found[1]})`]);
    frames.push({
      line,
      caption,
      vars,
      state: {
        array: {
          items: barsOf(a),
          roles: a.map((_, i) => role(i)),
          pointers: pointers([L, 'L'], [R, 'R']),
          range: { lo: L, hi: R, label: found ? 'the pair' : 'still possible' },
        },
        rows: [{ label: 'a', cells: cellsOf(a, role, (i) => i === L || i === R) }],
        rowIndices: n,
        strips: [strip('a[L] + a[R]', check, '-'), strip('Ruled out', ruledOutItems, 'nothing yet')],
      },
    });
  };

  snap(
    0,
    `${sortedByUs ? 'Sorted the input first: the pattern needs ascending order. ' : ''}L starts on the smallest value, R on the largest. ` +
      `Invariant: if two values sum to ${t}, both lie between L and R (the shaded part).`,
  );
  while (L < R) {
    const s = a[L] + a[R];
    steps++;
    check = [{ text: `${a[L]} + ${a[R]} = ${s}`, role: 'compare' }, { text: s === t ? `= ${t}` : s < t ? `< ${t}` : `> ${t}` }];
    snap(
      2,
      `a[L] + a[R] = ${a[L]} + ${a[R]} = ${s}: ${s === t ? 'exactly the target' : s < t ? `less than the target ${t}` : `more than the target ${t}`}.`,
      { [L]: 'compare', [R]: 'compare' },
    );
    if (s === t) {
      found = [L, R];
      snap(3, `Found it: ${a[L]} + ${a[R]} = ${t} at indices (${L}, ${R}), which is what two_sum_sorted returns.`);
      break;
    }
    if (s < t) {
      const was = a[L];
      ruledOut.add(L);
      ruledOutItems.push({ text: `${was} (too small)` });
      L++;
      snap(
        4,
        `Too small, and ${a[R]} is the largest value still possible, so ${was} plus any partner stays below ${t}: ` +
          `rule ${was} out and move L right.`,
        { [R]: 'compare', [L]: 'active' },
      );
    } else {
      const was = a[R];
      ruledOut.add(R);
      ruledOutItems.push({ text: `${was} (too big)` });
      R--;
      snap(
        5,
        `Too big, and ${a[L]} is the smallest value still possible, so ${was} plus any partner overshoots ${t}: ` +
          `rule ${was} out and move R left.`,
        { [L]: 'compare', [R]: 'active' },
      );
    }
  }
  if (!found) {
    check = [];
    snap(
      6,
      `L and R met at index ${L}. A pair needs two different positions and every other value is ruled out, ` +
        `so no two values sum to ${t}: two_sum_sorted returns None.`,
    );
  }
  snap(
    undefined,
    found
      ? `Done in ${plural(steps, 'step')}. Each step either finds the pair or rules out one value for good, so it never takes more than n - 1 = ${n - 1} steps: O(n).`
      : `Done: no pair. ${plural(steps, 'step')}, each ruling out one value, instead of trying all ${(n * (n - 1)) / 2} pairs.`,
  );
  return frames;
}

// ---------------------------------------------------------------- sliding window

export interface KDistinctInput {
  s: string;
  k: number;
}

export function parseKDistinct(text: string): KDistinctInput {
  const example = 'eceba; k 2';
  const { main, opts } = splitOptions(text, ['k'], example);
  if (!main) throw new InputError(`Type a word first, e.g. "${example}".`);
  if (!/^[A-Za-z0-9]+$/.test(main)) throw new InputError(`Use letters and digits only, without spaces, e.g. "${example}".`);
  if (main.length > 24) throw new InputError(`Keep the text to 24 characters or fewer (got ${main.length}).`);
  const k = intOption(opts, 'k', 1, 10, example);
  return { s: main, k };
}

/** Mirrors longest_substring_k_distinct (Problem_Patterns/Sliding Window/Python/sliding_window.py). */
export function kDistinctTrace({ s, k }: KDistinctInput): PatternFrame[] {
  const chars = [...s];
  const n = chars.length;
  const alphabet = [...new Set(chars)].sort();
  const count = new Map<string, number>();
  const frames: PatternFrame[] = [];
  let left = 0;
  let right = -1;
  let best = 0;
  let bestStart = 0;

  /** `moving` = index entering or leaving the window; `changed` = character whose count changed. */
  const snap = (line: number, caption: string, moving?: number, changed?: string) => {
    const sRole = (i: number): Role | undefined => (i === moving ? 'active' : i < left ? 'muted' : i <= right ? 'compare' : undefined);
    const windowCells = right >= left ? chars.slice(left, right + 1) : [];
    const rows: SceneRow[] = [
      { label: 's', cells: cellsOf(chars, sRole, (i) => i <= right && (i === left || i === right)) },
      { label: 'window', offset: left, cells: cellsOf(windowCells, (j) => (left + j === moving ? 'active' : 'compare')) },
      { label: 'best', offset: bestStart, cells: cellsOf(chars.slice(bestStart, bestStart + best), () => 'done') },
    ];
    frames.push({
      line,
      caption,
      vars: [
        ['left', left],
        ['right', right < 0 ? '-' : right],
        ['distinct in window', count.size],
        ['k', k],
        ['best', best],
      ],
      state: {
        array: {
          items: barsOf(alphabet.map((c) => count.get(c) ?? 0)),
          roles: alphabet.map((c): Role => (c === changed ? 'active' : count.has(c) ? 'compare' : 'idle')),
          pointers: Object.fromEntries(alphabet.map((c, i) => [i, c])),
          range: { lo: 0, hi: alphabet.length - 1, label: 'count in window' },
        },
        rows,
        rowIndices: n,
      },
    });
  };

  snap(
    0,
    `Longest stretch of "${s}" with at most ${plural(k, 'distinct character')}: grow the window on the right, and whenever it holds ` +
      `more than ${k} distinct, shrink it from the left. The bars count each character inside the window.`,
  );
  for (right = 0; right < n; right++) {
    const c = chars[right];
    count.set(c, (count.get(c) ?? 0) + 1);
    snap(
      2,
      `Expand: take s[${right}] = '${c}' into the window (count of '${c}' is now ${count.get(c)}). ` +
        `It holds ${plural(count.size, 'distinct character')}${count.size > k ? `, more than k = ${k}` : ` (k = ${k})`}.`,
      right,
      c,
    );
    if (count.size > k) {
      snap(
        3,
        `${count.size} distinct > k = ${k}: the window is invalid, and so is every window that contains it. ` +
          `Keeping left where it is can never pay off, so move it right until the window is valid again.`,
      );
      while (count.size > k) {
        const lc = chars[left];
        const was = count.get(lc)!;
        if (was === 1) count.delete(lc);
        else count.set(lc, was - 1);
        const moving = left;
        left++;
        snap(
          4,
          `Shrink: drop s[${moving}] = '${lc}' (count ${was} -> ${was - 1})` +
            (was === 1 ? `. '${lc}' is gone from the window, which now holds ${count.size} distinct.` : `. Still ${count.size} distinct.`),
          moving,
          lc,
        );
      }
    }
    const len = right - left + 1;
    const improved = len > best;
    if (improved) {
      best = len;
      bestStart = left;
    }
    snap(
      5,
      `s[${left}..${right}] = "${s.slice(left, right + 1)}" is valid (${count.size} <= ${k} distinct) and is the longest valid window ` +
        `ending at ${right}, length ${len}. ${improved ? `New best: ${len}.` : `Best stays ${best}.`}`,
    );
  }
  right = n - 1;
  snap(
    6,
    `Done: the longest window with at most ${plural(k, 'distinct character')} is "${s.slice(bestStart, bestStart + best)}", length ${best}. ` +
      `Each character enters once on the right and leaves at most once on the left: O(n).`,
  );
  return frames;
}

// ---------------------------------------------------------------- prefix sums

export interface RangeQueryInput {
  values: number[];
  queries: Array<[number, number]>;
}

export function parseRangeQueries(text: string): RangeQueryInput {
  const example = '3, 1, 4, 1, 5; queries 1-3, 0-4';
  const { main, opts } = splitOptions(text, ['queries'], example);
  const values = parseIntList(main, { min: 1, max: 16, lo: -99, hi: 99 });
  const queries = listOption(opts, 'queries', 6, example).map((q) => parseRange(q, values.length, 'query'));
  return { values, queries };
}

/** Mirrors PrefixSum and range_sum_queries (Problem_Patterns/Prefix Sum Difference Array/Python/prefix_sum.py). */
export function prefixSumTrace({ values: a, queries }: RangeQueryInput): PatternFrame[] {
  const n = a.length;
  const P: Array<number | null> = [0, ...a.map(() => null)];
  const answers: Array<number | null> = queries.map(() => null);
  const frames: PatternFrame[] = [];

  interface Look {
    aRole?: (i: number) => Role | undefined;
    pRoles?: Record<number, Role>;
    range?: { lo: number; hi: number; label?: string };
    ptr?: Record<number, string>;
    current?: number;
    vars?: Vars;
  }
  const snap = (line: number | undefined, caption: string, o: Look = {}) => {
    const aRole = (i: number) => o.aRole?.(i);
    frames.push({
      line,
      caption,
      vars: o.vars ?? [],
      state: {
        array: { items: barsOf(a), roles: a.map((_, i) => aRole(i) ?? 'idle'), pointers: o.ptr, range: o.range },
        rows: [
          { label: 'a', cells: cellsOf(a, aRole) },
          { label: 'P', cells: cellsOf(P, (i) => o.pRoles?.[i]) },
        ],
        rowIndices: n + 1,
        strips: [
          strip(
            'Queries',
            queries.map(([l, r], q) => ({
              text: `sum(${l}..${r}) = ${answers[q] ?? '?'}`,
              role: q === o.current ? 'active' : answers[q] !== null ? 'done' : undefined,
            })),
          ),
        ],
      },
    });
  };

  snap(0, `P[0] = 0: the sum of the empty prefix. P[i] will hold a[0] + ... + a[i-1], the first i values, so P has n + 1 = ${n + 1} entries.`, {
    pRoles: { 0: 'active' },
  });
  for (let i = 0; i < n; i++) {
    P[i + 1] = P[i]! + a[i];
    snap(1, `P[${i + 1}] = P[${i}] + a[${i}] = ${P[i]} + ${a[i]} = ${P[i + 1]}: the first ${plural(i + 1, 'value')} sum to ${P[i + 1]}.`, {
      aRole: (j) => (j === i ? 'active' : j < i ? 'compare' : undefined),
      pRoles: { [i]: 'compare', [i + 1]: 'active' },
      range: { lo: 0, hi: i, label: `P[${i + 1}]` },
      ptr: { [i]: 'i' },
      vars: [['i', i], [`P[${i + 1}]`, P[i + 1]!]],
    });
  }
  queries.forEach(([l, r], q) => {
    const look: Look = {
      aRole: (j) => (j >= l && j <= r ? 'compare' : j < l ? 'muted' : undefined),
      pRoles: { [l]: 'compare', [r + 1]: 'compare' },
      range: { lo: l, hi: r, label: `a[${l}..${r}]` },
      ptr: pointers([l, 'l'], [r, 'r']),
      current: q,
      vars: [['l', l], ['r', r]],
    };
    snap(
      2,
      `Query ${q + 1}: the sum of a[${l}..${r}]. P[${r + 1}] covers a[0..${r}] and P[${l}] covers ` +
        `${l === 0 ? 'nothing' : `a[0..${l - 1}]`}, so their difference is exactly a[${l}..${r}].`,
      look,
    );
    answers[q] = P[r + 1]! - P[l]!;
    snap(
      3,
      `sum(${l}..${r}) = P[${r + 1}] - P[${l}] = ${P[r + 1]} - ${P[l]} = ${answers[q]}. Two lookups and one subtraction, ` +
        `whether the range holds one value or all ${n}.`,
      { ...look, aRole: (j) => (j >= l && j <= r ? 'done' : j < l ? 'muted' : undefined), pRoles: { [l]: 'active', [r + 1]: 'active' }, vars: [['l', l], ['r', r], ['answer', answers[q]!]] },
    );
  });
  snap(
    undefined,
    `Done: ${plural(queries.length, 'query')} answered in O(1) each after one O(n) pass. Adding up each range directly would cost up to n additions per query.`,
    { vars: [['queries', queries.length]] },
  );
  return frames;
}

// ---------------------------------------------------------------- difference array

export interface RangeUpdate {
  l: number;
  r: number;
  v: number;
}

export interface RangeUpdateInput {
  values: number[];
  updates: RangeUpdate[];
}

export function parseRangeUpdates(text: string): RangeUpdateInput {
  const example = '0, 0, 0, 0, 0; add 0-2 +5, 1-3 +3';
  const { main, opts } = splitOptions(text, ['add'], example);
  const values = parseIntList(main, { min: 1, max: 16, lo: -99, hi: 99 });
  const updates = listOption(opts, 'add', 6, example).map((u) => {
    const m = u.match(/^(\d+\s*(?:-|\.\.|:)\s*\d+)\s+([+-]?\d+)$/);
    if (!m) throw new InputError(`Cannot read the update "${u}". Write it like "1-3 +5" (add 5 to indices 1..3).`);
    const [l, r] = parseRange(m[1], values.length, 'update');
    const v = Number(m[2]);
    if (v < -50 || v > 50) throw new InputError(`Keep update amounts between -50 and 50 (got ${v}).`);
    return { l, r, v };
  });
  return { values, updates };
}

/** Mirrors DifferenceArray and range_updates (Problem_Patterns/Prefix Sum Difference Array/Python/prefix_sum.py). */
export function differenceArrayTrace({ values: a, updates }: RangeUpdateInput): PatternFrame[] {
  const n = a.length;
  const D = new Array<number>(n + 1).fill(0);
  const added: Array<number | null> = a.map(() => null);
  const result = [...a];
  const frames: PatternFrame[] = [];

  interface Look {
    barRole?: (i: number) => Role | undefined;
    dRoles?: Record<number, Role>;
    range?: { lo: number; hi: number; label?: string };
    ptr?: Record<number, string>;
    current?: number;
    applied: number;
    vars?: Vars;
  }
  const snap = (line: number | undefined, caption: string, o: Look) => {
    const barRole = (i: number) => o.barRole?.(i);
    frames.push({
      line,
      caption,
      vars: o.vars ?? [],
      state: {
        array: { items: barsOf(result), roles: result.map((_, i) => barRole(i) ?? 'idle'), pointers: o.ptr, range: o.range },
        rows: [
          { label: 'D', cells: cellsOf(D, (i) => o.dRoles?.[i]) },
          { label: 'running', cells: cellsOf(added, (i) => o.dRoles?.[i] === 'active' && added[i] !== null ? 'active' : undefined) },
        ],
        rowIndices: n + 1,
        strips: [
          strip(
            'Updates',
            updates.map((u, q) => ({
              text: `a[${u.l}..${u.r}] ${signed(u.v)}`,
              role: q === o.current ? 'active' : q < o.applied ? 'done' : undefined,
            })),
          ),
        ],
      },
    });
  };

  snap(0, `D starts as ${n + 1} zeros (one spare slot past the end). Instead of touching every cell of a range, each update writes only its two ends into D.`, {
    applied: 0,
  });
  updates.forEach(({ l, r, v }, q) => {
    const range = { lo: l, hi: r, label: signed(v) };
    D[l] += v;
    snap(2, `Update ${q + 1}: add ${v} to a[${l}..${r}]. D[${l}] += ${v}, so the running sum of D carries ${signed(v)} from index ${l} on.`, {
      range,
      ptr: pointers([l, 'l'], [r, 'r']),
      dRoles: { [l]: 'active' },
      current: q,
      applied: q,
      vars: [['l', l], ['r', r], ['v', v]],
    });
    D[r + 1] -= v;
    snap(
      3,
      `D[${r + 1}] -= ${v} cancels it again from index ${r + 1} on` +
        (r + 1 === n ? ` (D[${n}] is the spare slot past the end, so nothing inside the array is cancelled)` : '') +
        `. Two writes, however long the range.`,
      { range, ptr: pointers([l, 'l'], [r, 'r']), dRoles: { [l]: 'compare', [r + 1]: 'active' }, current: q, applied: q, vars: [['l', l], ['r', r], ['v', v]] },
    );
  });
  snap(
    4,
    `All ${plural(updates.length, 'update')} are recorded, yet the array has not changed. One sweep turns D into the totals: the running sum of D at index i is what was added to a[i].`,
    { applied: updates.length, vars: [['cur', 0]] },
  );
  let cur = 0;
  for (let i = 0; i < n; i++) {
    cur += D[i];
    added[i] = cur;
    result[i] = a[i] + cur;
    snap(
      5,
      `cur += D[${i}] gives ${cur}: the updates whose range covers index ${i} have started and not been cancelled yet. ` + `a[${i}] = ${a[i]} ${cur < 0 ? '-' : '+'} ${Math.abs(cur)} = ${result[i]}.`,
      {
        barRole: (j) => (j === i ? 'active' : j < i ? 'done' : undefined),
        dRoles: { [i]: 'active' },
        ptr: { [i]: 'i' },
        applied: updates.length,
        vars: [['i', i], ['D[i]', D[i]], ['cur', cur], [`a[${i}]`, result[i]]],
      },
    );
  }
  snap(
    undefined,
    `Done: ${plural(updates.length, 'range update')} cost two writes each plus one O(n) sweep, instead of up to n writes per update.`,
    { barRole: () => 'done', applied: updates.length, vars: [['updates', updates.length]] },
  );
  return frames;
}

// ---------------------------------------------------------------- monotonic stack

export function parseValues(text: string): number[] {
  return parseIntList(text, { min: 1, max: 16, lo: -99, hi: 99 });
}

/** Mirrors next_greater_element (Problem_Patterns/Monotonic Stack/Python/monotonic_stack.py); -1 is drawn as an empty set. */
export function nextGreaterTrace(a: number[]): PatternFrame[] {
  const n = a.length;
  const answer: Array<number | null> = a.map(() => null);
  const stack: number[] = [];
  const frames: PatternFrame[] = [];
  let finished = false;

  const snap = (line: number | undefined, caption: string, i?: number, popped?: number) => {
    const top = stack[stack.length - 1];
    const role = (j: number): Role =>
      j === i ? 'active' : answer[j] !== null ? 'done' : stack.includes(j) ? (finished ? 'muted' : 'compare') : 'idle';
    frames.push({
      line,
      caption,
      vars: [
        ['i', i ?? '-'],
        ['stack size', stack.length],
        ['answered', answer.filter((v) => v !== null).length],
      ],
      state: {
        array: {
          items: barsOf(a),
          roles: a.map((_, j) => role(j)),
          pointers: pointers(i !== undefined && [i, 'i'], top !== undefined && !finished && [top, 'top'], popped !== undefined && [popped, 'pop']),
        },
        rows: [
          { label: 'a', cells: cellsOf(a, role) },
          {
            label: 'next >',
            cells: cellsOf(
              answer.map((v, j) => (v !== null ? v : finished && stack.includes(j) ? SYM.emptySet : null)),
              (j) => (j === popped ? 'active' : answer[j] !== null ? 'done' : undefined),
            ),
          },
        ],
        rowIndices: n,
        strips: [strip('Stack, bottom to top', stack.map((j) => ({ text: `a[${j}]=${a[j]}`, role: finished ? undefined : ('compare' as Role) })))],
      },
    });
  };

  snap(
    0,
    `Scan left to right. The stack holds the indices still waiting for a bigger value to their right. ` +
      `Invariant: their values never increase from bottom to top.`,
  );
  for (let i = 0; i < n; i++) {
    snap(1, `a[${i}] = ${a[i]} arrives. ${stack.length ? 'It may be the answer for the waiting indices on top of the stack.' : 'Nothing is waiting yet.'}`, i);
    while (stack.length && a[stack[stack.length - 1]] < a[i]) {
      const top = stack.pop()!;
      answer[top] = a[i];
      snap(
        3,
        `a[${top}] = ${a[top]} < ${a[i]}, and every value between them is at most ${a[top]} (otherwise it would have popped ${top} already), ` +
          `so ${a[i]} is the first bigger value to the right of index ${top}. Record it and pop.`,
        i,
        top,
      );
    }
    if (stack.length) {
      const top = stack[stack.length - 1];
      snap(
        2,
        `a[${top}] = ${a[top]} >= ${a[i]}: ${a[i]} does not beat the top, and the indices below it hold values at least as big, ` + `so it beats none of them. Stop popping.`,
        i,
      );
    }
    stack.push(i);
    snap(
      4,
      `Push ${i}: it now waits for its own next greater value. The stack still never increases upward (${stack.map((j) => a[j]).join(', ')}).`,
      i,
    );
  }
  finished = true;
  snap(
    5,
    stack.length
      ? `End of the array: ${stack.length === 1 ? `index ${stack[0]} never saw` : `indices ${stack.join(', ')} never saw`} a bigger value, so the answer stays -1 (drawn as ${SYM.emptySet}).`
      : 'End of the array: every index found a bigger value.',
  );
  snap(
    undefined,
    `Done: next greater = [${answer.map((v) => v ?? -1).join(', ')}]. Each index is pushed once and popped at most once, so the scan is O(n).`,
  );
  return frames;
}

// ---------------------------------------------------------------- monotonic queue

export interface WindowInput {
  values: number[];
  k: number;
}

export function parseWindow(text: string): WindowInput {
  const example = '1, 3, -1, -3, 5, 3, 6, 7; k 3';
  const { main, opts } = splitOptions(text, ['k'], example);
  const values = parseIntList(main, { min: 1, max: 16, lo: -99, hi: 99 });
  const k = intOption(opts, 'k', 1, values.length, example);
  return { values, k };
}

/** Mirrors sliding_window_max (Problem_Patterns/Monotonic Queue/Python/monotonic_queue.py). */
export function windowMaxTrace({ values: a, k }: WindowInput): PatternFrame[] {
  const n = a.length;
  const dq: number[] = [];
  const out: Array<number | null> = Array.from({ length: n - k + 1 }, () => null);
  const frames: PatternFrame[] = [];

  /** `gone` = index just removed from the deque (labelled "out" or "pop"). */
  const snap = (line: number | undefined, caption: string, i?: number, o: { gone?: [number, string]; front?: boolean } = {}) => {
    const lo = i === undefined ? 0 : Math.max(0, i - k + 1);
    const role = (j: number): Role =>
      o.front && j === dq[0] ? 'done' : j === i ? 'active' : dq.includes(j) ? 'compare' : i !== undefined && j < lo ? 'muted' : 'idle';
    frames.push({
      line,
      caption,
      vars: [
        ['i', i ?? '-'],
        ['window', i === undefined ? '-' : `${lo}..${i}`],
        ['deque size', dq.length],
        ['k', k],
      ],
      state: {
        array: {
          items: barsOf(a),
          roles: a.map((_, j) => role(j)),
          pointers: pointers(i !== undefined && [i, 'i'], dq.length > 0 && i !== undefined && [dq[0], 'front'], o.gone),
          range: i === undefined ? undefined : { lo, hi: i, label: i < k - 1 ? 'window (filling)' : 'window' },
        },
        rows: [
          { label: 'a', cells: cellsOf(a, role) },
          { label: 'max', offset: k - 1, cells: cellsOf(out, (q) => (o.front && q === (i ?? 0) - k + 1 ? 'active' : out[q] !== null ? 'done' : undefined)) },
        ],
        rowIndices: n,
        strips: [
          strip(
            'Deque, front to back',
            dq.map((j, idx) => ({ text: `a[${j}]=${a[j]}`, role: (o.front && idx === 0 ? 'done' : 'compare') as Role })),
          ),
        ],
      },
    });
  };

  snap(
    0,
    `Slide a window of size ${k} and keep a deque of indices whose values strictly decrease from front to back, ` + `so the front is always the window maximum.`,
  );
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - k + 1);
    snap(1, `a[${i}] = ${a[i]} enters; the window is a[${lo}..${i}]${i < k - 1 ? `, not full yet (${i + 1} of ${k})` : ''}.`, i);
    while (dq.length && dq[0] <= i - k) {
      const j = dq.shift()!;
      snap(
        2,
        `Front index ${j} <= ${i} - ${k} = ${i - k}: a[${j}] = ${a[j]} slid out of the window, so it can no longer be the maximum. Drop it from the front.`,
        i,
        { gone: [j, 'out'] },
      );
    }
    while (dq.length && a[dq[dq.length - 1]] <= a[i]) {
      const j = dq.pop()!;
      snap(
        3,
        `a[${j}] = ${a[j]} <= ${a[i]}: index ${j} is older and not bigger, so it leaves the window first and can never be the maximum while ${a[i]} is there. Pop it from the back.`,
        i,
        { gone: [j, 'pop'] },
      );
    }
    dq.push(i);
    snap(4, `Append ${i}. Deque values ${dq.map((j) => a[j]).join(' > ')}: still decreasing, so the front holds the largest.`, i);
    if (i >= k - 1) {
      out[i - k + 1] = a[dq[0]];
      snap(5, `The window a[${i - k + 1}..${i}] is full and its maximum sits at the front: a[${dq[0]}] = ${a[dq[0]]}.`, i, { front: true });
    }
  }
  snap(
    undefined,
    `Done: window maxima [${out.join(', ')}]. Each index is appended once and removed at most once, so the scan is O(n) for any k.`,
  );
  return frames;
}

// ---------------------------------------------------------------- binary search on the answer

export interface ShipInput {
  weights: number[];
  days: number;
}

export function parseShip(text: string): ShipInput {
  const example = '1, 2, 3, 4, 5, 6, 7, 8, 9, 10; days 5';
  const { main, opts } = splitOptions(text, ['days'], example);
  const weights = parseIntList(main, { min: 1, max: 12, lo: 1, hi: 50, what: 'package weights' });
  const days = intOption(opts, 'days', 0, 20, example);
  return { weights, days };
}

/** Greedy day count for one capacity, as in can_ship. */
export function daysNeeded(weights: number[], capacity: number): number {
  let days = 1;
  let load = 0;
  for (const w of weights) {
    if (load + w > capacity) {
      days++;
      load = w;
    } else load += w;
  }
  return days;
}

/** Capacities drawn on the answer axis: every one if few, else the probed ones and the bounds, with gaps (null). */
function capacityAxis(lo: number, hi: number, keys: number[]): Array<number | null> {
  if (hi - lo + 1 <= 24) return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const sorted = [...new Set([lo, hi, ...keys])].filter((c) => c >= lo && c <= hi).sort((x, y) => x - y);
  const axis: Array<number | null> = [];
  sorted.forEach((c, idx) => {
    if (idx > 0 && c - sorted[idx - 1] > 1) axis.push(null);
    axis.push(c);
  });
  return axis;
}

/** Mirrors find_min_capacity and binary_search_answer (Problem_Patterns/Binary Search on Answer/Python). */
export function shipCapacityTrace({ weights: w, days: D }: ShipInput): PatternFrame[] {
  const n = w.length;
  const lo0 = Math.max(...w);
  const hi0 = w.reduce((s, x) => s + x, 0);

  // Dry run, only to know which capacities get probed, so the axis keeps one layout for the whole run.
  const keys: number[] = [];
  for (let lo = lo0, hi = hi0; lo <= hi; ) {
    const mid = lo + Math.floor((hi - lo) / 2);
    keys.push(mid);
    if (daysNeeded(w, mid) <= D) {
      keys.push(mid - 1);
      hi = mid - 1;
    } else lo = mid + 1;
  }
  const axis = capacityAxis(lo0, hi0, keys);

  const frames: PatternFrame[] = [];
  const probed = new Map<number, number>();
  let lo = lo0;
  let hi = hi0;
  let answer = -1;
  let mid: number | undefined;
  let probes = 0;
  // Packing state of the capacity being checked.
  let dayOf: number[] = [];
  let loads: number[] = [];
  let current: number | undefined;

  const statusOf = (c: number): Role | undefined => {
    if (lo > hi && c === answer) return 'done';
    if (c === mid && lo <= hi) return 'active';
    if (c < lo) return 'bad';
    if (c > hi) return 'good';
    return undefined;
  };
  const snap = (line: number | undefined, caption: string) => {
    const day = dayOf.length ? dayOf[dayOf.length - 1] : 0;
    const barRole = (j: number): Role => (j === current ? 'active' : j < dayOf.length ? (dayOf[j] === day ? 'compare' : 'done') : 'idle');
    const dayStart = dayOf.indexOf(day);
    frames.push({
      line,
      caption,
      vars: [
        ['lo', lo],
        ['hi', hi],
        ['mid', mid ?? '-'],
        ['days needed', dayOf.length ? day : '-'],
        ['D', D],
        ['answer', answer],
      ],
      state: {
        array: {
          items: barsOf(w),
          roles: w.map((_, j) => barRole(j)),
          pointers: Object.fromEntries(dayOf.map((d, j) => [j, `d${d}`])),
          range: dayOf.length && mid !== undefined ? { lo: dayStart, hi: dayOf.length - 1, label: `day ${day}: ${loads[day - 1]}/${mid}` } : undefined,
        },
        rows: [
          {
            label: 'capacity',
            cells: axis.map((c) => ({
              value: c === null ? SYM.ellipsis : c,
              role: c === null ? undefined : statusOf(c),
              pointer: c !== null && c === mid && lo <= hi ? true : undefined,
            })),
          },
          { label: 'days', cells: axis.map((c) => ({ value: c === null ? null : (probed.get(c) ?? null) })) },
        ],
        strips: [strip('Day loads', loads.map((load, d) => ({ text: `d${d + 1}: ${load}`, role: d === day - 1 && current !== undefined ? ('compare' as Role) : undefined })), '-')],
      },
    });
  };

  snap(
    0,
    `A capacity below max(w) = ${lo0} cannot lift the heaviest package, and sum(w) = ${hi0} ships everything in one day, so the answer lies in [${lo0}, ${hi0}]. ` +
      `If a capacity works, every larger one works too: the yes/no line is ${SYM.cross}${SYM.cross}${SYM.cross}${SYM.check}${SYM.check}${SYM.check}, and binary search finds where it flips.`,
  );
  while (lo <= hi) {
    mid = lo + Math.floor((hi - lo) / 2);
    probes++;
    dayOf = [];
    loads = [];
    current = undefined;
    snap(2, `Probe the middle of [${lo}, ${hi}]: mid = ${mid}. Can all packages ship within ${plural(D, 'day')} at capacity ${mid}?`);
    for (let j = 0; j < n; j++) {
      current = j;
      if (!loads.length) {
        loads.push(w[j]);
        dayOf.push(1);
        snap(7, `Day 1 starts with package ${j} (weight ${w[j]}).`);
      } else if (loads[loads.length - 1] + w[j] > mid) {
        const full = loads[loads.length - 1];
        loads.push(w[j]);
        dayOf.push(loads.length);
        snap(7, `${full} + ${w[j]} = ${full + w[j]} > ${mid}: package ${j} does not fit on day ${loads.length - 1}, so that day ships ${full} and day ${loads.length} starts with ${w[j]}.`);
      } else {
        loads[loads.length - 1] += w[j];
        dayOf.push(loads.length);
        snap(8, `${loads[loads.length - 1] - w[j]} + ${w[j]} = ${loads[loads.length - 1]} <= ${mid}: package ${j} also fits on day ${loads.length}.`);
      }
    }
    current = undefined;
    const needed = loads.length;
    probed.set(mid, needed);
    const ok = needed <= D;
    snap(9, `Capacity ${mid} needs ${plural(needed, 'day')}: ${ok ? `${needed} <= ${D}, so it works` : `${needed} > ${D}, so it is too small`}.`);
    if (ok) {
      answer = mid;
      hi = mid - 1;
      snap(3, `${mid} works, so every capacity above it works too (${SYM.check}). Remember answer = ${mid} and look for a smaller one: hi = ${hi}.`);
    } else {
      lo = mid + 1;
      snap(4, `${mid} is too small, so every capacity below it is too (${SYM.cross}). Look above it: lo = ${lo}.`);
    }
  }
  dayOf = [];
  loads = [];
  mid = undefined;
  snap(
    5,
    answer === -1
      ? `lo > hi: no capacity in [${lo0}, ${hi0}] works (even ${hi0} needs 1 day, more than ${D}), so the search returns -1.`
      : `lo > hi: the line flips between ${answer - 1} and ${answer}, so ${answer} is the least capacity that ships everything in ${plural(D, 'day')}.`,
  );
  snap(
    undefined,
    `Done after ${plural(probes, 'probe')} out of ${hi0 - lo0 + 1} candidate capacities: O(n log(sum(w))) instead of checking every capacity.`,
  );
  return frames;
}
