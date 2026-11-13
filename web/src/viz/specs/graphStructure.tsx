import type { Role, VizSpec } from '../core/types';
import type { Graph } from '../algorithms/graph';
import {
  bridgesAndCutVertices,
  kosaraju as kosarajuTrace,
  parseDigraph,
  parseUndirected,
  tarjanScc as tarjanTrace,
  topologicalSort,
} from '../algorithms/graphStructure';
import { GraphView, type GraphState } from '../renderers/GraphView';

const render = (state: GraphState) => <GraphView state={state} />;
const names = 'ABCDEFGH';

function pick<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

/** Random DAG (edges only go forward in a shuffled order); `back` extra edges may close cycles. */
function randomDigraph(back: number): string {
  const n = 5 + Math.floor(Math.random() * 4);
  const order = names.slice(0, n).split('').sort(() => Math.random() - 0.5);
  const pairs = new Set<string>();
  for (let k = 0; k < n + 2; k++) {
    const i = Math.floor(Math.random() * (n - 1));
    const j = i + 1 + Math.floor(Math.random() * (n - 1 - i));
    pairs.add(`${order[i]}->${order[j]}`);
  }
  for (let k = 0; k < back; k++) {
    const j = 1 + Math.floor(Math.random() * (n - 1));
    const i = Math.floor(Math.random() * j);
    pairs.add(`${order[j]}->${order[i]}`);
  }
  return [...pairs].join(', ');
}

function randomUndirected(): string {
  const n = 5 + Math.floor(Math.random() * 4);
  const pairs = new Set<string>();
  // A random tree has only bridges; a few extra edges close cycles and remove some of them.
  for (let i = 1; i < n; i++) pairs.add(`${names[Math.floor(Math.random() * i)]}-${names[i]}`);
  for (let k = 0; k < 2 + Math.floor(Math.random() * 2); k++) {
    const a = pick(names.slice(0, n).split(''));
    const b = pick(names.slice(0, n).split(''));
    if (a !== b) pairs.add([a, b].sort().join('-'));
  }
  return [...pairs].join(', ');
}

const DIGRAPH_HELP = 'Directed edges like "A->B" (A must come before B), separated by commas. Up to 12 vertices and 30 edges.';

export const topologicalSortSpec: VizSpec<Graph, GraphState> = {
  id: 'topological-sort',
  title: 'Topological Sort (Kahn)',
  inputKind: 'digraph',
  inputLabel: 'Directed edges',
  inputHelp: DIGRAPH_HELP,
  examples: [
    { label: 'Diamond', value: 'A->B, A->C, B->D, C->D' },
    { label: 'Build steps', value: 'A->C, B->C, C->D, B->E, E->D, D->F' },
    { label: 'Cycle', value: 'A->B, B->C, C->A' },
    { label: 'Cycle with a tail', value: 'A->B, B->C, C->B, C->D' },
    { label: 'Two sources', value: 'A->D, B->D, B->E, C->E' },
  ],
  randomInput: () => randomDigraph(Math.random() < 0.3 ? 1 : 0),
  parse: parseDigraph,
  trace: (g) => topologicalSort(g).frames,
  render,
  pseudocode: [
    'in[v] = number of edges into v, for every vertex v',
    'queue = every vertex with in[v] == 0',
    'order = []',
    'while queue is not empty:',
    '  u = queue.dequeue(); order.append(u)',
    '  for each edge u -> v:',
    '    in[v] -= 1                      // u is placed, remove its edge',
    '    if in[v] == 0: queue.enqueue(v)',
    'if len(order) < V: return None     // the rest wait on a cycle',
    'return order',
  ],
  legend: [
    { role: 'compare', label: 'ready: in-degree 0, waiting in the queue' },
    { role: 'active', label: 'being placed now' },
    { role: 'done', label: 'placed (badge #k = position)' },
    { role: 'bad', label: 'stuck: on or behind a cycle' },
    { role: 'idle', label: 'still waiting (badge in=k)' },
  ],
  complexity: { time: 'O(V + E)', space: 'O(V)' },
};

const SCC_LEGEND: Array<{ role: Role; label: string }> = [
  { role: 'active', label: 'current vertex' },
  { role: 'compare', label: 'on the stack / waiting to finish' },
  { role: 'done', label: 'finished or assigned to a component' },
  { role: 'idle', label: 'not reached yet' },
];

const SCC_EXAMPLES = [
  { label: 'Two cycles joined', value: 'A->B, B->C, C->A, B->D, D->E, E->F, F->D' },
  { label: 'CLRS figure 22.9', value: 'A->B, B->C, B->E, B->F, C->D, C->G, D->C, D->H, E->A, E->F, F->G, G->F, G->H' },
  { label: 'Chain (all singletons)', value: 'A->B, B->C, C->D' },
  { label: 'One big cycle', value: 'A->B, B->C, C->D, D->A' },
  { label: 'Sink only reached as a neighbor', value: 'A->B, B->A, B->C' },
];

