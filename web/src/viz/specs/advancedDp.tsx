import { parseTsp, TSP_CODE, tspTrace, type TspInput } from '../algorithms/bitmaskDp';
import { CHT_CODE, chtTrace, parseCht, type ChtInput } from '../algorithms/convexHullTrick';
import { DIGIT_CODE, digitTrace, parseDigit, type DigitInput } from '../algorithms/digitDp';
import { DAG_CODE, dagTrace, parseDag, type DagInput } from '../algorithms/graphDp';
import { formatTree, parseTree, TREE_CODE, treeDpTrace, type TreeDpMode, type TreeInput, type TreeSpec } from '../algorithms/treeDp';
import type { VizSpec } from '../core/types';
import { DpTableView, type DpTableState } from '../renderers/DpTableView';
import { GraphView, type GraphState } from '../renderers/GraphView';
import { LineEnvelopeView, stabilizeEnvelope, type EnvelopeState } from '../renderers/LineEnvelopeView';
import { TreeDpView, type TreeDpState } from '../renderers/TreeDpView';
import { SYM } from '../ui/symbols';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** Draw random inputs until one passes the parser's limits (a few tries at most). */
function valid(make: () => string, parse: (text: string) => unknown): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const text = make();
    try {
      parse(text);
      return text;
    } catch {
      // over a limit: draw again
    }
  }
  return make();
}

/* ---------- bitmask DP: the traveling salesman ---------- */

function randomTsp(): string {
  const n = rint(3, 5);
  const d = Array.from({ length: n }, () => Array.from({ length: n }, () => '0'));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const v = Math.random() < 0.08 ? 'inf' : String(rint(1, 40));
      d[i][j] = v;
      d[j][i] = Math.random() < 0.25 && v !== 'inf' ? String(rint(1, 40)) : v;
    }
  }
  return d.map((r) => r.join(' ')).join('; ');
}

export const bitmaskTspSpec: VizSpec<TspInput, DpTableState> = {
  id: 'bitmask-dp-tsp',
  title: 'Bitmask DP: Traveling Salesman',
  inputKind: 'tsp-matrix',
  inputLabel: 'Distance matrix',
  inputHelp:
    'One row per city, separated by semicolons: "0 10 15; 10 0 35; 15 35 0" (or a Python list [[0, 10], [10, 0]]). Row i holds distances[i][j]. ' +
    'Up to 6 cities, named A, B, C... (A is city 0, where every tour starts). Distances are whole numbers from -99 to 999; write inf for a missing edge. [] is the empty matrix.',
  examples: [
    { label: 'Four cities (tests)', value: '0 10 15 20; 10 0 35 25; 15 35 0 30; 20 25 30 0' },
    { label: 'No tour exists', value: '0 1 inf; 1 0 inf; inf inf 0' },
    { label: 'One-way costs', value: '0 2 9 10; 1 0 6 4; 15 7 0 8; 6 3 12 0' },
    { label: 'Five cities, missing edges', value: '0 3 inf 2 7; 3 0 4 inf 3; inf 4 0 5 8; 2 inf 5 0 6; 7 3 8 6 0' },
    { label: 'No cities', value: '[]' },
  ],
  randomInput: () => valid(randomTsp, parseTsp),
  parse: parseTsp,
  trace: (input) => tspTrace(input).frames,
  render: (state) => <DpTableView state={state} />,
  pseudocode: TSP_CODE,
  legend: [
    { role: 'compare', label: 'state being extended: dp[mask][last], its city and the distance read' },
    { role: 'active', label: 'cell being relaxed: dp[new_mask][next_city], and the city added' },
    { role: 'done', label: 'a city in the mask (bit 1); the cells that give the answer' },
    { role: 'muted', label: `bit 0, or a cell still at inf (${SYM.infinity})` },
    { role: 'bad', label: `no tour exists (${SYM.cross})` },
  ],
  complexity: { time: 'O(n^2 * 2^n)', space: 'O(n * 2^n)' },
};

/* ---------- digit DP ---------- */

function randomDigit(): string {
  const big = Math.random() < 0.3;
  return `n ${big ? rint(1000, 99999) : rint(10, 999)}, target ${big ? rint(0, 6) : rint(0, 12)}`;
}

