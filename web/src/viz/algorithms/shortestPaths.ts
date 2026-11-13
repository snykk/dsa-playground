/**
 * Shortest-path tracers: Bellman-Ford (graph view), Floyd-Warshall (matrix view)
 * and A* on a small ASCII map (grid view).
 *
 * Each tracer mirrors the repository's Python implementation (Algorithms/Graph_Algorithms/Shortest_Path)
 * including its tie-breaking, so the golden fixtures in __fixtures__/shortestPaths.json match.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GraphState } from '../renderers/GraphView';
import type { GridState } from '../renderers/Grid';
import type { GridMapCell, GridMapState } from '../renderers/GridMap';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { circleLayout, type Graph } from './graph';

const INF = Infinity;
const fmt = (d: number) => (d === INF ? SYM.infinity : String(d));

/* ------------------------------------------------------------------ */
/* Bellman-Ford                                                        */
/* ------------------------------------------------------------------ */

export interface BellmanFordRun {
  frames: Array<Frame<GraphState>>;
  /** Final distances in node order (Infinity = unreachable), or null when a negative cycle is reachable. */
  dist: number[] | null;
}

export function bellmanFordRun(g: Graph): BellmanFordRun {
  const n = g.nodes.length;
  const idx = new Map(g.nodes.map((id, i) => [id, i]));
  const pos = circleLayout(g.nodes);
  interface Arc {
    u: number;
    v: number;
    w: number;
    edge: number;
  }
  const arcs: Arc[] = [];
  g.edges.forEach((e, i) => {
    arcs.push({ u: idx.get(e.from)!, v: idx.get(e.to)!, w: e.weight, edge: i });
    if (!e.directed) arcs.push({ u: idx.get(e.to)!, v: idx.get(e.from)!, w: e.weight, edge: i });
  });
  const name = (i: number) => g.nodes[i];
  const dist: number[] = g.nodes.map(() => INF);
  dist[idx.get(g.start)!] = 0;
  const parentEdge = new Map<number, number>();
  const frames: Array<Frame<GraphState>> = [];
  const changed = new Set<number>();

  const snap = (
    line: number | undefined,
    caption: string,
    vars: Frame<GraphState>['vars'],
    extra: { nodes?: Record<number, Role>; edges?: Record<number, Role> } = {},
    strips: Array<{ label: string; items: StripItem[] }> = [],
  ) => {
    const tree = new Set(parentEdge.values());
    frames.push({
      line,
      caption,
      vars,
      state: {
        nodes: g.nodes.map((id, i) => ({
          id,
          ...pos.get(id)!,
          role: extra.nodes?.[i] ?? (dist[i] === INF ? 'idle' : changed.has(i) ? 'compare' : 'idle'),
          badge: fmt(dist[i]),
        })),
        edges: g.edges.map((e, i) => ({
          id: i,
          from: e.from,
          to: e.to,
          directed: e.directed,
          weight: e.weight,
          role: extra.edges?.[i] ?? (tree.has(i) ? 'done' : 'idle'),
        })),
        showWeights: true,
        strips,
      },
    });
  };

  snap(0, `Every distance starts at ${SYM.infinity} except the source ${g.start} (0). Bellman-Ford will relax every edge, again and again, for ${n - 1} rounds.`, [['rounds', `${n - 1}`]]);

  for (let round = 1; round <= n - 1; round++) {
    changed.clear();
    snap(1, `Round ${round} of ${n - 1}: look at every edge once, in input order. After round r, all shortest paths with at most r edges are correct.`, [['round', round]]);
    for (const { u, v, w, edge } of arcs) {
      const arcName = `${name(u)}${SYM.rightArrow}${name(v)}`;
      if (dist[u] === INF) {
        snap(3, `Edge ${arcName} (${w}): ${name(u)} has not been reached yet, so there is nothing to extend.`, [['round', round], ['edge', arcName]], { edges: { [edge]: 'muted' } });
        continue;
      }
      const cand = dist[u] + w;
      if (cand < dist[v]) {
        const old = dist[v];
        dist[v] = cand;
        parentEdge.set(v, edge);
        changed.add(v);
        snap(
          4,
          `Edge ${arcName} (${w}): ${dist[u]} + ${w} = ${cand} < dist[${name(v)}] = ${fmt(old)}, so relax it: dist[${name(v)}] = ${cand} and ${name(u)} becomes its parent.`,
          [['round', round], ['edge', arcName], ['dist[v]', cand]],
          { nodes: { [u]: 'active', [v]: 'active' }, edges: { [edge]: 'compare' } },
        );
      } else {
        snap(
          3,
          `Edge ${arcName} (${w}): ${dist[u]} + ${w} = ${cand} ${SYM.rightArrow} not below dist[${name(v)}] = ${fmt(dist[v])}, no improvement.`,
          [['round', round], ['edge', arcName], ['dist[u] + w', cand]],
          { nodes: { [u]: 'active' }, edges: { [edge]: 'muted' } },
        );
      }
    }
    snap(
      undefined,
      changed.size
        ? `Round ${round} finished: ${changed.size} distance${changed.size > 1 ? 's' : ''} improved (${[...changed].map(name).join(', ')}).`
        : `Round ${round} finished: nothing changed. (A smarter version could stop here; the repository code still runs all ${n - 1} rounds.)`,
      [['round', round], ['improved', changed.size]],
    );
  }

  changed.clear();
  snap(5, `The extra round. With no negative cycle every distance is already final after ${n - 1} rounds, so no edge can still improve. If one can, a negative cycle is reachable.`, [['check', 'round V']]);
  for (const { u, v, w, edge } of arcs) {
    const arcName = `${name(u)}${SYM.rightArrow}${name(v)}`;
    if (dist[u] !== INF && dist[u] + w < dist[v]) {
      snap(
        6,
        `Edge ${arcName} (${w}): ${dist[u]} + ${w} = ${dist[u] + w} < dist[${name(v)}] = ${fmt(dist[v])} even after ${n - 1} rounds. Distances could shrink forever: a negative cycle is reachable.`,
        [['edge', arcName]],
        { nodes: { [u]: 'bad', [v]: 'bad' }, edges: { [edge]: 'active' } },
      );
      snap(undefined, `Negative cycle detected, so no shortest paths exist. The repository function returns None / nil / an empty result here.`, [['negative cycle', 'yes']], { nodes: { [u]: 'bad', [v]: 'bad' }, edges: { [edge]: 'active' } });
      return { frames, dist: null };
    }
    snap(6, `Edge ${arcName} (${w}): ${fmt(dist[u] === INF ? INF : dist[u] + w)} is not below dist[${name(v)}] = ${fmt(dist[v])}: still fine.`, [['edge', arcName]], { edges: { [edge]: 'muted' } });
  }
  const unreachable = g.nodes.filter((_, i) => dist[i] === INF);
  const all: Record<number, Role> = {};
  dist.forEach((d, i) => {
    if (d !== INF) all[i] = 'done';
  });
  snap(
    undefined,
    `No edge improves, so there is no negative cycle and the distances are final. Highlighted edges form the shortest-path tree from ${g.start}.${unreachable.length ? ` Unreachable: ${unreachable.join(', ')}.` : ''}`,
    [['negative cycle', 'no']],
    { nodes: all },
  );
  return { frames, dist };
}

