/**
 * Specs for the second set of problem patterns: meet in the middle, bit manipulation, the DP
 * patterns' space-optimized rows, coordinate compression, graph traversal problems and
 * inclusion-exclusion. Each mirrors the Python in Problem_Patterns/<topic>/Python (see the
 * header of its tracer).
 */
import { BIT_CODE, bitTrace, parseBitOps, parseSubsetN, SUBSET_CODE, subsetTrace, type BitOp } from '../algorithms/bitManipulation';
import { COMPRESS_2D_CODE, COMPRESS_CODE, compress2dTrace, compressTrace, parseCompress, parsePoints } from '../algorithms/coordinateCompression';
import { KNAPSACK_CODE, knapsack1dTrace, LCS_CODE, lcsRowsTrace, parseKnapsack1d, parseLcsRows, type Knapsack1dInput, type LcsRowsInput } from '../algorithms/dpPatterns';
import {
  BFS_CODE,
  bfsShortestTrace,
  DFS_CODE,
  dfsStackTrace,
  ISLANDS_CODE,
  islandsTrace,
  parseAdjGraph,
  parseGrid,
  parseTopo,
  TOPO_CODE,
  topoTrace,
  type AdjGraph,
  type TopoInput,
} from '../algorithms/graphTraversalProblems';
import { DIVISIBLE_CODE, divisibleTrace, parseDivisible, parseUnionSets, UNION_CODE, unionTrace, type DivisibleInput } from '../algorithms/inclusionExclusion';
import { MITM_CODE, mitmTrace, parseMitm, type MitmInput } from '../algorithms/meetInTheMiddle';
import type { VizSpec } from '../core/types';
import { BitRows, stabilizeBits, type BitRowsState } from '../renderers/BitRows';
import { BoardView, stabilizeBoard, type BoardState } from '../renderers/BoardView';
import { CompressionPlane, stabilizePlaneStrips, type CompressionPlaneState } from '../renderers/CompressionPlane';
import { GraphView, type GraphState } from '../renderers/GraphView';
import { PatternLanes, stabilizeLanes, type PatternLanesState } from '../renderers/PatternLanes';
import { stabilizeVenn, VennView, type VennState } from '../renderers/VennView';
import { SYM } from '../ui/symbols';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const lanes = (state: PatternLanesState) => <PatternLanes state={state} />;
const graph = (state: GraphState) => <GraphView state={state} />;

/* ---------- meet in the middle ---------- */

export const meetInTheMiddleSpec: VizSpec<MitmInput, PatternLanesState> = {
  id: 'meet-in-the-middle',
  title: 'Meet in the Middle (closest subset sum)',
  inputKind: 'mitm',
  inputLabel: 'Numbers and target',
  inputHelp:
    'Up to 8 whole numbers (-999 to 999), then "; target T" (-999 to 9999). The answer is the largest subset sum that does not exceed T. ' +
    'A negative number or target makes the code raise ValueError, and the run shows it.',
  examples: [
    { label: 'Classic', value: '5, 3, 2, 7, 10; target 14' },
    { label: 'Eight numbers', value: '12, 25, 7, 31, 18, 4, 9, 40; target 50' },
    { label: 'Target above the total', value: '5, 3, 2, 7, 10; target 100' },
    { label: 'Only the empty subset fits', value: '5, 3, 2, 7, 10; target 1' },
    { label: 'Negative number (ValueError)', value: '3, -1, 2; target 4' },
  ],
  randomInput: () => {
    const nums = Array.from({ length: rint(4, 8) }, () => rint(1, 30));
    const total = nums.reduce((a, b) => a + b, 0);
    return `${nums.join(', ')}; target ${rint(Math.floor(total / 4), Math.floor((3 * total) / 4))}`;
  },
  parse: parseMitm,
  trace: (input) => stabilizeLanes(mitmTrace(input).frames),
  render: lanes,
  pseudocode: MITM_CODE,
  legend: [
    { role: 'active', label: 'current left sum; sums just appended' },
    { role: 'compare', label: 'probed right sum (faded: outside the search interval)' },
    { role: 'good', label: `new best total (${SYM.check})` },
    { role: 'bad', label: `left sum above the target, skipped; or the input that raises ValueError (${SYM.cross})` },
    { role: 'done', label: 'the best pair' },
  ],
  complexity: { time: 'O(2^(n/2) * n): two halves of 2^(n/2) sums, a sort and a binary search per left sum', space: 'O(2^(n/2))' },
};

