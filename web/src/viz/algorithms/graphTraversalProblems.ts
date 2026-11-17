/**
 * Graph traversal problem tracers.
 *
 * Mirrors Problem_Patterns/Graph_Traversal_Problems/Python/graph_traversal.py:
 *   num_islands: scan row by row; every '1' starts an island and sink() floods it with an
 *     explicit stack, marking a cell '0' when it is PUSHED and trying down, up, right, left
 *     (drawn with BoardView, the stack beside the grid);
 *   bfs_shortest_path: a deque of (node, dist), visited marked on push, neighbours in list
 *     order, and the target recognised when it is dequeued (a target that is not a key is fine);
 *   get_dfs_traversal: an explicit stack, neighbours pushed in reverse so the first one is popped
 *     first, an already visited node skipped when popped (the same order as dfs_recursive);
 *   topological_sort: Kahn's algorithm on nodes 0..n-1 with the edges in input order; [] on a
 *     cycle, KeyError for an endpoint that is not a node.
 * The graph tabs use GraphView. Golden fixtures (__fixtures__/patternsMore.json, sections
 * "islands", "bfs", "dfs", "topo") pin every stack and queue the code pops and every result.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { BoardCell, BoardLine, BoardStackItem, BoardState } from '../renderers/BoardView';
import type { GraphEdgeView, GraphNodeView, GraphState } from '../renderers/GraphView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { circleLayout } from './graph';

/* ---------- number of islands ---------- */

export const ISLAND_LIMITS = { maxRows: 8, maxCols: 10 };

export function parseGrid(text: string): string[] {
  const rows = text
    .split(/[\s,;]+/)
    .map((r) => r.trim())
    .filter(Boolean);
  for (const r of rows) {
    if (!/^[01]+$/.test(r)) throw new InputError(`Row "${r}": use 1 for land and 0 for water, one row per word, as in "11000, 11000, 00100".`);
  }
  if (rows.length > ISLAND_LIMITS.maxRows) throw new InputError(`At most ${ISLAND_LIMITS.maxRows} rows, please (got ${rows.length}).`);
  if (rows.some((r) => r.length > ISLAND_LIMITS.maxCols)) throw new InputError(`At most ${ISLAND_LIMITS.maxCols} columns, please.`);
  if (rows.some((r) => r.length !== rows[0].length)) {
    throw new InputError('Every row needs the same length: the code reads cols = len(grid[0]) and would index past a shorter row (IndexError).');
  }
  return rows;
}

export const ISLANDS_CODE = [
  'num_islands(grid):',
  '  if not grid or not grid[0]: return 0',
  '  rows, cols = len(grid), len(grid[0]); count = 0',
  '  for r in range(rows): for c in range(cols):   # row by row',
  "    if grid[r][c] == '1': count += 1; sink(r, c)",
  '  return count',
  "sink(r, c): stack = [(r, c)]; grid[r][c] = '0'   # sink a cell when it is pushed",
  '  while stack:',
  '    cr, cc = stack.pop()',
  '    for nr, nc in ((cr+1, cc), (cr-1, cc), (cr, cc+1), (cr, cc-1)):   # down, up, right, left',
  "      if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':",
  "        grid[nr][nc] = '0'; stack.append((nr, nc))",
];

export interface IslandsRun {
  frames: Array<Frame<BoardState>>;
  /** Where each island's sink() started. */
  starts: Array<[number, number]>;
  /** The stack just before every pop. */
  stacks: Array<Array<[number, number]>>;
  result: number;
  after: string[];
}

/** The stack panel lists at most 11 entries: the top 10, under one token for the rest. */
const STACK_SHOWN = 11;
const DIRS: Array<[number, number, string]> = [
  [1, 0, 'down'],
  [-1, 0, 'up'],
  [0, 1, 'right'],
  [0, -1, 'left'],
];

