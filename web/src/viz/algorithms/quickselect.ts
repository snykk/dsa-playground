/**
 * Randomized Quickselect, drawn with QuickselectBars: the array as bars that glide when they
 * swap, the range lo..hi still in play, the pivot as a dashed line, and the lt / i / gt pointers
 * of the three-way partition.
 *
 * Mirrors Algorithms/Randomized_Algorithms/Randomized_Quickselect/Python/quickselect.py:
 *   quickselect(arr, k, rng=None): ValueError on an empty list, IndexError for k outside
 *     [0, len(arr)); then _quickselect loops while lo < hi: pivot index rng.randint(lo, hi),
 *     _partition3 (Dutch flag: < pivot swaps with arr[lt] and both move, > pivot swaps with
 *     arr[gt] and only gt moves, == pivot only moves i) returns the band lt..gt equal to the
 *     pivot; k < lt continues left (hi = lt - 1), k > gt right (lo = gt + 1), otherwise arr[k] is
 *     returned; a range of one returns arr[lo]. The list is reordered in place, so a second
 *     select in the same script works on the reordered list, as in Python.
 *   top_k_smallest(arr, k, rng=None): [] for k <= 0, a copy for k >= len(arr), otherwise
 *     quickselect(copy, k - 1) and copy[:k]; the caller's list is untouched.
 * The draws are Python's: random.Random(seed) ported bit for bit (randomizedDraws.ts), so
 * "seed 1" here is rng = random.Random(1) there; "pivots 1 3" fixes the first draws. The golden
 * fixture runs the Python module with its random replaced by the same draws and pins every
 * draw, every partition (lt, gt and the list after it) and every result.
 *
 * Input: "[7, 2, 9, 2, 5, 2, 8]; seed 1; k 3"   (also "select 3", "top 3", "pivots 1 3")
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { Draws, MAX_SEED, parseSeed } from './randomizedDraws';

export type QsOp = { kind: 'select'; k: number } | { kind: 'top'; k: number };

export interface QsInput {
  values: number[];
  ops: QsOp[];
  seed: number;
  /** Fixed results of the first rng.randint calls. */
  pivots: number[];
}

export interface QsBar {
  /** Stable identity: a bar glides to its new slot when it is swapped. */
  id: number;
  value: number;
}

export type QsMark = '<' | '=' | '>' | '';

export interface QuickselectState {
  items: QsBar[];
  roles: Role[];
  /** Under each bar once the partition has classified it: smaller, equal or larger than the pivot. */
  marks: QsMark[];
  /** The range lo..hi that can still hold rank k (null before and after a call). */
  range: { lo: number; hi: number } | null;
  /** The pivot value (a dashed line) and the bar it was drawn from (outlined). */
  pivot: number | null;
  pivotId: number | null;
  /** lt, i and gt of _partition3. */
  pointers: Array<{ name: string; index: number }>;
  /** The rank being selected. */
  k: number | null;
  /** True while a call works on a copy (top_k_smallest). */
  copy: boolean;
  strips: StripData[];
  /** Fixed value range for the run (stabilizeQuickselect), so bars keep their scale. */
  scale?: { min: number; max: number };
}

export interface QsPartition {
  lo: number;
  hi: number;
  pivotIndex: number;
  lt: number;
  gt: number;
  /** The list (or the copy) after the partition. */
  arr: number[];
}

export interface QsStep {
  op: QsOp;
  /** The returned value (select), list (top) or null after an exception. */
  result: number | number[] | null;
  error: string | null;
  /** [a, b, value] for every rng.randint(a, b). */
  draws: Array<[number, number, number]>;
  partitions: QsPartition[];
  /** The caller's list after the call. */
  arr: number[];
}

export interface QsRun {
  frames: Array<Frame<QuickselectState>>;
  steps: QsStep[];
}

export const QS_LIMITS = { maxValues: 16, maxOps: 6, maxPivots: 30, maxFrames: 2000 };

