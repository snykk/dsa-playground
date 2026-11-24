/**
 * Kuhn's algorithm and Hopcroft-Karp, drawn with GraphView: the left vertices L0, L1, ... in
 * one column, the right vertices R0, R1, ... in the other, and the edges between them.
 *
 * Mirrors Algorithms/Graph_Algorithms/Advanced_Graph/Bipartite_Matching/Python/bipartite_matching.py:
 * adj[u] lists u's right neighbours in edge order (a repeated edge stays). kuhn runs
 * _kuhn_augment from each left vertex in turn, with seen[v] == root marking the right vertices a
 * search has tried. hopcroft_karp alternates _bfs_layers, which stops at the first free right
 * vertex and clears the layers past its neighbour's, and _hk_augment from each free left vertex,
 * which only steps to the next layer and gives a dead end dist -1. Both searches keep their path
 * in lists (stack, next_edge, through), as here. min_vertex_cover reads Konig's cover off the
 * Hopcroft-Karp matching; the Hopcroft-Karp tab ends with it. The golden fixture
 * (__fixtures__/advancedGraph.json, section "matching") pins every augmenting path, every seen
 * set, the layers of every phase, the dist list after every search and the cover.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GraphState } from '../renderers/GraphView';
import type { StripData, StripItem } from '../ui/molecules/Strip';

export interface MatchingInput {
  nLeft: number;
  nRight: number;
  /** Edges [u, v] in the order written: the order of adj[u]. */
  edges: Array<[number, number]>;
}

export const MATCHING_LIMITS = { maxSide: 7, maxEdges: 20 };

/**
 * Parse "0-1, 0-2, 1-0; left 4, right 3". An edge is "u-v" or "L0-R1" (left vertex first);
 * without "left N" / "right N" a side has one more vertex than its largest index.
 */
export function parseMatching(text: string): MatchingInput {
  const { maxSide, maxEdges } = MATCHING_LIMITS;
  const edges: Array<[number, number]> = [];
  const written = new Set<string>();
  const size: { left?: number; right?: number } = {};
  for (const raw of text.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean)) {
    const opt = raw.match(/^(left|right)\s*[:= ]?\s*(\d+)$/i);
    if (opt) {
      const side = opt[1].toLowerCase() as 'left' | 'right';
      const n = Number(opt[2]);
      if (size[side] !== undefined) throw new InputError(`Give the size of the ${side} side only once.`);
      if (n < 1 || n > maxSide) throw new InputError(`Each side has 1 to ${maxSide} vertices here (got ${side} ${n}).`);
      size[side] = n;
      continue;
    }
    const m = raw.match(/^[Ll]?(\d+)\s*-\s*[Rr]?(\d+)$/);
    if (!m) throw new InputError(`Cannot read "${raw}". Write an edge as "left-right", like "0-1" or "L0-R1", and sizes as "left 4, right 3".`);
    const u = Number(m[1]);
    const v = Number(m[2]);
    if (u >= maxSide || v >= maxSide) throw new InputError(`Vertices are numbered 0 to ${maxSide - 1} on each side (got "${raw}").`);
    if (written.has(`${u}-${v}`)) {
      throw new InputError(`L${u}-R${v} appears twice. adj[${u}] would hold R${v} twice, and the second copy changes nothing, so give it once.`);
    }
    written.add(`${u}-${v}`);
    edges.push([u, v]);
  }
  if (edges.length > maxEdges) throw new InputError(`At most ${maxEdges} edges, please (got ${edges.length}).`);
  const needLeft = Math.max(0, ...edges.map(([u]) => u + 1));
  const needRight = Math.max(0, ...edges.map(([, v]) => v + 1));
  const nLeft = size.left ?? needLeft;
  const nRight = size.right ?? needRight;
  if (nLeft === 0 || nRight === 0) throw new InputError('Enter at least one edge, like "0-0, 1-0, 1-1", or give both sizes, like "left 3, right 2".');
  if (nLeft < needLeft) throw new InputError(`An edge uses L${needLeft - 1}, so the left side needs at least ${needLeft} vertices (got left ${nLeft}).`);
  if (nRight < needRight) throw new InputError(`An edge uses R${needRight - 1}, so the right side needs at least ${needRight} vertices (got right ${nRight}).`);
  return { nLeft, nRight, edges };
}