export const digitDpSpec: VizSpec<DigitInput, DpTableState> = {
  id: 'digit-dp',
  title: 'Digit DP: count by digit sum',
  inputKind: 'digit-dp',
  inputLabel: 'Bound and digit sum',
  inputHelp:
    'The bound n and the target digit sum: "n 25, target 5" (or just "25 5") counts the numbers 0..n whose digits add up to the target. ' +
    'n goes from -99 to 99999 and the target from 0 to 20 (the memo has one column per sum).',
  examples: [
    { label: 'Up to 25, sum 5 (article)', value: 'n 25, target 5' },
    { label: 'Up to 100, sum 5 (tests)', value: 'n 100, target 5' },
    { label: 'Memo hits: up to 345, sum 6', value: 'n 345, target 6' },
    { label: 'Unreachable sum', value: 'n 99, target 19' },
    { label: 'Negative bound', value: 'n -1, target 0' },
  ],
  randomInput: () => valid(randomDigit, parseDigit),
  parse: parseDigit,
  trace: (input) => digitTrace(input).frames,
  render: (state) => <DpTableView state={state} />,
  pseudocode: DIGIT_CODE,
  legend: [
    { role: 'active', label: 'the state being computed (its running count) and the digit tried' },
    { role: 'compare', label: 'a call still waiting for its children (running count); the position of n in play' },
    { role: 'done', label: 'memo entry just stored' },
    { role: 'good', label: `memo hit, or a base case that counts 1 (${SYM.check})` },
    { role: 'bad', label: `base case with the wrong sum, or a digit pruned (${SYM.cross})` },
    { role: 'muted', label: 'base-case row (never stored in memo); a position with no digit yet' },
  ],
  complexity: { time: 'O(d * S * 10): d digits, S = target + 1 sums', space: 'O(d * S) memo, plus d frames of recursion' },
};

/* ---------- DP on trees ---------- */

function randomTreeSpec(): string {
  const size = rint(4, 11);
  const nodes: TreeSpec[] = [{ val: rint(-5, 20), children: [] }];
  for (let i = 1; i < size; i++) {
    const parent = nodes[Math.random() < 0.5 ? rint(Math.max(0, nodes.length - 3), nodes.length - 1) : rint(0, nodes.length - 1)];
    const child: TreeSpec = { val: rint(-5, 20), children: [] };
    parent.children.push(child);
    nodes.push(child);
  }
  return formatTree(nodes[0]);
}

const TREE_HELP =
  'The same tree runs in both tabs. Write a node value followed by its children in parentheses: "1(2(4, 5), 3)" is TreeNode(1, [TreeNode(2, [TreeNode(4), TreeNode(5)]), TreeNode(3)]). ' +
  'Values go from -99 to 99; up to 15 nodes, 9 leaves and 6 levels. Write None for the empty tree. Nodes are named A, B, C... in pre-order, so equal values stay apart.';

function treeSpec(mode: TreeDpMode): VizSpec<TreeInput, TreeDpState> {
  const mis = mode === 'mis';
  return {
    id: mis ? 'tree-dp-independent-set' : 'tree-dp-max-path-sum',
    title: mis ? 'Tree DP: maximum independent set' : 'Tree DP: maximum path sum',
    inputKind: 'tree-dp',
    inputLabel: 'Rooted tree',
    inputHelp: TREE_HELP,
    examples: mis
      ? [
          { label: 'Five nodes (article)', value: '1(2(4, 5), 3)' },
          { label: 'Adjacent 30 and 40 (tests)', value: '10(20, 30(40))' },
          { label: 'Skip a level', value: '5(4(3, 3), 4(3, -9))' },
          { label: 'Negative values', value: '-3(-1)' },
          { label: 'Empty tree', value: 'None' },
        ]
      : [
          { label: 'Spine 20-10-30-40 (tests)', value: '10(20, 30(40))' },
          { label: 'Star: two children at most', value: '1(2, 3, 4)' },
          { label: 'A negative chain is dropped', value: '1(-6, 2, 3)' },
          { label: 'All negative', value: '-3(-1, -2)' },
          { label: 'Empty tree', value: 'None' },
        ],
    randomInput: () => valid(randomTreeSpec, parseTree),
    parse: parseTree,
    trace: (input) => treeDpTrace(input, mode).frames,
    render: (state) => <TreeDpView state={state} />,
    pseudocode: TREE_CODE[mode],
    legend: mis
      ? [
          { role: 'active', label: 'dfs running on this node: its include / exclude being summed' },
          { role: 'compare', label: 'child whose pair was just returned' },
          { role: 'done', label: 'subtree solved' },
          { role: 'good', label: `the answer; at the end, one optimal set (${SYM.check})` },
          { role: 'muted', label: 'not in the set read back at the end' },
        ]
      : [
          { role: 'active', label: 'dfs running on this node' },
          { role: 'compare', label: 'child whose chain was just returned' },
          { role: 'done', label: 'subtree solved; the edges to best1 and best2' },
          { role: 'good', label: `a new max_sum; at the end, the best path (${SYM.check})` },
          { role: 'muted', label: 'not on the best path' },
          { role: 'bad', label: `empty tree: max_sum stays -inf (${SYM.cross})` },
        ],
    complexity: { time: 'O(n): every node is expanded once', space: 'O(h) recursion stack, h = tree height' },
  };
}

export const treeMisSpec = treeSpec('mis');
export const treePathSpec = treeSpec('path');

/* ---------- DP on graphs ---------- */

function randomDag(): string {
  const n = rint(5, 8);
  const edges = new Set<string>();
  for (let v = 1; v < n; v++) edges.add(`${rint(0, v - 1)}->${v}`);
  for (let k = 0; k < rint(1, 5); k++) {
    const a = rint(0, n - 2);
    const b = rint(a + 1, n - 1);
    edges.add(`${a}->${b}`);
  }
  if (Math.random() < 0.15) edges.add(`${rint(2, n - 1)}->${rint(0, 1)}`);
  return `${[...edges].sort(() => Math.random() - 0.5).join(', ')}; start 0`;
}

