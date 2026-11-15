/** Visualization registry: Divide and conquer (Strassen's matrix multiplication). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const DC = 'Algorithms/Divide_and_Conquer';

export const entries: VizInfo[] = [
  {
    id: 'strassen',
    title: "Strassen's Matrix Multiplication",
    group: 'Math',
    blurb: 'Split into quadrants, form seven products of quadrant sums, and add them back into the four quadrants of C.',
    topics: [`${DC}/Strassens_Matrix_Multiplication`, DC],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  strassen: () => import('../specs/divideAndRandomized').then((m) => m.strassenSpec),
};