/* ---------- bit manipulation ---------- */

const BIT_NAMES = ['power', 'count', 'get', 'set', 'clear', 'toggle', 'lowest', 'highest', 'diff', 'swap', 'even', 'next'] as const;

function randomBitScript(): string {
  return Array.from({ length: rint(3, 6) }, () => {
    const name = pick(BIT_NAMES);
    const v = pick([rint(1, 255), rint(1, 64), rint(-40, 40)]);
    if (['get', 'set', 'clear', 'toggle'].includes(name)) return `${name} ${v} ${rint(0, 7)}`;
    if (name === 'diff' || name === 'swap') return `${name} ${v} ${rint(0, 99)}`;
    if (name === 'count' && v < 0) return `count ${-v}`;
    return `${name} ${v}`;
  }).join(', ');
}

export const bitManipulationSpec: VizSpec<BitOp[], BitRowsState> = {
  id: 'bit-manipulation',
  title: 'Bit tricks',
  inputKind: 'bit-ops',
  inputLabel: 'Operations',
  inputHelp:
    'Operations separated by commas: "power 16", "count 13", "get 13 2", "set 8 1", "clear 15 2", "toggle 13 1", "lowest 12", "highest 13", "diff 7 10", "swap 3 7", "even 4", "next 13" ' +
    '(or the Python names, as in "count_set_bits(13)"). Values from -999 to 9999, bit positions 0 to 15, up to 12 operations.',
  examples: [
    { label: 'Classic tour', value: 'count 13, get 13 2, set 8 1, clear 15 2, toggle 13 1, lowest 12, highest 13' },
    { label: 'Powers of two', value: 'power 16, power 12, power 0, next 13, next 16' },
    { label: 'XOR tricks', value: 'diff 7 10, swap 3 7, swap 4 4, even -4' },
    { label: 'Negative numbers', value: 'count -8, lowest -12, highest -1, get -1 15' },
  ],
  randomInput: randomBitScript,
  parse: parseBitOps,
  trace: (ops) => stabilizeBits(bitTrace(ops).frames),
  render: (state) => <BitRows state={state} />,
  pseudocode: BIT_CODE,
  legend: [
    { role: 'compare', label: 'the bit being examined (the band marks its column)' },
    { role: 'active', label: 'bits that change, or the mask bit' },
    { role: 'done', label: 'the returned value' },
    { role: 'good', label: `True / zero where it should be (${SYM.check})` },
    { role: 'bad', label: `False (${SYM.cross})` },
  ],
  complexity: { time: 'O(1) per operation; Kernighan O(set bits); highest and next O(log n)', space: 'O(1)' },
};

export const subsetGenerationSpec: VizSpec<number, BitRowsState> = {
  id: 'bit-subset-generation',
  title: 'Subset generation (masks)',
  inputKind: 'subset-n',
  inputLabel: 'n (number of elements)',
  inputHelp: 'A whole number n from 0 to 5: subset_generation(n) lists all 2^n subsets of the indices 0..n-1, one per mask.',
  examples: [
    { label: 'Three elements', value: '3' },
    { label: 'Empty set', value: '0' },
    { label: 'One element', value: '1' },
    { label: 'Five elements', value: '5' },
  ],
  randomInput: () => String(rint(2, 4)),
  parse: parseSubsetN,
  trace: (n) => stabilizeBits(subsetTrace(n).frames),
  render: (state) => <BitRows state={state} />,
  pseudocode: SUBSET_CODE,
  legend: [
    { role: 'active', label: 'bits that flip as the mask counts up; the moving 1 << i' },
    { role: 'compare', label: 'bit i tested, and it is 0' },
    { role: 'good', label: `bit i is 1: element i joins the subset (${SYM.check})` },
    { role: 'done', label: 'subset appended' },
  ],
  complexity: { time: 'O(n * 2^n)', space: 'O(n * 2^n) for the output' },
};

/* ---------- DP patterns ---------- */

