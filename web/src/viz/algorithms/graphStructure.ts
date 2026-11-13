/**
 * Graph-structure tracers: Kahn's topological sort, Kosaraju's and Tarjan's
 * strongly connected components, and Tarjan's bridges / articulation points.
 *
 * Each one mirrors the repository implementation in
 * Algorithms/Graph_Algorithms/Advanced_Graph/<topic>/Python step for step, run on
 * the adjacency dict {v: sorted neighbors} for v in name order. Golden fixtures
 * (__fixtures__/graphStructure.json, written by web/scripts/gen_graphStructure_fixtures.py)
 * pin the results to the Python code.
 *
 * Input uses the shared graph syntax: "A->B, B->C" (directed) or "A-B" (undirected).
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GraphState } from '../renderers/GraphView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { adjacency, circleLayout, parseGraph, type Graph } from './graph';

export type GraphFrame = Frame<GraphState>;
type Vars = NonNullable<GraphFrame['vars']>;

const ARROW = SYM.rightArrow;

export function parseDigraph(text: string): Graph {
  const g = parseGraph(text);
  const undirected = g.edges.find((e) => !e.directed);
  if (undirected) {
    const { from, to } = undirected;
    throw new InputError(`This algorithm needs directed edges: write "${from}->${to}" (or "${to}->${from}") instead of "${from}-${to}".`);
  }
  return g;
}

export function parseUndirected(text: string): Graph {
  const g = parseGraph(text);
  const directed = g.edges.find((e) => e.directed);
  if (directed) {
    const { from, to } = directed;
    throw new InputError(`Bridges and cut vertices are defined for undirected graphs: write "${from}-${to}" instead of "${from}->${to}".`);
  }
  return g;
}

/** Snapshots of one graph run; `flipped` draws every edge reversed (Kosaraju's transpose). */
class Recorder {
  frames: GraphFrame[] = [];
  nodeRole = new Map<string, Role>();
  edgeRole = new Map<number, Role>();
  badges = new Map<string, string>();
  flipped = false;
  private readonly pos: Map<string, { x: number; y: number }>;

  constructor(readonly g: Graph) {
    this.pos = circleLayout(g.nodes);
  }

  snap(line: number | undefined, caption: string, strips: StripData[], vars: Vars, extra: { nodes?: Record<string, Role>; edges?: Record<number, Role> } = {}) {
    this.frames.push({
      line,
      caption,
      vars,
      state: {
        nodes: this.g.nodes.map((id) => ({
          id,
          ...this.pos.get(id)!,
          role: extra.nodes?.[id] ?? this.nodeRole.get(id) ?? 'idle',
          badge: this.badges.get(id),
        })),
        edges: this.g.edges.map((e, i) => ({
          id: i,
          from: this.flipped ? e.to : e.from,
          to: this.flipped ? e.from : e.to,
          directed: e.directed,
          weight: e.weight,
          role: extra.edges?.[i] ?? this.edgeRole.get(i) ?? 'idle',
        })),
        showWeights: false,
        strips,
      },
    });
  }
}

function strip(label: string, items: Array<string | StripItem>, empty = '(empty)'): StripData {
  return { label, items: items.length ? items.map((it) => (typeof it === 'string' ? { text: it } : it)) : [{ text: empty }] };
}

const names = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const set = (xs: string[]) => `{${xs.join(', ')}}`;
const plural = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;

function ordinal(k: number): string {
  const tens = k % 100;
  if (tens >= 11 && tens <= 13) return `${k}th`;
  return `${k}${['th', 'st', 'nd', 'rd'][k % 10] ?? 'th'}`;
}

// ---------------------------------------------------------------- topological sort (Kahn)

export interface TopoRun {
  frames: GraphFrame[];
  /** The order Kahn's algorithm produced (all vertices for a DAG, a prefix otherwise). */
  order: string[];
  cyclic: boolean;
  /** Vertices never placed: they lie on a cycle or can only be reached through one. */
  stuck: string[];
  /** One cycle among the stuck vertices, first vertex repeated at the end ([] for a DAG). */
  cycle: string[];
}

