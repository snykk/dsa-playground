import {
  AMORTIZED_CODE,
  parseArrayRun,
  parseCounterRun,
  traceBinaryCounter,
  traceDynamicArray,
  type AmortizedMethod,
  type ArrayInput,
  type CounterInput,
} from '../algorithms/amortizedAnalysis';
import { BIG_O_CODE, BIG_O_EXAMPLES, BIG_O_GROWTH } from '../algorithms/bigONotation';
import { BIG_OMEGA_CODE, BIG_OMEGA_EXAMPLES, BIG_OMEGA_GROWTH } from '../algorithms/bigOmega';
import { BIG_THETA_CODE, BIG_THETA_EXAMPLES, BIG_THETA_GROWTH } from '../algorithms/bigTheta';
import { BOUND_IDS, parseGrowth, traceGrowth, type BoundKind, type GrowthCode, type GrowthExample, type GrowthInput } from '../algorithms/growthBounds';
import { parseSpace, SPACE_CODE, traceSpace, type SpaceFamily, type SpaceInput } from '../algorithms/spaceComplexity';
import type { Example, VizSpec } from '../core/types';
import { AmortizedView, stabilizeAmortized, type AmortizedState } from '../renderers/AmortizedView';
import { GrowthChart, type GrowthState } from '../renderers/GrowthChart';
import { MemoryView, stabilizeMemory, type MemoryState } from '../renderers/MemoryView';
import { SYM } from '../ui/symbols';

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/* ---------- growth charts: Big-O, Big-Omega, Big-Theta ---------- */

interface GrowthMeta {
  id: string;
  title: string;
  kind: BoundKind;
  examples: GrowthExample[];
  code: { lines: string[] };
  growth: GrowthCode;
  samples: Example[];
  help: string;
  legend: VizSpec<GrowthInput, GrowthState>['legend'];
  complexity: { time: string; space: string };
}

function growthSpec(meta: GrowthMeta): VizSpec<GrowthInput, GrowthState> {
  const parse = (text: string) => parseGrowth(text, meta.kind, meta.examples);
  return {
    id: meta.id,
    title: meta.title,
    inputKind: `growth-${meta.kind.toLowerCase()}`,
    inputLabel: 'Example, bound, constant and range of n',
    inputHelp: meta.help,
    examples: meta.samples,
    randomInput: () => {
      const ex = pick(meta.examples);
      const kase = ex.cases ? ` ${pick(Object.keys(ex.cases))}` : '';
      const g = Math.random() < 0.6 ? '' : `, g ${pick(BOUND_IDS.slice(0, 7))}`;
      const c = meta.kind === 'Theta' ? `, c1 ${pick(['0.25', '0.5', '1'])}, c2 ${pick(['1', '2', '4'])}` : `, c ${pick(['0.1', '0.25', '0.5', '1', '2', '4'])}`;
      return `${ex.key}${kase}${g}${c}, n ${rint(Math.min(8, ex.maxN), ex.maxN)}`;
    },
    parse,
    trace: (input) => {
      const ex = meta.examples.find((e) => e.key === input.example)!;
      return traceGrowth(input, ex, meta.growth).frames;
    },
    render: (state) => <GrowthChart state={state} />,
    pseudocode: meta.code.lines,
    legend: meta.legend,
    complexity: meta.complexity,
  };
}

const BOUND_HELP = `g is one of ${BOUND_IDS.join(', ')} (log base 2).`;