export const dagLongestPathSpec: VizSpec<DagInput, GraphState> = {
  id: 'dag-longest-path',
  title: 'DP on a DAG: longest path',
  inputKind: 'dag-dp',
  inputLabel: 'Directed edges and start',
  inputHelp:
    'Directed edges like "0->1", separated by commas, then "; start 0". The edges of a node are tried in the order you write them (graph[u] in the code). ' +
    'A bare name ("3") is a node with no edges; a start that appears nowhere is a node the dictionary does not know. Up to 10 nodes and 20 edges, names of 1 to 3 letters or digits.',
  examples: [
    { label: 'Seven nodes (article)', value: '0->1, 0->2, 0->3, 1->2, 1->4, 2->4, 2->5, 3->5, 4->6, 5->6; start 0' },
    { label: 'Diamond: one node, two parents', value: '0->1, 0->2, 1->3, 2->3; start 0' },
    { label: 'Cycle: ValueError', value: '0->1, 1->2, 2->0; start 0' },
    { label: 'Unreachable cycle is ignored', value: '0->1, 5->6, 6->5; start 0' },
    { label: 'Start is not a key', value: '0->1; start 5' },
  ],
  randomInput: () => valid(randomDag, parseDag),
  parse: parseDag,
  trace: (input) => dagTrace(input).frames,
  render: (state) => <GraphView state={state} />,
  pseudocode: DAG_CODE,
  legend: [
    { role: 'active', label: 'node whose dfs is running; the edge being followed' },
    { role: 'compare', label: 'node on the stack (call not finished); the edge just returned along' },
    { role: 'done', label: 'finished: dp stored (badge); edges already used' },
    { role: 'good', label: `memo hit; at the end, one longest path (${SYM.check})` },
    { role: 'bad', label: `cycle found: ValueError (${SYM.cross})` },
    { role: 'idle', label: 'badge: dp = nodes on the longest path from there; max = max_path while the call runs' },
  ],
  complexity: { time: 'O(V + E) over the nodes reachable from start', space: 'O(V): memo, on_stack and the recursion' },
};

/* ---------- convex hull trick ---------- */

function randomCht(): string {
  const ops: string[] = [];
  let m = rint(2, 6);
  const lines = rint(3, 6);
  for (let i = 0; i < lines; i++) {
    ops.push(`add ${m} ${rint(-12, 15)}`);
    m -= rint(0, 2);
  }
  let x = rint(-4, 0);
  const queries: string[] = [];
  for (let i = 0; i < rint(2, 5); i++) {
    queries.push(`query ${x}`);
    x += rint(1, 3);
  }
  // Interleave a little: a query may come before the last lines.
  const cut = rint(2, ops.length);
  return [...ops.slice(0, cut), ...queries.slice(0, 1), ...ops.slice(cut), ...queries.slice(1)].join(', ');
}

export const convexHullTrickSpec: VizSpec<ChtInput, EnvelopeState> = {
  id: 'convex-hull-trick',
  title: 'Convex Hull Trick (MonotonicCHT)',
  inputKind: 'cht',
  inputLabel: 'Operations',
  inputHelp:
    'Operations separated by commas: "add 2 4" adds the line y = 2x + 4 (add_line(m, b)), "query 3" asks for the smallest y at x = 3 (a and q for short). ' +
    'The class needs slopes in non-increasing order and queries with non-decreasing x; it does not check, and neither does this player, so you can see what breaks. ' +
    'Slopes from -9 to 9, intercepts from -99 to 99, x from -30 to 30; up to 8 lines and 12 queries.',
  examples: [
    { label: 'Four lines, x = 0..6 (article)', value: 'add 3 0, add 2 4, add 1 3, add 0 7, query 0, query 1, query 2, query 3, query 4, query 5, query 6' },
    { label: 'Equal slopes (fixed bug)', value: 'add 2 5, add 2 1, add 2 3, query 0' },
    { label: 'Three lines (tests)', value: 'add 2 5, add 1 3, add -1 7, query 0, query 1, query 2, query 3, query 5, query 10' },
    { label: 'Query before any line', value: 'query 0, add 1 2, query 3' },
    { label: 'x goes down: wrong answer', value: 'add 2 0, add 0 3, query 4, query 0' },
  ],
  randomInput: () => valid(randomCht, parseCht),
  parse: parseCht,
  trace: (input) => stabilizeEnvelope(chtTrace(input).frames),
  render: (state) => <LineEnvelopeView state={state} />,
  pseudocode: CHT_CODE,
  legend: [
    { role: 'active', label: 'the line being added' },
    { role: 'compare', label: 'line it is tested against; the query x' },
    { role: 'done', label: 'broad band: the lower envelope of the lines in the deque' },
    { role: 'good', label: `line kept, or the answer (${SYM.check})` },
    { role: 'bad', label: `line about to be popped, or a broken precondition (${SYM.cross})` },
    { role: 'muted', label: 'line just popped (dashed)' },
  ],
  complexity: { time: 'O(1) amortized per add_line and query: each line is pushed once and popped at most once', space: 'O(n) lines' },
};
