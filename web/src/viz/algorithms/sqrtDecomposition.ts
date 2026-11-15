/**
 * Square root decomposition tracer, drawn with SegmentTreeView: one row of block sums over the
 * array, the query range as a band, and pointers that walk the partial blocks and the whole ones.
 *
 * Mirrors Algorithms/Advanced_Algorithms/Specialized_Techniques/Square_Root_Decomposition/Python/
 * square_root_decomposition.py: SqrtDecomposition.__init__ / update / query.
 * The constructor copies the array, sets block_size = max(1, int(ceil(sqrt(n)))) (so an empty
 * array gets 1, not 0) and block_count = (n + block_size - 1) // block_size, and adds every
 * element to blocks[i // block_size]. update adds value - arr[index] to its block, then writes
 * arr[index]. query adds arr[left..right] directly when both ends share a block; otherwise it
 * adds the left partial block element by element, the whole blocks in between from blocks, and
 * the right partial block element by element. Indices are not checked: reading past the end
 * raises IndexError (nothing has been written by then), which the run shows and continues after.
 * Golden fixtures (__fixtures__/specializedTechniques.json) pin the blocks after the build and
 * every operation, every result or IndexError, and the cells and blocks a query reads, in order.
 *
 * Input: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; query 2 7, update 5 20"   (q, sum, u, set are short forms)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { SegBlock, SegMarker, SegmentTreeState } from '../renderers/SegmentTreeView';
import type { StripItem } from '../ui/molecules/Strip';
import { floorDiv, opStrip, parseArrayScript, signed } from './segmentTree';

export type SqrtOp = { kind: 'query'; left: number; right: number } | { kind: 'update'; index: number; value: number };

export interface SqrtInput {
  arr: number[];
  ops: SqrtOp[];
}

export const SQRT_LIMITS = { maxLen: 20, maxOps: 12, lo: -99, hi: 99 };

const SQRT_NAMES: Record<string, SqrtOp['kind']> = { query: 'query', q: 'query', sum: 'query', update: 'update', u: 'update', set: 'update' };

export function parseSqrt(text: string): SqrtInput {
  const { values, calls } = parseArrayScript(text, { ...SQRT_LIMITS, example: '"[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; query 2 7, update 5 20"' });
  if (calls.length > SQRT_LIMITS.maxOps) throw new InputError(`At most ${SQRT_LIMITS.maxOps} operations, please (got ${calls.length}).`);
  const ops = calls.map((c): SqrtOp => {
    const kind = SQRT_NAMES[c.name];
    if (!kind) throw new InputError(`Unknown operation "${c.name}" in "${c.text}". Use query l r or update i value.`);
    if (c.args.length !== 2) throw new InputError(kind === 'query' ? `"${c.text}": query takes two indices, as in "query 2 7".` : `"${c.text}": update takes an index and a value, as in "update 5 20".`);
    const [a, b] = c.args;
    if (a < 0 || (kind === 'query' && b < 0)) {
      throw new InputError(`"${c.text}": indices start at 0. The code does not check them, and Python would quietly read a negative index from the end of the list.`);
    }
    if (kind === 'query' && a > b) throw new InputError(`"${c.text}": left must not be greater than right. The code does not check it and would add cells outside the range.`);
    return kind === 'query' ? { kind, left: a, right: b } : { kind, index: a, value: b };
  });
  return { arr: values, ops };
}

export function formatSqrtOp(op: SqrtOp): string {
  return op.kind === 'query' ? `query(${op.left}, ${op.right})` : `update(${op.index}, ${op.value})`;
}

export const SQRT_CODE = [
  'SqrtDecomposition(arr): arr = list(arr); n = len(arr)',
  '  block_size = max(1, int(ceil(sqrt(n)))); block_count = (n + block_size - 1) // block_size',
  '  blocks = [0] * block_count',
  '  for i in range(n): blocks[i // block_size] += arr[i]',
  'update(index, value): block_idx = index // block_size',
  '  blocks[block_idx] += value - arr[index]      # the change, not the new value',
  '  arr[index] = value',
  'query(left, right): result = 0; left_block = left // block_size; right_block = right // block_size',
  '  if left_block == right_block: for i in range(left, right + 1): result += arr[i]',
  '  else: for i in range(left, (left_block + 1) * block_size): result += arr[i]     # left partial',
  '    for i in range(left_block + 1, right_block): result += blocks[i]          # whole blocks',
  '    for i in range(right_block * block_size, right + 1): result += arr[i]     # right partial',
  '  return result',
];

export type SqrtRead = ['a' | 'b', number];

export interface SqrtStep {
  op: SqrtOp;
  result?: number | null;
  error?: 'IndexError';
  arr: number[];
  blocks: number[];
  reads?: SqrtRead[];
}

export interface SqrtRun {
  frames: Array<Frame<SegmentTreeState>>;
  blockSize: number;
  blockCount: number;
  build: number[];
  steps: SqrtStep[];
}

interface SnapOpts {
  cells?: Record<number, Role>;
  blocks?: Record<number, Role>;
  markers?: SegMarker[];
  band?: SegmentTreeState['band'];
  sum?: StripItem[];
  vars?: Array<[string, string | number]>;
  note?: string;
}

const cross = () => String.fromCodePoint(0x2715);

export function sqrtTrace(input: SqrtInput): SqrtRun {
  const { ops } = input;
  const arr = [...input.arr];
  const n = arr.length;
  const blockSize = Math.max(1, Math.ceil(Math.sqrt(n)));
  const blockCount = floorDiv(n + blockSize - 1, blockSize);
  const blocks: number[] = new Array(blockCount).fill(0);
  const frames: Array<Frame<SegmentTreeState>> = [];
  const steps: SqrtStep[] = [];
  const names = ops.map(formatSqrtOp);
  let current = -1;
  const span = (b: number) => ({ lo: b * blockSize, hi: Math.min(n - 1, b * blockSize + blockSize - 1) });

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const views: SegBlock[] = [];
    for (let b = 0; b < blockCount; b++) {
      const s = span(b);
      views.push({ id: `b${b}`, ...s, row: 0, value: blocks[b], badge: `blocks[${b}]`, role: o.blocks?.[b] ?? 'idle', title: `blocks[${b}] = sum of arr[${s.lo}..${s.hi}]` });
    }
    for (let i = 0; i < n; i++) views.push({ id: `a${i}`, lo: i, hi: i, row: 1, value: arr[i], role: o.cells?.[i] ?? 'idle', title: `arr[${i}] = ${arr[i]}` });
    const strips = [opStrip(names, current)];
    if (o.sum) strips.push({ label: 'result', items: o.sum.length ? o.sum : [{ text: '0' }] });
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n], ['block_size', blockSize], ['blocks', `[${blocks.join(', ')}]`]],
      state: {
        label: `Array of ${n} element${n === 1 ? '' : 's'} in ${blockCount} block${blockCount === 1 ? '' : 's'} of ${blockSize}: block sums ${blocks.join(', ') || 'none'}`,
        columns: n,
        rows: 2,
        rowLabels: ['blocks', 'arr'],
        blocks: views,
        colTitle: 'index',
        colLabels: Array.from({ length: n }, (_, i) => ({ text: String(i) })),
        band: o.band,
        markers: o.markers,
        note: o.note,
        strips,
      },
    });
  };

  // ---- build
  const root = Math.sqrt(n);
  snap(
    1,
    `SqrtDecomposition(arr): copy the ${n} element${n === 1 ? '' : 's'}. block_size = max(1, int(ceil(sqrt(${n})))) = ${blockSize}` +
      (n === 0 ? ': sqrt(0) is 0, and the max keeps the block size at 1 so nothing divides by zero.' : Number.isInteger(root) ? ` (sqrt(${n}) = ${root} exactly).` : ` (sqrt(${n}) = ${root.toFixed(2)}, rounded up).`) +
      ` block_count = (${n} + ${blockSize} - 1) // ${blockSize} = ${blockCount}` +
      (n > 0 && n % blockSize ? `, the last block holding only ${n % blockSize}.` : '.'),
  );
  for (let i = 0; i < n; i++) {
    const b = floorDiv(i, blockSize);
    const before = blocks[b];
    blocks[b] += arr[i];
    snap(3, `i = ${i}: ${i} // ${blockSize} = ${b}, so arr[${i}] = ${arr[i]} belongs to block ${b}: blocks[${b}] = ${before} + ${arr[i]} = ${blocks[b]}.`, {
      cells: { [i]: 'active' },
      blocks: { [b]: 'active' },
      markers: [{ name: 'i', row: 1, lo: i, hi: i, role: 'active' }],
      vars: [['i', i]],
    });
  }
  const build = [...blocks];
  snap(
    undefined,
    n === 0
      ? 'Built: no elements and no blocks. Any index is out of range, so every operation will raise IndexError.'
      : `Built: blocks = [${blocks.join(', ')}]. Each holds the sum of its ${blockSize} element${blockSize === 1 ? '' : 's'}${n % blockSize ? ' (the last one fewer)' : ''}, so a query can take a whole block in one read.`,
    { blocks: Object.fromEntries(blocks.map((_, b) => [b, 'done' as Role])) },
  );

  // ---- operations
  ops.forEach((op, k) => {
    current = k;
    const name = names[k];
    const opVars: Array<[string, string | number]> = [['op', name]];

    if (op.kind === 'update') {
      const { index, value } = op;
      const b = floorDiv(index, blockSize);
      if (index >= n) {
        // blocks[block_idx] is read first; then arr[index] on the right-hand side. Either raises before any write.
        const which = b >= blockCount ? `blocks[${b}]` : `arr[${index}]`;
        snap(5, `${name}: block_idx = ${index} // ${blockSize} = ${b}. Reading ${which} raises IndexError: the array has ${n} element${n === 1 ? '' : 's'} (${blockCount} block${blockCount === 1 ? '' : 's'}). Nothing was written.`, {
          markers: [{ name: `index ${index}`, row: 1, lo: index, hi: index, role: 'bad' }],
          vars: [...opVars, ['block_idx', b]],
          note: `${cross()} IndexError: list index out of range`,
        });
        steps.push({ op, error: 'IndexError', arr: [...arr], blocks: [...blocks] });
        return;
      }
      const delta = value - arr[index];
      snap(4, `${name}: block_idx = ${index} // ${blockSize} = ${b}. Only blocks[${b}] covers index ${index}, so it is the only sum to fix.`, {
        cells: { [index]: 'compare' },
        blocks: { [b]: 'compare' },
        markers: [{ name: 'index', row: 1, lo: index, hi: index, role: 'active' }],
        vars: [...opVars, ['block_idx', b]],
      });
      const s = span(b);
      snap(5, `The block must change by value - arr[${index}] = ${value} - ${arr[index]} = ${signed(delta)}: read the old value before it is overwritten.`, {
        cells: { [index]: 'active' },
        blocks: { [b]: 'compare' },
        markers: [{ name: signed(delta), row: 1, lo: index, hi: index, role: 'active' }],
        vars: [...opVars, ['block_idx', b]],
      });
      const before = blocks[b];
      blocks[b] += delta;
      snap(5, `blocks[${b}] += ${signed(delta)}: ${before} -> ${blocks[b]}. One addition, no rescan of the block: an update is O(1).`, {
        cells: { [index]: 'compare' },
        blocks: { [b]: 'active' },
        markers: [{ name: signed(delta), row: 0, lo: s.lo, hi: s.hi, role: 'active' }],
        vars: [...opVars, ['block_idx', b]],
      });
      const old = arr[index];
      arr[index] = value;
      snap(6, `arr[${index}] = ${value} (was ${old}). blocks[${b}] is again the sum of arr[${s.lo}..${s.hi}].`, {
        cells: { [index]: 'done' },
        blocks: { [b]: 'done' },
        vars: [...opVars, ['block_idx', b]],
      });
      steps.push({ op, result: null, arr: [...arr], blocks: [...blocks] });
      return;
    }

    // query
    const { left, right } = op;
    const lb = floorDiv(left, blockSize);
    const rb = floorDiv(right, blockSize);
    const band = { lo: left, hi: right, label: `query [${left}, ${right}]` };
    const reads: SqrtRead[] = [];
    const cells: Record<number, Role> = {};
    const blockRoles: Record<number, Role> = {};
    const terms: StripItem[] = [];
    let result = 0;
    const qv = () => [...opVars, ['left_block', lb], ['right_block', rb], ['result', result]] as Array<[string, string | number]>;
    snap(
      7,
      `${name}: left_block = ${left} // ${blockSize} = ${lb}, right_block = ${right} // ${blockSize} = ${rb}. ` +
        (lb === rb ? 'Both ends are in one block, so just add the elements.' : `Different blocks: add the left part of block ${lb} cell by cell, ${rb - lb - 1 > 0 ? `the ${rb - lb - 1} whole block${rb - lb - 1 === 1 ? '' : 's'} between from their sums, ` : 'no whole block lies between, '}then the right part of block ${rb}.`),
      { band, blocks: { ...(lb < blockCount ? { [lb]: 'compare' as Role } : {}), ...(rb < blockCount ? { [rb]: 'compare' as Role } : {}) }, vars: qv(), sum: [] },
    );
    const fail = (line: number, what: string) => {
      snap(line, `Reading ${what} raises IndexError: the array has ${n} element${n === 1 ? '' : 's'} (indices 0 to ${n - 1}) in ${blockCount} block${blockCount === 1 ? '' : 's'}. query stops; nothing was written.`, {
        band: { ...band, role: 'bad' },
        cells,
        blocks: blockRoles,
        markers: [{ name: what.startsWith('arr') ? 'i' : 'b', row: what.startsWith('arr') ? 1 : 0, lo: Number(what.match(/\d+/)![0]), hi: Number(what.match(/\d+/)![0]), role: 'bad' }],
        vars: qv(),
        sum: terms,
        note: `${cross()} IndexError: list index out of range`,
      });
      steps.push({ op, error: 'IndexError', arr: [...arr], blocks: [...blocks], reads });
    };
    const addCell = (line: number, i: number, why: string): boolean => {
      reads.push(['a', i]);
      if (i >= n) {
        fail(line, `arr[${i}]`);
        return false;
      }
      result += arr[i];
      terms.push({ text: `arr[${i}] = ${arr[i]}`, role: 'active' });
      cells[i] = 'active';
      snap(line, `${why} result += arr[${i}] = ${arr[i]} -> ${result}.`, { band, cells: { ...cells }, blocks: { ...blockRoles }, markers: [{ name: 'i', row: 1, lo: i, hi: i, role: 'active' }], vars: [...qv(), ['i', i]], sum: terms.map((t) => ({ ...t })) });
      cells[i] = 'done';
      terms[terms.length - 1].role = 'done';
      return true;
    };
    let ok = true;
    if (lb === rb) {
      for (let i = left; i <= right && ok; i++) ok = addCell(8, i, `Same block: i = ${i}.`);
    } else {
      for (let i = left; i < (lb + 1) * blockSize && ok; i++) ok = addCell(9, i, `Left partial block ${lb}: i = ${i}.`);
      for (let b = lb + 1; b < rb && ok; b++) {
        reads.push(['b', b]);
        if (b >= blockCount) {
          fail(10, `blocks[${b}]`);
          ok = false;
          break;
        }
        result += blocks[b];
        terms.push({ text: `blocks[${b}] = ${blocks[b]}`, role: 'active' });
        blockRoles[b] = 'active';
        const s = span(b);
        snap(10, `Block ${b} (indices ${s.lo}..${s.hi}) lies wholly inside the range: add its stored sum in one step instead of ${s.hi - s.lo + 1} cells. result += ${blocks[b]} -> ${result}.`, {
          band,
          cells: { ...cells },
          blocks: { ...blockRoles },
          markers: [{ name: 'b', row: 0, lo: s.lo, hi: s.hi, role: 'active' }],
          vars: [...qv(), ['i', b]],
          sum: terms.map((t) => ({ ...t })),
        });
        blockRoles[b] = 'done';
        terms[terms.length - 1].role = 'done';
      }
      for (let i = rb * blockSize; i <= right && ok; i++) ok = addCell(11, i, `Right partial block ${rb}: i = ${i}.`);
    }
    if (!ok) return;
    const cellCount = reads.filter((r) => r[0] === 'a').length;
    const blockCountRead = reads.length - cellCount;
    const good: Record<number, Role> = {};
    for (const [kind, i] of reads) if (kind === 'a') good[i] = 'good';
    const goodBlocks: Record<number, Role> = {};
    for (const [kind, b] of reads) if (kind === 'b') goodBlocks[b] = 'good';
    snap(
      12,
      `query returns ${result}: ${cellCount} cell${cellCount === 1 ? '' : 's'}${blockCountRead ? ` and ${blockCountRead} block sum${blockCountRead === 1 ? '' : 's'}` : ''}, ${reads.length} read${reads.length === 1 ? '' : 's'} for ${right - left + 1} element${right === left ? '' : 's'}. ` +
        'At most two partial blocks and about sqrt(n) whole ones: O(sqrt n).',
      { band: { ...band, role: 'done' }, cells: good, blocks: goodBlocks, vars: qv(), sum: terms },
    );
    steps.push({ op, result, arr: [...arr], blocks: [...blocks], reads });
  });

  current = ops.length;
  snap(undefined, `Done: blocks = [${blocks.join(', ')}], arr = [${arr.join(', ')}].`);
  return { frames, blockSize, blockCount, build, steps };
}
