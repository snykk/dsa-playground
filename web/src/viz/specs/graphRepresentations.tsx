import { parseRep, REP_CODE, REP_LIMITS, repTrace, type RepInput, type RepMode } from '../algorithms/graphRepresentations';
import type { Example, VizSpec } from '../core/types';
import { GraphRepresentationView, stabilizeGraphRep, type GraphRepState } from '../renderers/GraphRepresentationView';
import { SYM } from '../ui/symbols';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

/** Draw random scripts until one passes the parser's limits. */
function valid(make: () => string, parse: (text: string) => unknown): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const text = make();
    try {
      parse(text);
      return text;
    } catch {
      // too many vertices or edges: draw again
    }
  }
  return make();
}

function randomScript(kind: 'shared' | 'graph' | 'weighted'): string {
  const head: string[] = [];
  if (Math.random() < 0.4) head.push('directed');
  if (kind === 'shared' && Math.random() < 0.5) head.push('weighted');
  const n = rint(3, 5);
  if (kind === 'shared') head.push(`n ${n}`);
  const ops: string[] = [];
  const count = rint(5, 10);
  const weight = () => (kind === 'graph' ? '' : pick(['', '', ' 2', ' 5', ' 1.5', ' 0', ' -1']));
  for (let i = 0; i < count; i++) {
    const u = rint(0, n - 1);
    const v = rint(0, n - 1);
    const r = Math.random();
    if (r < 0.55 || i < 2) ops.push(`add ${u} ${v}${weight()}`);
    else if (r < 0.68) ops.push(`remove ${u} ${v}`);
    else if (r < 0.8) ops.push(`has ${u} ${v}`);
    else if (r < 0.9) ops.push(`neighbors ${u}`);
    else ops.push(kind === 'weighted' ? 'total' : kind === 'graph' ? `degree ${u}` : `weight ${u} ${v}`);
  }
  return `${head.length ? `${head.join(' ')}; ` : ''}${ops.join(', ')}`;
}

const SHARED_HELP =
  'The adjacency list, matrix and edge list tabs share this script, so switch tabs to see the same graph stored three ways. Start with any of "directed" (default undirected), "weighted" (default unweighted) and "n 4" ' +
  '(num_vertices: AdjacencyList adds vertices 0..n-1 up front, AdjacencyMatrix needs it and otherwise takes the largest vertex + 1, EdgeList takes none). ' +
  `Then operations separated by commas: "add 0 1" (or "0-1"), "add 0 1 2.5" (or "0-1:2.5"), "remove 0 1", "has 0 1", "neighbors 0", "weight 0 1", "degree 0", "vertex 5", "count". ` +
  `Vertices 0 to ${REP_LIMITS.maxVertex}, at most ${REP_LIMITS.maxVertices} of them and ${REP_LIMITS.maxEdges} edges; weights -99 to 99 with one decimal. A method the class lacks raises AttributeError, as in Python.`;

const SHARED_EXAMPLES: Example[] = [
  { label: 'One graph, three layouts', value: 'n 4; add 0 1, add 0 2, add 1 2, add 2 3, has 1 0, neighbors 2, remove 0 2, has 2 0' },
  { label: 'Directed and weighted', value: 'directed weighted; n 4; add 0 1 4, add 1 2 2.5, add 2 0 1, add 0 1 7, weight 0 1, weight 1 0, neighbors 1' },
  { label: 'Self-loop and zero weight', value: 'weighted; n 3; add 0 1 0, add 1 1 3, add 1 2 -1, has 0 1, weight 0 1, remove 1 1' },
  { label: 'A repeated edge is replaced', value: 'n 3; add 0 1, add 0 2, add 0 1, neighbors 0, remove 2 0, neighbors 0' },
];

const LEGEND = [
  { role: 'compare' as const, label: 'entry or cell being read' },
  { role: 'active' as const, label: 'entry or cell just written, edge just added' },
  { role: 'done' as const, label: 'matrix: present[u][v] is True; neighbors returned' },
  { role: 'good' as const, label: `found (${SYM.check})` },
  { role: 'bad' as const, label: `not found, removed or raised (${SYM.cross})` },
  { role: 'muted' as const, label: 'already read, skipped as a duplicate, or an empty list []' },
];

interface Meta {
  id: string;
  title: string;
  inputKind: string;
  help: string;
  examples: Example[];
  random: () => string;
  complexity: { time: string; space: string };
}

function repSpec(mode: RepMode, meta: Meta): VizSpec<RepInput, GraphRepState> {
  const parse = (text: string) => parseRep(text, mode);
  return {
    id: meta.id,
    title: meta.title,
    inputKind: meta.inputKind,
    inputLabel: 'Graph and operations',
    inputHelp: meta.help,
    examples: meta.examples,
    randomInput: () => valid(meta.random, parse),
    parse,
    trace: (input) => stabilizeGraphRep(repTrace(input).frames),
    render: (state) => <GraphRepresentationView state={state} />,
    pseudocode: REP_CODE[mode],
    legend: LEGEND,
    complexity: meta.complexity,
  };
}

