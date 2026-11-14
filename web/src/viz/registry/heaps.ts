/** Visualization registry: Heaps (min heap, max heap, Fibonacci heap). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const H = 'Data_Structures/Non_Linear/Heaps';

export const entries: VizInfo[] = [
  {
    id: 'min-heap',
    title: 'Min Heap',
    group: 'Heaps',
    blurb: 'A complete tree in a list: insert sifts up, extract_min sifts down, and the constructor heapifies bottom-up.',
    topics: [`${H}/Min_Heap`, H],
  },
  {
    id: 'max-heap',
    title: 'Max Heap',
    group: 'Heaps',
    blurb: 'The same list with the comparisons reversed: the largest value rises to the root.',
    topics: [`${H}/Max_Heap`, H],
  },
  {
    id: 'fibonacci-heap',
    title: 'Fibonacci Heap',
    group: 'Heaps',
    blurb: 'Insert splices a node into the root list; extract_min promotes the children and links trees of equal degree.',
    topics: [`${H}/Fibonacci_Heap`, H],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'min-heap': () => import('../specs/heaps').then((m) => m.minHeapSpec),
  'max-heap': () => import('../specs/heaps').then((m) => m.maxHeapSpec),
  'fibonacci-heap': () => import('../specs/heaps').then((m) => m.fibonacciHeapSpec),
};
