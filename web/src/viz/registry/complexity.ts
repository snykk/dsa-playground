/** Visualization registry: Complexity analysis (Big-O, Big-Omega, Big-Theta, space, amortized analysis). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const CA = 'Complexity_Analysis';
const T = `${CA}/Time_Complexity`;

export const entries: VizInfo[] = [
  {
    id: 'big-o-growth',
    title: 'Big-O: f(n) under c * g(n)',
    group: 'Complexity',
    blurb: 'Count the steps of each example for n = 1, 2, 3... on a log scale, and watch them stay under c * g(n) from n0 on, or break through it.',
    topics: [`${T}/Big_O_Notation`, T, CA],
  },
  {
    id: 'big-omega-growth',
    title: 'Big-Omega: f(n) over c * g(n)',
    group: 'Complexity',
    blurb: 'The best-case inputs of linear search, bubble sort and quick sort against a lower bound: equal keys keep quick sort at 3n, below n log n.',
    topics: [`${T}/Big_Omega`, T],
  },
  {
    id: 'big-theta-growth',
    title: 'Big-Theta: f(n) inside the band',
    group: 'Complexity',
    blurb: 'Merge sort, binary search and the naive matrix product between c1 * g(n) and c2 * g(n), one case at a time.',
    topics: [`${T}/Big_Theta`, T],
  },
  {
    id: 'space-call-stack',
    title: 'Call stack: Fibonacci and halving',
    group: 'Complexity',
    blurb: 'Frames push and pop as naive Fibonacci recurses: exponentially many calls, but never more than n frames at once.',
    topics: [`${CA}/Space_Complexity`, CA],
  },
  {
    id: 'space-merge-sort',
    title: 'Merge sort: buffers',
    group: 'Complexity',
    blurb: 'Slices, halves and merge buffers appear and are freed call by call; the peak stays near 2n cells while O(n log n) are allocated.',
    topics: [`${CA}/Space_Complexity`, CA],
  },
  {
    id: 'space-loops',
    title: 'Loops: constant to quadratic, and in place',
    group: 'Complexity',
    blurb: 'A running total, a list, a matrix and an in-place reverse: the memory of each loop next to its frame.',
    topics: [`${CA}/Space_Complexity`],
  },
  {
    id: 'amortized-aggregate',
    title: 'Aggregate method',
    group: 'Complexity',
    blurb: 'Appends to a doubling array: each resize is a spike, but the running total of writes and copies stays under 3n.',
    topics: [`${CA}/Amortized_Analysis`],
  },
  {
    id: 'amortized-accounting',
    title: 'Accounting method',
    group: 'Complexity',
    blurb: 'Every append pays 3 coins; the spare coins wait on the cells and pay for the copies of the next resize, and the bank never goes negative.',
    topics: [`${CA}/Amortized_Analysis`, CA],
  },
  {
    id: 'amortized-potential',
    title: 'Potential method',
    group: 'Complexity',
    blurb: 'The potential 2 * size - capacity rises by 2 per append and falls at a resize, so every amortized cost comes out at 3.',
    topics: [`${CA}/Amortized_Analysis`],
  },
  {
    id: 'binary-counter',
    title: 'Binary counter',
    group: 'Complexity',
    blurb: 'Trailing ones flip to zero, one zero flips to one: a single increment can flip every bit, yet n increments flip fewer than 2n.',
    topics: [`${CA}/Amortized_Analysis`],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'big-o-growth': () => import('../specs/complexity').then((m) => m.bigOGrowthSpec),
  'big-omega-growth': () => import('../specs/complexity').then((m) => m.bigOmegaGrowthSpec),
  'big-theta-growth': () => import('../specs/complexity').then((m) => m.bigThetaGrowthSpec),
  'space-call-stack': () => import('../specs/complexity').then((m) => m.spaceCallStackSpec),
  'space-merge-sort': () => import('../specs/complexity').then((m) => m.spaceMergeSortSpec),
  'space-loops': () => import('../specs/complexity').then((m) => m.spaceLoopsSpec),
  'amortized-aggregate': () => import('../specs/complexity').then((m) => m.amortizedAggregateSpec),
  'amortized-accounting': () => import('../specs/complexity').then((m) => m.amortizedAccountingSpec),
  'amortized-potential': () => import('../specs/complexity').then((m) => m.amortizedPotentialSpec),
  'binary-counter': () => import('../specs/complexity').then((m) => m.binaryCounterSpec),
};
