import {
  HOPCROFT_KARP_CODE,
  hopcroftKarpTrace,
  KUHN_CODE,
  kuhnTrace,
  parseMatching,
  type MatchingInput,
} from '../algorithms/bipartiteMatching';
import { DINIC_CODE, dinicTrace, parseDinic } from '../algorithms/dinic';
import { EDMONDS_KARP_CODE, edmondsKarpTrace, parseEdmondsKarp } from '../algorithms/edmondsKarp';
import { EULER_CODE, eulerTrace, parseEuler, type EulerInput } from '../algorithms/eulerianPath';
import type { FlowInput } from '../algorithms/flowNetwork';
import { FORD_FULKERSON_CODE, fordFulkersonTrace, parseFordFulkerson } from '../algorithms/fordFulkerson';
import { parseTwoSat, TWO_SAT_CODE, twoSatTrace, type TwoSatInput } from '../algorithms/twoSat';
import type { Example, VizSpec } from '../core/types';
import { stabilizeStrips } from '../renderers/advancedGraphShared';
import { FlowNetworkView, type FlowNetworkState } from '../renderers/FlowNetworkView';
import { GraphView, type GraphState } from '../renderers/GraphView';
import { ImplicationGraphView, type ImplicationState } from '../renderers/ImplicationGraphView';
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
      // too many steps: draw again
    }
  }
  return make();
}

// ---------------------------------------------------------------- network flow

const FLOW_EXAMPLES: Example[] = [
  {
    label: 'Classic (CLRS)',
    value: '0->1 16, 0->2 13, 1->2 10, 1->3 12, 2->1 4, 2->4 14, 3->2 9, 3->5 20, 4->3 7, 4->5 4; source 0, sink 5',
  },
  { label: 'Cross edge undone', value: '0->1 10, 0->2 10, 1->2 1, 1->3 10, 2->3 10; source 0, sink 3' },
  { label: 'Anti-parallel edges', value: '0->1 4, 1->0 6, 1->2 5; source 0, sink 2' },
  { label: 'Zero-capacity edge', value: '0->1 0, 0->2 3, 1->3 9, 2->3 9; source 0, sink 3' },
  { label: 'Unreachable sink', value: '0->1 5, 2->3 5; source 0, sink 3' },
];

/** A random layered network from 0 to the last vertex, with a few cross and backward edges. */
function randomNetwork(): string {
  const n = rint(4, 7);
  const t = n - 1;
  const pairs = new Map<string, number>();
  const add = (u: number, v: number) => {
    if (u !== v && !pairs.has(`${u}->${v}`) && pairs.size < 14) pairs.set(`${u}->${v}`, rint(1, 15));
  };
  for (let v = 1; v < t; v++) add(rint(0, v - 1), v);
  for (let v = 1; v < t; v++) if (Math.random() < 0.8) add(v, rint(v + 1, t));
  for (let k = 0; k < rint(1, 4); k++) add(rint(0, t - 1), rint(1, t));
  if (Math.random() < 0.5) add(rint(1, t - 1), rint(1, t - 1));
  return `${[...pairs].map(([e, c]) => `${e} ${c}`).join(', ')}; source 0, sink ${t}`;
}

const FLOW_HELP =
  'Directed edges "u->v capacity", separated by commas (capacities 0 to 99; 1 if left out), then "source 0, sink 5" ' +
  '(without them, the first and the last vertex named). The edges become the dict {u: {v: capacity}} in the order you write them, ' +
  'and the search tries them in that order. Up to 8 vertices and 16 edges.';

const renderFlow = (state: FlowNetworkState) => <FlowNetworkView state={state} />;

export const fordFulkersonSpec: VizSpec<FlowInput, FlowNetworkState> = {
  id: 'ford-fulkerson',
  title: 'Ford-Fulkerson (DFS)',
  inputKind: 'flow-network',
  inputLabel: 'Flow network',
  inputHelp: FLOW_HELP,
  examples: FLOW_EXAMPLES,
  randomInput: () => valid(randomNetwork, parseFordFulkerson),
  parse: parseFordFulkerson,
  trace: (input) => stabilizeStrips(fordFulkersonTrace(input).frames),
  render: renderFlow,
  pseudocode: FORD_FULKERSON_CODE,
  legend: [
    { role: 'active', label: 'current vertex; the augmenting path' },
    { role: 'compare', label: 'on the DFS stack; edges of the cut back into S' },
    { role: 'done', label: 'flow filling a pipe; edge just pushed; source side S' },
    { role: 'muted', label: 'dead end, popped from the stack' },
    { role: 'idle', label: 'not reached in this search; dashed: residual reverse edge' },
  ],
  complexity: { time: 'O(E f) for integer capacities (f = max flow)', space: 'O(V + E)' },
};

