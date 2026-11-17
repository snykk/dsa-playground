/** Visualization registry: Advanced math (matrix exponentiation, the fast Fourier transform). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const M = 'Algorithms/Mathematical_Algorithms/Advanced_Math';

export const entries: VizInfo[] = [
  {
    id: 'matrix-power',
    title: 'Matrix power (iterative)',
    group: 'Math',
    blurb: 'Read the exponent bit by bit: square the base every round and multiply it into the result when the bit is 1.',
    topics: [`${M}/Matrix_Exponentiation`, M],
  },
  {
    id: 'matrix-power-recursive',
    title: 'Matrix power (recursive)',
    group: 'Math',
    blurb: 'A^k = (A^(k/2))^2 for even k and A x A^(k-1) for odd k: calls halve k on the way down, products come back up. Fibonacci too.',
    topics: [`${M}/Matrix_Exponentiation`, M],
  },
  {
    id: 'fft',
    title: 'Fast Fourier Transform',
    group: 'Math',
    blurb: 'Split into even and odd positions down to single values, then butterflies combine the halves with the roots of unity.',
    topics: [`${M}/Fast_Fourier_Transform`, M],
  },
  {
    id: 'fft-polynomial-multiplication',
    title: 'Polynomial multiplication (FFT)',
    group: 'Math',
    blurb: 'Transform both coefficient lists, multiply point by point, transform back and round: a product in O(n log n).',
    topics: [`${M}/Fast_Fourier_Transform`, M],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'matrix-power': () => import('../specs/advancedMath').then((m) => m.matrixPowerSpec),
  'matrix-power-recursive': () => import('../specs/advancedMath').then((m) => m.matrixPowerRecursiveSpec),
  fft: () => import('../specs/advancedMath').then((m) => m.fftSpec),
  'fft-polynomial-multiplication': () => import('../specs/advancedMath').then((m) => m.fftMultiplySpec),
};