export const adjacencyListSpec = repSpec('list', {
  id: 'adjacency-list',
  title: 'Adjacency List',
  inputKind: 'graph-rep',
  help: SHARED_HELP,
  examples: [...SHARED_EXAMPLES, { label: 'Directed degree: out + in', value: 'directed; add 0 1, add 1 0, add 2 1, add 1 1, degree 1, degree 0' }],
  random: () => randomScript('shared'),
  complexity: { time: 'add, remove and has_edge O(deg(u)); neighbors O(deg(v)); directed degree O(V + E)', space: 'O(V + E)' },
});

export const adjacencyMatrixSpec = repSpec('matrix', {
  id: 'adjacency-matrix',
  title: 'Adjacency Matrix',
  inputKind: 'graph-rep',
  help: SHARED_HELP,
  examples: [...SHARED_EXAMPLES, { label: 'Out of range: ValueError', value: 'n 3; add 0 1, add 2 5, has 2 5, remove 0 9, neighbors 2' }],
  random: () => randomScript('shared'),
  complexity: { time: 'add, remove, has_edge and get_weight O(1); neighbors and degree O(V)', space: 'O(V^2)' },
});

export const edgeListSpec = repSpec('edges', {
  id: 'edge-list',
  title: 'Edge List',
  inputKind: 'graph-rep',
  help: SHARED_HELP,
  examples: [...SHARED_EXAMPLES, { label: 'Counting a self-loop', value: 'add 1 2, add 3 3, add 2 3, count, remove 2 1, count' }],
  random: () => randomScript('shared'),
  complexity: { time: 'every operation reads the whole list: O(E)', space: 'O(E)' },
});

export const directedUndirectedSpec = repSpec('graph', {
  id: 'directed-undirected',
  title: 'Directed and Undirected Graphs',
  inputKind: 'graph-directed',
  help:
    'Start with "directed" or "undirected" (the default), then operations separated by commas: "add 0 1" (or "0-1"), "remove 0 1", "has 0 1", "neighbors 0", "degree 0", "vertex 5". ' +
    `Graph stores no weights. Vertices 0 to ${REP_LIMITS.maxVertex}, at most ${REP_LIMITS.maxVertices} of them and ${REP_LIMITS.maxEdges} edges. Change the first word and run the same script again to compare.`,
  examples: [
    { label: 'Undirected: stored twice', value: 'undirected; add 0 1, add 1 2, add 2 0, neighbors 1, has 1 0, degree 1' },
    { label: 'Directed: stored once', value: 'directed; add 0 1, add 1 2, add 2 0, neighbors 1, has 1 0, degree 1' },
    { label: 'Self-loop and a repeat', value: 'add 0 0, add 0 1, add 1 0, neighbors 0, degree 0' },
    { label: 'Remove one direction', value: 'directed; add 0 1, add 1 0, remove 0 1, has 0 1, has 1 0' },
    { label: 'Isolated vertex', value: 'vertex 5, add 0 1, neighbors 5, degree 5, has 5 0' },
  ],
  random: () => randomScript('graph'),
  complexity: { time: 'add, remove and has_edge O(deg(u)); directed degree O(V + E)', space: 'O(V + E)' },
});

export const weightedUnweightedSpec = repSpec('weighted', {
  id: 'weighted-unweighted',
  title: 'Weighted and Unweighted Graphs',
  inputKind: 'graph-weighted',
  help:
    'Start with "directed" or "undirected" (the default), then operations separated by commas: "add 0 1 2.5" (or "0-1:2.5"), "add 0 1" (weight 1.0), "remove 0 1", "has 0 1", "weight 0 1", "neighbors 0", "total". ' +
    `Weights -99 to 99 with one decimal; vertices 0 to ${REP_LIMITS.maxVertex}, at most ${REP_LIMITS.maxVertices} of them and ${REP_LIMITS.maxEdges} edges.`,
  examples: [
    { label: 'Weights and the 1.0 default', value: 'add 0 1 4, add 1 2 2.5, add 0 2, weight 0 2, weight 1 0, total' },
    { label: 'Unweighted: every weight 1.0', value: 'add 0 1, add 1 2, add 2 3, add 3 0, total, weight 2 3' },
    { label: 'Replace a weight', value: 'add 0 1 4, add 0 2 3, add 0 1 1, weight 1 0, neighbors 0, total' },
    { label: 'Directed: a weight per direction', value: 'directed; add 0 1 3, add 1 0 5, weight 0 1, weight 1 0, total' },
    { label: 'Zero, negative and 0.1 + 0.2', value: 'add 0 1 0, add 1 2 -2, add 2 0 0.1, add 0 3 0.2, total, has 0 1' },
  ],
  random: () => randomScript('weighted'),
  complexity: { time: 'add, remove, has_edge and get_weight O(deg(u)); total weight O(V + E)', space: 'O(V + E)' },
});
