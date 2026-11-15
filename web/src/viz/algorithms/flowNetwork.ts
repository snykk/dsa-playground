/**
 * Flow networks shared by the Ford-Fulkerson and Edmonds-Karp tracers: the input syntax,
 * the Python graph dict and its residual dict (insertion order included, because both
 * searches walk `residual[u].items()` in that order), the flow on every edge, a layered
 * layout and the frame recorder drawn with FlowNetworkView.
 *
 * Input: "0->1 16, 0->2 13, 1->3 12; source 0, sink 5". The edges become the dict
 * {u: {v: capacity}} in the order they are written, exactly as the same Python literal would.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ReservedStrip } from '../renderers/advancedGraphShared';
import type { FlowEdgeView, FlowNetworkState } from '../renderers/FlowNetworkView';
import { SYM } from '../ui/symbols';

export interface FlowEdge {
  from: string;
  to: string;
  cap: number;
}

export interface FlowInput {
  /** Vertices in order of first appearance. */
  nodes: string[];
  /** Edges in the order written: the insertion order of the Python dict. */
  edges: FlowEdge[];
  source: string;
  sink: string;
}

/** Residual (or graph) dict: Map keeps insertion order, as a Python dict does. */
export type Residual = Map<string, Map<string, number>>;

export const FLOW_LIMITS = { maxNodes: 8, maxEdges: 16, maxCap: 99, maxFrames: 2000 };

export const ARROW = SYM.rightArrow;
const NAME = /^[A-Za-z0-9]{1,3}$/;

/**
 * Parse "0->1 16, 0->2 13; source 0, sink 5". Edges and options may be separated by commas,
 * semicolons or new lines; a missing capacity is 1. Without "source" / "sink" the first and
 * the last vertex named are used.
 */
export function parseFlow(text: string): FlowInput {
  const edges: FlowEdge[] = [];
  const nodes: string[] = [];
  const seen = new Set<string>();
  let source: string | undefined;
  let sink: string | undefined;
  const addNode = (n: string) => {
    if (!seen.has(n)) {
      seen.add(n);
      nodes.push(n);
    }
  };
  for (const raw of text.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean)) {
    const opt = raw.match(/^(source|src|s|sink|target|t)\s*[:= ]\s*([A-Za-z0-9]+)$/i);
    if (opt) {
      const isSource = /^s(ource|rc)?$/i.test(opt[1]);
      if ((isSource ? source : sink) !== undefined) throw new InputError(`Give the ${isSource ? 'source' : 'sink'} only once.`);
      if (isSource) source = opt[2];
      else sink = opt[2];
      continue;
    }
    if (/^[A-Za-z0-9]+\s*-\s*[A-Za-z0-9]+(\s|$)/.test(raw) && !raw.includes('->')) {
      throw new InputError(`A flow network is directed: write "${raw.replace(/\s*-\s*/, '->')}" instead of "${raw}".`);
    }
    const m = raw.match(/^([A-Za-z0-9]+)\s*->\s*([A-Za-z0-9]+)(?:\s*[:= ]\s*(-?\d+))?$/);
    if (!m) throw new InputError(`Cannot read "${raw}". Write edges like "0->1 16" (capacity after the edge), and "source 0, sink 5".`);
    const [, from, to, c] = m;
    for (const n of [from, to]) if (!NAME.test(n)) throw new InputError(`Vertex names are 1 to 3 letters or digits ("${n}" is too long).`);
    if (from === to) throw new InputError(`"${raw}" is a self-loop: it can never carry flow (the search has already visited ${from}), so leave it out.`);
    const cap = c === undefined ? 1 : Number(c);
    if (cap < 0 || cap > FLOW_LIMITS.maxCap) throw new InputError(`Capacities go from 0 to ${FLOW_LIMITS.maxCap} here (got ${c}).`);
    if (edges.some((e) => e.from === from && e.to === to)) {
      throw new InputError(`${from}->${to} appears twice. The graph dict keeps one capacity per edge, so give it once (add the capacities up).`);
    }
    edges.push({ from, to, cap });
    addNode(from);
    addNode(to);
  }
  if (edges.length === 0) throw new InputError('Enter at least one edge, e.g. "0->1 5, 1->2 3; source 0, sink 2".');
  if (edges.length > FLOW_LIMITS.maxEdges) throw new InputError(`At most ${FLOW_LIMITS.maxEdges} edges, please (got ${edges.length}).`);
  if (nodes.length > FLOW_LIMITS.maxNodes) throw new InputError(`At most ${FLOW_LIMITS.maxNodes} vertices, please (got ${nodes.length}).`);
  for (const [what, v] of [
    ['Source', source],
    ['Sink', sink],
  ] as const) {
    if (v !== undefined && !seen.has(v)) throw new InputError(`${what} ${v} is not a vertex of any edge.`);
  }
  return { nodes, edges, source: source ?? nodes[0], sink: sink ?? nodes[nodes.length - 1] };
}

