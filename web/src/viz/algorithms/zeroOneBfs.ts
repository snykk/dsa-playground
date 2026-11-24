/**
 * 0-1 BFS tracer: single-source shortest paths when every edge weight is 0 or 1, with a deque.
 *
 * It mirrors Algorithms/Graph_Algorithms/Shortest_Path/0_1_BFS/Python/zero_one_bfs.py step for
 * step: entries are (distance, vertex); a relaxation over an edge of weight 0 pushes to the
 * front and one of weight 1 to the back; an entry whose distance is above dist[u] is stale and
 * skipped; the edges out of a vertex are relaxed in input order, an undirected edge "A-B"
 * counting as A->B then B->A at its place in the list. Vertex i is g.nodes[i]. The golden
 * fixtures in __fixtures__/shortestPaths.json (section "bfs01") pin dist, parent and every
 * push and pop to the Python code.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GraphState } from '../renderers/GraphView';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { circleLayout, parseGraph, type Graph } from './graph';

/** One deque event, as the fixture generator records it: the start entry, a pop, or a push to one end. */
export type DequeEvent = ['push' | 'pop' | 'front' | 'back', number, number];

export interface ZeroOneBfsRun {
  frames: Array<Frame<GraphState>>;
  /** dist[i] for vertex g.nodes[i], or -1 when unreachable, as the code returns it. */
  dist: number[];
  /** parent[i], or -1 for the start and unreachable vertices. */
  parent: number[];
  events: DequeEvent[];
}

/** Reads a graph like "A->B 1, A->C 0; start A" and refuses weights other than 0 and 1 (an edge without a weight weighs 1). */
export function parseZeroOneGraph(text: string): Graph {
  const g = parseGraph(text, { maxNodes: 10, maxEdges: 20 });
  const bad = g.edges.find((e) => e.weight !== 0 && e.weight !== 1);
  if (bad) {
    throw new InputError(
      `0-1 BFS takes weights 0 and 1 only, and ${bad.from}${bad.directed ? '->' : '-'}${bad.to} weighs ${bad.weight}. Use Dijkstra for other non-negative weights.`,
    );
  }
  return g;
}

