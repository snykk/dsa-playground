import { EUCLID_CODE, euclidTrace, parseEuclid, type EuclidInput, type EuclidKind, type EuclidState } from '../algorithms/euclideanAlgorithm';
import { MOD_CODE, modTrace, parseModular, type ClockState, type ModInput } from '../algorithms/modularArithmetic';
import { parsePow, POW_CODE, POW_REC_CODE, powRecTrace, powTrace, type PowInput, type PowState } from '../algorithms/modularExponentiation';
import { MR_CODE, MR_DET_CODE, mrDetTrace, mrTrace, parseMillerRabin, type MrInput, type MrState } from '../algorithms/millerRabin';
import { CRT_CODE, crtTrace, parseCrt, type CrtInput, type CrtState } from '../algorithms/chineseRemainder';
import { parseSieve, SIEVE_CODE, sieveTrace, type SieveInput, type SieveState } from '../algorithms/sieveOfEratosthenes';
import {
  parseTotientFactor,
  parseTotientSieve,
  TOTIENT_FACTOR_CODE,
  TOTIENT_SIEVE_CODE,
  totientFactorTrace,
  totientSieveTrace,
  type TotientFactorInput,
  type TotientFactorState,
  type TotientSieveInput,
  type TotientSieveState,
} from '../algorithms/eulersTotient';
import type { VizSpec } from '../core/types';
import { CongruenceCombs, stabilizeCombs } from '../renderers/CongruenceCombs';
import { EuclidTiling, stabilizeEuclid } from '../renderers/EuclidTiling';
import { PowerLadder, stabilizePower } from '../renderers/PowerLadder';
import { ResidueClock, stabilizeClock } from '../renderers/ResidueClock';
import { SieveGrid, stabilizeSieve } from '../renderers/SieveGrid';
import { TotientFactorView, TotientSieveGrid } from '../renderers/TotientView';
import { stabilizeWitness, WitnessChains } from '../renderers/WitnessChains';
import { SYM } from '../ui/symbols';

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/* ---------- Euclidean algorithm ---------- */

function randomEuclid(): string {
  const kinds: EuclidKind[] = ['extended_gcd', 'gcd', 'gcd_iterative', 'lcm'];
  const calls: string[] = [];
  for (let i = 0; i < rint(1, 2); i++) {
    const g = rint(1, 12);
    const a = g * rint(1, 40) * (Math.random() < 0.15 ? -1 : 1);
    const b = g * rint(1, 40);
    calls.push(`${pick(kinds)} ${a} ${b}`);
  }
  return calls.join(', ');
}

export const euclideanAlgorithmSpec: VizSpec<EuclidInput, EuclidState> = {
  id: 'euclidean-algorithm',
  title: 'Euclidean Algorithm',
  inputKind: 'euclid',
  inputLabel: 'Calls',
  inputHelp:
    'Calls separated by commas: "ext 240 46" (extended_gcd), "gcd 48 18" (the recursive gcd), "gcd_iterative 48 18" (or gcdi) and "lcm 4 6". ' +
    'Integers from -9999 to 9999, up to 8 calls. The rectangle is |a| wide and |b| tall; the view zooms into the strip that is left.',
  examples: [
    { label: 'Extended: 240 and 46', value: 'ext 240 46' },
    { label: 'Classic gcd(48, 18)', value: 'gcd 48 18, gcd_iterative 48 18, lcm 48 18' },
    { label: 'Negative input', value: 'ext -240 46, ext 240 -46' },
    { label: 'Zeros', value: 'gcd 0 5, gcd 5 0, ext 0 0, lcm 0 7' },
    { label: 'Worst case: Fibonacci', value: 'ext 89 55' },
  ],
  randomInput: randomEuclid,
  parse: parseEuclid,
  trace: (input) => stabilizeEuclid(euclidTrace(input).frames),
  render: (state) => <EuclidTiling state={state} />,
  pseudocode: EUCLID_CODE,
  legend: [
    { role: 'active', label: 'squares cut in this step; the row being computed' },
    { role: 'compare', label: 'the strip left over, or the rectangle whose x, y are being found' },
    { role: 'done', label: `squares of side gcd; rows that have returned` },
    { role: 'idle', label: 'squares cut in earlier steps' },
  ],
  complexity: { time: 'O(log min(a, b)) steps', space: 'O(log min(a, b)) recursive, O(1) iterative' },
};

