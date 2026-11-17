/** Visualization registry: Optimization techniques (precomputation, bitmasking, fast I/O, modular arithmetic tricks). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const OT = 'Utilities/Optimization_Techniques';
const GROUP = 'Competitive Programming';

export const entries: VizInfo[] = [
  {
    id: 'fast-io-lines',
    title: 'Fast I/O: line by line',
    group: GROUP,
    blurb: 'fast_int and fast_ints make one readline call per line and fast_print one write per answer: count the calls.',
    topics: [`${OT}/Fast_IO`, OT],
  },
  {
    id: 'fast-io-buffered',
    title: 'Fast I/O: BufferedInput and BufferedOutput',
    group: GROUP,
    blurb: 'One read() call cuts the whole input into tokens, the answers wait in a list, and one flush writes them all.',
    topics: [`${OT}/Fast_IO`, OT],
  },
  {
    id: 'fast-io-all-at-once',
    title: 'Fast I/O: all at once',
    group: GROUP,
    blurb: 'AllInputReader converts every token up front; next_n is a slice that never raises, even past the end.',
    topics: [`${OT}/Fast_IO`, OT],
  },
  {
    id: 'factorial-tables',
    title: 'Factorial tables (nCr by lookups)',
    group: GROUP,
    blurb: 'fact fills downwards, one Fermat inverse, inv_fact fills upwards; then every nCr is three lookups.',
    topics: [`${OT}/Precomputation`, `${OT}/Modular_Arithmetic_Tricks`, OT],
  },
  {
    id: 'spf-factorize',
    title: 'Smallest prime factors, then factorize',
    group: GROUP,
    blurb: 'A sieve stores the first prime that reaches each number; factorize then hops x -> x / spf[x] by lookups.',
    topics: [`${OT}/Precomputation`, OT],
  },
  {
    id: 'prefix-sum-2d',
    title: '2D prefix sums',
    group: GROUP,
    blurb: 'Each entry adds a cell to two overlapping blocks; any rectangle is four corners with + and - signs.',
    topics: [`${OT}/Precomputation`, OT],
  },
  {
    id: 'lca-binary-lifting',
    title: 'LCA by binary lifting',
    group: GROUP,
    blurb: 'A DFS gives every parent, each table column doubles the jump, and a query climbs by the bits of the depth difference.',
    topics: [`${OT}/Precomputation`, OT],
  },
  {
    id: 'submask-enumeration',
    title: "Submasks and Gosper's hack",
    group: GROUP,
    blurb: '(sub - 1) & mask walks every submask once; Gosper finds the next mask with the same number of bits.',
    topics: [`${OT}/Bitmasking`, OT],
  },
  {
    id: 'sos-dp',
    title: 'SOS DP (sum over subsets)',
    group: GROUP,
    blurb: 'One pass per bit over the lattice of masks sums every submask in n 2^n additions instead of 3^n.',
    topics: [`${OT}/Bitmasking`, OT],
  },
  {
    id: 'lucas-theorem',
    title: "Lucas' theorem",
    group: GROUP,
    blurb: 'n and r in base p, one recursive call per digit: C(n, r) mod p from a table of p entries, even for n = 10^18.',
    topics: [`${OT}/Modular_Arithmetic_Tricks`, OT],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'fast-io-lines': () => import('../specs/optimizationTechniques').then((m) => m.fastIoLinesSpec),
  'fast-io-buffered': () => import('../specs/optimizationTechniques').then((m) => m.fastIoBufferedSpec),
  'fast-io-all-at-once': () => import('../specs/optimizationTechniques').then((m) => m.fastIoAllSpec),
  'factorial-tables': () => import('../specs/optimizationTechniques').then((m) => m.factorialTablesSpec),
  'spf-factorize': () => import('../specs/optimizationTechniques').then((m) => m.spfSpec),
  'prefix-sum-2d': () => import('../specs/optimizationTechniques').then((m) => m.prefix2DSpec),
  'lca-binary-lifting': () => import('../specs/optimizationTechniques').then((m) => m.lcaSpec),
  'submask-enumeration': () => import('../specs/optimizationTechniques').then((m) => m.maskSpec),
  'sos-dp': () => import('../specs/optimizationTechniques').then((m) => m.sosSpec),
  'lucas-theorem': () => import('../specs/optimizationTechniques').then((m) => m.lucasSpec),
};
