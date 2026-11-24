/**
 * Hierholzer's algorithm for an Eulerian path or circuit, drawn with GraphView: the vertices on
 * a circle, each edge marked as it is used, the stack of the current walk, and the path that
 * the pops build from its end, where every detour lands as a closed circuit.
 *
 * Mirrors Algorithms/Graph_Algorithms/Advanced_Graph/Eulerian_Path/Python/eulerian_path.py:
 * _adjacency lists each vertex's (neighbour, edge) pairs in edge order, an undirected edge in
 * the lists of both ends (a self-loop twice); _degree_check counts odd degrees (undirected) or
 * out - in (directed) and names the start; _hierholzer walks from it with an explicit stack,
 * ptr[v] moving only forward through adj[v] and skipping entries whose edge was used from the
 * other end; a walk with fewer than E edges means the edges lie in more than one component.
 * The golden fixture (__fixtures__/advancedGraph.json, section "euler") pins the degree check,
 * the lists _hierholzer returns (including the partial walk of a disconnected graph) and the
 * final answer.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GraphState } from '../renderers/GraphView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { circleLayout } from './graph';

export interface EulerInput {
  /** Vertices 0 .. n - 1. */
  n: number;
  directed: boolean;
  /** Edges [u, v] in the order written: the order of adj. */
  edges: Array<[number, number]>;
}

export type EulerKind = 'circuit' | 'path' | 'none';

export const EULER_LIMITS = { maxVertices: 8, maxEdges: 16 };

/**
 * Parse "0-1, 1-2, 2-0" (undirected) or "0->1, 1->2" (directed), with an optional "n 6" for
 * vertices without an edge. Without it, n is one more than the largest vertex named. Loops and
 * repeated edges are refused: the code accepts them, but the picture would draw a loop as
 * nothing and two parallel edges as one line.
 */
