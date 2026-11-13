/**
 * Minimum spanning tree tracers: Kruskal (edges by weight + union-find) and
 * Prim (grow one tree from a start vertex with a lazy priority queue).
 *
 * Both mirror the repository's Python code step for step, tie-breaking included,
 * and golden fixtures (scripts/gen_greedy_fixtures.py) pin them to it:
 *   Kruskal: Algorithms/Greedy/Minimum Spanning Tree/Kruskal's Algorithm/Python/kruskal.py (kruskal_mst)
 *   Prim:    Algorithms/Greedy/Minimum Spanning Tree/Prim's Algorithm/Python/prim.py (prim_mst_edge_list)
 * Vertices are numbered in sorted name order, like the integer ids the Python code uses.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GraphState } from '../renderers/GraphView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { circleLayout, parseGraph, type Graph } from './graph';

export interface MstEdge {
  from: string;
  to: string;
  weight: number;
}

export interface MstRun {
  frames: Array<Frame<GraphState>>;
  /** Tree edges in the order they were added, oriented like the Python output. */
  mst: MstEdge[];
  total: number;
}

const MAX_ABS_WEIGHT = 999;

/** Undirected, weighted graph with at most one edge per pair of vertices. */
export function parseMstGraph(text: string): Graph {
  const g = parseGraph(text);
  const seen = new Set<string>();
  for (const e of g.edges) {
    if (e.directed) {
      throw new InputError(`Spanning trees use undirected edges: write "${e.from}-${e.to}" instead of "${e.from}->${e.to}".`);
    }
    if (Math.abs(e.weight) > MAX_ABS_WEIGHT) {
      throw new InputError(`Keep weights between -${MAX_ABS_WEIGHT} and ${MAX_ABS_WEIGHT} (${e.from}-${e.to} has ${e.weight}).`);
    }
    const key = [e.from, e.to].sort().join('-');
    if (seen.has(key)) {
      throw new InputError(`The pair ${key} has two edges. Keep one edge per pair (only the lighter one could ever be in an MST).`);
    }
    seen.add(key);
  }
  return g;
}

const strip = (label: string, items: Array<string | StripItem>): StripData => ({
  label,
  items: items.map((it) => (typeof it === 'string' ? { text: it } : it)),
});

function snapshot(
  g: Graph,
  pos: Map<string, { x: number; y: number }>,
  nodeRole: (id: string) => Role,
  edgeRole: (edge: number) => Role,
  strips: StripData[],
): GraphState {
  return {
    nodes: g.nodes.map((id) => ({ id, ...pos.get(id)!, role: nodeRole(id) })),
    edges: g.edges.map((e, i) => ({ id: i, from: e.from, to: e.to, directed: false, weight: e.weight, role: edgeRole(i) })),
    showWeights: true,
    strips,
  };
}

const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

// ---------------------------------------------------------------- Kruskal