export const bellmanFord = (g: Graph) => bellmanFordRun(g).frames;

/* ------------------------------------------------------------------ */
/* Floyd-Warshall                                                      */
/* ------------------------------------------------------------------ */

export interface FloydWarshallRun {
  frames: Array<Frame<GridState>>;
  /** All-pairs distances (Infinity = unreachable), or null when a negative cycle exists. */
  dist: number[][] | null;
}

export function floydWarshallRun(g: Graph): FloydWarshallRun {
  const n = g.nodes.length;
  const idx = new Map(g.nodes.map((id, i) => [id, i]));
  const dist: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)));
  for (const e of g.edges) {
    const a = idx.get(e.from)!;
    const b = idx.get(e.to)!;
    dist[a][b] = Math.min(dist[a][b], e.weight);
    if (!e.directed) dist[b][a] = Math.min(dist[b][a], e.weight);
  }
  const frames: Array<Frame<GridState>> = [];
  const improved = new Set<string>();
  const nm = (i: number) => g.nodes[i];

  const snap = (line: number | undefined, caption: string, vars: Frame<GridState>['vars'], roles: Record<string, Role> = {}, strips: Array<{ label: string; items: StripItem[] }> = []) => {
    frames.push({
      line,
      caption,
      vars,
      state: {
        corner: 'from/to',
        rowHeaders: [...g.nodes],
        colHeaders: [...g.nodes],
        cells: dist.map((row) => row.map(fmt)),
        roles,
        strips,
      },
    });
  };
  const doneRoles = (): Record<string, Role> => Object.fromEntries([...improved].map((key) => [key, 'done' as Role]));

  snap(0, `Start from the direct edges: 0 on the diagonal, the edge weight where an edge exists (the cheapest of parallel edges), ${SYM.infinity} elsewhere. dist[i][j] is the best known cost from i to j.`, [['n', n]]);

  for (let k = 0; k < n; k++) {
    improved.clear();
    const stripe: Record<string, Role> = {};
    for (let t = 0; t < n; t++) {
      stripe[`${k},${t}`] = 'compare';
      stripe[`${t},${k}`] = 'compare';
    }
    snap(
      1,
      `Round k = ${nm(k)}: allow ${nm(k)} as an intermediate stop. A route i ${SYM.rightArrow} j may now be replaced by i ${SYM.rightArrow} ${nm(k)} ${SYM.rightArrow} j, which uses only row ${nm(k)} and column ${nm(k)} (highlighted).`,
      [['k', nm(k)]],
      stripe,
      [{ label: 'Intermediates allowed', items: g.nodes.slice(0, k + 1).map((id, t) => ({ text: id, role: t === k ? 'active' : undefined })) }],
    );
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] === INF || dist[k][j] === INF) continue;
        const via = dist[i][k] + dist[k][j];
        const better = via < dist[i][j];
        // Pairs on the pivot row/column cannot change unless a negative cycle runs through k; skip the noise.
        if (!better && (i === k || j === k)) continue;
        const base = `${nm(i)}${SYM.rightArrow}${nm(k)}${SYM.rightArrow}${nm(j)}`;
        const roles: Record<string, Role> = { [`${i},${k}`]: 'compare', [`${k},${j}`]: 'compare' };
        if (better) {
          const old = dist[i][j];
          dist[i][j] = via;
          improved.add(`${i},${j}`);
          snap(
            3,
            `${base}: ${fmt(dist[i][k])} + ${fmt(dist[k][j])} = ${via} < dist[${nm(i)}][${nm(j)}] = ${fmt(old)}, so going through ${nm(k)} is cheaper: update the cell.`,
            [['k', nm(k)], ['i', nm(i)], ['j', nm(j)], ['via k', via]],
            { ...doneRoles(), ...roles, [`${i},${j}`]: 'active' },
          );
        } else {
          snap(
            2,
            `${base}: ${fmt(dist[i][k])} + ${fmt(dist[k][j])} = ${via}, not below dist[${nm(i)}][${nm(j)}] = ${fmt(dist[i][j])}: keep the current value.`,
            [['k', nm(k)], ['i', nm(i)], ['j', nm(j)], ['via k', via]],
            { ...doneRoles(), ...roles, [`${i},${j}`]: 'active' },
          );
        }
      }
    }
    snap(undefined, improved.size ? `Round ${nm(k)} finished: ${improved.size} cell${improved.size > 1 ? 's' : ''} improved (shown in aqua).` : `Round ${nm(k)} finished: no cell improved.`, [['k', nm(k)], ['improved', improved.size]], doneRoles());
  }

  const bad = Array.from({ length: n }, (_, i) => i).filter((i) => dist[i][i] < 0);
  if (bad.length) {
    snap(
      4,
      `Check the diagonal: dist[${nm(bad[0])}][${nm(bad[0])}] = ${dist[bad[0]][bad[0]]} is negative, meaning ${nm(bad[0])} can reach itself with a negative total cost. That is a negative cycle, so the table is meaningless; the repository function returns None / nil.`,
      [['negative cycle', 'yes']],
      Object.fromEntries(bad.map((i) => [`${i},${i}`, 'active' as Role])),
    );
    return { frames, dist: null };
  }
  snap(undefined, `Every diagonal entry is 0, so there is no negative cycle. Each cell is now the cheapest cost from its row vertex to its column vertex (${SYM.infinity} = unreachable).`, [['negative cycle', 'no']]);
  return { frames, dist };
}