export function formatMatching(input: MatchingInput): string {
  return `${input.edges.map(([u, v]) => `${u}-${v}`).join(', ')}; left ${input.nLeft}, right ${input.nRight}`;
}

/** adj[u]: the right neighbours of left vertex u, in edge order. */
function adjacency(input: MatchingInput): number[][] {
  const adj: number[][] = Array.from({ length: input.nLeft }, () => []);
  for (const [u, v] of input.edges) adj[u].push(v);
  return adj;
}

const L = (u: number) => `L${u}`;
const R = (v: number) => `R${v}`;

function names(xs: string[]): string {
  return xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
}

/** The path stack[0] - through[0] - stack[1] - ..., as numbers in turn (what the fixture records). */
function interleave(stack: number[], through: number[]): number[] {
  const out: number[] = [];
  stack.forEach((u, k) => {
    out.push(u);
    if (k < through.length) out.push(through[k]);
  });
  return out;
}

function pathText(stack: number[], through: number[]): string {
  return interleave(stack, through)
    .map((x, k) => (k % 2 === 0 ? L(x) : R(x)))
    .join(' - ');
}

function flip(stack: number[], through: number[], matchLeft: number[], matchRight: number[]) {
  stack.forEach((u, k) => {
    matchLeft[u] = through[k];
    matchRight[through[k]] = u;
  });
}

/* ---------- layout and frames ---------- */

const LEFT_X = 180;
const RIGHT_X = 420;
const MID_Y = 190;

function columnY(count: number, rows: number): number[] {
  const spacing = rows > 1 ? Math.min(64, 290 / (rows - 1)) : 0;
  return Array.from({ length: count }, (_, i) => Math.round(MID_Y + (i - (count - 1) / 2) * spacing));
}

export type MatchingFrame = Frame<GraphState>;
type Vars = NonNullable<MatchingFrame['vars']>;

/** Records full snapshots; a vertex or edge without a role of its own is 'done' when matched. */
class MatchingRecorder {
  frames: MatchingFrame[] = [];
  nodeRole = new Map<string, Role>();
  edgeRole = new Map<number, Role>();
  badges = new Map<string, string>();
  private readonly ys: { left: number[]; right: number[] };
  private readonly edgeIds = new Map<string, number[]>();

  constructor(
    readonly input: MatchingInput,
    readonly matchLeft: number[],
    readonly matchRight: number[],
  ) {
    const rows = Math.max(input.nLeft, input.nRight);
    this.ys = { left: columnY(input.nLeft, rows), right: columnY(input.nRight, rows) };
    input.edges.forEach(([u, v], i) => this.edgeIds.set(`${u}-${v}`, [...(this.edgeIds.get(`${u}-${v}`) ?? []), i]));
  }

  clear() {
    this.nodeRole.clear();
    this.edgeRole.clear();
  }

  /** Give every copy of the edge u-v a role. */
  edge(u: number, v: number, role: Role) {
    for (const i of this.edgeIds.get(`${u}-${v}`) ?? []) this.edgeRole.set(i, role);
  }

  matchingStrip(): StripData {
    const pairs: StripItem[] = [];
    this.matchLeft.forEach((v, u) => {
      if (v !== -1) pairs.push({ text: `${L(u)}-${R(v)}` });
    });
    return { label: 'Matching', items: pairs.length ? pairs : [{ text: '(empty)' }] };
  }