/**
 * One cycle inside `stuck`. Every stuck vertex keeps an incoming edge from another
 * stuck vertex, so walking those edges backwards must revisit a vertex.
 */
function cycleAmong(g: Graph, stuck: string[]): { nodes: string[]; edges: number[] } {
  const inStuck = new Set(stuck);
  const seenAt = new Map<string, number>();
  const walk: string[] = [];
  const via: number[] = []; // via[i]: edge walk[i+1] -> walk[i]
  let v = stuck[0];
  while (!seenAt.has(v)) {
    seenAt.set(v, walk.length);
    walk.push(v);
    const target = v;
    const e = g.edges.findIndex((edge) => edge.to === target && inStuck.has(edge.from));
    via.push(e);
    v = g.edges[e].from;
  }
  const start = seenAt.get(v)!;
  // Forward: walk[start] -> walk[k] -> walk[k-1] -> ... -> walk[start+1] -> walk[start].
  const nodes = [walk[start], ...walk.slice(start + 1).reverse(), walk[start]];
  const edges = via.slice(start);
  return { nodes, edges };
}

export function topologicalSort(g: Graph): TopoRun {
  const adj = adjacency(g);
  const r = new Recorder(g);
  const V = g.nodes.length;
  const indeg = new Map(g.nodes.map((n) => [n, 0]));
  for (const e of g.edges) indeg.set(e.to, indeg.get(e.to)! + 1);
  const queue: string[] = [];
  const order: string[] = [];
  const showIn = (v: string) => r.badges.set(v, `in=${indeg.get(v)}`);
  g.nodes.forEach(showIn);
  const strips = () => [strip('Ready queue', queue), strip('Order', order, '-')];
  const vars = (...extra: Vars): Vars => [...extra, ['queue size', queue.length], ['placed', `${order.length} of ${V}`]];

  r.snap(0, 'Count the edges into every vertex. The badge in=k says how many of its prerequisites are not placed yet.', strips(), vars());
  for (const n of g.nodes) {
    if (indeg.get(n) === 0) {
      queue.push(n);
      r.nodeRole.set(n, 'compare');
    }
  }
  r.snap(
    1,
    queue.length
      ? `${names(queue)} ${queue.length === 1 ? 'has' : 'have'} in-degree 0: nothing has to come before ${queue.length === 1 ? 'it' : 'them'}, so ${queue.length === 1 ? 'it starts' : 'they start'} in the ready queue.`
      : 'No vertex has in-degree 0: every vertex waits for another one, so the graph must contain a cycle.',
    strips(),
    vars(),
  );

  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    r.nodeRole.set(u, 'active');
    r.badges.set(u, `#${order.length}`);
    r.snap(
      4,
      `Dequeue ${u} and place it ${ordinal(order.length)}: ${order.length === 1 ? 'it has no prerequisites' : 'all of its prerequisites are already placed'}. Now remove its outgoing edges.`,
      strips(),
      vars(['u', u]),
    );
    for (const { to: v, edge } of adj.get(u)!) {
      const before = indeg.get(v)!;
      indeg.set(v, before - 1);
      showIn(v);
      r.edgeRole.set(edge, 'muted');
      const left = before - 1;
      r.snap(
        6,
        `Remove ${u}${ARROW}${v}: ${u} is placed, so ${v}'s in-degree drops from ${before} to ${left}${left > 0 ? ` (${v} still waits for ${plural(left, 'more edge', 'more edges')})` : ''}.`,
        strips(),
        vars(['u', u], ['v', v], ['in[v]', left]),
        { edges: { [edge]: 'compare' } },
      );
      if (left === 0) {
        queue.push(v);
        r.nodeRole.set(v, 'compare');
        r.snap(7, `${v}'s in-degree reached 0: everything that must come before ${v} is placed, so ${v} joins the back of the ready queue.`, strips(), vars(['u', u], ['v', v], ['in[v]', 0]));
      }
    }
    r.nodeRole.set(u, 'done');
  }

  if (order.length === V) {
    r.snap(
      9,
      `Done: all ${V} vertices are placed, and ${order.join(' ')} is a topological order. Every edge points from an earlier vertex to a later one (the badges #k give the positions).`,
      strips(),
      vars(),
    );
    return { frames: r.frames, order, cyclic: false, stuck: [], cycle: [] };
  }

  const placed = new Set(order);
  const stuck = g.nodes.filter((n) => !placed.has(n));
  const cycle = cycleAmong(g, stuck);
  for (const n of stuck) r.nodeRole.set(n, 'bad');
  for (const e of cycle.edges) r.edgeRole.set(e, 'active');
  const behind = stuck.filter((n) => !cycle.nodes.includes(n));
  r.snap(
    8,
    `Stuck: the queue is empty, but ${names(stuck)} never reached in-degree 0, because each still waits for another stuck vertex. ` +
      `Following those waits backwards finds the cycle ${cycle.nodes.join(` ${ARROW} `)}` +
      `${behind.length ? ` (${names(behind)} only ${behind.length === 1 ? 'waits' : 'wait'} behind it)` : ''}. ` +
      'A cycle has no valid order, so topological_sort_kahn returns None (C++ and Go return an empty list).',
    strips(),
    vars(['stuck', stuck.length]),
  );
  return { frames: r.frames, order, cyclic: true, stuck, cycle: cycle.nodes };
}

