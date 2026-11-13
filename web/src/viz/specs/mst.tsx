import type { Graph } from '../algorithms/graph';
import { kruskal as kruskalTrace, parseMstGraph, prim as primTrace } from '../algorithms/mst';
import type { VizSpec } from '../core/types';
import { GraphView, type GraphState } from '../renderers/GraphView';

const EXAMPLES = [
  { label: 'Classic (CLRS)', value: 'A-B 4, A-H 8, B-C 8, B-H 11, C-D 7, C-F 4, C-I 2, D-E 9, D-F 14, E-F 10, F-G 2, G-H 1, G-I 6, H-I 7; start A' },
  { label: 'Repo test graph', value: 'A-B 10, A-C 6, A-D 5, B-D 15, C-D 4; start A' },
  { label: 'Negative weights', value: 'A-B -2, A-C 7, B-C 3, B-D -5, C-D 1, C-E 4, D-E 6; start A' },
  { label: 'Equal weights', value: 'A-B 1, B-C 1, C-D 1, D-A 1, A-C 2, B-D 2; start A' },
  { label: 'Disconnected', value: 'A-B 3, B-C 1, A-C 2, D-E 4, E-F 2, D-F 5; start A' },
];

/** A random connected graph: a random spanning tree plus a few extra edges, one edge per pair. */
function randomGraph(): string {
  const names = 'ABCDEFGH'.slice(0, 6 + Math.floor(Math.random() * 3)).split('');
  const pairs = new Set<string>();
  for (let i = 1; i < names.length; i++) pairs.add([names[Math.floor(Math.random() * i)], names[i]].sort().join('-'));
  for (let k = 0; k < 4 + Math.floor(Math.random() * 3); k++) {
    const a = names[Math.floor(Math.random() * names.length)];
    const b = names[Math.floor(Math.random() * names.length)];
    if (a !== b) pairs.add([a, b].sort().join('-'));
  }
  return `${[...pairs].map((p) => `${p} ${1 + Math.floor(Math.random() * 15)}`).join(', ')}; start A`;
}

const render = (state: GraphState) => <GraphView state={state} />;

const INPUT = {
  inputKind: 'mst-graph',
  inputLabel: 'Weighted undirected graph',
  inputHelp:
    'Edges like "A-B 4" (negative weights are fine), separated by commas; finish with "; start A" (Prim grows its tree from there, Kruskal ignores it). Up to 12 vertices and 30 edges, one edge per pair.',
  examples: EXAMPLES,
  randomInput: randomGraph,
  parse: (text: string) => parseMstGraph(text),
  render,
};

export const kruskal: VizSpec<Graph, GraphState> = {
  id: 'kruskal',
  title: "Kruskal's Algorithm",
  ...INPUT,
  trace: kruskalTrace,
  pseudocode: [
    'sort edges by weight, lightest first',
    'make every vertex its own set            // union-find',
    'for each edge (u, v, w) in sorted order:',
    '  if find(u) != find(v):                 // different trees: no cycle',
    '    union(u, v); mst.add((u, v, w))',
    '    if |mst| == V - 1: break             // the tree spans every vertex',
    '  else: skip (u, v)                      // it would close a cycle',
  ],
  legend: [
    { role: 'compare', label: 'edge being examined' },
    { role: 'active', label: 'its endpoints' },
    { role: 'good', label: 'different trees: add' },
    { role: 'bad', label: 'same tree: skip' },
    { role: 'done', label: 'tree edges' },
    { role: 'muted', label: 'skipped (cycle)' },
    { role: 'idle', label: 'not examined yet' },
  ],
  complexity: { time: 'O(E log E) for sorting; union-find adds O(E alpha(V))', space: 'O(V + E)' },
};

export const prim: VizSpec<Graph, GraphState> = {
  id: 'prim',
  title: "Prim's Algorithm",
  ...INPUT,
  trace: primTrace,
  pseudocode: [
    'heap = [(0, s, s)]; visited = {}; mst = []',
    'while heap and |visited| < V:',
    '  (w, u, v) = heap.pop_min()',
    '  if v in visited: continue              // stale entry (lazy deletion)',
    '  visited.add(v); if u != v: mst.add((u, v, w))',
    '  for each edge (v, x, w2):',
    '    if x not in visited: heap.push((w2, v, x))',
  ],
  legend: [
    { role: 'active', label: 'joining vertex / popped edge' },
    { role: 'compare', label: 'queued: edges crossing the cut' },
    { role: 'done', label: 'tree' },
    { role: 'muted', label: 'stale or inside the tree' },
    { role: 'bad', label: 'stale entry popped' },
    { role: 'idle', label: 'not reached yet' },
  ],
  complexity: { time: 'O(E log V) with a binary heap (lazy: up to E entries)', space: 'O(V + E)' },
};
