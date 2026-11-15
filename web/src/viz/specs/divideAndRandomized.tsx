import { parseQuickselect, QS_CODE, quickselectTrace, stabilizeQuickselect, type QsInput } from '../algorithms/quickselect';
import { DEFAULT_RUNS, parseReservoir, RES_CODE, reservoirTrace, stabilizeReservoir, type ResInput } from '../algorithms/reservoir';
import { parseStrassen, stabilizeStrassen, STRASSEN_CODE, strassenTrace, type StrassenInput } from '../algorithms/strassen';
import type { VizSpec } from '../core/types';
import { QuickselectBars, type QuickselectState } from '../renderers/QuickselectBars';
import { ReservoirView, type ReservoirState } from '../renderers/ReservoirView';
import { StrassenView, type StrassenState } from '../renderers/StrassenView';
import { SYM } from '../ui/symbols';

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const matrix = (rows: number, cols: number) =>
  `[${Array.from({ length: rows }, () => `[${Array.from({ length: cols }, () => rint(-4, 9)).join(', ')}]`).join(', ')}]`;

/* ---------- Strassen ---------- */

function randomStrassen(): string {
  const r = Math.random();
  if (r < 0.65) {
    const n = pick([2, 2, 3, 4, 4]);
    return `A = ${matrix(n, n)}; B = ${matrix(n, n)}; cutoff ${pick([1, 2])}`;
  }
  if (r < 0.9) {
    const [m, inner, p] = [rint(1, 4), rint(1, 4), rint(1, 4)];
    return `A = ${matrix(m, inner)}; B = ${matrix(inner, p)}; cutoff 2`;
  }
  const n = rint(2, 5);
  return `A = ${matrix(n, n)}; B = ${matrix(n, n)}`;
}

export const strassenSpec: VizSpec<StrassenInput, StrassenState> = {
  id: 'strassen',
  title: "Strassen's Matrix Multiplication",
  inputKind: 'strassen',
  inputLabel: 'Matrices and cutoff',
  inputHelp:
    'Two matrices, "A = [[1, 2], [3, 4]]; B = [[5, 6], [7, 8]]" (or rows as "1 2 / 3 4"), up to 8 x 8 with entries from -9 to 9. ' +
    '"cutoff 1" (or 2, 4...) passes cutoff=1 to the code. Its default, 64, sends every matrix this small straight to the naive loop, so a smaller cutoff is how to watch the seven-product recursion; ' +
    'below 1 the code raises ValueError. Square matrices of one size go to strassen_multiply; other shapes, or the word "general", go to strassen_multiply_general, which pads to a power of two.',
  examples: [
    { label: 'Textbook 2 x 2 (cutoff 1)', value: 'A = [[1, 2], [3, 4]]; B = [[5, 6], [7, 8]]; cutoff 1' },
    { label: '4 x 4: one split, naive 2 x 2 blocks', value: 'A = [[1, 2, 0, -1], [3, 4, 2, 0], [0, 1, 5, 2], [2, -3, 1, 1]]; B = [[2, 0, 1, 3], [1, 1, 0, -2], [0, 4, 2, 1], [3, 0, -1, 2]]; cutoff 2' },
    { label: 'Odd 3 x 3: pad by one zero row', value: 'A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]; B = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]; cutoff 2' },
    { label: '2 x 3 times 3 x 2: general wrapper', value: 'A = [[1, 2, 3], [4, 5, 6]]; B = [[1, 2], [3, 4], [5, 6]]; cutoff 2' },
    { label: 'Default cutoff 64: the naive loop', value: 'A = [[1, 2], [3, 4]]; B = [[5, 6], [7, 8]]' },
  ],
  randomInput: randomStrassen,
  parse: parseStrassen,
  trace: (input) => stabilizeStrassen(strassenTrace(input).frames),
  render: (state) => <StrassenView state={state} />,
  pseudocode: STRASSEN_CODE,
  legend: [
    { role: 'compare', label: 'quadrants or products that feed the current step' },
    { role: 'active', label: 'being computed: a factor, a product, a quadrant of C' },
    { role: 'done', label: 'computed: a product Pi, a finished part of C' },
    { role: 'muted', label: 'zero padding (dashed cells)' },
    { role: 'good', label: `the finished product C (${SYM.check})` },
    { role: 'bad', label: `ValueError: the inner sizes differ, or a cutoff below 1 (${SYM.cross})` },
  ],
  complexity: { time: 'O(n^log2(7)) = O(n^2.81); the naive O(n^3) loop at or below the cutoff', space: 'O(n^2): quadrant sums and the seven products per level' },
};

/* ---------- Randomized Quickselect ---------- */

function randomQuickselect(): string {
  const n = rint(6, 12);
  const pool = pick([Array.from({ length: 20 }, (_, i) => i + 1), [1, 2, 3, 4], [5, 5, 5, 7], [-3, 0, 4, 8, 9]]);
  const values = Array.from({ length: n }, () => pick(pool));
  const ops = [`k ${rint(0, n - 1)}`];
  if (Math.random() < 0.4) ops.push(Math.random() < 0.5 ? `k ${rint(0, n - 1)}` : `top ${rint(1, n - 1)}`);
  return `[${values.join(', ')}]; seed ${rint(1, 999)}; ${ops.join(', ')}`;
}

