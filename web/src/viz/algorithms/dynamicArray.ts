/**
 * Dynamic array tracer: append, pop and a[k] on a growable array.
 *
 * Mirrors Data_Structures/Linear/Array/Python/dynamic_array.py (DynamicArray):
 *   the capacity starts at 1; append on a full array first calls _resize(2 * capacity);
 *   pop raises IndexError('Pop from empty array') when n == 0, clears the vacated slot (None),
 *   and when 0 < n <= capacity // 4 calls _resize(capacity // 2);
 *   _resize allocates B = [None] * new_capacity and copies A[0..n-1] one by one;
 *   a[k] raises IndexError('Index out of range') unless 0 <= k < n (no negative indexes).
 * Golden fixtures (__fixtures__/lists.json, from web/scripts/gen_lists_fixtures.py) pin n, the
 * capacity and every slot after each operation, plus every return value and error.
 *
 * Input: "append 10 20 30, pop, get 1"  (a / p / g for short; "pop x3" pops three times)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ArrayMarkerView, ArrayValueView, DynamicArrayState } from '../renderers/DynamicArrayView';
import type { StripData, StripItem } from '../ui/molecules/Strip';

export type ArrayOp = { kind: 'append'; value: number } | { kind: 'pop' } | { kind: 'get'; index: number };

export interface ArrayStep {
  op: ArrayOp;
  n: number;
  capacity: number;
  /** The backing list self._A, None as null. */
  slots: Array<number | null>;
  /** What pop() or a[k] returned. */
  result: number | null;
  /** "IndexError: <message>" when the call raised. */
  error: string | null;
}

export interface ArrayRun {
  frames: Array<Frame<DynamicArrayState>>;
  steps: ArrayStep[];
}

export const ARRAY_LIMITS = { maxOps: 40, maxElements: 16 };

const SPLIT = /[;,\n]+/;
const INT = /^-?\d{1,3}$/;