export const knapsackRollingSpec: VizSpec<Knapsack1dInput, PatternLanesState> = {
  id: 'knapsack-01-rolling',
  title: '0/1 Knapsack (one row)',
  inputKind: 'knapsack-1d',
  inputLabel: 'Capacity; items as weight:value',
  inputHelp: 'Like "W=7; 1:1, 3:4, 4:5, 5:7": capacity 0 to 15, up to 6 items, weights 0 to 20 and values 0 to 999.',
  examples: [
    { label: 'Classic', value: 'W=7; 1:1, 3:4, 4:5, 5:7' },
    { label: 'Greedy fails', value: 'W=10; 6:30, 5:20, 5:20' },
    { label: 'Used once, not twice', value: 'W=4; 1:3' },
    { label: 'Zero-weight item', value: 'W=2; 0:5, 3:4' },
    { label: 'Nothing fits', value: 'W=3; 4:10, 5:12' },
  ],
  randomInput: () => `W=${rint(5, 12)}; ${Array.from({ length: rint(2, 4) }, () => `${rint(1, 6)}:${rint(1, 20)}`).join(', ')}`,
  parse: parseKnapsack1d,
  trace: (input) => stabilizeLanes(knapsack1dTrace(input).frames),
  render: lanes,
  pseudocode: KNAPSACK_CODE,
  legend: [
    { role: 'active', label: 'dp[w] being rewritten (taking the item is better)' },
    { role: 'compare', label: 'dp[w - weight] it reads, or a dp[w] that stays' },
    { role: 'done', label: 'already rewritten for this item' },
    { role: 'muted', label: 'capacities too small for this item' },
  ],
  complexity: { time: 'O(N * W)', space: 'O(W): one row' },
};

export const lcsTwoRowsSpec: VizSpec<LcsRowsInput, PatternLanesState> = {
  id: 'lcs-two-rows',
  title: 'Longest Common Subsequence (two rows)',
  inputKind: 'lcs-rows',
  inputLabel: 'Two strings',
  inputHelp: 'Two strings of letters and digits separated by "|", up to 10 characters each (one may be empty).',
  examples: [
    { label: 'Classic', value: 'abcde | ace' },
    { label: 'Textbook', value: 'abcbdab | bdcaba' },
    { label: 'Shorter first (swap)', value: 'ace | abcde' },
    { label: 'Nothing shared', value: 'abc | xyz' },
    { label: 'Empty string', value: ' | abc' },
  ],
  randomInput: () => {
    const word = () => Array.from({ length: rint(4, 8) }, () => pick(['a', 'b', 'c', 'd'])).join('');
    return `${word()} | ${word()}`;
  },
  parse: parseLcsRows,
  trace: (input) => stabilizeLanes(lcsRowsTrace(input).frames),
  render: lanes,
  pseudocode: LCS_CODE,
  legend: [
    { role: 'active', label: 'curr[j] being filled' },
    { role: 'compare', label: 'the cells it reads' },
    { role: 'done', label: 'the finished row, copied up into prev' },
  ],
  complexity: { time: 'O(N * M)', space: 'O(min(N, M)): two rows' },
};

/* ---------- coordinate compression ---------- */

export const coordinateCompressionSpec: VizSpec<number[], PatternLanesState> = {
  id: 'coordinate-compression',
  title: 'Coordinate Compression',
  inputKind: 'compress',
  inputLabel: 'Values',
  inputHelp: 'Up to 12 whole numbers between -10^9 and 10^9, separated by commas or spaces (repeats allowed).',
  examples: [
    { label: 'Classic', value: '1000, 5, 200, 1000, 5, 50' },
    { label: 'Negatives', value: '7, -3, 0, -3' },
    { label: 'Huge values', value: '1000000000, -1000000000, 0, 999999999, 1000000000' },
    { label: 'All equal', value: '3, 3, 3' },
  ],
  randomInput: () => Array.from({ length: rint(5, 9) }, () => pick([rint(0, 50), rint(0, 5000), rint(-1000000, 1000000)])).join(', '),
  parse: parseCompress,
  trace: (coords) => stabilizeLanes(compressTrace(coords).frames),
  render: lanes,
  pseudocode: COMPRESS_CODE,
  legend: [
    { role: 'muted', label: 'a repeat that set() drops' },
    { role: 'active', label: 'value being placed or ranked' },
    { role: 'compare', label: 'the lookup mapping[c]' },
    { role: 'done', label: 'ranks and the decompressed list' },
  ],
  complexity: { time: 'O(n log n) to build, O(1) per dict lookup', space: 'O(k) for k distinct values' },
};

