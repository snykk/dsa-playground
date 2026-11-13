/**
 * Graph input parsing plus BFS, DFS and Dijkstra tracers.
 *
 * Input: "A-B 4, A-C 2, B->D 7; start A"
 *   U-V   undirected edge, U->V directed edge, optional integer weight (default 1).
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GraphState } from '../renderers/GraphView';
import type { StripItem } from '../ui/molecules/Strip';

export interface Edge {
  from: string;
  to: string;
  weight: number;
  directed: boolean;
  weighted: boolean;
}

export interface Graph {
  nodes: string[];
  edges: Edge[];
  start: string;
}

const NODE_RE = /^[A-Za-z0-9]{1,3}$/;

export function parseGraph(text: string, { maxNodes = 12, maxEdges = 30 } = {}): Graph {
  const [edgePart, ...options] = text.split(';');
  const edges: Edge[] = [];
  const nodes = new Set<string>();
  for (const raw of edgePart.split(',').map((t) => t.trim()).filter(Boolean)) {
    const m = raw.match(/^([A-Za-z0-9]+)\s*(->|-)\s*([A-Za-z0-9]+)(?:\s*[:= ]\s*(-?\d+))?$/);
    if (!m) throw new InputError(`Cannot read edge "${raw}". Write edges like "A-B 4" or "A->B 4".`);
    const [, from, arrow, to, w] = m;
    for (const n of [from, to]) {
      if (!NODE_RE.test(n)) throw new InputError(`Node names are 1 to 3 letters or digits ("${n}" is too long).`);
    }
    if (from === to) throw new InputError(`Self-loops like "${raw}" are not supported here.`);
    edges.push({ from, to, weight: w === undefined ? 1 : Number(w), directed: arrow === '->', weighted: w !== undefined });
    nodes.add(from);
    nodes.add(to);
  }
  if (edges.length === 0) throw new InputError('Enter at least one edge, e.g. "A-B, B-C; start A".');
  if (edges.length > maxEdges) throw new InputError(`At most ${maxEdges} edges, please (got ${edges.length}).`);
  if (nodes.size > maxNodes) throw new InputError(`At most ${maxNodes} nodes, please (got ${nodes.size}).`);

  const sorted = [...nodes].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  let start = sorted[0];
  for (const opt of options.map((o) => o.trim()).filter(Boolean)) {
    const m = opt.match(/^start\s*[:= ]?\s*([A-Za-z0-9]+)$/i);
    if (!m) throw new InputError(`Unknown option "${opt}". Use "start X".`);
    if (!nodes.has(m[1])) throw new InputError(`Start node "${m[1]}" is not in the graph.`);
    start = m[1];
  }
  return { nodes: sorted, edges, start };
}

export function formatGraph(g: Graph): string {
  const edges = g.edges.map((e) => `${e.from}${e.directed ? '->' : '-'}${e.to}${e.weighted ? ` ${e.weight}` : ''}`);
  return `${edges.join(', ')}; start ${g.start}`;
}

interface Adj {
  to: string;
  weight: number;
  edge: number;
}

/** Neighbors in alphabetical order so every run (and every test) is deterministic. */
export function adjacency(g: Graph): Map<string, Adj[]> {
  const adj = new Map<string, Adj[]>(g.nodes.map((n) => [n, []]));
  g.edges.forEach((e, i) => {
    adj.get(e.from)?.push({ to: e.to, weight: e.weight, edge: i });
    if (!e.directed) adj.get(e.to)?.push({ to: e.from, weight: e.weight, edge: i });
  });
  for (const list of adj.values()) list.sort((a, b) => a.to.localeCompare(b.to, 'en', { numeric: true }) || a.weight - b.weight);
  return adj;
}

/** Nodes on a circle, first node at the top, clockwise. */
export function circleLayout(nodes: string[], width = 600, height = 380): Map<string, { x: number; y: number }> {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 46;
  return new Map(
    nodes.map((n, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / nodes.length;
      return [n, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }];
    }),
  );
}

class GraphRecorder {
  frames: Array<Frame<GraphState>> = [];
  nodeRole = new Map<string, Role>();
  edgeRole = new Map<number, Role>();
  badges = new Map<string, string>();
  readonly pos: Map<string, { x: number; y: number }>;

  constructor(readonly g: Graph, readonly showWeights: boolean) {
    this.pos = circleLayout(g.nodes);
  }

  snap(line: number | undefined, caption: string, strips: GraphState['strips'], vars: Frame<GraphState>['vars'] = [], extra: { nodes?: Record<string, Role>; edges?: Record<number, Role> } = {}) {
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
          from: e.from,
          to: e.to,
          directed: e.directed,
          weight: e.weight,
          role: extra.edges?.[i] ?? this.edgeRole.get(i) ?? 'idle',
        })),
        showWeights: this.showWeights,
        strips,
      },
    });
  }
}

