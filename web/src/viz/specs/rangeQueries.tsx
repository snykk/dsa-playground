import { FEN_CODE, fenwickTrace, parseFenwick, type FenInput } from '../algorithms/fenwickTree';
import { KD_CODE, kdTrace, parseKd, type KdInput } from '../algorithms/kdTree';
import { parseSegment, SEG_CODE, segTrace, type SegInput } from '../algorithms/segmentTree';
import { LAZY_CODE, lazyTrace, parseLazy, type LazyInput } from '../algorithms/segmentTreeLazy';
import { parseSparse, SPARSE_CODE, sparseTrace, type SparseInput } from '../algorithms/sparseTable';
import type { VizSpec } from '../core/types';
import { KdTreeView, stabilizeKd, type KdTreeState } from '../renderers/KdTreeView';
import { SegmentTreeView, type SegmentTreeState } from '../renderers/SegmentTreeView';
import { SparseTableView, type SparseTableState } from '../renderers/SparseTableView';
import { SYM } from '../ui/symbols';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const randomArray = (n: number, lo = -9, hi = 30) => Array.from({ length: n }, () => rint(lo, hi));
const range = (n: number): [number, number] => {
  const l = rint(0, n - 1);
  return [l, rint(l, n - 1)];
};

function randomSegment(): string {
  const n = rint(4, 12);
  const ops = Array.from({ length: rint(3, 5) }, () => {
    const r = Math.random();
    if (r < 0.55) return `query ${range(n).join(' ')}`;
    if (r < 0.9) return `update ${rint(0, n - 1)} ${rint(-9, 30)}`;
    return `get ${rint(0, n - 1)}`;
  });
  return `[${randomArray(n).join(', ')}]; ${ops.join(', ')}`;
}

export const segmentTreeSpec: VizSpec<SegInput, SegmentTreeState> = {
  id: 'segment-tree',
  title: 'Segment Tree',
  inputKind: 'segment-tree',
  inputLabel: 'Array and operations',
  inputHelp:
    'Start with the array (up to 16 integers from -99 to 99), then a semicolon and operations separated by commas: "query 1 4" (the sum of indices 1..4), ' +
    '"update 2 10" (assign a value), "get 2" (q, u, g for short). Up to 12 operations. As in Python, an index outside 0..n-1 or left > right raises IndexError.',
  examples: [
    { label: 'Query and update (README)', value: '[1, 3, 5, 7, 9, 11]; query 1 4, update 2 10, query 0 2' },
    { label: 'Eight leaves, no padding', value: '[1, 3, 5, 7, 9, 11, 2, 4]; query 0 7, query 1 6, query 3 3' },
    { label: 'Sixteen leaves', value: '[3, -1, 4, 1, -5, 9, 2, -6, 5, 3, -5, 8, 9, -7, 9, 3]; query 1 14, update 7 0, query 5 10' },
    { label: 'Bad indices (IndexError)', value: '[1, 3, 5, 7, 9, 11]; get -1, query 0 6, query 3 2, update 6 1, query 2 3' },
    { label: 'One element', value: '[5]; query 0 0, update 0 10, get 0' },
  ],
  randomInput: randomSegment,
  parse: parseSegment,
  trace: (input) => segTrace(input).frames,
  render: (state) => <SegmentTreeView state={state} />,
  pseudocode: SEG_CODE,
  legend: [
    { role: 'compare', label: 'blocks still to cover (all inside the range), or children being summed' },
    { role: 'active', label: 'block being added or recomputed' },
    { role: 'done', label: 'block already added or updated' },
    { role: 'good', label: `the blocks that make up the answer (${SYM.check})` },
    { role: 'bad', label: `bad index or range: IndexError (${SYM.cross})` },
  ],
  complexity: { time: 'O(n) build; O(log n) update and query (at most two blocks per level)', space: 'O(n): 2 * size cells' },
};

function randomLazy(): string {
  const n = rint(5, 10);
  const ops: string[] = [];
  for (let i = 0; i < rint(3, 5); i++) ops.push(Math.random() < 0.5 ? `add ${range(n).join(' ')} ${rint(-5, 9)}` : `query ${range(n).join(' ')}`);
  return `[${randomArray(n).join(', ')}]; ${ops.join(', ')}`;
}

