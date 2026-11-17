import { maskTrace, MASK_CODE, parseMasks, parseSos, SOS_CODE, sosTrace, type MaskInput, type SosInput } from '../algorithms/bitmasking';
import { formatIo, IO_CODE, ioTrace, parseIo, stabilizeIo, type IoInput, type IoMode } from '../algorithms/fastIo';
import { LUCAS_CODE, lucasTrace, parseLucas, stabilizeLucas, type LucasInput } from '../algorithms/modularTricks';
import {
  FACT_CODE,
  factorialTrace,
  LCA_CODE,
  lcaTrace,
  parseFactorials,
  parseLca,
  parsePrefix2D,
  parseSpf,
  PREFIX2D_CODE,
  prefix2DTrace,
  SPF_CODE,
  spfTrace,
  type FactInput,
  type LcaInput,
  type Prefix2DInput,
  type SpfInput,
} from '../algorithms/precomputation';
import type { Example, VizSpec } from '../core/types';
import { FactorialTables, type FactorialTablesState } from '../renderers/FactorialTables';
import { IoStream, type IoStreamState } from '../renderers/IoStream';
import { LcaLifting, type LcaState } from '../renderers/LcaLifting';
import { LucasDigits, type LucasState } from '../renderers/LucasDigits';
import { MaskRows, type MaskRowsState } from '../renderers/MaskRows';
import { PrefixGrid2D, type Prefix2DState } from '../renderers/PrefixGrid2D';
import { SpfGrid, type SpfGridState } from '../renderers/SpfGrid';
import { SubsetLattice, type SubsetLatticeState } from '../renderers/SubsetLattice';
import { SYM } from '../ui/symbols';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

/* ---------- Fast I/O: three tabs on the same input ---------- */

const IO_EXAMPLES: Example[] = [
  { label: 'Two test cases', value: '2 / 3 / 1 2 3 / 2 / 10 20' },
  { label: 'Many small tests', value: '5 / 1 / 7 / 2 / 1 2 / 1 / 4 / 3 / 1 1 1 / 1 / 9' },
  { label: 'Numbers wrap to a new line', value: '1 / 4 / 1 2 / 3 4' },
  { label: 'Input ends early', value: '3 / 1 / 5' },
  { label: 'Empty input', value: 'empty' },
];

function randomIo(): string {
  const t = rint(1, 4);
  const lines = [String(t)];
  for (let r = 0; r < t; r++) {
    const n = rint(0, 3);
    lines.push(String(n), Array.from({ length: n }, () => String(rint(-20, 99))).join(' '));
  }
  if (Math.random() < 0.15) lines.pop();
  return formatIo(lines.map((l) => `${l}\n`).join(''));
}

const IO_HELP =
  'The input of a program that reads t test cases, each a count n followed by n numbers, and prints each sum. Type the lines separated by "/" ' +
  '(every line ends with a line break; "empty" is no input at all), for example "2 / 3 / 1 2 3 / 2 / 10 20". ' +
  'Up to 12 lines of 20 bytes and 30 tokens; tokens are numbers or words. The same input runs in every tab, so compare the call counts.';

const IO_META: Record<IoMode, { id: string; title: string }> = {
  lines: { id: 'fast-io-lines', title: 'Line by line (readline)' },
  buffered: { id: 'fast-io-buffered', title: 'BufferedInput + BufferedOutput' },
  all: { id: 'fast-io-all-at-once', title: 'All at once (AllInputReader)' },
};

function ioSpec(mode: IoMode): VizSpec<IoInput, IoStreamState> {
  return {
    ...IO_META[mode],
    inputKind: 'fast-io-stdin',
    inputLabel: 'Input lines (stdin)',
    inputHelp: IO_HELP,
    examples: IO_EXAMPLES,
    randomInput: randomIo,
    parse: parseIo,
    trace: (input) => stabilizeIo(ioTrace(mode, input).frames),
    render: (state) => <IoStream state={state} />,
    pseudocode: IO_CODE[mode],
    legend: [
      { role: 'compare', label: 'the window: bytes the last call returned; tokens cut but not read' },
      { role: 'active', label: 'value being read; the counter that just moved' },
      { role: 'done', label: 'token already read' },
      { role: 'muted', label: 'bytes the stream has moved past' },
      { role: 'bad', label: `end of input reached, or an exception (${SYM.cross})` },
    ],
    complexity:
      mode === 'lines'
        ? { time: 'O(size of the input); one readline per line, one write per answer', space: 'O(one line)' }
        : { time: 'O(size of the input); one read and one write in all', space: 'O(size of the input): it is all in memory' },
  };
}

