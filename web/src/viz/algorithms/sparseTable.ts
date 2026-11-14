/**
 * Sparse table tracer (range minimum or maximum), drawn with SparseTableView: the array, two
 * window rows that slide along it and the table, one row per level j.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Sparse_Table/Python/sparse_table.py:
 * SparseTable.__init__ / query / get.
 * query_type must be 'min' or 'max' (anything else raises ValueError); log_n = n.bit_length();
 * table is n rows of log_n zeros, table[i][0] = arr[i], and for j in 1..log_n - 1 and every i
 * with i + 2^j <= n, table[i][j] combines table[i][j - 1] and table[i + 2^(j - 1)][j - 1]. The
 * cells whose window would run off the end are never written and stay 0. query swaps
 * left > right, raises IndexError outside 0..n-1, takes k = length.bit_length() - 1 and
 * combines table[left][k] with table[right - 2^k + 1][k]: two overlapping windows, harmless
 * for min and max. Python's min and max return the first of two equal values; for integers
 * that is the same number.
 * Golden fixtures (__fixtures__/rangeQueries.json) pin the table, the ValueError and every
 * result or IndexError.
 *
 * Input: "min [1, 3, 5, 7, 9, 11, 2, 4, 6, 8]; query 2 8, get 5"   (the kind defaults to min)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { SparseCell, SparseTableState, SparseWindow } from '../renderers/SparseTableView';
import type { StripItem } from '../ui/molecules/Strip';
import { opStrip, parseArrayScript } from './segmentTree';

export type SparseOp = { kind: 'query'; left: number; right: number } | { kind: 'get'; index: number };

export interface SparseInput {
  kind: string;
  arr: number[];
  ops: SparseOp[];
}

export const SPARSE_LIMITS = { maxLen: 16, maxOps: 12, lo: -99, hi: 99 };

export function parseSparse(text: string): SparseInput {
  let kind = 'min';
  let rest = text;
  const m = text.match(/^\s*([A-Za-z_]+)\s*:?\s*/);
  if (m && !/^(arr|array|a)$/i.test(m[1])) {
    if (m[1].length > 8) throw new InputError(`"${m[1]}" is too long for a kind: write min or max before the array, as in "max [4, 2, 7]".`);
    kind = m[1];
    rest = text.slice(m[0].length);
  }
  const { values, calls } = parseArrayScript(rest, { ...SPARSE_LIMITS, example: '"min [1, 3, 5, 7, 9]; query 1 3, get 2"' });
  if (calls.length > SPARSE_LIMITS.maxOps) throw new InputError(`At most ${SPARSE_LIMITS.maxOps} operations, please (got ${calls.length}).`);
  const ops = calls.map((c): SparseOp => {
    if (c.name === 'query' || c.name === 'q') {
      if (c.args.length !== 2) throw new InputError(`"${c.text}": query takes two indices, as in "query 2 8".`);
      return { kind: 'query', left: c.args[0], right: c.args[1] };
    }
    if (c.name === 'get' || c.name === 'g') {
      if (c.args.length !== 1) throw new InputError(`"${c.text}": get takes one index, as in "get 2".`);
      return { kind: 'get', index: c.args[0] };
    }
    throw new InputError(`Unknown operation "${c.name}" in "${c.text}". A sparse table has no updates: use query l r or get i.`);
  });
  return { kind, arr: values, ops };
}

export function formatSparseOp(op: SparseOp): string {
  return op.kind === 'query' ? `query(${op.left}, ${op.right})` : `get(${op.index})`;
}

export const SPARSE_CODE = [
  "SparseTable(arr, query_type='min'): query_type not in ('min', 'max'): raise ValueError",
  '  log_n = n.bit_length()                      # floor(log2(n)) + 1 levels',
  '  table = [[0] * log_n for _ in range(n)]; table[i][0] = arr[i]',
  '  for j in range(1, log_n): for i in range(n - (1 << j) + 1):',
  '    table[i][j] = combine(table[i][j-1], table[i + (1 << (j-1))][j-1])   # min or max',
  'query(left, right): if left > right: left, right = right, left',
  '  if left < 0 or right >= n: raise IndexError',
  '  k = (right - left + 1).bit_length() - 1      # largest 2^k <= length',
  '  return combine(table[left][k], table[right - (1 << k) + 1][k])',
  'get(index): IndexError unless 0 <= index < n; return arr[index]',
];

export interface SparseStep {
  op: SparseOp;
  result?: number;
  error?: 'IndexError';
}

export interface SparseRun {
  frames: Array<Frame<SparseTableState>>;
  /** ValueError when the kind is neither min nor max: no table, no operation runs. */
  error?: 'ValueError';
  logN: number;
  /** table[i][j], exactly as Python stores it (unwritten cells are 0). */
  table: number[][];
  steps: SparseStep[];
}

