/** Visualization registry: Searching. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'linear-search',
    title: 'Linear Search',
    group: 'Searching',
    blurb: 'Compare every value from the left until one matches: the only option when the data has no order.',
    topics: ['Algorithms/Searching/Linear Search'],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    group: 'Searching',
    blurb: 'Probe the middle of a sorted range and drop the half that cannot hold the target, until one value is left.',
    topics: ['Algorithms/Searching/Binary Search', 'Algorithms/Searching'],
  },
  {
    id: 'ternary-search',
    title: 'Ternary Search',
    group: 'Searching',
    blurb: 'Two probes split the sorted range into thirds and keep one; it needs more probes than binary search.',
    topics: ['Algorithms/Searching/Ternary Search'],
  },
  {
    id: 'interpolation-search',
    title: 'Interpolation Search',
    group: 'Searching',
    blurb: 'Guess the position from the value along the line between the range ends: one probe on evenly spread data.',
    topics: ['Algorithms/Searching/Interpolation Search'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'linear-search': () => import('../specs/searching').then((m) => m.linearSearch),
  'binary-search': () => import('../specs/searching').then((m) => m.binarySearch),
  'ternary-search': () => import('../specs/searching').then((m) => m.ternarySearch),
  'interpolation-search': () => import('../specs/searching').then((m) => m.interpolationSearch),
};