export const bigOGrowthSpec = growthSpec({
  id: 'big-o-growth',
  title: 'Big-O: f(n) under c * g(n)',
  kind: 'O',
  examples: BIG_O_EXAMPLES,
  code: BIG_O_CODE,
  growth: BIG_O_GROWTH,
  help:
    'Name an example of big_o_notation.py (constant, logarithmic, linear, linearithmic, quadratic, cubic, exponential, factorial), then optionally "g n^2", "c 0.5" (a positive number or a fraction such as 1/4) and "n 20" (or "n 5..20"). ' +
    `${BOUND_HELP} f(n) counts the operation the pseudocode comment names, measured by running the ported code at every n. n goes up to 40, 25 for exponential and 8 for factorial.`,
  samples: [
    { label: 'Fibonacci calls vs 0.1 * 2^n', value: 'exponential, g 2^n, c 0.1, n 20' },
    { label: 'n^2 is not O(n)', value: 'quadratic, g n, c 4, n 16' },
    { label: 'Merge sort with c = 1', value: 'linearithmic, g n log n, c 1, n 24' },
    { label: 'Permutations are not O(n!)', value: 'factorial, g n!, c 5, n 8' },
    { label: 'Halving: floor(log2 n)', value: 'logarithmic, g log n, c 1, n 40' },
  ],
  legend: [
    { role: 'active', label: 'f(n) just measured' },
    { role: 'compare', label: 'the bound c * g(n)' },
    { role: 'good', label: `f(n) <= c * g(n): kept (dot, ${SYM.check})` },
    { role: 'bad', label: `f(n) > c * g(n): broken (cross, ${SYM.cross})` },
    { role: 'done', label: 'from n0 on (shaded)' },
  ],
  complexity: { time: 'from O(1) (constant) to O(n * n!) (factorial), one example at a time', space: 'O(1) to O(n * n!) (factorial keeps every permutation)' },
});

export const bigOmegaGrowthSpec = growthSpec({
  id: 'big-omega-growth',
  title: 'Big-Omega: f(n) over c * g(n)',
  kind: 'Omega',
  examples: BIG_OMEGA_EXAMPLES,
  code: BIG_OMEGA_CODE,
  growth: BIG_OMEGA_GROWTH,
  help:
    'Name an example of big_omega.py (search, bubble, quick, matrix) and its case: "best" (the default, a lower bound there holds on every input), "worst" (search and bubble) or "distinct" (quick sort on distinct keys). ' +
    `Then optionally "g n", "c 0.5" (or a fraction such as 1/4) and "n 16" (or "n 2..16"). ${BOUND_HELP} n goes up to 40.`,
  samples: [
    { label: 'Bubble sort, sorted input', value: 'bubble best, g n, c 0.5, n 16' },
    { label: 'Quick sort, equal keys: not n log n', value: 'quick best, g n log n, c 1, n 24' },
    { label: 'Quick sort, distinct keys', value: 'quick distinct, g n log n, c 1, n 32' },
    { label: 'Linear search: Omega(1)', value: 'search best, g 1, c 1, n 20' },
    { label: 'Bubble sort, reversed', value: 'bubble worst, g n^2, c 1/4, n 16' },
  ],
  legend: [
    { role: 'active', label: 'f(n) just measured' },
    { role: 'compare', label: 'the lower bound c * g(n)' },
    { role: 'good', label: `f(n) >= c * g(n): kept (dot, ${SYM.check})` },
    { role: 'bad', label: `f(n) < c * g(n): broken (cross, ${SYM.cross})` },
    { role: 'done', label: 'from n0 on (shaded)' },
  ],
  complexity: { time: 'best cases Theta(1) to Theta(n^2); worst cases up to Theta(n^2)', space: 'O(1); quick sort allocates new lists, O(n) per level' },
});