export function kruskalRun(g: Graph): MstRun {
  const n = g.nodes.length;
  const index = new Map(g.nodes.map((v, i) => [v, i]));
  const pos = circleLayout(g.nodes);
  const name = (i: number) => `${g.edges[i].from}-${g.edges[i].to}`;

  // sorted(edges, key=weight) is stable: equal weights keep their input order.
  const order = g.edges.map((_, i) => i).sort((a, b) => g.edges[a].weight - g.edges[b].weight);

  // UnionFind from kruskal.py: path compression + union by rank.
  const parent = g.nodes.map((_, i) => i);
  const rank = g.nodes.map(() => 0);
  const find = (x: number): number => {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  };
  const union = (x: number, y: number): boolean => {
    const rx = find(x);
    const ry = find(y);
    if (rx === ry) return false;
    if (rank[rx] < rank[ry]) parent[rx] = ry;
    else if (rank[rx] > rank[ry]) parent[ry] = rx;
    else {
      parent[ry] = rx;
      rank[rx] += 1;
    }
    return true;
  };
  /** Root without path compression, so drawing a frame never changes the structure. */
  const rootOf = (x: number): number => {
    let r = x;
    while (parent[r] !== r) r = parent[r];
    return r;
  };

  const status = g.edges.map((): 'idle' | 'tree' | 'cycle' => 'idle');
  const mst: MstEdge[] = [];
  let total = 0;
  const frames: Array<Frame<GraphState>> = [];
  const inTree = new Set<string>();

  const components = (): string[][] => {
    const groups = new Map<number, string[]>();
    g.nodes.forEach((v, i) => {
      const r = rootOf(i);
      groups.set(r, [...(groups.get(r) ?? []), v]);
    });
    return [...groups.values()];
  };
  const setOf = (v: string) => components().find((c) => c.includes(v))!;
  const fmtSet = (c: string[]) => `{${c.join(', ')}}`;

  const push = (
    line: number | undefined,
    caption: string,
    current?: { edge: number; endpoints: Role },
    vars: Array<[string, string | number]> = [],
  ) => {
    const cur = current === undefined ? undefined : g.edges[current.edge];
    const nodeRole = (v: string): Role => {
      if (cur && (v === cur.from || v === cur.to)) return current!.endpoints;
      return inTree.has(v) ? 'done' : 'idle';
    };
    const edgeRole = (i: number): Role => {
      if (status[i] === 'tree') return 'done';
      if (status[i] === 'cycle') return 'muted';
      return i === current?.edge ? 'compare' : 'idle';
    };
    const edgeTokens = order.map((i): StripItem => {
      const text = `${name(i)} ${g.edges[i].weight}`;
      if (status[i] === 'tree') return { text: `${SYM.check} ${text}`, role: 'done' };
      if (status[i] === 'cycle') return { text: `${SYM.cross} ${text}` };
      return { text, role: i === current?.edge ? 'compare' : undefined };
    });
    const compTokens = components().map((c): StripItem => ({
      text: fmtSet(c),
      role: cur && (c.includes(cur.from) || c.includes(cur.to)) ? 'active' : undefined,
    }));
    frames.push({
      line,
      caption,
      vars: [...vars, ['tree edges', `${mst.length} / ${n - 1}`], ['total weight', total]],
      state: snapshot(g, pos, nodeRole, edgeRole, [strip('Edges by weight', edgeTokens), strip('Union-find sets', compTokens)]),
    });
  };

  const ties = order.some((e, k) => k > 0 && g.edges[order[k - 1]].weight === g.edges[e].weight);
  push(
    0,
    `Sort the ${plural(g.edges.length, 'edge')} by weight, lightest first${ties ? ' (equal weights keep their input order)' : ''}. Kruskal tries them in this order and keeps every edge that does not close a cycle.`,
  );
  push(1, `Every vertex starts as its own tree, so union-find holds ${n} one-vertex sets. A spanning tree of ${n} vertices needs ${plural(n - 1, 'edge')}.`);

  let stopped = -1;
  for (let k = 0; k < order.length; k++) {
    const i = order[k];
    const { from: u, to: v, weight: w } = g.edges[i];
    const ru = g.nodes[rootOf(index.get(u)!)];
    const rv = g.nodes[rootOf(index.get(v)!)];
    const findVars: Array<[string, string | number]> = [['edge', name(i)], ['weight', w], [`find(${u})`, ru], [`find(${v})`, rv]];
    push(
      3,
      `Next lightest edge: ${name(i)} (weight ${w}). It is safe only if ${u} and ${v} are in different trees, so compare find(${u}) = ${ru} with find(${v}) = ${rv}.`,
      { edge: i, endpoints: 'active' },
      findVars,
    );
    const treeU = fmtSet(setOf(u));
    if (union(index.get(u)!, index.get(v)!)) {
      status[i] = 'tree';
      mst.push({ from: u, to: v, weight: w });
      total += w;
      inTree.add(u);
      inTree.add(v);
      push(
        4,
        `${ru} != ${rv}: ${u} and ${v} are in different trees, so ${name(i)} cannot close a cycle. No edge leaving ${treeU} is lighter (those were all decided already), so by the cut property some MST contains it. Add it and union the two sets.`,
        { edge: i, endpoints: 'good' },
        findVars,
      );
      if (mst.length === n - 1) {
        stopped = k;
        const rest = order.length - k - 1;
        push(
          5,
          `The tree has ${plural(n - 1, 'edge')}, so it already spans all ${n} vertices: stop.${rest > 0 ? ` The remaining ${plural(rest, 'edge')} ${rest === 1 ? 'is' : 'are'} never examined.` : ''}`,
        );
        break;
      }
    } else {
      status[i] = 'cycle';
      push(
        6,
        `${u} and ${v} are already in the same tree ${treeU}, so ${name(i)} would close a cycle. Every other edge on that cycle was added earlier and is no heavier, so this edge is never needed (cycle property). Skip it.`,
        { edge: i, endpoints: 'bad' },
        findVars,
      );
    }
  }

  const trees = components().length;
  push(
    undefined,
    stopped >= 0 || trees === 1
      ? `Done: the minimum spanning tree has ${plural(mst.length, 'edge')} and total weight ${total}.`
      : `Done: the edges ran out with ${trees} separate trees, because the graph is disconnected. The result is a minimum spanning forest: ${plural(mst.length, 'edge')}, total weight ${total}.`,
  );
  return { frames, mst, total };
}

