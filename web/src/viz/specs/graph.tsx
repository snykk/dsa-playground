import { bfs as bfsTrace, dfs as dfsTrace, dijkstra as dijkstraTrace, formatGraph, parseGraph, type Graph } from '../algorithms/graph';
import type { Role, VizSpec } from '../core/types';
import { GraphView, type GraphState } from '../renderers/GraphView';

const UNWEIGHTED = [
  { label: 'Two rings', value: 'A-B, A-C, B-D, C-D, C-E, D-F, E-F, E-G; start A' },
  { label: 'Tree', value: 'A-B, A-C, B-D, B-E, C-F, C-G; start A' },
  { label: 'Directed', value: 'A->B, A->C, B->D, C->D, D->E, E->B; start A' },
  { label: 'Disconnected', value: 'A-B, B-C, D-E; start A' },
];

const WEIGHTED = [
  { label: 'Classic', value: 'A-B 4, A-C 2, B-C 5, B-D 10, C-E 3, E-D 4, D-F 11; start A' },
  { label: 'Detour wins', value: 'S-A 10, S-B 1, B-C 1, C-A 1, A-T 1, C-T 9; start S' },
  { label: 'Directed', value: 'A->B 7, A->C 9, A->F 14, B->C 10, B->D 15, C->D 11, C->F 2, D->E 6, F->E 9; start A' },
  { label: 'Unreachable', value: 'A-B 2, B-C 3, D-E 1; start A' },
];

function randomGraph(weighted: boolean): string {
  const names = 'ABCDEFGH'.slice(0, 6 + Math.floor(Math.random() * 3)).split('');
  const edges = new Set<string>();
  // A random spanning tree keeps it connected, then a few extra edges.
  for (let i = 1; i < names.length; i++) {
    const j = Math.floor(Math.random() * i);
    edges.add([names[j], names[i]].sort().join('-'));
  }
  for (let k = 0; k < 3; k++) {
    const a = names[Math.floor(Math.random() * names.length)];
    const b = names[Math.floor(Math.random() * names.length)];
    if (a !== b) edges.add([a, b].sort().join('-'));
  }
  const list = [...edges].map((e) => (weighted ? `${e} ${1 + Math.floor(Math.random() * 12)}` : e));
  return `${list.join(', ')}; start A`;
}

const LEGEND_TRAVERSAL: Array<{ role: Role; label: string }> = [
  { role: 'active', label: 'current vertex' },
  { role: 'compare', label: 'discovered / waiting' },
  { role: 'done', label: 'finished; tree edges' },
  { role: 'idle', label: 'not reached yet' },
];

const render = (state: GraphState) => <GraphView state={state} />;

export const bfs: VizSpec<Graph, GraphState> = {
  id: 'bfs',
  title: 'Breadth-First Search',
  inputKind: 'graph',
  inputLabel: 'Graph edges',
  inputHelp: 'Edges like "A-B" (undirected) or "A->B" (directed), separated by commas; finish with "; start A". Up to 12 nodes.',
  examples: UNWEIGHTED,
  randomInput: () => randomGraph(false),
  parse: (text) => parseGraph(text),
  trace: bfsTrace,
  render,
  pseudocode: [
    'queue = [s]; visited = {s}; dist[s] = 0',
    'while queue is not empty:',
    '  u = queue.dequeue()',
    '  for each neighbor v of u:',
    '    if v not in visited:',
    '      visited.add(v); dist[v] = dist[u] + 1; queue.enqueue(v)',
    '  // u is finished',
  ],
  legend: LEGEND_TRAVERSAL,
  complexity: { time: 'O(V + E)', space: 'O(V)' },
};

export const dfs: VizSpec<Graph, GraphState> = {
  id: 'dfs',
  title: 'Depth-First Search',
  inputKind: 'graph',
  inputLabel: 'Graph edges',
  inputHelp: bfs.inputHelp,
  examples: UNWEIGHTED,
  randomInput: () => randomGraph(false),
  parse: (text) => parseGraph(text),
  trace: dfsTrace,
  render,
  pseudocode: [
    'dfs(u):',
    '  visited.add(u)                // discover u',
    '  for each neighbor v of u:',
    '    if v not in visited:',
    '      dfs(v)                    // tree edge u-v',
    '  // u is finished: backtrack',
  ],
  legend: [
    { role: 'active', label: 'current vertex' },
    { role: 'compare', label: 'on the call stack' },
    { role: 'done', label: 'finished; tree edges' },
    { role: 'idle', label: 'not reached yet' },
  ],
  complexity: { time: 'O(V + E)', space: 'O(V) call stack' },
};

export const dijkstra: VizSpec<Graph, GraphState> = {
  id: 'dijkstra',
  title: "Dijkstra's Algorithm",
  inputKind: 'weighted-graph',
  inputLabel: 'Weighted graph edges',
  inputHelp: 'Edges like "A-B 4" or "A->B 4" (non-negative weights), separated by commas; finish with "; start A".',
  examples: WEIGHTED,
  randomInput: () => randomGraph(true),
  parse: (text) => parseGraph(text),
  trace: dijkstraTrace,
  render,
  pseudocode: [
    'dist[*] = \u221e; dist[s] = 0; pq = {(0, s)}',
    'while pq is not empty:',
    '  (d, u) = pq.popMin()',
    '  if d > dist[u]: continue        // stale entry',
    '  for each edge (u, v, w):',
    '    if dist[u] + w < dist[v]:',
    '      dist[v] = dist[u] + w; parent[v] = u; pq.push((dist[v], v))',
    '  // u is settled: dist[u] is final',
  ],
  legend: [
    { role: 'active', label: 'vertex being settled' },
    { role: 'compare', label: 'tentative distance / edge' },
    { role: 'done', label: 'settled; shortest-path tree' },
    { role: 'idle', label: 'distance \u221e' },
  ],
  complexity: { time: 'O((V + E) log V) with a binary heap', space: 'O(V + E)' },
};

export { formatGraph };
