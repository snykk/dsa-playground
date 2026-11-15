/** Visualization registry: Randomized algorithms (randomized quickselect, reservoir sampling). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const RA = 'Algorithms/Randomized_Algorithms';

export const entries: VizInfo[] = [
  {
    id: 'randomized-quickselect',
    title: 'Randomized Quickselect',
    group: 'Searching',
    blurb: 'A seeded random pivot, a three-way partition, and only the side that holds rank k survives.',
    topics: [`${RA}/Randomized_Quickselect`, RA],
  },
  {
    id: 'reservoir-sampling',
    title: 'Reservoir Sampling',
    group: 'Math',
    blurb: 'Item i draws j from 0..i-1 and takes slot j when j < k, so every item ends in the sample with chance k/n.',
    topics: [`${RA}/Reservoir_Sampling`, RA],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'randomized-quickselect': () => import('../specs/divideAndRandomized').then((m) => m.quickselectSpec),
  'reservoir-sampling': () => import('../specs/divideAndRandomized').then((m) => m.reservoirSpec),
};
