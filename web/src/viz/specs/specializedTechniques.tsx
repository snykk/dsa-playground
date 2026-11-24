import { CENTROID_CODE, centroidTrace, parseCentroid, type CentroidInput } from '../algorithms/centroid';
import { HLD_CODE, hldTrace, parseHld, type HldInput } from '../algorithms/heavyLight';
import { EULER_CODE, eulerTrace, LIFT_CODE, liftingTrace, parseLcaTree, type LcaTreeInput } from '../algorithms/lowestCommonAncestor';
import { MO_CODE, moTrace, parseMo, type MoInput } from '../algorithms/mosAlgorithm';
import { parseSqrt, SQRT_CODE, sqrtTrace, type SqrtInput } from '../algorithms/sqrtDecomposition';
import type { Example, VizSpec } from '../core/types';
import { EulerTourView, type EulerTourState } from '../renderers/EulerTourView';
import { LcaLifting, type LcaState } from '../renderers/LcaLifting';
import { MosView, type MosViewState } from '../renderers/MosView';
import { RootedTreeView, type RootedTreeState } from '../renderers/RootedTreeView';
import { SegmentTreeView, type SegmentTreeState } from '../renderers/SegmentTreeView';
import { SYM } from '../ui/symbols';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const range = (n: number): [number, number] => {
  const l = rint(0, n - 1);
  return [l, rint(l, n - 1)];
};

/* ---------- square root decomposition ---------- */

function randomSqrt(): string {
  const n = rint(5, 16);
  const ops = Array.from({ length: rint(3, 5) }, () => (Math.random() < 0.6 ? `query ${range(n).join(' ')}` : `update ${rint(0, n - 1)} ${rint(-9, 30)}`));
  return `[${Array.from({ length: n }, () => rint(-9, 30)).join(', ')}]; ${ops.join(', ')}`;
}

