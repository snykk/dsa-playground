/**
 * Edmonds-Karp tracer, drawn with FlowNetworkView.
 *
 * Mirrors edmonds_karp and its inner bfs_find_path in
 * Algorithms/Graph_Algorithms/Advanced_Graph/Network_Flow/Edmonds_Karp/Python/edmonds_karp.py:
 * the same residual dict as Ford-Fulkerson, then a BFS with a deque, a visited set and a parent
 * dict that scans residual[u].items() in dict order. The sink is recognised when it is dequeued
 * (not when it is enqueued), so the vertices queued before it are still expanded. The bottleneck
 * (min_capacity) is computed inside bfs_find_path. edmonds_karp returns only the value; the
 * vertices its last BFS reached are the source side of a minimum cut, which the last frame shows.
 * The golden fixture (__fixtures__/advancedGraph.json) pins every path, the parent dict of every
 * BFS in insertion order and the final residual dict.
 */
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
  pushStep,
  pythonGraph,
  residualPairs,
  setText,
  skipText,
  strip,
  type FlowInput,
  type FlowRun,
  type Vars,
} from './flowNetwork';

export const EDMONDS_KARP_CODE = [
  'if source == sink: return 0',
  'residual = copy of graph, plus residual[v][u] = 0 for every edge u -> v without one',
  'while True:                              # result = bfs_find_path()',
  '  parent = {}; queue = deque([source]); visited = {source}',
  '  while queue: u = queue.popleft()',
  '    if u == sink: path = follow parent back from the sink',
  '      min_capacity = min(residual[u][v] along the path); return path, min_capacity',
  '    for v, capacity in residual.get(u, {}).items():',
  '      if v not in visited and capacity > 0: visited.add(v); parent[v] = u; queue.append(v)',
  '  return None  ->  if not result: break   # the queue ran dry',
  '  for u, v on the path: residual[u][v] -= min_capacity; residual[v][u] += min_capacity',
  '  max_flow += min_capacity',
  'return max_flow',
];