export function islandsTrace(rows: string[]): IslandsRun {
  const frames: Array<Frame<BoardState>> = [];
  const grid = rows.map((r) => r.split(''));
  const R = grid.length;
  const C = R ? grid[0].length : 0;
  const islandOf: number[][] = grid.map((row) => row.map(() => -1));
  const land = rows.map((r) => r.split('').map((ch) => ch === '1'));
  const starts: Array<[number, number]> = [];
  const stacks: Array<Array<[number, number]>> = [];
  const sizes: number[] = [];
  let stack: Array<[number, number]> = [];
  let count = 0;
  const cell = (r: number, c: number) => `(${r}, ${c})`;

  const snap = (
    line: number | undefined,
    caption: string,
    o: { cursor?: { r: number; c: number; role: Role }; lines?: BoardLine[]; fresh?: Set<string>; pushed?: Set<string>; vars?: Array<[string, string | number]>; final?: boolean } = {},
  ) => {
    const cells: BoardCell[][] = grid.map((row, r) =>
      row.map((ch, c): BoardCell => {
        const k = islandOf[r][c];
        if (k < 0) return land[r][c] ? { text: '1', given: true } : { text: '0' };
        const key = `${r},${c}`;
        if (o.pushed?.has(key)) return { text: ch, role: 'active' };
        return { text: ch, role: k === count - 1 && !o.final ? 'active' : 'done', soft: true };
      }),
    );
    const shown: BoardStackItem[] = stack.map(([r, c], i) => ({ text: cell(r, c), role: o.fresh?.has(`${r},${c}`) && i >= stack.length - 4 ? 'active' : undefined }));
    const items = shown.length > STACK_SHOWN ? [{ text: `${SYM.ellipsis} ${shown.length - (STACK_SHOWN - 1)} more below`, role: 'muted' as Role }, ...shown.slice(shown.length - (STACK_SHOWN - 1))] : shown;
    // One short token, so the strip never wraps onto a new line on a phone; island sizes go in the state panel.
    const strips: StripData[] = [{ label: 'Islands', items: [{ text: `count = ${count}`, role: o.final ? 'done' : count ? 'active' : undefined }] }];
    const sizeVars: Array<[string, string | number]> = sizes.length ? [[`island ${sizes.length} size`, sizes[sizes.length - 1]]] : [];
    frames.push({
      line,
      caption,
      vars: [['count', count], ...sizeVars, ...(o.vars ?? [])],
      state: {
        label: `Grid ${rows.join(' / ') || '(empty)'}`,
        rows: R,
        cols: C,
        cells,
        lines: o.lines,
        cursor: o.cursor,
        stack: items,
        stackTitle: 'stack (top at the bottom)',
        strips,
      },
    });
  };

  if (R === 0) {
    snap(1, 'The grid is empty: not grid is True, so num_islands returns 0 before scanning anything.', { vars: [['result', 0]] });
    return { frames, starts, stacks, result: 0, after: [] };
  }
  snap(2, `${R} x ${C} grid: '1' is land, '0' water. Scan it row by row; every '1' the scan meets starts a new island, and sink() turns that whole island into '0' so the scan never counts it again.`, {
    vars: [['rows', R], ['cols', C]],
  });

  let skipped = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] !== '1') {
        skipped += 1;
        continue;
      }
      count += 1;
      sizes.push(0);
      starts.push([r, c]);
      const k = count - 1;
      snap(
        4,
        `The scan reaches ${cell(r, c)}: it is '1'${skipped ? ` (the ${skipped} cell${skipped === 1 ? '' : 's'} before it ${skipped === 1 ? 'was' : 'were'} water or already sunk)` : ''}, so this is island ${count}. count = ${count}; sink(${r}, ${c}).`,
        { cursor: { r, c, role: 'compare' }, vars: [['r', r], ['c', c]] },
      );
      skipped = 0;
      grid[r][c] = '0';
      islandOf[r][c] = k;
      sizes[k] = 1;
      stack = [[r, c]];
      snap(6, `stack = [${cell(r, c)}] and grid[${r}][${c}] = '0' right away: a cell is sunk when it is pushed, so no cell can enter the stack twice.`, {
        cursor: { r, c, role: 'active' },
        fresh: new Set([`${r},${c}`]),
        vars: [['r', r], ['c', c]],
      });
      while (stack.length) {
        stacks.push(stack.map(([a, b]) => [a, b]));
        const [cr, cc] = stack.pop()!;
        snap(8, `stack.pop() takes the newest cell, ${cell(cr, cc)}, so the flood goes deep before it goes wide. ${stack.length} cell${stack.length === 1 ? '' : 's'} still wait${stack.length === 1 ? 's' : ''}.`, {
          cursor: { r: cr, c: cc, role: 'compare' },
          vars: [['cr', cr], ['cc', cc]],
        });
        const lines: BoardLine[] = [];
        const pushedNow: string[] = [];
        const notes: string[] = [];
        for (const [dr, dc, name] of DIRS) {
          const nr = cr + dr;
          const nc = cc + dc;
          const inside = nr >= 0 && nr < R && nc >= 0 && nc < C;
          if (inside && grid[nr][nc] === '1') {
            grid[nr][nc] = '0';
            islandOf[nr][nc] = k;
            sizes[k] += 1;
            stack.push([nr, nc]);
            pushedNow.push(`${nr},${nc}`);
            lines.push({ from: [cr, cc], to: [nr, nc], role: 'active', arrow: true });
            notes.push(`${name} ${cell(nr, nc)} is land: sink and push it`);
          } else {
            lines.push({ from: [cr, cc], to: [nr, nc], role: 'muted', arrow: true });
            notes.push(`${name} ${inside ? (land[nr][nc] ? 'is already sunk' : 'is water') : 'is off the grid'}`);
          }
        }
        snap(
          11,
          `Neighbours of ${cell(cr, cc)} in the order down, up, right, left: ${notes.join('; ')}.` + (pushedNow.length ? ` The last one pushed is popped next.` : ' Nothing new to push.'),
          { cursor: { r: cr, c: cc, role: 'compare' }, lines, fresh: new Set(pushedNow), pushed: new Set(pushedNow), vars: [['cr', cr], ['cc', cc], ['pushed', pushedNow.length]] },
        );
      }
      snap(7, `The stack is empty: island ${count} is fully sunk (${sizes[k]} cell${sizes[k] === 1 ? '' : 's'}). Back to the scan, which continues after ${cell(r, c)}.`, { cursor: { r, c, role: 'done' } });
    }
  }
  snap(5, `The scan is done: return ${count}. Every cell was sunk at most once and looked at its 4 neighbours once, O(R * C). The grid now holds only '0': num_islands modifies its argument.`, {
    final: true,
    vars: [['result', count]],
  });
  return { frames, starts, stacks, result: count, after: grid.map((row) => row.join('')) };
}