/* ---------- Modular arithmetic ---------- */

function randomModular(): string {
  const m = pick([7, 9, 10, 11, 12, 13, 15, 16]);
  const v = () => (Math.random() < 0.25 ? -rint(1, 2 * m) : rint(0, 3 * m));
  const ops = [`add ${v()} ${v()}`, `mul ${v()} ${v()}`, pick([`inv ${rint(1, m - 1)}`, `div ${v()} ${rint(1, m - 1)}`, `pow ${rint(2, m - 1)} ${rint(-3, 20)}`, `sub ${v()} ${v()}`])];
  return `m ${m}; ${ops.join(', ')}`;
}

export const modularArithmeticSpec: VizSpec<ModInput, ClockState> = {
  id: 'modular-arithmetic',
  title: 'Modular Arithmetic',
  inputKind: 'mod-clock',
  inputLabel: 'Modulus and operations',
  inputHelp:
    'Start with the modulus ("m 11", 1 to 60; 11 if you leave it out), then operations separated by commas: "add 7 5", "sub 3 5", "mul 7 5", "div 7 5", "inv 3", "pow 2 5" ' +
    '(the functions mod_add, mod_subtract, mod_multiply, mod_divide, mod_inverse and mod_power). Operands and exponents from -9999 to 9999, up to 10 operations.',
  examples: [
    { label: 'Modulo 11 (the demo)', value: 'm 11; add 7 5, sub 3 5, mul 7 5, inv 3, div 7 5, pow 2 5' },
    { label: 'No inverse modulo 12', value: 'm 12; inv 4, inv 5, div 4 8, pow 2 -1' },
    { label: 'Negative operands', value: 'm 11; add -3 1, mul -3 4, inv -3, pow -2 3' },
    { label: 'Wrapping products', value: 'm 7; mul 25 6, pow 3 6, pow 2 -3' },
    { label: 'Modulus 1', value: 'm 1; add 5 7, inv 3, pow 2 10' },
  ],
  randomInput: randomModular,
  parse: parseModular,
  trace: (input) => stabilizeClock(modTrace(input).frames),
  render: (state) => <ResidueClock state={state} />,
  pseudocode: MOD_CODE,
  legend: [
    { role: 'compare', label: 'operands and the walk that reduces them; multiples of the gcd' },
    { role: 'active', label: 'the walk being made; the result so far' },
    { role: 'good', label: `the returned residue (${SYM.check})` },
    { role: 'bad', label: `no inverse: 1 cannot be reached (${SYM.cross})` },
    { role: 'done', label: 'extended Euclid rows filled by back-substitution' },
  ],
  complexity: { time: 'O(1) add, subtract, multiply; O(log m) inverse and divide; O(log e) power', space: 'O(1); O(log m) for the recursive extended gcd' },
};

/* ---------- Modular exponentiation ---------- */

function randomPow(): string {
  const m = pick([11, 13, 97, 1000, 1000000007, 998244353]);
  const calls = [`${rint(2, 30)}^${rint(5, 200)} mod ${m}`];
  if (Math.random() < 0.5) calls.push(`${rint(2, 9)}^${-rint(1, 9)} mod ${pick([11, 12, 13, 15])}`);
  return calls.join(', ');
}

const POW_HELP =
  'Calls separated by commas: "5^13 mod 11", "pow(5, 13, 11)" or "5 13 11". The modulus is positive and the base has up to 19 digits; the exponent goes ' +
  'from -1048575 to 1048575 (20 bits), and a negative one asks for the inverse first. Up to 4 calls. Values are exact big integers, as in Python.';

const POW_EXAMPLES = [
  { label: 'Worked example 5^13 mod 11', value: '5^13 mod 11' },
  { label: 'Negative exponent', value: '2^-3 mod 11, 2^-1 mod 12' },
  { label: 'Huge modulus', value: '3^1000000 mod 1000000000000000003' },
  { label: 'Edge cases', value: '0^0 mod 7, 5^10 mod 1, -2^3 mod 5' },
  { label: 'Fermat inverse', value: '3^9 mod 11, 2^1000 mod 1000' },
];