  snap(line: number, caption: string, vars: Vars, strips: StripData[]) {
    const { input, matchLeft, matchRight } = this;
    const node = (id: string, x: number, y: number, matched: boolean) => ({
      id,
      x,
      y,
      role: this.nodeRole.get(id) ?? (matched ? 'done' : 'idle'),
      badge: this.badges.get(id),
    });
    this.frames.push({
      line,
      caption,
      vars,
      state: {
        nodes: [
          ...this.ys.left.map((y, u) => node(L(u), LEFT_X, y, matchLeft[u] !== -1)),
          ...this.ys.right.map((y, v) => node(R(v), RIGHT_X, y, matchRight[v] !== -1)),
        ],
        edges: input.edges.map(([u, v], i) => ({
          id: i,
          from: L(u),
          to: R(v),
          directed: false,
          weight: 0,
          role: this.edgeRole.get(i) ?? (matchLeft[u] === v ? 'done' : 'idle'),
        })),
        showWeights: false,
        strips: [...strips, this.matchingStrip()],
      },
    });
  }
}

function pathStrip(stack: number[], through: number[]): StripData {
  const items = interleave(stack, through).map((x, k) => ({ text: k % 2 === 0 ? L(x) : R(x) }));
  return { label: 'Path', items: items.length ? items : [{ text: '(empty)' }] };
}

/** Paint a search in progress: the path so far, its top, and the vertices given up on. */
function paintSearch(r: MatchingRecorder, stack: number[], through: number[], dead: Set<string>) {
  r.clear();
  for (const id of dead) r.nodeRole.set(id, 'muted');
  stack.forEach((u, k) => {
    r.nodeRole.set(L(u), k === stack.length - 1 ? 'active' : 'compare');
    if (k < through.length) {
      r.nodeRole.set(R(through[k]), 'compare');
      r.edge(u, through[k], 'compare');
    }
  });
}

/** Paint an augmenting path: its vertices, and its edges outside the matching (they enter it). */
function paintPath(r: MatchingRecorder, stack: number[], through: number[]) {
  r.clear();
  stack.forEach((u, k) => {
    r.nodeRole.set(L(u), 'active');
    r.nodeRole.set(R(through[k]), 'active');
    r.edge(u, through[k], 'active');
  });
}

/** After a flip: the path's new matching edges stand out; the edges it gave up are plain again. */
function paintFlipped(r: MatchingRecorder, stack: number[], through: number[]) {
  r.clear();
  stack.forEach((u, k) => r.edge(u, through[k], 'active'));
}

function flipCaption(stack: number[], through: number[], size: number): string {
  const pairs = stack.map((u, k) => `${L(u)}-${R(through[k])}`);
  const gave = stack.slice(1).map((u, k) => `${L(u)}-${R(through[k])}`);
  return (
    `Flip the path: ${names(pairs)} ${pairs.length > 1 ? 'enter' : 'enters'} the matching` +
    (gave.length ? `, ${names(gave)} ${gave.length > 1 ? 'leave' : 'leaves'} it` : '') +
    `. Every vertex that was matched stays matched, and ${L(stack[0])} and ${R(through[through.length - 1])} join: size = ${size}.`
  );
}

function augmentingCaption(stack: number[], through: number[], prefix: string): string {
  const v = through[through.length - 1];
  const k = stack.length;
  return (
    `${prefix}${R(v)} is free, so ${pathText(stack, through)} is an augmenting path: ` +
    (k > 1
      ? `${k} edges outside the matching alternate with ${k - 1} inside it, and both ends are free.`
      : `a single edge between two free vertices.`)
  );
}

const skipNote = (skipped: number[], why: string) =>
  skipped.length ? `${names(skipped.map(R))} ${skipped.length > 1 ? 'were' : 'was'} ${why}, so skip ${skipped.length > 1 ? 'them' : 'it'}. ` : '';

/* ---------- Kuhn ---------- */

export const KUHN_CODE = [
  'kuhn(n_left, n_right, edges):',
  '  adj[u] = right neighbours of u in edge order; match_left = match_right = all -1; seen = all -1',
  '  for root in 0 .. n_left - 1:             # _kuhn_augment(root): a DFS for an augmenting path',
  '    stack = [root]; through = []          # left vertices on the path, and the right ones between',
  '    while stack: u = stack[-1]; take u\'s next neighbour v',
  '      if seen[v] == root: continue        # this search has tried v already',
  '      seen[v] = root; through.append(v)',
  '      if match_right[v] == -1: flip the path; size += 1; next root',
  '      else: stack.append(match_right[v])  # v is taken: its partner must move',
  '    u has no neighbour left: pop u          # empty stack: root stays free',
  'return size, match_left',
];

