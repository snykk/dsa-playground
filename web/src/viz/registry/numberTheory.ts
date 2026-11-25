/** Visualization registry: Number theory (Euclid, modular arithmetic and exponentiation, Miller-Rabin, the Chinese remainder theorem, the sieve, Euler's totient). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const NT = 'Algorithms/Mathematical_Algorithms/Number_Theory';

export const entries: VizInfo[] = [
  {
    id: 'euclidean-algorithm',
    title: 'Euclidean Algorithm',
    group: 'Math',
    blurb: 'Cut the largest squares that fit off an a x b rectangle until nothing is left; the extended form fills x and y back up the table.',
    topics: [`${NT}/Euclidean_Algorithm`, NT],
  },
  {
    id: 'modular-arithmetic',
    title: 'Modular Arithmetic',
    group: 'Math',
    blurb: 'Residues on a clock: sums and products wrap round it, negative numbers walk backwards, and an inverse exists only when the gcd is 1.',
    topics: [`${NT}/Modular_Arithmetic`, NT],
  },
  {
    id: 'modular-exponentiation',
    title: 'Modular Exponentiation (loop)',
    group: 'Math',
    blurb: 'The exponent\'s bits slide out one by one while the base squares and the result multiplies in the powers of the 1 bits.',
    topics: [`${NT}/Modular_Exponentiation`, NT],
  },
  {
    id: 'modular-exponentiation-recursive',
    title: 'Recursive mod_pow',
    group: 'Math',
    blurb: 'Halve an even exponent, peel a factor off an odd one: the call stack grows to the base case, then the answers square and multiply back up.',
    topics: [`${NT}/Modular_Exponentiation`, NT],
  },
  {
    id: 'miller-rabin',
    title: 'Miller-Rabin (random witnesses)',
    group: 'Math',
    blurb: 'n - 1 = d * 2^r, then each random witness squares a^d towards n - 1; one chain that misses it proves n composite.',
    topics: [`${NT}/Miller_Rabin_Primality_Test`, NT],
  },
  {
    id: 'miller-rabin-deterministic',
    title: 'Miller-Rabin (12 fixed bases)',
    group: 'Math',
    blurb: 'The bases 2 to 37 decide every n below 3.2e23 exactly: watch strong liars pass until one base catches the composite.',
    topics: [`${NT}/Miller_Rabin_Primality_Test`, NT],
  },
  {
    id: 'chinese-remainder-theorem',
    title: 'Chinese Remainder Theorem',
    group: 'Math',
    blurb: 'Each congruence is a comb of points on a number line; merging two keeps the points they share, found with one extended gcd.',
    topics: [`${NT}/Chinese_Remainder_Theorem`, NT],
  },
  {
    id: 'sieve-of-eratosthenes',
    title: 'Sieve of Eratosthenes',
    group: 'Math',
    blurb: 'Each prime strikes its multiples from its square on, until i * i passes n and every number still standing is prime.',
    topics: [`${NT}/Sieve_of_Eratosthenes`, NT],
  },
  {
    id: 'eulers-totient-sieve',
    title: 'Linear sieve (phi of every number)',
    group: 'Math',
    blurb: 'Each composite is crossed out once, by i times its smallest prime factor, and phi fills in from phi(i) as the grid goes.',
    topics: [`${NT}/Eulers_Totient`, NT],
  },
  {
    id: 'eulers-totient-factor',
    title: "Euler's totient by trial division",
    group: 'Math',
    blurb: 'Divide out each prime while p * p fits in what is left, then take 1/p off the result per prime; Euler\'s theorem turns phi into inverses.',
    topics: [`${NT}/Eulers_Totient`],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'euclidean-algorithm': () => import('../specs/numberTheory').then((m) => m.euclideanAlgorithmSpec),
  'modular-arithmetic': () => import('../specs/numberTheory').then((m) => m.modularArithmeticSpec),
  'modular-exponentiation': () => import('../specs/numberTheory').then((m) => m.modularExponentiationSpec),
  'modular-exponentiation-recursive': () => import('../specs/numberTheory').then((m) => m.modularExponentiationRecursiveSpec),
  'miller-rabin': () => import('../specs/numberTheory').then((m) => m.millerRabinSpec),
  'miller-rabin-deterministic': () => import('../specs/numberTheory').then((m) => m.millerRabinDeterministicSpec),
  'chinese-remainder-theorem': () => import('../specs/numberTheory').then((m) => m.chineseRemainderSpec),
  'sieve-of-eratosthenes': () => import('../specs/numberTheory').then((m) => m.sieveSpec),
  'eulers-totient-sieve': () => import('../specs/numberTheory').then((m) => m.totientSieveSpec),
  'eulers-totient-factor': () => import('../specs/numberTheory').then((m) => m.totientFactorSpec),
};