/* ---------- adjacency dict input (BFS, DFS) ---------- */

export interface AdjGraph {
  /** Keys in insertion order with their neighbour lists, like the Python dict. */
  adj: Array<[number, number[]]>;
  start: number;
  target?: number;
}

export const GRAPH_LIMITS = { maxNodes: 10, maxEdges: 20, maxId: 99 };

function nodeId(t: string): number {
  if (!/^\d+$/.test(t)) throw new InputError(`"${t}" is not a node: nodes are whole numbers from 0 to ${GRAPH_LIMITS.maxId}.`);
  const v = Number(t);
  if (v > GRAPH_LIMITS.maxId) throw new InputError(`Nodes go from 0 to ${GRAPH_LIMITS.maxId} here (got ${t}).`);
  return v;
}

/** "0: 1 2; 1: 0 3; start 0; target 3": one dict entry per segment, then the options. */
export function parseAdjGraph(text: string, needTarget: boolean): AdjGraph {
  const adj: Array<[number, number[]]> = [];
  let start: number | undefined;
  let target: number | undefined;
  for (const seg of text.split(/[;\n]/).map((s) => s.trim()).filter(Boolean)) {
    const opt = seg.match(/^(start|target)\s*[:=]?\s*(\S+)$/i);
    if (opt) {
      const v = nodeId(opt[2]);
      if (opt[1].toLowerCase() === 'start') start = v;
      else target = v;
      continue;
    }
    const m = seg.match(/^(\d+)\s*:\s*\[?([^\]]*)\]?$/);
    if (!m) throw new InputError(`Cannot read "${seg}". Write one node and its neighbours per segment, as in "0: 1 2; 1: 0 3; start 0".`);
    const u = nodeId(m[1]);
    if (adj.some(([k]) => k === u)) throw new InputError(`Node ${u} is listed twice: a Python dict keeps one list per key, so give all of its neighbours in one entry.`);
    const vs = m[2].split(/[\s,]+/).filter(Boolean).map(nodeId);
    if (vs.includes(u)) throw new InputError(`"${seg}": a self-loop is not drawn here; ${u} would only find itself already visited.`);
    adj.push([u, vs]);
  }
  if (adj.length === 0) throw new InputError('Give at least one node and its neighbours, as in "0: 1 2".');
  const nodes = new Set<number>(adj.flatMap(([u, vs]) => [u, ...vs]));
  if (nodes.size > GRAPH_LIMITS.maxNodes) throw new InputError(`At most ${GRAPH_LIMITS.maxNodes} nodes, please (got ${nodes.size}).`);
  const edges = adj.reduce((s, [, vs]) => s + vs.length, 0);
  if (edges > GRAPH_LIMITS.maxEdges) throw new InputError(`At most ${GRAPH_LIMITS.maxEdges} neighbour entries, please (got ${edges}).`);
  if (start === undefined) throw new InputError('Add the start node: "; start 0".');
  if (needTarget && target === undefined) throw new InputError('Add the target node: "; target 4".');
  return { adj, start, target };
}

/** Nodes in order of first appearance (keys first), plus start / target when they are not in the graph. */
function graphNodes(g: AdjGraph): number[] {
  const out: number[] = [];
  const add = (v: number) => {
    if (!out.includes(v)) out.push(v);
  };
  for (const [u, vs] of g.adj) {
    add(u);
    vs.forEach(add);
  }
  return out;
}

interface DrawnEdge {
  id: number;
  from: number;
  to: number;
  directed: boolean;
}

/** One drawn edge per pair: u -> v listed both ways (or twice) is one undirected line. */
function drawnEdges(g: AdjGraph): { edges: DrawnEdge[]; edgeOf: (u: number, v: number) => number } {
  const listed = new Set(g.adj.flatMap(([u, vs]) => vs.map((v) => `${u}>${v}`)));
  const edges: DrawnEdge[] = [];
  const index = new Map<string, number>();
  for (const [u, vs] of g.adj) {
    for (const v of vs) {
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (index.has(key)) continue;
      const both = listed.has(`${u}>${v}`) && listed.has(`${v}>${u}`);
      index.set(key, edges.length);
      edges.push({ id: edges.length, from: u, to: v, directed: !both });
    }
  }
  return { edges, edgeOf: (u, v) => index.get(u < v ? `${u}-${v}` : `${v}-${u}`) ?? -1 };
}