// ---------------------------------------------------------------- strongly connected components

export interface SccRun {
  frames: GraphFrame[];
  /** Components in the order the algorithm emits them, members in discovery / pop order. */
  components: string[][];
}

/** Transpose in the repository's order: for u in name order, for v in adj[u]: radj[v].append(u). */
function transpose(g: Graph, adj: ReturnType<typeof adjacency>): Map<string, Array<{ to: string; edge: number }>> {
  const radj = new Map<string, Array<{ to: string; edge: number }>>(g.nodes.map((n) => [n, []]));
  for (const u of g.nodes) for (const { to, edge } of adj.get(u)!) radj.get(to)!.push({ to: u, edge });
  return radj;
}

const componentStrip = (components: string[][], current?: number) =>
  strip(
    'Components',
    components.map((c, i) => ({ text: `C${i + 1}: ${c.join(' ')}`, role: (i === current ? 'compare' : 'done') as Role })),
    '(none yet)',
  );

export function kosaraju(g: Graph): SccRun {
  const adj = adjacency(g);
  const radj = transpose(g, adj);
  const r = new Recorder(g);
  const visited = new Set<string>();
  const finish: string[] = [];
  const fin = new Map<string, number>();
  const callStack: string[] = [];
  const comp = new Map<string, number>();
  const components: string[][] = [];
  let pass = 1;
  let cursor = -1; // pass 2: index into finish of the vertex being considered

  const strips = (current?: number) =>
    pass === 1
      ? [strip('DFS stack', callStack), strip('Finish order', finish, '-')]
      : [
          strip(
            'Finish order',
            finish.map((v, i) => ({ text: v, role: (i === cursor ? 'active' : i > cursor ? 'muted' : undefined) as Role | undefined })),
          ),
          componentStrip(components, current),
        ];
  const vars = (...extra: Vars): Vars => [['pass', pass], ...extra, ['finished', finish.length], ['components', components.length]];

  // Pass 1: DFS on G in name order, recording finish order.
  const dfs1 = (u: string, parent?: string) => {
    visited.add(u);
    callStack.push(u);
    r.nodeRole.set(u, 'active');
    r.snap(2, parent ? `Visit ${u}, reached from ${parent}.` : `${u} is unvisited: start a new DFS at ${u}.`, strips(), vars(['u', u]));
    for (const { to: v, edge } of adj.get(u)!) {
      if (visited.has(v)) {
        r.edgeRole.set(edge, 'muted');
        r.snap(3, `Edge ${u}${ARROW}${v}: ${v} is already visited, so skip it.`, strips(), vars(['u', u], ['v', v]), { edges: { [edge]: 'compare' } });
        continue;
      }
      r.edgeRole.set(edge, 'done');
      r.nodeRole.set(u, 'compare');
      dfs1(v, u);
      r.nodeRole.set(u, 'active');
    }
    callStack.pop();
    finish.push(u);
    fin.set(u, finish.length);
    r.badges.set(u, `f=${finish.length}`);
    r.nodeRole.set(u, 'done');
    r.snap(4, `Every edge out of ${u} is explored: ${u} finishes ${ordinal(finish.length)} (f=${finish.length}) and goes on the finish stack.`, strips(), vars(['u', u]));
  };

  r.snap(1, 'Pass 1: run a DFS on G from every unvisited vertex, in name order, and record the order in which vertices finish.', strips(), vars());
  for (const s of g.nodes) if (!visited.has(s)) dfs1(s);

  // Transpose.
  pass = 2;
  cursor = finish.length;
  r.flipped = true;
  r.edgeRole.clear();
  r.nodeRole.clear();
  r.snap(
    6,
    'Pass 2 works on the transpose G^T: every edge flips. Each SCC keeps its vertices (a cycle reversed is still a cycle), but edges between components now point the other way. The badges keep the finish ranks.',
    strips(),
    vars(),
  );

  // Pass 2: DFS on G^T in decreasing finish order; each DFS tree is one SCC.
  const join = (u: string, c: number) => {
    comp.set(u, c);
    components[c - 1].push(u);
    r.badges.set(u, `C${c}`);
  };
  const dfs2 = (u: string, c: number, root: string) => {
    for (const { to: v, edge } of radj.get(u)!) {
      r.nodeRole.set(u, 'active');
      if (comp.has(v)) {
        r.edgeRole.set(edge, 'muted');
        const where = comp.get(v) === c ? `already in C${c}` : `already in C${comp.get(v)}, found earlier`;
        r.snap(10, `Edge ${u}${ARROW}${v} of G^T (${v}${ARROW}${u} in G): ${v} is ${where}. Skip it.`, strips(c - 1), vars(['u', u], ['v', v]), { edges: { [edge]: 'compare' } });
        continue;
      }
      r.edgeRole.set(edge, 'done');
      join(v, c);
      r.nodeRole.set(u, 'compare');
      r.nodeRole.set(v, 'active');
      r.snap(
        9,
        `Edge ${u}${ARROW}${v} of G^T (${v}${ARROW}${u} in G): ${v} is unassigned, so it joins C${c}. Everything this DFS reaches can reach ${root} in G, and the finish order guarantees ${root} reaches it back.`,
        strips(c - 1),
        vars(['u', v], ['component', `C${c}`]),
      );
      dfs2(v, c, root);
    }
    r.nodeRole.set(u, 'compare');
  };

  for (let i = finish.length - 1; i >= 0; i--) {
    cursor = i;
    const s = finish[i];
    if (comp.has(s)) {
      r.snap(8, `Next on the finish stack: ${s} (f=${fin.get(s)}). It already belongs to C${comp.get(s)}, so skip it.`, strips(), vars(['u', s]), { nodes: { [s]: 'active' } });
      continue;
    }
    components.push([]);
    const c = components.length;
    join(s, c);
    r.nodeRole.set(s, 'active');
    r.snap(
      7,
      `Pop ${s} (f=${fin.get(s)}), the latest-finishing unassigned vertex, and start C${c} there. ${s}'s component is a source among the components still unassigned, so it is a sink in G^T: a DFS from ${s} on G^T cannot leak into another component.`,
      strips(c - 1),
      vars(['u', s], ['component', `C${c}`]),
    );
    dfs2(s, c, s);
    for (const m of components[c - 1]) r.nodeRole.set(m, 'done');
    r.snap(
      8,
      `No unassigned vertex is reachable from C${c} in G^T, so ${set(components[c - 1])} is a strongly connected component: C${c}.`,
      strips(),
      vars(['component', `C${c}`]),
    );
  }
  cursor = -1;
  r.snap(
    undefined,
    `Done: ${plural(components.length, 'strongly connected component')}. Kosaraju finds them in topological order of the condensation (sources first): every edge between components goes from a lower Ck to a higher one.`,
    strips(),
    vars(),
  );
  return { frames: r.frames, components };
}