export const coordinateCompression2dSpec: VizSpec<Array<[number, number]>, CompressionPlaneState> = {
  id: 'coordinate-compression-2d',
  title: 'Coordinate Compression (2D)',
  inputKind: 'compress-2d',
  inputLabel: 'Points',
  inputHelp: 'Up to 8 points written as (x, y), separated by commas; coordinates between -10^9 and 10^9.',
  examples: [
    { label: 'Classic', value: '(1000, 500), (5, 10), (200, 300), (5, 500)' },
    { label: 'Huge coordinates', value: '(1000000000, 7), (-1000000000, 7), (0, -5), (0, 999999)' },
    { label: 'Shared column', value: '(5, 1), (5, 900), (70, 40)' },
    { label: 'One point', value: '(3, 3)' },
  ],
  randomInput: () => Array.from({ length: rint(3, 6) }, () => `(${pick([rint(0, 20), rint(0, 2000)])}, ${pick([rint(0, 20), rint(0, 900)])})`).join(', '),
  parse: parsePoints,
  trace: (points) => stabilizePlaneStrips(compress2dTrace(points).frames),
  render: (state) => <CompressionPlane state={state} />,
  pseudocode: COMPRESS_2D_CODE,
  legend: [
    { role: 'compare', label: 'axis whose values are read' },
    { role: 'active', label: 'axis just compressed; point being mapped' },
    { role: 'done', label: 'point on the rank grid' },
  ],
  complexity: { time: 'O(n log n)', space: 'O(n)' },
};

/* ---------- graph traversal problems ---------- */

function randomGrid(): string {
  const r = rint(3, 6);
  const c = rint(4, 7);
  return Array.from({ length: r }, () => Array.from({ length: c }, () => (Math.random() < 0.5 ? '1' : '0')).join('')).join(', ');
}

export const numberOfIslandsSpec: VizSpec<string[], BoardState> = {
  id: 'number-of-islands',
  title: 'Number of Islands (flood fill)',
  inputKind: 'islands',
  inputLabel: 'Grid rows',
  inputHelp: "Rows of 1 (land) and 0 (water), separated by commas, all the same length: up to 8 rows of 10. An empty box is an empty grid.",
  examples: [
    { label: 'Three islands', value: '11000, 11000, 00100, 00011' },
    { label: 'One big island', value: '11110, 11010, 11000, 00000' },
    { label: 'Diagonals do not connect', value: '10101, 01010, 10101' },
    { label: 'All land', value: '111111, 111111, 111111, 111111, 111111' },
    { label: 'All water', value: '0000, 0000' },
  ],
  randomInput: randomGrid,
  parse: parseGrid,
  // One spare stack row: BoardView's reservation is a little short of a full panel on a phone.
  trace: (rows) => stabilizeBoard(islandsTrace(rows).frames).map((f) => ({ ...f, state: { ...f.state, stackRows: (f.state.stackRows ?? 1) + 1 } })),
  render: (state) => <BoardView state={state} />,
  pseudocode: ISLANDS_CODE,
  legend: [
    { role: 'compare', label: 'the scan, or the cell just popped' },
    { role: 'active', label: 'the island being sunk; cells just pushed' },
    { role: 'done', label: "islands already sunk ('0' now)" },
    { role: 'muted', label: 'grey arrow: neighbour not pushed (water, sunk or off the grid)' },
    { role: 'idle', label: "bold '1' on grey: land the scan has not reached yet" },
  ],
  complexity: { time: 'O(R * C)', space: 'O(R * C) for the stack' },
};

const ADJ_HELP = 'One entry per node: "0: 1 2" lists the neighbours of 0, in order; entries are separated by ";". Nodes are 0 to 99, up to 10 nodes and 20 neighbour entries. ';

function randomAdj(withTarget: boolean): string {
  const n = rint(5, 7);
  const lines: string[] = [];
  const nb: number[][] = Array.from({ length: n }, () => []);
  for (let v = 1; v < n; v++) {
    const u = rint(0, v - 1);
    nb[u].push(v);
    nb[v].push(u);
  }
  for (let k = 0; k < 2; k++) {
    const a = rint(0, n - 1);
    const b = rint(0, n - 1);
    if (a !== b && !nb[a].includes(b)) {
      nb[a].push(b);
      nb[b].push(a);
    }
  }
  nb.forEach((vs, u) => lines.push(`${u}: ${vs.join(' ')}`));
  return `${lines.join('; ')}; start 0${withTarget ? `; target ${rint(1, n - 1)}` : ''}`;
}