export const modularExponentiationSpec: VizSpec<PowInput, PowState> = {
  id: 'modular-exponentiation',
  title: 'Modular Exponentiation (loop)',
  inputKind: 'modpow',
  inputLabel: 'Calls',
  inputHelp: POW_HELP,
  examples: POW_EXAMPLES,
  randomInput: randomPow,
  parse: parsePow,
  trace: (input) => stabilizePower(powTrace(input).frames),
  render: (state) => <PowerLadder state={state} />,
  pseudocode: POW_CODE,
  legend: [
    { role: 'active', label: 'the lowest bit is 1: multiply; a value just computed' },
    { role: 'compare', label: 'the lowest bit is 0, or the factor being used' },
    { role: 'done', label: 'bits used so far; their powers' },
    { role: 'muted', label: 'bits shifted out; the last square, never used' },
  ],
  complexity: { time: 'O(log e) multiplications: one squaring per bit, one product per 1 bit', space: 'O(1)' },
};

export const modularExponentiationRecursiveSpec: VizSpec<PowInput, PowState> = {
  id: 'modular-exponentiation-recursive',
  title: 'Recursive mod_pow',
  inputKind: 'modpow',
  inputLabel: 'Calls',
  inputHelp: POW_HELP,
  examples: POW_EXAMPLES,
  randomInput: randomPow,
  parse: parsePow,
  trace: (input) => stabilizePower(powRecTrace(input).frames),
  render: (state) => <PowerLadder state={state} />,
  pseudocode: POW_REC_CODE,
  legend: [
    { role: 'active', label: 'the open call; an odd exponent, which peels one factor' },
    { role: 'compare', label: 'an even exponent, which halves; the value a call returned' },
    { role: 'done', label: 'calls that have returned' },
    { role: 'good', label: 'the answer' },
  ],
  complexity: { time: 'O(log e): at most two calls per bit', space: 'O(log e) call stack' },
};

/* ---------- Miller-Rabin ---------- */

function randomMillerRabin(): string {
  const odd = () => 2 * rint(50, 5000) + 1;
  const nums = [pick([561, 1105, 1729, 2465, 2821, 6601, 8911, 2047, 97, 7919, 104729]), odd()];
  return `${nums.join(', ')}; k ${rint(2, 6)}; seed ${rint(0, 99)}`;
}

const MR_HELP =
  'Numbers to test, separated by commas (up to 4, each at most 24 digits), then optionally "k 5" (random witnesses, 1 to 16; 5 is the Python default) ' +
  'and "seed 1" (random.seed before the calls; one generator serves the whole run). The deterministic tab ignores k and the seed.';

const MR_EXAMPLES = [
  { label: 'Carmichael 561, prime 97', value: '561, 97; k 3; seed 1' },
  { label: 'Strong liar: 2047', value: '2047; k 4; seed 3' },
  { label: 'Fools eleven bases', value: '3825123056546413051; k 3; seed 2' },
  { label: 'Edge cases below 5', value: '0, 1, 2, 4; k 5; seed 1' },
  { label: 'Beyond the 12-base bound', value: '318665857834031151167461; k 4; seed 5' },
];

const MR_LEGEND = [
  { role: 'active' as const, label: 'the value just computed; d while it halves' },
  { role: 'good' as const, label: `x is 1 at the start or reaches n - 1: the witness passes (${SYM.check})` },
  { role: 'bad' as const, label: `a square root of 1 that is not 1 or n - 1; a witness proves n composite (${SYM.cross})` },
  { role: 'done' as const, label: 'factors of 2 pulled out of n - 1; bases that passed' },
];

export const millerRabinSpec: VizSpec<MrInput, MrState> = {
  id: 'miller-rabin',
  title: 'Miller-Rabin (random witnesses)',
  inputKind: 'miller-rabin',
  inputLabel: 'Numbers, k and seed',
  inputHelp: MR_HELP,
  examples: MR_EXAMPLES,
  randomInput: randomMillerRabin,
  parse: (text) => parseMillerRabin(text, 'random'),
  trace: (input) => stabilizeWitness(mrTrace(input).frames),
  render: (state) => <WitnessChains state={state} />,
  pseudocode: MR_CODE,
  legend: MR_LEGEND,
  complexity: { time: 'O(k log n) modular multiplications', space: 'O(1)' },
};

