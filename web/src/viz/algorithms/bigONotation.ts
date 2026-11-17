/**
 * Big-O growth chart: the example functions of
 * Complexity_Analysis/Time_Complexity/Big_O_Notation/Python/big_o_notation.py, ported loop for
 * loop with a counter on the basic operation, measured for every n of a range and drawn against
 * c * g(n) by growthBounds.ts.
 *
 *   constant_time_example(n)        the return: 1 step
 *   logarithmic_time_example(n)     halvings i = i // 2: floor(log2 n)
 *   linear_time_example(arr)        additions total += element: n
 *   linearithmic_time_example(arr)  merge sort: elements written to result (append, extend)
 *   quadratic_time_example(arr)     pairs.append: n(n - 1)/2
 *   cubic_time_example(n)           count += 1: n^3
 *   exponential_time_example(n)     calls (naive Fibonacci): 2F(n + 1) - 1
 *   factorial_time_example(n)       elements written into new permutations: (n + 1)! - 1
 *
 * The inputs of size n are list(range(n)), and list(range(n, 0, -1)) for the merge sort. Golden
 * fixtures (__fixtures__/complexity.json, from web/scripts/gen_complexity_fixtures.py) pin every
 * count and every return value, measured on the Python code by tracing and wrapping it.
 */
import { factorial, PHI_RANK, pyRepr, type GrowthCode, type GrowthExample, type Measured } from './growthBounds';

export interface Tally {
  ops: number;
}

/* ---------- the ports ---------- */

export function constantTimeExample(_n: number, t: Tally): number {
  t.ops += 1; // return 42
  return 42;
}

/** Returns count; trail gets every value of i. */
export function logarithmicTimeExample(n: number, t: Tally, trail: number[] = []): number {
  let count = 0;
  let i = n;
  trail.push(i);
  while (i > 1) {
    i = Math.floor(i / 2); // i = i // 2 (i > 1, so floor division)
    t.ops += 1;
    trail.push(i);
    count += 1;
  }
  return count;
}

export function linearTimeExample(arr: number[], t: Tally): number {
  let total = 0;
  for (const element of arr) {
    total += element;
    t.ops += 1;
  }
  return total;
}

/**
 * The merge sort of linearithmic_time_example (also merge_sort_example in big_theta.py and
 * merge_sort_space in space_complexity.py: the same code). Counts every element written to
 * result: one per append, len(left) - i or len(right) - j per extend. levels[d] gets the writes
 * of the merges at recursion depth d.
 */
export function mergeSortWrites(arr: number[], t: Tally, levels: number[] = [], depth = 0): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSortWrites(arr.slice(0, mid), t, levels, depth + 1);
  const right = mergeSortWrites(arr.slice(mid), t, levels, depth + 1);
  const result: number[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i]);
      i += 1;
    } else {
      result.push(right[j]);
      j += 1;
    }
    t.ops += 1;
  }
  result.push(...left.slice(i));
  t.ops += left.length - i;
  result.push(...right.slice(j));
  t.ops += right.length - j;
  levels[depth] = (levels[depth] ?? 0) + result.length;
  return result;
}

export function quadraticTimeExample(arr: number[], t: Tally): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      pairs.push([arr[i], arr[j]]);
      t.ops += 1;
    }
  }
  return pairs;
}

export function cubicTimeExample(n: number, t: Tally): number {
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        count += 1;
        t.ops += 1;
      }
    }
  }
  return count;
}

/** Counts calls (each call is one unit). */
export function exponentialTimeExample(n: number, t: Tally): number {
  t.ops += 1;
  if (n <= 1) return n;
  return exponentialTimeExample(n - 1, t) + exponentialTimeExample(n - 2, t);
}

/** Counts the elements of every new permutation list (len(perm) + 1 per append). */
export function factorialTimeExample(n: number, t: Tally): number[][] {
  if (n === 0) return [[]];
  const result: number[][] = [];
  for (const perm of factorialTimeExample(n - 1, t)) {
    const size = perm.length + 1; // range(len(perm) + 1) is fixed when the loop starts
    for (let i = 0; i < size; i++) {
      result.push([...perm.slice(0, i), n - 1, ...perm.slice(i)]);
      t.ops += perm.length + 1;
    }
  }
  return result;
}