export const kosarajuSpec: VizSpec<Graph, GraphState> = {
  id: 'kosaraju',
  title: "Kosaraju's SCC Algorithm",
  inputKind: 'digraph',
  inputLabel: 'Directed edges',
  inputHelp: 'Directed edges like "A->B", separated by commas. Up to 12 vertices and 30 edges.',
  examples: SCC_EXAMPLES,
  randomInput: () => randomDigraph(2),
  parse: parseDigraph,
  trace: (g) => kosarajuTrace(g).frames,
  render,
  pseudocode: [
    'visited = {}; finish = []                  // pass 1 on G',
    'for each vertex s in name order: if s not visited: dfs1(s)',
    'dfs1(u): mark u visited; for each edge u -> v: if v not visited: dfs1(v)',
    '  edge to an already visited v: skip it',
    '  all edges of u explored: finish.push(u)',
    'comp = {}; count = 0                       // pass 2 on G^T',
    'G^T = reverse every edge of G',
    'for s in finish, latest first: if s has no component: count += 1; comp[s] = count; dfs2(s)',
    '  // s already has a component: skip. Otherwise the dfs2 tree is one SCC',
    'dfs2(u): for each edge u -> v in G^T: if v has no component: comp[v] = count; dfs2(v)',
    '  v already has a component: skip it',
  ],
  legend: SCC_LEGEND,
  complexity: { time: 'O(V + E)', space: 'O(V + E) for the transpose' },
};

export const tarjanSccSpec: VizSpec<Graph, GraphState> = {
  id: 'tarjan-scc',
  title: "Tarjan's SCC Algorithm",
  inputKind: 'digraph',
  inputLabel: 'Directed edges',
  inputHelp: 'Directed edges like "A->B", separated by commas. Up to 12 vertices and 30 edges.',
  examples: SCC_EXAMPLES,
  randomInput: () => randomDigraph(2),
  parse: parseDigraph,
  trace: (g) => tarjanTrace(g).frames,
  render,
  pseudocode: [
    'index = 0; stack = []',
    'strongconnect(u): disc[u] = low[u] = index++; stack.push(u)',
    '  for each edge u -> v:',
    '    // classify the edge',
    '    if v not discovered: strongconnect(v)        // tree edge',
    '      low[u] = min(low[u], low[v])',
    '    else if v not on the stack: ignore            // finished component',
    '    else: low[u] = min(low[u], disc[v])           // edge back into the stack',
    '  if low[u] < disc[u]: leave u on the stack       // belongs to an earlier root',
    '  if low[u] == disc[u]: pop the stack down to u   // one SCC',
    'for each vertex s not discovered: strongconnect(s)',
  ],
  legend: SCC_LEGEND,
  complexity: { time: 'O(V + E)', space: 'O(V)' },
};

export const bridgesSpec: VizSpec<Graph, GraphState> = {
  id: 'bridges-articulation',
  title: 'Bridges and Articulation Points',
  inputKind: 'undirected-graph',
  inputLabel: 'Undirected edges',
  inputHelp: 'Undirected edges like "A-B", separated by commas; repeat an edge ("A-B, A-B") for a parallel edge. Up to 12 vertices and 30 edges.',
  examples: [
    { label: 'Triangle with a tail', value: 'A-B, B-C, C-A, C-D' },
    { label: 'Two triangles joined', value: 'A-B, B-C, C-A, C-D, D-E, E-F, F-D' },
    { label: 'Path (every edge a bridge)', value: 'A-B, B-C, C-D, D-E' },
    { label: 'Doubled edge', value: 'A-B, A-B, B-C' },
    { label: 'Cycle (nothing to find)', value: 'A-B, B-C, C-D, D-A' },
  ],
  randomInput: randomUndirected,
  parse: parseUndirected,
  trace: (g) => bridgesAndCutVertices(g).frames,
  render,
  pseudocode: [
    'timer = 0',
    'dfs(u, parentEdge): disc[u] = low[u] = timer++',
    '  for each edge e = (u, v):',
    '    if e is parentEdge: continue          // skip by edge id, not by vertex',
    '    if v not discovered: dfs(v, e); children += 1    // tree edge',
    '      low[u] = min(low[u], low[v])',
    '      if low[v] > disc[u]: e is a bridge',
    '      if low[v] >= disc[u] and u is not the root: u is a cut vertex',
    '    else: low[u] = min(low[u], disc[v])    // back edge',
    '  if u is the root and children >= 2: u is a cut vertex',
    'for each vertex s not discovered: dfs(s, none)',
  ],
  legend: [
    { role: 'active', label: 'current vertex; bridge once found' },
    { role: 'compare', label: 'edge or vertex being examined' },
    { role: 'done', label: 'finished; DFS tree edges' },
    { role: 'bad', label: 'cut vertex (articulation point)' },
    { role: 'idle', label: 'not reached yet' },
  ],
  complexity: { time: 'O(V + E)', space: 'O(V + E)' },
};