export const QS_CODE: string[] = [
  'def quickselect(arr, k, rng=None):',
  '    if not arr: raise ValueError("arr must be non-empty")',
  '    if k < 0 or k >= len(arr): raise IndexError(f"k={k} out of range [0, {len(arr)})")',
  '    lo, hi = 0, len(arr) - 1              # _quickselect(arr, lo, hi, k, rng)',
  '    while lo < hi:',
  '        lt, gt = _partition3(arr, lo, hi, rng.randint(lo, hi))',
  '        if k < lt: hi = lt - 1',
  '        elif k > gt: lo = gt + 1',
  '        else: return arr[k]               # k is inside the band equal to the pivot',
  '    return arr[lo]',
  'def _partition3(arr, lo, hi, pivot_idx):',
  '    pivot = arr[pivot_idx]; lt, i, gt = lo, lo, hi',
  '    while i <= gt:',
  '        if arr[i] < pivot: swap arr[lt], arr[i]; lt += 1; i += 1',
  '        elif arr[i] > pivot: swap arr[i], arr[gt]; gt -= 1',
  '        else: i += 1',
  '    return lt, gt                         # arr[lt..gt] == pivot',
  'def top_k_smallest(arr, k, rng=None):',
  '    if k <= 0: return []',
  '    if k >= len(arr): return list(arr)',
  '    arr = list(arr); quickselect(arr, k - 1, rng)',
  '    return arr[:k]',
];

/* ---------- input ---------- */

const OP_NAMES: Record<string, QsOp['kind']> = {
  k: 'select',
  select: 'select',
  kth: 'select',
  quickselect: 'select',
  rank: 'select',
  top: 'top',
  topk: 'top',
  top_k: 'top',
  top_k_smallest: 'top',
};

function parseNumbers(text: string, what: string): number[] {
  return text
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => {
      if (!/^-?\d+$/.test(t)) throw new InputError(`${what}: "${t}" is not a whole number.`);
      return Number(t) || 0;
    });
}

/** Parse "[7, 2, 9, 2, 5, 2, 8]; seed 1; pivots 1 3; k 3, top 2". */
export function parseQuickselect(text: string): QsInput {
  let values: number[] | undefined;
  let rest = text;
  const bracket = text.match(/\[([^\]]*)\]/);
  if (bracket) {
    values = parseNumbers(bracket[1], 'The array');
    rest = text.replace(bracket[0], ' ');
  }
  let seed: number | undefined;
  let pivots: number[] | undefined;
  const ops: QsOp[] = [];
  for (const seg of rest
    .split(/[;,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)) {
    const s = parseSeed(seg);
    if (s !== undefined) {
      if (seed !== undefined) throw new InputError('Give the seed ("seed 7") only once.');
      if (s > MAX_SEED) throw new InputError(`The seed goes up to ${MAX_SEED}.`);
      seed = s;
      continue;
    }
    const piv = seg.match(/^pivots?\s*[:=]?\s*(.*)$/i);
    if (piv) {
      if (pivots !== undefined) throw new InputError('Give the fixed pivots ("pivots 1 3") only once.');
      pivots = parseNumbers(piv[1], 'pivots');
      if (pivots.length === 0) throw new InputError('"pivots" needs at least one index, e.g. "pivots 1 3".');
      if (pivots.length > QS_LIMITS.maxPivots) throw new InputError(`At most ${QS_LIMITS.maxPivots} fixed pivots.`);
      continue;
    }
    const op = seg.match(/^([A-Za-z_]+)\s*(?:[:=(]\s*)?(-?\d+)\s*\)?$/);
    if (op && OP_NAMES[op[1].toLowerCase()]) {
      ops.push({ kind: OP_NAMES[op[1].toLowerCase()], k: Number(op[2]) || 0 });
      continue;
    }
    if (values === undefined && /^-?\d+(\s+-?\d+)*$/.test(seg)) {
      values = parseNumbers(seg, 'The array');
      continue;
    }
    throw new InputError(`Cannot read "${seg}". Write the array in brackets, then "k 3" (select rank 3) or "top 3", and optionally "seed 7" or "pivots 1 3", separated by semicolons.`);
  }
  if (values === undefined) throw new InputError('Give the array in brackets, e.g. "[7, 2, 9, 2, 5, 2, 8]; k 3".');
  if (values.length > QS_LIMITS.maxValues) throw new InputError(`Up to ${QS_LIMITS.maxValues} values, so every bar fits (got ${values.length}).`);
  for (const v of values) if (v < -99 || v > 99) throw new InputError(`Values go from -99 to 99 (got ${v}).`);
  if (ops.length === 0) throw new InputError('Add a rank to select, e.g. "k 3" (0-indexed: k 0 is the minimum), or "top 3".');
  if (ops.length > QS_LIMITS.maxOps) throw new InputError(`At most ${QS_LIMITS.maxOps} operations (got ${ops.length}).`);
  for (const op of ops) if (Math.abs(op.k) > 99) throw new InputError(`k goes from -99 to 99 here (got ${op.k}).`);
  const input: QsInput = { values, ops, seed: seed ?? 1, pivots: pivots ?? [] };
  let run: QsRun;
  try {
    run = quickselectTrace(input);
  } catch (e) {
    if (e instanceof RangeError) throw new InputError(`A fixed pivot is outside its range: ${e.message}. Each pivot must lie in lo..hi of its round.`);
    throw e;
  }
  const used = run.steps.reduce((s, st) => s + st.draws.length, 0);
  if (input.pivots.length > used) {
    throw new InputError(`Only ${used} pivot${used === 1 ? ' is' : 's are'} drawn in this run, but ${input.pivots.length} were fixed.`);
  }
  if (run.frames.length > QS_LIMITS.maxFrames) throw new InputError(`This run takes ${run.frames.length} steps, more than ${QS_LIMITS.maxFrames}: use fewer values or operations.`);
  return input;
}