/** Parse "append 1 2 3, pop x2, get 1, a[0]". The element count is simulated to keep the row legible. */
export function parseArrayOps(text: string, { maxOps = ARRAY_LIMITS.maxOps, maxElements = ARRAY_LIMITS.maxElements } = {}): ArrayOp[] {
  const ops: ArrayOp[] = [];
  for (const raw of text.split(SPLIT).map((t) => t.trim()).filter(Boolean)) {
    const lower = raw.toLowerCase();
    const index = lower.match(/^(?:get|g|a|arr|array)?\s*\[\s*(-?\d{1,3})\s*\]$/) ?? lower.match(/^(?:get|g)\s*\(?\s*(-?\d{1,3})\s*\)?$/);
    if (index) {
      ops.push({ kind: 'get', index: Number(index[1]) });
      continue;
    }
    const pop = lower.match(/^(?:pop|p)\s*(?:\(\s*\))?(?:\s*[x*]\s*(\d{1,2}))?$/);
    if (pop) {
      const times = pop[1] === undefined ? 1 : Number(pop[1]);
      if (times < 1) throw new InputError(`"${raw}": pop at least once.`);
      for (let i = 0; i < times; i++) ops.push({ kind: 'pop' });
      continue;
    }
    if (/^(?:pop|p)\s+-?\d+$/.test(lower)) throw new InputError(`"${raw}": pop() takes no index here; write "pop x3" to pop three times.`);
    const words = raw.replace(/[()]/g, ' ').trim().split(/\s+/);
    if (/^(?:append|a|push|add)$/i.test(words[0])) {
      if (words.length === 1) throw new InputError(`"${raw}" needs a value, e.g. "append 5".`);
      for (const w of words.slice(1)) {
        if (!INT.test(w) || Number(w) < -99) throw new InputError(`"${w}" in "${raw}" is not a whole number from -99 to 999.`);
        ops.push({ kind: 'append', value: Number(w) });
      }
      continue;
    }
    throw new InputError(`Cannot read "${raw}". Write operations like "append 5", "pop" or "get 2", separated by commas.`);
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, e.g. "append 10 20 30, pop".');
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  let n = 0;
  ops.forEach((op, i) => {
    if (op.kind === 'append') n++;
    else if (op.kind === 'pop') n = Math.max(0, n - 1);
    if (n > maxElements) {
      throw new InputError(`At most ${maxElements} elements at once, so the row stays readable (operation ${i + 1} would make ${n}).`);
    }
  });
  return ops;
}

export function formatArrayOp(op: ArrayOp): string {
  if (op.kind === 'append') return `append(${op.value})`;
  if (op.kind === 'pop') return 'pop()';
  return `a[${op.index}]`;
}

interface Tok {
  id: number;
  value: number;
}

interface SnapOpts {
  roles?: Array<[Tok | null, Role]>;
  markers?: ArrayMarkerView[];
  /** Role of block A's name, e.g. bad when a call raises. */
  roleA?: Role;
  vars?: Array<[string, string | number]>;
}

const LIFT = -0.75;

/** Trace an operation script on a DynamicArray, as dynamic_array.py runs it. */
export function traceDynamicArray(ops: ArrayOp[]): ArrayRun {
  /** self._A: the tokens in the current block. */
  let slots: Array<Tok | null> = [null];
  let gen = 1;
  let n = 0;
  /** The new block B while _resize copies into it. */
  let fresh: Array<Tok | null> | null = null;
  /** Slots of A already copied: drawn as faded stale copies while B fills. */
  const copied = new Set<number>();
  /** A value lifted above the row: being appended, or just popped. */
  let floating: { tok: Tok; col: number; ghost?: boolean } | null = null;
  let nextTok = 1;
  let growCopies = 0;
  let shrinkCopies = 0;
  let appends = 0;
  let current = -1;
  const returned: StripItem[] = [];
  const frames: Array<Frame<DynamicArrayState>> = [];
  const steps: ArrayStep[] = [];

  const cap = () => slots.length;
  const strips = (): StripData[] => {
    const s: StripData[] = [
      { label: 'Operations', items: ops.map((op, i) => ({ text: formatArrayOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })) },
    ];
    if (returned.length) s.push({ label: 'Returned', items: [...returned] });
    return s;
  };

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const roles = new Map<number, Role>();
    for (const [t, r] of o.roles ?? []) if (t) roles.set(t.id, r);
    const values: ArrayValueView[] = [];
    slots.forEach((t, i) => {
      if (!t) return;
      if (copied.has(i)) values.push({ id: `s${gen}:${i}`, value: t.value, col: i, row: 0, role: 'muted' });
      else values.push({ id: t.id, value: t.value, col: i, row: 0, role: roles.get(t.id) ?? 'idle' });
    });
    fresh?.forEach((t, i) => {
      if (t) values.push({ id: t.id, value: t.value, col: i, row: 1, role: roles.get(t.id) ?? 'idle' });
    });
    if (floating) {
      values.push({ id: floating.tok.id, value: floating.tok.value, col: floating.col, row: LIFT, role: roles.get(floating.tok.id) ?? 'active', ghost: floating.ghost });
    }
    const blocks: DynamicArrayState['blocks'] = [{ id: `blk${gen}`, label: 'A', sub: `capacity ${cap()}`, capacity: cap(), row: 0, role: o.roleA }];
    if (fresh) blocks.push({ id: `blk${gen + 1}`, label: 'B', sub: `capacity ${fresh.length}`, capacity: fresh.length, row: 1, role: 'active' });
    frames.push({
      line,
      caption,
      vars: [
        ...(o.vars ?? []),
        ['n', n],
        ['capacity', cap()],
        ['copies when growing', growCopies],
        ['growth copies per append', appends ? (growCopies / appends).toFixed(2) : '0'],
        ['copies when shrinking', shrinkCopies],
      ],
      state: {
        blocks,
        values,
        markers: [{ name: 'n', col: n, role: 'idle' }, ...(o.markers ?? [])],
        note: 'Dashed slots are allocated but hold no element. n marks the next free slot.',
        strips: strips(),
      },
    });
  };

  /** _resize(new_capacity): allocate B, copy A[0..n-1] one by one, then A = B. */
  const resize = (newCap: number, vars: Array<[string, string | number]>) => {
    const grow = newCap > cap();
    fresh = new Array<Tok | null>(newCap).fill(null);
    snap(
      13,
      `B = [None] * ${newCap}: a new block ${grow ? 'twice' : 'half'} as large. ${
        grow ? 'A block cannot grow in place (the memory after it may be in use), so every element is copied over.' : 'Moving into a smaller block gives the unused slots back.'
      }`,
      { vars },
    );
    for (let i = 0; i < n; i++) {
      const t = slots[i] as Tok;
      fresh[i] = t;
      copied.add(i);
      if (grow) growCopies++;
      else shrinkCopies++;
      snap(14, `B[${i}] = self._A[${i}]: copy ${t.value}, element ${i + 1} of ${n}. Copies like this are the cost of a resize.`, {
        roles: [[t, 'active']],
        vars: [...vars, ['i', i]],
      });
    }
    slots = fresh;
    fresh = null;
    copied.clear();
    gen++;
    snap(
      15,
      `self._A = B and capacity = ${newCap}: the old block is dropped. This resize copied ${n} element${n === 1 ? '' : 's'}${
        grow ? `; growing has copied ${growCopies} element${growCopies === 1 ? '' : 's'} over ${appends} append${appends === 1 ? '' : 's'} so far` : ''
      }.`,
      { vars },
    );
  };

  const appendOp = (v: number, vars: Array<[string, string | number]>) => {
    const tok: Tok = { id: nextTok++, value: v };
    floating = { tok, col: n };
    appends++;
    if (n === cap()) {
      snap(2, `append(${v}): n = ${n} equals the capacity ${cap()}: there is no free slot, so the array must grow first: _resize(2 * ${cap()}) = _resize(${2 * cap()}).`, {
        roles: [[tok, 'active']],
        vars,
      });
      resize(2 * cap(), vars);
    } else {
      snap(1, `append(${v}): n = ${n} is below the capacity ${cap()}, so slot ${n} is free and no resize is needed.`, { roles: [[tok, 'active']], vars });
    }
    slots[n] = tok;
    floating = null;
    n++;
    snap(3, `self._A[${n - 1}] = ${v}, then n = ${n}. Writing into a free slot is O(1).`, { roles: [[tok, 'active']], vars });
  };

  const popOp = (vars: Array<[string, string | number]>): { result: number | null; error: string | null } => {
    if (n === 0) {
      returned.push({ text: 'IndexError', role: 'bad' });
      snap(5, "pop(): n = 0, so it raises IndexError('Pop from empty array'). As if the caller caught it, the run goes on with the next operation.", {
        roleA: 'bad',
        vars,
      });
      return { result: null, error: 'IndexError: Pop from empty array' };
    }
    const tok = slots[n - 1] as Tok;
    snap(6, `val = self._A[${n - 1}] = ${tok.value}: the last element.`, { roles: [[tok, 'compare']], vars });
    slots[n - 1] = null;
    floating = { tok, col: n - 1 };
    snap(7, `self._A[${n - 1}] = None: the slot drops its reference, so the array no longer keeps ${tok.value} alive and the garbage collector can free it.`, {
      roles: [[tok, 'compare']],
      vars,
    });
    n--;
    snap(8, `n = ${n}.`, { roles: [[tok, 'compare']], vars });
    const quarter = Math.floor(cap() / 4);
    if (n > 0 && n <= quarter) {
      floating.ghost = true;
      snap(10, `0 < n = ${n} <= capacity // 4 = ${quarter}: the array is a quarter full or less, so it halves: _resize(${cap() / 2}).`, { vars });
      resize(cap() / 2, vars);
    } else {
      floating.ghost = true;
      snap(
        9,
        n === 0
          ? 'n = 0: an empty array keeps its capacity (the rule needs 0 < n), so no resize.'
          : `n = ${n} is more than capacity // 4 = ${quarter}: no shrink. Waiting for a quarter, not a half, keeps an append / pop pair at the boundary from copying every time.`,
        { vars },
      );
    }
    floating = null;
    returned.push({ text: String(tok.value) });
    snap(11, `return ${tok.value}.`, { vars });
    return { result: tok.value, error: null };
  };

  const getOp = (k: number, vars: Array<[string, string | number]>): { result: number | null; error: string | null } => {
    if (!(k >= 0 && k < n)) {
      const inBlock = k >= 0 && k < cap();
      returned.push({ text: 'IndexError', role: 'bad' });
      snap(
        17,
        k < 0
          ? `a[${k}]: k is negative, so not 0 <= k: __getitem__ raises IndexError('Index out of range'). A Python list would count from the end; this class does not.`
          : `a[${k}]: k = ${k} is not below n = ${n}${inBlock ? `. Slot ${k} exists (capacity ${cap()}) but holds no element` : ''}, so __getitem__ raises IndexError('Index out of range').`,
        { markers: inBlock ? [{ name: 'k', col: k, role: 'bad' }] : [], roleA: 'bad', vars: [...vars, ['k', k]] },
      );
      return { result: null, error: 'IndexError: Index out of range' };
    }
    const tok = slots[k] as Tok;
    snap(17, `a[${k}]: 0 <= ${k} < n = ${n}, so the index is valid.`, { roles: [[tok, 'compare']], markers: [{ name: 'k', col: k, role: 'compare' }], vars: [...vars, ['k', k]] });
    returned.push({ text: String(tok.value) });
    snap(18, `return self._A[${k}] = ${tok.value}: the slot's address is computed from k, so access is O(1).`, {
      roles: [[tok, 'good']],
      markers: [{ name: 'k', col: k, role: 'good' }],
      vars: [...vars, ['k', k]],
    });
    return { result: tok.value, error: null };
  };

  snap(undefined, 'DynamicArray(): n = 0 and the capacity is 1, so self._A = [None], one empty slot.');

  ops.forEach((op, i) => {
    current = i;
    const vars: Array<[string, string | number]> = [['op', formatArrayOp(op)]];
    let out: { result: number | null; error: string | null } = { result: null, error: null };
    if (op.kind === 'append') appendOp(op.value, vars);
    else if (op.kind === 'pop') out = popOp(vars);
    else out = getOp(op.index, vars);
    steps.push({ op, n, capacity: cap(), slots: slots.map((t) => (t ? t.value : null)), ...out });
  });

  current = ops.length;
  snap(
    undefined,
    `Done: n = ${n}, capacity ${cap()}. ${
      appends
        ? `${appends} append${appends === 1 ? '' : 's'} cost ${growCopies} cop${growCopies === 1 ? 'y' : 'ies'} when growing, ${(growCopies / appends).toFixed(1)} per append: one resize is O(n), but doubling makes resizes rare, so append is O(1) amortized.`
        : 'No appends, so no resizes.'
    }`,
  );
  return { frames, steps };
}
