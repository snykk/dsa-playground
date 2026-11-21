import { parseGraph, type Graph } from '../algorithms/graph';
import { astar as astarTrace, bellmanFord as bellmanFordTrace, floydWarshall as floydWarshallTrace, parseMap, type AStarMap } from '../algorithms/shortestPaths';
import type { VizSpec } from '../core/types';
import { GraphView, type GraphState } from '../renderers/GraphView';
import { Grid, type GridState } from '../renderers/Grid';
import { GridMap, type GridMapState } from '../renderers/GridMap';

/** Random directed graph on A.. with weights in lo..hi; a spanning chain keeps most vertices reachable. */
function randomDirected(lo: number, hi: number, nodes: number, extra: number): string {
  const names = 'ABCDEFGH'.slice(0, nodes).split('');
  const w = () => lo + Math.floor(Math.random() * (hi - lo + 1));
  const edges = new Set<string>();
  for (let i = 1; i < names.length; i++) edges.add(`${names[Math.floor(Math.random() * i)]}->${names[i]} ${w()}`);
  for (let k = 0; k < extra; k++) {
    const a = names[Math.floor(Math.random() * names.length)];
    const b = names[Math.floor(Math.random() * names.length)];
    if (a !== b) edges.add(`${a}->${b} ${w()}`);
  }
  return `${[...edges].join(', ')}; start A`;
}

export const bellmanFord: VizSpec<Graph, GraphState> = {
  id: 'bellman-ford',
  title: 'Bellman-Ford Algorithm',
  inputKind: 'negative-graph',
  inputLabel: 'Weighted graph edges (negative weights allowed)',
  inputHelp:
    'Edges like "A->B 4" or "A->C -2", separated by commas; finish with "; start A". Up to 8 nodes. A negative undirected edge "A-B -2" is itself a negative cycle (walk back and forth), so use arrows for negative weights.',
  examples: [
    { label: 'Negative edge', value: 'A->B 4, A->C 5, B->C -3, C->D 4, B->D 5; start A' },
    { label: 'Needs later rounds', value: 'D->E -5, C->D 1, B->C 1, A->B 1, A->D 10, A->E 9; start A' },
    { label: 'Negative cycle', value: 'A->B 1, B->C -3, C->B 1, C->D 2; start A' },
    { label: 'Unreachable', value: 'A->B 2, B->C -1, D->E 3; start A' },
  ],
  randomInput: () => randomDirected(-2, 9, 5 + Math.floor(Math.random() * 3), 3),
  parse: (text) => parseGraph(text, { maxNodes: 8, maxEdges: 16 }),
  trace: bellmanFordTrace,
  render: (state) => <GraphView state={state} />,
  pseudocode: [
    'dist[*] = inf; dist[s] = 0',
    'repeat V - 1 times:                  // rounds',
    '  for each edge (u, v, w):',
    '    if dist[u] + w < dist[v]:',
    '      dist[v] = dist[u] + w; parent[v] = u',
    'for each edge (u, v, w):             // extra round',
    '  if dist[u] + w < dist[v]: return "negative cycle"',
  ],
  legend: [
    { role: 'active', label: 'edge ends being relaxed' },
    { role: 'compare', label: 'reached; improved this round' },
    { role: 'done', label: 'final distance; shortest-path tree' },
    { role: 'bad', label: 'on a negative cycle' },
  ],
  complexity: { time: 'O(V * E)', space: 'O(V)' },
};

export const floydWarshall: VizSpec<Graph, GridState> = {
  id: 'floyd-warshall',
  title: 'Floyd-Warshall Algorithm',
  inputKind: 'apsp-graph',
  inputLabel: 'Weighted graph edges',
  inputHelp:
    'Edges like "A->B 3" or "A-B 3", separated by commas (the cheapest of parallel edges is kept). Up to 6 nodes; the table has one row and column per node.',
  examples: [
    { label: 'Textbook', value: 'A->B 3, A->D 7, B->A 8, B->C 2, C->A 5, C->D 1, D->A 2; start A' },
    { label: 'Negative edge', value: 'A->B 4, A->C 5, B->C -3, C->D 4, D->A 1; start A' },
    { label: 'Negative cycle', value: 'A->B 1, B->C -3, C->B 1, C->D 2; start A' },
    { label: 'Undirected', value: 'A-B 2, B-C 3, A-C 7, C-D 1; start A' },
  ],
  randomInput: () => randomDirected(1, 9, 4 + Math.floor(Math.random() * 2), 4),
  parse: (text) => parseGraph(text, { maxNodes: 6, maxEdges: 20 }),
  trace: floydWarshallTrace,
  render: (state) => <Grid state={state} />,
  pseudocode: [
    'dist[i][i] = 0; dist[u][v] = min(weight of u->v); others = inf',
    'for k in vertices:                    // allow k as a stop',
    '  for i in vertices: for j in vertices:',
    '    if dist[i][k] + dist[k][j] < dist[i][j]:',
    '      dist[i][j] = dist[i][k] + dist[k][j]',
    'if any dist[i][i] < 0: return "negative cycle"',
  ],
  legend: [
    { role: 'compare', label: 'row k and column k entries used' },
    { role: 'active', label: 'cell i,j being tested' },
    { role: 'done', label: 'improved this round' },
  ],
  complexity: { time: 'O(V^3)', space: 'O(V^2)' },
};

export const aStar: VizSpec<AStarMap, GridMapState> = {
  id: 'a-star',
  title: 'A* Search',
  inputKind: 'ascii-map',
  inputLabel: 'Map (rows separated by "/")',
  inputHelp:
    '. floor, # wall, 2-9 rough terrain (cost to enter), S start, G goal. Rows separated by "/" (or ";"), all the same length, up to 10 rows by 14 columns. Cells are written (row,col), counting from 0.',
  examples: [
    { label: 'Around a wall', value: 'S..#..../.#.#.##./.#...#../.####.#./......#G' },
    { label: 'Open field', value: 'S......./......../......../.......G' },
    { label: 'Rough terrain', value: 'S.2222../..2222../..2222../.......G' },
    { label: 'No path', value: 'S.#../..#../..#.G' },
  ],
  randomInput: () => {
    const rows = 6;
    const cols = 10;
    const cells: string[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (Math.random() < 0.25 ? '#' : '.')));
    cells[0][0] = 'S';
    cells[rows - 1][cols - 1] = 'G';
    return cells.map((r) => r.join('')).join('/');
  },
  parse: (text) => parseMap(text),
  trace: astarTrace,
  render: (state) => <GridMap state={state} />,
  pseudocode: [
    'open = {(f = h(s), g = 0, s)}; g[s] = 0',
    'while open is not empty:',
    '  (f, g, u) = open.popMin()            // smallest f = g + h',
    '  if u == goal: return g and the parent path',
    '  if g > g[u]: continue                // stale entry',
    '  for each walkable neighbor v of u (step cost w):',
    '    if g + w < g[v]:',
    '      g[v] = g + w; parent[v] = u; open.push((g[v] + h(v), g[v], v))',
  ],
  legend: [
    { role: 'active', label: 'cell being expanded' },
    { role: 'compare', label: 'open set (number = f)' },
    { role: 'muted', label: 'closed (already expanded)' },
    { role: 'done', label: 'final path' },
    { role: 'good', label: 'neighbor improved' },
    { role: 'bad', label: 'neighbor not improved' },
  ],
  complexity: { time: 'O(b^d) worst case; far fewer expansions with a good heuristic', space: 'O(b^d)' },
};