/* ---------- tracer ---------- */

const pyList = (xs: number[]) => `[${xs.join(', ')}]`;

/** Trace the script on one list, with one generator for every call, as Python would. */
export function quickselectTrace(input: QsInput): QsRun {
  const draws = new Draws(input.seed, input.pivots);
  const frames: Array<Frame<QuickselectState>> = [];
  const steps: QsStep[] = [];
  let items: QsBar[] = input.values.map((value, id) => ({ id, value }));
  const results: StripItem[] = [];
  const drawTokens: StripItem[] = [];

  interface View {
    roles?: Record<number, Role>;
    marks?: QsMark[];
    range?: { lo: number; hi: number } | null;
    pivot?: number | null;
    pivotId?: number | null;
    pointers?: Array<{ name: string; index: number }>;
    k?: number | null;
    copy?: boolean;
    muteOutside?: boolean;
  }

  const snap = (line: number | undefined, caption: string, v: View, vars: Array<[string, string | number]> = []) => {
    const n = items.length;
    const range = v.range ?? null;
    const roles: Role[] = items.map((_, i) => v.roles?.[i] ?? (range && v.muteOutside !== false && (i < range.lo || i > range.hi) ? 'muted' : 'idle'));
    const strips: StripData[] = [];
    if (drawTokens.length) strips.push({ label: 'draws', items: drawTokens.map((t) => ({ ...t })) });
    if (results.length) strips.push({ label: 'returned', items: results.map((t) => ({ ...t })) });
    frames.push({
      line,
      caption,
      state: {
        items: items.map((it) => ({ ...it })),
        roles,
        marks: v.marks ?? Array<QsMark>(n).fill(''),
        range,
        pivot: v.pivot ?? null,
        pivotId: v.pivotId ?? null,
        pointers: v.pointers ?? [],
        k: v.k ?? null,
        copy: v.copy ?? false,
        strips,
      },
      vars: [...vars, ['seed', input.seed], ['draws', draws.log.length]],
    });
  };

  const val = (i: number) => items[i].value;
  const swap = (i: number, j: number) => {
    [items[i], items[j]] = [items[j], items[i]];
  };

  /** quickselect(arr, k) on `items`; returns arr[k] or throws a Python exception message. */
  const select = (k: number, step: QsStep, copy: boolean): number | string => {
    const n = items.length;
    const kv: Array<[string, string | number]> = [['k', k]];
    if (n === 0) {
      snap(1, 'arr is empty, so there is no element of any rank: raise ValueError("arr must be non-empty").', { k: null, copy }, kv);
      return 'ValueError: arr must be non-empty';
    }
    if (k < 0 || k >= n) {
      snap(2, `k = ${k} is not a valid 0-indexed rank of ${n} elements: raise IndexError("k=${k} out of range [0, ${n})").`, { k: null, copy, roles: Object.fromEntries(items.map((_, i) => [i, 'bad' as Role])) }, kv);
      return `IndexError: k=${k} out of range [0, ${n})`;
    }
    let lo = 0;
    let hi = n - 1;
    snap(
      3,
      `quickselect(arr, ${k}): find the value that would sit at index ${k} if arr were sorted (k = 0 is the minimum). It is somewhere in arr[${lo}..${hi}]; each round keeps only the part that can still hold it.`,
      { range: { lo, hi }, k, copy },
      [...kv, ['lo', lo], ['hi', hi]],
    );
    while (lo < hi) {
      const d = draws.randint(lo, hi);
      step.draws.push([lo, hi, d.value]);
      drawTokens.forEach((t) => (t.role = 'idle'));
      drawTokens.push({ text: `${d.call} = ${d.value}`, role: 'active' });
      const pivotIndex = d.value;
      const pivot = val(pivotIndex);
      const pivotId = items[pivotIndex].id;
      let lt = lo;
      let i = lo;
      let gt = hi;
      const marks = (): QsMark[] => items.map((_, x) => (x < lo || x > hi ? '' : x < lt ? '<' : x < i ? '=' : x > gt ? '>' : ''));
      const roles = (examined?: number): Record<number, Role> => {
        const out: Record<number, Role> = {};
        items.forEach((it, x) => {
          if (x < lo || x > hi) out[x] = 'muted';
          else if (it.id === examined) out[x] = 'compare';
          else if (x < lt || x > gt) out[x] = 'done';
          else if (x < i) out[x] = 'active';
          else out[x] = 'idle';
        });
        return out;
      };
      const ptrs = () => [
        { name: 'lt', index: lt },
        { name: 'i', index: i },
        { name: 'gt', index: gt },
      ];
      const pv = (): Array<[string, string | number]> => [...kv, ['lo', lo], ['hi', hi], ['pivot', pivot], ['lt', lt], ['i', i], ['gt', gt]];
      snap(
        5,
        `rng.randint(${lo}, ${hi}) = ${pivotIndex} (${draws.source(d)}): the pivot is arr[${pivotIndex}] = ${pivot}, each of the ${hi - lo + 1} indexes equally likely. _partition3 starts with lt = i = ${lo} and gt = ${hi}: nothing is classified yet.`,
        { range: { lo, hi }, roles: roles(), marks: marks(), pivot, pivotId, pointers: ptrs(), k, copy },
        pv(),
      );
      while (i <= gt) {
        const x = val(i);
        const id = items[i].id;
        let caption: string;
        let line: number;
        if (x < pivot) {
          caption =
            lt === i
              ? `arr[${i}] = ${x} < ${pivot}: it is already at lt, so it joins the smaller keys in place; lt and i move right.`
              : `arr[${i}] = ${x} < ${pivot}: swap it with arr[lt = ${lt}] = ${val(lt)}, the first key equal to the pivot, so the smaller keys stay together on the left; lt and i move right.`;
          swap(lt, i);
          lt++;
          i++;
          line = 13;
        } else if (x > pivot) {
          caption = `arr[${i}] = ${x} > ${pivot}: swap it with arr[gt = ${gt}] = ${val(gt)} into the larger keys on the right; gt moves left. i stays, because the key that came from gt is not classified yet.`;
          swap(i, gt);
          gt--;
          line = 14;
        } else {
          caption = `arr[${i}] = ${x} == ${pivot}: it joins the band of keys equal to the pivot; only i moves.`;
          i++;
          line = 15;
        }
        snap(line, caption, { range: { lo, hi }, roles: roles(id), marks: marks(), pivot, pivotId, pointers: ptrs(), k, copy }, pv());
      }
      step.partitions.push({ lo, hi, pivotIndex, lt, gt, arr: items.map((it) => it.value) });
      snap(
        16,
        `i passed gt: every key of arr[${lo}..${hi}] is classified. _partition3 returns (lt, gt) = (${lt}, ${gt}): ${lt === lo ? 'no smaller keys' : `arr[${lo}..${lt - 1}] < ${pivot}`}, arr[${lt}..${gt}] == ${pivot}${gt === hi ? ', no larger keys' : `, arr[${gt + 1}..${hi}] > ${pivot}`}.`,
        { range: { lo, hi }, roles: roles(), marks: marks(), pivot, pivotId, pointers: [{ name: 'lt', index: lt }, { name: 'gt', index: gt }], k, copy },
        pv(),
      );
      if (k < lt) {
        const old = hi;
        hi = lt - 1;
        snap(
          6,
          `k = ${k} < lt = ${lt}: rank ${k} is among the keys smaller than ${pivot}, so hi = lt - 1 = ${hi}. arr[${lt}..${old}] can never hold it and is dropped for good.`,
          { range: { lo, hi }, marks: marks(), k, copy },
          [...kv, ['lo', lo], ['hi', hi], ['lt', lt], ['gt', gt]],
        );
      } else if (k > gt) {
        const old = lo;
        lo = gt + 1;
        snap(
          7,
          `k = ${k} > gt = ${gt}: rank ${k} is among the keys larger than ${pivot}, so lo = gt + 1 = ${lo}. arr[${old}..${gt}] is dropped for good.`,
          { range: { lo, hi }, marks: marks(), k, copy },
          [...kv, ['lo', lo], ['hi', hi], ['lt', lt], ['gt', gt]],
        );
      } else {
        snap(
          8,
          `lt = ${lt} <= k = ${k} <= gt = ${gt}: rank ${k} falls inside the band of keys equal to the pivot, so arr[${k}] = ${val(k)} is the answer${gt > lt ? `, and ${gt - lt + 1} equal keys were settled in one pass` : ''}. Return ${val(k)}.`,
          { range: { lo, hi }, roles: { ...roles(), [k]: 'good' }, marks: marks(), pivot, pivotId, k, copy },
          [...kv, ['lo', lo], ['hi', hi], ['lt', lt], ['gt', gt]],
        );
        return val(k);
      }
    }
    snap(
      9,
      `lo == hi = ${lo}: one candidate is left, and the loop ends without another draw. Return arr[${lo}] = ${val(lo)}.`,
      { range: { lo, hi }, roles: { [lo]: 'good' }, k, copy },
      [...kv, ['lo', lo], ['hi', hi]],
    );
    return val(lo);
  };

  snap(
    undefined,
    `arr = ${pyList(input.values)}, rng = random.Random(${input.seed})${input.pivots.length ? `, with the first pivot ${input.pivots.length === 1 ? 'index' : 'indexes'} fixed to ${input.pivots.join(', ')}` : ''}. Quickselect partitions around a random pivot like Quick Sort, but keeps only the side that holds rank k.`,
    {},
  );

  for (const op of input.ops) {
    const step: QsStep = { op, result: null, error: null, draws: [], partitions: [], arr: [] };
    const before = items.map((it) => ({ ...it }));
    if (op.kind === 'select') {
      const r = select(op.k, step, false);
      if (typeof r === 'string') step.error = r;
      else step.result = r;
      results.push({ text: typeof r === 'string' ? `quickselect(arr, ${op.k}) ${SYM.rightArrow} ${r.split(':')[0]}` : `quickselect(arr, ${op.k}) = ${r}`, role: typeof r === 'string' ? 'bad' : 'good' });
    } else {
      const k = op.k;
      const n = items.length;
      if (k <= 0) {
        step.result = [];
        snap(18, `top_k_smallest(arr, ${k}): k <= 0, so the answer is [] right away: no copy, no draw.`, { k: null });
      } else if (k >= n) {
        step.result = items.map((it) => it.value);
        snap(19, `top_k_smallest(arr, ${k}): k >= len(arr) = ${n}, so every key is among the ${k} smallest: return list(arr) = ${pyList(step.result)}, a copy, with no draw.`, { k: null, roles: Object.fromEntries(items.map((_, i) => [i, 'good' as Role])) });
      } else {
        snap(20, `top_k_smallest(arr, ${k}): arr = list(arr) makes a copy (the bars below are the copy; the caller's list stays as it was), then quickselect(copy, ${k - 1}) puts the ${k} smallest keys in front.`, { k: k - 1, copy: true });
        const r = select(k - 1, step, true);
        if (typeof r === 'string') throw new Error(`top_k_smallest cannot raise here: ${r}`);
        step.result = items.slice(0, k).map((it) => it.value);
        snap(
          21,
          `return arr[:${k}] = ${pyList(step.result)}: after quickselect every key left of index ${k - 1} is <= arr[${k - 1}] = ${r}, so the first ${k} slots hold the ${k} smallest, in no particular order.`,
          { roles: Object.fromEntries(items.map((_, i) => [i, (i < k ? 'good' : 'idle') as Role])), copy: true },
        );
        items = before;
        snap(21, `The copy is discarded: the caller's arr is unchanged, ${pyList(items.map((it) => it.value))}.`, {});
      }
      results.push({ text: `top_k_smallest(arr, ${k}) = ${pyList(step.result as number[])}`, role: 'good' });
    }
    step.arr = items.map((it) => it.value);
    steps.push(step);
  }
  const last = results.map((r) => r.text).join('; ');
  snap(undefined, `Done. ${last}. The list now reads ${pyList(items.map((it) => it.value))}: quickselect reorders it in place but does not sort it.`, {});
  return { frames, steps };
}

/** Keep one bar scale for the whole run (values never change, only their order). */
export function stabilizeQuickselect(frames: Array<Frame<QuickselectState>>): Array<Frame<QuickselectState>> {
  let min = 0;
  let max = 0;
  for (const f of frames) for (const it of f.state.items) {
    min = Math.min(min, it.value);
    max = Math.max(max, it.value);
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, scale: { min, max } } }));
}