const bitLength = (x: number) => (x <= 0 ? 0 : Math.floor(Math.log2(x)) + 1);

export function sparseTrace(input: SparseInput): SparseRun {
  const { kind, arr, ops } = input;
  const n = arr.length;
  const isMin = kind === 'min';
  const combine = (a: number, b: number) => (isMin ? Math.min(a, b) : Math.max(a, b));
  const frames: Array<Frame<SparseTableState>> = [];
  const names = ops.map(formatSparseOp);
  let current = -1;
  const valid = kind === 'min' || kind === 'max';
  const logN = valid ? bitLength(n) : 0;
  const table: number[][] = Array.from({ length: n }, () => new Array(logN).fill(0));
  /** written[i][j]: the build has filled this cell. */
  const written: boolean[][] = Array.from({ length: n }, () => new Array(logN).fill(false));

  interface Snap {
    cells?: Record<string, Role>;
    arr?: Record<number, Role>;
    windows?: [SparseWindow | null, SparseWindow | null];
    labels?: [string, string];
    vars?: Array<[string, string | number]>;
    note?: string;
    extra?: { label: string; items: StripItem[] };
  }
  const windowOf = (start: number, len: number, role: Role): SparseWindow => ({ start, cells: arr.slice(start, start + len).map((v) => ({ value: v, role })) });
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const levels = Array.from({ length: logN }, (_, j) => ({
      label: `j=${j} (${2 ** j})`,
      cells: Array.from({ length: n }, (_, i): SparseCell => {
        const role = o.cells?.[`${i},${j}`];
        const fits = i + 2 ** j <= n;
        return {
          value: table[i][j],
          role: role ?? (written[i][j] ? undefined : 'muted'),
          title: fits ? `table[${i}][${j}] = ${kind} of a[${i}..${i + 2 ** j - 1}]` : `table[${i}][${j}]: the window would run off the end, so it is never written (0)`,
        };
      }),
    }));
    const strips = [opStrip(names, current)];
    if (o.extra) strips.push(o.extra);
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n], ['log_n', logN], ['kind', kind]],
      state: {
        label: `Sparse table (${kind}) over ${n} elements with ${logN} levels`,
        arr: arr.map((v, i) => ({ value: v, role: o.arr?.[i] })),
        windows: o.windows ?? [null, null],
        windowLabels: o.labels ?? ['', ''],
        levels,
        note: o.note,
        strips,
      },
    });
  };

  if (!valid) {
    snap(
      0,
      `SparseTable(arr, '${kind}') raises ValueError: query_type must be 'min' or 'max'. Only an idempotent operation (combining a value with itself changes nothing) may use two overlapping windows; ` +
        (kind === 'sum' ? 'a sum would count the overlap twice.' : `'${kind}' is not one of the two supported.`) +
        ' Without a table no operation can run, so the script stops here.',
      { note: `${String.fromCodePoint(0x2715)} ValueError: query_type must be 'min' or 'max'` },
    );
    return { frames, error: 'ValueError', logN: 0, table: [], steps: [] };
  }

  // ---- build
  snap(
    1,
    `SparseTable(arr, '${kind}'): n = ${n}, so log_n = ${n}.bit_length() = ${logN}` +
      (n === 0 ? ': no levels and an empty table. Every query will raise IndexError.' : `: levels j = 0..${logN - 1}, windows of length 1 to ${2 ** (logN - 1)}. The table is ${n} rows of ${logN} zeros (shown by level here).`),
  );
  if (n > 0) {
    const fresh: Record<string, Role> = {};
    for (let i = 0; i < n; i++) {
      table[i][0] = arr[i];
      written[i][0] = true;
      fresh[`${i},0`] = 'active';
    }
    snap(2, `Level 0: table[i][0] = arr[i]. A window of length 1 is just its element.`, { cells: fresh });
  }
  let builds = 0;
  for (let j = 1; j < logN; j++) {
    const h = 2 ** (j - 1);
    for (let i = 0; i < n - 2 ** j + 1; i++) {
      const a = table[i][j - 1];
      const b = table[i + h][j - 1];
      table[i][j] = combine(a, b);
      written[i][j] = true;
      builds += 1;
      snap(
        4,
        `table[${i}][${j}] = ${kind}(table[${i}][${j - 1}], table[${i + h}][${j - 1}]) = ${kind}(${a}, ${b}) = ${table[i][j]}: ` +
          `the window a[${i}..${i + 2 ** j - 1}] is its two halves a[${i}..${i + h - 1}] and a[${i + h}..${i + 2 ** j - 1}], each already in level ${j - 1}.`,
        {
          cells: { [`${i},${j}`]: 'active', [`${i},${j - 1}`]: 'compare', [`${i + h},${j - 1}`]: 'compare' },
          windows: [windowOf(i, h, 'compare'), windowOf(i + h, h, 'compare')],
          labels: [`half 1`, `half 2`],
          vars: [['j', j], ['i', i]],
        },
      );
    }
  }
  if (n > 0) {
    snap(
      3,
      `Built: ${n + builds} cells written in O(n log n). On level j the loop stops at i = n - 2^j, so the last 2^j - 1 cells (faded) would cover windows running off the end: they are never written and stay 0. Every query reads exactly two written cells.`,
    );
  }

  // ---- operations
  const steps: SparseStep[] = [];
  ops.forEach((op, k) => {
    current = k;
    const name = names[k];
    const vars: Array<[string, string | number]> = [['op', name]];
    const fail = (line: number, why: string, from: number, to: number) => {
      // Mark the part of the request that does exist; the rest lies off the array.
      const marks: Record<number, Role> = {};
      for (let i = Math.max(0, from); i <= Math.min(n - 1, to); i++) marks[i] = 'bad';
      snap(line, `${name} raises IndexError: ${why}`, { arr: marks, vars, note: `${String.fromCodePoint(0x2715)} IndexError: ${why}` });
      steps.push({ op, error: 'IndexError' });
    };
    if (op.kind === 'get') {
      if (!(op.index >= 0 && op.index < n)) return fail(9, `index ${op.index} out of range for size ${n}.`, op.index, op.index);
      snap(9, `${name} returns arr[${op.index}] = ${arr[op.index]}, from the copy of the input the constructor keeps (the caller's list is not aliased).`, { arr: { [op.index]: 'good' }, vars });
      steps.push({ op, result: arr[op.index] });
      return;
    }
    let { left, right } = op;
    if (left > right) {
      [left, right] = [right, left];
      snap(5, `${name}: left > right, so the bounds are swapped to (${left}, ${right}) instead of raising.`, { vars: [...vars, ['left', left], ['right', right]] });
    }
    if (left < 0 || right >= n) return fail(6, `range [${left}, ${right}] out of bounds for size ${n}.` + (n === 0 ? ' The table is empty.' : ` Valid indices are 0..${n - 1}.`), left, right);
    const length = right - left + 1;
    const kk = bitLength(length) - 1;
    const w = 2 ** kk;
    const second = right - w + 1;
    const qv: Array<[string, string | number]> = [...vars, ['left', left], ['right', right], ['k', kk]];
    const overlap = Math.max(0, left + w - second);
    const arrRoles: Record<number, Role> = {};
    for (let i = left; i <= right; i++) arrRoles[i] = 'compare';
    snap(
      7,
      `length = ${length}, k = ${length}.bit_length() - 1 = ${kk}: ${w} is the largest power of two that fits. ` +
        (second === left
          ? `The length is itself a power of two, so the window from the left end and the one ending at the right end are the same window.`
          : `A window of ${w} from the left end and one ending at the right end cover [${left}, ${right}], overlapping on ${overlap} element${overlap === 1 ? '' : 's'}.`),
      {
        arr: arrRoles,
        windows: [windowOf(left, w, 'compare'), windowOf(second, w, 'active')],
        labels: [`[${left}][${kk}]`, `[${second}][${kk}]`],
        vars: qv,
      },
    );
    const a = table[left][kk];
    const b = table[second][kk];
    const result = combine(a, b);
    const sumWrong = arr.slice(left, left + w).reduce((s, v) => s + v, 0) + arr.slice(second, right + 1).reduce((s, v) => s + v, 0);
    const sumRight = arr.slice(left, right + 1).reduce((s, v) => s + v, 0);
    const pick = a === result ? `${left},${kk}` : `${second},${kk}`;
    snap(
      8,
      `${kind}(table[${left}][${kk}], table[${second}][${kk}]) = ${kind}(${a}, ${b}) = ${result}: two reads, O(1).` +
        (second !== left ? ` The overlap is counted twice, harmless for ${kind}; a sum of the same windows would give ${sumWrong} instead of ${sumRight}.` : ''),
      {
        arr: arrRoles,
        cells: { [`${left},${kk}`]: 'compare', [`${second},${kk}`]: 'compare', [pick]: 'good' },
        windows: [windowOf(left, w, 'compare'), windowOf(second, w, 'active')],
        labels: [`[${left}][${kk}]`, `[${second}][${kk}]`],
        vars: [...qv, ['result', result]],
      },
    );
    steps.push({ op, result });
  });

  current = ops.length;
  snap(undefined, n === 0 ? 'Done: the table is empty.' : `Done. The table never changes: changing one element would change every window that contains it (up to 2^j on level j), so a sparse table has no update.`);
  return { frames, logN, table, steps };
}