export const kruskal = (g: Graph) => kruskalRun(g).frames;

// ---------------------------------------------------------------- Prim

interface HeapEntry {
  w: number;
  from: number;
  to: number;
  /** Index into g.edges, or -1 for the (0, s, s) seed. */
  edge: number;
}

export function primRun(g: Graph): MstRun {
  const n = g.nodes.length;
  const index = new Map(g.nodes.map((v, i) => [v, i]));
  const pos = circleLayout(g.nodes);
  const arrow = SYM.rightArrow;
  const s = index.get(g.start)!;

  // prim_mst_edge_list: adjacency lists in edge input order.
  const adj: Array<Array<{ to: number; w: number; edge: number }>> = g.nodes.map(() => []);
  g.edges.forEach((e, i) => {
    const a = index.get(e.from)!;
    const b = index.get(e.to)!;
    adj[a].push({ to: b, w: e.weight, edge: i });
    adj[b].push({ to: a, w: e.weight, edge: i });
  });

  // heapq orders entries as tuples (weight, from, to).
  const less = (a: HeapEntry, b: HeapEntry) => a.w - b.w || a.from - b.from || a.to - b.to;
  const heap: HeapEntry[] = [{ w: 0, from: s, to: s, edge: -1 }];
  const visited = new Set<number>();
  const treeEdges = new Set<number>();
  const mst: MstEdge[] = [];
  let total = 0;
  const frames: Array<Frame<GraphState>> = [];

  const entryText = (e: HeapEntry) => (e.edge < 0 ? `start ${g.nodes[e.to]} 0` : `${g.nodes[e.from]}${arrow}${g.nodes[e.to]} ${e.w}`);
  const live = (e: HeapEntry) => !visited.has(e.to);

  const push = (
    line: number | undefined,
    caption: string,
    focus: { popped?: HeapEntry; joined?: number; stale?: boolean } = {},
    vars: Array<[string, string | number]> = [],
  ) => {
    const inHeap = new Map<number, HeapEntry>();
    for (const e of heap) if (e.edge >= 0) inHeap.set(e.edge, e);
    const frontier = new Set(heap.filter(live).map((e) => e.to));
    const nodeRole = (v: string): Role => {
      const i = index.get(v)!;
      if (focus.popped && i === focus.popped.to && focus.stale) return 'bad';
      if (i === focus.joined) return 'active';
      if (visited.has(i)) return 'done';
      return frontier.has(i) ? 'compare' : 'idle';
    };
    const edgeRole = (i: number): Role => {
      if (treeEdges.has(i) && !(focus.popped?.edge === i && !focus.stale)) return 'done';
      if (focus.popped?.edge === i) return focus.stale ? 'muted' : 'active';
      const e = inHeap.get(i);
      if (e) return live(e) ? 'compare' : 'muted';
      const { from, to } = g.edges[i];
      return visited.has(index.get(from)!) && visited.has(index.get(to)!) ? 'muted' : 'idle';
    };
    const queue = [...heap]
      .sort(less)
      .map((e): StripItem => (live(e) ? { text: entryText(e), role: 'compare' } : { text: `${entryText(e)} (stale)` }));
    const tree = mst.map((e): StripItem => ({ text: `${e.from}${arrow}${e.to} ${e.weight}`, role: 'done' }));
    frames.push({
      line,
      caption,
      vars: [...vars, ['tree vertices', `${visited.size} / ${n}`], ['queue size', heap.length], ['total weight', total]],
      state: snapshot(g, pos, nodeRole, edgeRole, [
        strip('Priority queue (cheapest first)', queue.length ? queue : ['(empty)']),
        strip('Tree edges', tree.length ? tree : ['-']),
      ]),
    });
  };

  push(0, `Start at ${g.start}. The priority queue holds one entry, (0, ${g.start}, ${g.start}): the start vertex joins the tree without an edge.`);

  while (heap.length && visited.size < n) {
    let best = 0;
    for (let k = 1; k < heap.length; k++) if (less(heap[k], heap[best]) < 0) best = k;
    const top = heap.splice(best, 1)[0];
    const label = top.edge < 0 ? `(0, ${g.nodes[top.to]}, ${g.nodes[top.to]})` : `${g.nodes[top.from]}${arrow}${g.nodes[top.to]} (weight ${top.w})`;
    const popVars: Array<[string, string | number]> = [['popped', entryText(top)]];

    if (visited.has(top.to)) {
      push(
        3,
        `Pop ${label}, but ${g.nodes[top.to]} is already in the tree: a stale entry, left behind when ${g.nodes[top.to]} joined through a cheaper edge. Skip it (lazy deletion).`,
        { popped: top, stale: true },
        popVars,
      );
      continue;
    }

    visited.add(top.to);
    if (top.edge >= 0) {
      treeEdges.add(top.edge);
      mst.push({ from: g.nodes[top.from], to: g.nodes[top.to], weight: top.w });
      total += top.w;
    }
    const tv = g.nodes[top.to];
    push(
      4,
      top.edge < 0
        ? `Pop (0, ${tv}, ${tv}): ${tv} is the first vertex of the tree.`
        : `Pop ${label}: ${tv} joins the tree. Tree vertices versus the rest form a cut, and this entry is the cheapest edge crossing it (the queue's minimum), so by the cut property it belongs to an MST.`,
      { popped: top, joined: top.to },
      popVars,
    );

    const pushed: string[] = [];
    const nowStale: string[] = [];
    for (const { to, w, edge } of adj[top.to]) {
      if (!visited.has(to)) {
        heap.push({ w, from: top.to, to, edge });
        pushed.push(`${tv}${arrow}${g.nodes[to]} ${w}`);
      }
    }
    for (const e of [...heap].sort(less)) if (e.edge >= 0 && e.to === top.to) nowStale.push(entryText(e));
    const staleNote = nowStale.length
      ? ` ${nowStale.join(', ')} now ${nowStale.length === 1 ? 'leads' : 'lead'} into the tree: ${nowStale.length === 1 ? 'it stays' : 'they stay'} in the queue as stale.`
      : '';
    push(
      6,
      pushed.length
        ? `Push ${tv}'s edges to vertices outside the tree: ${pushed.join(', ')}. They now cross the cut.${staleNote}`
        : `${tv} has no edges to vertices outside the tree, so nothing is pushed.${staleNote}`,
      { joined: top.to },
      [['joined', tv]],
    );
  }

  const unreached = g.nodes.filter((_, i) => !visited.has(i));
  if (unreached.length) {
    push(
      1,
      `The queue is empty, but ${unreached.join(', ')} cannot be reached from ${g.start}: the graph is disconnected, so Prim's tree spans only ${g.start}'s component. (Kruskal would build a spanning forest instead.)`,
    );
  } else {
    push(
      1,
      `All ${n} vertices are in the tree, so the loop stops${heap.length ? ` (the ${plural(heap.length, 'entry', 'entries')} left in the queue ${heap.length === 1 ? 'is' : 'are'} never popped)` : ''}.`,
    );
  }
  push(
    undefined,
    unreached.length
      ? `Done: a minimum spanning tree of ${g.start}'s component, ${plural(mst.length, 'edge')} with total weight ${total}.`
      : `Done: the minimum spanning tree has ${plural(mst.length, 'edge')} and total weight ${total}.`,
  );
  return { frames, mst, total };
}

export const prim = (g: Graph) => primRun(g).frames;