export const edmondsKarpSpec: VizSpec<FlowInput, FlowNetworkState> = {
  id: 'edmonds-karp',
  title: 'Edmonds-Karp (BFS)',
  inputKind: 'flow-network',
  inputLabel: 'Flow network',
  inputHelp: FLOW_HELP,
  examples: FLOW_EXAMPLES,
  randomInput: () => valid(randomNetwork, parseEdmondsKarp),
  parse: parseEdmondsKarp,
  trace: (input) => stabilizeStrips(edmondsKarpTrace(input).frames),
  render: renderFlow,
  pseudocode: EDMONDS_KARP_CODE,
  legend: [
    { role: 'active', label: 'vertex being dequeued; the augmenting path' },
    { role: 'compare', label: 'waiting in the queue; BFS tree edges' },
    { role: 'done', label: 'dequeued; flow filling a pipe; source side S' },
    { role: 'idle', label: 'not reached in this BFS (badge d = layer); dashed: residual reverse edge' },
  ],
  complexity: { time: 'O(V E^2)', space: 'O(V + E)' },
};

const DINIC_EXAMPLES: Example[] = [
  FLOW_EXAMPLES[0],
  { label: 'Dead ends passed once', value: '0->1 2, 1->2 1, 1->3 1, 1->4 1, 1->5 1, 4->6 1, 5->6 1; source 0, sink 6' },
  {
    label: 'Matching as flow',
    value: '0->1 1, 0->2 1, 0->3 1, 1->4 1, 1->5 1, 2->4 1, 3->5 1, 3->6 1, 4->7 1, 5->7 1, 6->7 1; source 0, sink 7',
  },
  { label: 'Cross edge left out', value: '0->1 10, 0->2 10, 1->2 1, 1->3 10, 2->3 10; source 0, sink 3' },
  { label: 'Anti-parallel edges', value: '0->1 4, 1->0 6, 1->2 5; source 0, sink 2' },
  { label: 'Unreachable sink', value: '0->1 5, 2->3 5; source 0, sink 3' },
];

const DINIC_HELP =
  'Directed edges "u->v capacity", separated by commas (capacities 0 to 99; 1 if left out), then "source 0, sink 5" ' +
  '(without them, the first and the last vertex named). Every search tries the residual entries of a vertex in increasing order of the ' +
  'neighbour, as sorted() orders the dict keys: by value when every name is a number, otherwise by character code (digits, then capitals, ' +
  'then small letters). Up to 8 vertices and 16 edges.';

export const dinicSpec: VizSpec<FlowInput, FlowNetworkState> = {
  id: 'dinic',
  title: "Dinic's algorithm (blocking flows)",
  inputKind: 'flow-network',
  inputLabel: 'Flow network',
  inputHelp: DINIC_HELP,
  examples: DINIC_EXAMPLES,
  randomInput: () => valid(randomNetwork, parseDinic),
  parse: parseDinic,
  trace: (input) => stabilizeStrips(dinicTrace(input).frames),
  render: renderFlow,
  pseudocode: DINIC_CODE,
  legend: [
    { role: 'active', label: 'vertex being dequeued or searched from; the DFS path' },
    { role: 'compare', label: 'waiting in the BFS queue; on the DFS path; the level graph of a new phase' },
    { role: 'done', label: 'dequeued; flow filling a pipe; edge just pushed; source side S' },
    { role: 'muted', label: 'dead end for the phase; entry outside the level graph or behind a current arc' },
    { role: 'idle', label: 'badge lv = level; dashed: residual reverse edge' },
  ],
  complexity: { time: 'O(V^2 E); O(E sqrt(V)) on unit networks', space: 'O(V + E)' },
};

// ---------------------------------------------------------------- 2-SAT

const SAT_EXAMPLES: Example[] = [
  { label: 'Textbook (satisfiable)', value: 'x0 or x1, not x0 or x1, not x0 or not x1' },
  { label: 'Unsatisfiable', value: 'x0 or x1, x0 or not x1, not x0 or x1, not x0 or not x1' },
  { label: 'Implication chain', value: 'x0 -> x1, x1 -> x2, x2 -> x3, x0' },
  { label: 'Contradiction via a chain', value: 'x0 -> x1, x1 -> not x0, x0' },
  { label: 'Tautology and a forced literal', value: 'x0 or not x0, x1 or x2, not x2' },
];

function randomFormula(): string {
  const n = rint(2, 5);
  const lit = () => `${Math.random() < 0.5 ? 'not ' : ''}x${rint(0, n - 1)}`;
  return Array.from({ length: rint(2, Math.min(8, 2 * n)) }, () => `${lit()} or ${lit()}`).join(', ');
}