/* ---------- the examples on the chart ---------- */

export const BIG_O_CODE = {
  lines: [
    'for n in range(lo, hi + 1):   # f(n) = how often the counted line runs',
    '  constant_time_example(n): return 42                          # 1 step',
    '  logarithmic_time_example(n): while i > 1: i = i // 2; count += 1',
    '  linear_time_example(arr): for element in arr: total += element',
    '  linearithmic_time_example(arr): merge sort; result.append / result.extend   # writes',
    '  quadratic_time_example(arr): for i: for j in range(i + 1, n): pairs.append((arr[i], arr[j]))',
    '  cubic_time_example(n): for i, j, k in range(n): count += 1',
    '  exponential_time_example(n): if n <= 1: return n; return f(n - 1) + f(n - 2)   # calls',
    '  factorial_time_example(n): for perm in f(n - 1): for i: result.append(perm[:i] + [n - 1] + perm[i:])',
    '  check: f(n) <= c * g(n)?        # if not, n0 must be larger than n',
    'n0 = the first n from which every check holds',
  ],
};

export const BIG_O_GROWTH: GrowthCode = { check: 9, verdict: 10 };

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const plural = (k: number, word: string) => `${k.toLocaleString('en-US')} ${word}${k === 1 ? '' : 's'}`;

function measure<T>(fn: (t: Tally) => T): { ops: number; value: T } {
  const t: Tally = { ops: 0 };
  const value = fn(t);
  return { ops: t.ops, value };
}

/** "(n - 1) + (n - 2) + ... + 1" with the numbers, short when n is large. */
export function descendingSum(top: number): string {
  if (top <= 0) return '0';
  if (top <= 6) return Array.from({ length: top }, (_, k) => top - k).join(' + ');
  return `${top} + ${top - 1} + ... + 1`;
}

