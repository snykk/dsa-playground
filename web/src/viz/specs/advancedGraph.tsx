import { EDMONDS_KARP_CODE, edmondsKarpTrace, parseEdmondsKarp } from '../algorithms/edmondsKarp';
import type { FlowInput } from '../algorithms/flowNetwork';
import { FORD_FULKERSON_CODE, fordFulkersonTrace, parseFordFulkerson } from '../algorithms/fordFulkerson';
import { parseTwoSat, TWO_SAT_CODE, twoSatTrace, type TwoSatInput } from '../algorithms/twoSat';
import type { Example, VizSpec } from '../core/types';
import { stabilizeStrips } from '../renderers/advancedGraphShared';
import { FlowNetworkView, type FlowNetworkState } from '../renderers/FlowNetworkView';
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