export const bigThetaGrowthSpec = growthSpec({
  id: 'big-theta-growth',
  title: 'Big-Theta: f(n) inside the band',
  kind: 'Theta',
  examples: BIG_THETA_EXAMPLES,
  code: BIG_THETA_CODE,
  growth: BIG_THETA_GROWTH,
  help:
    'Name an example of big_theta.py (sum, merge, binary, matmul); binary search takes a case, "worst" (the default, target absent) or "best" (target at the first middle). ' +
    `Then optionally "g log n", "c1 2, c2 4" (c1 <= c2) and "n 32" (or "n 2..32"). ${BOUND_HELP} n goes up to 40.`,
  samples: [
    { label: 'Merge sort in the band', value: 'merge, g n log n, c1 1, c2 2, n 24' },
    { label: 'Binary search, worst case', value: 'binary worst, g log n, c1 2, c2 4, n 32' },
    { label: 'Best case is not Theta(log n)', value: 'binary best, g log n, c1 0.5, c2 4, n 32' },
    { label: 'Matrix multiplication', value: 'matmul, g n^3, c1 1, c2 1, n 10' },
    { label: 'Sum: Theta(n)', value: 'sum, g n, c1 0.5, c2 2, n 20' },
  ],
  legend: [
    { role: 'active', label: 'f(n) just measured' },
    { role: 'compare', label: 'the band c1 * g(n) (dashed) to c2 * g(n)' },
    { role: 'good', label: `inside the band (dot, ${SYM.check})` },
    { role: 'bad', label: `outside it (cross, ${SYM.cross})` },
    { role: 'done', label: 'from n0 on (shaded)' },
  ],
  complexity: { time: 'one Theta per case: binary search Theta(1) best, Theta(log n) worst; Theta(n^3) for the product', space: 'O(1), O(n) for merge sort, O(n^2) for the product C' },
});

/* ---------- space complexity ---------- */

interface SpaceMeta {
  id: string;
  title: string;
  family: SpaceFamily;
  help: string;
  samples: Example[];
  random: () => string;
  legend: VizSpec<SpaceInput, MemoryState>['legend'];
  complexity: { time: string; space: string };
}

function spaceSpec(meta: SpaceMeta): VizSpec<SpaceInput, MemoryState> {
  return {
    id: meta.id,
    title: meta.title,
    inputKind: `space-${meta.family}`,
    inputLabel: meta.family === 'merge' ? 'List to sort' : 'Example and size',
    inputHelp: meta.help,
    examples: meta.samples,
    randomInput: meta.random,
    parse: (text) => parseSpace(text, meta.family),
    trace: (input) => stabilizeMemory(traceSpace(input).frames),
    render: (state) => <MemoryView state={state} />,
    pseudocode: SPACE_CODE[meta.family],
    legend: meta.legend,
    complexity: meta.complexity,
  };
}

export const spaceCallStackSpec = spaceSpec({
  id: 'space-call-stack',
  title: 'Call stack: Fibonacci and halving',
  family: 'stack',
  help:
    '"fib 6" runs recursive_fibonacci_naive(6) (n up to 10); "log 16" runs logarithmic_space_example(16) (n up to 64). Every call pushes a frame and every return pops one; ' +
    'the timeline counts the frames alive after each step, so the peak is the deepest the stack got.',
  samples: [
    { label: 'Fibonacci: depth n, not 2^n', value: 'fib 5' },
    { label: 'Halving: log n frames', value: 'log 16' },
    { label: 'Fibonacci of 8: 67 calls', value: 'fib 8' },
    { label: 'Not a power of two', value: 'log 6' },
    { label: 'A base case only', value: 'fib 1' },
  ],
  random: () => (Math.random() < 0.5 ? `fib ${rint(2, 7)}` : `log ${rint(2, 40)}`),
  legend: [
    { role: 'active', label: 'the call running now' },
    { role: 'compare', label: 'a call waiting for the call it made (dashed)' },
    { role: 'done', label: 'a call that returned; the peak on the timeline' },
    { role: 'muted', label: 'a call not made yet (faint)' },
  ],
  complexity: { time: 'Fibonacci O(2^n) calls; halving O(n) calls', space: 'Fibonacci O(n) frames; halving O(log n) frames' },
});

