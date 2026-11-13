/** Visualization registry: Coding theory. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'reed-solomon',
    title: 'Reed-Solomon Decoding',
    group: 'Coding Theory',
    blurb: 'Encode, corrupt, then watch syndromes, Berlekamp-Massey, Chien search and Forney repair the bytes.',
    topics: ['Algorithms/Coding_Theory/Reed_Solomon', 'Algorithms/Coding_Theory'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'reed-solomon': () => import('../specs/codingTheory').then((m) => m.reedSolomon),
};