export const millerRabinDeterministicSpec: VizSpec<MrInput, MrState> = {
  id: 'miller-rabin-deterministic',
  title: 'Miller-Rabin (12 fixed bases)',
  inputKind: 'miller-rabin',
  inputLabel: 'Numbers',
  inputHelp: MR_HELP,
  examples: MR_EXAMPLES,
  randomInput: randomMillerRabin,
  parse: (text) => parseMillerRabin(text, 'deterministic'),
  trace: (input) => stabilizeWitness(mrDetTrace(input).frames),
  render: (state) => <WitnessChains state={state} />,
  pseudocode: MR_DET_CODE,
  legend: [...MR_LEGEND, { role: 'compare', label: 'True for n past 318665857834031151167461: no longer a proof' }],
  complexity: { time: 'O(log n) modular multiplications (12 bases)', space: 'O(1)' },
};

/* ---------- Chinese remainder theorem ---------- */

function randomCrt(): string {
  const moduli = [pick([3, 4, 5]), pick([5, 6, 7]), pick([7, 8, 9, 11])].slice(0, rint(2, 3));
  return moduli.map((m) => `${rint(0, m - 1) + (Math.random() < 0.15 ? -m : 0)} mod ${m}`).join(', ');
}

export const chineseRemainderSpec: VizSpec<CrtInput, CrtState> = {
  id: 'chinese-remainder-theorem',
  title: 'Chinese Remainder Theorem',
  inputKind: 'crt',
  inputLabel: 'Congruences',
  inputHelp:
    'Congruences separated by commas, "2 mod 3, 3 mod 5, 2 mod 7" (or "x = 2 (mod 3)"), or the two lists of chinese_remainder_theorem: "r 2 3 2; m 3 5 7". ' +
    'Up to 6 congruences, values from -10^12 to 10^12; the lists may differ in length, as in Python. The number line shows two periods of the combined modulus, at most 120 values.',
  examples: [
    { label: 'Classic: 2, 3, 2 mod 3, 5, 7', value: '2 mod 3, 3 mod 5, 2 mod 7' },
    { label: 'Not coprime, solvable', value: '1 mod 4, 3 mod 6' },
    { label: 'Not coprime, no solution', value: '1 mod 4, 2 mod 6' },
    { label: 'Negative remainder', value: '-1 mod 3, 2 mod 5' },
    { label: 'Bad input: lists, modulus 0', value: 'r 1 2; m 3 0' },
  ],
  randomInput: randomCrt,
  parse: parseCrt,
  trace: (input) => stabilizeCombs(crtTrace(input).frames),
  render: (state) => <CongruenceCombs state={state} />,
  pseudocode: CRT_CODE,
  legend: [
    { role: 'active', label: 'the congruence being merged' },
    { role: 'compare', label: 'candidates x + lcm*t on the merged comb' },
    { role: 'good', label: `the points every merged comb shares (${SYM.check})` },
    { role: 'bad', label: `no point is on both combs: no solution (${SYM.cross})` },
    { role: 'done', label: 'congruences merged so far' },
  ],
  complexity: { time: 'O(n log max m): one extended Euclid per congruence', space: 'O(1) besides the input' },
};

/* ---------- Sieve of Eratosthenes ---------- */

function randomSieve(): string {
  const n = pick([30, 50, 60, 100, 120]);
  return `n ${n}; is ${rint(2, n)}, is ${rint(n + 1, n + 9)}, is ${-rint(1, 9)}`;
}

export const sieveSpec: VizSpec<SieveInput, SieveState> = {
  id: 'sieve-of-eratosthenes',
  title: 'Sieve of Eratosthenes',
  inputKind: 'sieve',
  inputLabel: 'Limit and lookups',
  inputHelp:
    'The limit n ("n 50", from -99 to 300; the grid shows 0 to n), then lookups with is_prime_sieve: "is 17, is -1, is 51" (up to 8, from -999 to 999). ' +
    'Long runs of multiples are struck a few per step.',
  examples: [
    { label: 'Primes up to 50, with lookups', value: 'n 50; is 17, is 49, is -1, is 51' },
    { label: 'Up to 100: 104 writes', value: 'n 100' },
    { label: 'Small: up to 30', value: 'n 30; is 29, is 0' },
    { label: 'n below 2', value: 'n 1; is 1, is 0, is -1' },
    { label: 'Largest: up to 300', value: 'n 300; is 293, is 289' },
  ],
  randomInput: randomSieve,
  parse: parseSieve,
  trace: (input) => stabilizeSieve(sieveTrace(input).frames),
  render: (state) => <SieveGrid state={state} />,
  pseudocode: SIEVE_CODE,
  legend: [
    { role: 'active', label: 'struck in this step (the corner names the prime)' },
    { role: 'compare', label: 'i being checked; a number struck again; where i * i passes n' },
    { role: 'done', label: 'primes' },
    { role: 'good', label: `lookup: True (${SYM.check})` },
    { role: 'bad', label: `lookup: False (${SYM.cross})` },
  ],
  complexity: { time: 'O(n log log n) to sieve, O(1) per lookup', space: 'O(n) flags' },
};