export function tarjanScc(g: Graph): SccRun {
  const adj = adjacency(g);
  const r = new Recorder(g);
  const disc = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const comp = new Map<string, number>();
  const components: string[][] = [];
  let index = 0;

  const showDl = (u: string) => r.badges.set(u, `${disc.get(u)}/${low.get(u)}`);
  const strips = () => [strip('Tarjan stack', stack), componentStrip(components)];
  const vars = (u?: string, ...extra: Vars): Vars => [
    ...(u === undefined ? [] : ([['u', u], ['disc[u]', disc.get(u)!], ['low[u]', low.get(u)!]] as Vars)),
    ...extra,
    ['next index', index],
  ];

  const strongconnect = (u: string, parent?: string) => {
    disc.set(u, index);
    low.set(u, index);
    index++;
    stack.push(u);
    onStack.add(u);
    showDl(u);
    r.nodeRole.set(u, 'active');
    r.snap(
      1,
      `Discover ${u}${parent ? ` from ${parent}` : ''}: disc = low = ${disc.get(u)}. Push ${u} on the stack, where it stays until its whole component is known.`,
      strips(),
      vars(u),
    );
    for (const { to: v, edge } of adj.get(u)!) {
      if (!disc.has(v)) {
        r.edgeRole.set(edge, 'done');
        r.snap(4, `Edge ${u}${ARROW}${v}: ${v} has no discovery time yet, so this is a tree edge. Recurse into ${v}.`, strips(), vars(u, ['v', v]), { edges: { [edge]: 'compare' } });
        r.nodeRole.set(u, 'compare');
        strongconnect(v, u);
        r.nodeRole.set(u, 'active');
        const before = low.get(u)!;
        low.set(u, Math.min(before, low.get(v)!));
        showDl(u);
        r.snap(
          5,
          `Back at ${u}: low[${u}] = min(${before}, low[${v}] = ${low.get(v)}) = ${low.get(u)}.` +
            (low.get(u)! < before ? ` ${v}'s subtree reaches a vertex discovered at time ${low.get(u)} that is still on the stack.` : ''),
          strips(),
          vars(u, ['v', v]),
        );
      } else if (onStack.has(v)) {
        r.edgeRole.set(edge, 'muted');
        const before = low.get(u)!;
        low.set(u, Math.min(before, disc.get(v)!));
        showDl(u);
        r.snap(
          7,
          `Edge ${u}${ARROW}${v}: ${v} is still on the stack, so its component is not finished and ${u} can reach it. low[${u}] = min(${before}, disc[${v}] = ${disc.get(v)}) = ${low.get(u)}.`,
          strips(),
          vars(u, ['v', v]),
          { edges: { [edge]: 'compare' } },
        );
      } else {
        r.edgeRole.set(edge, 'muted');
        r.snap(
          6,
          `Edge ${u}${ARROW}${v}: ${v} is visited but no longer on the stack, because it already belongs to the finished component C${comp.get(v)}. ${v} cannot reach back to ${u}, so ignore the edge (using disc[${v}] here would wrongly merge the two).`,
          strips(),
          vars(u, ['v', v]),
          { edges: { [edge]: 'compare' } },
        );
      }
    }
    if (low.get(u) === disc.get(u)) {
      const members: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        members.push(w);
      } while (w !== u);
      components.push(members);
      const c = components.length;
      for (const m of members) {
        comp.set(m, c);
        r.nodeRole.set(m, 'done');
        r.badges.set(m, `C${c}`);
      }
      r.snap(
        9,
        `low[${u}] = disc[${u}] = ${disc.get(u)}: nothing in ${u}'s subtree reaches a vertex discovered before ${u}, so ${u} is the root of a component. Pop the stack down to ${u}: ${set(members)} is C${c}.`,
        strips(),
        vars(u, ['component', `C${c}`]),
      );
    } else {
      r.nodeRole.set(u, 'compare');
      r.snap(
        8,
        `${u} is finished, but low[${u}] = ${low.get(u)} < disc[${u}] = ${disc.get(u)}: it reaches an earlier vertex that is still on the stack. So ${u} stays on the stack and is popped with that vertex's component.`,
        strips(),
        vars(u),
      );
    }
  };

  r.snap(10, 'Run strongconnect from every vertex without a discovery time, in name order. Badges show disc/low; low is the smallest disc reachable while staying among vertices on the stack.', strips(), vars());
  for (const s of g.nodes) {
    if (disc.has(s)) continue;
    if (index > 0) r.snap(10, `${s} has no discovery time yet: start strongconnect(${s}).`, strips(), vars(), { nodes: { [s]: 'active' } });
    strongconnect(s);
  }
  r.snap(
    undefined,
    `Done: ${plural(components.length, 'strongly connected component')}. Tarjan emits them in reverse topological order of the condensation (sinks first): every edge between components goes from a higher Ck to a lower one.`,
    strips(),
    vars(),
  );
  return { frames: r.frames, components };
}

