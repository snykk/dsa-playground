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
  {
    id: 'galois-field',
    title: 'Galois Field GF(2^8)',
    group: 'Coding Theory',
    blurb: 'Bytes as bit rows: add is XOR, multiply shifts and reduces by 0x11B, and the log / exp tables turn it into walks around a ring.',
    topics: ['Algorithms/Coding_Theory/Galois_Field', 'Algorithms/Coding_Theory'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'reed-solomon': () => import('../specs/codingTheory').then((m) => m.reedSolomon),
  'galois-field': () => import('../specs/galoisField').then((m) => m.galoisField),
};