class GraphFrames {
  frames: Array<Frame<GraphState>> = [];
  nodeRole = new Map<number, Role>();
  edgeRole = new Map<number, Role>();
  badges = new Map<number, string>();
  readonly pos: Map<string, { x: number; y: number }>;

  constructor(
    readonly nodes: number[],
    readonly edges: DrawnEdge[],
    layout?: Map<string, { x: number; y: number }>,
  ) {
    this.pos = layout ?? circleLayout(nodes.map(String));
  }

  snap(line: number | undefined, caption: string, strips: StripData[], vars: Array<[string, string | number]>, extra: { nodes?: Record<number, Role>; edges?: Record<number, Role> } = {}) {
    const nodes: GraphNodeView[] = this.nodes.map((v) => ({ id: String(v), ...this.pos.get(String(v))!, role: extra.nodes?.[v] ?? this.nodeRole.get(v) ?? 'idle', badge: this.badges.get(v) }));
    const edges: GraphEdgeView[] = this.edges.map((e) => ({ id: e.id, from: String(e.from), to: String(e.to), directed: e.directed, weight: 1, role: extra.edges?.[e.id] ?? this.edgeRole.get(e.id) ?? 'idle' }));
    this.frames.push({ line, caption, vars, state: { nodes, edges, showWeights: false, strips } });
  }
}

const strip = (label: string, items: Array<string | StripItem>, empty = '(empty)'): StripData => ({
  label,
  items: items.length ? items.map((it) => (typeof it === 'string' ? { text: it } : it)) : [{ text: empty }],
});

const dictText = (g: AdjGraph) => `{${g.adj.map(([u, vs]) => `${u}: [${vs.join(', ')}]`).join(', ')}}`;

/* ---------- BFS shortest path ---------- */

export const BFS_CODE = [
  'bfs_shortest_path(graph, start, target):',
  '  if start not in graph: return -1',
  '  if start == target: return 0',
  '  queue = deque([(start, 0)]); visited = {start}',
  '  while queue:',
  '    node, dist = queue.popleft()',
  '    if node == target: return dist      # found when it leaves the queue',
  '    for neighbor in graph.get(node, []):',
  '      if neighbor not in visited:',
  '        visited.add(neighbor); queue.append((neighbor, dist + 1))',
  '  return -1',
];

export interface BfsRun {
  frames: Array<Frame<GraphState>>;
  pops: Array<[number, number]>;
  result: number;
}

export function bfsShortestTrace(g: AdjGraph): BfsRun {
  const { start } = g;
  const target = g.target!;
  const nodes = graphNodes(g);
  const { edges, edgeOf } = drawnEdges(g);
  const r = new GraphFrames(nodes, edges);
  const keys = new Map(g.adj);
  const pops: Array<[number, number]> = [];
  const queue: Array<[number, number]> = [];
  const visited: number[] = [];
  const pair = ([n, d]: [number, number]) => `(${n}, ${d})`;
  const strips = () => [strip('queue', queue.map(pair)), strip('visited', visited.map(String))];
  const targetNote = nodes.includes(target) ? '' : ` (${target} is not in the graph at all)`;
  if (nodes.includes(target)) r.badges.set(target, 'target');
  const finish = (line: number, caption: string, result: number, extra: { nodes?: Record<number, Role> } = {}) => {
    r.snap(line, caption, strips(), [['result', result]], extra);
    return { frames: r.frames, pops, result };
  };

  r.snap(0, `bfs_shortest_path(${dictText(g)}, ${start}, ${target}): the fewest edges from ${start} to ${target}${targetNote}. Lines without arrows are listed in both directions.`, strips(), []);
  if (!keys.has(start)) return finish(1, `${start} is not a key of the graph, so it has no neighbour list to start from: return -1.`, -1, nodes.includes(start) ? { nodes: { [start]: 'bad' } } : {});
  if (start === target) return finish(2, `start == target: the distance is 0 edges, return 0 without searching.`, 0, { nodes: { [start]: 'good' } });

  queue.push([start, 0]);
  visited.push(start);
  r.nodeRole.set(start, 'compare');
  r.badges.set(start, 'd=0');
  r.snap(3, `queue = deque([(${start}, 0)]) and visited = {${start}}: a node is marked visited when it is queued, so it can never be queued twice.`, strips(), [['dist', 0]]);
  while (queue.length) {
    const [node, dist] = queue.shift()!;
    pops.push([node, dist]);
    r.nodeRole.set(node, 'active');
    if (node === target) {
      return finish(6, `popleft() gives (${node}, ${dist}). node == target, so return ${dist}. BFS dequeues nodes in order of distance, so the first time the target leaves the queue its distance is the shortest.`, dist, {
        nodes: { [node]: 'good' },
      });
    }
    r.snap(5, `popleft() gives (${node}, ${dist}), the oldest entry: every node at distance ${dist} leaves the queue before any at distance ${dist + 1}. ${node} != ${target}, so look at its neighbours.`, strips(), [['node', node], ['dist', dist]]);
    const nbrs = keys.get(node) ?? [];
    if (!keys.has(node)) r.snap(7, `${node} is not a key: graph.get(${node}, []) gives no neighbours (a sink of a directed graph).`, strips(), [['node', node], ['dist', dist]]);
    for (const v of nbrs) {
      const e = edgeOf(node, v);
      if (visited.includes(v)) {
        r.snap(8, `${v} is already in visited: skip it. Its distance was fixed when it was first queued.`, strips(), [['node', node], ['neighbor', v]], { edges: { [e]: 'muted' } });
        continue;
      }
      visited.push(v);
      queue.push([v, dist + 1]);
      r.nodeRole.set(v, 'compare');
      r.edgeRole.set(e, 'done');
      r.badges.set(v, v === target ? `target d=${dist + 1}` : `d=${dist + 1}`);
      r.snap(
        9,
        `${v} is new: visited.add(${v}) and queue.append((${v}, ${dist + 1})).` + (v === target ? ` That is the target, but BFS only returns when it is dequeued.` : ''),
        strips(),
        [['node', node], ['neighbor', v], ['dist + 1', dist + 1]],
        { edges: { [e]: 'active' }, nodes: { [v]: 'active' } },
      );
    }
    r.nodeRole.set(node, 'done');
  }
  return finish(10, `The queue is empty and ${target} never came out of it: it is not reachable from ${start}${targetNote}. Return -1.`, -1, nodes.includes(target) ? { nodes: { [target]: 'bad' } } : {});
}