/* ---------- Euler's totient ---------- */

export const totientSieveSpec: VizSpec<TotientSieveInput, TotientSieveState> = {
  id: 'eulers-totient-sieve',
  title: 'Linear sieve: phi of every number',
  inputKind: 'totient-sieve',
  inputLabel: 'Limit',
  inputHelp:
    'The limit n ("n 30", from 0 to 100; the grid shows 0 to n). Each composite is crossed out once, as i ' + SYM.times + ' p with p its smallest prime factor, ' +
    'and phi fills in as it goes. From i = n/2 + 1 on nothing is crossed out any more, so those numbers are checked in one step.',
  examples: [
    { label: 'Up to 30: 19 crossings', value: 'n 30' },
    { label: 'Small: up to 12', value: 'n 12' },
    { label: 'Powers of 2 up to 64', value: 'n 64' },
    { label: 'Up to 100: 74 crossings', value: 'n 100' },
    { label: 'n below 4: nothing to cross', value: 'n 3' },
  ],
  randomInput: () => `n ${pick([20, 30, 40, 50, 60, 80, 100])}`,
  parse: parseTotientSieve,
  trace: (input) => totientSieveTrace(input).frames,
  render: (state) => <TotientSieveGrid state={state} />,
  pseudocode: TOTIENT_SIEVE_CODE,
  legend: [
    { role: 'active', label: 'i being checked; the number crossed out in this step' },
    { role: 'compare', label: 'i, the number doing the crossing out' },
    { role: 'done', label: 'primes, at the end' },
    { role: 'idle', label: 'shaded: crossed out earlier (the small text says by which i ' + SYM.times + ' p)' },
  ],
  complexity: { time: 'O(n): one crossing per composite', space: 'O(n): phi, spf and the primes' },
};

export const totientFactorSpec: VizSpec<TotientFactorInput, TotientFactorState> = {
  id: 'eulers-totient-factor',
  title: 'phi(n) by trial division',
  inputKind: 'totient-factor',
  inputLabel: 'n and inverses',
  inputHelp:
    'n ("phi 360", from 1 to 99999; 0 or a negative n shows the ValueError), then numbers to invert modulo n with Euler\'s theorem: "inverse 7, inverse 6" (up to 4, from -99999 to 99999). ' +
    'Candidates that divide nothing in a row are tried in one step.',
  examples: [
    { label: '360, with inverses', value: 'phi 360; inverse 7, inverse 6' },
    { label: 'A prime: every candidate fails', value: 'phi 97; inverse 3' },
    { label: 'A power of 2: one candidate', value: 'phi 65536; inverse 3' },
    { label: 'Six primes: 30030', value: 'phi 30030; inverse 17' },
    { label: 'n = 1: every inverse is 0', value: 'phi 1; inverse 5' },
    { label: 'phi(0) is undefined', value: 'phi 0' },
  ],
  randomInput: () => {
    const n = pick([rint(2, 99), rint(100, 9999), rint(10000, 99999), pick([360, 1001, 30030, 4096, 99991])]);
    return `phi ${n}; inverse ${rint(2, Math.max(2, n - 1))}`;
  },
  parse: parseTotientFactor,
  trace: (input) => totientFactorTrace(input).frames,
  render: (state) => <TotientFactorView state={state} />,
  pseudocode: TOTIENT_FACTOR_CODE,
  legend: [
    { role: 'active', label: 'a prime that divides n; the new rung of what is left' },
    { role: 'compare', label: 'candidates that divide nothing; the one that stops the loop' },
    { role: 'done', label: 'primes divided out earlier' },
    { role: 'good', label: `phi(n), the divisor-sum check and inverses (${SYM.check})` },
    { role: 'bad', label: `ValueError: n < 1, or no inverse (${SYM.cross})` },
  ],
  complexity: { time: 'O(sqrt n) candidates; O(log n) more for an inverse', space: 'O(log n) for the factors' },
};