export function formatFlow(input: FlowInput): string {
  return `${input.edges.map((e) => `${e.from}->${e.to} ${e.cap}`).join(', ')}; source ${input.source}, sink ${input.sink}`;
}

/** graph = {u: {v: capacity}}: rows in order of each tail's first edge, entries in edge order. */
export function pythonGraph(input: FlowInput): Residual {
  const g: Residual = new Map();
  for (const e of input.edges) {
    if (!g.has(e.from)) g.set(e.from, new Map());
    g.get(e.from)!.set(e.to, e.cap);
  }
  return g;
}

/**
 * The residual dict both Python implementations build: a copy of every row, then, for u in
 * graph and v in graph[u], residual.setdefault(v, {}) and residual[v].setdefault(u, 0).
 * An existing entry (an anti-parallel edge) keeps its capacity.
 */
export function buildResidual(graph: Residual): Residual {
  const res: Residual = new Map([...graph].map(([u, row]) => [u, new Map(row)]));
  for (const [u, row] of graph) {
    for (const v of row.keys()) {
      if (!res.has(v)) res.set(v, new Map());
      const back = res.get(v)!;
      if (!back.has(u)) back.set(u, 0);
    }
  }
  return res;
}

/** The residual dict as nested pairs in dict order (what the golden fixture records). */
export function residualPairs(res: Residual): Array<[string, Array<[string, number]>]> {
  return [...res].map(([u, row]) => [u, [...row]]);
}

export function names(xs: string[]): string {
  return xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
}

export const setText = (xs: string[]) => `{${xs.join(', ')}}`;
export const pathText = (path: string[]) => path.join(` ${ARROW} `);
export const pathToken = (path: string[], b: number) => `${path.join(ARROW)} +${b}`;

/** Which original edges a residual entry belongs to, and the flow they carry. */
export class FlowNet {
  private readonly index = new Map<string, number>();
  /** anti[i]: the reverse of edge i is an original edge too, so the two share residual entries. */
  readonly anti: boolean[];

  constructor(readonly input: FlowInput) {
    input.edges.forEach((e, i) => this.index.set(`${e.from}>${e.to}`, i));
    this.anti = input.edges.map((e) => this.index.has(`${e.to}>${e.from}`));
  }

  /** Original edge index of u->v, or undefined. */
  edgeIndex(u: string, v: string): number | undefined {
    return this.index.get(`${u}>${v}`);
  }

  /** The drawn edge a residual entry u->v belongs to: the original "e<i>", or the dashed reverse "r<i>" of edge v->u. */
  entryId(u: string, v: string): string {
    const i = this.index.get(`${u}>${v}`);
    if (i !== undefined) return `e${i}`;
    return `r${this.index.get(`${v}>${u}`)!}`;
  }