export interface KuhnRoot {
  root: number;
  /** The flipped path, left and right vertices in turn, or null. */
  path: number[] | null;
  /** The right vertices with seen[v] == root at the end of the search, increasing. */
  seen: number[];
}

export interface KuhnRun {
  frames: MatchingFrame[];
  size: number;
  matchLeft: number[];
  roots: KuhnRoot[];
}

export function kuhnTrace(input: MatchingInput): KuhnRun {
  const adj = adjacency(input);
  const matchLeft = Array<number>(input.nLeft).fill(-1);
  const matchRight = Array<number>(input.nRight).fill(-1);
  const seen = Array<number>(input.nRight).fill(-1);
  const r = new MatchingRecorder(input, matchLeft, matchRight);
  const roots: KuhnRoot[] = [];
  let size = 0;
  const vars = (root: number | undefined, ...extra: Vars): Vars => [...(root === undefined ? [] : ([['root', L(root)]] as Vars)), ['size', size], ...extra];

  r.snap(
    1,
    'adj lists the right neighbours of each left vertex in the order the edges were written, and every search tries them in that order. ' +
      'Nothing is matched yet. Kuhn runs one search for an augmenting path from each left vertex, L0 first.',
    vars(undefined),
    [pathStrip([], [])],
  );

  for (let root = 0; root < input.nLeft; root++) {
    const stack = [root];
    const nextEdge = [0];
    const through: number[] = [];
    const dead = new Set<string>();
    let skipped: number[] = [];
    paintSearch(r, stack, through, dead);
    r.snap(
      2,
      `Root ${L(root)}: search for an augmenting path, a path from this free vertex to a free right vertex whose edges alternate outside and inside the matching. ` +
        `seen[v] == ${root} will mark the right vertices this search has tried.`,
      vars(root),
      [pathStrip(stack, through)],
    );
    let found = false;
    while (stack.length) {
      const top = stack.length - 1;
      const u = stack[top];
      if (nextEdge[top] === adj[u].length) {
        stack.pop();
        nextEdge.pop();
        const via = through.pop();
        dead.add(L(u));
        if (via !== undefined) dead.add(R(via));
        paintSearch(r, stack, through, dead);
        const note = skipNote(skipped, 'tried already in this search');
        r.snap(
          9,
          stack.length
            ? `${note}${L(u)} has no neighbour left to try: no augmenting path goes on from it. Pop it; ${R(via!)}, which led to it, is not tried again in this search. Back at ${L(stack[stack.length - 1])}.`
            : `${note}${L(u)} has no neighbour left to try, and the stack is empty: no augmenting path starts at ${L(root)}, so it stays free. ` +
                'It never finds one later either: a vertex with no augmenting path keeps having none as the matching grows, so one search per vertex is enough.',
          vars(root, ['u', L(u)]),
          [pathStrip(stack, through)],
        );
        skipped = [];
        continue;
      }
      const v = adj[u][nextEdge[top]++];
      if (seen[v] === root) {
        skipped.push(v);
        continue;
      }
      seen[v] = root;
      through.push(v);
      const note = skipNote(skipped, 'tried already in this search');
      skipped = [];
      if (matchRight[v] === -1) {
        paintPath(r, stack, through);
        r.snap(7, augmentingCaption(stack, through, `${note}${L(u)} tries ${R(v)}. `), vars(root, ['u', L(u)], ['v', R(v)]), [pathStrip(stack, through)]);
        const path = interleave(stack, through);
        flip(stack, through, matchLeft, matchRight);
        size++;
        paintFlipped(r, stack, through);
        r.snap(7, flipCaption(stack, through, size), vars(root, ['v', R(v)]), [pathStrip(stack, through)]);
        roots.push({ root, path, seen: seenOf(seen, root) });
        found = true;
        break;
      }
      const w = matchRight[v];
      stack.push(w);
      nextEdge.push(0);
      paintSearch(r, stack, through, dead);
      r.snap(
        8,
        `${note}${L(u)} tries ${R(v)}, but ${R(v)} is matched to ${L(w)}. ${L(u)} can only take it if ${L(w)} moves to another right vertex, so push ${L(w)} and search on from it.`,
        vars(root, ['u', L(u)], ['v', R(v)]),
        [pathStrip(stack, through)],
      );
    }
    if (!found) roots.push({ root, path: null, seen: seenOf(seen, root) });
  }

  r.clear();
  const free = matchLeft.map((v, u) => (v === -1 ? L(u) : '')).filter(Boolean);
  r.snap(
    10,
    `Every left vertex has had its search: the maximum matching has ${size} edge${size === 1 ? '' : 's'}` +
      (free.length ? `, and ${names(free)} ${free.length > 1 ? 'stay' : 'stays'} free.` : ', and every left vertex is matched.') +
      ` match_left = [${matchLeft.join(', ')}].`,
    vars(undefined),
    [pathStrip([], [])],
  );
  return { frames: r.frames, size, matchLeft, roots };
}

