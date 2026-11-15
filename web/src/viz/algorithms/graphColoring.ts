/**
 * Graph coloring tracer, drawn with GraphView: vertices labelled by index, the color of each
 * vertex as a text badge ("c2"), the open calls and the color array as strips.
 *
 * Mirrors Algorithms/Advanced_Algorithms/Backtracking/Graph_Coloring/Python/graph_coloring.py:
 * graph_coloring(graph, m) -> graph_coloring_util(graph, m, color, v) and is_safe(graph, v, color, c),
 * plus chromatic_number(graph).
 * - Vertices get colors in index order 0, 1, ..., n-1; colors are tried as 1..m in order.
 * - is_safe scans i = 0..n-1 and returns False at the first neighbor i with color[i] == c.
 * - A safe color is written into color[v] and the next vertex is tried; when that call fails,
 *   color[v] goes back to 0 and the next color is tried. v == n means every vertex is colored.
 * - chromatic_number calls graph_coloring for m = 1, 2, ..., n and returns the first m that works.
 * Golden fixtures (__fixtures__/backtracking.json) pin every is_safe call, its answer and the color
 * array it saw, the colorings and the chromatic numbers.
 *
 * Input: "0-1, 0-2, 1-2, 2-3; m 3" (or "; chromatic"); "n 6" adds isolated vertices up to 5.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GraphState } from '../renderers/GraphView';
import type { StripItem } from '../ui/molecules/Strip';
import { MAX_FRAMES, countSteps, tooLong, type StepCounter } from './backtracking';
import { circleLayout } from './graph';

export interface ColoringInput {
  n: number;
  /** Undirected edges a-b with a < b, each once, in input order. */
  edges: Array<[number, number]>;
  /** The number of colors, or 'chromatic' for chromatic_number. */
  m: number | 'chromatic';
}

/** ['check', v, c, is_safe's answer, the color array it saw], ['m', m] when chromatic_number tries m. */
export type ColoringEvent = ['check', number, number, boolean, number[]] | ['m', number];

export interface ColoringRun {
  frames: Array<Frame<GraphState>>;
  events: ColoringEvent[];
  /** graph_coloring's answer (the color list or null for None), or chromatic_number's answer. */
  result: number[] | null | number;
}

export const COLORING_LIMITS = { maxN: 8, maxM: 6, maxEdges: 20 };

export const COLORING_CODE = [
  'graph_coloring(graph, m):',
  '  color = [0] * n',
  '  return color if graph_coloring_util(graph, m, color, 0) else None',
  'graph_coloring_util(graph, m, color, v):',
  '  if v == n: return True                # every vertex has a color',
  '  for c in range(1, m + 1):',
  '    if is_safe(graph, v, color, c):',
  '      color[v] = c',
  '      if graph_coloring_util(graph, m, color, v + 1): return True',
  '      color[v] = 0                      # backtrack',
  '  return False',
  'is_safe(graph, v, color, c):',
  '  for i in range(len(graph)):',
  '    if graph[v][i] == 1 and color[i] == c: return False',
  '  return True',
  'chromatic_number(graph):',
  '  for m in range(1, n + 1):',
  '    if graph_coloring(graph, m) is not None: return m',
  '  return n',
];

const L = { init: 1, result: 2, base: 4, place: 7, backtrack: 9, fail: 10, clash: 13, tryM: 16, found: 17, notFound: 18 };