export function zeroOneBfsRun(g: Graph): ZeroOneBfsRun {
  const n = g.nodes.length;
  const idx = new Map(g.nodes.map((id, i) => [id, i]));
  const name = (i: number) => g.nodes[i];
  const pos = circleLayout(g.nodes);

  interface Arc {
    to: number;
    w: number;
    edge: number;
  }
  const adj: Arc[][] = g.nodes.map(() => []);
  g.edges.forEach((e, i) => {
    const a = idx.get(e.from)!;
    const b = idx.get(e.to)!;
    adj[a].push({ to: b, w: e.weight, edge: i });
    if (!e.directed) adj[b].push({ to: a, w: e.weight, edge: i });
  });

  const start = idx.get(g.start)!;
  const dist: number[] = Array(n).fill(-1);
  const parent: number[] = Array(n).fill(-1);
  const parentEdge: number[] = Array(n).fill(-1);
  const done: boolean[] = Array(n).fill(false);
  const processed: number[] = [];
  const events: DequeEvent[] = [];
  const frames: Array<Frame<GraphState>> = [];
  /** The deque, front first: [distance, vertex]. */
  const deque: Array<[number, number]> = [];

  const fmt = (d: number) => (d === -1 ? SYM.infinity : String(d));
  const entry = ([d, v]: [number, number]) => `(${d}, ${name(v)})`;
  const plural = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`;

  const snap = (
    line: number | undefined,
    caption: string,
    vars: Frame<GraphState>['vars'],
    extra: { nodes?: Record<number, Role>; edges?: Record<number, Role>; pushed?: 'front' | 'back' } = {},
  ) => {
    const tree = new Map<number, Role>();
    parentEdge.forEach((e, v) => {
      if (e !== -1) tree.set(e, done[v] ? 'done' : 'compare');
    });
    // An entry above its vertex's distance is already known to be stale: say so in its text.
    const items: StripItem[] = deque.map(([d, v], k) => {
      const justPushed = (extra.pushed === 'front' && k === 0) || (extra.pushed === 'back' && k === deque.length - 1);
      return { text: `${name(v)}:${d}${d > dist[v] ? ' stale' : ''}`, role: justPushed ? 'active' : undefined };
    });
    frames.push({
      line,
      caption,
      vars,
      state: {
        nodes: g.nodes.map((id, i) => ({
          id,
          ...pos.get(id)!,
          role: extra.nodes?.[i] ?? (done[i] ? 'done' : dist[i] !== -1 ? 'compare' : 'idle'),
          badge: fmt(dist[i]),
        })),
        edges: g.edges.map((e, i) => ({
          id: i,
          from: e.from,
          to: e.to,
          directed: e.directed,
          weight: e.weight,
          role: extra.edges?.[i] ?? tree.get(i) ?? 'idle',
        })),
        showWeights: true,
        strips: [
          { label: 'Deque (front first)', items: items.length ? items : [{ text: '(empty)' }] },
          { label: 'Processed', items: processed.length ? processed.map((v) => ({ text: `${name(v)}:${dist[v]}` })) : [{ text: '-' }] },
        ],
      },
    });
  };

  dist[start] = 0;
  deque.push([0, start]);
  events.push(['push', 0, start]);
  snap(
    0,
    `Every distance starts unknown (${SYM.infinity}; the code stores -1) except the source ${name(start)} at 0. The deque holds one entry, (0, ${name(start)}).`,
    [['deque size', 1]],
    { pushed: 'back' },
  );

  let pops = 0;
  let stale = 0;
  while (deque.length) {
    const [d, u] = deque.shift()!;
    events.push(['pop', d, u]);
    pops++;
    if (d > dist[u]) {
      stale++;
      snap(
        3,
        `Pop (${d}, ${name(u)}) from the front: stale. ${name(u)} was pushed again at ${dist[u]} after this entry, and that entry has already been processed, so skip it.`,
        [['popped', `(${d}, ${name(u)})`], [`dist[${name(u)}]`, dist[u]]],
        { nodes: { [u]: 'muted' } },
      );
      continue;
    }
    const front = deque.length ? ` The deque now holds ${deque.map(entry).join(', ')}.` : ' The deque is now empty.';
    snap(
      2,
      `Pop (${d}, ${name(u)}) from the front. No entry in the deque is below ${d}, and every later push will be ${d} or more, so dist[${name(u)}] = ${d} is final.${front}`,
      [['u', name(u)], ['d', d], ['deque size', deque.length]],
      { nodes: { [u]: 'active' } },
    );
    if (adj[u].length === 0) {
      done[u] = true;
      processed.push(u);
      snap(4, `${name(u)} has no outgoing edges: nothing to relax. ${name(u)} is done.`, [['u', name(u)], ['d', d]]);
      continue;
    }
    for (const { to: v, w, edge } of adj[u]) {
      const nd = d + w;
      const arc = `${name(u)}${SYM.rightArrow}${name(v)}`;
      if (dist[v] !== -1 && nd >= dist[v]) {
        snap(
          5,
          `Edge ${arc} (weight ${w}): ${d} + ${w} = ${nd}, not below dist[${name(v)}] = ${dist[v]}. Nothing changes${
            nd === dist[v] && parent[v] !== -1 && parent[v] !== u ? `: a tie, and ${name(v)} keeps its parent ${name(parent[v])}` : ''
          }.`,
          [['u', name(u)], ['v', name(v)], ['d + w', nd], [`dist[${name(v)}]`, dist[v]]],
          { nodes: { [u]: 'active' }, edges: { [edge]: 'active' } },
        );
        continue;
      }
      const old = dist[v];
      dist[v] = nd;
      parent[v] = u;
      parentEdge[v] = edge;
      if (w === 0) deque.unshift([nd, v]);
      else deque.push([nd, v]);
      events.push([w === 0 ? 'front' : 'back', nd, v]);
      const why = old === -1 ? `${name(v)} was not reached yet` : `${nd} < ${old}, a shorter path`;
      const where =
        w === 0
          ? `Weight 0, so the entry has the same distance as ${name(u)}: push (${nd}, ${name(v)}) to the front, ahead of everything.`
          : `Weight 1, so the entry is one more than ${name(u)}: push (${nd}, ${name(v)}) to the back, behind everything.`;
      const staleNote = old !== -1 ? ` Its old entry (${old}, ${name(v)}) stays in the deque and will be skipped as stale.` : '';
      snap(
        w === 0 ? 7 : 8,
        `Edge ${arc} (weight ${w}): ${d} + ${w} = ${nd} and ${why}. Set dist[${name(v)}] = ${nd}, parent ${name(u)}. ${where}${staleNote}`,
        [['u', name(u)], ['v', name(v)], [`dist[${name(v)}]`, nd], ['deque size', deque.length]],
        { nodes: { [u]: 'active' }, edges: { [edge]: 'active' }, pushed: w === 0 ? 'front' : 'back' },
      );
    }
    done[u] = true;
    processed.push(u);
  }

  const unreachable = g.nodes.filter((_, i) => dist[i] === -1);
  snap(
    undefined,
    `Done: ${plural(pops, 'pop', 'pops')}${stale ? `, ${plural(stale, 'of them', 'of them')} stale` : ', none of them stale'}, for ${plural(n, 'vertex', 'vertices')} and ${plural(adj.reduce((s, a) => s + a.length, 0), 'directed edge', 'directed edges')}. The highlighted edges form the shortest-path tree from ${name(start)}.${
      unreachable.length ? ` Unreachable: ${unreachable.join(', ')} (distance -1 and parent -1 in the code).` : ''
    }`,
    [['pops', pops], ['stale', stale]],
  );
  return { frames, dist, parent, events };
}

export const zeroOneBfs = (g: Graph) => zeroOneBfsRun(g).frames;