export const BIG_O_EXAMPLES: GrowthExample[] = [
  {
    key: 'constant',
    aliases: ['constant_time_example', 'o1'],
    python: 'constant_time_example',
    counts: 'steps',
    maxN: 40,
    defaults: { g: '1', c: [1], to: 16 },
    line: 1,
    growth: () => ({ rank: 0, form: '1', limit: 1 }),
    run(n): Measured {
      const m = measure((t) => constantTimeExample(n, t));
      return { ops: m.ops, result: m.value, detail: `constant_time_example(${n}) returns 42 at once: 1 step, whatever n is.` };
    },
  },
  {
    key: 'logarithmic',
    aliases: ['log', 'logarithmic_time_example', 'logn'],
    python: 'logarithmic_time_example',
    counts: 'halvings',
    maxN: 40,
    defaults: { g: 'log n', c: [1], to: 40 },
    line: 2,
    growth: () => ({ rank: 1, form: 'floor(log2 n)', limit: 1 }),
    run(n): Measured {
      const trail: number[] = [];
      const m = measure((t) => logarithmicTimeExample(n, t, trail));
      const detail =
        m.ops === 0
          ? `i = ${n} is not above 1, so the loop never runs: 0 halvings.`
          : `i halves ${trail.join(' -> ')}: ${plural(m.ops, 'halving')} until i <= 1, one per bit after the leading one.`;
      return { ops: m.ops, result: m.value, detail };
    },
  },
  {
    key: 'linear',
    aliases: ['linear_time_example', 'sum'],
    python: 'linear_time_example',
    counts: 'additions',
    maxN: 40,
    defaults: { g: 'n', c: [1], to: 20 },
    line: 3,
    growth: () => ({ rank: 2, form: 'n', limit: 1 }),
    run(n): Measured {
      const m = measure((t) => linearTimeExample(range(n), t));
      return { ops: m.ops, result: m.value, detail: `the loop adds each of the ${n} elements of list(range(${n})) to total: ${plural(m.ops, 'addition')}.` };
    },
  },
  {
    key: 'linearithmic',
    aliases: ['linearithmic_time_example', 'merge', 'merge sort', 'nlogn'],
    python: 'linearithmic_time_example',
    counts: 'element writes',
    maxN: 40,
    defaults: { g: 'n log n', c: [2], to: 24 },
    line: 4,
    growth: () => ({ rank: 3, form: 'n ceil(log2 n) + n - 2^ceil(log2 n)', limit: 1 }),
    run(n): Measured {
      const levels: number[] = [];
      const m = measure((t) => mergeSortWrites(range(n).map((i) => n - i), t, levels));
      const detail =
        m.ops === 0
          ? `a list of ${n === 0 ? 'no elements' : '1 element'} is already sorted: no merge, 0 writes.`
          : `merge sort on ${n} elements: each level of merges writes the elements it merges into result, ${levels.join(' + ')} = ${plural(m.ops, 'write')} over ${plural(levels.length, 'level')}.`;
      return { ops: m.ops, result: m.value, detail };
    },
  },
  {
    key: 'quadratic',
    aliases: ['quadratic_time_example', 'pairs'],
    python: 'quadratic_time_example',
    counts: 'appended pairs',
    maxN: 40,
    defaults: { g: 'n^2', c: [0.5], to: 16 },
    line: 5,
    growth: () => ({ rank: 4, form: 'n(n - 1)/2', limit: 0.5 }),
    run(n): Measured {
      const m = measure((t) => quadraticTimeExample(range(n), t));
      const shown = `[${m.value.slice(0, 3).map(([a, b]) => `(${a}, ${b})`).join(', ')}${m.value.length > 3 ? `, ... (${m.value.length} pairs)` : ''}]`;
      return { ops: m.ops, result: m.value.length, shown, detail: `one pair for each i < j: ${descendingSum(n - 1)} = ${plural(m.ops, 'pair')} appended.` };
    },
  },
  {
    key: 'cubic',
    aliases: ['cubic_time_example'],
    python: 'cubic_time_example',
    counts: 'count += 1 steps',
    maxN: 40,
    defaults: { g: 'n^3', c: [1], to: 12 },
    line: 6,
    growth: () => ({ rank: 5, form: 'n^3', limit: 1 }),
    run(n): Measured {
      const m = measure((t) => cubicTimeExample(n, t));
      return { ops: m.ops, result: m.value, detail: `three nested loops of ${n} run count += 1 ${n} x ${n} x ${n} = ${m.ops.toLocaleString('en-US')} times.` };
    },
  },
  {
    key: 'exponential',
    aliases: ['exponential_time_example', 'fib', 'fibonacci'],
    python: 'exponential_time_example',
    counts: 'calls',
    maxN: 25,
    capReason: 'exponential_time_example(25) already makes 242,785 calls, so n goes up to 25 here: the run stays quick and the chart drawable.',
    defaults: { g: '2^n', c: [1], to: 20 },
    line: 7,
    growth: () => ({ rank: PHI_RANK, form: '2F(n + 1) - 1 (F = Fibonacci; about 1.618^n)' }),
    run(n): Measured {
      const m = measure((t) => exponentialTimeExample(n, t));
      const detail =
        n <= 1
          ? `n = ${n} <= 1 is a base case: 1 call, returning ${m.value}.`
          : `the call on ${n} calls itself on ${n - 1} and ${n - 2}, and so on down to n <= 1: calls(n) = calls(n - 1) + calls(n - 2) + 1 = ${plural(m.ops, 'call')}.`;
      return { ops: m.ops, result: m.value, detail };
    },
  },
  {
    key: 'factorial',
    aliases: ['factorial_time_example', 'permutations', 'perm'],
    python: 'factorial_time_example',
    counts: 'element writes',
    maxN: 8,
    capReason: 'factorial_time_example(8) already builds 8! = 40,320 permutations with 362,879 element writes, so n goes up to 8 here: the run stays quick and the chart drawable.',
    defaults: { g: 'n n!', c: [2], to: 8 },
    line: 8,
    growth: () => ({ rank: 9, form: '(n + 1)! - 1', limit: 1 }),
    run(n): Measured {
      const m = measure((t) => factorialTimeExample(n, t));
      const terms = Array.from({ length: n }, (_, k) => `${k + 1}*${factorial(k + 1)}`).join(' + ');
      return {
        ops: m.ops,
        result: [m.value.length, m.value.slice(0, 6)],
        shown: pyRepr(m.value, 3),
        detail: `level k of the recursion builds k! permutations of k elements each, so the writes add up to ${terms} = ${m.ops.toLocaleString('en-US')}: ${plural(m.value.length, 'permutation')} of ${n}.`,
      };
    },
  },
];