function seenOf(seen: number[], root: number): number[] {
  return seen.map((mark, v) => (mark === root ? v : -1)).filter((v) => v >= 0);
}

/* ---------- Hopcroft-Karp ---------- */

export const HOPCROFT_KARP_CODE = [
  'hopcroft_karp(n_left, n_right, edges):',
  '  adj, match_left and match_right as in Kuhn; dist[u] = layer of left vertex u, or -1',
  '  while (last := _bfs_layers()) != -1:      # one phase',
  '    _bfs_layers: every free left vertex in layer 0, in the queue',
  '      u = queue.popleft(); for v in adj[u]: w = match_right[v]',
  '        if w == -1: last = dist[u]; clear dist past last; return last',
  '        if dist[w] == -1: dist[w] = dist[u] + 1; queue.append(w)',
  '      queue empty: return -1                # no augmenting path left',
  '    for root in 0 .. n_left - 1 with match_left[root] == -1:   # _hk_augment(root)',
  '      u = stack[-1]; take u\'s next neighbour v; w = match_right[v]',
  '        if w == -1: flip the path; size += 1; next root',
  '        if dist[w] == dist[u] + 1: stack.append(w)',
  '      u has no neighbour left: dist[u] = -1; pop u   # dead for this phase',
  'return size, match_left',
  'min_vertex_cover: Z = reachable from free left vertices by alternating paths; cover = (L - Z) + (R & Z)',
];

export interface HkAugment {
  root: number;
  path: number[] | null;
  /** dist after the search. */
  dist: number[];
}

export interface HkPhase {
  /** The layer where shortest augmenting paths end, or -1 for the BFS that found none. */
  last: number;
  /** dist as _bfs_layers left it. */
  dist: number[];
  augments: HkAugment[];
}

export interface HkRun {
  frames: MatchingFrame[];
  size: number;
  matchLeft: number[];
  phases: HkPhase[];
  /** min_vertex_cover: the left and the right vertices of the cover, increasing. */
  cover: [number[], number[]];
}