/* ---------- DFS with an explicit stack ---------- */

export const DFS_CODE = [
  'get_dfs_traversal(graph, start):',
  '  visited = set(); result = []',
  '  if start not in graph: return result',
  '  stack = [start]',
  '  while stack:',
  '    node = stack.pop()',
  '    if node in visited: continue        # pushed twice, visited meanwhile',
  '    visited.add(node); result.append(node)',
  '    for neighbor in reversed(graph.get(node, [])):   # the first neighbour ends on top',
  '      if neighbor not in visited: stack.append(neighbor)',
  '  return result',
];

export interface DfsRun {
  frames: Array<Frame<GraphState>>;
  /** The stack just before every pop. */
  stacks: number[][];
  result: number[];
}

export function dfsStackTrace(g: AdjGraph): DfsRun {
  const { start } = g;
  const nodes = graphNodes(g);
  const { edges, edgeOf } = drawnEdges(g);
  const r = new GraphFrames(nodes, edges);
  const keys = new Map(g.adj);
  const stacks: number[][] = [];
  const stack: number[] = [];
  const visited = new Set<number>();
  const result: number[] = [];
  const parent = new Map<number, number>();
  const strips = () => [strip('stack (top on the right)', stack.map(String)), strip('result', result.map(String))];

  r.snap(1, `get_dfs_traversal(${dictText(g)}, ${start}): visit as deep as possible first. An explicit stack replaces recursion, so a long path cannot hit Python's recursion limit.`, strips(), []);
  if (!keys.has(start)) {
    r.snap(2, `${start} is not a key of the graph: return [] without visiting anything. (dfs_recursive would still list ${start}; the iterative version checks first.)`, strips(), [['result', '[]']]);
    return { frames: r.frames, stacks, result };
  }
  stack.push(start);
  r.nodeRole.set(start, 'compare');
  r.snap(3, `stack = [${start}].`, strips(), []);
  while (stack.length) {
    stacks.push([...stack]);
    const node = stack.pop()!;
    if (visited.has(node)) {
      r.snap(6, `pop() gives ${node}, but ${node} is already visited: it was pushed again before its first copy was popped. continue.`, strips(), [['node', node]], { nodes: { [node]: 'muted' } });
      continue;
    }
    visited.add(node);
    result.push(node);
    r.nodeRole.set(node, 'active');
    r.badges.set(node, `#${result.length}`);
    const via = parent.get(node);
    if (via !== undefined) r.edgeRole.set(edgeOf(via, node), 'done');
    r.snap(7, `pop() gives ${node}: not visited yet, so it is the ${result.length}${['st', 'nd', 'rd'][result.length - 1] ?? 'th'} node of the traversal.`, strips(), [['node', node]]);
    const nbrs = keys.get(node) ?? [];
    const pushed: number[] = [];
    for (const v of [...nbrs].reverse()) {
      if (visited.has(v)) continue;
      stack.push(v);
      pushed.push(v);
      // The copy of v that is popped first is the newest one, so its tree edge comes from the latest pusher.
      parent.set(v, node);
    }
    const skipped = nbrs.filter((v) => visited.has(v));
    r.snap(
      9,
      nbrs.length === 0
        ? `${node} has no neighbours${keys.has(node) ? '' : ' (it is not a key)'}: nothing to push.`
        : `Neighbours of ${node}: [${nbrs.join(', ')}]. Pushed in reverse, ${pushed.length ? `[${pushed.join(', ')}]` : 'none'}, so ${pushed.length ? `${pushed[pushed.length - 1]} is on top and is popped next` : 'the stack does not grow'}.` +
          (skipped.length ? ` ${skipped.join(', ')} ${skipped.length === 1 ? 'is' : 'are'} visited already.` : ''),
      strips(),
      [['node', node], ['pushed', pushed.length]],
      { nodes: Object.fromEntries(pushed.map((v) => [v, 'compare' as Role])), edges: Object.fromEntries(pushed.map((v) => [edgeOf(node, v), 'compare' as Role])) },
    );
    r.nodeRole.set(node, 'done');
    for (const v of pushed) if (!visited.has(v)) r.nodeRole.set(v, 'compare');
  }
  r.snap(10, `The stack is empty: return [${result.join(', ')}]. This is the same order as dfs_recursive, which follows each neighbour list from the front.`, strips(), [['result', `[${result.join(', ')}]`]]);
  return { frames: r.frames, stacks, result };
}