const strip = (label: string, items: Array<string | StripItem>): NonNullable<GraphState['strips']>[number] => ({
  label,
  items: items.map((it) => (typeof it === 'string' ? { text: it } : it)),
});

export function bfs(g: Graph): Array<Frame<GraphState>> {
  const adj = adjacency(g);
  const r = new GraphRecorder(g, g.edges.some((e) => e.weighted));
  const dist = new Map<string, number>([[g.start, 0]]);
  const order: string[] = [];
  const queue: string[] = [g.start];
  r.nodeRole.set(g.start, 'compare');
  r.badges.set(g.start, 'd=0');
  const strips = () => [strip('Queue', queue.length ? queue : ['(empty)']), strip('Visit order', order.length ? order : ['-'])];

  r.snap(0, `Start at ${g.start}: mark it visited (distance 0) and put it in the queue.`, strips(), [['queue size', 1]]);
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    r.nodeRole.set(u, 'active');
    r.snap(2, `Dequeue ${u} (distance ${dist.get(u)}). BFS always expands the oldest discovered vertex first.`, strips(), [['u', u], ['dist[u]', dist.get(u)!]]);
    for (const { to: v, edge } of adj.get(u)!) {
      const seen = dist.has(v);
      r.snap(4, seen ? `${v} was already discovered: skip it.` : `${v} is new: discover it at distance ${dist.get(u)! + 1}.`, strips(), [['u', u], ['v', v]], {
        edges: { [edge]: seen ? 'muted' : 'compare' },
        nodes: seen ? {} : { [v]: 'compare' },
      });
      if (!seen) {
        dist.set(v, dist.get(u)! + 1);
        queue.push(v);
        r.nodeRole.set(v, 'compare');
        r.edgeRole.set(edge, 'done');
        r.badges.set(v, `d=${dist.get(v)}`);
        r.snap(5, `Enqueue ${v}; the edge ${u}-${v} joins the BFS tree.`, strips(), [['u', u], ['v', v], ['queue size', queue.length]]);
      }
    }
    r.nodeRole.set(u, 'done');
    r.snap(6, `${u} is finished: all of its neighbors have been discovered.`, strips(), [['u', u]]);
  }
  const unreachable = g.nodes.filter((n) => !dist.has(n));
  r.snap(
    undefined,
    `Done. Visit order: ${order.join(', ')}. Each d=k is the fewest edges from ${g.start}.${unreachable.length ? ` Unreachable: ${unreachable.join(', ')}.` : ''}`,
    strips(),
  );
  return r.frames;
}

export function dfs(g: Graph): Array<Frame<GraphState>> {
  const adj = adjacency(g);
  const r = new GraphRecorder(g, g.edges.some((e) => e.weighted));
  const disc = new Map<string, number>();
  const fin = new Map<string, number>();
  const stack: string[] = [];
  const order: string[] = [];
  let time = 0;
  const strips = () => [strip('Call stack', stack.length ? stack : ['(empty)']), strip('Discovery order', order.length ? order : ['-'])];
  const badge = (u: string) => r.badges.set(u, `${disc.get(u)}/${fin.get(u) ?? ''}`);

  const visit = (u: string, parent?: string) => {
    disc.set(u, ++time);
    stack.push(u);
    order.push(u);
    r.nodeRole.set(u, 'active');
    badge(u);
    r.snap(1, `Discover ${u} at time ${disc.get(u)}${parent ? ` (reached from ${parent})` : ''}. Badges show discovery/finish times.`, strips(), [['u', u], ['time', time]]);
    for (const { to: v, edge } of adj.get(u)!) {
      const seen = disc.has(v);
      r.snap(3, seen ? `${v} is already discovered: do not follow ${u}-${v}.` : `${v} is unvisited: go deeper along ${u}-${v}.`, strips(), [['u', u], ['v', v]], {
        edges: { [edge]: seen ? 'muted' : 'compare' },
      });
      if (!seen) {
        r.edgeRole.set(edge, 'done');
        r.nodeRole.set(u, 'compare');
        visit(v, u);
        r.nodeRole.set(u, 'active');
        r.snap(4, `Back at ${u} after finishing ${v}; continue with its next neighbor.`, strips(), [['u', u], ['time', time]]);
      }
    }
    fin.set(u, ++time);
    badge(u);
    stack.pop();
    r.nodeRole.set(u, 'done');
    r.snap(5, `${u} has no unvisited neighbors left: finish it at time ${fin.get(u)} and backtrack.`, strips(), [['u', u], ['time', time]]);
  };

  r.snap(0, `Start the depth-first search at ${g.start}.`, strips());
  visit(g.start);
  const unreachable = g.nodes.filter((n) => !disc.has(n));
  r.snap(
    undefined,
    `Done. Discovery order: ${order.join(', ')}. Highlighted edges form the DFS tree.${unreachable.length ? ` Unreachable from ${g.start}: ${unreachable.join(', ')}.` : ''}`,
    strips(),
  );
  return r.frames;
}