// ---------------------------------------------------------------- bridges and articulation points

export interface BridgeRun {
  frames: GraphFrame[];
  /** Bridges as [a, b] with a < b by name, sorted. */
  bridges: Array<[string, string]>;
  cutVertices: string[];
}

export function bridgesAndCutVertices(g: Graph): BridgeRun {
  const adj = adjacency(g);
  const r = new Recorder(g);
  const disc = new Map<string, number>();
  const low = new Map<string, number>();
  const path: string[] = [];
  const bridgeEdges: number[] = [];
  const cut = new Set<string>();
  const byName = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true });
  const label = (e: number) => [g.edges[e].from, g.edges[e].to].sort(byName).join('-');
  let timer = 0;

  const showDl = (u: string) => r.badges.set(u, `${disc.get(u)}/${low.get(u)}`);
  const strips = () => [
    strip('DFS path', path),
    strip('Bridges', bridgeEdges.map(label), '(none yet)'),
    strip('Cut vertices', [...cut].sort(byName), '(none yet)'),
  ];
  const vars = (u?: string, ...extra: Vars): Vars => [
    ...(u === undefined ? [] : ([['u', u], ['disc[u]', disc.get(u)!], ['low[u]', low.get(u)!]] as Vars)),
    ...extra,
    ['timer', timer],
  ];

  const dfs = (u: string, parentEdge: number, parent?: string) => {
    disc.set(u, timer);
    low.set(u, timer);
    timer++;
    path.push(u);
    showDl(u);
    r.nodeRole.set(u, 'active');
    r.snap(
      1,
      parent === undefined
        ? `${u} is unvisited: start a DFS at ${u} (the root of this DFS tree). disc = low = ${disc.get(u)}.`
        : `Discover ${u} from ${parent}: disc = low = ${disc.get(u)}. low will become the earliest disc that ${u}'s subtree can reach through one back edge.`,
      strips(),
      vars(u),
    );
    let children = 0;
    for (const { to: v, edge } of adj.get(u)!) {
      if (edge === parentEdge) {
        r.snap(
          3,
          `Skip edge ${u}-${v} (#${edge}): it is the tree edge we arrived on. The test compares edge ids, not neighbors, so a parallel copy of ${u}-${v} would still count as a back edge.`,
          strips(),
          vars(u, ['v', v]),
          { edges: { [edge]: 'compare' } },
        );
        continue;
      }
      if (!disc.has(v)) {
        children++;
        r.edgeRole.set(edge, 'done');
        r.snap(4, `Edge ${u}-${v}: ${v} is unvisited, so this is a tree edge. Descend into ${v}.`, strips(), vars(u, ['v', v]), { edges: { [edge]: 'compare' } });
        r.nodeRole.set(u, 'compare');
        dfs(v, edge, u);
        r.nodeRole.set(u, 'active');
        const before = low.get(u)!;
        low.set(u, Math.min(before, low.get(v)!));
        showDl(u);
        r.snap(5, `Back at ${u}: low[${u}] = min(${before}, low[${v}] = ${low.get(v)}) = ${low.get(u)}.`, strips(), vars(u, ['v', v]));
        const isBridge = low.get(v)! > disc.get(u)!;
        const isCut = parentEdge !== -1 && low.get(v)! >= disc.get(u)!;
        if (isBridge) {
          bridgeEdges.push(edge);
          r.edgeRole.set(edge, 'active');
        }
        if (isCut) cut.add(u);
        const bridgeText = isBridge
          ? `low[${v}] = ${low.get(v)} > disc[${u}] = ${disc.get(u)}: nothing below ${v} reaches ${u} or higher without this edge, so ${u}-${v} is a bridge.`
          : `low[${v}] = ${low.get(v)} <= disc[${u}] = ${disc.get(u)}: ${v}'s subtree has another way up to ${u} or above, so ${u}-${v} is not a bridge.`;
        const cutText =
          parentEdge === -1
            ? ` ${u} is the root, so its cut-vertex rule (two or more children) is checked when it finishes.`
            : isCut
              ? ` And low[${v}] >= disc[${u}]: without ${u}, ${v}'s subtree cannot reach the rest of the graph, so ${u} is a cut vertex.`
              : ` low[${v}] < disc[${u}]: ${v}'s subtree climbs above ${u}, so it does not make ${u} a cut vertex.`;
        r.snap(isCut ? 7 : 6, bridgeText + cutText, strips(), vars(u, ['v', v]), { nodes: isCut ? { [u]: 'bad' } : {} });
      } else {
        const before = low.get(u)!;
        low.set(u, Math.min(before, disc.get(v)!));
        showDl(u);
        const up = disc.get(v)! < disc.get(u)!;
        if (up) r.edgeRole.set(edge, 'muted');
        r.snap(
          8,
          up
            ? `Edge ${u}-${v}: ${v} was discovered earlier, so this is a back edge. ${u} can climb to ${v} without using its tree edge: low[${u}] = min(${before}, disc[${v}] = ${disc.get(v)}) = ${low.get(u)}.`
            : `Edge ${u}-${v}: ${v} was discovered after ${u} and is already finished (the same back edge, seen from the other end). low[${u}] = min(${before}, ${disc.get(v)}) stays ${low.get(u)}.`,
          strips(),
          vars(u, ['v', v]),
          { edges: { [edge]: 'compare' } },
        );
      }
    }
    path.pop();
    if (parentEdge === -1) {
      if (children > 1) cut.add(u);
      r.nodeRole.set(u, cut.has(u) ? 'bad' : 'done');
      r.snap(
        9,
        children > 1
          ? `${u} is the DFS root and has ${children} children. The DFS found no edge between their subtrees, so they meet only at ${u}: the root is a cut vertex.`
          : `${u} is the DFS root with ${plural(children, 'child', 'children')}, so removing ${u} disconnects nothing: the root is not a cut vertex.`,
        strips(),
        vars(u),
      );
    } else {
      r.nodeRole.set(u, cut.has(u) ? 'bad' : 'done');
    }
  };

  r.snap(10, 'Run a DFS from every unvisited vertex, in name order. Badges show disc/low.', strips(), vars());
  for (const s of g.nodes) if (!disc.has(s)) dfs(s, -1);

  const bridges = bridgeEdges.map((e) => [g.edges[e].from, g.edges[e].to].sort(byName) as [string, string]).sort((a, b) => byName(a[0], b[0]) || byName(a[1], b[1]));
  const cutVertices = [...cut].sort(byName);
  r.snap(
    undefined,
    bridges.length || cutVertices.length
      ? `Done. Bridges: ${bridges.length ? bridges.map((b) => b.join('-')).join(', ') : 'none'}. Cut vertices: ${cutVertices.length ? cutVertices.join(', ') : 'none'}. Removing any of them disconnects its part of the graph; every other edge lies on a cycle.`
      : 'Done. No bridges and no cut vertices: every edge lies on a cycle, and no single vertex holds the graph together.',
    strips(),
    vars(),
  );
  return { frames: r.frames, bridges, cutVertices };
}