export const quickselectSpec: VizSpec<QsInput, QuickselectState> = {
  id: 'randomized-quickselect',
  title: 'Randomized Quickselect',
  inputKind: 'quickselect',
  inputLabel: 'Array, seed and ranks',
  inputHelp:
    'The array in brackets (up to 16 integers from -99 to 99), then operations: "k 3" calls quickselect(arr, 3) (0-indexed: k 0 is the minimum), "top 3" calls top_k_smallest(arr, 3). ' +
    'quickselect reorders the list, so a later "k" works on the reordered list, as in Python. "seed 7" makes rng = random.Random(7) (seed 1 if left out), drawing exactly the pivots Python would; ' +
    '"pivots 1 3" fixes the first pivot indexes instead. Up to 6 operations.',
  examples: [
    { label: 'Article example (seed 1)', value: '[7, 2, 9, 2, 5, 2, 8]; seed 1; k 3' },
    { label: 'All equal: one pass', value: '[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]; seed 3; k 6' },
    { label: 'Duplicates, three ranks, a bad k', value: '[3, 1, 3, 3, 2, 3, 1, 3, 2, 3]; seed 7; k 0, k 9, k 10' },
    { label: 'Select, then top 3 on a copy', value: '[7, 2, 1, 8, 6, 3, 5, 4]; seed 42; k 2, top 3' },
    { label: 'Unlucky fixed pivots: O(n^2)', value: '[1, 2, 3, 4, 5, 6, 7, 8]; pivots 0 7 7 5 6 5 7; k 7' },
  ],
  randomInput: randomQuickselect,
  parse: parseQuickselect,
  trace: (input) => stabilizeQuickselect(quickselectTrace(input).frames),
  render: (state) => <QuickselectBars state={state} />,
  pseudocode: QS_CODE,
  legend: [
    { role: 'compare', label: 'arr[i], just compared with the pivot' },
    { role: 'active', label: 'equal to the pivot (=): the band lt..i-1' },
    { role: 'done', label: 'classified: smaller (<) or larger (>) than the pivot' },
    { role: 'muted', label: 'outside lo..hi: dropped for good' },
    { role: 'good', label: `the answer (${SYM.check})` },
    { role: 'bad', label: `the call raises (${SYM.cross})` },
  ],
  complexity: { time: 'O(n) expected on any input; O(n^2) if every pivot is extreme', space: 'O(1) extra: in place, iterative' },
};

/* ---------- Reservoir sampling ---------- */

function randomReservoir(): string {
  const n = rint(5, 12);
  const k = rint(1, Math.min(4, n - 1));
  const stream = Math.random() < 0.5 ? 'abcdefghijkl'.slice(0, n).split('').join(' ') : `range ${n}`;
  return `seed ${rint(1, 999)}; k ${k}; ${stream}`;
}

export const reservoirSpec: VizSpec<ResInput, ReservoirState> = {
  id: 'reservoir-sampling',
  title: 'Reservoir Sampling',
  inputKind: 'reservoir',
  inputLabel: 'Seed, k and stream',
  inputHelp:
    `"k 2" is the sample size (0 to 8; a negative k shows the ValueError) and the stream is up to 16 items: words of up to 3 letters or numbers, or "range 10". ` +
    `"seed 8" makes rng = random.Random(8) (seed 1 if left out), so the draws are exactly Python's; "draws 0 2" fixes the first draws instead. ` +
    `The last step repeats the call "runs 1000" times (${DEFAULT_RUNS} if left out, 0 to skip, up to 10000) and counts how often each item was kept.`,
  examples: [
    { label: 'Article example (seed 8)', value: 'seed 8; k 2; a b c d e f' },
    { label: '6000 runs: every item about 1/3', value: 'seed 1; k 2; a b c d e f; runs 6000' },
    { label: 'Fixed draws, ten items', value: 'k 3; stream range 10; draws 1 4 0 6 2 8 3' },
    { label: 'k = 1: one random item', value: 'seed 7; k 1; stream range 12' },
    { label: 'Stream shorter than k', value: 'seed 4; k 5; a b c' },
  ],
  randomInput: randomReservoir,
  parse: parseReservoir,
  trace: (input) => stabilizeReservoir(reservoirTrace(input).frames),
  render: (state) => <ReservoirView state={state} />,
  pseudocode: RES_CODE,
  legend: [
    { role: 'active', label: 'the item being read, and the drawn j' },
    { role: 'compare', label: 'draw values that are slots (j < k)' },
    { role: 'done', label: 'in the reservoir' },
    { role: 'muted', label: 'dropped, or pushed out of the reservoir' },
  ],
  complexity: { time: 'O(n): one draw per item after the first k', space: 'O(k): only the reservoir' },
};
