/** Visualization registry: Advanced math (matrix exponentiation, the fast Fourier transform, the number theoretic transform, combinatorics). */
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
  {
    id: 'ntt',
    title: 'Number Theoretic Transform',
    group: 'Math',
    blurb: 'The FFT modulo 998244353: reorder by bit reversal, then stages of butterflies with powers of 3 as the roots of unity, all exact.',
    topics: [`${M}/Number_Theoretic_Transform`],
  },
  {
    id: 'ntt-polynomial-multiplication',
    title: 'Polynomial multiplication (NTT)',
    group: 'Math',
    blurb: 'Two transforms modulo 998244353, a pointwise product and the inverse: the coefficients modulo the prime, with no rounding.',
    topics: [`${M}/Number_Theoretic_Transform`, M],
  },
  {
    id: 'binomial-coefficients',
    title: "Pascal's triangle and C(n, k) mod p",
    group: 'Math',
    blurb: 'Each cell is the sum of the two above it; then fact and inv_fact modulo a prime, from one inverse, answer C(n, k) mod p in O(1).',
    topics: [`${M}/Combinatorics`, M],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'matrix-power': () => import('../specs/advancedMath').then((m) => m.matrixPowerSpec),
  'matrix-power-recursive': () => import('../specs/advancedMath').then((m) => m.matrixPowerRecursiveSpec),
  fft: () => import('../specs/advancedMath').then((m) => m.fftSpec),
  'fft-polynomial-multiplication': () => import('../specs/advancedMath').then((m) => m.fftMultiplySpec),
  ntt: () => import('../specs/advancedMath').then((m) => m.nttSpec),
  'ntt-polynomial-multiplication': () => import('../specs/advancedMath').then((m) => m.nttMultiplySpec),
  'binomial-coefficients': () => import('../specs/advancedMath').then((m) => m.binomialSpec),
};