export function edmondsKarpTrace(input: FlowInput): FlowRun {
  const { source, sink } = input;
  const net = new FlowNet(input);
  const res = buildResidual(pythonGraph(input));
  const r = new FlowRecorder(net, res);
  const paths: Array<[string[], number]> = [];
  const searches: string[][] = [];
  let maxFlow = 0;
  let round = 0;
  const pathStrip = () => strip('Paths', paths.map(([p, b]) => pathToken(p, b)), '(none yet)');
  const vars = (...extra: Vars): Vars => [['round', round], ['max_flow', maxFlow], ...extra];
  const idleStrips = () => [strip('Queue', [], '(empty)'), pathStrip()];

  if (source === sink) {
    r.nodeRole.set(source, 'active');
    r.snap(0, `source == sink (${source}): there is nothing to send, so edmonds_karp returns 0 before it builds the residual graph.`, vars(), idleStrips());
    return { frames: r.frames, maxFlow: 0, paths, residual: [], searches, cut: { value: 0, source: [source], sink: [] } };
  }

  r.snap(
    1,
    'Build the residual graph: copy every capacity and give each edge a reverse entry of 0. Pushing flow along u' +
      `${ARROW}v later raises v${ARROW}u, so a later path can cancel it; a reverse edge is drawn dashed once it holds something. ` +
      'Each pipe fills with its flow, and its label reads flow/capacity.',
    vars(),
    idleStrips(),
  );

  // One bfs_find_path call: frames for every dequeue, then the path and min_capacity, or null.
  const bfs = (): { path: string[] | null; min: number; reached: string[] } => {
    const parent = new Map<string, string>();
    const queue = [source];
    const visited = new Set([source]);
    const done = new Set<string>();
    const dist = new Map([[source, 0]]);
    r.badges.clear();
    r.badges.set(source, 'd=0');
    const queueStrip = () => strip('Queue', queue, '(empty)');
    const paint = (current?: string, fresh: string[] = []) => {
      r.clearRoles();
      for (const v of done) r.nodeRole.set(v, 'done');
      for (const v of queue) r.nodeRole.set(v, 'compare');
      for (const [v, u] of parent) r.edgeRole.set(net.entryId(u, v), fresh.includes(v) ? 'active' : 'compare');
      if (current) r.nodeRole.set(current, 'active');
    };

    paint();
    r.snap(
      3,
      `Round ${round}: breadth-first search from ${source}. BFS empties one layer before the next, so the first time it dequeues the sink, the path to it has the fewest edges. Badges show each vertex's layer d.`,
      vars(),
      [queueStrip(), pathStrip()],
    );
    while (queue.length) {
      const u = queue.shift()!;
      if (u === sink) {
        const path: string[] = [];
        for (let v: string | undefined = sink; v !== undefined; v = parent.get(v)) path.push(v);
        path.reverse();
        const { values, b, at } = bottleneckOf(res, path);
        const steps = path.slice(0, -1).map((p, k) => [p, path[k + 1]] as const);
        r.clearRoles();
        for (const v of done) r.nodeRole.set(v, 'done');
        path.forEach((p, k) => {
          r.nodeRole.set(p, 'active');
          if (k > 0) r.edgeRole.set(net.entryId(path[k - 1], p), 'active');
        });
        const tight = at.map((k) => `${steps[k][0]}${ARROW}${steps[k][1]}`);
        r.snap(
          6,
          `Dequeue ${sink}: the sink, in layer ${dist.get(sink)}, so no augmenting path has fewer than ${dist.get(sink)} edges. ` +
            `Follow parent back: ${pathText(path)}. min_capacity = min(${values.join(', ')}) = ${b}, set by ${tight.join(' and ')}.`,
          vars(['u', u], ['min_capacity', b]),
          [queueStrip(), pathStrip()],
          { emphasis: at.map((k) => net.entryId(steps[k][0], steps[k][1])) },
        );
        searches.push([...parent.keys()]);
        return { path, min: b, reached: [...visited] };
      }
      const fresh: string[] = [];
      const skipped: string[] = [];
      for (const [v, cap] of res.get(u) ?? new Map<string, number>()) {
        if (!visited.has(v) && cap > 0) {
          visited.add(v);
          parent.set(v, u);
          queue.push(v);
          dist.set(v, dist.get(u)! + 1);
          r.badges.set(v, `d=${dist.get(v)}`);
          fresh.push(v);
        } else {
          skipped.push(skipText(net, res, u, v, visited.has(v)));
        }
      }
      done.add(u);
      paint(u, fresh);
      const enq = fresh.length
        ? `enqueue ${names(fresh)} in layer ${dist.get(u)! + 1} (positive residual, not visited yet)`
        : 'nothing new to enqueue';
      r.snap(
        fresh.length ? 8 : 7,
        `Dequeue ${u} (layer ${dist.get(u)}) and scan its residual entries: ${enq}${skipped.length ? `; skip ${skipped.join(', ')}` : ''}.`,
        vars(['u', u]),
        [queueStrip(), pathStrip()],
      );
    }
    searches.push([...parent.keys()]);
    return { path: null, min: 0, reached: [...visited] };
  };

  let reached: string[] = [];
  for (;;) {
    round++;
    const result = bfs();
    if (result.path === null) {
      reached = result.reached;
      r.clearRoles();
      for (const v of reached) r.nodeRole.set(v, 'done');
      r.snap(
        9,
        `The queue ran dry and the sink ${sink} was never dequeued: bfs_find_path returns None. BFS reached ${setText(input.nodes.filter((n) => reached.includes(n)))} and nothing else, so no augmenting path is left.`,
        vars(),
        [strip('Queue', [], '(empty)'), pathStrip()],
      );
      round--;
      break;
    }
    const { path, min: b } = result;
    for (let k = 0; k + 1 < path.length; k++) {
      const [u, v] = [path[k], path[k + 1]];
      const text = pushStep(net, res, u, v, b);
      r.edgeRole.set(net.entryId(u, v), 'done');
      r.edgeRole.set(net.entryId(v, u), 'done');
      r.snap(10, `Push ${b} along ${u}${ARROW}${v}: ${text}`, vars(['u', u], ['v', v], ['min_capacity', b]), [strip('Queue', [], '(empty)'), pathStrip()]);
    }
    const before = maxFlow;
    maxFlow += b;
    paths.push([path, b]);
    r.clearRoles();
    r.badges.clear();
    r.snap(
      11,
      `max_flow = ${before} + ${b} = ${maxFlow}. The next BFS runs on the updated residual graph; its shortest path is at least as long as this one, never shorter.`,
      vars(['min_capacity', b]),
      [strip('Queue', [], '(empty)'), pathStrip()],
    );
  }

  const reach = new Set(reached);
  const sideS = input.nodes.filter((n) => reach.has(n));
  const sideT = input.nodes.filter((n) => !reach.has(n));
  const cut = cutSummary(net, res, reach, maxFlow);
  r.clearRoles();
  r.badges.clear();
  for (const v of sideS) r.nodeRole.set(v, 'done');
  for (const i of cut.forward) r.edgeRole.set(`e${i}`, 'active');
  for (const i of cut.backward) r.edgeRole.set(`e${i}`, 'compare');
  r.snap(
    12,
    `return max_flow = ${maxFlow}. edmonds_karp returns only the value, but the last BFS already found a minimum cut: S = ${setText(sideS)}, T = ${setText(sideT)}. ${cut.text}`,
    vars(['cut', cut.capacity]),
    [strip('Queue', [], '(empty)'), pathStrip()],
  );
  return { frames: r.frames, maxFlow, paths, residual: residualPairs(res), searches, cut: { value: maxFlow, source: sideS, sink: sideT } };
}

/** parseFlow plus the frame budget for this tracer. */
export function parseEdmondsKarp(text: string): FlowInput {
  const input = parseFlow(text);
  const run = edmondsKarpTrace(input);
  return checkFrameBudget(input, run.frames.length, run.paths.length);
}