export const sqrtDecompositionSpec: VizSpec<SqrtInput, SegmentTreeState> = {
  id: 'sqrt-decomposition',
  title: 'Square Root Decomposition',
  inputKind: 'sqrt-decomposition',
  inputLabel: 'Array and operations',
  inputHelp:
    'Start with the array (up to 20 integers from -99 to 99), then a semicolon and operations separated by commas: "query 2 7" (the sum of indices 2..7) and "update 5 20" (set index 5 to 20); ' +
    'q and u for short. Up to 12 operations. The block size is ceil(sqrt(n)), as in the code. Indices are not checked by the code: one past the end raises IndexError, which the run shows.',
  examples: [
    { label: 'Query, update, query (Python demo)', value: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; query 2 7, update 5 20, query 2 7' },
    { label: 'Whole blocks in the middle', value: '[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3]; query 1 14, update 7 0, query 4 11' },
    { label: 'Partial last block, range of one', value: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; query 8 9, query 3 9, query 5 5' },
    { label: 'Past the end (IndexError)', value: '[1, 2, 3, 4, 5]; query 2 5, update 7 1, update 5 0, query 0 4' },
    { label: 'Empty array: block size 1', value: '[]; query 0 0, update 0 5' },
  ],
  randomInput: randomSqrt,
  parse: parseSqrt,
  trace: (input) => sqrtTrace(input).frames,
  render: (state) => <SegmentTreeView state={state} />,
  pseudocode: SQRT_CODE,
  legend: [
    { role: 'compare', label: 'the blocks of left and right; the cell and block an update touches' },
    { role: 'active', label: 'cell or block sum being added; the change on its way to its block' },
    { role: 'done', label: 'already added to the result, or already written' },
    { role: 'good', label: `the reads that make up the answer (${SYM.check})` },
    { role: 'bad', label: `read past the end: IndexError (${SYM.cross})` },
  ],
  complexity: { time: 'O(n) build; query O(sqrt n); update O(1)', space: 'O(sqrt n) block sums, plus a copy of the array' },
};

/* ---------- Mo's algorithm ---------- */

function randomMo(): string {
  const n = rint(6, 16);
  const arr = Array.from({ length: n }, () => rint(0, rint(2, 6)));
  const qs = Array.from({ length: rint(3, 6) }, () => `(${range(n).join(', ')})`);
  return `[${arr.join(', ')}]; ${qs.join(' ')}`;
}

export const mosAlgorithmSpec: VizSpec<MoInput, MosViewState> = {
  id: 'mos-algorithm',
  title: "Mo's Algorithm",
  inputKind: 'mos-algorithm',
  inputLabel: 'Array and queries',
  inputHelp:
    'Start with the array (up to 16 integers from -99 to 99), then a semicolon and the queries as pairs of inclusive indices: "(0, 4) (1, 3)" or "0 4, 1 3". Up to 8 queries, each with 0 <= l <= r < n. ' +
    'Every query asks how many distinct values arr[l..r] holds, the only statistic the code computes. The block size is int(sqrt(n)), as in the code.',
  examples: [
    { label: 'Five queries (article)', value: '[1, 1, 2, 1, 3, 4, 3, 3, 4]; (0, 4) (6, 8) (1, 3) (5, 7) (2, 6)' },
    { label: 'Python demo', value: '[1, 1, 2, 1, 3, 4, 3, 3, 4]; (0, 4) (1, 3) (2, 6) (0, 8)' },
    { label: 'Equal keys keep input order', value: '[2, 7, 2, 7, 2, 7, 2, 7, 2]; (1, 5) (0, 5) (2, 5) (0, 2) (1, 2)' },
    { label: 'Sixteen elements, eight queries', value: '[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3]; (0, 15) (4, 7) (0, 3) (5, 5) (12, 15) (1, 13) (8, 11) (2, 2)' },
    { label: 'Ranges of length one', value: '[5, 5, 6, 5]; (0, 3) (2, 2) (0, 0) (3, 3)' },
  ],
  randomInput: randomMo,
  parse: parseMo,
  trace: (input) => moTrace(input).frames,
  render: (state) => <MosView state={state} />,
  pseudocode: MO_CODE,
  legend: [
    { role: 'compare', label: 'the window [current_l, current_r] (dashed band) and its L and R pointers' },
    { role: 'active', label: 'element entering the window; the query being answered' },
    { role: 'muted', label: 'element just removed from the window (struck through)' },
    { role: 'done', label: 'query answered' },
  ],
  complexity: { time: 'O(Q log Q) to sort, then O((N + Q) sqrt N) pointer moves of O(1) each', space: 'O(N + Q)' },
};

/* ---------- trees ---------- */

/** A random tree on 0..n-1 with shuffled labels and edges listed in random order. */
function randomTreeEdges(n: number): string {
  const label = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
  const edges: string[] = [];
  for (let v = 1; v < n; v++) {
    const u = Math.random() < 0.6 ? rint(0, v - 1) : rint(Math.max(0, v - 2), v - 1);
    edges.push(`${label[u]}-${label[v]}`);
  }
  return edges.sort(() => Math.random() - 0.5).join(' ');
}

/* ---------- lowest common ancestor: two tabs on one input ---------- */

const TEN_NODES = '0-1 0-2 1-3 1-4 2-5 3-6 3-7 5-8 6-9';
const PATH12 = '0-1 1-2 2-3 3-4 4-5 5-6 6-7 7-8 8-9 9-10 10-11';
const STAR9 = '0-1 0-2 0-3 0-4 0-5 0-6 0-7 0-8';

const LCA_HELP =
  'Start with the edges of a tree on the nodes 0..n-1 ("0-1 0-2 1-3", up to 12 nodes; the order of the edges is the order of adj, which decides the order of the Euler tour), or "n 1" for a single node. ' +
  'Then a semicolon, an optional "root 4" (0 if left out), and up to 8 queries separated by commas: "lca 9 4", "dist 9 8" (distance) and "kth 9 3" (kth_ancestor(9, 3), binary lifting only). A node that does not exist raises IndexError.';

function randomLca(): string {
  const n = rint(5, 12);
  const ops = Array.from({ length: rint(2, 4) }, () => {
    const r = Math.random();
    return r < 0.6 ? `lca ${rint(0, n - 1)} ${rint(0, n - 1)}` : r < 0.8 ? `dist ${rint(0, n - 1)} ${rint(0, n - 1)}` : `kth ${rint(0, n - 1)} ${rint(0, 4)}`;
  });
  return `${randomTreeEdges(n)}; ${ops.join(', ')}`;
}

const LIFT_EXAMPLES: Example[] = [
  { label: 'Ten nodes (article)', value: `${TEN_NODES}; lca 9 4, lca 9 8, dist 9 8, kth 9 3` },
  { label: 'An ancestor, the same node, too far up', value: `${TEN_NODES}; lca 1 9, lca 6 6, kth 9 5` },
  { label: 'Path of 12, rooted in the middle', value: `${PATH12}; root 6; lca 0 11, lca 2 4, dist 0 11, kth 11 5` },
  { label: 'Star: every jump of 2 or more hits the root', value: `${STAR9}; lca 3 5, lca 0 7, kth 6 2` },
  { label: 'Nine nodes (overview)', value: '0-1 0-2 1-3 1-4 3-6 3-7 2-5 5-8; lca 6 4, lca 8 7' },
  { label: 'A node past the tree: IndexError', value: '0-1 0-2 1-3; lca 3 2, lca 3 7, kth 9 0' },
];

const EULER_EXAMPLES: Example[] = [
  { label: 'Ten nodes (article)', value: `${TEN_NODES}; lca 9 4, lca 9 8, dist 9 8` },
  { label: 'An ancestor, the same node', value: `${TEN_NODES}; lca 1 9, lca 6 6, lca 8 5` },
  { label: 'Path of 12, rooted in the middle', value: `${PATH12}; root 6; lca 0 11, lca 2 4, dist 0 11` },
  { label: 'Star: the tour returns to the root', value: `${STAR9}; lca 3 5, lca 0 7` },
  { label: 'Nine nodes (overview)', value: '0-1 0-2 1-3 1-4 3-6 3-7 2-5 5-8; lca 6 4, lca 8 7' },
  { label: 'A node past the tree: IndexError', value: '0-1 0-2 1-3; lca 3 2, lca 3 7' },
];

export const lcaLiftingSpec: VizSpec<LcaTreeInput, LcaState> = {
  id: 'lca-up-table',
  title: 'Lowest Common Ancestor (binary lifting)',
  inputKind: 'lowest-common-ancestor',
  inputLabel: 'Tree and queries',
  inputHelp: LCA_HELP,
  examples: LIFT_EXAMPLES,
  randomInput: randomLca,
  parse: parseLcaTree,
  trace: (input) => liftingTrace(input).frames,
  render: (state) => <LcaLifting state={state} />,
  pseudocode: LIFT_CODE,
  legend: [
    { role: 'compare', label: 'node or entry read; the node v; a node the queue has just found' },
    { role: 'active', label: 'entry written; the node u; the jump taken' },
    { role: 'muted', label: 'earlier jumps of the same query' },
    { role: 'idle', label: 'dashed: not reached by the walk yet, or an entry not written yet' },
    { role: 'good', label: `answer equals a walk up the parents (${SYM.check})` },
    { role: 'bad', label: `IndexError (${SYM.cross})` },
  ],
  complexity: { time: 'O(n log n) to build; O(log n) per lca, distance or kth_ancestor', space: 'O(n log n)' },
};

export const lcaEulerSpec: VizSpec<LcaTreeInput, EulerTourState> = {
  id: 'lca-euler-tour',
  title: 'Lowest Common Ancestor (Euler tour + sparse table)',
  inputKind: 'lowest-common-ancestor',
  inputLabel: 'Tree and queries',
  inputHelp: LCA_HELP,
  examples: EULER_EXAMPLES,
  randomInput: randomLca,
  parse: parseLcaTree,
  trace: (input) => eulerTrace(input).frames,
  render: (state) => <EulerTourView state={state} />,
  pseudocode: EULER_CODE,
  legend: [
    { role: 'compare', label: 'on the stack; the range between first[u] and first[v]; the halves or windows read; the node v' },
    { role: 'active', label: 'top of the stack; the entry or cell written; the node u' },
    { role: 'done', label: 'left the stack: its whole subtree is in the tour' },
    { role: 'good', label: `the LCA, equal to a walk up the parents (${SYM.check})` },
    { role: 'bad', label: `IndexError, or kth_ancestor, which this class lacks (${SYM.cross})` },
    { role: 'idle', label: 'badge on a node = its depth; f3 under a node = first[v] = 3' },
  ],
  complexity: { time: 'O(n log n) to build; O(1) per lca', space: 'O(n log n)' },
};

function randomHld(): string {
  const n = rint(6, 13);
  const ops = Array.from({ length: rint(2, 3) }, () => `${Math.random() < 0.6 ? 'path' : 'lca'} ${rint(0, n - 1)} ${rint(0, n - 1)}`);
  return `${randomTreeEdges(n)}; ${ops.join(', ')}`;
}

export const heavyLightSpec: VizSpec<HldInput, RootedTreeState> = {
  id: 'heavy-light-decomposition',
  title: 'Heavy-Light Decomposition',
  inputKind: 'heavy-light-decomposition',
  inputLabel: 'Tree and queries',
  inputHelp:
    'Start with the edges of a tree on the nodes 0..n-1 ("0-1 0-2 1-3", up to 16 nodes; the order of the edges is the order of adj, which breaks ties), or "n 1" for a single node. ' +
    'Then a semicolon, an optional "root 4" for build(4) (0 if left out), and up to 8 operations separated by commas: "lca 3 6" and "path 3 6" (query_path). A node that does not exist raises IndexError.',
  examples: [
    { label: 'Path from 3 to 6 (article)', value: '0-1 0-2 1-3 1-4 2-5 4-6; lca 3 6, path 3 6' },
    { label: 'Nine nodes (overview)', value: '0-1 0-2 1-3 1-4 3-6 3-7 2-5 5-8; path 6 4, lca 8 7, path 8 7' },
    { label: 'Equal sizes: first child wins', value: '0-1 0-2 1-3 1-4 2-5 2-6 3-7 4-8; path 7 8, path 8 6' },
    { label: 'Long path, rooted in the middle', value: '0-1 1-2 2-3 3-4 4-5 5-6 6-7 7-8 8-9 9-10 10-11; root 6; path 0 11, lca 2 10' },
    { label: 'Star, and a missing node', value: '0-1 0-2 0-3 0-4 0-5 0-6; path 3 5, lca 2 9' },
  ],
  randomInput: randomHld,
  parse: parseHld,
  trace: (input) => hldTrace(input).frames,
  render: (state) => <RootedTreeView state={state} />,
  pseudocode: HLD_CODE,
  legend: [
    { role: 'compare', label: 'nodes being compared: new children, the heavy candidates, u and v of a query' },
    { role: 'active', label: 'current node, or the segment of pos being recorded' },
    { role: 'done', label: 'size already passed up, heavy child chosen, segment recorded' },
    { role: 'good', label: `the answer: the LCA, or every node of the path (${SYM.check})` },
    { role: 'muted', label: 'chain that lca jumped over' },
    { role: 'idle', label: 'thick edge = heavy, dashed = light; a grey tube joins one chain; p3 under a node is pos 3; brackets under pos group a chain by its head' },
  ],
  complexity: { time: 'O(n) build; lca and query_path O(log n): one jump per chain', space: 'O(n)' },
};

function randomCentroid(): string {
  return randomTreeEdges(rint(6, 15));
}

export const centroidSpec: VizSpec<CentroidInput, RootedTreeState> = {
  id: 'centroid-decomposition',
  title: 'Centroid Decomposition',
  inputKind: 'centroid-decomposition',
  inputLabel: 'Tree',
  inputHelp:
    'The edges of a tree on the nodes 0..n-1 ("0-1 0-2 1-3", up to 16 nodes; the order of the edges is the order of adj, which decides where the search for a centroid walks), or "n 1" for one node. ' +
    'Optionally a semicolon and "root 4" for build(4) (0 if left out). The code has no queries: the result is the parent array, the centroid tree.',
  examples: [
    { label: 'Seven nodes (article)', value: '0-1 0-2 1-3 1-4 2-5 4-6' },
    { label: 'Path of 15: a balanced tree', value: '0-1 1-2 2-3 3-4 4-5 5-6 6-7 7-8 8-9 9-10 10-11 11-12 12-13 13-14' },
    { label: 'Star: one round', value: '0-1 0-2 0-3 0-4 0-5 0-6 0-7 0-8' },
    { label: 'Nine nodes (overview)', value: '0-1 0-2 1-3 1-4 3-6 3-7 2-5 5-8' },
    { label: 'Same tree, build(6)', value: '0-1 0-2 1-3 1-4 2-5 4-6; root 6' },
  ],
  randomInput: randomCentroid,
  parse: parseCentroid,
  trace: (input) => centroidTrace(input).frames,
  render: (state) => <RootedTreeView state={state} />,
  pseudocode: CENTROID_CODE,
  legend: [
    { role: 'compare', label: 'the piece being split (badges: sizes with the piece hung from its start node)' },
    { role: 'active', label: 'where the search for the centroid stands (pointer u)' },
    { role: 'good', label: `the centroid of the piece (${SYM.check})` },
    { role: 'done', label: 'node of the centroid tree' },
    { role: 'muted', label: 'removed centroid: faded, dashed outline, its edges dotted' },
  ],
  complexity: { time: 'O(n log n) build: O(n) per level, at most floor(log2 n) + 1 levels', space: 'O(n)' },
};