export const fastIoLinesSpec = ioSpec('lines');
export const fastIoBufferedSpec = ioSpec('buffered');
export const fastIoAllSpec = ioSpec('all');

/* ---------- Precomputation ---------- */

export const factorialTablesSpec: VizSpec<FactInput, FactorialTablesState> = {
  id: 'factorial-tables',
  title: 'Factorial tables (nCr by lookups)',
  inputKind: 'factorials',
  inputLabel: 'Table size, modulus and queries',
  inputHelp:
    'Start with the table size ("n 10", 0 to 12), optionally a modulus ("mod 13", 2 to 2147483647; 10^9 + 7 if you leave it out), then queries separated by commas: "nCr 10 3", "nPr 10 3". ' +
    'Up to 8 queries with n and r from -99 to 99. A query past the table raises IndexError, as in Python.',
  examples: [
    { label: 'nCr in three lookups', value: 'n 10; nCr 10 3, nPr 10 3, nCr 7 7' },
    { label: 'Out of range: 0 and IndexError', value: 'n 6; nCr 5 7, nCr 5 -1, nCr 8 2' },
    { label: 'Table reaches the modulus', value: 'n 7; mod 5; nCr 4 2, nCr 7 3' },
    { label: 'Composite modulus', value: 'n 5; mod 12; nCr 5 2, nPr 4 2' },
    { label: 'Prime 13', value: 'n 12; mod 13; nCr 12 6, nPr 5 5' },
  ],
  randomInput: () => {
    const n = rint(3, 12);
    const mod = pick([1_000_000_007, 1_000_000_007, 13, 17, 998244353]);
    const qs = Array.from({ length: rint(2, 4) }, () => `${pick(['nCr', 'nCr', 'nPr'])} ${rint(0, n)} ${rint(0, n)}`);
    return `n ${n}${mod === 1_000_000_007 ? '' : `; mod ${mod}`}; ${qs.join(', ')}`;
  },
  parse: parseFactorials,
  trace: (input) => factorialTrace(input).frames,
  render: (state) => <FactorialTables state={state} />,
  pseudocode: FACT_CODE,
  legend: [
    { role: 'compare', label: 'entry read' },
    { role: 'active', label: 'entry being written' },
    { role: 'idle', label: 'dashed: still the 1 the list started with' },
    { role: 'good', label: `answer equals the exact value (${SYM.check})` },
    { role: 'bad', label: `0 that spreads, wrong answer or IndexError (${SYM.cross})` },
  ],
  complexity: { time: 'O(n) to build plus one O(log mod) power; O(1) per nCr or nPr', space: 'O(n)' },
};

export const spfSpec: VizSpec<SpfInput, SpfGridState> = {
  id: 'spf-factorize',
  title: 'Smallest prime factors, then factorize',
  inputKind: 'spf',
  inputLabel: 'Table size and numbers to factorize',
  inputHelp:
    'Start with the table size ("n 60", 0 to 99), then the numbers to factorize separated by commas: "factorize 60, 45, 49". ' +
    'Up to 6 numbers from -9 to 999; a number past the table raises IndexError, as in Python.',
  examples: [
    { label: 'Sieve to 60, then factorize', value: 'n 60; factorize 60, 45, 49' },
    { label: 'Up to 99', value: 'n 99; factorize 84, 97, 64' },
    { label: 'Past the table: IndexError', value: 'n 30; factorize 29, 97, 1, 0' },
    { label: 'Tiny table (n below 2)', value: 'n 1; factorize 1, 0' },
    { label: 'Powers hop by halves', value: 'n 64; factorize 64, 63' },
  ],
  randomInput: () => {
    const n = rint(20, 99);
    return `n ${n}; factorize ${Array.from({ length: rint(2, 3) }, () => rint(2, n)).join(', ')}`;
  },
  parse: parseSpf,
  trace: (input) => spfTrace(input).frames,
  render: (state) => <SpfGrid state={state} />,
  pseudocode: SPF_CODE,
  legend: [
    { role: 'compare', label: 'entry being checked; the number factorize looks up' },
    { role: 'active', label: 'spf just stored; where a hop lands' },
    { role: 'done', label: 'prime' },
    { role: 'muted', label: '0 and 1, a skipped i, earlier hops' },
    { role: 'good', label: `factorization multiplied back (${SYM.check})` },
    { role: 'bad', label: `IndexError (${SYM.cross})` },
  ],
  complexity: { time: 'O(n log log n) to build; O(log x) to factorize x', space: 'O(n)' },
};

