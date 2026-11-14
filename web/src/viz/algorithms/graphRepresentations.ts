/**
 * Graph representation tracers: one operation script run on one of the repository's graph
 * classes, drawn as the graph next to the structure that stores it (GraphRepresentationView).
 *
 * Mirrors five Python classes (Data_Structures/Non_Linear/Graph/...):
 *   'list'     Adjacency_List/Python/adjacency_list.py: AdjacencyList(num_vertices=0, directed=False, weighted=False)
 *              a dict {vertex: [neighbor, ...]} or {vertex: [(neighbor, weight), ...]}; add_edge first removes
 *              the existing entry in each direction (_remove_single_direction), then appends, so a repeated
 *              add moves the entry to the end and replaces its weight.
 *   'matrix'   Adjacency_Matrix/Python/adjacency_matrix.py: AdjacencyMatrix(num_vertices, directed=False, weighted=False)
 *              matrix (weighted: inf, 0 on the diagonal; else 0 / 1) plus a presence table; add_edge raises
 *              ValueError out of range, remove_edge then returns silently.
 *   'edges'    Edge_List/Python/edge_list.py: EdgeList(directed=False, weighted=False)
 *              a list of (u, v) or (u, v, weight) tuples; add_edge calls remove_edge first (a scan of every
 *              edge), undirected edges are stored once per direction, a self-loop once.
 *   'graph'    Directed_and_Undirected/Python/graph.py: Graph(directed=False)
 *              a dict of neighbor lists with a duplicate check instead of a removal: a repeated add changes nothing.
 *   'weighted' Weighted_and_Unweighted/Python/weighted_graph.py: WeightedGraph(directed=False)
 *              a dict of (neighbor, weight) lists; an edge without a weight gets 1.0.
 * A method a class does not have raises AttributeError, as in Python; weights keep Python's int / float
 * types (1.0 is the default), so every repr matches.
 * Golden fixtures (__fixtures__/heapsGraphs.json) pin the stored form (repr) and every return value after
 * every operation.
 *
 * Input: "undirected weighted; n 4; add 0 1 4.5, add 1 2, remove 0 1, has 1 2, neighbors 1"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ChainLinkView, ChainNodeView, ChainState } from '../renderers/ChainView';
import type { GraphRepState, RepCellView, RepEdgeView, RepVertexView } from '../renderers/GraphRepresentationView';
import type { GridState } from '../renderers/Grid';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { readOp, splitOps } from './binaryHeap';
import { opsStrip, plural } from './stackQueueOps';

export type RepMode = 'list' | 'matrix' | 'edges' | 'graph' | 'weighted';

/** A Python number: an int, or a float (f) such as the default weight 1.0 or inf. */
export interface PyNum {
  v: number;
  f: boolean;
}

export type RepOp =
  | { kind: 'add_vertex'; v: number }
  | { kind: 'add_edge'; u: number; v: number; w: PyNum | null }
  | { kind: 'remove_edge'; u: number; v: number }
  | { kind: 'has_edge'; u: number; v: number }
  | { kind: 'get_neighbors'; v: number }
  | { kind: 'get_weight'; u: number; v: number }
  | { kind: 'get_degree'; v: number }
  | { kind: 'get_edge_count' }
  | { kind: 'get_total_weight' };

export interface RepInput {
  mode: RepMode;
  directed: boolean;
  weighted: boolean;
  /** "n 5": num_vertices for AdjacencyList and AdjacencyMatrix (EdgeList takes none). */
  n: number | null;
  ops: RepOp[];
}

export const REP_LIMITS = { maxOps: 24, maxVertices: 8, maxEdges: 12, maxVertex: 99 };

export const CLASS_NAME: Record<RepMode, string> = {
  list: 'AdjacencyList',
  matrix: 'AdjacencyMatrix',
  edges: 'EdgeList',
  graph: 'Graph',
  weighted: 'WeightedGraph',
};

/** The methods each class has (anything else raises AttributeError). */
const METHODS: Record<RepMode, Array<RepOp['kind']>> = {
  list: ['add_vertex', 'add_edge', 'remove_edge', 'has_edge', 'get_neighbors', 'get_weight', 'get_degree'],
  matrix: ['add_edge', 'remove_edge', 'has_edge', 'get_neighbors', 'get_weight', 'get_degree'],
  edges: ['add_edge', 'remove_edge', 'has_edge', 'get_neighbors', 'get_weight', 'get_edge_count'],
  graph: ['add_vertex', 'add_edge', 'remove_edge', 'has_edge', 'get_neighbors', 'get_degree'],
  weighted: ['add_vertex', 'add_edge', 'remove_edge', 'has_edge', 'get_weight', 'get_neighbors', 'get_total_weight'],
};

/* ---------- Python numbers ---------- */

/** Python's repr of an int or a float: 4, 4.0, 4.5, inf. */
export function pyNumRepr(x: PyNum): string {
  if (!x.f) return String(x.v);
  if (!Number.isFinite(x.v)) return x.v > 0 ? 'inf' : '-inf';
  return Number.isInteger(x.v) ? x.v.toFixed(1) : String(x.v);
}

const FLOAT_ONE: PyNum = { v: 1, f: true };
const INF: PyNum = { v: Infinity, f: true };
const ZERO: PyNum = { v: 0, f: false };
const ONE: PyNum = { v: 1, f: false };

/* ---------- script ---------- */

const KINDS: Record<string, RepOp['kind']> = {
  add: 'add_edge',
  add_edge: 'add_edge',
  edge: 'add_edge',
  e: 'add_edge',
  remove: 'remove_edge',
  remove_edge: 'remove_edge',
  rm: 'remove_edge',
  del: 'remove_edge',
  delete: 'remove_edge',
  has: 'has_edge',
  has_edge: 'has_edge',
  neighbors: 'get_neighbors',
  get_neighbors: 'get_neighbors',
  nb: 'get_neighbors',
  weight: 'get_weight',
  get_weight: 'get_weight',
  degree: 'get_degree',
  get_degree: 'get_degree',
  deg: 'get_degree',
  vertex: 'add_vertex',
  add_vertex: 'add_vertex',
  count: 'get_edge_count',
  get_edge_count: 'get_edge_count',
  edge_count: 'get_edge_count',
  total: 'get_total_weight',
  get_total_weight: 'get_total_weight',
  total_weight: 'get_total_weight',
};

const ARITY: Record<RepOp['kind'], number> = {
  add_vertex: 1,
  add_edge: 2,
  remove_edge: 2,
  has_edge: 2,
  get_neighbors: 1,
  get_weight: 2,
  get_degree: 1,
  get_edge_count: 0,
  get_total_weight: 0,
};

export const REP_SCRIPT_HELP = '"add 0 1" (or "0-1"), "add 0 1 4.5" (or "0-1:4.5"), "remove 0 1", "has 0 1", "neighbors 0", "weight 0 1", "degree 0", "vertex 5", "count", "total"';

function readVertex(raw: string): number {
  if (!/^\d+$/.test(raw)) throw new InputError(`"${raw}" is not a vertex: vertices are whole numbers from 0 to ${REP_LIMITS.maxVertex}.`);
  const v = Number(raw);
  if (v > REP_LIMITS.maxVertex) throw new InputError(`Vertices go from 0 to ${REP_LIMITS.maxVertex} here (got ${raw}).`);
  return v;
}

function readWeight(raw: string): PyNum {
  if (!/^-?\d{1,2}(\.\d)?$/.test(raw)) throw new InputError(`"${raw}" is not a weight: use a number from -99 to 99 with at most one decimal, such as 4 or 2.5.`);
  // + 0 turns -0 into 0
  return { v: Number(raw) + 0, f: raw.includes('.') };
}

function readHeader(segment: string, into: { directed?: boolean; weighted?: boolean; n?: number }): boolean {
  const words = segment.toLowerCase().replace(/[=:]/g, ' ').split(/\s+/).filter(Boolean);
  const known = new Set(['directed', 'undirected', 'weighted', 'unweighted', 'n', 'vertices', 'num_vertices']);
  if (!words.length || !known.has(words[0])) return false;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === 'directed' || w === 'undirected') into.directed = w === 'directed';
    else if (w === 'weighted' || w === 'unweighted') into.weighted = w === 'weighted';
    else if (w === 'n' || w === 'vertices' || w === 'num_vertices') {
      const raw = words[++i];
      if (raw === undefined || !/^\d+$/.test(raw)) throw new InputError(`"${segment}": give the vertex count as a number, as in "n 5".`);
      into.n = Number(raw);
    } else throw new InputError(`"${segment}": cannot read "${w}". The first words may be "directed" or "undirected", "weighted" or "unweighted", and "n 5".`);
  }
  return true;
}