export function dijkstra(g: Graph): Array<Frame<GraphState>> {
  const negative = g.edges.find((e) => e.weight < 0);
  if (negative) {
    throw new InputError(`Dijkstra needs non-negative weights (${negative.from}-${negative.to} has ${negative.weight}). Use Bellman-Ford for negative edges.`);
  }
  const adj = adjacency(g);
  const r = new GraphRecorder(g, true);
  const dist = new Map<string, number>(g.nodes.map((n) => [n, Infinity]));
  const parentEdge = new Map<string, number>();
  const settled: string[] = [];
  const pq: Array<{ d: number; v: string }> = [];
  const fmt = (d: number) => (d === Infinity ? '\u221e' : String(d));
  const pqView = () =>
    [...pq]
      .sort((a, b) => a.d - b.d || a.v.localeCompare(b.v))
      .map((e) => ({ text: `${e.v}:${e.d}`, role: (settled.includes(e.v) ? 'muted' : undefined) as Role | undefined }));
  const strips = () => [strip('Priority queue', pq.length ? pqView() : ['(empty)']), strip('Settled', settled.length ? settled : ['-'])];
  const refreshBadges = () => g.nodes.forEach((n) => r.badges.set(n, fmt(dist.get(n)!)));

  dist.set(g.start, 0);
  pq.push({ d: 0, v: g.start });
  refreshBadges();
  r.nodeRole.set(g.start, 'compare');
  r.snap(0, `Every distance starts at \u221e except the source ${g.start} (0). Push (0, ${g.start}) into the priority queue.`, strips());

  while (pq.length) {
    pq.sort((a, b) => a.d - b.d || a.v.localeCompare(b.v));
    const { d, v: u } = pq.shift()!;
    if (d > dist.get(u)!) {
      r.snap(3, `Pop (${d}, ${u}) but dist[${u}] is already ${dist.get(u)}: a stale entry, skip it.`, strips(), [['u', u], ['popped d', d]], { nodes: { [u]: 'muted' } });
      continue;
    }
    r.nodeRole.set(u, 'active');
    r.snap(2, `Pop the closest unsettled vertex: ${u} with distance ${d}.`, strips(), [['u', u], ['dist[u]', d]]);
    for (const { to: v, weight: w, edge } of adj.get(u)!) {
      if (settled.includes(v)) continue;
      const cand = d + w;
      const better = cand < dist.get(v)!;
      r.snap(5, `Edge ${u}\u2192${v} (weight ${w}): ${d} + ${w} = ${cand} ${better ? '<' : '>='} dist[${v}] = ${fmt(dist.get(v)!)}${better ? ', a shorter path' : ', no improvement'}.`, strips(), [['u', u], ['v', v], ['dist[u] + w', cand]], {
        edges: { [edge]: 'compare' },
        nodes: { [v]: 'compare' },
      });
      if (better) {
        const old = parentEdge.get(v);
        if (old !== undefined) r.edgeRole.delete(old);
        dist.set(v, cand);
        parentEdge.set(v, edge);
        r.edgeRole.set(edge, 'compare');
        pq.push({ d: cand, v });
        refreshBadges();
        r.nodeRole.set(v, 'compare');
        r.snap(6, `Update dist[${v}] = ${cand} and remember ${u} as its parent; push (${cand}, ${v}).`, strips(), [['u', u], ['v', v], ['dist[v]', cand]]);
      }
    }
    settled.push(u);
    r.nodeRole.set(u, 'done');
    const pe = parentEdge.get(u);
    if (pe !== undefined) r.edgeRole.set(pe, 'done');
    r.snap(7, `${u} is settled: no later path can be shorter than ${d}, because every edge weight is non-negative.`, strips(), [['u', u], ['dist[u]', d]]);
  }
  const unreachable = g.nodes.filter((n) => dist.get(n) === Infinity);
  r.snap(
    undefined,
    `Done. Highlighted edges form the shortest-path tree from ${g.start}.${unreachable.length ? ` Unreachable: ${unreachable.join(', ')} (distance \u221e).` : ''}`,
    strips(),
  );
  return r.frames;
}

/** Reference results for tests: BFS hop counts and Dijkstra distances. */
export function finalBadges(frames: Array<Frame<GraphState>>): Record<string, string | undefined> {
  const last = frames[frames.length - 1].state;
  return Object.fromEntries(last.nodes.map((n) => [n.id, n.badge]));
}
