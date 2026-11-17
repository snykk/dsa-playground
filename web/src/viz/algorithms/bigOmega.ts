/**
 * Big-Omega growth chart: the example functions of
 * Complexity_Analysis/Time_Complexity/Big_Omega/Python/big_omega.py, ported loop for loop with a
 * counter on the basic operation, measured for every n of a range and drawn above c * g(n) by
 * growthBounds.ts. A lower bound that holds on the best-case input holds on every input, so the
 * best case is the default; the worst case (or quick sort's distinct keys) is one word away.
 *
 *   linear_search_best_case(arr, target)  comparisons element == target
 *       best: target 0 at index 0 (1)     worst: target -1, absent (n)
 *   bubble_sort_best_case(arr)            comparisons arr[j] > arr[j + 1] (early-exit flag)
 *       best: list(range(n)), sorted (n - 1)   worst: reversed (n(n - 1)/2)
 *   quick_sort_best_case(arr)             comparisons with the pivot: <, == and > per element
 *       best: n equal keys (3n)           distinct: list(range(n)), even splits (about 3 n log2 n)
 *   matrix_traversal_lower_bound(matrix)  additions total += element on an n x n matrix (n^2)
 *
 * Golden fixtures (__fixtures__/complexity.json) pin every count and return value, measured on
 * the Python code with elements that count their comparisons and with sys.settrace.
 */
import type { GrowthCode, GrowthExample, Measured } from './growthBounds';
import { descendingSum, type Tally } from './bigONotation';

/* ---------- the ports ---------- */

export function linearSearchBestCase(arr: number[], target: number, t: Tally): number {
  for (let i = 0; i < arr.length; i++) {
    t.ops += 1; // element == target
    if (arr[i] === target) return i;
  }
  return -1;
}

/** Sorts arr in place (and returns it); passes gets the comparisons of every pass. */
export function bubbleSortBestCase(arr: number[], t: Tally, passes: number[] = []): number[] {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    let compared = 0;
    for (let j = 0; j < n - i - 1; j++) {
      t.ops += 1; // arr[j] > arr[j + 1]
      compared += 1;
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    passes.push(compared);
    if (!swapped) break;
  }
  return arr;
}

/** Three-way quick sort that builds new lists; calls gets len(arr) of every call, in call order. */
export function quickSortBestCase(arr: number[], t: Tally, calls: number[] = []): number[] {
  calls.push(arr.length);
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const compare = (keep: (x: number) => boolean) =>
    arr.filter((x) => {
      t.ops += 1;
      return keep(x);
    });
  const left = compare((x) => x < pivot);
  const middle = compare((x) => x === pivot);
  const right = compare((x) => x > pivot);
  return [...quickSortBestCase(left, t, calls), ...middle, ...quickSortBestCase(right, t, calls)];
}

export function matrixTraversalLowerBound(matrix: number[][], t: Tally): number {
  let total = 0;
  for (const row of matrix) {
    for (const element of row) {
      total += element;
      t.ops += 1;
    }
  }
  return total;
}

/* ---------- inputs of size n ---------- */

export const omegaInputs = {
  sorted: (n: number) => Array.from({ length: n }, (_, i) => i),
  reversed: (n: number) => Array.from({ length: n }, (_, i) => n - i),
  equal: (n: number) => Array.from({ length: n }, () => 7),
  /** [[i * n + j for j in range(n)] for i in range(n)] */
  matrix: (n: number) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i * n + j)),
};

/* ---------- the examples on the chart ---------- */

export const BIG_OMEGA_CODE = {
  lines: [
    'for n in range(lo, hi + 1):   # f(n) = comparisons or additions on the chosen input',
    '  linear_search_best_case(arr, target): for i, element in enumerate(arr): if element == target: return i',
    '  bubble_sort_best_case(arr): for i: swapped = False; for j in range(n - i - 1): if arr[j] > arr[j + 1]: swap',
    '      if not swapped: break        # the early exit: a sorted list stops after one pass',
    '  quick_sort_best_case(arr): pivot = arr[len(arr) // 2]; left, middle, right = x < / == / > pivot',
    '      return quick_sort_best_case(left) + middle + quick_sort_best_case(right)',
    '  matrix_traversal_lower_bound(matrix): for row in matrix: for element in row: total += element',
    '  check: c * g(n) <= f(n)?        # if not, n0 must be larger than n',
    'n0 = the first n from which every check holds',
  ],
};

export const BIG_OMEGA_GROWTH: GrowthCode = { check: 7, verdict: 8 };

const plural = (k: number, word: string) => `${k.toLocaleString('en-US')} ${word}${k === 1 ? '' : 's'}`;

function measure<T>(fn: (t: Tally) => T): { ops: number; value: T } {
  const t: Tally = { ops: 0 };
  const value = fn(t);
  return { ops: t.ops, value };
}