export const prefix2DSpec: VizSpec<Prefix2DInput, Prefix2DState> = {
  id: 'prefix-sum-2d',
  title: '2D prefix sums',
  inputKind: 'prefix-2d',
  inputLabel: 'Grid and rectangle queries',
  inputHelp:
    'Start with the grid: rows separated by "/", numbers by spaces ("1 2 3 / 4 5 6"), up to 6 by 6, values from -99 to 99. ' +
    'Then queries separated by commas: "rect r1 c1 r2 c2" with (r1, c1) the top-left and (r2, c2) the bottom-right cell, corners included. Up to 6 queries; a corner past the grid raises IndexError.',
  examples: [
    { label: 'Rectangle by four corners', value: '1 2 3 / 4 5 6 / 7 8 9; rect 1 1 2 2, rect 0 1 1 2' },
    { label: 'Touching the edges', value: '1 2 3 / 4 5 6 / 7 8 9; rect 0 0 2 2, rect 2 0 2 0' },
    { label: 'Negative values', value: '-2 4 / 7 -5 / 0 3; rect 1 0 2 1, rect 0 0 2 1' },
    { label: 'Past the grid: IndexError', value: '5 1 / 2 8; rect 0 0 1 1, rect 1 1 2 2' },
    { label: 'A 4 x 5 grid', value: '3 0 1 4 2 / 5 6 3 2 1 / 1 2 0 1 5 / 4 1 0 1 7; rect 1 1 2 3, rect 0 2 3 4' },
  ],
  randomInput: () => {
    const n = rint(2, 5);
    const m = rint(2, 5);
    const grid = Array.from({ length: n }, () => Array.from({ length: m }, () => rint(-5, 9)).join(' ')).join(' / ');
    const qs = Array.from({ length: rint(1, 3) }, () => {
      const [r1, r2] = [rint(0, n - 1), rint(0, n - 1)].sort((a, b) => a - b);
      const [c1, c2] = [rint(0, m - 1), rint(0, m - 1)].sort((a, b) => a - b);
      return `rect ${r1} ${c1} ${r2} ${c2}`;
    });
    return `${grid}; ${qs.join(', ')}`;
  },
  parse: parsePrefix2D,
  trace: (input) => prefix2DTrace(input).frames,
  render: (state) => <PrefixGrid2D state={state} />,
  pseudocode: PREFIX2D_CODE,
  legend: [
    { role: 'compare', label: 'entries read; the block a P entry sums' },
    { role: 'active', label: 'entry being written; the queried rectangle' },
    { role: 'muted', label: 'dashed block: subtracted' },
    { role: 'done', label: 'dotted block: added back; cells of the answer' },
    { role: 'good', label: `answer equals the direct sum (${SYM.check})` },
    { role: 'bad', label: `IndexError (${SYM.cross})` },
  ],
  complexity: { time: 'O(n m) to build; O(1) per rectangle', space: 'O(n m)' },
};