export const bfsShortestPathSpec: VizSpec<AdjGraph, GraphState> = {
  id: 'bfs-shortest-path',
  title: 'BFS shortest path',
  inputKind: 'adj-target',
  inputLabel: 'Adjacency lists, start and target',
  inputHelp: `${ADJ_HELP}Finish with "; start 0; target 4". A target that is not a key (a sink) is fine.`,
  examples: [
    { label: 'Article graph', value: '0: 1 2; 1: 0 3; 2: 0 3; 3: 1 2 4; 4: 3; start 0; target 4' },
    { label: 'Target is a sink', value: '0: 1 2; 1: 3; 2: 3; start 0; target 3' },
    { label: 'Unreachable', value: '0: 1; 1: 0; 2: 3; 3: 2; start 0; target 3' },
    { label: 'Start is a sink (not a key)', value: '0: 1; 1: 2; start 2; target 0' },
    { label: 'Start is the target', value: '0: 1; 1: 0; start 1; target 1' },
  ],
  randomInput: () => randomAdj(true),
  parse: (text) => parseAdjGraph(text, true),
  trace: (g) => bfsShortestTrace(g).frames,
  render: graph,
  pseudocode: BFS_CODE,
  legend: [
    { role: 'active', label: 'node just dequeued, or just discovered' },
    { role: 'compare', label: 'waiting in the queue' },
    { role: 'done', label: 'finished; edges that discovered a node' },
    { role: 'good', label: `target dequeued (${SYM.check})` },
    { role: 'bad', label: `no path (${SYM.cross})` },
  ],
  complexity: { time: 'O(V + E)', space: 'O(V)' },
};

export const dfsExplicitStackSpec: VizSpec<AdjGraph, GraphState> = {
  id: 'dfs-explicit-stack',
  title: 'DFS traversal (explicit stack)',
  inputKind: 'adj-start',
  inputLabel: 'Adjacency lists and start',
  inputHelp: `${ADJ_HELP}Finish with "; start 0".`,
  examples: [
    { label: 'Article graph', value: '0: 1 2; 1: 0 3; 2: 0 3 4; 3: 1 2; 4: 2; start 0' },
    { label: 'Pushed twice', value: '0: 1 2 3; 1: 3; 2: 3; 3:; start 0' },
    { label: 'Directed with a sink', value: '0: 1 2; 1: 3; 2: 3; start 0' },
    { label: 'Start is a sink (not a key)', value: '0: 1; 1: 2; start 2' },
  ],
  randomInput: () => randomAdj(false),
  parse: (text) => parseAdjGraph(text, false),
  trace: (g) => dfsStackTrace(g).frames,
  render: graph,
  pseudocode: DFS_CODE,
  legend: [
    { role: 'active', label: 'node just visited' },
    { role: 'compare', label: 'on the stack' },
    { role: 'done', label: 'visited; the edge that reached it' },
    { role: 'muted', label: 'popped again, already visited: skipped' },
  ],
  complexity: { time: 'O(V + E)', space: 'O(V + E) for the stack (a node can be pushed once per edge)' },
};

function randomTopo(): string {
  const n = rint(4, 7);
  const edges: string[] = [];
  for (let k = 0; k < rint(n, n + 3); k++) {
    const u = rint(0, n - 2);
    const v = rint(u + 1, n - 1);
    if (!edges.includes(`${u}->${v}`)) edges.push(`${u}->${v}`);
  }
  if (Math.random() < 0.2) edges.push(`${n - 1}->0`);
  return `n ${n}; ${edges.join(', ')}`;
}

