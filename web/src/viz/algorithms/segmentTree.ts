/**
 * Segment tree tracer (bottom-up layout, padded to a power of two), drawn with SegmentTreeView:
 * one row per level, each node a block over the array positions it covers.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Segment_Tree/Python/segment_tree.py:
 * SegmentTree.__init__ / _check / update / query / get.
 * size is the smallest power of two >= n (1 for an empty array), the tree has 2 * size cells,
 * leaves are tree[size + i] and tree[i] = tree[2i] + tree[2i + 1]. update assigns (it does not
 * add) and recomputes the ancestors with index //= 2; query climbs two pointers: an odd left
 * or an even right is added and stepped inwards, then both halve. Any index outside 0..n-1, or
 * left > right, raises IndexError before anything is read.
 * Golden fixtures (__fixtures__/rangeQueries.json) pin the tree after every operation, every
 * result and the positions a query adds.
 *
 * Input: "[1, 3, 5, 7, 9, 11]; query 1 4, update 2 10, get 2"   (q, u, set, g are short forms)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { SegBlock, SegMarker, SegmentTreeState } from '../renderers/SegmentTreeView';
import type { StripItem } from '../ui/molecules/Strip';
import { parseCall, scriptSegments } from './hashTable';

/* ---------- the script syntax shared by the range-query tracers ---------- */

export interface ScriptCall {
  name: string;
  args: number[];
  text: string;
}

export interface ArrayScript {
  values: number[];
  calls: ScriptCall[];
}

/**
 * "[1, 3, 5]; query 1 4, update 2 10": the array before the first semicolon or new line
 * (brackets and an "arr" prefix optional), then operations separated by commas, semicolons or
 * new lines, written "query 1 4" or "query(1, 4)".
 */