export const floydWarshall = (g: Graph) => floydWarshallRun(g).frames;

/* ------------------------------------------------------------------ */
/* A* on an ASCII map                                                  */
/* ------------------------------------------------------------------ */

export interface AStarMap {
  rows: number;
  cols: number;
  /** Row-major; true = wall. */
  wall: boolean[];
  /** Cost of stepping onto each cell (1 for plain floor, 2..9 for rough terrain). */
  cost: number[];
  start: number;
  goal: number;
}

/** Rows separated by "/", ";" or a newline. '.' floor, '#' wall, '2'..'9' rough terrain, S start, G goal. */
export function parseMap(text: string, { maxRows = 10, maxCols = 14 } = {}): AStarMap {
  const rowsText = text.split(/[/;\n]/).map((r) => r.trim()).filter(Boolean);
  if (rowsText.length === 0) throw new InputError('Draw a map, e.g. "S..#/.#.#/...G" (rows separated by "/").');
  if (rowsText.length > maxRows) throw new InputError(`At most ${maxRows} rows, please (got ${rowsText.length}).`);
  const cols = rowsText[0].length;
  if (cols > maxCols) throw new InputError(`At most ${maxCols} columns, please (got ${cols}).`);
  const wall: boolean[] = [];
  const cost: number[] = [];
  let start = -1;
  let goal = -1;
  rowsText.forEach((row, r) => {
    if (row.length !== cols) throw new InputError(`Row ${r + 1} has ${row.length} characters but row 1 has ${cols}: all rows must be the same length.`);
    [...row].forEach((ch, c) => {
      const i = r * cols + c;
      if (ch === '#') {
        wall.push(true);
        cost.push(1);
      } else if (ch === '.' || ch === 'S' || ch === 'G' || /^[1-9]$/.test(ch)) {
        wall.push(false);
        cost.push(/^[1-9]$/.test(ch) ? Number(ch) : 1);
        if (ch === 'S') {
          if (start >= 0) throw new InputError('Only one start "S" is allowed.');
          start = i;
        }
        if (ch === 'G') {
          if (goal >= 0) throw new InputError('Only one goal "G" is allowed.');
          goal = i;
        }
      } else {
        throw new InputError(`Unknown map character "${ch}". Use . (floor), # (wall), 2-9 (rough terrain), S (start), G (goal).`);
      }
    });
  });
  if (start < 0) throw new InputError('The map needs a start "S".');
  if (goal < 0) throw new InputError('The map needs a goal "G".');
  return { rows: rowsText.length, cols, wall, cost, start, goal };
}

