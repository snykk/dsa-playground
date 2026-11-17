/**
 * Big-Theta growth chart: the example functions of
 * Complexity_Analysis/Time_Complexity/Big_Theta/Python/big_theta.py, ported loop for loop with a
 * counter on the basic operation, measured for every n of a range and drawn inside the band
 * c1 * g(n) .. c2 * g(n) by growthBounds.ts. Theta attaches to one case: binary search has a
 * best case and a worst case, and each gets its own chart.
 *
 *   tight_bound_example(arr)           additions total += element: n
 *   merge_sort_example(arr)            elements written to result (the merge sort of big_o_notation.py)
 *   binary_search_example(arr, target) comparisons arr[mid] == target and arr[mid] < target
 *       best: target (n - 1) // 2, found by the first probe (1)
 *       worst: target n, above every element: 2 per probe, 2(floor(log2 n) + 1)
 *   matrix_multiplication_naive(A, B)  multiply-adds C[i][j] += A[i][k] * B[k][j]: n^3
 *
 * Inputs: list(range(n)) (reversed for the merge sort), and A = B = [[i * n + j + 1]].
 * Golden fixtures (__fixtures__/complexity.json) pin every count and return value.
 */
import { mergeSortWrites, type Tally } from './bigONotation';
import type { GrowthCode, GrowthExample, Measured } from './growthBounds';

/* ---------- the ports ---------- */

export function tightBoundExample(arr: number[], t: Tally): number {
  let total = 0;
  for (const element of arr) {
    total += element;
    t.ops += 1;
  }
  return total;
}

/** probes gets every mid, in order. */
export function binarySearchExample(arr: number[], target: number, t: Tally, probes: number[] = []): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    probes.push(mid);
    t.ops += 1; // arr[mid] == target
    if (arr[mid] === target) return mid;
    t.ops += 1; // arr[mid] < target
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

export function matrixMultiplicationNaive(A: number[][], B: number[][], t: Tally): number[][] {
  const n = A.length;
  const C = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        C[i][j] += A[i][k] * B[k][j];
        t.ops += 1;
      }
    }
  }
  return C;
}

/** [[i * n + j + 1 for j in range(n)] for i in range(n)] */
export const thetaMatrix = (n: number) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i * n + j + 1));

/* ---------- the examples on the chart ---------- */

export const BIG_THETA_CODE = {
  lines: [
    'for n in range(lo, hi + 1):   # f(n) = how often the counted operation runs, for one case',
    '  tight_bound_example(arr): for element in arr: total += element',
    '  merge_sort_example(arr): merge sort; result.append / result.extend      # writes',
    '  binary_search_example(arr, target): while left <= right: mid = (left + right) // 2',
    '      if arr[mid] == target: return mid; elif arr[mid] < target: left = mid + 1; else: right = mid - 1',
    '  matrix_multiplication_naive(A, B): for i, j, k in range(n): C[i][j] += A[i][k] * B[k][j]',
    '  check: c1 * g(n) <= f(n) <= c2 * g(n)?   # if not, n0 must be larger than n',
    'n0 = the first n from which every check holds',
  ],
};

export const BIG_THETA_GROWTH: GrowthCode = { check: 6, verdict: 7 };

const plural = (k: number, word: string) => `${k.toLocaleString('en-US')} ${word}${k === 1 ? '' : 's'}`;

function measure<T>(fn: (t: Tally) => T): { ops: number; value: T } {
  const t: Tally = { ops: 0 };
  const value = fn(t);
  return { ops: t.ops, value };
}

export const BIG_THETA_EXAMPLES: GrowthExample[] = [
  {
    key: 'sum',
    aliases: ['tight', 'tight_bound_example', 'linear'],
    python: 'tight_bound_example',
    counts: 'additions',
    maxN: 40,
    defaults: { g: 'n', c: [0.5, 2], to: 20 },
    line: 1,
    growth: () => ({ rank: 2, form: 'n', limit: 1 }),
    run(n): Measured {
      const m = measure((t) => tightBoundExample(Array.from({ length: n }, (_, i) => i), t));
      return { ops: m.ops, result: m.value, detail: `the loop adds each of the ${n} elements exactly once: ${plural(m.ops, 'addition')}, on every input of size ${n}.` };
    },
  },
  {
    key: 'merge',
    aliases: ['merge sort', 'merge_sort_example', 'mergesort'],
    python: 'merge_sort_example',
    counts: 'element writes',
    maxN: 40,
    defaults: { g: 'n log n', c: [1, 2], to: 24 },
    line: 2,
    growth: () => ({ rank: 3, form: 'n ceil(log2 n) + n - 2^ceil(log2 n)', limit: 1 }),
    run(n): Measured {
      const levels: number[] = [];
      const m = measure((t) => mergeSortWrites(Array.from({ length: n }, (_, i) => n - i), t, levels));
      const detail =
        m.ops === 0
          ? `a list of 1 element is already sorted: no merge, 0 writes.`
          : `the recursion always splits in half and every level of merges writes the elements it merges, ${levels.join(' + ')} = ${plural(m.ops, 'write')}, whatever the input order.`;
      return { ops: m.ops, result: m.value, detail };
    },
  },
  {
    key: 'binary',
    aliases: ['binary search', 'binary_search_example', 'search'],
    python: 'binary_search_example',
    counts: 'comparisons',
    cases: { best: 'target at the first middle', worst: 'target absent' },
    defaultCase: 'worst',
    maxN: 40,
    defaults: { g: 'log n', c: [2, 4], to: 32 },
    caseDefaults: { best: { g: '1', c: [0.5, 2] } },
    line: 3,
    growth: (kase) => (kase === 'best' ? { rank: 0, form: '1', limit: 1 } : { rank: 1, form: '2(floor(log2 n) + 1)', limit: 2 }),
    run(n, kase): Measured {
      const probes: number[] = [];
      const arr = Array.from({ length: n }, (_, i) => i);
      const target = kase === 'best' ? Math.floor((n - 1) / 2) : n;
      const m = measure((t) => binarySearchExample(arr, target, t, probes));
      const detail =
        kase === 'best'
          ? `the target ${target} is arr[${probes[0]}], the first middle probe: 1 comparison finds it, whatever n is.`
          : `the target ${n} is above every element, so each probe compares twice (== then <) and moves left past mid: probes at ${probes.join(', ')}, ${plural(m.ops, 'comparison')}, then left > right.`;
      return { ops: m.ops, result: m.value, detail };
    },
  },
  {
    key: 'matmul',
    aliases: ['matrix multiplication', 'matrix_multiplication_naive', 'matrix'],
    python: 'matrix_multiplication_naive',
    counts: 'multiply-adds',
    maxN: 40,
    defaults: { g: 'n^3', c: [0.5, 2], to: 12 },
    line: 5,
    growth: () => ({ rank: 5, form: 'n^3', limit: 1 }),
    run(n): Measured {
      const A = thetaMatrix(n);
      const m = measure((t) => matrixMultiplicationNaive(A, thetaMatrix(n), t));
      const sum = m.value.reduce((s, row) => s + row.reduce((a, b) => a + b, 0), 0);
      return {
        ops: m.ops,
        result: sum,
        shown: `a ${n} x ${n} matrix C (entries sum to ${sum.toLocaleString('en-US')})`,
        detail: `each of the ${n * n} entr${n * n === 1 ? 'y' : 'ies'} of C takes ${n} multiply-add${n === 1 ? '' : 's'}, on every input: ${n} x ${n} x ${n} = ${m.ops.toLocaleString('en-US')}.`,
      };
    },
  },
];