/** Parse the shared representation script for one class. */
export function parseRep(text: string, mode: RepMode): RepInput {
  const head: { directed?: boolean; weighted?: boolean; n?: number } = {};
  const ops: RepOp[] = [];
  for (const segment of splitOps(text)) {
    if (!ops.length && readHeader(segment, head)) continue;
    const short = segment.match(/^(\d+)\s*-\s*(\d+)(?:\s*:\s*(-?[\d.]+))?$/);
    if (short) {
      ops.push({ kind: 'add_edge', u: readVertex(short[1]), v: readVertex(short[2]), w: short[3] === undefined ? null : readWeight(short[3]) });
      continue;
    }
    const call = readOp(segment);
    const kind = call ? KINDS[call.name] : undefined;
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write operations like ${REP_SCRIPT_HELP}, separated by commas.`);
    const want = ARITY[kind];
    const args = call.args;
    if (kind === 'add_edge' ? args.length < 2 || args.length > 3 : args.length !== want) {
      throw new InputError(kind === 'add_edge' ? `"${segment}": add takes two vertices and an optional weight, as in "add 0 1" or "add 0 1 4.5".` : `"${segment}": ${kind} takes ${want === 0 ? 'nothing' : want === 1 ? 'one vertex' : 'two vertices'}.`);
    }
    if (kind === 'add_edge') ops.push({ kind, u: readVertex(args[0]), v: readVertex(args[1]), w: args[2] === undefined ? null : readWeight(args[2]) });
    else if (want === 2) ops.push({ kind, u: readVertex(args[0]), v: readVertex(args[1]) } as RepOp);
    else if (want === 1) ops.push({ kind, v: readVertex(args[0]) } as RepOp);
    else ops.push({ kind } as RepOp);
  }
  if (mode === 'graph' || mode === 'weighted') {
    if (head.n !== undefined) throw new InputError(`${CLASS_NAME[mode]}(directed) takes no vertex count: vertices appear through add_vertex or add_edge. Leave out "n".`);
    if (head.weighted !== undefined) {
      throw new InputError(
        mode === 'graph'
          ? 'Graph stores no weights, so there is nothing to switch: leave out "weighted". The Weighted and Unweighted Graphs topic adds them.'
          : 'WeightedGraph always stores a weight; an edge added without one gets 1.0. Leave out "weighted" / "unweighted".',
      );
    }
  }
  if (head.n !== undefined && (head.n < 1 || head.n > REP_LIMITS.maxVertices)) throw new InputError(`n goes from 1 to ${REP_LIMITS.maxVertices}, so every vertex fits on screen (got ${head.n}).`);
  if (ops.length === 0) throw new InputError(`Add at least one operation, for example ${REP_SCRIPT_HELP}.`);
  if (ops.length > REP_LIMITS.maxOps) throw new InputError(`At most ${REP_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  const input: RepInput = { mode, directed: head.directed ?? false, weighted: mode === 'weighted' ? true : (head.weighted ?? false), n: head.n ?? null, ops };
  // Keep the picture readable: few vertices and edges.
  const vertices = new Set<number>();
  if (mode === 'list' && input.n) for (let i = 0; i < input.n; i++) vertices.add(i);
  const live = new Set<string>();
  ops.forEach((op, i) => {
    if (op.kind === 'add_vertex') vertices.add(op.v);
    if (op.kind === 'add_edge') {
      vertices.add(op.u);
      vertices.add(op.v);
      live.add(input.directed ? `${op.u}>${op.v}` : `${Math.min(op.u, op.v)}~${Math.max(op.u, op.v)}`);
      if (live.size > REP_LIMITS.maxEdges) throw new InputError(`At most ${REP_LIMITS.maxEdges} edges at once, so every stored entry fits on screen; operation ${i + 1} would make ${live.size}.`);
    }
    if (op.kind === 'remove_edge') {
      live.delete(input.directed ? `${op.u}>${op.v}` : `${Math.min(op.u, op.v)}~${Math.max(op.u, op.v)}`);
    }
  });
  if (mode !== 'matrix' && vertices.size > REP_LIMITS.maxVertices) {
    throw new InputError(`At most ${REP_LIMITS.maxVertices} different vertices, so the drawing stays readable (this script uses ${vertices.size}).`);
  }
  return input;
}

/** The vertex count the matrix gets: "n", or (the class has no default) the largest vertex + 1, capped. */
export function matrixSize(input: RepInput): number {
  if (input.n !== null) return input.n;
  return Math.min(REP_LIMITS.maxVertices, largestVertex(input) + 1);
}

function largestVertex(input: RepInput): number {
  let top = 0;
  for (const op of input.ops) for (const x of 'u' in op ? [op.u, op.v] : 'v' in op ? [op.v] : []) top = Math.max(top, x);
  return top;
}

export function formatRepOp(op: RepOp): string {
  switch (op.kind) {
    case 'add_edge':
      return `add_edge(${op.u}, ${op.v}${op.w ? `, ${pyNumRepr(op.w)}` : ''})`;
    case 'remove_edge':
    case 'has_edge':
    case 'get_weight':
      return `${op.kind}(${op.u}, ${op.v})`;
    case 'add_vertex':
    case 'get_neighbors':
    case 'get_degree':
      return `${op.kind}(${op.v})`;
    default:
      return `${op.kind}()`;
  }
}

/* ---------- pseudocode, one listing per class ---------- */

export const REP_CODE: Record<RepMode, string[]> = {
  list: [
    '__init__(num_vertices=0, directed=False, weighted=False): add_vertex(i) for i in range(num_vertices)',
    'add_vertex(v): if v not in vertices: vertices.add(v); adjacency_list[v] = []',
    'add_edge(u, v, weight=1.0): add_vertex(u); add_vertex(v)',
    '  _remove_single_direction(u, v)          # replace an existing entry, never duplicate it',
    '  adjacency_list[u].append((v, weight) if weighted else v)',
    '  if not directed: _remove_single_direction(v, u); adjacency_list[v].append((u, weight) or u)',
    '_remove_single_direction(u, v): weighted: keep items with item[0] != v; else: if v in list: list.remove(v)',
    'remove_edge(u, v): if u not in adjacency_list: return',
    '  remove v from adjacency_list[u]      # the same rule',
    '  if not directed and v in adjacency_list: remove u from adjacency_list[v]',
    'has_edge(u, v): if u not in adjacency_list: return False',
    '  return v in adjacency_list[u]        # weighted: any(item[0] == v ...)',
    'get_weight(u, v): if not weighted or u not in adjacency_list: return None',
    '  for item in adjacency_list[u]: if item[0] == v: return item[1]; return None',
    'get_neighbors(v): [] if v not in adjacency_list, else a copy (weighted: each item[0])',
    'get_degree(v): 0 if v not in adjacency_list; degree = len(adjacency_list[v])',
    '  if directed: degree += the entries equal to v in every list (the in-degree)',
  ],
  matrix: [
    '__init__(num_vertices, directed=False, weighted=False):',
    '  matrix = n x n of inf, 0 on the diagonal (weighted) or of 0; present = n x n of False',
    'add_edge(u, v, weight=1.0): if not (0 <= u < n and 0 <= v < n): raise ValueError',
    '  _set_cell(u, v, weight); if not directed: _set_cell(v, u, weight)',
    '_set_cell(u, v, w): present[u][v] = True; matrix[u][v] = w if weighted else 1',
    'remove_edge(u, v): if not (0 <= u < n and 0 <= v < n): return',
    '  _clear_cell(u, v); if not directed: _clear_cell(v, u)',
    '_clear_cell(u, v): present[u][v] = False; matrix[u][v] = (0 if u == v else inf) if weighted else 0',
    'has_edge(u, v): False if out of range, else present[u][v]',
    'get_weight(u, v): None if unweighted, out of range or not present[u][v]; else matrix[u][v]',
    'get_neighbors(v): [i for i in range(n) if has_edge(v, i)]      # the whole row',
    'get_degree(v): count has_edge(v, i) along row v',
    '  if directed: add has_edge(i, v) down column v (the in-degree)',
  ],
  edges: [
    '__init__(directed=False, weighted=False): edges = []; vertices = set()',
    'add_edge(u, v, weight=None): vertices.add(u); vertices.add(v)',
    '  remove_edge(u, v)                       # scans every edge first',
    '  edges.append((u, v, 1.0 if weight is None else weight) if weighted else (u, v))',
    '  if not directed: _remove_edge_from_list(v, u); edges.append((v, u, ...) or (v, u))',
    'remove_edge(u, v): _remove_edge_from_list(u, v)',
    '  if not directed: _remove_edge_from_list(v, u)',
    '_remove_edge_from_list(u, v): edges = [e for e in edges if not (e[0] == u and e[1] == v)]',
    'has_edge(u, v): any(e[0] == u and e[1] == v for e in edges)',
    'get_weight(u, v): None if not weighted; e[2] of the first e with e[0] == u and e[1] == v, else None',
    'get_neighbors(v): every e[1] with e[0] == v, once each, in list order',
    'get_edge_count(): if directed: return len(edges)',
    '  loops = edges with e[0] == e[1]; return (len(edges) - loops) // 2 + loops',
  ],
  graph: [
    '__init__(directed=False): adjacency_list = {}; vertices = set()',
    'add_vertex(v): if v not in vertices: vertices.add(v); adjacency_list[v] = []',
    'add_edge(u, v): add_vertex(u); add_vertex(v)',
    '  if v not in adjacency_list[u]: adjacency_list[u].append(v)',
    '  if not directed and u not in adjacency_list[v]: adjacency_list[v].append(u)',
    'remove_edge(u, v): if u in adjacency_list and v in adjacency_list[u]: adjacency_list[u].remove(v)',
    '  if not directed and v in adjacency_list and u in adjacency_list[v]: adjacency_list[v].remove(u)',
    'has_edge(u, v): u in adjacency_list and v in adjacency_list[u]',
    'get_neighbors(v): list(adjacency_list.get(v, []))',
    'get_degree(v): 0 if v not in adjacency_list; degree = len(adjacency_list[v])',
    '  if directed: degree += the number of lists that contain v (the in-degree)',
  ],
  weighted: [
    '__init__(directed=False): adjacency_list = {}     # {vertex: [(neighbor, weight), ...]}',
    'add_vertex(v): if v not in vertices: vertices.add(v); adjacency_list[v] = []',
    'add_edge(u, v, weight=1.0): add_vertex(u); add_vertex(v)',
    '  _remove_single_direction(u, v); adjacency_list[u].append((v, weight))',
    '  if not directed: _remove_single_direction(v, u); adjacency_list[v].append((u, weight))',
    '_remove_single_direction(u, v): adjacency_list[u] = [(x, w) for (x, w) in adjacency_list[u] if x != v]',
    'remove_edge(u, v): if u in adjacency_list: keep the (x, w) with x != v',
    '  if not directed and v in adjacency_list: keep the (x, w) of adjacency_list[v] with x != u',
    'has_edge(u, v): u in adjacency_list and any(x == v for x, _ in adjacency_list[u])',
    'get_weight(u, v): w of the first (x, w) with x == v in adjacency_list[u], else None',
    'get_neighbors(v): [x for x, _ in adjacency_list.get(v, [])]',
    'get_total_weight(): total = 0.0; add every w, an undirected pair once (sorted key)',
  ],
};

/** Pseudocode line of each step, per class. */
const AT: Record<RepMode, Partial<Record<string, number>>> = {
  list: { init: 0, vertex: 1, addVertices: 2, removeFwd: 3, appendFwd: 4, reverse: 5, removeOne: 6, removeStart: 7, removeFwdR: 8, removeRev: 9, hasStart: 10, hasScan: 11, weightStart: 12, weightScan: 13, neighbors: 14, degree: 15, inDegree: 16 },
  matrix: { init: 0, initFill: 1, addCheck: 2, set: 4, setPair: 3, removeCheck: 5, clear: 7, clearPair: 6, has: 8, weight: 9, neighbors: 10, degree: 11, inDegree: 12 },
  edges: { init: 0, addVertices: 1, removeFirst: 2, appendFwd: 3, reverse: 4, removeStart: 5, removeRev: 6, scanRemove: 7, has: 8, weight: 9, neighbors: 10, count: 11, countLoops: 12 },
  graph: { init: 0, vertex: 1, addVertices: 2, appendFwd: 3, reverse: 4, removeFwd: 5, removeRev: 6, has: 7, neighbors: 8, degree: 9, inDegree: 10 },
  weighted: { init: 0, vertex: 1, addVertices: 2, appendFwd: 3, reverse: 4, removeOne: 5, removeFwd: 6, removeRev: 7, has: 8, weight: 9, neighbors: 10, total: 11 },
};

/* ---------- tracer ---------- */

export interface RepStep {
  op: RepOp;
  /** Python's repr of the return value ('None' for the mutators); null when it raised. */
  result: string | null;
  error: string | null;
  /** The stored form as Python prints it (see the fixture generator). */
  state: string;
}

export interface RepRun {
  frames: Array<Frame<GraphRepState>>;
  /** The stored form right after the constructor. */
  initial: string;
  steps: RepStep[];
}

interface Entry {
  id: string;
  to: number;
  w: PyNum | null;
}

interface EdgeTuple {
  id: string;
  u: number;
  v: number;
  w: PyNum | null;
}

interface Hl {
  vertices?: Record<number, Role>;
  edges?: Record<string, Role>;
  /** list modes: entry ids; edge list: tuple ids. */
  entries?: Record<string, Role>;
  rows?: Record<number, Role>;
  /** matrix cells, "u,v". */
  cells?: Record<string, Role>;
  /** edge list: draw these cells instead of the current list (the list before a rebuild). */
  cellsAt?: RepCellView[];
  /** Removed entries drawn faded at their old place (list modes: [row vertex, index]). */
  ghosts?: Array<{ entry: Entry; row: number; index: number } | { tuple: EdgeTuple; index: number }>;
  /** list modes: entries of `row` at index >= from are drawn one place further right. */
  gap?: { row: number; from: number };
  vars?: Array<[string, string | number]>;
  fresh?: boolean;
}

const edgeKey = (u: number, v: number, directed: boolean) => (directed ? `${u}>${v}` : `${Math.min(u, v)}~${Math.max(u, v)}`);

export function repTrace(input: RepInput): RepRun {
  const { mode, directed, ops } = input;
  const weighted = mode === 'weighted' || (input.weighted && mode !== 'graph');
  const cls = CLASS_NAME[mode];
  const at = AT[mode];
  const listLike = mode === 'list' || mode === 'graph' || mode === 'weighted';
  const labels = ops.map(formatRepOp);
  const frames: Array<Frame<GraphRepState>> = [];
  const steps: RepStep[] = [];
  const out: string[] = [];
  let current = -1;
  let ids = 0;
  let scanned = 0;

  // list-like state: dict of lists, in insertion order
  const adj = new Map<number, Entry[]>();
  // matrix state
  const n = mode === 'matrix' ? matrixSize(input) : 0;
  const mat: PyNum[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (weighted ? (i === j ? ZERO : INF) : ZERO)));
  const present: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => false));
  // edge list state
  let edges: EdgeTuple[] = [];
  const vset = new Set<number>();

  const entryLabel = (e: Entry) => (e.w ? `(${e.to}, ${pyNumRepr(e.w)})` : String(e.to));
  const tupleLabel = (t: EdgeTuple) => (t.w ? `(${t.u}, ${t.v}, ${pyNumRepr(t.w)})` : `(${t.u}, ${t.v})`);
  const pyList = (xs: number[]) => `[${xs.join(', ')}]`;

  /** The stored form, exactly as the fixture's repr prints it. */
  const storeRepr = (): string => {
    if (listLike) return `[${[...adj].map(([v, es]) => `(${v}, [${es.map(entryLabel).join(', ')}])`).join(', ')}]`;
    if (mode === 'matrix') {
      return `${`[${mat.map((row) => `[${row.map(pyNumRepr).join(', ')}]`).join(', ')}]`} ${`[${present.map((row) => `[${row.map((b) => (b ? 'True' : 'False')).join(', ')}]`).join(', ')}]`}`;
    }
    return `[${edges.map(tupleLabel).join(', ')}] ${pyList([...vset].sort((a, b) => a - b))}`;
  };

  const drawnVertices = (): number[] => (listLike ? [...adj.keys()] : mode === 'matrix' ? Array.from({ length: n }, (_, i) => i) : [...vset]);
  const drawnEdges = (): Array<{ u: number; v: number; w: PyNum | null }> => {
    const seen = new Map<string, { u: number; v: number; w: PyNum | null }>();
    const put = (u: number, v: number, w: PyNum | null) => {
      const k = edgeKey(u, v, directed);
      if (!seen.has(k)) seen.set(k, { u, v, w });
    };
    if (listLike) for (const [u, es] of adj) for (const e of es) put(u, e.to, e.w);
    else if (mode === 'matrix') {
      for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (present[u][v]) put(u, v, weighted ? mat[u][v] : null);
    } else for (const t of edges) put(t.u, t.v, t.w);
    return [...seen.values()];
  };

  const snap = (line: number | undefined, caption: string, h: Hl = {}) => {
    const vertices: RepVertexView[] = drawnVertices().map((id) => ({ id, role: h.vertices?.[id] ?? 'idle' }));
    const gEdges: RepEdgeView[] = drawnEdges().map((e) => {
      const key = edgeKey(e.u, e.v, directed);
      return { key, from: e.u, to: e.v, directed, label: weighted && e.w ? pyNumRepr(e.w) : undefined, role: h.edges?.[key] ?? 'idle' };
    });
    let store: GraphRepState['store'];
    if (listLike) {
      const nodes: ChainNodeView[] = [];
      const links: ChainLinkView[] = [];
      const rows = [...adj.keys()];
      rows.forEach((v, r) => {
        // One row per dict key (the lane label); its list's entries sit side by side like list cells.
        const list = adj.get(v)!;
        list.forEach((e, j) => {
          const shift = h.gap && h.gap.row === v && j >= h.gap.from ? 1 : 0;
          nodes.push({ id: e.id, label: entryLabel(e), col: j + shift, row: r, shape: 'slot', role: h.entries?.[e.id] ?? 'idle' });
        });
        // An empty list is drawn as [] (unless an entry is just fading out of it).
        const fading = (h.ghosts ?? []).some((g) => 'entry' in g && g.row === v);
        if (!list.length && !fading) nodes.push({ id: `empty${v}`, label: '[]', col: 0, row: r, shape: 'slot', role: 'muted' });
      });
      for (const g of h.ghosts ?? []) {
        if (!('entry' in g)) continue;
        const r = rows.indexOf(g.row);
        nodes.push({ id: g.entry.id, label: entryLabel(g.entry), col: g.index, row: r, shape: 'slot', role: 'bad', ghost: true });
      }
      const chain: ChainState = {
        nodes,
        links,
        lanes: rows.map((v, r) => ({ row: r, label: `[${v}]:`, role: h.rows?.[v] })),
      };
      store = { kind: 'chain', title: weighted ? 'adjacency_list: {vertex: [(neighbor, weight), ...]}' : 'adjacency_list: {vertex: [neighbor, ...]}', state: chain };
    } else if (mode === 'matrix') {
      const roles: Record<string, Role> = {};
      for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (present[u][v]) roles[`${u},${v}`] = 'done';
      Object.assign(roles, h.cells ?? {});
      const grid: GridState = {
        corner: 'u \\ v',
        rowHeaders: Array.from({ length: n }, (_, i) => String(i)),
        colHeaders: Array.from({ length: n }, (_, i) => String(i)),
        cells: mat.map((row) => row.map(pyNumRepr)),
        roles,
      };
      store = { kind: 'grid', title: weighted ? 'matrix[u][v] (weight, inf = no edge); filled: present[u][v] is True' : 'matrix[u][v] (1 = edge); filled: present[u][v] is True', state: grid };
    } else {
      const cells: RepCellView[] = h.cellsAt ?? edges.map((t, i) => ({ id: t.id, label: tupleLabel(t), role: h.entries?.[t.id] ?? 'idle', index: i }));
      for (const g of h.ghosts ?? []) if ('tuple' in g) cells.push({ id: g.tuple.id, label: tupleLabel(g.tuple), role: 'bad', ghost: true, index: g.index });
      store = { kind: 'cells', title: weighted ? 'edges: [(u, v, weight), ...]' : 'edges: [(u, v), ...]', cells };
    }
    const strips: StripData[] = [opsStrip(labels, current), { label: 'Returned', items: out.length ? out.map((text, i): StripItem => ({ text, role: h.fresh && i === out.length - 1 ? 'done' : undefined })) : [{ text: '(none yet)' }] }];
    const size: Array<[string, string | number]> = listLike
      ? [['vertices', adj.size], ['stored entries', [...adj.values()].reduce((s, es) => s + es.length, 0)]]
      : mode === 'matrix'
        ? [['n', n], ['cells', n * n], ['present', present.flat().filter(Boolean).length]]
        : [['len(edges)', edges.length], ['vertices', vset.size]];
    frames.push({
      line,
      caption,
      vars: [...(current >= 0 && current < ops.length ? ([['op', labels[current]]] as Array<[string, string]>) : []), ...size, ...(h.vars ?? []), ['entries read so far', scanned]],
      state: { vertices, edges: gEdges, store, directed, weighted, strips },
    });
  };

  const ret = (repr: string, fresh = true) => {
    out.push(repr);
    return fresh;
  };

  /* ----- shared pieces of the list-like classes ----- */

  /** add_vertex(v) for the dict-of-lists classes: true when v was new. */
  const ensure = (v: number): boolean => {
    if (adj.has(v)) return false;
    adj.set(v, []);
    return true;
  };

  /**
   * Remove the entries of `from`'s list that point at `to`, with the picture of a Python list
   * losing an element: the entry fades out, then the later ones close the gap.
   * `how`: 'filter' (a comprehension keeps everything else), 'remove' (list.remove, first match).
   */
  const dropEntries = (from: number, to: number, how: 'filter' | 'remove', line: number | undefined, why: string, tail = ''): boolean => {
    const list = adj.get(from)!;
    const hits = list.map((e, j) => ({ e, j })).filter(({ e }) => e.to === to);
    scanned += how === 'remove' ? (hits.length ? hits[0].j + 1 : list.length) : list.length;
    if (!hits.length) return false;
    const gone = how === 'remove' ? [hits[0]] : hits;
    const ghosts = gone.map(({ e, j }) => ({ entry: e, row: from, index: j }));
    const keep = list.filter((e) => !gone.some((g) => g.e === e));
    adj.set(from, keep);
    const first = gone[0].j;
    const after = keep.length - first;
    snap(line, `${why} ${how === 'filter' ? `The comprehension rebuilds adjacency_list[${from}] without ${entryLabel(gone[0].e)}` : `adjacency_list[${from}].remove(${to}) takes ${to} out`}${after > 0 ? `, and the ${plural(after, 'entry', 'entries')} after it ${after === 1 ? 'moves' : 'move'} one place left` : ''}.${tail}`, {
      rows: { [from]: 'compare' },
      ghosts,
      gap: { row: from, from: first },
      edges: { [edgeKey(from, to, directed)]: 'bad' },
      vertices: { [from]: 'compare' },
    });
    return true;
  };

  /** Scan the list of `from` for `to`, one frame per entry (Python's `in` / any()). Returns the index or -1. */
  const scanFor = (from: number, to: number, line: number | undefined, what: string): number => {
    const list = adj.get(from)!;
    for (let j = 0; j < list.length; j++) {
      scanned += 1;
      const e = list[j];
      const hit = e.to === to;
      const entries: Record<string, Role> = {};
      for (let t = 0; t < j; t++) entries[list[t].id] = 'muted';
      entries[e.id] = hit ? 'good' : 'compare';
      snap(
        line,
        hit
          ? `Entry ${j} of adjacency_list[${from}] is ${entryLabel(e)}: it points at ${to}, so ${what}. ${plural(j + 1, 'entry', 'entries')} read.`
          : `Entry ${j} of adjacency_list[${from}] is ${entryLabel(e)}, not ${to}: read the next one.`,
        { rows: { [from]: 'compare' }, entries, vertices: { [from]: 'compare', [to]: hit ? 'good' : 'idle' }, edges: hit ? { [edgeKey(from, to, directed)]: 'good' } : {} },
      );
      if (hit) return j;
    }
    return -1;
  };

  const newEntry = (to: number, w: PyNum | null): Entry => ({ id: `a${ids++}`, to, w });

  /** add_vertex frames for the endpoints of an edge. */
  const addEndpoints = (u: number, v: number, label: string, line: number | undefined): string => {
    const fresh = [u, v].filter((x, i, a) => a.indexOf(x) === i).filter((x) => ensure(x));
    if (fresh.length) {
      snap(
        line,
        `${label}: add_vertex(${u}) and add_vertex(${v}) run first. ${fresh.map((x) => `${x} is new, so adjacency_list[${x}] = []`).join('; ')}: ${fresh.length === 1 ? 'a new row' : 'new rows'} at the end of the dict.`,
        { vertices: Object.fromEntries(fresh.map((x) => [x, 'active' as Role])), rows: Object.fromEntries(fresh.map((x) => [x, 'active' as Role])) },
      );
      return '';
    }
    return `${label}: both vertices exist already. `;
  };

  /* ----- per-class operations ----- */

  const missing = (op: RepOp, label: string) => {
    snap(undefined, `${label} raises AttributeError: '${cls}' object has no attribute '${op.kind}'. ${missingWhy(mode, op.kind)}`, { vertices: {} });
    steps.push({ op, result: null, error: 'AttributeError', state: storeRepr() });
  };

  const listAddEdge = (u: number, v: number, wIn: PyNum | null, label: string) => {
    const w = mode === 'graph' ? null : weighted ? (wIn ?? FLOAT_ONE) : null;
    let prefix = addEndpoints(u, v, label, at.addVertices);
    const one = (from: number, to: number, reverse: boolean) => {
      const line = reverse ? at.reverse : mode === 'graph' ? at.appendFwd : at.removeFwd;
      if (mode === 'graph') {
        // Graph: a duplicate check instead of a removal.
        const list = adj.get(from)!;
        const j = list.findIndex((e) => e.to === to);
        scanned += j >= 0 ? j + 1 : list.length;
        if (j >= 0) {
          const why =
            reverse && from === to
              ? `${prefix}Undirected: ${to} is already in adjacency_list[${from}], the entry just appended, so nothing more is appended: a self-loop is stored once.`
              : `${prefix}${to} is already in adjacency_list[${from}], so nothing is appended: Graph keeps one entry per neighbor, and a repeated add_edge changes nothing.`;
          snap(line, why, {
            rows: { [from]: 'compare' },
            entries: { [list[j].id]: 'good' },
            vertices: { [from]: 'compare', [to]: 'compare' },
          });
          prefix = '';
          return;
        }
        const e = newEntry(to, null);
        list.push(e);
        snap(
          line,
          `${prefix}${to} is not in adjacency_list[${from}] (${plural(list.length - 1, 'entry', 'entries')} checked), so it is appended.` +
            (reverse ? (from === to ? ' A self-loop is the same list, so it is stored once.' : ` The undirected edge is now stored twice, once in each list.`) : directed ? ' A directed edge is stored once, in the list of its tail.' : ''),
          { rows: { [from]: 'active' }, entries: { [e.id]: 'active' }, edges: { [edgeKey(u, v, directed)]: 'active' }, vertices: { [from]: 'active', [to]: 'compare' } },
        );
        prefix = '';
        return;
      }
      const how = mode === 'list' && !weighted ? 'remove' : 'filter';
      const helper = `_remove_single_direction(${from}, ${to})`;
      const dropped = dropEntries(
        from,
        to,
        how,
        line,
        `${prefix}${helper}: adjacency_list[${from}] already holds ${to}${reverse && from === to ? ' (the entry just appended: for a self-loop both directions are the same list)' : ''}, so it is removed first and the edge is replaced, never stored twice.`,
      );
      if (dropped) prefix = '';
      const list = adj.get(from)!;
      // AdjacencyList unweighted appends only "if to not in list", which always holds after the removal.
      const e = newEntry(to, w);
      list.push(e);
      const note = reverse
        ? from === to
          ? ' A self-loop is stored once: both directions are the same list.'
          : ' The undirected edge is now stored twice, once in each list.'
        : directed
          ? ' A directed edge is stored once, in the list of its tail.'
          : '';
      snap(
        reverse ? at.reverse : at.appendFwd,
        `${prefix}${dropped ? '' : `${helper} finds no ${to} in adjacency_list[${from}]. `}Append ${entryLabel(e)} at the end of adjacency_list[${from}].${note}` +
          (wIn === null && weighted && !reverse ? ' No weight was given, so it is the default 1.0.' : '') +
          (wIn !== null && !weighted && !reverse && mode === 'list' ? ` The graph is unweighted, so the weight ${pyNumRepr(wIn)} is ignored.` : ''),
        { rows: { [from]: 'active' }, entries: { [e.id]: 'active' }, edges: { [edgeKey(u, v, directed)]: 'active' }, vertices: { [from]: 'active', [to]: 'compare' } },
      );
      prefix = '';
    };
    one(u, v, false);
    if (!directed) one(v, u, true);
  };

  const listRemoveEdge = (u: number, v: number, label: string) => {
    const how = mode === 'weighted' || (mode === 'list' && weighted) ? 'filter' : 'remove';
    if (mode === 'list' && !adj.has(u)) {
      snap(at.removeStart, `${label}: ${u} is not in adjacency_list, so remove_edge returns at once. Nothing changes.`, { vertices: {} });
      return;
    }
    const forwardLine = mode === 'list' ? at.removeFwdR : at.removeFwd;
    let removed = false;
    if (adj.has(u)) {
      removed = dropEntries(u, v, how, forwardLine, `${label}: adjacency_list[${u}] holds ${v}.`);
      if (!removed) snap(forwardLine, `${label}: adjacency_list[${u}] has no entry for ${v}, so nothing is removed there.`, { rows: { [u]: 'compare' }, vertices: { [u]: 'compare' } });
    } else {
      snap(forwardLine, `${label}: ${u} is not in adjacency_list, so there is nothing to remove from its list.`, { vertices: {} });
    }
    if (!directed) {
      if (!adj.has(v)) {
        snap(at.removeRev, `Undirected: the reverse entry would live in adjacency_list[${v}], but ${v} is not a vertex. Done.`, {});
        return;
      }
      const back = dropEntries(v, u, how, at.removeRev, `Undirected: the edge is also stored as ${u} in adjacency_list[${v}].`, ' Both copies are gone, so has_edge answers False in both directions.');
      if (!back) {
        snap(
          at.removeRev,
          u === v && removed
            ? `Undirected: the reverse direction of a self-loop is the same list, and its only entry is already gone.`
            : `Undirected: adjacency_list[${v}] has no entry for ${u} either.${removed ? '' : ' Nothing changed.'}`,
          { rows: { [v]: 'compare' } },
        );
      }
    }
  };

  const listHasEdge = (u: number, v: number, label: string): string => {
    const startLine = mode === 'list' ? at.hasStart : at.has;
    if (!adj.has(u)) {
      snap(startLine, `${label}: ${u} is not in adjacency_list, so has_edge returns False without reading anything.`, { vertices: {} });
      return 'False';
    }
    const list = adj.get(u)!;
    const scanLine = mode === 'list' ? at.hasScan : at.has;
    if (!list.length) {
      snap(scanLine, `${label}: adjacency_list[${u}] is empty, so ${v} cannot be in it: False.`, { rows: { [u]: 'bad' }, vertices: { [u]: 'bad' } });
      return 'False';
    }
    const j = scanFor(u, v, scanLine, 'has_edge returns True');
    if (j < 0) {
      snap(scanLine, `adjacency_list[${u}] ended without ${v}: has_edge returns False after reading all ${plural(list.length, 'entry', 'entries')}, O(deg(${u})).`, {
        rows: { [u]: 'bad' },
        entries: Object.fromEntries(list.map((e) => [e.id, 'muted' as Role])),
        vertices: { [u]: 'bad', [v]: 'bad' },
      });
      return 'False';
    }
    return 'True';
  };

  const listGetWeight = (u: number, v: number, label: string): string => {
    const startLine = mode === 'list' ? at.weightStart : at.weight;
    if (mode === 'list' && !weighted) {
      snap(startLine, `${label}: this AdjacencyList is unweighted (weighted=False), so get_weight returns None at once.`, {});
      return 'None';
    }
    if (!adj.has(u)) {
      snap(startLine, `${label}: ${u} is not in adjacency_list, so get_weight returns None.`, {});
      return 'None';
    }
    const scanLine = mode === 'list' ? at.weightScan : at.weight;
    const list = adj.get(u)!;
    const j = list.length ? scanFor(u, v, scanLine, `get_weight returns its weight ${list.find((e) => e.to === v)?.w ? pyNumRepr(list.find((e) => e.to === v)!.w!) : ''}`) : -1;
    if (j < 0) {
      snap(scanLine, `adjacency_list[${u}] has no entry for ${v}, so get_weight returns None.`, { rows: { [u]: 'bad' }, vertices: { [u]: 'bad', [v]: 'bad' } });
      return 'None';
    }
    return pyNumRepr(list[j].w!);
  };

  const listNeighbors = (v: number, label: string): string => {
    if (!adj.has(v)) {
      snap(at.neighbors, `${label}: ${v} is not a vertex, so get_neighbors returns [].`, {});
      return '[]';
    }
    const list = adj.get(v)!;
    scanned += list.length;
    const res = pyList(list.map((e) => e.to));
    snap(
      at.neighbors,
      `${label}: the neighbors are exactly adjacency_list[${v}]${weighted ? ', without the weights' : ''}: ${res}. ${mode === 'graph' || (mode === 'list' && !weighted) ? 'It returns a copy, so the caller cannot change the graph. ' : ''}O(deg(${v})), no other list is read.`,
      {
        rows: { [v]: 'done' },
        entries: Object.fromEntries(list.map((e) => [e.id, 'done' as Role])),
        vertices: { [v]: 'active', ...Object.fromEntries(list.map((e) => [e.to, 'done' as Role])) },
        edges: Object.fromEntries(list.map((e) => [edgeKey(v, e.to, directed), 'done' as Role])),
      },
    );
    return res;
  };

  const listDegree = (v: number, label: string): string => {
    if (!adj.has(v)) {
      snap(at.degree, `${label}: ${v} is not a vertex, so get_degree returns 0.`, {});
      return '0';
    }
    const list = adj.get(v)!;
    const outDeg = list.length;
    snap(
      at.degree,
      `${label}: degree = len(adjacency_list[${v}]) = ${outDeg}${directed ? `, the edges that leave ${v} (out-degree)` : ''}.` +
        (!directed && list.some((e) => e.to === v) ? ` The self-loop is one entry, so it counts once.` : ''),
      { rows: { [v]: 'compare' }, entries: Object.fromEntries(list.map((e) => [e.id, 'compare' as Role])), vertices: { [v]: 'active' } },
    );
    if (!directed) return String(outDeg);
    // in-degree: every list is read
    const hits: Entry[] = [];
    let lists = 0;
    for (const es of adj.values()) {
      scanned += es.length;
      const inThis = es.filter((e) => e.to === v);
      if (inThis.length) lists += 1;
      hits.push(...(mode === 'graph' ? inThis.slice(0, 1) : inThis));
    }
    const inDeg = mode === 'graph' ? lists : hits.length;
    snap(
      at.inDegree,
      `Directed: the edges that enter ${v} sit in the other vertices' lists, so every list is read: ${plural(inDeg, 'entry', 'entries')} point at ${v}. get_degree returns ${outDeg} + ${inDeg} = ${outDeg + inDeg}, O(V + E).`,
      {
        entries: Object.fromEntries(hits.map((e) => [e.id, 'good' as Role])),
        vertices: { [v]: 'active' },
      },
    );
    return String(outDeg + inDeg);
  };

  const totalWeight = (label: string): string => {
    let total: PyNum = { v: 0, f: true };
    const seen = new Set<string>();
    const entries: Record<string, Role> = {};
    const parts: string[] = [];
    for (const [u, es] of adj) {
      for (const e of es) {
        scanned += 1;
        const k = `${Math.min(u, e.to)}~${Math.max(u, e.to)}`;
        if (!directed && seen.has(k)) {
          entries[e.id] = 'muted';
          continue;
        }
        seen.add(k);
        total = { v: total.v + e.w!.v, f: true };
        entries[e.id] = 'done';
        parts.push(pyNumRepr(e.w!));
      }
    }
    const res = pyNumRepr(total);
    snap(
      at.total,
      `${label}: total starts at 0.0 and adds the weight of every entry${directed ? '' : '; an undirected pair is stored twice, so its sorted key is remembered and the second copy is skipped (faded)'}: ${parts.length ? parts.join(' + ') : 'nothing'} = ${res}.`,
      { entries },
    );
    return res;
  };

  /* ----- matrix ----- */

  const inRange = (x: number) => x >= 0 && x < n;

  const matrixOp = (op: RepOp, label: string): string | null => {
    switch (op.kind) {
      case 'add_edge': {
        const { u, v } = op;
        if (!inRange(u) || !inRange(v)) {
          snap(at.addCheck, `${label} raises ValueError("Vertices must be in range [0, ${n})"): the matrix was built for ${n} vertices and cannot grow.`, {
            vertices: Object.fromEntries([u, v].filter(inRange).map((x) => [x, 'bad' as Role])),
          });
          return null;
        }
        const w = weighted ? (op.w ?? FLOAT_ONE) : ONE;
        const set = (a: number, b: number, mirror: boolean) => {
          const before = present[a][b];
          present[a][b] = true;
          mat[a][b] = w;
          scanned += 1;
          snap(
            at.set,
            mirror
              ? a === b
                ? `Undirected: _set_cell(${a}, ${b}) again: for a self-loop the mirror is the same diagonal cell.`
                : `Undirected: _set_cell(${a}, ${b}) writes the mirror cell, so the matrix stays symmetric: the edge is stored twice.`
              : `${label}: ${u} and ${v} are in range [0, ${n}). _set_cell(${a}, ${b}): present[${a}][${b}] = True and matrix[${a}][${b}] = ${pyNumRepr(w)}${weighted ? '' : ' (an unweighted matrix stores 1)'}${before ? '; the cell held an edge already, so it is overwritten' : ''}. One cell, O(1).` +
                  (op.w === null && weighted ? ' No weight was given, so it is the default 1.0.' : '') +
                  (op.w !== null && !weighted ? ` The matrix is unweighted, so the weight ${pyNumRepr(op.w)} is ignored.` : '') +
                  (directed ? ' Directed: only this cell.' : ''),
            { cells: { [`${a},${b}`]: 'active' }, edges: { [edgeKey(u, v, directed)]: 'active' }, vertices: { [u]: 'active', [v]: 'compare' } },
          );
        };
        set(u, v, false);
        if (!directed) set(v, u, true);
        return 'None';
      }
      case 'remove_edge': {
        const { u, v } = op;
        if (!inRange(u) || !inRange(v)) {
          snap(at.removeCheck, `${label}: a vertex is outside [0, ${n}), so remove_edge returns silently (unlike add_edge, it does not raise).`, {});
          return 'None';
        }
        const clear = (a: number, b: number, mirror: boolean) => {
          const had = present[a][b];
          present[a][b] = false;
          mat[a][b] = weighted ? (a === b ? ZERO : INF) : ZERO;
          scanned += 1;
          snap(
            at.clear,
            `${mirror ? 'Undirected: the mirror cell too. ' : `${label}: `}_clear_cell(${a}, ${b}): present[${a}][${b}] = False and matrix[${a}][${b}] = ${pyNumRepr(mat[a][b])}` +
              `${weighted ? (a === b ? ' (0 on the diagonal)' : ' (inf means no edge)') : ''}.${had ? '' : ' There was no edge in this cell, so nothing visible changes.'}`,
            { cells: { [`${a},${b}`]: had ? 'active' : 'compare' }, vertices: { [u]: 'compare', [v]: 'compare' } },
          );
        };
        clear(u, v, false);
        if (!directed) clear(v, u, true);
        return 'None';
      }
      case 'has_edge': {
        const { u, v } = op;
        if (!inRange(u) || !inRange(v)) {
          snap(at.has, `${label}: a vertex is outside [0, ${n}), so has_edge returns False.`, {});
          return 'False';
        }
        scanned += 1;
        const yes = present[u][v];
        snap(
          at.has,
          `${label}: read one cell, present[${u}][${v}], which is ${yes ? 'True' : 'False'}: O(1), whatever the size of the graph.` +
            (yes && weighted && mat[u][v].v === 0 ? ' The weight is 0, which the presence table keeps apart from "no edge".' : ''),
          { cells: { [`${u},${v}`]: 'compare' }, vertices: { [u]: yes ? 'good' : 'bad', [v]: yes ? 'good' : 'bad' }, edges: yes ? { [edgeKey(u, v, directed)]: 'good' } : {} },
        );
        return yes ? 'True' : 'False';
      }
      case 'get_weight': {
        const { u, v } = op;
        if (!weighted) {
          snap(at.weight, `${label}: the matrix is unweighted, so get_weight returns None.`, {});
          return 'None';
        }
        if (!inRange(u) || !inRange(v)) {
          snap(at.weight, `${label}: a vertex is outside [0, ${n}), so get_weight returns None.`, {});
          return 'None';
        }
        scanned += 1;
        if (!present[u][v]) {
          snap(at.weight, `${label}: present[${u}][${v}] is False, so get_weight returns None (it does not return the ${pyNumRepr(mat[u][v])} in the matrix).`, {
            cells: { [`${u},${v}`]: 'compare' },
            vertices: { [u]: 'bad', [v]: 'bad' },
          });
          return 'None';
        }
        snap(at.weight, `${label}: present[${u}][${v}] is True, so get_weight returns matrix[${u}][${v}] = ${pyNumRepr(mat[u][v])}.`, {
          cells: { [`${u},${v}`]: 'compare' },
          vertices: { [u]: 'good', [v]: 'good' },
          edges: { [edgeKey(u, v, directed)]: 'good' },
        });
        return pyNumRepr(mat[u][v]);
      }
      case 'get_neighbors':
      case 'get_degree': {
        const { v } = op;
        if (!inRange(v)) {
          snap(op.kind === 'get_neighbors' ? at.neighbors : at.degree, `${label}: ${v} is outside [0, ${n}), so it returns ${op.kind === 'get_neighbors' ? '[]' : '0'}.`, {});
          return op.kind === 'get_neighbors' ? '[]' : '0';
        }
        scanned += n;
        const cells: Record<string, Role> = {};
        const found: number[] = [];
        for (let i = 0; i < n; i++) {
          cells[`${v},${i}`] = present[v][i] ? 'active' : 'compare';
          if (present[v][i]) found.push(i);
        }
        if (op.kind === 'get_neighbors') {
          const res = pyList(found);
          snap(at.neighbors, `${label}: has_edge(${v}, i) for every i in range(${n}): the whole row ${v} is read, ${n} cells, even if ${v} has ${plural(found.length, 'neighbor')}. Returns ${res}. O(V), where a list would read only its own entries.`, {
            cells,
            vertices: { [v]: 'active', ...Object.fromEntries(found.map((x) => [x, 'done' as Role])) },
            edges: Object.fromEntries(found.map((x) => [edgeKey(v, x, directed), 'done' as Role])),
          });
          return res;
        }
        snap(at.degree, `${label}: count the present cells of row ${v}: ${found.length} out of ${n} read.${directed ? ' That is the out-degree.' : ''}`, { cells, vertices: { [v]: 'active' } });
        if (!directed) return String(found.length);
        scanned += n;
        const col: Record<string, Role> = {};
        let inDeg = 0;
        for (let i = 0; i < n; i++) {
          col[`${i},${v}`] = present[i][v] ? 'active' : 'compare';
          if (present[i][v]) inDeg += 1;
        }
        snap(at.inDegree, `Directed: the in-degree is the column: has_edge(i, ${v}) for every i finds ${inDeg}. get_degree returns ${found.length} + ${inDeg} = ${found.length + inDeg}.${present[v][v] ? ' The self-loop counts in both.' : ''}`, {
          cells: col,
          vertices: { [v]: 'active' },
        });
        return String(found.length + inDeg);
      }
      default:
        return null;
    }
  };

  /* ----- edge list ----- */

  /** _remove_edge_from_list(u, v): a comprehension over every edge. */
  const filterEdges = (u: number, v: number, line: number | undefined, intro: string, tail = ''): boolean => {
    scanned += edges.length;
    const hit = edges.map((t, i) => ({ t, i })).filter(({ t }) => t.u === u && t.v === v);
    const entries: Record<string, Role> = Object.fromEntries(edges.map((t) => [t.id, 'compare' as Role]));
    if (!edges.length) {
      snap(line, `${intro}_remove_edge_from_list(${u}, ${v}): edges is empty, so there is nothing to read or drop.${tail}`, { vertices: { [u]: 'compare', [v]: 'compare' } });
      return false;
    }
    if (!hit.length) {
      snap(line, `${intro}_remove_edge_from_list(${u}, ${v}) rebuilds the list from all ${plural(edges.length, 'edge')} and finds no (${u}, ${v}...): nothing is dropped, but every edge was read.${tail}`, {
        entries,
        vertices: { [u]: 'compare', [v]: 'compare' },
      });
      return false;
    }
    const old = edges;
    edges = edges.filter((t) => !(t.u === u && t.v === v));
    const moved = old.length - 1 - hit[hit.length - 1].i;
    // First the old positions, with the dropped tuple fading out; then the rebuilt list.
    snap(
      line,
      `${intro}_remove_edge_from_list(${u}, ${v}) reads all ${plural(old.length, 'edge')} and keeps every tuple except ${hit.map(({ t }) => tupleLabel(t)).join(', ')}.${moved > 0 ? '' : tail}`,
      {
        cellsAt: old.map((t, i) => ({ id: t.id, label: tupleLabel(t), role: hit.some((x) => x.t === t) ? 'bad' : 'compare', ghost: hit.some((x) => x.t === t), index: i })),
        vertices: { [u]: 'compare', [v]: 'compare' },
        edges: { [edgeKey(u, v, directed)]: 'bad' },
      },
    );
    if (moved > 0) {
      snap(line, `The comprehension builds a new list, so the ${plural(moved, 'tuple')} after it ${moved === 1 ? 'moves' : 'move'} one place left.${tail}`, {
        entries: Object.fromEntries(old.slice(hit[hit.length - 1].i + 1).map((t) => [t.id, 'active' as Role])),
      });
    }
    return true;
  };

  const scanEdges = (u: number, v: number, line: number | undefined, test: (t: EdgeTuple) => boolean, hitText: (t: EdgeTuple) => string): EdgeTuple | null => {
    for (let i = 0; i < edges.length; i++) {
      scanned += 1;
      const t = edges[i];
      const entries: Record<string, Role> = {};
      for (let k = 0; k < i; k++) entries[edges[k].id] = 'muted';
      const hit = test(t);
      entries[t.id] = hit ? 'good' : 'compare';
      snap(line, hit ? `edges[${i}] is ${tupleLabel(t)}: ${hitText(t)} ${plural(i + 1, 'edge')} read.` : `edges[${i}] is ${tupleLabel(t)}, not (${u}, ${v}...): read the next edge.`, {
        entries,
        vertices: { [u]: 'compare', [v]: 'compare' },
        edges: hit ? { [edgeKey(u, v, directed)]: 'good' } : {},
      });
      if (hit) return t;
    }
    return null;
  };

  const edgeListOp = (op: RepOp, label: string): string | null => {
    switch (op.kind) {
      case 'add_edge': {
        const { u, v } = op;
        const fresh = [u, v].filter((x, i, a) => a.indexOf(x) === i && !vset.has(x));
        vset.add(u);
        vset.add(v);
        const intro = fresh.length ? '' : `${label}: `;
        if (fresh.length) {
          snap(at.addVertices, `${label}: vertices.add(${u}) and vertices.add(${v}): ${fresh.join(' and ')} ${fresh.length === 1 ? 'is' : 'are'} new. The vertices live in a separate set; the list holds only edges.`, {
            vertices: Object.fromEntries(fresh.map((x) => [x, 'active' as Role])),
          });
        }
        filterEdges(u, v, at.removeFirst, `${intro}remove_edge(${u}, ${v}) runs first, so a repeated edge is replaced: `);
        if (!directed) filterEdges(v, u, at.removeFirst, 'Undirected, so remove_edge also runs ');
        const w = weighted ? (op.w ?? FLOAT_ONE) : null;
        const t: EdgeTuple = { id: `t${ids++}`, u, v, w };
        edges.push(t);
        snap(
          at.appendFwd,
          `edges.append(${tupleLabel(t)}): the new edge goes at the end, index ${edges.length - 1}.` +
            (weighted && op.w === null ? ' No weight was given, so it is 1.0.' : '') +
            (!weighted && op.w !== null ? ` The list is unweighted, so the weight ${pyNumRepr(op.w)} is dropped.` : '') +
            (directed ? ' Directed: stored once.' : ''),
          { entries: { [t.id]: 'active' }, edges: { [edgeKey(u, v, directed)]: 'active' }, vertices: { [u]: 'active', [v]: 'compare' } },
        );
        if (!directed) {
          filterEdges(v, u, at.reverse, `Undirected: before the reverse edge goes in, `, u === v ? ' For a self-loop that is the edge just appended, so it is taken out again.' : '');
          const r: EdgeTuple = { id: `t${ids++}`, u: v, v: u, w };
          edges.push(r);
          snap(
            at.reverse,
            `edges.append(${tupleLabel(r)}): ${u === v ? 'a self-loop is therefore stored once.' : 'the undirected edge is now stored twice, once per direction.'}`,
            { entries: { [r.id]: 'active', [t.id]: u === v ? 'active' : 'done' }, edges: { [edgeKey(u, v, directed)]: 'active' }, vertices: { [u]: 'compare', [v]: 'active' } },
          );
        }
        return 'None';
      }
      case 'remove_edge': {
        const { u, v } = op;
        const a = filterEdges(u, v, at.removeStart, `${label}: `);
        if (!directed) filterEdges(v, u, at.removeRev, 'Undirected: the reverse tuple too. ', a ? ' Both directions are gone.' : '');
        return 'None';
      }
      case 'has_edge': {
        const { u, v } = op;
        const t = scanEdges(u, v, at.has, (e) => e.u === u && e.v === v, () => 'it matches, so any() stops and has_edge returns True.');
        if (!t) {
          snap(at.has, `${label}: no tuple starts with (${u}, ${v}), so has_edge returns False after reading all ${plural(edges.length, 'edge')}: O(E).`, {
            entries: Object.fromEntries(edges.map((e) => [e.id, 'muted' as Role])),
            vertices: { [u]: 'bad', [v]: 'bad' },
          });
          return 'False';
        }
        return 'True';
      }
      case 'get_weight': {
        const { u, v } = op;
        if (!weighted) {
          snap(at.weight, `${label}: the edge list is unweighted, so get_weight returns None without reading it.`, {});
          return 'None';
        }
        const t = scanEdges(u, v, at.weight, (e) => e.u === u && e.v === v, (e) => `it matches, so get_weight returns its weight ${pyNumRepr(e.w!)}.`);
        if (!t) {
          snap(at.weight, `${label}: no edge (${u}, ${v}) in the list, so get_weight returns None.`, { vertices: { [u]: 'bad', [v]: 'bad' } });
          return 'None';
        }
        return pyNumRepr(t.w!);
      }
      case 'get_neighbors': {
        const { v } = op;
        scanned += edges.length;
        const res: number[] = [];
        const entries: Record<string, Role> = {};
        for (const t of edges) {
          if (t.u === v && !res.includes(t.v)) {
            res.push(t.v);
            entries[t.id] = 'good';
          } else entries[t.id] = 'compare';
        }
        const text = pyList(res);
        snap(at.neighbors, `${label}: every edge is read to find the ones that start at ${v}: ${plural(edges.length, 'edge')} for ${plural(res.length, 'neighbor')}. Returns ${text}. O(E) per call, which is why BFS on an edge list is slow.`, {
          entries,
          vertices: { [v]: 'active', ...Object.fromEntries(res.map((x) => [x, 'done' as Role])) },
          edges: Object.fromEntries(res.map((x) => [edgeKey(v, x, directed), 'done' as Role])),
        });
        return text;
      }
      case 'get_edge_count': {
        if (directed) {
          snap(at.count, `${label}: directed, so every tuple is one edge: len(edges) = ${edges.length}.`, {});
          return String(edges.length);
        }
        scanned += edges.length;
        const loops = edges.filter((t) => t.u === t.v);
        const count = Math.floor((edges.length - loops.length) / 2) + loops.length;
        snap(
          at.countLoops,
          `${label}: undirected, so an edge u-v is stored twice but a self-loop only once. loops = ${loops.length}; (${edges.length} - ${loops.length}) // 2 + ${loops.length} = ${count}.`,
          { entries: Object.fromEntries(loops.map((t) => [t.id, 'active' as Role])) },
        );
        return String(count);
      }
      default:
        return null;
    }
  };

  /* ----- run ----- */

  const ctorText: Record<RepMode, string> = {
    list: `AdjacencyList(${input.n ?? 0}, directed=${directed ? 'True' : 'False'}, weighted=${weighted ? 'True' : 'False'}): a dict from each vertex to the list of its ${weighted ? '(neighbor, weight) tuples' : 'neighbors'}. ${input.n ? `num_vertices = ${input.n}, so add_vertex(0) .. add_vertex(${input.n - 1}) give each vertex an empty list.` : 'num_vertices = 0: vertices appear as edges arrive.'}`,
    matrix: `AdjacencyMatrix(${n}, directed=${directed ? 'True' : 'False'}, weighted=${weighted ? 'True' : 'False'}): a ${n} x ${n} matrix ${weighted ? 'of inf (no edge) with 0 on the diagonal' : 'of 0'}, and a ${n} x ${n} table present of False that says which cells hold an edge.${input.n === null ? ` The class has no default size, and the script gives no "n", so it is built for ${n} vertices${largestVertex(input) + 1 > n ? ` (at most ${REP_LIMITS.maxVertices} fit on screen)` : ', the largest vertex used + 1'}.` : ''}`,
    edges: `EdgeList(directed=${directed ? 'True' : 'False'}, weighted=${weighted ? 'True' : 'False'}): edges = [] and vertices = set(). An edge is a ${weighted ? '(u, v, weight)' : '(u, v)'} tuple in one flat list.${input.n !== null ? ' EdgeList takes no vertex count, so "n" is ignored here.' : ''}`,
    graph: `Graph(directed=${directed ? 'True' : 'False'}): adjacency_list = {}. ${directed ? 'Directed: an edge u -> v is stored once, in the list of u.' : 'Undirected: an edge u - v is stored in both lists.'}`,
    weighted: `WeightedGraph(directed=${directed ? 'True' : 'False'}): adjacency_list = {}, each list holding (neighbor, weight) tuples. An edge added without a weight gets 1.0, so an unweighted graph is just one where every weight is 1.0.`,
  };
  if (mode === 'list' && input.n) for (let i = 0; i < input.n; i++) ensure(i);
  snap(mode === 'matrix' ? AT.matrix.initFill : at.init, ctorText[mode]);
  const initial = storeRepr();

  ops.forEach((op, k) => {
    current = k;
    const label = labels[k];
    const before = scanned;
    if (!METHODS[mode].includes(op.kind)) {
      missing(op, label);
      return;
    }
    if (mode === 'graph' && op.kind === 'add_edge' && op.w !== null) {
      snap(at.addVertices, `${label} raises TypeError: Graph.add_edge(from_vertex, to_vertex) takes no weight. The Weighted and Unweighted Graphs topic stores weights.`, {});
      steps.push({ op, result: null, error: 'TypeError', state: storeRepr() });
      return;
    }
    let result: string | null = 'None';
    if (mode === 'matrix') {
      result = matrixOp(op, label);
      if (result === null) {
        steps.push({ op, result: null, error: 'ValueError', state: storeRepr() });
        return;
      }
    } else if (mode === 'edges') {
      result = edgeListOp(op, label);
    } else {
      switch (op.kind) {
        case 'add_vertex': {
          const fresh = ensure(op.v);
          snap(at.vertex, fresh ? `${label}: ${op.v} is new, so adjacency_list[${op.v}] = []: a vertex with no edges yet.` : `${label}: ${op.v} is already a vertex, so nothing changes (its list is kept).`, {
            vertices: { [op.v]: fresh ? 'active' : 'compare' },
            rows: { [op.v]: fresh ? 'active' : 'compare' },
          });
          break;
        }
        case 'add_edge':
          listAddEdge(op.u, op.v, op.w, label);
          break;
        case 'remove_edge':
          listRemoveEdge(op.u, op.v, label);
          break;
        case 'has_edge':
          result = listHasEdge(op.u, op.v, label);
          break;
        case 'get_weight':
          result = listGetWeight(op.u, op.v, label);
          break;
        case 'get_neighbors':
          result = listNeighbors(op.v, label);
          break;
        case 'get_degree':
          result = listDegree(op.v, label);
          break;
        case 'get_total_weight':
          result = totalWeight(label);
          break;
        default:
          break;
      }
    }
    if (result !== 'None' || op.kind === 'get_weight') {
      ret(result!);
      snap(undefined, `${label} returns ${result}. ${plural(scanned - before, 'stored entry', 'stored entries')} read for this call.`, { fresh: true });
    }
    steps.push({ op, result, error: null, state: storeRepr() });
  });

  current = ops.length;
  const vs = drawnVertices().length;
  const es = drawnEdges().length;
  snap(undefined, `Done: ${plural(vs, 'vertex', 'vertices')} and ${plural(es, 'edge')}, held as ${storeSummary(mode, directed)}. In total ${plural(scanned, 'stored entry', 'stored entries')} were read.`);
  return { frames, initial, steps };
}

function storeSummary(mode: RepMode, directed: boolean): string {
  if (mode === 'matrix') return 'a V x V matrix, whatever the number of edges';
  if (mode === 'edges') return directed ? 'one tuple per edge' : 'two tuples per edge (one for a self-loop)';
  return directed ? 'one list entry per edge' : 'two list entries per edge (one for a self-loop)';
}

function missingWhy(mode: RepMode, kind: RepOp['kind']): string {
  if (kind === 'add_vertex') return mode === 'matrix' ? 'The matrix has a fixed size, set by num_vertices.' : 'Vertices join the vertex set through add_edge.';
  if (kind === 'get_degree') return 'Count the entries yourself, or use a class that has it.';
  if (kind === 'get_edge_count') return 'Only EdgeList counts its edges.';
  if (kind === 'get_total_weight') return 'Only WeightedGraph sums its weights.';
  if (kind === 'get_weight') return 'Graph stores no weights.';
  return 'The run goes on with the next operation.';
}