export const twoSatSpec: VizSpec<TwoSatInput, ImplicationState> = {
  id: 'two-sat',
  title: '2-SAT (implication graph + Tarjan)',
  inputKind: 'two-sat',
  inputLabel: 'Clauses',
  inputHelp:
    'Clauses separated by commas: "x0 or not x1" (also "~x1", "!x1", "|"), "x0 -> x1" for implies, a lone literal such as "x2" for force_true. ' +
    'Variables x0 to x5; n is one more than the largest one used, or set it with "n 4". A literal past n raises IndexError, as in Python. Up to 16 clauses.',
  examples: SAT_EXAMPLES,
  randomInput: () => valid(randomFormula, parseTwoSat),
  parse: parseTwoSat,
  trace: (input) => stabilizeStrips(twoSatTrace(input).frames),
  render: (state) => <ImplicationGraphView state={state} />,
  pseudocode: TWO_SAT_CODE,
  legend: [
    { role: 'active', label: 'current literal; new edges; the x ~> ~x ~> x cycle' },
    { role: 'compare', label: 'on the Tarjan stack; edge or clause being checked' },
    { role: 'done', label: 'in a finished component (badge C = comp id); tree edges' },
    { role: 'good', label: `true literal, clause that holds (${SYM.check})` },
    { role: 'bad', label: `x and ~x in one component, or IndexError (${SYM.cross})` },
    { role: 'muted', label: 'false literal; edge that changed nothing' },
  ],
  complexity: { time: 'O(n + m)', space: 'O(n + m)' },
};

// ---------------------------------------------------------------- bipartite matching

const MATCHING_EXAMPLES: Example[] = [
  { label: 'Worked example', value: '0-1, 0-2, 0-3, 1-0, 1-1, 2-0, 3-1' },
  { label: 'One long augmenting path', value: '0-0, 0-1, 1-1, 1-2, 2-2, 2-3, 3-0' },
  { label: 'Two paths in one phase', value: '0-1, 0-2, 1-0, 1-3, 2-0, 3-1' },
  { label: 'Complete K3,3', value: '0-0, 0-1, 0-2, 1-0, 1-1, 1-2, 2-0, 2-1, 2-2' },
  { label: 'A vertex with no edge', value: '0-0, 1-0, 2-0, 2-1; left 4, right 3' },
];

/** 3 to 6 vertices a side, each left vertex with 1 to 3 distinct neighbours, the edges in random order. */
function randomBipartite(): string {
  const nLeft = rint(3, 6);
  const nRight = rint(3, 6);
  const edges: string[] = [];
  for (let u = 0; u < nLeft; u++) {
    const picks = new Set<number>();
    for (let k = rint(1, 3); k > 0; k--) picks.add(rint(0, nRight - 1));
    for (const v of picks) edges.push(`${u}-${v}`);
  }
  for (let i = edges.length - 1; i > 0; i--) {
    const j = rint(0, i);
    [edges[i], edges[j]] = [edges[j], edges[i]];
  }
  return `${edges.slice(0, 18).join(', ')}; left ${nLeft}, right ${nRight}`;
}

const MATCHING_HELP =
  'Edges "left-right" separated by commas, like "0-1" or "L0-R1": left vertex first, then right vertex, each numbered from 0. ' +
  'Add "left 4, right 3" for vertices without an edge. adj[u] keeps the edges in the order you write them, and every search tries them in that order. ' +
  'Up to 7 vertices a side and 20 edges.';

const renderMatching = (state: GraphState) => <GraphView state={state} />;

export const kuhnSpec: VizSpec<MatchingInput, GraphState> = {
  id: 'kuhn-matching',
  title: "Kuhn's algorithm (DFS)",
  inputKind: 'bipartite-graph',
  inputLabel: 'Bipartite graph',
  inputHelp: MATCHING_HELP,
  examples: MATCHING_EXAMPLES,
  randomInput: randomBipartite,
  parse: parseMatching,
  trace: (input) => kuhnTrace(input).frames,
  render: renderMatching,
  pseudocode: KUHN_CODE,
  legend: [
    { role: 'active', label: 'current left vertex; an augmenting path, and the edges that enter the matching' },
    { role: 'compare', label: 'on the search path: left vertices on the stack, right vertices tried, edges walked' },
    { role: 'done', label: 'matched vertex; matching edge' },
    { role: 'muted', label: 'given up in this search' },
    { role: 'idle', label: 'free vertex; edge outside the matching' },
  ],
  complexity: { time: 'O(V E)', space: 'O(V + E)' },
};