/* ---------- topological sort (Kahn, nodes 0..n-1, edge list) ---------- */

export interface TopoInput {
  n: number;
  edges: Array<[number, number]>;
}

export const TOPO_LIMITS = { maxN: 10, minN: -3, maxEdges: 20, minEnd: -9, maxEnd: 99 };

export function parseTopo(text: string): TopoInput {
  const m = text.match(/^\s*n\s*[:=]?\s*(-?\d+)\s*(?:;(.*))?$/is);
  if (!m) throw new InputError('Start with the number of nodes, then the edges: "n 4; 1->0, 2->0, 3->1, 3->2".');
  const n = Number(m[1]);
  if (n < TOPO_LIMITS.minN || n > TOPO_LIMITS.maxN) throw new InputError(`n goes from ${TOPO_LIMITS.minN} to ${TOPO_LIMITS.maxN} here (got ${n}).`);
  const edges: Array<[number, number]> = [];
  for (const raw of (m[2] ?? '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean)) {
    const e = raw.match(/^(-?\d+)\s*(?:->|\s)\s*(-?\d+)$/);
    if (!e) throw new InputError(`Cannot read the edge "${raw}". Write edges as "u->v" (u comes before v).`);
    const u = Number(e[1]);
    const v = Number(e[2]);
    for (const x of [u, v]) if (x < TOPO_LIMITS.minEnd || x > TOPO_LIMITS.maxEnd) throw new InputError(`Endpoints go from ${TOPO_LIMITS.minEnd} to ${TOPO_LIMITS.maxEnd} here (got ${x}).`);
    if (u === v) throw new InputError(`"${raw}" is a self-loop: it is not drawn here. A 2-cycle such as "0->1, 1->0" shows the same thing.`);
    edges.push([u, v]);
  }
  if (edges.length > TOPO_LIMITS.maxEdges) throw new InputError(`At most ${TOPO_LIMITS.maxEdges} edges, please (got ${edges.length}).`);
  return { n, edges };
}

export const TOPO_CODE = [
  'topological_sort(n, edges):',
  '  if n <= 0: return []',
  '  adj = {i: [] for i in range(n)}; in_degree = {i: 0 for i in range(n)}',
  '  for u, v in edges: adj[u].append(v); in_degree[v] += 1',
  '  queue = deque([node for node in range(n) if in_degree[node] == 0])',
  '  result = []',
  '  while queue:',
  '    node = queue.popleft(); result.append(node)',
  '    for neighbor in adj[node]:',
  '      in_degree[neighbor] -= 1',
  '      if in_degree[neighbor] == 0: queue.append(neighbor)',
  '  if len(result) != n: return []          # a cycle never reaches in-degree 0',
  '  return result',
];

export interface TopoRun {
  frames: Array<Frame<GraphState>>;
  indegree?: number[];
  taken: number[];
  result?: number[];
  error?: string;
}

type Pos = { x: number; y: number };

/** Distance from point p to the segment ab. */
function segmentDistance(p: Pos, a: Pos, b: Pos): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** How many times an edge passes over a node it does not touch (node radius 20, plus a margin). */
export function edgeNodeCollisions(pos: Map<string, Pos>, edges: Array<[number, number]>): number {
  let hits = 0;
  for (const [u, v] of edges) {
    const a = pos.get(String(u));
    const b = pos.get(String(v));
    if (!a || !b || u === v) continue;
    for (const [id, p] of pos) if (id !== String(u) && id !== String(v) && segmentDistance(p, a, b) < 26) hits++;
  }
  return hits;
}

/**
 * Columns by longest path from a source, each column ordered by where its predecessors sit;
 * nodes that never reach in-degree 0 (on or behind a cycle) go on a ring at the right, where an
 * edge between two of them cannot cross a third. A short greedy search then shifts columns and
 * turns the ring so that no edge passes over a node it does not touch.
 */
function layered(n: number, edges: Array<[number, number]>): Map<string, Pos> {
  const indeg = Array.from({ length: n }, () => 0);
  const out: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    out[u].push(v);
    indeg[v] += 1;
  }
  const layer = Array.from({ length: n }, () => 0);
  const q = indeg.flatMap((d, v) => (d === 0 ? [v] : []));
  const placed = new Set(q);
  while (q.length) {
    const u = q.shift()!;
    for (const v of out[u]) {
      layer[v] = Math.max(layer[v], layer[u] + 1);
      if (--indeg[v] === 0) {
        q.push(v);
        placed.add(v);
      }
    }
  }
  const stuck = Array.from({ length: n }, (_, v) => v).filter((v) => !placed.has(v));
  const columns = placed.size ? Math.max(...[...placed].map((v) => layer[v])) + 1 : 0;
  const ringR = stuck.length <= 1 ? 0 : stuck.length === 2 ? 60 : Math.min(110, 30 + 14 * stuck.length);
  const ringX = 600 - 40 - ringR;
  const right = stuck.length ? ringX - ringR - 70 : 550;
  const colX = (L: number) => (columns <= 1 ? (stuck.length ? Math.min(300, right) : 300) : 50 + ((right - 50) * L) / (columns - 1));
  const members: number[][] = Array.from({ length: columns }, (_, L) => [...placed].filter((v) => layer[v] === L).sort((a, b) => a - b));

  const build = (offsets: number[], turn: number): Map<string, Pos> => {
    const pos = new Map<string, Pos>();
    members.forEach((col, L) => {
      col.forEach((v, k) => pos.set(String(v), { x: Math.round(colX(L)), y: Math.round(Math.min(350, Math.max(34, 40 + ((k + 0.5) * 300) / col.length + offsets[L]))) }));
    });
    stuck.forEach((v, k) => {
      const a = turn - Math.PI / 2 + (2 * Math.PI * k) / stuck.length;
      pos.set(String(v), { x: Math.round(ringX + ringR * Math.cos(a)), y: Math.round(190 + ringR * Math.sin(a)) });
    });
    return pos;
  };
  // Order each column by the mean height of its predecessors (fewer crossings).
  for (let L = 1; L < columns; L++) {
    const at = build(members.map(() => 0), 0);
    const bary = (v: number) => {
      const ys = edges.filter(([, b]) => b === v).map(([a]) => at.get(String(a))?.y ?? 190);
      return ys.length ? ys.reduce((s, y) => s + y, 0) / ys.length : 190;
    };
    members[L].sort((a, b) => bary(a) - bary(b) || a - b);
  }
  const offsets: number[] = members.map((_, L) => (L % 2 ? 12 : 0));
  let turn = 0;
  let best = edgeNodeCollisions(build(offsets, turn), edges);
  for (let pass = 0; pass < 3 && best > 0; pass++) {
    // Each column in turn keeps the shift (from -36 to +36 px) with the fewest collisions.
    for (let L = 0; L < columns; L++) {
      const keep = offsets[L];
      for (const d of [-36, -24, -12, 12, 24, 36]) {
        offsets[L] = keep + d;
        const c = edgeNodeCollisions(build(offsets, turn), edges);
        if (c < best) best = c;
        else offsets[L] = keep;
        if (c < best || offsets[L] !== keep) break;
      }
    }
    // Then the ring turns, in twelve small steps.
    for (let k = 1; k < 12 && stuck.length > 1 && best > 0; k++) {
      const t = (Math.PI * 2 * k) / (12 * stuck.length);
      const c = edgeNodeCollisions(build(offsets, t), edges);
      if (c < best) {
        best = c;
        turn = t;
      }
    }
  }
  return build(offsets, turn);
}