export const topologicalSortEdgesSpec: VizSpec<TopoInput, GraphState> = {
  id: 'topological-sort-edges',
  title: 'Topological Sort (Kahn, edge list)',
  inputKind: 'topo-edges',
  inputLabel: 'n and edges',
  inputHelp: 'The number of nodes, then edges "u->v" (u comes before v): "n 4; 1->0, 2->0". Nodes are 0..n-1 (n up to 10), up to 20 edges; an endpoint outside 0..n-1 makes the code raise KeyError.',
  examples: [
    { label: 'Course schedule', value: 'n 4; 1->0, 2->0, 3->1, 3->2' },
    { label: 'Classic DAG', value: 'n 6; 5->2, 5->0, 4->0, 4->1, 2->3, 3->1' },
    { label: 'Cycle', value: 'n 4; 0->1, 1->2, 2->3, 3->1' },
    { label: 'Missing node (KeyError)', value: 'n 3; 0->1, 1->5' },
    { label: 'No nodes', value: 'n 0; 0->1' },
  ],
  randomInput: randomTopo,
  parse: parseTopo,
  trace: (input) => topoTrace(input).frames,
  render: graph,
  pseudocode: TOPO_CODE,
  legend: [
    { role: 'compare', label: 'in-degree changed, or waiting in the queue' },
    { role: 'active', label: 'node just placed or just freed' },
    { role: 'done', label: 'placed; edges already used' },
    { role: 'bad', label: `never reaches in-degree 0, or the tail of the edge that raises KeyError (${SYM.cross})` },
  ],
  complexity: { time: 'O(V + E)', space: 'O(V + E)' },
};

/* ---------- inclusion-exclusion ---------- */

export const inclusionExclusionDivisorsSpec: VizSpec<DivisibleInput, VennState> = {
  id: 'inclusion-exclusion-divisors',
  title: 'Inclusion-Exclusion (divisors)',
  inputKind: 'ie-divisors',
  inputLabel: 'n and divisors',
  inputHelp: 'Like "n 100; divisors 2, 3, 5": n from -999 to 10^9 and 1 to 3 divisors from 1 to 999. The answer counts 1..n divisible by at least one divisor.',
  examples: [
    { label: 'Classic', value: 'n 100; divisors 2, 3, 5' },
    { label: 'Shared factor (lcm 12)', value: 'n 30; divisors 4, 6' },
    { label: 'Two divisors', value: 'n 100; divisors 2, 3' },
    { label: 'Large n', value: 'n 1000000000; divisors 7, 11, 13' },
    { label: 'n below 1', value: 'n -10; divisors 3' },
  ],
  randomInput: () => `n ${rint(20, 300)}; divisors ${Array.from({ length: rint(2, 3) }, () => rint(2, 12)).join(', ')}`,
  parse: parseDivisible,
  trace: (input) => stabilizeVenn(divisibleTrace(input).frames),
  render: (state) => <VennView state={state} />,
  pseudocode: DIVISIBLE_CODE,
  legend: [
    { role: 'active', label: 'term being added (odd subset)' },
    { role: 'compare', label: 'intersection being built, or term subtracted (even subset)' },
    { role: 'good', label: `region counted exactly once (${SYM.check})` },
    { role: 'bad', label: `region counted too often so far (${SYM.cross})` },
  ],
  complexity: { time: 'O(2^k * k log n)', space: 'O(1)' },
};

export const inclusionExclusionSetsSpec: VizSpec<number[][], VennState> = {
  id: 'inclusion-exclusion-sets',
  title: 'Inclusion-Exclusion (sets)',
  inputKind: 'ie-sets',
  inputLabel: 'Sets',
  inputHelp: 'One to three sets separated by "|", each up to 6 whole numbers from 0 to 99 (repeats inside a set count once, as in Python\'s set()).',
  examples: [
    { label: 'README example', value: '1 2 3 | 2 3 4 | 3 4 5' },
    { label: 'Disjoint', value: '1 | 2' },
    { label: 'Identical sets', value: '1 2 | 1 2' },
    { label: 'An empty set', value: ' | 7' },
    { label: 'Three overlapping', value: '1 2 3 4 | 3 4 5 6 | 4 6 7' },
  ],
  randomInput: () => Array.from({ length: rint(2, 3) }, () => Array.from({ length: rint(2, 5) }, () => rint(1, 9)).join(' ')).join(' | '),
  parse: parseUnionSets,
  trace: (sets) => stabilizeVenn(unionTrace(sets).frames),
  render: (state) => <VennView state={state} />,
  pseudocode: UNION_CODE,
  legend: [
    { role: 'active', label: 'term being added; elements of the intersection' },
    { role: 'compare', label: 'intersection being built, or term subtracted' },
    { role: 'good', label: `element counted exactly once (${SYM.check})` },
    { role: 'bad', label: `element counted too often so far (${SYM.cross})` },
  ],
  complexity: { time: 'O(2^m * m * s)', space: 'O(s)' },
};