export function hopcroftKarpTrace(input: MatchingInput): HkRun {
  const { nLeft, nRight } = input;
  const adj = adjacency(input);
  const matchLeft = Array<number>(nLeft).fill(-1);
  const matchRight = Array<number>(nRight).fill(-1);
  const dist = Array<number>(nLeft).fill(-1);
  const r = new MatchingRecorder(input, matchLeft, matchRight);
  const phases: HkPhase[] = [];
  let size = 0;
  let phase = 0;
  let last = -1;
  const vars = (...extra: Vars): Vars => [['phase', phase], ['last', last], ['size', size], ...extra];
  const layerBadges = () => {
    r.badges.clear();
    dist.forEach((d, u) => {
      if (d >= 0) r.badges.set(L(u), `d=${d}`);
    });
  };
  const queueStrip = (queue: number[], head: number): StripData => {
    const waiting = queue.slice(head).map((u) => ({ text: L(u) }));
    return { label: 'Queue', items: waiting.length ? waiting : [{ text: '(empty)' }] };
  };

  r.snap(
    1,
    'adj lists the right neighbours of each left vertex in edge order. Nothing is matched yet. ' +
      'Each phase runs one BFS that sorts the left vertices into layers, then one DFS from each free left vertex that only follows the layers.',
    vars(),
    [queueStrip([], 0), pathStrip([], [])],
  );

  for (;;) {
    phase++;
    last = -1;
    // _bfs_layers
    const queue: number[] = [];
    matchLeft.forEach((partner, u) => {
      dist[u] = partner === -1 ? 0 : -1;
      if (partner === -1) queue.push(u);
    });
    layerBadges();
    r.clear();
    for (const u of queue) r.nodeRole.set(L(u), 'compare');
    r.snap(
      3,
      queue.length
        ? `Phase ${phase}: BFS from every free left vertex at once. ${names(queue.map(L))} ${queue.length > 1 ? 'form' : 'forms'} layer 0 (badge d = layer).`
        : `Phase ${phase}: every left vertex is matched, so layer 0 is empty and the BFS has nothing to start from.`,
      vars(),
      [queueStrip(queue, 0), pathStrip([], [])],
    );
    let head = 0;
    while (head < queue.length) {
      const u = queue[head++];
      const added: Array<[number, number]> = [];
      const skipped: Array<[number, number]> = [];
      let free = -1;
      for (const v of adj[u]) {
        const w = matchRight[v];
        if (w === -1) {
          free = v;
          break;
        }
        if (dist[w] === -1) {
          dist[w] = dist[u] + 1;
          queue.push(w);
          added.push([v, w]);
        } else skipped.push([v, w]);
      }
      const addedText = added.length
        ? `${added.map(([v, w]) => `${R(v)} is matched to ${L(w)}`).join(', ')}, so ${names(added.map(([, w]) => L(w)))} ${added.length > 1 ? 'join' : 'joins'} layer ${dist[u] + 1}. `
        : '';
      const skippedText = skipped.length
        ? `${skipped.map(([v, w]) => `${R(v)} leads to ${L(w)}`).join(', ')}, which ${skipped.length > 1 ? 'have' : 'has'} a layer already. `
        : '';
      r.clear();
      r.nodeRole.set(L(u), 'active');
      if (free !== -1) {
        last = dist[u];
        const cleared = dist.map((d, x) => (d > last ? L(x) : '')).filter(Boolean);
        for (let x = 0; x < nLeft; x++) if (dist[x] > last) dist[x] = -1;
        layerBadges();
        r.nodeRole.set(R(free), 'active');
        r.edge(u, free, 'active');
        r.snap(
          5,
          `Dequeue ${L(u)} (layer ${last}). ${addedText}${skippedText}${R(free)} is free: the shortest augmenting paths have ${last + 1} left vert${last === 0 ? 'ex' : 'ices'} and end in layer ${last}, so last = ${last} and the BFS stops.` +
            (cleared.length ? ` ${names(cleared)} ${cleared.length > 1 ? 'were' : 'was'} put in layer ${last + 1}, past the last one: cleared again, since no shortest path goes there.` : ''),
          vars(['u', L(u)]),
          [queueStrip([], 0), pathStrip([], [])],
        );
        break;
      }
      for (const x of queue.slice(head)) r.nodeRole.set(L(x), 'compare');
      for (const [v] of added) {
        r.edge(u, v, 'compare');
        r.nodeRole.set(R(v), 'compare');
      }
      r.snap(
        added.length ? 6 : 4,
        (`Dequeue ${L(u)} (layer ${dist[u]}). ${addedText}${skippedText}` + (adj[u].length ? '' : `${L(u)} has no edge. `) + (added.length ? '' : 'Nothing joins a new layer.')).trimEnd(),
        vars(['u', L(u)]),
        [queueStrip(queue, head), pathStrip([], [])],
      );
    }
    if (last === -1) {
      phases.push({ last: -1, dist: [...dist], augments: [] });
      r.clear();
      r.badges.clear();
      r.snap(
        7,
        queue.length
          ? 'The queue ran dry without meeting a free right vertex: no augmenting path is left, and by Berge\'s theorem the matching is maximum.'
          : 'No free left vertex, so no augmenting path: the matching is maximum.',
        vars(),
        [queueStrip([], 0), pathStrip([], [])],
      );
      break;
    }
    const record: HkPhase = { last, dist: [...dist], augments: [] };
    phases.push(record);

    // _hk_augment from each free left vertex, in order.
    let found = 0;
    for (let root = 0; root < nLeft; root++) {
      if (matchLeft[root] !== -1) continue;
      const stack = [root];
      const nextEdge = [0];
      const through: number[] = [];
      const dead = new Set<string>();
      let skipped: string[] = [];
      paintSearch(r, stack, through, dead);
      r.snap(
        8,
        `Search from ${L(root)}, free and in layer 0. From a vertex in layer d it only steps to a partner in layer d + 1, so any path it finds is a shortest one.`,
        vars(['root', L(root)]),
        [queueStrip([], 0), pathStrip(stack, through)],
      );
      let ok = false;
      while (stack.length) {
        const top = stack.length - 1;
        const u = stack[top];
        if (nextEdge[top] === adj[u].length) {
          dist[u] = -1;
          stack.pop();
          nextEdge.pop();
          const via = through.pop();
          dead.add(L(u));
          if (via !== undefined) dead.add(R(via));
          layerBadges();
          paintSearch(r, stack, through, dead);
          const note = skipped.length ? `${skipped.join('; ')}. ` : '';
          r.snap(
            12,
            `${note}${L(u)} has no neighbour left: dist[${L(u)}] = -1, so no later search of this phase enters it again. ` +
              (stack.length
                ? `Pop it, and ${R(via!)}, which led to it, now leads to a dead end. Back at ${L(stack[stack.length - 1])}.`
                : `The stack is empty: ${L(root)} stays free in this phase.`),
            vars(['root', L(root)], ['u', L(u)]),
            [queueStrip([], 0), pathStrip(stack, through)],
          );
          skipped = [];
          continue;
        }
        const v = adj[u][nextEdge[top]++];
        const w = matchRight[v];
        if (w === -1) {
          through.push(v);
          const note = skipped.length ? `${skipped.join('; ')}. ` : '';
          skipped = [];
          paintPath(r, stack, through);
          r.snap(
            10,
            augmentingCaption(stack, through, `${note}${L(u)} (layer ${dist[u]}) tries ${R(v)}. `) + ` It has ${2 * stack.length - 1} edge${stack.length > 1 ? 's' : ''}, the shortest length in this phase.`,
            vars(['root', L(root)], ['u', L(u)], ['v', R(v)]),
            [queueStrip([], 0), pathStrip(stack, through)],
          );
          const path = interleave(stack, through);
          flip(stack, through, matchLeft, matchRight);
          size++;
          found++;
          paintFlipped(r, stack, through);
          r.snap(10, flipCaption(stack, through, size), vars(['root', L(root)]), [queueStrip([], 0), pathStrip(stack, through)]);
          record.augments.push({ root, path, dist: [...dist] });
          ok = true;
          break;
        }
        if (dist[w] === dist[u] + 1) {
          through.push(v);
          stack.push(w);
          nextEdge.push(0);
          const note = skipped.length ? `${skipped.join('; ')}. ` : '';
          skipped = [];
          paintSearch(r, stack, through, dead);
          r.snap(
            11,
            `${note}${L(u)} (layer ${dist[u]}) tries ${R(v)}, matched to ${L(w)} in layer ${dist[w]}, the next layer: push ${L(w)}.`,
            vars(['root', L(root)], ['u', L(u)], ['v', R(v)]),
            [queueStrip([], 0), pathStrip(stack, through)],
          );
          continue;
        }
        skipped.push(
          dist[w] === -1
            ? `${R(v)} leads to ${L(w)}, which is outside the layers or a dead end`
            : `${R(v)} leads to ${L(w)} in layer ${dist[w]}, not ${dist[u] + 1}`,
        );
      }
      if (!ok) record.augments.push({ root, path: null, dist: [...dist] });
    }
    r.clear();
    r.snap(
      2,
      `Phase ${phase} is over: it flipped ${found} vertex-disjoint augmenting path${found === 1 ? '' : 's'} of ${2 * last + 1} edge${last === 0 ? '' : 's'}. ` +
        'Any augmenting path left is longer, and the next BFS measures it from the free left vertices again.',
      vars(),
      [queueStrip([], 0), pathStrip([], [])],
    );
  }

  r.badges.clear();
  r.clear();
  const free = matchLeft.map((v, u) => (v === -1 ? L(u) : '')).filter(Boolean);
  r.snap(
    13,
    `hopcroft_karp returns size ${size} after ${phase - 1} phase${phase === 2 ? '' : 's'} that found paths, ` +
      `match_left = [${matchLeft.join(', ')}]` +
      (free.length ? `; ${names(free)} ${free.length > 1 ? 'stay' : 'stays'} free.` : '; every left vertex is matched.'),
    vars(),
    [queueStrip([], 0), pathStrip([], [])],
  );

  // min_vertex_cover: Konig's construction from this matching.
  const leftInZ = matchLeft.map((v) => v === -1);
  const rightInZ = Array<boolean>(nRight).fill(false);
  const stack = matchLeft.map((v, u) => (v === -1 ? u : -1)).filter((u) => u >= 0);
  while (stack.length) {
    const u = stack.pop()!;
    for (const v of adj[u]) {
      if (rightInZ[v]) continue;
      rightInZ[v] = true;
      const w = matchRight[v];
      if (!leftInZ[w]) {
        leftInZ[w] = true;
        stack.push(w);
      }
    }
  }
  const coverLeft = leftInZ.map((z, u) => (z ? -1 : u)).filter((u) => u >= 0);
  const coverRight = rightInZ.map((z, v) => (z ? v : -1)).filter((v) => v >= 0);
  const zNames = [...leftInZ.map((z, u) => (z ? L(u) : '')), ...rightInZ.map((z, v) => (z ? R(v) : ''))].filter(Boolean);
  r.clear();
  for (const id of zNames) r.nodeRole.set(id, 'compare');
  r.snap(
    14,
    free.length
      ? `Konig's theorem gives a vertex cover of the same size. Walk from the free left vert${free.length > 1 ? 'ices' : 'ex'} ${names(free)}: to any neighbour, and from a right vertex along its matching edge. ` +
          `Z = {${zNames.join(', ')}} is what these alternating paths reach. Each right vertex in Z is matched, or there would be an augmenting path.`
      : 'Konig\'s theorem gives a vertex cover of the same size. Every left vertex is matched, so no alternating path starts anywhere: Z is empty.',
    vars(),
    [queueStrip([], 0), pathStrip([], [])],
  );
  r.clear();
  for (const u of coverLeft) r.nodeRole.set(L(u), 'good');
  for (const v of coverRight) r.nodeRole.set(R(v), 'good');
  const coverNames = [...coverLeft.map(L), ...coverRight.map(R)];
  r.snap(
    14,
    `The cover is the left vertices outside Z and the right vertices inside it: ${coverNames.length ? `{${coverNames.join(', ')}}` : 'no vertex at all'}, ` +
      (size === 0
        ? 'since there is no edge to cover. '
        : size === 1
          ? '1 vertex, one end of the matching edge. '
          : `${coverNames.length} vertices, one end of each of the ${size} matching edges. `) +
      'Every edge has an end in it, and no cover can be smaller than a matching, so both are optimal.',
    vars(['cover', coverNames.length]),
    [queueStrip([], 0), pathStrip([], [])],
  );
  return { frames: r.frames, size, matchLeft, phases, cover: [coverLeft, coverRight] };
}
