/**
 * Dinic tracer, drawn with FlowNetworkView.
 *
 * Mirrors Algorithms/Graph_Algorithms/Advanced_Graph/Network_Flow/Dinic/Python/dinic.py: _run
 * builds the residual dict Ford-Fulkerson and Edmonds-Karp build (_build_residual) and
 * adj[u] = sorted(residual[u]) (_neighbours), then repeats phases. A phase is one BFS
 * (_bfs_levels: a level for every vertex reached over entries with room), then searches
 * (_find_path: one DFS from the source that steps only one level deeper and resumes every
 * vertex at its current arc, current[u]) with a push of the bottleneck (_push) after each
 * path, until the source itself is a dead end. The run stops at the first BFS that misses the
 * sink; the vertices it reached are the source side of a minimum cut.
 *
 * The order is Python's sorted() on the dict keys: numbers by value when every vertex name is a
 * number (the keys are ints), otherwise strings by code point. The golden fixture
 * (__fixtures__/advancedGraph.json, section "dinic") pins the levels of every phase, every
 * search's path, entry visits and bottleneck, the final residual dict, the flows and the cut.
 */
import type { Role } from '../core/types';
import {
  ARROW,
  bottleneckOf,
  buildResidual,
  checkFrameBudget,
  cutSummary,
  FlowNet,
  FlowRecorder,
  names,
  parseFlow,
  pathText,
  pathToken,
  pythonGraph,
  residualPairs,
  setText,
  skipText,
  strip,
  type FlowInput,
  type FlowRun,
  type Vars,
} from './flowNetwork';

export const DINIC_CODE = [
  'if source == sink: return 0',
  'residual = copy of graph, plus residual[v][u] = 0 for each edge u -> v; adj[u] = sorted(residual[u])',
  'while True:                                      # one phase',
  '  level = BFS from source over entries with room  # _bfs_levels',
  '  if sink not in level: break                    # the last BFS',
  '  current = {u: 0 for u in adj}                  # one current arc per vertex',
  '  while (path := _find_path(...)) is not None:   # DFS from the source',
  '    u = path[-1]; while adj[u][current[u]] is full or not one level deeper: current[u] += 1',
  '    if an entry is left: path.append(adj[u][current[u]])',
  '    else: path.pop(); current[path[-1]] += 1     # u is a dead end',
  '    when u == sink: return path',
  '    max_flow += _push(residual, path)            # the bottleneck along the path',
  'return max_flow; source_side = sorted(level)     # the last BFS: a minimum cut',
];

export interface DinicSearch {
  /** The path _find_path returned, or null when the source was a dead end. */
  path: string[] | null;
  /** Residual entries the search looked at. */
  visits: number;
  /** What _push returned for the path, or null. */
  pushed: number | null;
}

export interface DinicPhase {
  /** The level dict of the phase's BFS, in BFS order. */
  level: Array<[string, number]>;
  searches: DinicSearch[];
}

export interface DinicRun extends FlowRun {
  phases: DinicPhase[];
  edgeVisits: number;
  /** flows[u][v] for every edge, rows and entries in the graph dict's order. */
  flows: Array<[string, Array<[string, number]>]>;
  /** sorted(level) of the last BFS. */
  sourceSide: string[];
}