export function parseEuler(text: string): EulerInput {
  const { maxVertices, maxEdges } = EULER_LIMITS;
  const edges: Array<[number, number]> = [];
  const written = new Set<string>();
  let kind: '-' | '->' | undefined;
  let n: number | undefined;
  for (const raw of text.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean)) {
    const opt = raw.match(/^n\s*[:= ]?\s*(\d+)$/i);
    if (opt) {
      if (n !== undefined) throw new InputError('Give the number of vertices only once.');
      n = Number(opt[1]);
      if (n < 1 || n > maxVertices) throw new InputError(`Up to ${maxVertices} vertices here (got n ${n}).`);
      continue;
    }
    const m = raw.match(/^(\d+)\s*(->|-)\s*(\d+)$/);
    if (!m) throw new InputError(`Cannot read "${raw}". Write an undirected edge as "0-1", a directed one as "0->1", and add "n 6" for vertices without an edge.`);
    const u = Number(m[1]);
    const v = Number(m[3]);
    const arrow = m[2] as '-' | '->';
    if (u >= maxVertices || v >= maxVertices) throw new InputError(`Vertices are numbered 0 to ${maxVertices - 1} here (got "${raw}").`);
    if (kind && arrow !== kind) throw new InputError('Use one kind of edge: all "u-v" (undirected) or all "u->v" (directed).');
    kind = arrow;
    if (u === v) {
      throw new InputError(`"${raw}" is a self-loop. The code accepts loops (an undirected one adds 2 to its vertex's degree), but this picture cannot draw one, so leave it out.`);
    }
    const key = arrow === '->' ? `${u}->${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (written.has(key)) {
      throw new InputError(`${key} appears twice. The code treats parallel edges as separate edges, but this picture would draw them as one line, so give each pair once.`);
    }
    written.add(key);
    edges.push([u, v]);
  }
  if (edges.length === 0) throw new InputError('Enter at least one edge, like "0-1, 1-2, 2-0" or "0->1, 1->2, 2->0".');
  if (edges.length > maxEdges) throw new InputError(`At most ${maxEdges} edges, please (got ${edges.length}).`);
  const need = Math.max(...edges.flat()) + 1;
  if (n !== undefined && n < need) throw new InputError(`An edge uses vertex ${need - 1}, so n must be at least ${need} (got n ${n}).`);
  return { n: n ?? need, directed: kind === '->', edges };
}

export function formatEuler(input: EulerInput): string {
  const arrow = input.directed ? '->' : '-';
  return `${input.edges.map(([u, v]) => `${u}${arrow}${v}`).join(', ')}; n ${input.n}`;
}

interface Entry {
  to: number;
  edge: number;
}

/** adj[u]: (neighbour, edge) pairs in edge order; an undirected edge in both lists, a loop twice. */
function adjacency(input: EulerInput): Entry[][] {
  const adj: Entry[][] = Array.from({ length: input.n }, () => []);
  input.edges.forEach(([u, v], e) => {
    adj[u].push({ to: v, edge: e });
    if (!input.directed) adj[v].push({ to: u, edge: e });
  });
  return adj;
}

/** _degree_check: the kind the degrees allow and the start (-1 when none or no edge). */
function degreeCheck(input: EulerInput): { kind: EulerKind; start: number; degree: number[]; surplus: number[] } {
  const { n, edges, directed } = input;
  const degree = Array<number>(n).fill(0);
  const surplus = Array<number>(n).fill(0);
  for (const [u, v] of edges) {
    degree[u]++;
    degree[v]++;
    surplus[u]++;
    surplus[v]--;
  }
  const result = (kind: EulerKind, start: number) => ({ kind, start, degree, surplus });
  if (edges.length === 0) return result('circuit', -1);
  const first = Math.min(...edges.flat());
  if (directed) {
    const starts = surplus.flatMap((s, v) => (s === 1 ? [v] : []));
    const ends = surplus.filter((s) => s === -1).length;
    const unbalanced = surplus.filter((s) => s !== 0).length;
    if (unbalanced === 0) return result('circuit', first);
    if (unbalanced === 2 && starts.length === 1 && ends === 1) return result('path', starts[0]);
    return result('none', -1);
  }
  const odd = degree.flatMap((d, v) => (d % 2 === 1 ? [v] : []));
  if (odd.length === 0) return result('circuit', first);
  if (odd.length === 2) return result('path', odd[0]);
  return result('none', -1);
}

/* ---------- text helpers ---------- */

function names(xs: Array<string | number>): string {
  const s = xs.map(String);
  return s.length <= 1 ? s.join('') : `${s.slice(0, -1).join(', ')} and ${s[s.length - 1]}`;
}

const plural = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`;
const signed = (s: number) => (s > 0 ? `+${s}` : `${s}`);

/* ---------- frames ---------- */

export const EULER_CODE = [
  'eulerian_path(n, edges, directed):',
  '  adj[v] = (neighbour, edge) pairs in edge order    # undirected: in both ends\' lists',
  '  kind, start = _degree_check()     # odd degrees, or out - in at every vertex',
  '  if kind == NONE: return None;  if no edges: return the empty walk',
  '  stack = [start]; ptr = [0] * n; used = [False] * E; result = []',
  '  while stack:',
  '    v = stack[-1]',
  '    while ptr[v] < len(adj[v]): w, e = adj[v][ptr[v]]; ptr[v] += 1; stop at the first unused e',
  '    if v had an unused edge e: used[e] = True; stack.append(w)    # walk on',
  '    else: result.append(stack.pop())    # v is finished: back up one step',
  '  if len(result) < E + 1: return None    # the walk missed edges: another component',
  '  return result reversed',
];

export type EulerFrame = Frame<GraphState>;
type Vars = NonNullable<EulerFrame['vars']>;

export interface EulerWalkLists {
  vertices: number[];
  edgeIds: number[];
}

export interface EulerRun {
  frames: EulerFrame[];
  /** _degree_check's answer. */
  degrees: { kind: EulerKind; start: number };
  /** What _hierholzer returned, or null when it did not run: the walk of the start's component. */
  walked: EulerWalkLists | null;
  /** eulerian_kind and eulerian_path. */
  kind: EulerKind;
  walk: EulerWalkLists | null;
}

class EulerRecorder {
  frames: EulerFrame[] = [];
  nodeRole = new Map<number, Role>();
  edgeRole = new Map<number, Role>();
  badges = new Map<number, string>();
  private readonly pos: Map<string, { x: number; y: number }>;

  constructor(readonly input: EulerInput) {
    this.pos = circleLayout(Array.from({ length: input.n }, (_, v) => String(v)));
  }

  snap(line: number, caption: string, vars: Vars, strips: StripData[]) {
    const { input } = this;
    this.frames.push({
      line,
      caption,
      vars,
      state: {
        nodes: Array.from({ length: input.n }, (_, v) => ({
          id: String(v),
          ...this.pos.get(String(v))!,
          role: this.nodeRole.get(v) ?? 'idle',
          badge: this.badges.get(v),
        })),
        edges: input.edges.map(([u, v], e) => ({
          id: e,
          from: String(u),
          to: String(v),
          directed: input.directed,
          weight: 0,
          role: this.edgeRole.get(e) ?? 'idle',
        })),
        showWeights: false,
        strips,
      },
    });
  }
}

function strip(label: string, items: StripItem[]): StripData {
  return { label, items: items.length ? items : [{ text: '(empty)' }] };
}

export function eulerTrace(input: EulerInput): EulerRun {
  const { n, edges, directed } = input;
  const E = edges.length;
  const adj = adjacency(input);
  const r = new EulerRecorder(input);
  const edgeText = (e: number) => `${edges[e][0]}${directed ? '->' : '-'}${edges[e][1]}`;
  const touched = new Set(edges.flat());
  const isolated = Array.from({ length: n }, (_, v) => v).filter((v) => !touched.has(v));
  for (const v of isolated) r.nodeRole.set(v, 'muted');
  const isolatedNote = isolated.length
    ? ` ${names(isolated)} ${isolated.length > 1 ? 'have' : 'has'} no edge and ${isolated.length > 1 ? 'play' : 'plays'} no part.`
    : '';

  r.snap(
    1,
    `adj lists each vertex's edges in the order they were written` +
      (directed ? ', each directed edge in its tail\'s list' : ', each undirected edge in the lists of both its ends') +
      '. The walk will always leave a vertex by the first edge in its list that it has not used yet.' +
      isolatedNote,
    [['E', E]],
    [strip('Stack', []), strip('Path', [])],
  );

  // _degree_check
  const deg = degreeCheck(input);
  const degrees = { kind: deg.kind, start: deg.start };
  const withEdges = Array.from({ length: n }, (_, v) => v).filter((v) => !isolated.includes(v));
  for (const v of withEdges) r.badges.set(v, directed ? signed(deg.surplus[v]) : `deg=${deg.degree[v]}`);
  let degreeCaption: string;
  if (E === 0) {
    degreeCaption = 'There is no edge, so there is nothing to walk.';
  } else if (directed) {
    const minus = withEdges.filter((v) => deg.surplus[v] < 0);
    const lead = 'Badge: out-degree minus in-degree. ';
    if (deg.kind === 'circuit') {
      degreeCaption = `${lead}Every vertex has as many edges out as in, so a closed walk can pass through each one: an Eulerian circuit, if all the edges are connected. It starts at the smallest vertex with an edge, ${deg.start}.`;
    } else if (deg.kind === 'path') {
      const end = minus[0];
      degreeCaption =
        `${lead}${deg.start} has one more edge out than in, ${end} one more in than out, and every other vertex is balanced: ` +
        `a path from ${deg.start} to ${end}, if all the edges are connected. It must start at ${deg.start}.`;
    } else {
      const off = withEdges.filter((v) => deg.surplus[v] !== 0);
      const far = off.filter((v) => Math.abs(deg.surplus[v]) > 1);
      const outs = off.filter((v) => deg.surplus[v] === 1);
      const ins = off.filter((v) => deg.surplus[v] === -1);
      const reasons = [
        ...(far.length ? [`${names(far)} ${far.length > 1 ? 'are' : 'is'} off by more than one`] : []),
        ...(outs.length > 1 ? [`${names(outs)} each have one extra edge out`] : []),
        ...(ins.length > 1 ? [`${names(ins)} each have one extra edge in`] : []),
      ];
      degreeCaption =
        `${lead}${names(off.map((v) => `${v} (${signed(deg.surplus[v])})`))} ${off.length > 1 ? 'are' : 'is'} unbalanced. ` +
        'A walk enters and leaves every vertex in between equally often, so only its start may have one extra edge out and only its end one extra edge in. ' +
        `Here ${names(reasons)}: no Eulerian path.`;
    }
  } else {
    const odd = withEdges.filter((v) => deg.degree[v] % 2 === 1);
    const lead = 'Badge: degree, the number of edge ends at the vertex. ';
    if (deg.kind === 'circuit') {
      degreeCaption = `${lead}Every degree is even, so a closed walk can pass through each vertex: an Eulerian circuit, if all the edges are connected. It starts at the smallest vertex with an edge, ${deg.start}.`;
    } else if (deg.kind === 'path') {
      degreeCaption = `${lead}Exactly two vertices, ${odd[0]} and ${odd[1]}, have odd degree: a path from one to the other, if all the edges are connected. It starts at the smaller one, ${deg.start}.`;
    } else {
      degreeCaption =
        `${lead}${plural(odd.length, 'vertex', 'vertices')}, ${names(odd)}, have odd degree. ` +
        'A walk uses two edge ends at every vertex it passes through, so only its two ends can have odd degree: no Eulerian path.';
    }
  }
  r.nodeRole.clear();
  for (const v of isolated) r.nodeRole.set(v, 'muted');
  if (deg.kind === 'none') {
    for (const v of withEdges) if (directed ? deg.surplus[v] !== 0 : deg.degree[v] % 2 === 1) r.nodeRole.set(v, 'bad');
  } else if (E > 0) {
    for (const v of withEdges) if (directed ? deg.surplus[v] !== 0 : deg.degree[v] % 2 === 1) r.nodeRole.set(v, 'compare');
    r.nodeRole.set(deg.start, 'active');
  }
  r.snap(2, degreeCaption, [['kind', deg.kind], ['start', deg.start]], [strip('Stack', []), strip('Path', [])]);

  if (deg.kind === 'none' || E === 0) {
    r.snap(
      3,
      deg.kind === 'none'
        ? 'The degree test failed, so eulerian_path returns None (no walk) and eulerian_kind "none", without walking at all.'
        : 'eulerian_kind says "circuit" and eulerian_path returns the empty walk: two empty lists.',
      [['kind', deg.kind]],
      [strip('Stack', []), strip('Path', [])],
    );
    return { frames: r.frames, degrees, walked: null, kind: deg.kind, walk: deg.kind === 'none' ? null : { vertices: [], edgeIds: [] } };
  }

  // _hierholzer
  const start = deg.start;
  const used = Array<boolean>(E).fill(false);
  const ptr = Array<number>(n).fill(0);
  const stack = [start];
  const via = [-1];
  const vertices: number[] = [];
  const edgeIds: number[] = [];
  /** Unused entries of adj[v]: unused edge ends (undirected) or unused edges out (directed). 0 means stuck. */
  const unusedAt = (v: number) => adj[v].filter((en) => !used[en.edge]).length;
  const onStackEdges = () => new Set(via.filter((e) => e !== -1));
  let usedCount = 0;
  let lastWasPop = false;
  let pops = 0;
  let detourBase = -1;

  const paint = (focusEdge: number | null) => {
    r.nodeRole.clear();
    r.edgeRole.clear();
    r.badges.clear();
    for (const v of isolated) r.nodeRole.set(v, 'muted');
    for (let v = 0; v < n; v++) {
      if (isolated.includes(v)) continue;
      r.badges.set(v, `left=${unusedAt(v)}`);
      if (unusedAt(v) === 0) r.nodeRole.set(v, 'done');
    }
    const live = onStackEdges();
    for (let e = 0; e < E; e++) {
      if (live.has(e)) r.edgeRole.set(e, 'compare');
      else if (used[e]) r.edgeRole.set(e, 'done');
    }
    for (const v of stack) r.nodeRole.set(v, 'compare');
    if (stack.length) r.nodeRole.set(stack[stack.length - 1], 'active');
    if (focusEdge !== null) r.edgeRole.set(focusEdge, 'active');
  };
  const stackStrip = () => strip('Stack', stack.map((v, k) => ({ text: String(v), role: k === stack.length - 1 ? ('active' as Role) : undefined })));
  const pathStrip = (fresh: number) =>
    strip(
      'Path',
      [...vertices].reverse().map((v, k) => ({ text: String(v), role: k < fresh ? ('active' as Role) : undefined })),
    );
  const vars = (v: number, ...extra: Vars): Vars => [['v', v], ['ptr[v]', `${ptr[v]}/${adj[v].length}`], ['used', `${usedCount}/${E}`], ...extra];

  paint(null);
  r.snap(
    4,
    `Start the walk at ${start}: the stack holds the walk so far. ptr[v] marks how far adj[v] has been read; it only moves forward, so every entry is read once. ` +
      'The Path strip shows result in the order it will be returned: the code appends each popped vertex and reverses the list at the end, so here each pop lands at the front.',
    vars(start),
    [stackStrip(), pathStrip(0)],
  );

  while (stack.length) {
    const v = stack[stack.length - 1];
    const row = adj[v];
    const skipped: number[] = [];
    let taken = -1;
    let to = -1;
    while (ptr[v] < row.length) {
      const en = row[ptr[v]];
      ptr[v]++;
      if (!used[en.edge]) {
        taken = en.edge;
        to = en.to;
        break;
      }
      skipped.push(en.edge);
    }
    const skipText = skipped.length
      ? `ptr[${v}] passes ${plural(skipped.length, 'entry', 'entries')} for ${names(skipped.map(edgeText))}, already used from ${skipped.every((e) => edges[e][0] === edges[e][1]) ? 'this end' : 'the other end'}. `
      : '';
    if (taken === -1) {
      const popped = stack.pop()!;
      vertices.push(popped);
      const e = via.pop()!;
      if (e !== -1) edgeIds.push(e);
      pops++;
      const below = stack.length ? stack[stack.length - 1] : -1;
      let why: string;
      if (pops === 1) {
        why =
          deg.kind === 'path'
            ? `${skipText}The walk is stuck at ${popped}, the end the degrees named: every other vertex it enters still has an unused edge to leave by. `
            : `${skipText}The walk is stuck at ${popped}, back where it started: every other vertex it enters still has an unused edge to leave by. `;
        why += `${popped} is finished: pop it into result, the last vertex of the walk.`;
      } else if (!lastWasPop && detourBase >= 0) {
        const loop = [...stack.slice(detourBase), popped];
        why =
          `${skipText}The detour is stuck at ${popped}, where it started: ${loop.join(' -> ')} is a closed circuit. ` +
          `Popping its vertices one by one puts it at the front of the path, spliced in at ${popped}.`;
      } else {
        why = `${skipText}${popped} has no unused edge left, so it is finished: pop it to the front of the path.`;
      }
      why += below >= 0 ? ` Back up to ${below}.` : ' The stack is empty.';
      lastWasPop = true;
      paint(e === -1 ? null : e);
      r.snap(9, why, vars(popped), [stackStrip(), pathStrip(1)]);
      continue;
    }
    let lead = '';
    if (lastWasPop) {
      detourBase = stack.length - 1;
      lead = `${v} still has an unused edge, so a detour starts here. It can only get stuck back at ${v}, because every other vertex it enters has an unused edge to leave by. `;
    }
    used[taken] = true;
    usedCount++;
    stack.push(to);
    via.push(taken);
    lastWasPop = false;
    paint(taken);
    r.snap(
      8,
      `${lead}${skipText}At ${v}, take edge ${taken} (${edgeText(taken)}), the first unused one in adj[${v}], to ${to}. It is now used${directed ? '' : ' from both ends'}; push ${to}.`,
      vars(v, ['w', to]),
      [stackStrip(), pathStrip(0)],
    );
  }
  vertices.reverse();
  edgeIds.reverse();
  const walked = { vertices, edgeIds };

  r.nodeRole.clear();
  r.edgeRole.clear();
  r.badges.clear();
  for (const v of isolated) r.nodeRole.set(v, 'muted');
  const pathItems = vertices.map((v) => ({ text: String(v) }));
  if (edgeIds.length < E) {
    const missed = Array.from({ length: E }, (_, e) => e).filter((e) => !used[e]);
    const away = new Set(missed.flatMap((e) => edges[e]));
    for (let e = 0; e < E; e++) if (used[e]) r.edgeRole.set(e, 'done');
    for (const v of new Set(vertices)) r.nodeRole.set(v, 'done');
    for (const v of away) r.nodeRole.set(v, 'bad');
    r.snap(
      10,
      `The stack is empty, but the walk used only ${edgeIds.length} of the ${E} edges. ` +
        `${names(missed.map(edgeText))} ${missed.length > 1 ? 'lie' : 'lies'} in another component, which no walk from ${start} can reach: eulerian_path returns None.`,
      [['used', `${edgeIds.length}/${E}`]],
      [strip('Stack', []), strip('Path', pathItems)],
    );
    return { frames: r.frames, degrees, walked, kind: 'none', walk: null };
  }
  for (let e = 0; e < E; e++) r.edgeRole.set(e, 'done');
  for (const v of touched) r.nodeRole.set(v, 'done');
  r.nodeRole.set(vertices[0], 'good');
  r.nodeRole.set(vertices[vertices.length - 1], 'good');
  r.snap(
    11,
    `The stack is empty and result holds all ${plural(E, 'edge', 'edges')}, each once. Reversed, it is the ` +
      (deg.kind === 'circuit' ? `Eulerian circuit from ${start} back to ${start}` : `Eulerian path from ${start} to ${vertices[vertices.length - 1]}`) +
      `: ${vertices.join(' -> ')}, along edges ${edgeIds.join(', ')}.`,
    [['kind', deg.kind]],
    [strip('Stack', []), strip('Path', pathItems)],
  );
  return { frames: r.frames, degrees, walked, kind: deg.kind, walk: walked };
}
