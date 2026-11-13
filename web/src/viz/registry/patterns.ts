/** Visualization registry: Problem patterns. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    group: 'Problem Patterns',
    blurb: 'On a sorted array, move the pointer whose value cannot be part of any pair: pair sum in one pass.',
    topics: ['Problem_Patterns/Two_Pointers'],
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    group: 'Problem Patterns',
    blurb: 'Expand on the right, shrink on the left whenever the constraint breaks: the longest valid stretch in O(n).',
    topics: ['Problem_Patterns/Sliding_Window'],
  },
  {
    id: 'prefix-sum',
    title: 'Prefix Sum',
    group: 'Problem Patterns',
    blurb: 'Precompute running totals once, then any range sum is one subtraction: P[r + 1] - P[l].',
    topics: ['Problem_Patterns/Prefix_Sum_Difference_Array'],
  },
  {
    id: 'difference-array',
    title: 'Difference Array',
    group: 'Problem Patterns',
    blurb: 'Record each range update as two writes at its ends, then one sweep of running sums applies them all.',
    topics: ['Problem_Patterns/Prefix_Sum_Difference_Array'],
  },
  {
    id: 'monotonic-stack',
    title: 'Monotonic Stack',
    group: 'Problem Patterns',
    blurb: 'Keep indices waiting for a bigger value; a bigger arrival pops and answers them: next greater element in O(n).',
    topics: ['Problem_Patterns/Monotonic_Stack'],
  },
  {
    id: 'monotonic-queue',
    title: 'Monotonic Queue',
    group: 'Problem Patterns',
    blurb: 'A deque of indices with decreasing values keeps the window maximum at its front: sliding window maximum in O(n).',
    topics: ['Problem_Patterns/Monotonic_Queue'],
  },
  {
    id: 'binary-search-on-answer',
    title: 'Binary Search on Answer',
    group: 'Problem Patterns',
    blurb: 'When feasibility flips once as the answer grows, binary search the answer itself: least ship capacity within D days.',
    topics: ['Problem_Patterns/Binary_Search_on_Answer'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'two-pointers': () => import('../specs/patterns').then((m) => m.twoPointers),
  'sliding-window': () => import('../specs/patterns').then((m) => m.slidingWindow),
  'prefix-sum': () => import('../specs/patterns').then((m) => m.prefixSum),
  'difference-array': () => import('../specs/patterns').then((m) => m.differenceArray),
  'monotonic-stack': () => import('../specs/patterns').then((m) => m.monotonicStack),
  'monotonic-queue': () => import('../specs/patterns').then((m) => m.monotonicQueue),
  'binary-search-on-answer': () => import('../specs/patterns').then((m) => m.binarySearchOnAnswer),
};