export function parseArrayScript(
  text: string,
  o: { maxLen: number; lo: number; hi: number; argLo?: number; argHi?: number; example: string },
): ArrayScript {
  const cut = text.search(/[;\n]/);
  const head = (cut < 0 ? text : text.slice(0, cut)).trim();
  const rest = cut < 0 ? '' : text.slice(cut + 1);
  const body = head
    .replace(/^(?:arr(?:ay)?|a)\s*[:=]?\s*/i, '')
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .trim();
  const tokens = body ? body.split(/[\s,]+/).filter(Boolean) : [];
  if (tokens.length > o.maxLen) throw new InputError(`At most ${o.maxLen} array values, so every block stays readable (got ${tokens.length}).`);
  const values = tokens.map((t) => {
    if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not an integer. Start with the array, for example ${o.example}.`);
    const v = Number(t) || 0;
    if (v < o.lo || v > o.hi) throw new InputError(`Array values go from ${o.lo} to ${o.hi} (got ${t}).`);
    return v;
  });
  const argLo = o.argLo ?? -99;
  const argHi = o.argHi ?? 99;
  const calls = scriptSegments(rest).map((segment): ScriptCall => {
    const call = parseCall(segment);
    if (!call) throw new InputError(`Cannot read "${segment}". Write operations like ${o.example.split('; ')[1] ?? o.example}, separated by commas.`);
    const args = call.args.map((a) => {
      if (!/^-?\d+$/.test(a)) throw new InputError(`"${segment}": "${a}" is not an integer.`);
      const v = Number(a) || 0;
      if (v < argLo || v > argHi) throw new InputError(`"${segment}": numbers in operations go from ${argLo} to ${argHi} (got ${a}).`);
      return v;
    });
    return { name: call.name, args, text: segment };
  });
  return { values, calls };
}

/** The operations strip: the current one active, finished ones muted. */
export function opStrip(names: string[], current: number): { label: string; items: StripItem[] } {
  return { label: 'Operations', items: names.map((text, i): StripItem => ({ text, role: i === current ? 'active' : i < current ? 'muted' : undefined })) };
}

/** Python's a // b for b > 0 (floor division). */
export function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

export const signed = (v: number) => (v > 0 ? `+${v}` : String(v));

/* ---------- input ---------- */

export type SegOp = { kind: 'query'; left: number; right: number } | { kind: 'update'; index: number; value: number } | { kind: 'get'; index: number };

export interface SegInput {
  arr: number[];
  ops: SegOp[];
}

export const SEG_LIMITS = { maxLen: 16, maxOps: 12, lo: -99, hi: 99 };

const SEG_NAMES: Record<string, SegOp['kind']> = { query: 'query', q: 'query', sum: 'query', update: 'update', u: 'update', set: 'update', get: 'get', g: 'get' };

export function parseSegment(text: string): SegInput {
  const { values, calls } = parseArrayScript(text, { ...SEG_LIMITS, example: '"[1, 3, 5, 7, 9, 11]; query 1 4, update 2 10, get 2"' });
  if (calls.length > SEG_LIMITS.maxOps) throw new InputError(`At most ${SEG_LIMITS.maxOps} operations, please (got ${calls.length}).`);
  const ops = calls.map((c): SegOp => {
    const kind = SEG_NAMES[c.name];
    if (!kind) throw new InputError(`Unknown operation "${c.name}" in "${c.text}". Use query l r, update i value or get i.`);
    const want = kind === 'get' ? 1 : 2;
    if (c.args.length !== want) throw new InputError(kind === 'query' ? `"${c.text}": query takes two indices, as in "query 1 4".` : kind === 'update' ? `"${c.text}": update takes an index and a value, as in "update 2 10".` : `"${c.text}": get takes one index, as in "get 2".`);
    if (kind === 'update' && (c.args[1] < SEG_LIMITS.lo || c.args[1] > SEG_LIMITS.hi)) throw new InputError(`Values go from ${SEG_LIMITS.lo} to ${SEG_LIMITS.hi} (got ${c.args[1]}).`);
    return kind === 'query' ? { kind, left: c.args[0], right: c.args[1] } : kind === 'update' ? { kind, index: c.args[0], value: c.args[1] } : { kind, index: c.args[0] };
  });
  return { arr: values, ops };
}

export function formatSegOp(op: SegOp): string {
  return op.kind === 'query' ? `query(${op.left}, ${op.right})` : op.kind === 'update' ? `update(${op.index}, ${op.value})` : `get(${op.index})`;
}

/* ---------- pseudocode ---------- */

export const SEG_CODE = [
  'SegmentTree(arr): size = smallest power of two >= n; tree = [0] * (2 * size)',
  '  for i in range(n): tree[size + i] = arr[i]              # leaves',
  '  for i in range(size - 1, 0, -1): tree[i] = tree[2i] + tree[2i + 1]',
  'update(index, value): _check(index)       # IndexError unless 0 <= index < n',
  '  index += size; tree[index] = value      # assign, not add',
  '  index //= 2',
  '  while index: tree[index] = tree[2*index] + tree[2*index + 1]; index //= 2',
  'query(left, right): _check(left); _check(right); left > right: IndexError',
  '  left += size; right += size; result = 0',
  '  while left <= right:',
  '    if left % 2 == 1: result += tree[left]; left += 1',
  '    if right % 2 == 0: result += tree[right]; right -= 1',
  '    left //= 2; right //= 2',
  '  return result',
  'get(index): _check(index); return tree[size + index]',
];

/* ---------- tracer ---------- */

export interface SegStep {
  op: SegOp;
  result?: number | null;
  error?: 'IndexError';
  tree: number[];
  /** query: the tree positions added to the result, in order. */
  reads?: number[];
}

export interface SegRun {
  frames: Array<Frame<SegmentTreeState>>;
  size: number;
  build: number[];
  steps: SegStep[];
}

const levelOf = (p: number) => Math.floor(Math.log2(p));

/** Columns covered by tree position p of a tree with `size` leaves (a slot past either end of its level is allowed). */
export function segSpan(p: number, size: number, level = levelOf(p)): { row: number; lo: number; hi: number } {
  const w = size >> level;
  const lo = (p - 2 ** level) * w;
  return { row: level, lo, hi: lo + w - 1 };
}

interface SnapOpts {
  roles?: Record<number, Role>;
  markers?: SegMarker[];
  band?: SegmentTreeState['band'];
  vars?: Array<[string, string | number]>;
  sum?: StripItem[];
  note?: string;
}

export function segTrace(input: SegInput): SegRun {
  const { arr, ops } = input;
  const n = arr.length;
  let size = 1;
  while (size < n) size *= 2;
  const tree: number[] = new Array(2 * size).fill(0);
  const frames: Array<Frame<SegmentTreeState>> = [];
  const steps: SegStep[] = [];
  const names = ops.map(formatSegOp);
  let current = -1;
  const levels = levelOf(size) + 1;

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const blocks: SegBlock[] = [];
    for (let p = 1; p < 2 * size; p++) {
      const s = segSpan(p, size);
      const pad = s.lo >= n;
      blocks.push({
        id: `n${p}`,
        ...s,
        value: tree[p],
        badge: String(p),
        role: o.roles?.[p] ?? 'idle',
        pad,
        title: pad ? `tree[${p}]: padding, not an element` : `tree[${p}] = sum of elements ${s.lo}..${Math.min(s.hi, n - 1)}`,
      });
    }
    const strips = [opStrip(names, current)];
    if (o.sum) strips.push({ label: 'Sum', items: o.sum.length ? o.sum : [{ text: 'nothing added yet' }] });
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n], ['size', size]],
      state: {
        label: `Segment tree over ${n} element${n === 1 ? '' : 's'}: ${blocks.map((b) => `tree[${b.badge}] = ${b.value}`).join(', ')}`,
        columns: size,
        rows: levels,
        blocks,
        colTitle: 'index',
        colLabels: Array.from({ length: size }, (_, i) => ({ text: i < n ? String(i) : '-' })),
        band: o.band,
        markers: o.markers,
        note: o.note,
        strips,
      },
    });
  };

  const sumText = (terms: Array<[number, number]>) => (terms.length ? terms.map(([, v]) => v).join(' + ') : '0');
  const indexError = (what: string) => `IndexError: ${what}`;

  // ---- build
  snap(
    0,
    `SegmentTree(arr): n = ${n}, so size = ${size}, the smallest power of two >= n${n === 0 ? ' (1 for an empty array)' : ''}. ` +
      `The tree is one list of 2 * ${size} = ${2 * size} zeros: the root is tree[1], node i has children 2i and 2i + 1, and position 0 is unused.`,
  );
  const leafRoles: Record<number, Role> = {};
  for (let i = 0; i < n; i++) {
    tree[size + i] = arr[i];
    leafRoles[size + i] = 'active';
  }
  snap(
    1,
    n === 0
      ? 'There are no elements, so no leaf is written. tree[1] is the only leaf, and it is padding.'
      : `The ${n} values go to the leaves tree[${size}..${size + n - 1}].` +
          (size > n ? ` The ${size - n} leaf${size - n > 1 ? 's' : ''} after them stay 0: padding, harmless because 0 adds nothing to a sum.` : ' n is a power of two, so there is no padding.'),
    { roles: leafRoles },
  );
  for (let i = size - 1; i >= 1; i--) {
    tree[i] = tree[2 * i] + tree[2 * i + 1];
    const s = segSpan(i, size);
    snap(2, `tree[${i}] = tree[${2 * i}] + tree[${2 * i + 1}] = ${tree[2 * i]} + ${tree[2 * i + 1]} = ${tree[i]}: the sum of positions ${s.lo}..${s.hi}. Going from size - 1 down to 1 means both children are ready.`, {
      roles: { [i]: 'active', [2 * i]: 'compare', [2 * i + 1]: 'compare' },
      vars: [['i', i]],
    });
  }
  const build = [...tree];
  if (size > 1) snap(undefined, `Built: the root tree[1] = ${tree[1]} is the total. Every block holds the sum of the positions under it.`, { roles: { 1: 'done' } });

  // ---- operations
  ops.forEach((op, k) => {
    current = k;
    const name = names[k];
    const opVars: Array<[string, string | number]> = [['op', name]];
    const fail = (line: number, why: string) => {
      // Show where the request points: the leaf slot of a bad index (just outside the row when it is off the end), or the bad range.
      const where: SnapOpts =
        op.kind === 'query'
          ? { band: { lo: op.left, hi: op.right, label: `query [${op.left}, ${op.right}]`, role: 'bad' } }
          : { markers: [{ name: `index ${op.index}`, row: levels - 1, lo: op.index, hi: op.index, role: 'bad' }] };
      snap(line, `${name} raises ${indexError(why)} Nothing is read or written.`, { ...where, vars: opVars, note: `${String.fromCodePoint(0x2715)} IndexError: ${why}` });
      steps.push({ op, error: 'IndexError', tree: [...tree] });
    };
    const bad = (i: number) => !(i >= 0 && i < n);
    const badText = (i: number) => `index ${i} out of range for size ${n}.` + (i < 0 && size + i >= 1 ? ` Without the check, tree[size + index] = tree[${size} - ${-i}] = tree[${size + i}] would read an internal node.` : n === 0 ? ' The array is empty, so no index is valid.' : ` Valid indices are 0..${n - 1}.`);

    if (op.kind === 'get') {
      if (bad(op.index)) return fail(14, badText(op.index));
      const p = size + op.index;
      snap(14, `${name}: the element is the leaf tree[${size} + ${op.index}] = tree[${p}] = ${tree[p]}, read in O(1).`, {
        roles: { [p]: 'good' },
        markers: [{ name: 'index', ...segSpan(p, size), role: 'active' }],
        vars: [...opVars, ['index', p]],
      });
      steps.push({ op, result: tree[p], tree: [...tree] });
      return;
    }

    if (op.kind === 'update') {
      if (bad(op.index)) return fail(3, badText(op.index));
      let p = size + op.index;
      const before = tree[p];
      tree[p] = op.value;
      const path: Record<number, Role> = { [p]: 'done' };
      snap(4, `${name}: index ${op.index} is valid, and its leaf is tree[${op.index} + ${size}] = tree[${p}]. Overwrite ${before} with ${op.value}: update assigns, it does not add.`, {
        roles: { [p]: 'active' },
        markers: [{ name: 'index', ...segSpan(p, size), role: 'active' }],
        vars: [...opVars, ['index', p]],
      });
      p = floorDiv(p, 2);
      while (p) {
        const old = tree[p];
        tree[p] = tree[2 * p] + tree[2 * p + 1];
        snap(
          6,
          `index //= 2 -> ${p}: tree[${p}] covers the changed leaf, so recompute it from its children: ${tree[2 * p]} + ${tree[2 * p + 1]} = ${tree[p]} (was ${old}).`,
          { roles: { ...path, [p]: 'active', [2 * p]: 'compare', [2 * p + 1]: 'compare' }, markers: [{ name: 'index', ...segSpan(p, size), role: 'active' }], vars: [...opVars, ['index', p]] },
        );
        path[p] = 'done';
        p = floorDiv(p, 2);
      }
      snap(6, `index //= 2 -> 0, so the loop ends after the root. ${Object.keys(path).length} cells changed, one per level, which is why an update costs O(log n).`, {
        roles: path,
        vars: [...opVars, ['index', 0]],
      });
      steps.push({ op, result: null, tree: [...tree] });
      return;
    }

    // query
    const { left: ql, right: qr } = op;
    if (bad(ql)) return fail(7, badText(ql));
    if (bad(qr)) return fail(7, badText(qr));
    if (ql > qr) return fail(7, `left ${ql} is greater than right ${qr}.`);
    const band = { lo: ql, hi: qr, label: `query [${ql}, ${qr}]` };
    let l = ql + size;
    let r = qr + size;
    let level = levels - 1;
    let result = 0;
    const taken: Array<[number, number]> = [];
    const done: Record<number, Role> = {};
    const reads: number[] = [];
    const sumItems = (active?: number): StripItem[] => taken.map(([p, v]) => ({ text: `tree[${p}] = ${v}`, role: p === active ? 'active' : 'done' }));
    const live = (extra: Record<number, Role> = {}) => {
      const roles: Record<number, Role> = { ...done };
      for (let p = l; p <= r; p++) if (p >= 2 ** level && p < 2 ** (level + 1)) roles[p] = 'compare';
      return { ...roles, ...extra };
    };
    const marks = (): SegMarker[] =>
      level < 0
        ? []
        : [
            { name: 'l', ...segSpan(l, size, level), role: 'compare' },
            { name: 'r', ...segSpan(r, size, level), role: 'compare' },
          ];
    const qv = () => [...opVars, ['left', l], ['right', r], ['result', result]] as Array<[string, string | number]>;

    snap(8, `${name}: both indices are in 0..${n - 1} and ${ql} <= ${qr}. Start at the leaves: left = ${ql} + ${size} = ${l}, right = ${qr} + ${size} = ${r}. Every block from left to right lies inside the range; the loop takes the ones its parent cannot.`, {
      roles: live(),
      markers: marks(),
      band,
      vars: qv(),
      sum: [],
    });
    while (l <= r) {
      const s = segSpan(l, size, level);
      if (l % 2 === 1) {
        result += tree[l];
        taken.push([l, tree[l]]);
        reads.push(l);
        const before = segSpan(l - 1, size, level);
        const whyL =
          l === 1
            ? `left = 1 is the root, and it is odd: the whole range is this one block. Add tree[1] = ${tree[1]} (result = ${result}) and step left to 2.`
            : `left = ${l} is odd, a right child: its parent also covers block ${l - 1}, which is ${before.hi < ql ? 'outside the range' : 'already added'}. So add tree[${l}] = ${tree[l]} now (result = ${result}) and step left to ${l + 1}.`;
        snap(10, whyL, {
          roles: live({ [l]: 'active' }),
          markers: marks(),
          band,
          vars: qv(),
          sum: sumItems(l),
        });
        done[l] = 'done';
        l += 1;
      } else {
        snap(
          10,
          l < r
            ? `left = ${l} is even, a left child: its sibling ${l + 1} is inside the range too, so their parent ${floorDiv(l, 2)} (positions ${s.lo}..${s.hi + (s.hi - s.lo + 1)}) can be taken one level up instead. Nothing to add.`
            : `left = ${l} is even and equal to right: the right-end check takes it.`,
          { roles: live(), markers: marks(), band, vars: qv(), sum: sumItems() },
        );
      }
      if (r % 2 === 0) {
        result += tree[r];
        taken.push([r, tree[r]]);
        reads.push(r);
        const after = segSpan(r + 1, size, level);
        snap(11, `right = ${r} is even, a left child: its parent also covers block ${r + 1}, which is ${after.lo > qr ? 'outside the range' : 'already added'}. So add tree[${r}] = ${tree[r]} now (result = ${result}) and step right to ${r - 1}.`, {
          roles: live({ [r]: 'active' }),
          markers: marks(),
          band,
          vars: qv(),
          sum: sumItems(r),
        });
        done[r] = 'done';
        r -= 1;
      } else {
        snap(
          11,
          r < l
            ? `right = ${r} is odd, so there is nothing to add; left has already moved past it.`
            : `right = ${r} is odd, a right child: its sibling ${r - 1} is inside the range too, so their parent ${floorDiv(r, 2)} can be taken one level up instead. Nothing to add.`,
          { roles: live(), markers: marks(), band, vars: qv(), sum: sumItems() },
        );
      }
      l = floorDiv(l, 2);
      r = floorDiv(r, 2);
      level -= 1;
      snap(
        12,
        level < 0
          ? `left //= 2 -> ${l}, right //= 2 -> ${r}: there is no level above the root, and left > right.`
          : l <= r
            ? `left //= 2 -> ${l}, right //= 2 -> ${r}: one level up. The blocks still to cover pair up into their parents ${l}..${r}.`
            : `left //= 2 -> ${l}, right //= 2 -> ${r}: one level up, and now left > right, so no block is left to cover.`,
        { roles: live(), markers: marks(), band, vars: qv(), sum: sumItems() },
      );
    }
    const finalRoles: Record<number, Role> = {};
    for (const [p] of taken) finalRoles[p] = 'good';
    snap(13, `left > right: the loop ends. query returns ${result}${taken.length > 1 ? ` = ${sumText(taken)}` : ''}, from ${taken.length} block${taken.length === 1 ? '' : 's'} instead of ${qr - ql + 1} element${qr === ql ? '' : 's'} (at most two per level).`, {
      roles: finalRoles,
      band,
      vars: [...opVars, ['result', result]],
      sum: taken.map(([p, v]) => ({ text: `tree[${p}] = ${v}`, role: 'done' })),
    });
    steps.push({ op, result, tree: [...tree], reads });
  });

  current = ops.length;
  snap(undefined, `Done: ${n} element${n === 1 ? '' : 's'}, total ${tree[1]} at the root.`, { roles: { 1: 'done' } });
  return { frames, size, build, steps };
}