/** Python's sorted() on the keys: ints when every name is a number, else strings by code point. */
export function vertexOrder(nodes: string[]): (a: string, b: string) => number {
  const numeric = nodes.every((n) => /^\d+$/.test(n));
  const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
  return numeric ? (a, b) => Number(a) - Number(b) || byText(a, b) : byText;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function dinicTrace(input: FlowInput): DinicRun {
  const { source, sink } = input;
  const net = new FlowNet(input);
  const graph = pythonGraph(input);
  const res = buildResidual(graph);
  const r = new FlowRecorder(net, res);
  const order = vertexOrder(input.nodes);
  const adj = new Map([...res].map(([u, row]) => [u, [...row.keys()].sort(order)]));
  const paths: Array<[string[], number]> = [];
  const searches: string[][] = [];
  const phases: DinicPhase[] = [];
  let maxFlow = 0;
  let phase = 0;
  let edgeVisits = 0;

  const flowsOf = () => [...graph].map(([u, row]) => [u, [...row].map(([v, cap]) => [v, Math.max(0, cap - res.get(u)!.get(v)!)] as [string, number])] as [string, Array<[string, number]>]);
  const pushedStrip = () => strip('Pushed', paths.map(([p, b]) => pathToken(p, b)), '(none yet)');
  const emptyStrips = (arcs = '(none)') => [strip('BFS queue', [], '(empty)'), strip('DFS path', [], '(empty)'), strip('Current arcs', [], arcs), pushedStrip()];
  const vars = (...extra: Vars): Vars => [['phase', phase], ['max_flow', maxFlow], ['edge_visits', edgeVisits], ...extra];

  if (source === sink) {
    r.nodeRole.set(source, 'active');
    r.snap(
      0,
      `source == sink (${source}): there is nothing to send. dinic returns 0 before it builds the residual graph, and dinic_flow returns every flow 0, source_side [${source}] and 0 phases.`,
      vars(),
      emptyStrips(),
    );
    return {
      frames: r.frames,
      maxFlow: 0,
      paths,
      residual: [],
      searches,
      cut: { value: 0, source: [source], sink: [] },
      phases,
      edgeVisits: 0,
      flows: flowsOf(),
      sourceSide: [source],
    };
  }

  const firstRows = [...adj].filter(([, row]) => row.length > 1).slice(0, 2);
  r.snap(
    1,
    'Build the residual graph: copy every capacity and give each edge a reverse entry of 0, which a later push can fill so that flow can be cancelled; ' +
      'a reverse edge is drawn dashed once it holds something. Every search tries the residual entries of a vertex in increasing order of the neighbour' +
      (firstRows.length ? ` (${firstRows.map(([u, row]) => `adj[${u}] = [${row.join(', ')}]`).join(', ')})` : '') +
      '. Each pipe fills with its flow, and its label reads flow/capacity.',
    vars(),
    emptyStrips(),
  );

  let level = new Map<string, number>();
  for (;;) {
    phase++;
    // ---------------- _bfs_levels
    level = new Map([[source, 0]]);
    const queue = [source];
    const done = new Set<string>();
    const via = new Map<string, string>();
    r.badges.clear();
    r.badges.set(source, 'lv 0');
    const bfsPaint = (current?: string, fresh: string[] = []) => {
      r.clearRoles();
      for (const v of done) r.nodeRole.set(v, 'done');
      for (const v of queue) r.nodeRole.set(v, 'compare');
      for (const [v, u] of via) r.edgeRole.set(net.entryId(u, v), fresh.includes(v) ? 'active' : 'compare');
      if (current) r.nodeRole.set(current, 'active');
    };
    const bfsStrips = () => [strip('BFS queue', queue, '(empty)'), strip('DFS path', [], '(empty)'), strip('Current arcs', [], '(none)'), pushedStrip()];
    bfsPaint();
    r.snap(
      3,
      `Phase ${phase}: a BFS from ${source} over the entries with room gives every vertex it reaches a level, its distance in residual edges. level[${source}] = 0. The badges show the levels.`,
      vars(),
      bfsStrips(),
    );
    while (queue.length) {
      const u = queue.shift()!;
      const d = level.get(u)!;
      const fresh: string[] = [];
      const skipped: string[] = [];
      for (const v of adj.get(u) ?? []) {
        if (!level.has(v) && res.get(u)!.get(v)! > 0) {
          level.set(v, d + 1);
          via.set(v, u);
          queue.push(v);
          fresh.push(v);
          r.badges.set(v, `lv ${d + 1}`);
        } else {
          skipped.push(skipText(net, res, u, v, level.has(v)).replace(' already reached)', ' has a level)'));
        }
      }
      done.add(u);
      bfsPaint(u, fresh);
      const gave = fresh.length ? `give level ${d + 1} to ${names(fresh)} (room left, no level yet)` : 'no new vertex gets a level';
      r.snap(3, `Dequeue ${u} (level ${d}): ${gave}${skipped.length ? `; skip ${skipped.join(', ')}` : ''}.`, vars(['u', u]), bfsStrips());
    }
    const record: DinicPhase = { level: [...level], searches: [] };
    phases.push(record);
    searches.push([...level.keys()]);

    if (!level.has(sink)) {
      r.clearRoles();
      for (const v of level.keys()) r.nodeRole.set(v, 'done');
      r.snap(
        4,
        `The BFS reached ${setText(input.nodes.filter((n) => level.has(n)))} and not the sink ${sink}: no augmenting path is left. ` +
          `The loop stops after ${plural(phase, 'phase', 'phases')}, this last BFS included, with max_flow = ${maxFlow}.`,
        vars(),
        emptyStrips(),
      );
      break;
    }

    // ---------------- the level graph and the current arcs
    const deeper = (u: string, v: string) => res.get(u)!.get(v)! > 0 && level.get(v) === level.get(u)! + 1;
    const levelGraph: Array<[string, string]> = [];
    for (const u of input.nodes) for (const v of adj.get(u) ?? []) if (level.has(u) && deeper(u, v)) levelGraph.push([u, v]);
    const current = new Map<string, number>([...adj.keys()].map((u) => [u, 0]));
    const passed = new Set<string>();
    for (const [u, row] of adj) for (const v of row) if (!level.has(u) || !deeper(u, v)) passed.add(net.entryId(u, v));
    const dead = new Set<string>();
    const sinkLevel = level.get(sink)!;
    const arcItems = (focus?: string) =>
      input.nodes
        .filter((u) => level.has(u) && u !== sink && (adj.get(u) ?? []).length > 0)
        .map((u) => {
          const row = adj.get(u)!;
          const k = current.get(u)!;
          const role: Role | undefined = u === focus ? 'active' : undefined;
          return { text: k < row.length ? `${u}${ARROW}${row[k]}` : `${u}: end`, role };
        });
    r.clearRoles();
    for (const [u, v] of levelGraph) r.edgeRole.set(net.entryId(u, v), 'compare');
    for (const id of passed) r.edgeRole.set(id, 'muted');
    r.snap(
      5,
      `The sink is at level ${sinkLevel}. The level graph keeps the ${plural(levelGraph.length, 'entry', 'entries')} with room that go one level deeper: ` +
        `${levelGraph.map(([u, v]) => `${u}${ARROW}${v}`).join(', ')}. Every source-to-sink path in it has ${plural(sinkLevel, 'edge', 'edges')}, a shortest augmenting path. ` +
        'Every current arc starts at the first entry of its vertex.',
      vars(),
      [strip('BFS queue', [], '(empty)'), strip('DFS path', [], '(empty)'), strip('Current arcs', arcItems(), '(none)'), pushedStrip()],
    );

    // ---------------- _find_path, then _push, until the source is a dead end
    let search = 0;
    let pushedInPhase = 0;
    for (;;) {
      search++;
      const path = [source];
      let visits = 0;
      const dfsPaint = (stepped?: string) => {
        r.clearRoles();
        for (const id of passed) r.edgeRole.set(id, 'muted');
        for (const v of dead) r.nodeRole.set(v, 'muted');
        path.forEach((v, k) => {
          r.nodeRole.set(v, k === path.length - 1 ? 'active' : 'compare');
          if (k > 0) r.edgeRole.set(net.entryId(path[k - 1], v), 'active');
        });
        if (stepped) r.edgeRole.set(stepped, 'active');
      };
      const dfsStrips = (focus?: string) => [strip('BFS queue', [], '(empty)'), strip('DFS path', path, '(empty)'), strip('Current arcs', arcItems(focus), '(none)'), pushedStrip()];
      const start = search === 1 ? `Search ${search} of phase ${phase} starts at ${source}. ` : `Search ${search} of phase ${phase} starts at ${source} again; every pointer stays where it is. `;
      let found: string[] | null = null;
      let lead = start;
      const take = () => {
        const t = lead;
        lead = '';
        return t;
      };
      while (path.length) {
        const u = path[path.length - 1];
        if (u === sink) {
          found = [...path];
          break;
        }
        const row = adj.get(u)!;
        const d = level.get(u)!;
        const skippedHere: string[] = [];
        let step: string | undefined;
        while (current.get(u)! < row.length) {
          const v = row[current.get(u)!];
          visits++;
          if (deeper(u, v)) {
            step = v;
            break;
          }
          const room = res.get(u)!.get(v)!;
          const lv = level.get(v);
          skippedHere.push(
            room <= 0 ? skipText(net, res, u, v, false) : `${u}${ARROW}${v} (${lv === undefined ? `${v} has no level` : `level ${lv}, not ${d + 1}`})`,
          );
          passed.add(net.entryId(u, v));
          current.set(u, current.get(u)! + 1);
        }
        if (skippedHere.length) {
          dfsPaint();
          const at = current.get(u)!;
          r.snap(
            7,
            `${take()}At ${u}: pass ${skippedHere.join(', ')}: ${skippedHere.length === 1 ? 'it stays' : 'they stay'} useless for the rest of the phase, so current[${u}] = ${at}` +
              (at < row.length ? `, the entry ${u}${ARROW}${row[at]}.` : ', past the last entry.'),
            vars(['u', u], ['visits', visits]),
            dfsStrips(u),
          );
        }
        if (step === undefined) {
          path.pop();
          dead.add(u);
          const back = path[path.length - 1];
          const why = skippedHere.length ? `no entry of ${u} is left` : `the pointer of ${u} is already past its last entry`;
          if (back !== undefined) {
            passed.add(net.entryId(back, u));
            current.set(back, current.get(back)! + 1);
          }
          dfsPaint();
          r.snap(
            9,
            `${take()}At ${u}: ${why}, so ${u} is a dead end for the rest of the phase. ` +
              (back !== undefined ? `Back up to ${back}, whose current arc moves past ${back}${ARROW}${u}.` : '_find_path returns None.'),
            vars(['u', u], ['visits', visits]),
            dfsStrips(back),
          );
          continue;
        }
        path.push(step);
        dfsPaint(net.entryId(u, step));
        r.snap(
          8,
          `${take()}At ${u}: the current arc ${u}${ARROW}${step} has room ${res.get(u)!.get(step)!} and ${step} is at level ${d + 1}: step to ${step}.`,
          vars(['u', u], ['visits', visits]),
          dfsStrips(u),
        );
      }
      edgeVisits += visits;
      if (found === null) {
        record.searches.push({ path: null, visits, pushed: null });
        r.clearRoles();
        for (const id of passed) r.edgeRole.set(id, 'muted');
        for (const v of dead) r.nodeRole.set(v, 'muted');
        r.snap(
          6,
          `The search found no path, so phase ${phase} ends: it pushed ${pushedInPhase} along ${plural(search - 1, 'path', 'paths')}. ` +
            'Every path of its level graph now has a full entry: the flow is blocking, so the next BFS finds the sink at a deeper level or not at all.',
          vars(),
          [strip('BFS queue', [], '(empty)'), strip('DFS path', [], '(empty)'), strip('Current arcs', arcItems(), '(none)'), pushedStrip()],
        );
        break;
      }
      const steps = found.slice(0, -1).map((u, k) => [u, found![k + 1]] as const);
      const { values, b, at } = bottleneckOf(res, found);
      const tight = at.map((k) => `${steps[k][0]}${ARROW}${steps[k][1]}`);
      r.clearRoles();
      for (const id of passed) r.edgeRole.set(id, 'muted');
      for (const v of dead) r.nodeRole.set(v, 'muted');
      found.forEach((v, k) => {
        r.nodeRole.set(v, 'active');
        if (k > 0) r.edgeRole.set(net.entryId(found![k - 1], v), 'active');
      });
      r.snap(
        10,
        `${sink} is the sink: _find_path returns the path ${pathText(found)} after looking at ${plural(visits, 'entry', 'entries')}. ` +
          `bottleneck = min(${values.join(', ')}) = ${b}, set by ${names(tight)}.`,
        vars(['visits', visits], ['bottleneck', b]),
        [strip('BFS queue', [], '(empty)'), strip('DFS path', found, '(empty)'), strip('Current arcs', arcItems(), '(none)'), pushedStrip()],
        { emphasis: at.map((k) => net.entryId(steps[k][0], steps[k][1])) },
      );
      // _push: subtract forward, add backward, and describe what each pipe now carries.
      const changes: string[] = [];
      for (const [u, v] of steps) {
        const before = net.input.edges.map((_, i) => net.flow(res, i));
        res.get(u)!.set(v, res.get(u)!.get(v)! - b);
        res.get(v)!.set(u, res.get(v)!.get(u)! + b);
        const rev = net.edgeIndex(v, u);
        const fwd = net.edgeIndex(u, v);
        if (rev !== undefined && net.flow(res, rev) !== before[rev]) {
          changes.push(`${v}${ARROW}${u} drops to ${net.flow(res, rev)}/${net.input.edges[rev].cap}`);
        }
        if (fwd !== undefined && net.flow(res, fwd) !== before[fwd]) {
          const now = net.flow(res, fwd);
          const cap = net.input.edges[fwd].cap;
          changes.push(`${u}${ARROW}${v} ${now}/${cap}${now === cap ? ' (full)' : ''}`);
        }
      }
      const was = maxFlow;
      maxFlow += b;
      pushedInPhase += b;
      paths.push([found, b]);
      record.searches.push({ path: found, visits, pushed: b });
      r.clearRoles();
      for (const id of passed) r.edgeRole.set(id, 'muted');
      for (const v of dead) r.nodeRole.set(v, 'muted');
      for (const [u, v] of steps) {
        r.edgeRole.set(net.entryId(u, v), 'done');
        r.edgeRole.set(net.entryId(v, u), 'done');
      }
      r.snap(
        11,
        `Push ${b} along ${pathText(found)}: ${changes.join(', ')}. max_flow = ${was} + ${b} = ${maxFlow}.`,
        vars(['bottleneck', b]),
        [strip('BFS queue', [], '(empty)'), strip('DFS path', [], '(empty)'), strip('Current arcs', arcItems(), '(none)'), pushedStrip()],
      );
    }
  }

  const reach = new Set(level.keys());
  const sideS = input.nodes.filter((n) => reach.has(n));
  const sideT = input.nodes.filter((n) => !reach.has(n));
  const sourceSide = [...reach].sort(vertexOrder(input.nodes));
  const cut = cutSummary(net, res, reach, maxFlow);
  r.clearRoles();
  for (const v of sideS) r.nodeRole.set(v, 'done');
  for (const i of cut.forward) r.edgeRole.set(`e${i}`, 'active');
  for (const i of cut.backward) r.edgeRole.set(`e${i}`, 'compare');
  r.snap(
    12,
    `return max_flow = ${maxFlow}, after ${plural(phase, 'phase', 'phases')} and ${plural(edgeVisits, 'entry visit', 'entry visits')}. ` +
      `The last BFS is a minimum cut: S = ${setText(sideS)}, T = ${setText(sideT)}, and dinic_flow returns source_side = [${sourceSide.join(', ')}]. ${cut.text}`,
    vars(['cut', cut.capacity]),
    emptyStrips(),
  );
  return {
    frames: r.frames,
    maxFlow,
    paths,
    residual: residualPairs(res),
    searches,
    cut: { value: maxFlow, source: sideS, sink: sideT },
    phases,
    edgeVisits,
    flows: flowsOf(),
    sourceSide,
  };
}

/** parseFlow plus the frame budget for this tracer. */
export function parseDinic(text: string): FlowInput {
  const input = parseFlow(text);
  const run = dinicTrace(input);
  return checkFrameBudget(input, run.frames.length, run.paths.length);
}