export const segmentTreeLazySpec: VizSpec<LazyInput, SegmentTreeState> = {
  id: 'segment-tree-lazy',
  title: 'Lazy Segment Tree',
  inputKind: 'segment-tree-lazy',
  inputLabel: 'Array and operations',
  inputHelp:
    'Start with the array (up to 16 integers from -99 to 99), then a semicolon and operations separated by commas: "add 1 4 3" (update_range: add 3 to indices 1..4) and "query 1 4" (the sum). ' +
    'Added values go from -20 to 20; up to 12 operations. There is no index check, as in Python: a range sticking out of the array is clipped.',
  examples: [
    { label: 'Tags park, then push (README)', value: '[1, 3, 5, 7, 9, 11]; add 1 4 3, query 3 3, query 0 5' },
    { label: 'Overlapping adds', value: '[1, 3, 5, 7, 9, 11]; add 0 3 2, add 2 5 3, query 2 2, query 4 4' },
    { label: 'Whole range: one tag', value: '[1, 3, 5, 7, 9, 11, 2, 4]; add 0 7 5, query 3 5, query 0 7' },
    { label: 'Ranges outside the array', value: '[4, 8, 15, 16, 23, 42]; add -2 2 5, query 3 20, query -5 -1, add 4 1 9' },
    { label: 'Empty array', value: '[]; add -1 0 5, query -3 5' },
  ],
  randomInput: randomLazy,
  parse: parseLazy,
  trace: (input) => lazyTrace(input).frames,
  render: (state) => <SegmentTreeView state={state} />,
  pseudocode: LAZY_CODE,
  legend: [
    { role: 'active', label: 'node being visited, changed or rebuilt; a tag being pushed' },
    { role: 'compare', label: 'partly covered: the call looked inside' },
    { role: 'done', label: 'fully covered: tagged (+v pill) or read whole' },
    { role: 'muted', label: 'no overlap: skipped' },
  ],
  complexity: { time: 'O(n) build; O(log n) per range add or range sum', space: 'O(n): two lists of 4n' },
};

function randomFenwick(): string {
  const n = rint(5, 12);
  const ops = Array.from({ length: rint(3, 5) }, () => {
    const r = Math.random();
    if (r < 0.35) return `update ${rint(0, n - 1)} ${rint(-9, 20)}`;
    if (r < 0.6) return `prefix ${rint(0, n - 1)}`;
    if (r < 0.9) return `query ${range(n).join(' ')}`;
    return `get ${rint(0, n - 1)}`;
  });
  return `[${randomArray(n).join(', ')}]; ${ops.join(', ')}`;
}

export const fenwickTreeSpec: VizSpec<FenInput, SegmentTreeState> = {
  id: 'fenwick-tree',
  title: 'Fenwick Tree',
  inputKind: 'fenwick-tree',
  inputLabel: 'Array and operations',
  inputHelp:
    'Start with the array (up to 16 integers from -99 to 99), then a semicolon and operations separated by commas: "update 2 5" (add 5 to element 2), "prefix 4" (prefix_sum: elements 0..4), ' +
    '"query 1 4" and "get 2". Deltas go from -50 to 50; up to 12 operations. As in Python, an index outside 0..n-1 or left > right raises IndexError.',
  examples: [
    { label: 'Prefix sum and update (README)', value: '[1, 3, 5, 7, 9, 11]; prefix 4, update 2 5, prefix 4' },
    { label: 'Range = two prefix sums', value: '[1, 3, 5, 7, 9, 11, 2, 4]; query 2 6, get 5' },
    { label: 'Sixteen cells', value: '[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3]; update 0 10, prefix 15, query 8 11' },
    { label: 'Index -1 (used to hang)', value: '[1, 3, 5, 7, 9, 11]; update -1 5, prefix 6, query 3 2, prefix 5' },
  ],
  randomInput: randomFenwick,
  parse: parseFenwick,
  trace: (input) => fenwickTrace(input).frames,
  render: (state) => <SegmentTreeView state={state} />,
  pseudocode: FEN_CODE,
  legend: [
    { role: 'active', label: 'cell i being read or written' },
    { role: 'done', label: 'cell added to the sum, or already updated' },
    { role: 'compare', label: 'cell of prefix_sum(left - 1): subtracted' },
    { role: 'bad', label: `bad index or range: IndexError (${SYM.cross})` },
  ],
  complexity: { time: 'O(log n) per update, prefix sum or query; build O(n log n) (n updates)', space: 'O(n): n + 1 cells' },
};

function randomSparse(): string {
  const n = rint(5, 12);
  const ops = Array.from({ length: rint(2, 4) }, () => (Math.random() < 0.85 ? `query ${range(n).join(' ')}` : `get ${rint(0, n - 1)}`));
  return `${Math.random() < 0.5 ? 'min' : 'max'} [${randomArray(n, 0, 50).join(', ')}]; ${ops.join(', ')}`;
}