export const spaceMergeSortSpec = spaceSpec({
  id: 'space-merge-sort',
  title: 'Merge sort: buffers',
  family: 'merge',
  help:
    'Up to 8 whole numbers (-99 to 999) for merge_sort_space, e.g. "38 27 43 3 9 82 10". Each call gets its own slice of the list (a new list), keeps the sorted left and right, and builds result. ' +
    'The input (dashed) is not counted; every other cell and every frame is one unit.',
  samples: [
    { label: 'Seven numbers (textbook)', value: '38 27 43 3 9 82 10' },
    { label: 'Eight, reversed', value: '8 7 6 5 4 3 2 1' },
    { label: 'Equal keys go right', value: '5 1 5 1' },
    { label: 'One element: no copy', value: '42' },
    { label: 'Empty list', value: '[]' },
  ],
  random: () => Array.from({ length: rint(3, 8) }, () => rint(1, 99)).join(' '),
  legend: [
    { role: 'active', label: 'the running call; a cell just written or copied' },
    { role: 'compare', label: 'a waiting call; the two cells being compared' },
    { role: 'done', label: 'a returned list; a call returning; the peak' },
  ],
  complexity: { time: 'O(n log n)', space: 'O(n) auxiliary: about 2n cells at the peak, though O(n log n) are allocated in all' },
});

export const spaceLoopsSpec = spaceSpec({
  id: 'space-loops',
  title: 'Loops: constant to quadratic, and in place',
  family: 'loops',
  help:
    '"constant 10" (n up to 20), "linear 8" (up to 16), "quadratic 4" (up to 6) or "reverse 1 2 3 4" (up to 16 numbers). One frame runs the loop; the lists it builds grow cell by cell. ' +
    'The list in_place_reverse gets is its input, so it is not counted.',
  samples: [
    { label: 'In-place reverse: O(1)', value: 'reverse 1 2 3 4 5 6 7 8' },
    { label: 'A list of n: O(n)', value: 'linear 8' },
    { label: 'A matrix: O(n^2)', value: 'quadratic 4' },
    { label: 'A running total: O(1)', value: 'constant 10' },
    { label: 'n = 0', value: 'linear 0' },
  ],
  random: () =>
    pick([
      () => `constant ${rint(3, 12)}`,
      () => `linear ${rint(3, 12)}`,
      () => `quadratic ${rint(2, 5)}`,
      () => `reverse ${Array.from({ length: rint(3, 10) }, () => rint(1, 99)).join(' ')}`,
    ])(),
  legend: [
    { role: 'active', label: 'the running call; a cell just written or swapped' },
    { role: 'compare', label: 'the left and right indices' },
    { role: 'done', label: 'the call returning; the peak on the timeline' },
  ],
  complexity: { time: 'O(n), O(n), O(n^2) and O(n)', space: 'O(1), O(n), O(n^2) and O(1) extra' },
});

/* ---------- amortized analysis ---------- */

const ARRAY_HELP =
  '"cap 2, n 8": DynamicArray(initial_capacity=2), then append(0) ... append(7). The capacity defaults to 4, the Python default. aggregate_method_example uses 4 and 10 appends; the accounting and potential demos use 2 and 8. ' +
  'Capacity 0 to 12 and 1 to 24 appends, ending with at most 24 slots.';

const ARRAY_SAMPLES: Example[] = [
  { label: 'Grow from 1 to 16', value: 'cap 1, n 16' },
  { label: 'Capacity 0', value: 'cap 0, n 9' },
  { label: 'Capacity 3: 3, 6, 12, 24', value: 'cap 3, n 13' },
];

function arraySpec(method: AmortizedMethod, meta: { id: string; title: string; first: Example; legend: VizSpec<ArrayInput, AmortizedState>['legend']; complexity: { time: string; space: string } }): VizSpec<ArrayInput, AmortizedState> {
  return {
    id: meta.id,
    title: meta.title,
    inputKind: 'amortized-array',
    inputLabel: 'Initial capacity and appends',
    inputHelp: ARRAY_HELP,
    examples: [meta.first, ...(meta.first.value === 'cap 2, n 8' ? [{ label: 'The aggregate demo', value: 'cap 4, n 10' }] : [{ label: 'The accounting demo', value: 'cap 2, n 8' }]), ...ARRAY_SAMPLES],
    randomInput: () => {
      for (;;) {
        const text = `cap ${rint(0, 6)}, n ${rint(4, 16)}`;
        try {
          parseArrayRun(text);
          return text;
        } catch {
          // too many slots: draw again
        }
      }
    },
    parse: parseArrayRun,
    trace: (input) => stabilizeAmortized(traceDynamicArray(input, method).frames),
    render: (state) => <AmortizedView state={state} />,
    pseudocode: AMORTIZED_CODE[method],
    legend: meta.legend,
    complexity: meta.complexity,
  };
}