export const lcaSpec: VizSpec<LcaInput, LcaState> = {
  id: 'lca-binary-lifting',
  title: 'LCA by binary lifting',
  inputKind: 'lca',
  inputLabel: 'Tree edges, root and queries',
  inputHelp:
    'Write the edges of a tree as "edges 0-1 0-2 1-3" (nodes 0 to n-1, up to 12; each node lists its neighbours in this order), optionally "root 2" (0 by default), ' +
    'then queries separated by commas: "lca 3 4". Up to 6 queries; a node past the tree raises IndexError, as in Python.',
  examples: [
    { label: 'Small tree', value: 'edges 0-1 0-2 1-3 1-4 2-5; lca 3 4, lca 3 5, lca 1 3' },
    { label: 'A path: long jumps', value: 'edges 0-1 1-2 2-3 3-4 4-5 5-6 6-7 7-8 8-9 9-10 10-11; lca 10 4, lca 11 0' },
    { label: 'Deeper branches', value: 'edges 0-1 0-2 1-3 1-4 3-5 3-6 2-7 7-8; lca 5 6, lca 6 4, lca 8 5' },
    { label: 'Another root', value: 'edges 4-0 4-7 0-1 7-2 2-3 3-5 3-6; root 4; lca 1 6, lca 5 6' },
    { label: 'Past the nodes: IndexError', value: 'edges 0-1 0-2; lca 1 2, lca 5 1' },
  ],
  randomInput: () => {
    const n = rint(5, 11);
    const edges = Array.from({ length: n - 1 }, (_, k) => `${rint(0, k)}-${k + 1}`);
    const qs = Array.from({ length: rint(2, 3) }, () => `lca ${rint(0, n - 1)} ${rint(0, n - 1)}`);
    return `edges ${edges.join(' ')}; ${qs.join(', ')}`;
  },
  parse: parseLca,
  trace: (input) => lcaTrace(input).frames,
  render: (state) => <LcaLifting state={state} />,
  pseudocode: LCA_CODE,
  legend: [
    { role: 'compare', label: 'node or entry read; the node v' },
    { role: 'active', label: 'entry written; the node u; the jump taken' },
    { role: 'muted', label: 'earlier jumps; an entry that stays -1' },
    { role: 'idle', label: 'dashed: not visited yet, or still the -1 it started with' },
    { role: 'good', label: `answer equals a walk up the parents (${SYM.check})` },
    { role: 'bad', label: `IndexError (${SYM.cross})` },
  ],
  complexity: { time: 'O(n log n) to build; O(log n) per query', space: 'O(n log n)' },
};

/* ---------- Bitmasking ---------- */

export const maskSpec: VizSpec<MaskInput, MaskRowsState> = {
  id: 'submask-enumeration',
  title: "Submasks and Gosper's hack",
  inputKind: 'masks',
  inputLabel: 'Enumeration',
  inputHelp:
    'Either "submasks 0b1011" for every submask of a mask (enumerate_subsets; up to 8 bits with at most 6 set), or "ksubsets 4 2" for every mask with k bits among n ' +
    "(subsets_of_size_k with Gosper's hack; n up to 8, k up to 9). A mask is decimal, or binary with 0b.",
  examples: [
    { label: 'Submasks of 1011', value: 'submasks 0b1011' },
    { label: '2 bits among 4', value: 'ksubsets 4 2' },
    { label: 'k = 0: only the empty mask', value: 'ksubsets 4 0' },
    { label: 'k > n: nothing', value: 'ksubsets 2 3' },
    { label: 'Mask with gaps', value: 'submasks 0b10110101' },
  ],
  randomInput: () => {
    if (Math.random() < 0.5) {
      let mask = 0;
      while (mask === 0 || mask.toString(2).replace(/0/g, '').length > 4) mask = rint(1, 255);
      return `submasks 0b${mask.toString(2)}`;
    }
    const n = rint(3, 6);
    return `ksubsets ${n} ${rint(1, n)}`;
  },
  parse: parseMasks,
  trace: (input) => maskTrace(input).frames,
  render: (state) => <MaskRows state={state} />,
  pseudocode: MASK_CODE,
  legend: [
    { role: 'active', label: 'bits that change in this step; the newest mask' },
    { role: 'done', label: 'mask yielded' },
    { role: 'muted', label: 'bit outside the mask; bits falling off a shift' },
    { role: 'bad', label: `bit cleared by & mask, or a bit past the n items (${SYM.cross})` },
    { role: 'good', label: `loop finished (${SYM.check})` },
  ],
  complexity: { time: 'O(2^k) for the submasks of a k-bit mask; O(C(n, k)) for Gosper', space: 'O(1)' },
};

