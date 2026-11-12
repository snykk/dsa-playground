/** Visualization registry: Sorting. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    group: 'Sorting',
    blurb: 'Adjacent swaps carry the largest remaining value to the end of every pass.',
    topics: ['Algorithms/Sorting/Bubble Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    group: 'Sorting',
    blurb: 'Each new value slides left until it meets a smaller one, growing a sorted prefix.',
    topics: ['Algorithms/Sorting/Insertion Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    group: 'Sorting',
    blurb: 'Scan for the minimum of the unsorted part and swap it into place.',
    topics: ['Algorithms/Sorting/Selection Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    group: 'Sorting',
    blurb: 'Split in half, sort each half, then merge two sorted runs by repeatedly taking the smaller head.',
    topics: ['Algorithms/Sorting/Merge Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    group: 'Sorting',
    blurb: 'Lomuto partition puts the pivot in its final place, then recurses on both sides.',
    topics: ['Algorithms/Sorting/Quick Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'heap-sort',
    title: 'Heap Sort',
    group: 'Sorting',
    blurb: 'Build a max-heap in place, then repeatedly move the root to the end and sift down.',
    topics: ['Algorithms/Sorting/Heap Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'counting-sort',
    title: 'Counting Sort',
    group: 'Sorting',
    blurb: 'Count every value, turn the counts into positions, then place values back to front: no comparisons.',
    topics: ['Algorithms/Sorting/Counting Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'radix-sort',
    title: 'Radix Sort (LSD)',
    group: 'Sorting',
    blurb: 'Sort by one decimal digit at a time, least significant first, dropping values into ten buckets each pass.',
    topics: ['Algorithms/Sorting/Radix Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'bucket-sort',
    title: 'Bucket Sort',
    group: 'Sorting',
    blurb: 'Scatter values in [0, 1] into equal-width buckets, insertion-sort each bucket, then concatenate.',
    topics: ['Algorithms/Sorting/Bucket Sort', 'Algorithms/Sorting'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'bubble-sort': () => import('../specs/sorting').then((m) => m.bubbleSort),
  'insertion-sort': () => import('../specs/sorting').then((m) => m.insertionSort),
  'selection-sort': () => import('../specs/sorting').then((m) => m.selectionSort),
  'merge-sort': () => import('../specs/sorting').then((m) => m.mergeSort),
  'quick-sort': () => import('../specs/sorting').then((m) => m.quickSort),
  'heap-sort': () => import('../specs/sorting').then((m) => m.heapSort),
  'counting-sort': () => import('../specs/sortingLinear').then((m) => m.countingSort),
  'radix-sort': () => import('../specs/sortingLinear').then((m) => m.radixSort),
  'bucket-sort': () => import('../specs/sortingLinear').then((m) => m.bucketSort),
};