export const hopcroftKarpSpec: VizSpec<MatchingInput, GraphState> = {
  id: 'hopcroft-karp',
  title: 'Hopcroft-Karp (BFS layers + DFS)',
  inputKind: 'bipartite-graph',
  inputLabel: 'Bipartite graph',
  inputHelp: MATCHING_HELP,
  examples: MATCHING_EXAMPLES,
  randomInput: randomBipartite,
  parse: parseMatching,
  trace: (input) => hopcroftKarpTrace(input).frames,
  render: renderMatching,
  pseudocode: HOPCROFT_KARP_CODE,
  legend: [
    { role: 'active', label: 'vertex being dequeued or searched from; an augmenting path' },
    { role: 'compare', label: 'waiting in the queue, or on the search path (badge d = layer); the set Z' },
    { role: 'done', label: 'matched vertex; matching edge' },
    { role: 'muted', label: 'dead end: dist -1 for the rest of the phase' },
    { role: 'good', label: `in the minimum vertex cover (${SYM.check})` },
    { role: 'idle', label: 'free vertex; edge outside the matching' },
  ],
  complexity: { time: 'O(E sqrt(V))', space: 'O(V + E)' },
};

// ---------------------------------------------------------------- Eulerian path

const EULER_EXAMPLES: Example[] = [
  { label: 'Splice at the start', value: '0-3, 0-1, 1-2, 2-0, 3-4, 4-5, 5-3' },
  { label: 'Directed detour', value: '0->1, 1->4, 1->2, 2->3, 3->1' },
  { label: 'House in one stroke', value: '0-1, 1-2, 2-3, 3-0, 0-2, 1-3, 2-4, 3-4' },
  { label: 'Weakly connected only', value: '0->1, 1->2, 2->0, 2->3' },
  { label: 'Four odd vertices', value: '0-1, 0-2, 0-3, 1-2, 1-3, 2-3' },
  { label: 'Two components', value: '0-1, 1-2, 2-0, 3-4, 4-5, 5-3; n 7' },
];

/** A random walk on 4 to 7 vertices without loops or repeated pairs, closed half the time; now and then one more edge, which may spoil it. */
function randomEulerGraph(): string {
  const n = rint(4, 7);
  const directed = Math.random() < 0.5;
  const arrow = directed ? '->' : '-';
  const seen = new Set<string>();
  const edges: string[] = [];
  const add = (u: number, v: number) => {
    const key = directed ? `${u}->${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (u === v || seen.has(key)) return false;
    seen.add(key);
    edges.push(`${u}${arrow}${v}`);
    return true;
  };
  const first = rint(0, n - 1);
  let v = first;
  for (let step = rint(5, 11); step > 0; step--) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const w = rint(0, n - 1);
      if (add(v, w)) {
        v = w;
        break;
      }
    }
  }
  if (Math.random() < 0.5) add(v, first);
  if (Math.random() < 0.25) add(rint(0, n - 1), rint(0, n - 1));
  return edges.join(', ');
}

export const hierholzerSpec: VizSpec<EulerInput, GraphState> = {
  id: 'hierholzer',
  title: "Hierholzer's algorithm",
  inputKind: 'euler-graph',
  inputLabel: 'Edges',
  inputHelp:
    'Undirected edges "0-1" or directed edges "0->1", separated by commas, all of one kind. Vertices are numbered 0 to 7; add "n 6" for vertices without an edge. ' +
    'adj keeps the edges in the order you write them, and the walk leaves each vertex by its first unused edge. The code also takes loops and parallel edges; the picture does not draw them. ' +
    'Up to 16 edges.',
  examples: EULER_EXAMPLES,
  randomInput: () => valid(randomEulerGraph, parseEuler),
  parse: parseEuler,
  trace: (input) => eulerTrace(input).frames,
  render: (state) => <GraphView state={state} />,
  pseudocode: EULER_CODE,
  legend: [
    { role: 'active', label: 'top of the stack, where the walk is; the edge just taken or just finished' },
    { role: 'compare', label: 'on the stack, with the edges of the walk in progress; an odd or unbalanced vertex' },
    { role: 'done', label: 'finished: an edge in the path, a vertex with no unused edge (badge left = unused edges)' },
    { role: 'good', label: `an end of the finished walk (${SYM.check})` },
    { role: 'bad', label: `a vertex that rules a walk out, or one the walk never reached (${SYM.cross})` },
    { role: 'muted', label: 'no edge: plays no part' },
    { role: 'idle', label: 'unused edge; vertex with unused edges' },
  ],
  complexity: { time: 'O(V + E)', space: 'O(V + E)' },
};