export const amortizedAggregateSpec = arraySpec('aggregate', {
  id: 'amortized-aggregate',
  title: 'Aggregate method',
  first: { label: 'The aggregate demo', value: 'cap 4, n 10' },
  legend: [
    { role: 'active', label: 'the write or copy now; the running total cost' },
    { role: 'compare', label: 'the bound 3n' },
    { role: 'muted', label: 'stale copy left in the old block' },
  ],
  complexity: { time: 'append O(n) worst, O(1) amortized: n appends cost less than 3n', space: 'O(n): capacity at most 2n' },
});

export const amortizedAccountingSpec = arraySpec('accounting', {
  id: 'amortized-accounting',
  title: 'Accounting method',
  first: { label: 'The accounting demo', value: 'cap 2, n 8' },
  legend: [
    { role: 'active', label: 'the write or copy now; coins just charged' },
    { role: 'done', label: 'coins saved on the cells, and the bank' },
    { role: 'compare', label: 'the charge: 3 per append' },
    { role: 'muted', label: 'stale copy; a coin just spent (dashed)' },
  ],
  complexity: { time: '3 coins per append always cover the cost: O(1) amortized', space: 'O(n)' },
});

export const amortizedPotentialSpec = arraySpec('potential', {
  id: 'amortized-potential',
  title: 'Potential method',
  first: { label: 'The potential demo', value: 'cap 2, n 8' },
  legend: [
    { role: 'active', label: 'the write or copy now; this append\'s actual cost' },
    { role: 'done', label: 'the potential 2 * size - capacity' },
    { role: 'compare', label: 'amortized cost = actual + change in potential' },
    { role: 'muted', label: 'stale copy left in the old block' },
  ],
  complexity: { time: 'amortized cost at most 3 per append: O(1)', space: 'O(n)' },
});

export const binaryCounterSpec: VizSpec<CounterInput, AmortizedState> = {
  id: 'binary-counter',
  title: 'Binary counter',
  inputKind: 'binary-counter',
  inputLabel: 'Bits and increments',
  inputHelp:
    '"bits 4, n 10": BinaryCounter(n_bits=4), then 10 increments (n_bits defaults to 8, the Python default; binary_counter_example uses 4 bits and 10 increments). 1 to 10 bits, 1 to 40 increments. Past all ones the counter wraps to 0.',
  examples: [
    { label: 'The demo: 4 bits, 10 increments', value: 'bits 4, n 10' },
    { label: 'Wrap around at 16', value: 'bits 4, n 16' },
    { label: '8 bits, 32 increments', value: 'bits 8, n 32' },
    { label: 'One bit', value: 'bits 1, n 4' },
  ],
  randomInput: () => `bits ${rint(3, 8)}, n ${rint(6, 24)}`,
  parse: parseCounterRun,
  trace: (input) => stabilizeAmortized(traceBinaryCounter(input).frames),
  render: (state) => <AmortizedView state={state} />,
  pseudocode: AMORTIZED_CODE.counter,
  legend: [
    { role: 'active', label: 'the bit flipping now; this increment\'s flips' },
    { role: 'done', label: 'a 1 bit and the coin it keeps' },
    { role: 'compare', label: 'the bound 2n' },
  ],
  complexity: { time: 'increment O(n_bits) worst, O(1) amortized: n increments flip at most 2n bits', space: 'O(n_bits)' },
};