export function topoTrace({ n, edges }: TopoInput): TopoRun {
  const nodes = Array.from({ length: Math.max(0, n) }, (_, v) => v);
  const valid = (x: number) => x >= 0 && x < n;
  const firstBad = edges.findIndex(([u, v]) => !valid(u) || !valid(v));
  const drawable = (firstBad < 0 ? edges : edges.slice(0, firstBad)).filter(([u, v]) => valid(u) && valid(v));
  const drawn: DrawnEdge[] = drawable.map(([u, v], id) => ({ id, from: u, to: v, directed: true }));
  const r = new GraphFrames(nodes, drawn, n > 0 ? layered(n, drawable) : new Map());
  const run: TopoRun = { frames: r.frames, taken: [] };
  const queue: number[] = [];
  const result: number[] = [];
  let error: StripItem | null = null;
  const strips = () => [strip('queue', queue.map(String)), strip('result', error ? [...result.map(String), error] : result.map(String))];
  const list = edges.map(([u, v]) => `${u}->${v}`).join(', ');

  r.snap(0, `topological_sort(${n}, [${list}]): order nodes 0..${Math.max(0, n - 1)} so that every edge u->v puts u before v (Kahn's algorithm).`, strips(), [['n', n]]);
  if (n <= 0) {
    run.result = [];
    r.snap(1, `n = ${n} <= 0: there are no nodes, so the function returns [] before it looks at the edges.`, strips(), [['result', '[]']]);
    return run;
  }
  const indeg = nodes.map(() => 0);
  const adj: number[][] = nodes.map(() => []);
  nodes.forEach((v) => r.badges.set(v, 'in 0'));
  r.snap(2, `adj and in_degree get one entry per node 0..${n - 1}, every in-degree 0.`, strips(), []);
  for (let i = 0; i < edges.length; i++) {
    const [u, v] = edges[i];
    if (!valid(u)) {
      run.error = `KeyError: ${u}`;
      error = { text: `${SYM.cross} ${run.error}`, role: 'bad' };
      r.snap(3, `Edge ${u}->${v}: adj[${u}] raises KeyError: ${u}, because the dicts only have the keys 0..${n - 1}. The function stops here.`, strips(), [['u', u], ['v', v]]);
      return run;
    }
    adj[u].push(v);
    if (!valid(v)) {
      run.error = `KeyError: ${v}`;
      error = { text: `${SYM.cross} ${run.error}`, role: 'bad' };
      r.snap(3, `Edge ${u}->${v}: adj[${u}].append(${v}) works, but in_degree[${v}] raises KeyError: ${v}, since ${v} is not one of the nodes 0..${n - 1}. The function stops here.`, strips(), [['u', u], ['v', v]], {
        nodes: { [u]: 'bad' },
      });
      return run;
    }
    indeg[v] += 1;
    r.badges.set(v, `in ${indeg[v]}`);
    r.snap(3, `Edge ${u}->${v}: adj[${u}].append(${v}), and in_degree[${v}] becomes ${indeg[v]}: ${v} now waits for ${indeg[v]} node${indeg[v] === 1 ? '' : 's'} to be placed first.`, strips(), [['u', u], ['v', v]], { edges: { [i]: 'active' }, nodes: { [v]: 'compare' } });
  }
  run.indegree = [...indeg];
  for (const v of nodes) if (indeg[v] === 0) queue.push(v);
  queue.forEach((v) => r.nodeRole.set(v, 'compare'));
  r.snap(4, queue.length ? `The queue starts with every node of in-degree 0, in increasing order: [${queue.join(', ')}]. Nothing has to come before them.` : 'No node has in-degree 0: every node waits for another one, so there must be a cycle. The queue starts empty.', strips(), [['queue', queue.length]]);
  let order = 0;
  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    run.taken.push(node);
    order += 1;
    r.nodeRole.set(node, 'active');
    r.badges.set(node, `#${order}`);
    r.snap(7, `popleft() gives ${node}: all of its prerequisites are placed, so it goes next in the order (position ${order}).`, strips(), [['node', node]]);
    adj[node].forEach((v) => {
      const e = drawable.findIndex(([a, b], k) => a === node && b === v && r.edgeRole.get(k) !== 'done');
      indeg[v] -= 1;
      if (e >= 0) r.edgeRole.set(e, 'done');
      if (indeg[v] === 0) {
        queue.push(v);
        r.nodeRole.set(v, 'compare');
        r.badges.set(v, 'in 0');
        r.snap(10, `in_degree[${v}] drops to 0: ${node} was its last unplaced prerequisite, so ${v} joins the queue.`, strips(), [['node', node], ['neighbor', v]], { nodes: { [v]: 'active' } });
      } else {
        r.badges.set(v, `in ${indeg[v]}`);
        r.snap(9, `in_degree[${v}] drops to ${indeg[v]}: ${v} still waits for ${indeg[v]} more.`, strips(), [['node', node], ['neighbor', v]], { nodes: { [v]: 'compare' } });
      }
    });
    r.nodeRole.set(node, 'done');
  }
  if (result.length !== n) {
    const stuck = nodes.filter((v) => !result.includes(v));
    stuck.forEach((v) => r.nodeRole.set(v, 'bad'));
    run.result = [];
    r.snap(11, `Only ${result.length} of ${n} nodes were placed. ${stuck.join(', ')} never reached in-degree 0: each waits for a node on a cycle. The function returns [] for "no valid order".`, strips(), [['result', '[]']]);
    return run;
  }
  run.result = [...result];
  r.snap(12, `All ${n} nodes are placed: return [${result.join(', ')}]. Every edge points from an earlier node to a later one (the badges #k give the positions).`, strips(), [['result', `[${result.join(', ')}]`]]);
  return run;
}