export const sparseTableSpec: VizSpec<SparseInput, SparseTableState> = {
  id: 'sparse-table',
  title: 'Sparse Table',
  inputKind: 'sparse-table',
  inputLabel: 'Kind, array and queries',
  inputHelp:
    'Start with min or max (min, the Python default, if you leave it out) and the array (up to 16 integers from -99 to 99), then a semicolon and operations separated by commas: ' +
    '"query 2 8" and "get 5". Up to 12 operations. Swapped bounds are reordered; an index outside 0..n-1 raises IndexError, and any kind but min or max raises ValueError.',
  examples: [
    { label: 'Min of a[2..8] (README)', value: 'min [1, 3, 5, 7, 9, 11, 2, 4, 6, 8]; query 2 8, query 0 2, query 5 2' },
    { label: 'Max table', value: 'max [1, 3, 5, 7, 9, 11, 2, 4, 6, 8]; query 2 8, query 6 9, get 5' },
    { label: 'Sum is rejected (ValueError)', value: 'sum [5, 1, 9]; query 0 2' },
    { label: 'Out of range', value: 'min [4, 2, 7]; query -1 1, query 0 3, query 2 0' },
    { label: 'Empty array', value: 'min []; query 0 0, get 0' },
  ],
  randomInput: randomSparse,
  parse: parseSparse,
  trace: (input) => sparseTrace(input).frames,
  render: (state) => <SparseTableView state={state} />,
  pseudocode: SPARSE_CODE,
  legend: [
    { role: 'active', label: 'cell being written; the second query window' },
    { role: 'compare', label: 'cells read: the two halves, or the first query window' },
    { role: 'good', label: `the answer (${SYM.check})` },
    { role: 'bad', label: `out of range: IndexError (${SYM.cross})` },
    { role: 'muted', label: 'never written: the window would run off the end (stays 0)' },
  ],
  complexity: { time: 'O(n log n) build; O(1) query (two reads)', space: 'O(n log n)' },
};

function randomKd(): string {
  const pts = Array.from({ length: rint(5, 8) }, () => `(${rint(0, 9)},${rint(0, 9)})`);
  const ops: string[] = [];
  for (let i = 0; i < rint(2, 3); i++) {
    if (Math.random() < 0.6) ops.push(`nearest (${rint(0, 9)},${rint(0, 9)})`);
    else {
      const x = rint(0, 6);
      const y = rint(0, 6);
      ops.push(`range (${x},${y}) (${rint(x, 9)},${rint(y, 9)})`);
    }
  }
  if (Math.random() < 0.4) ops.unshift(`insert (${rint(0, 9)},${rint(0, 9)})`);
  return `points ${pts.join(' ')}; ${ops.join(', ')}`;
}

const TEXTBOOK = 'points (7,2) (5,4) (9,6) (2,3) (4,7) (8,1)';

export const kdTreeSpec: VizSpec<KdInput, KdTreeState> = {
  id: 'k-d-tree',
  title: 'K-D Tree',
  inputKind: 'k-d-tree',
  inputLabel: 'Points and operations',
  inputHelp:
    'Start with the points to build from ("points (7,2) (5,4)"; "points;" for an empty tree), then a semicolon and operations separated by commas: ' +
    '"nearest (1,3)", "range (3,3) (8,7)" (the lo and hi corners) and "insert (6,6)". Coordinates are whole numbers from 0 to 9; up to 10 points in the tree and 10 operations.',
  examples: [
    { label: 'Nearest to (1,3) (README)', value: `${TEXTBOOK}; nearest (1,3)` },
    { label: 'Nearest across a line', value: `${TEXTBOOK}; nearest (6,5)` },
    { label: 'Range box (README)', value: `${TEXTBOOK}; range (3,3) (8,7)` },
    { label: 'Inserts, then search', value: `${TEXTBOOK}; insert (3,6), insert (7,5), nearest (6,6), range (2,4) (7,7)` },
    { label: 'Sorted inserts: a chain', value: 'points; insert (1,1), insert (2,2), insert (3,3), insert (4,4), insert (5,5), insert (6,6), nearest (9,9), nearest (0,0)' },
  ],
  randomInput: randomKd,
  parse: parseKd,
  trace: (input) => stabilizeKd(kdTrace(input).frames),
  render: (state) => <KdTreeView state={state} />,
  pseudocode: KD_CODE,
  legend: [
    { role: 'active', label: 'current node or point' },
    { role: 'compare', label: 'points being split, nodes visited, the region searched' },
    { role: 'done', label: 'best so far, or inside the box' },
    { role: 'good', label: `the answer (${SYM.check})` },
    { role: 'muted', label: 'pruned: its region (hatched) is never searched' },
  ],
  complexity: { time: 'build O(n log^2 n) in Python; insert O(h); nearest O(log n) average, O(n) worst', space: 'O(n)' },
};