export function formatMap(m: AStarMap): string {
  const rows: string[] = [];
  for (let r = 0; r < m.rows; r++) {
    let s = '';
    for (let c = 0; c < m.cols; c++) {
      const i = r * m.cols + c;
      s += i === m.start ? 'S' : i === m.goal ? 'G' : m.wall[i] ? '#' : m.cost[i] > 1 ? String(m.cost[i]) : '.';
    }
    rows.push(s);
  }
  return rows.join('/');
}

export interface AStarRun {
  frames: Array<Frame<GridMapState>>;
  /** Total cost and the cells from start to goal (row-major indices), or null when the goal is unreachable. */
  result: { cost: number; path: number[] } | null;
  expanded: number;
}

export function astarRun(m: AStarMap): AStarRun {
  const { rows, cols } = m;
  const gr = Math.floor(m.goal / cols);
  const gc = m.goal % cols;
  const h = (i: number) => Math.abs(Math.floor(i / cols) - gr) + Math.abs((i % cols) - gc);
  const rc = (i: number) => `(${Math.floor(i / cols)},${i % cols})`;
  const gScore = new Map<number, number>([[m.start, 0]]);
  const parent = new Map<number, number>();
  const closed = new Set<number>();
  const pq: Array<{ f: number; g: number; i: number }> = [{ f: h(m.start), g: 0, i: m.start }];
  const frames: Array<Frame<GridMapState>> = [];
  let expanded = 0;

  const snap = (
    line: number | undefined,
    caption: string,
    vars: Frame<GridMapState>['vars'],
    opts: { current?: number; flash?: Map<number, Role>; path?: Set<number> } = {},
  ) => {
    const cells: GridMapCell[] = [];
    for (let i = 0; i < rows * cols; i++) {
      const special = i === m.start ? 'start' : i === m.goal ? 'goal' : m.wall[i] ? 'wall' : 'floor';
      let role: Role = 'idle';
      let text = '';
      let title: string | undefined;
      if (special === 'wall') {
        text = '';
      } else {
        const g = gScore.get(i);
        if (g !== undefined) {
          title = `${rc(i)}: g=${g}, h=${h(i)}, f=${g + h(i)}`;
          text = String(g + h(i));
          role = closed.has(i) ? 'muted' : 'compare';
        } else {
          text = m.cost[i] > 1 ? String(m.cost[i]) : '';
          title = `${rc(i)}: not discovered yet${m.cost[i] > 1 ? `, entering costs ${m.cost[i]}` : ''}`;
        }
        if (opts.path?.has(i)) role = 'done';
        if (opts.current === i) role = 'active';
        const flash = opts.flash?.get(i);
        if (flash) role = flash;
        if (special === 'start') text = 'S';
        if (special === 'goal') text = 'G';
      }
      cells.push({ kind: special, role, text, title });
    }
    const live = pq
      .filter((e) => e.g === gScore.get(e.i) && !closed.has(e.i))
      .sort((a, b) => a.f - b.f || a.g - b.g || a.i - b.i)
      .slice(0, 7)
      .map((e, k) => ({ text: `${rc(e.i)} f=${e.f}`, role: (k === 0 ? 'compare' : undefined) as Role | undefined }));
    frames.push({
      line,
      caption,
      vars,
      state: {
        rows,
        cols,
        cells,
        strips: [{ label: 'Open set (lowest f first)', items: live.length ? live : [{ text: '(empty)' }] }],
      },
    });
  };

  snap(0, `Start at S ${rc(m.start)}. g = cost so far, h = straight-line grid distance to G (Manhattan), f = g + h. Put S in the open set with f = ${h(m.start)}.`, [['h(S)', h(m.start)]], { current: undefined });

  while (pq.length) {
    pq.sort((a, b) => a.f - b.f || a.g - b.g || a.i - b.i);
    const { f, g, i: u } = pq.shift()!;
    if (u === m.goal) {
      snap(2, `Pop the open cell with the smallest f = ${f}: it is the goal G. Because h never overestimates, no cheaper route can remain: cost ${g}.`, [['u', rc(u)], ['f', f], ['g', g]], { current: u });
      const path: number[] = [u];
      while (path[path.length - 1] !== m.start) path.push(parent.get(path[path.length - 1])!);
      path.reverse();
      const shown = new Set<number>();
      for (let k = path.length - 1; k >= 0; k--) {
        shown.add(path[k]);
        snap(3, k === path.length - 1 ? `Walk back along the parent pointers from G.` : `${rc(path[k])} is the parent of ${rc(path[k + 1])}.`, [['steps back', path.length - 1 - k]], { path: shown });
      }
      snap(undefined, `Done. The path has ${path.length - 1} steps and costs ${g}. A* expanded ${expanded} cell${expanded === 1 ? '' : 's'}; the rest of the map was never needed.`, [['cost', g], ['expanded', expanded]], { path: shown });
      return { frames, result: { cost: g, path }, expanded };
    }
    if (g > gScore.get(u)!) {
      snap(4, `Pop ${rc(u)} with g = ${g}, but a cheaper route (g = ${gScore.get(u)}) was found after this entry was pushed: stale entry, skip it.`, [['u', rc(u)], ['popped g', g]], { current: u });
      continue;
    }
    closed.add(u);
    expanded++;
    snap(2, `Pop the open cell with the smallest f: ${rc(u)} with g = ${g}, h = ${h(u)}, f = ${f}. Expand it by looking at its four neighbors.`, [['u', rc(u)], ['g', g], ['h', h(u)], ['f', f]], { current: u });
    const r0 = Math.floor(u / cols);
    const c0 = u % cols;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const r1 = r0 + dr;
      const c1 = c0 + dc;
      if (r1 < 0 || r1 >= rows || c1 < 0 || c1 >= cols) continue;
      const v = r1 * cols + c1;
      if (m.wall[v]) continue;
      const tentative = g + m.cost[v];
      const old = gScore.get(v);
      if (old === undefined || tentative < old) {
        const wasClosed = closed.has(v);
        gScore.set(v, tentative);
        parent.set(v, u);
        closed.delete(v);
        pq.push({ f: tentative + h(v), g: tentative, i: v });
        snap(
          7,
          `Neighbor ${rc(v)}: g = ${g} + ${m.cost[v]} = ${tentative}${old === undefined ? ' (first time seen)' : ` < ${old}, a cheaper route`}${wasClosed ? '; it had been closed, so it is re-opened' : ''}. Set f = ${tentative} + ${h(v)} = ${tentative + h(v)} and add it to the open set.`,
          [['u', rc(u)], ['v', rc(v)], ['g[v]', tentative], ['f[v]', tentative + h(v)]],
          { current: u, flash: new Map([[v, 'good']]) },
        );
      } else {
        snap(
          6,
          `Neighbor ${rc(v)}: g = ${g} + ${m.cost[v]} = ${tentative} is not below its known ${old}, so this route is no improvement.`,
          [['u', rc(u)], ['v', rc(v)], ['g via u', tentative]],
          { current: u, flash: new Map([[v, 'bad']]) },
        );
      }
    }
  }
  snap(undefined, `The open set is empty and G was never reached: the walls cut S off from G, so there is no path.`, [['expanded', expanded]]);
  return { frames, result: null, expanded };
}

export const astar = (m: AStarMap) => astarRun(m).frames;