  /**
   * Flow on original edge i. Without an anti-parallel twin it is capacity - residual[u][v]
   * (= residual[v][u]). Two anti-parallel edges share their entries, so only the net flow is
   * defined: it is shown on the edge it runs along, and the other edge carries 0.
   */
  flow(res: Residual, i: number): number {
    const e = this.input.edges[i];
    const net = e.cap - res.get(e.from)!.get(e.to)!;
    return this.anti[i] ? Math.max(0, net) : net;
  }
}

/* ---------- layout ---------- */

function bfsDist(start: string, adj: Map<string, string[]>): Map<string, number> {
  const dist = new Map([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const u = queue.shift()!;
    for (const v of adj.get(u) ?? []) {
      if (!dist.has(v)) {
        dist.set(v, dist.get(u)! + 1);
        queue.push(v);
      }
    }
  }
  return dist;
}

/**
 * Layers from left to right: the source in the first column, every vertex in the column of
 * its edge distance from the source, the sink alone at the right. A vertex the source cannot
 * reach is placed by its distance to the sink. Columns are 130px apart and a column of k
 * vertices needs about 100px per vertex, so a small network gets a small picture that a phone
 * shows at full size.
 */
export function flowLayout(input: FlowInput): { pos: Map<string, { x: number; y: number }>; width: number; height: number } {
  const out = new Map<string, string[]>(input.nodes.map((n) => [n, []]));
  const into = new Map<string, string[]>(input.nodes.map((n) => [n, []]));
  for (const e of input.edges) {
    out.get(e.from)!.push(e.to);
    into.get(e.to)!.push(e.from);
  }
  const { source, sink } = input;
  const ds = bfsDist(source, out);
  const dt = bfsDist(sink, into);
  const middle = input.nodes.filter((n) => n !== source && n !== sink);
  let last = Math.max(ds.get(sink) ?? 0, middle.length ? 2 : 1);
  for (const n of middle) if (ds.has(n)) last = Math.max(last, ds.get(n)! + 1);
  const col = new Map<string, number>();
  for (const n of input.nodes) {
    let c: number;
    if (n === source) c = 0;
    else if (n === sink) c = last;
    else if (ds.has(n)) c = ds.get(n)!;
    else if (dt.has(n)) c = Math.min(last - 1, Math.max(1, last - dt.get(n)!));
    else c = Math.max(1, Math.floor(last / 2));
    col.set(n, c);
  }
  const columns = Array.from({ length: last + 1 }, (_, c) => input.nodes.filter((n) => col.get(n) === c));
  const tallest = Math.max(...columns.map((m) => m.length));
  const margin = 46;
  const step = Math.min(130, (600 - 2 * margin) / last);
  const width = Math.round(2 * margin + last * step);
  const height = Math.min(330, Math.max(200, 80 + tallest * 100));
  const top = 34;
  const bottom = height - 44;
  const pos = new Map<string, { x: number; y: number }>();
  columns.forEach((members, c) => {
    members.forEach((n, i) => {
      pos.set(n, { x: Math.round(margin + c * step), y: Math.round(top + ((i + 0.5) * (bottom - top)) / members.length) });
    });
  });
  return { pos, width, height };
}

/* ---------- frames ---------- */

export type FlowFrame = Frame<FlowNetworkState>;
export type Vars = NonNullable<FlowFrame['vars']>;

export interface SnapExtra {
  nodes?: Record<string, Role>;
  edges?: Record<string, Role>;
  /** Edge ids whose label is emphasised (the bottleneck). */
  emphasis?: string[];
}

/** What a flow tracer returns: the frames plus everything the golden fixture pins. */
export interface FlowRun {
  frames: FlowFrame[];
  maxFlow: number;
  paths: Array<[string[], number]>;
  /** The final residual dict, rows and entries in dict order. */
  residual: Array<[string, Array<[string, number]>]>;
  /** One per search (every round, plus the last one that fails): the vertices it reached, in order. */
  searches: string[][];
  /** The cut read from the final residual graph: its value and the two sides, in vertex order. */
  cut: { value: number; source: string[]; sink: string[] };
}

/** Records full snapshots of the network: flows read from the live residual dict at each snap. */
export class FlowRecorder {
  frames: FlowFrame[] = [];
  nodeRole = new Map<string, Role>();
  edgeRole = new Map<string, Role>();
  badges = new Map<string, string>();
  private readonly layout: ReturnType<typeof flowLayout>;

  constructor(
    readonly net: FlowNet,
    readonly residual: Residual,
  ) {
    this.layout = flowLayout(net.input);
  }

  clearRoles() {
    this.nodeRole.clear();
    this.edgeRole.clear();
  }

  snap(line: number | undefined, caption: string, vars: Vars, strips: ReservedStrip[], extra: SnapExtra = {}) {
    const { input } = this.net;
    const res = this.residual;
    const emphasis = new Set(extra.emphasis ?? []);
    const edges: FlowEdgeView[] = [];
    input.edges.forEach((e, i) => {
      const f = this.net.flow(res, i);
      const id = `e${i}`;
      edges.push({
        id,
        from: e.from,
        to: e.to,
        kind: 'edge',
        label: `${f}/${e.cap}`,
        fill: e.cap > 0 ? f / e.cap : 0,
        role: extra.edges?.[id] ?? this.edgeRole.get(id) ?? 'idle',
        emphasis: emphasis.has(id),
      });
      if (!this.net.anti[i]) {
        const rid = `r${i}`;
        const back = res.get(e.to)!.get(e.from)!;
        edges.push({
          id: rid,
          from: e.to,
          to: e.from,
          kind: 'residual',
          label: String(back),
          fill: 0,
          hidden: back === 0,
          role: extra.edges?.[rid] ?? this.edgeRole.get(rid) ?? 'idle',
          emphasis: emphasis.has(rid),
        });
      }
    });
    const tag = (n: string) =>
      n === input.source && n === input.sink ? 'source = sink' : n === input.source ? 'source' : n === input.sink ? 'sink' : undefined;
    this.frames.push({
      line,
      caption,
      vars,
      state: {
        width: this.layout.width,
        height: this.layout.height,
        nodes: input.nodes.map((id) => ({
          id,
          ...this.layout.pos.get(id)!,
          role: extra.nodes?.[id] ?? this.nodeRole.get(id) ?? 'idle',
          badge: this.badges.get(id),
          tag: tag(id),
        })),
        edges,
        strips,
      },
    });
  }
}

/** One step of an augmenting path, described for a caption: room left forward, or flow to cancel. */
export function stepRoom(net: FlowNet, res: Residual, u: string, v: string): string {
  const r = res.get(u)!.get(v)!;
  const i = net.edgeIndex(u, v);
  if (i === undefined) return `${u}${ARROW}${v} can cancel ${r} of ${v}${ARROW}${u}'s flow`;
  const rev = net.edgeIndex(v, u);
  const back = rev === undefined ? 0 : net.flow(res, rev);
  if (back === 0) return `${u}${ARROW}${v} has ${r} left`;
  // Anti-parallel edges share their entries: the room of u->v includes the flow on v->u it can cancel.
  return `${u}${ARROW}${v} has ${r}: ${r - back} of its own room plus ${back} of ${v}${ARROW}${u}'s flow to cancel`;
}

/**
 * Push `b` along u->v of the live residual dict and describe the result in flow terms:
 * "0->1 now carries 7/16" or "cancels 6 of 1->2's flow (10 -> 4)".
 */
export function pushStep(net: FlowNet, res: Residual, u: string, v: string, b: number): string {
  const before = res.get(u)!.get(v)!;
  const backBefore = res.get(v)!.get(u)!;
  const flowsBefore = net.input.edges.map((_, i) => net.flow(res, i));
  res.get(u)!.set(v, before - b);
  res.get(v)!.set(u, backBefore + b);
  const head = `residual[${u}][${v}] = ${before} - ${b} = ${before - b}, residual[${v}][${u}] = ${backBefore} + ${b} = ${backBefore + b}`;
  const fwd = net.edgeIndex(u, v);
  const rev = net.edgeIndex(v, u);
  const parts: string[] = [];
  if (rev !== undefined) {
    const was = flowsBefore[rev];
    const now = net.flow(res, rev);
    if (now !== was) parts.push(`it cancels ${was - now} of ${v}${ARROW}${u}'s flow (${was} ${ARROW} ${now} of ${net.input.edges[rev].cap})`);
  }
  if (fwd !== undefined) {
    const was = flowsBefore[fwd];
    const now = net.flow(res, fwd);
    if (now !== was) parts.push(`${u}${ARROW}${v} now carries ${now}/${net.input.edges[fwd].cap}`);
  }
  return `${head}: ${parts.join(', and ')}.`;
}

/**
 * Source side reached in the final residual graph, the original edges crossing the cut and
 * a caption that checks the max-flow min-cut theorem on them.
 */
export function cutSummary(net: FlowNet, res: Residual, reached: Set<string>, maxFlow: number): { forward: number[]; backward: number[]; capacity: number; text: string } {
  const forward: number[] = [];
  const backward: number[] = [];
  net.input.edges.forEach((e, i) => {
    if (reached.has(e.from) && !reached.has(e.to)) forward.push(i);
    if (!reached.has(e.from) && reached.has(e.to)) backward.push(i);
  });
  const capacity = forward.reduce((s, i) => s + net.input.edges[i].cap, 0);
  const edgeText = (i: number) => {
    const e = net.input.edges[i];
    return `${e.from}${ARROW}${e.to} ${net.flow(res, i)}/${e.cap}`;
  };
  const fwdText = forward.length
    ? `Every original edge from S to T is full: ${forward.map(edgeText).join(', ')}, ` +
      (forward.length > 1 ? `total capacity ${forward.map((i) => net.input.edges[i].cap).join(' + ')} = ${capacity}` : `capacity ${capacity}`)
    : 'No original edge leaves S, so the cut has capacity 0';
  const backText = backward.length ? ` Edges from T back into S carry nothing: ${backward.map(edgeText).join(', ')}.` : '';
  return {
    forward,
    backward,
    capacity,
    text: `${fwdText}, which equals the maximum flow ${maxFlow}.${backText}`,
  };
}

export function strip(label: string, items: Array<string | { text: string; role?: Role }>, empty?: string): ReservedStrip {
  return { label, items: items.map((it) => (typeof it === 'string' ? { text: it } : it)), empty };
}

/** Why a search passes over the residual entry u->v: its far end is already reached, or it has no room. */
export function skipText(net: FlowNet, res: Residual, u: string, v: string, reached: boolean): string {
  if (reached) return `${u}${ARROW}${v} (${v} already reached)`;
  const i = net.edgeIndex(u, v);
  if (i === undefined) return `${u}${ARROW}${v} (no flow on ${v}${ARROW}${u} to cancel)`;
  const e = net.input.edges[i];
  if (e.cap === 0) return `${u}${ARROW}${v} (capacity 0)`;
  return `${u}${ARROW}${v} (full, ${net.flow(res, i)}/${e.cap})`;
}

/** The residual capacities along a path and their minimum, for the bottleneck caption. */
export function bottleneckOf(res: Residual, path: string[]): { values: number[]; b: number; at: number[] } {
  const values = path.slice(0, -1).map((u, k) => res.get(u)!.get(path[k + 1])!);
  const b = Math.min(...values);
  return { values, b, at: values.map((x, k) => (x === b ? k : -1)).filter((k) => k >= 0) };
}

/** Run a tracer at parse time and refuse inputs whose run would not fit the player. */
export function checkFrameBudget(input: FlowInput, frames: number, rounds: number): FlowInput {
  if (frames > FLOW_LIMITS.maxFrames) {
    throw new InputError(
      `This network takes ${rounds} augmenting paths and ${frames} steps; the player shows at most ${FLOW_LIMITS.maxFrames}. Lower the capacities or remove a few edges.`,
    );
  }
  return input;
}