export const sosSpec: VizSpec<SosInput, SubsetLatticeState> = {
  id: 'sos-dp',
  title: 'SOS DP (sum over subsets)',
  inputKind: 'sos',
  inputLabel: 'The list a',
  inputHelp:
    'Up to 16 numbers from -99 to 99 separated by spaces or commas ("1 2 3 4"); "[]" is the empty list. a[mask] is the value of the set mask. The length need not be a power of 2: the masks past the end are absent.',
  examples: [
    { label: 'Four values', value: '1 2 3 4' },
    { label: 'Length 6', value: '1 2 3 4 5 6' },
    { label: 'All ones count submasks', value: '1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1' },
    { label: 'Mixed signs', value: '5 0 -2 7 1 1 3' },
    { label: 'Empty list', value: '[]' },
  ],
  randomInput: () => Array.from({ length: pick([4, 6, 8, 8, 16]) }, () => rint(-3, 9)).join(' '),
  parse: parseSos,
  trace: (input) => sosTrace(input).frames,
  render: (state) => <SubsetLattice state={state} />,
  pseudocode: SOS_CODE,
  legend: [
    { role: 'compare', label: 'pairs of this pass (dashed); the mask read' },
    { role: 'active', label: 'the addition: the mask being updated' },
    { role: 'done', label: 'updated in this pass' },
    { role: 'muted', label: 'absent mask (past the end of a)' },
    { role: 'good', label: `equals the direct sum over submasks (${SYM.check})` },
  ],
  complexity: { time: 'O(n 2^n) instead of O(3^n) for a direct sum over submasks', space: 'O(2^n)' },
};

/* ---------- Modular arithmetic tricks ---------- */

export const lucasSpec: VizSpec<LucasInput, LucasState> = {
  id: 'lucas-theorem',
  title: "Lucas' theorem",
  inputKind: 'lucas',
  inputLabel: 'n, r and the prime p',
  inputHelp:
    'Write "C(100, 37) mod 37" (or "lucas 100 37 37"): n and r from -99 to 10^18, p a prime up to 37, with at most 18 digits of n in base p. ' +
    'lucas_nCr reads its small binomials from Factorials(p - 1, p); add "; table 36" or "; table 40 37" to pass Factorials(36) or Factorials(40, 37) instead and see it refused.',
  examples: [
    { label: 'C(100, 37) mod 37', value: 'C(100, 37) mod 37' },
    { label: 'A zero digit', value: 'C(1000, 500) mod 13' },
    { label: 'n = 10^18', value: 'C(1000000000000000000, 5) mod 13' },
    { label: 'C(36, 18) mod 37', value: 'C(36, 18) mod 37' },
    { label: 'Wrong table: ValueError', value: 'C(36, 18) mod 37; table 36' },
  ],
  randomInput: () => {
    const p = pick([5, 7, 11, 13, 17, 37]);
    const n = rint(p, p ** 3);
    return `C(${n}, ${rint(0, n)}) mod ${p}`;
  },
  parse: parseLucas,
  trace: (input) => stabilizeLucas(lucasTrace(input).frames),
  render: (state) => <LucasDigits state={state} />,
  pseudocode: LUCAS_CODE,
  legend: [
    { role: 'compare', label: 'digits split off by a call; table entries read' },
    { role: 'active', label: 'the open call; the digit pair being read' },
    { role: 'done', label: 'digit pair multiplied in; a call returning' },
    { role: 'muted', label: 'digits of n that need no lookup' },
    { role: 'bad', label: `digit of r larger than the digit of n (factor 0), or a wrong table (${SYM.cross})` },
  ],
  complexity: { time: 'O(p) to build the table once, then O(log_p n) lookups', space: 'O(p) for the table, O(log_p n) for the calls' },
};