export const BIG_OMEGA_EXAMPLES: GrowthExample[] = [
  {
    key: 'search',
    aliases: ['linear search', 'linear_search_best_case', 'linear'],
    python: 'linear_search_best_case',
    counts: 'comparisons',
    cases: { best: 'target first', worst: 'target absent' },
    defaultCase: 'best',
    maxN: 40,
    defaults: { g: '1', c: [1], to: 20 },
    caseDefaults: { worst: { g: 'n', c: [1] } },
    line: 1,
    growth: (kase) => (kase === 'worst' ? { rank: 2, form: 'n', limit: 1 } : { rank: 0, form: '1', limit: 1 }),
    run(n, kase): Measured {
      const target = kase === 'worst' ? -1 : 0;
      const m = measure((t) => linearSearchBestCase(omegaInputs.sorted(n), target, t));
      const detail =
        kase === 'worst'
          ? `the target -1 is not in list(range(${n})): all ${plural(n, 'element')} ${n === 1 ? 'is' : 'are'} compared before the function returns -1.`
          : `the target 0 is arr[0]: the first comparison matches and the function returns 0, whatever n is.`;
      return { ops: m.ops, result: m.value, detail };
    },
  },
  {
    key: 'bubble',
    aliases: ['bubble sort', 'bubble_sort_best_case'],
    python: 'bubble_sort_best_case',
    counts: 'comparisons',
    cases: { best: 'sorted input', worst: 'reversed input' },
    defaultCase: 'best',
    maxN: 40,
    defaults: { g: 'n', c: [0.5], to: 16 },
    caseDefaults: { worst: { g: 'n^2', c: [0.25] } },
    line: 2,
    growth: (kase) => (kase === 'worst' ? { rank: 4, form: 'n(n - 1)/2', limit: 0.5 } : { rank: 2, form: 'n - 1', limit: 1 }),
    run(n, kase): Measured {
      const passes: number[] = [];
      const m = measure((t) => bubbleSortBestCase(kase === 'worst' ? omegaInputs.reversed(n) : omegaInputs.sorted(n), t, passes));
      let detail: string;
      if (n <= 1) detail = `one element: the first pass has no neighbours to compare (range(0) is empty), swaps nothing and breaks: 0 comparisons.`;
      else if (kase === 'worst')
        detail = `the reversed list swaps in every pass until the last one: the passes compare ${descendingSum(n - 1)} = ${plural(m.ops, 'pair')}, then a pass with nothing to compare breaks.`;
      else detail = `list(range(${n})) is sorted: the first pass compares ${plural(n - 1, 'neighbour pair')}, swaps nothing, and the early exit stops the sort.`;
      return { ops: m.ops, result: m.value, detail };
    },
  },
  {
    key: 'quick',
    aliases: ['quick sort', 'quick_sort_best_case', 'quicksort'],
    python: 'quick_sort_best_case',
    counts: 'comparisons',
    cases: { best: 'all keys equal', distinct: 'distinct sorted keys' },
    defaultCase: 'best',
    maxN: 40,
    defaults: { g: 'n', c: [3], to: 24 },
    caseDefaults: { distinct: { g: 'n log n', c: [1] } },
    line: 4,
    growth: (kase) => (kase === 'distinct' ? { rank: 3, form: 'about 3 n log2 n', limit: 3 } : { rank: 2, form: '3n for n >= 2', limit: 3 }),
    run(n, kase): Measured {
      const calls: number[] = [];
      const m = measure((t) => quickSortBestCase(kase === 'distinct' ? omegaInputs.sorted(n) : omegaInputs.equal(n), t, calls));
      let detail: string;
      if (n <= 1) detail = `a list of ${n} element${n === 1 ? '' : 's'} is returned at once: 0 comparisons.`;
      else if (kase === 'distinct')
        detail = `the middle pivot splits the sorted keys evenly, and each call compares every element with its pivot three times (<, ==, >): ${plural(m.ops, 'comparison')} over ${plural(calls.length, 'call')}.`;
      else
        detail = `all ${n} keys equal the pivot: the three list comprehensions compare each element with it, 3 x ${n} = ${m.ops}, and left and right come out empty, so the recursion stops after one partition.`;
      return { ops: m.ops, result: m.value, detail };
    },
  },
  {
    key: 'matrix',
    aliases: ['matrix traversal', 'matrix_traversal_lower_bound', 'traversal'],
    python: 'matrix_traversal_lower_bound',
    counts: 'additions',
    maxN: 40,
    defaults: { g: 'n^2', c: [1], to: 16 },
    line: 6,
    growth: () => ({ rank: 4, form: 'n^2', limit: 1 }),
    run(n): Measured {
      const m = measure((t) => matrixTraversalLowerBound(omegaInputs.matrix(n), t));
      return { ops: m.ops, result: m.value, detail: `the ${n} x ${n} matrix holds ${plural(n * n, 'element')}, and the two loops add each one once: ${plural(m.ops, 'addition')}.` };
    },
  },
];