/** "0-1, 0-2, 1-2; m 3", "0-1, 1-2; chromatic", "n 5; 0-1; m 2". */
export function parseColoring(text: string): ColoringInput {
  const parts = text
    .split(/[;,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
  const edges: Array<[number, number]> = [];
  const seen = new Set<string>();
  let n: number | undefined;
  let m: number | 'chromatic' | undefined;
  let top = -1;
  for (const part of parts) {
    const edge = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (edge) {
      const a = Number(edge[1]);
      const b = Number(edge[2]);
      if (a === b) throw new InputError(`"${part}" is a self-loop. is_safe checks color[v] while color[v] is still 0, so the code never notices one; this view does not accept them.`);
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      top = Math.max(top, a, b);
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([Math.min(a, b), Math.max(a, b)]);
      }
      continue;
    }
    const opt = part.match(/^(n|m|k|colors?)\s*[:= ]?\s*(\d+)$/i);
    if (opt) {
      const v = Number(opt[2]);
      if (opt[1].toLowerCase() === 'n') {
        if (n !== undefined) throw new InputError('Give the number of vertices ("n 6") only once.');
        n = v;
      } else {
        if (m !== undefined) throw new InputError('Give the number of colors ("m 3") or "chromatic" only once.');
        m = v;
      }
      continue;
    }
    if (/^(chromatic(_number)?|chi)$/i.test(part)) {
      if (m !== undefined) throw new InputError('Give the number of colors ("m 3") or "chromatic" only once.');
      m = 'chromatic';
      continue;
    }
    throw new InputError(`Cannot read "${part}". Write edges between vertex numbers, like "0-1, 1-2", then "; m 3" or "; chromatic".`);
  }
  const count = n ?? top + 1;
  if (count < 1) throw new InputError('Add at least one edge, like "0-1, 1-2; m 2", or give the number of vertices, like "n 3; m 1".');
  if (top >= count) throw new InputError(`Vertex ${top} is not below n = ${count}: vertices are numbered 0 to n-1.`);
  if (count > COLORING_LIMITS.maxN) throw new InputError(`At most ${COLORING_LIMITS.maxN} vertices here, so the search stays short enough to watch (got ${count}).`);
  if (edges.length > COLORING_LIMITS.maxEdges) throw new InputError(`At most ${COLORING_LIMITS.maxEdges} edges, please (got ${edges.length}).`);
  if (m === undefined) throw new InputError('Say how many colors to use, like "; m 3", or ask for the chromatic number with "; chromatic".');
  if (m !== 'chromatic' && (m < 1 || m > COLORING_LIMITS.maxM)) throw new InputError(`m goes from 1 to ${COLORING_LIMITS.maxM} here (got ${m}).`);
  const input: ColoringInput = { n: count, edges, m };
  const steps = countSteps((counter) => coloringTrace(input, counter));
  if (steps > MAX_FRAMES) throw tooLong(steps, m === 'chromatic' ? 'chromatic_number on this graph' : `Coloring this graph with m = ${m}`, 'Use fewer vertices, or a graph whose conflicts show up early.');
  return input;
}

export function formatColoring(input: ColoringInput): string {
  const edges = input.edges.map(([a, b]) => `${a}-${b}`);
  const top = Math.max(-1, ...input.edges.flat());
  return [...(top + 1 < input.n ? [`n ${input.n}`] : []), edges.join(', '), input.m === 'chromatic' ? 'chromatic' : `m ${input.m}`].filter(Boolean).join('; ');
}

/** The adjacency matrix the Python code takes. */
export function adjacencyMatrix(input: Pick<ColoringInput, 'n' | 'edges'>): number[][] {
  const g = Array.from({ length: input.n }, () => Array<number>(input.n).fill(0));
  for (const [a, b] of input.edges) {
    g[a][b] = 1;
    g[b][a] = 1;
  }
  return g;
}

interface Call {
  v: number;
  /** The color the loop is on, or null before the loop starts. */
  c: number | null;
  /** The color being taken back, for the one step that shows it. */
  undoing?: boolean;
}

interface SnapOpts {
  nodes?: Record<number, Role>;
  edges?: Record<number, Role>;
  /** A color shown on a vertex while it is tested, before it is written. */
  trying?: { v: number; c: number };
  top?: Role;
  vars?: Array<[string, string | number]>;
}

const list = (xs: number[]) => `[${xs.join(', ')}]`;
const and = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** graph_coloring or chromatic_number as the Python code runs them. With a counter, only the steps are counted. */
export function coloringTrace(input: ColoringInput, counter?: StepCounter): ColoringRun {
  const { n, edges } = input;
  const graph = adjacencyMatrix(input);
  const ids = Array.from({ length: n }, (_, v) => String(v));
  const pos = circleLayout(ids);
  const events: ColoringEvent[] = [];
  const frames: Array<Frame<GraphState>> = [];
  let color: number[] = Array<number>(n).fill(0);
  let calls: Call[] = [];
  let m = 0;
  let checks = 0;
  let finished = false;
  const edgeIndex = (a: number, b: number) => edges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const neighbors = (v: number) => graph[v].flatMap((x, i) => (x === 1 ? [i] : []));

  const snap = (line: number, caption: string, o: SnapOpts = {}) => {
    if (counter) {
      counter.tick();
      return;
    }
    const stack: StripItem[] = calls.map((k, i) => ({
      text: k.v === n ? `v = ${n}: all colored` : color[k.v] ? `v${k.v} = c${color[k.v]}` : k.c === null ? `v${k.v}` : k.undoing ? `v${k.v}: undo c${k.c}` : `v${k.v}: c${k.c}?`,
      role: i === calls.length - 1 ? (o.top ?? 'active') : undefined,
    }));
    const current = calls.length ? calls[calls.length - 1].v : -1;
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ...(m ? [['m', m] as [string, number]] : []), ['is_safe calls', checks]],
      state: {
        nodes: ids.map((id, v) => ({
          id,
          ...pos.get(id)!,
          role: o.nodes?.[v] ?? (color[v] ? 'done' : 'idle'),
          badge: o.trying && o.trying.v === v && !color[v] ? `c${o.trying.c}?` : color[v] ? `c${color[v]}` : undefined,
        })),
        edges: edges.map(([a, b], i) => ({ id: i, from: String(a), to: String(b), directed: false, weight: 1, role: o.edges?.[i] ?? 'idle' })),
        showWeights: false,
        strips: [
          { label: 'Call stack', items: stack.length ? stack : [{ text: finished ? '(returned)' : '(empty)' }] },
          { label: 'color', items: color.map((c, v) => ({ text: `${v}:${c}`, role: v === current ? 'active' : c ? 'done' : undefined })) },
        ],
      },
    });
  };

  /** is_safe as the Python code runs it: the first neighbor, by index, that already has color c. */
  const isSafe = (v: number, c: number) => {
    checks += 1;
    let clash = -1;
    for (let i = 0; i < n; i++) {
      if (graph[v][i] === 1 && color[i] === c) {
        clash = i;
        break;
      }
    }
    events.push(['check', v, c, clash < 0, [...color]]);
    return clash;
  };

  const util = (v: number): boolean => {
    calls.push({ v, c: null });
    if (v === n) {
      snap(L.base, `v == ${n}: every vertex has a color, and each color was checked against the neighbors when it was written. Return True all the way up.`, {
        top: 'good',
        nodes: Object.fromEntries(ids.map((_, i) => [i, 'good' as Role])),
      });
      calls.pop();
      return true;
    }
    const call = calls[calls.length - 1];
    const nbrs = neighbors(v);
    for (let c = 1; c <= m; c++) {
      call.c = c;
      const clash = isSafe(v, c);
      const scanned: Record<number, Role> = {};
      const lit: Record<number, Role> = {};
      for (const i of nbrs) {
        scanned[i] = 'compare';
        lit[edgeIndex(v, i)] = 'compare';
      }
      const vars: Array<[string, string | number]> = [
        ['v', v],
        ['c', c],
      ];
      if (clash >= 0) {
        // The scan stops at the clash: neighbors after it were not looked at.
        for (const i of nbrs) {
          if (i > clash) {
            delete scanned[i];
            delete lit[edgeIndex(v, i)];
          }
        }
        snap(L.clash, `Try color ${c} for vertex ${v}: its neighbor ${clash} already has color ${c}, so is_safe returns False.`, {
          trying: { v, c },
          nodes: { ...scanned, [v]: 'active', [clash]: 'bad' },
          edges: { ...lit, [edgeIndex(v, clash)]: 'active' },
          vars,
        });
        continue;
      }
      const colored = nbrs.filter((i) => color[i]);
      color[v] = c;
      snap(
        L.place,
        `Try color ${c} for vertex ${v}: ` +
          (nbrs.length === 0
            ? 'it has no neighbors, so any color is safe.'
            : colored.length === 0
              ? `none of its neighbors (${and(nbrs.map(String))}) has a color yet, so ${c} is safe.`
              : `its colored neighbor${colored.length === 1 ? '' : 's'} ${and(colored.map((i) => `${i} (c${color[i]})`))} ${colored.length === 1 ? 'has' : 'have'} other colors, so ${c} is safe.`) +
          ` color[${v}] = ${c}; move on to vertex ${v + 1}.`,
        { nodes: { ...scanned, [v]: 'active' }, edges: lit, vars },
      );
      if (util(v + 1)) {
        calls.pop();
        return true;
      }
      color[v] = 0;
      call.undoing = true;
      snap(
        L.backtrack,
        `Back at vertex ${v}: with color ${c} here, the vertices after it cannot all be colored. color[${v}] = 0, then ${c < m ? `try color ${c + 1}.` : `no color is left (m = ${m}).`}`,
        { nodes: { [v]: 'active' }, vars },
      );
      call.undoing = false;
    }
    call.c = null;
    snap(
      L.fail,
      v === 0
        ? `Vertex 0 has run out of colors: every choice for it failed further on, so no coloring with ${m} color${m === 1 ? '' : 's'} exists and the first call returns False.`
        : `No color from 1 to ${m} is safe for vertex ${v} (or every safe one failed later): return False, so vertex ${v - 1} must change its color.`,
      { nodes: { [v]: 'bad' }, top: 'bad', vars: [['v', v]] },
    );
    calls.pop();
    return false;
  };

  /** graph_coloring(graph, m): the color list, or null for None. */
  const coloring = (tries: number, line: number, intro: string, chromatic: boolean): number[] | null => {
    m = tries;
    color = Array<number>(n).fill(0);
    calls = [];
    finished = false;
    snap(line, `${intro}graph_coloring(graph, ${m}): color = ${list(color)}, 0 meaning "no color yet". Vertices get colors in index order, each the smallest safe color from 1 to ${m}.`);
    const ok = util(0);
    calls = [];
    finished = true;
    const enough = `${m} color${m === 1 ? ' is' : 's are'}`;
    snap(
      ok && chromatic ? L.found : L.result,
      ok
        ? `graph_coloring returns ${list(color)}: no edge joins two vertices of the same color, so ${enough} enough.` +
            (chromatic ? ` chromatic_number returns ${m}${m > 1 ? `, because m = ${m - 1} failed` : ''}.` : '')
        : `graph_coloring returns None: every assignment ran into a clash, so ${enough} not enough for this graph.` + (chromatic ? ` chromatic_number goes on with m = ${m + 1}.` : ''),
      ok ? { vars: [['result', list(color)]] } : { nodes: Object.fromEntries(ids.map((_, i) => [i, 'muted' as Role])), vars: [['result', 'None']] },
    );
    return ok ? [...color] : null;
  };

  if (input.m !== 'chromatic') {
    const intro = `${n} vertices and ${edges.length} edge${edges.length === 1 ? '' : 's'}; a proper coloring gives the two ends of every edge different colors. `;
    return { frames, events, result: coloring(input.m, L.init, intro, false) };
  }
  for (let tries = 1; tries <= n; tries++) {
    events.push(['m', tries]);
    const intro = tries === 1 ? 'chromatic_number asks graph_coloring for m = 1, 2, ... and returns the first m that works. ' : `m = ${tries - 1} failed, so try m = ${tries}. `;
    if (coloring(tries, L.tryM, intro, true) !== null) return { frames, events, result: tries };
  }
  snap(L.notFound, `chromatic_number returns n = ${n}.`);
  return { frames, events, result: n };
}
