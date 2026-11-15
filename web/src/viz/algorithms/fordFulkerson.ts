/**
 * Ford-Fulkerson tracer, drawn with FlowNetworkView.
 *
 * Mirrors Algorithms/Graph_Algorithms/Advanced_Graph/Network_Flow/Ford_Fulkerson/Python/ford_fulkerson.py:
 * ford_fulkerson_with_path runs _run, which builds the residual dict (_build_residual), then
 * repeats _find_path (an iterative DFS: a stack of (vertex, iterator over residual[vertex].items())
 * and a parent dict; each vertex resumes its iterator where it stopped) and _augment until no
 * path is left. The run ends with min_cut's set of vertices still reachable from the source.
 * The order in which the DFS tries edges is the dict order, so it follows the order the edges
 * are written in; the golden fixture (__fixtures__/advancedGraph.json) pins every augmenting
 * path, the order in which each DFS reaches vertices, the final residual dict and the cut.
 */
import {
  ARROW,
  bottleneckOf,
  buildResidual,
  checkFrameBudget,
  cutSummary,
  FlowNet,
  FlowRecorder,
  parseFlow,
  pathText,
  pathToken,
  pushStep,
  pythonGraph,
  residualPairs,
  setText,
  skipText,
  stepRoom,
  strip,
  type FlowInput,
  type FlowRun,
  type Vars,
} from './flowNetwork';

export const FORD_FULKERSON_CODE = [
  'if source == sink: return 0, []',
  'residual = _build_residual(graph)        # a copy plus a 0 reverse entry per edge',
  'while True:                              # _find_path: iterative DFS',
  '  parent = {source: None}; stack = [(source, iter(residual[source].items()))]',
  '  while stack: u, neighbors = stack[-1]',
  '    for v, capacity in neighbors:        # resumes where u stopped',
  '      if v not in parent and capacity > 0: parent[v] = u',
  '        if v == sink: return the path (follow parent back from the sink)',
  '        stack.append((v, iter(residual[v].items()))); break',
  '    else: stack.pop()                    # u is a dead end',
  '  if path is None: break                 # no augmenting path is left',
  '  bottleneck = min(residual[u][v] for each step u -> v of the path)',
  '  for u, v on the path: residual[u][v] -= bottleneck; residual[v][u] += bottleneck',
  '  max_flow += bottleneck; paths.append((path, bottleneck))',
  'min_cut: reachable = vertices the source reaches over residual capacity > 0',
];

export function fordFulkersonTrace(input: FlowInput): FlowRun {
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

  if (source === sink) {
    r.nodeRole.set(source, 'active');
    r.snap(
      0,
      `source == sink (${source}): there is nothing to send, so ford_fulkerson_with_path returns (0, []) without building the residual graph (min_cut returns (0, {${source}}, set())).`,
      vars(),
      [strip('DFS stack', [], '(empty)'), pathStrip()],
    );
    return { frames: r.frames, maxFlow: 0, paths, residual: [], searches, cut: { value: 0, source: [source], sink: [] } };
  }

  r.snap(
    1,
    'Build the residual graph: copy every capacity and give each edge a reverse entry of 0. Pushing flow along u' +
      `${ARROW}v later raises v${ARROW}u, so a later path can cancel it; a reverse edge is drawn dashed once it holds something. ` +
      'Each pipe fills with its flow, and its label reads flow/capacity.',
    vars(),
    [strip('DFS stack', [], '(empty)'), pathStrip()],
  );

  // One _find_path call: frames for every DFS step, the path (or null) and the vertices reached.
  const findPath = (): { path: string[] | null; reached: string[] } => {
    const parent = new Map<string, string | null>([[source, null]]);
    const entries = (u: string) => [...(res.get(u) ?? new Map<string, number>())];
    const stack = [{ u: source, list: entries(source), next: 0 }];
    const dead = new Set<string>();
    const stackStrip = () => strip('DFS stack', stack.map((s) => s.u), '(empty)');
    const paint = (taken?: string) => {
      r.clearRoles();
      for (const d of dead) r.nodeRole.set(d, 'muted');
      stack.forEach((s, k) => {
        r.nodeRole.set(s.u, k === stack.length - 1 ? 'active' : 'compare');
        if (k > 0) r.edgeRole.set(net.entryId(stack[k - 1].u, s.u), 'compare');
      });
      if (taken) r.edgeRole.set(taken, 'active');
    };

    paint();
    r.snap(
      3,
      `Round ${round}: look for an augmenting path with a depth-first search from ${source}. parent = {${source}: None} and the stack holds ${source} with an iterator over its residual entries.`,
      vars(),
      [stackStrip(), pathStrip()],
    );
    while (stack.length) {
      const top = stack[stack.length - 1];
      const skipped: string[] = [];
      let found: string | undefined;
      while (top.next < top.list.length) {
        const [v, cap] = top.list[top.next++];
        if (!parent.has(v) && cap > 0) {
          found = v;
          break;
        }
        skipped.push(skipText(net, res, top.u, v, parent.has(v)));
      }
      const skip = skipped.length ? `skip ${skipped.join(', ')}; ` : '';
      if (found === undefined) {
        stack.pop();
        dead.add(top.u);
        paint();
        r.snap(
          9,
          `At ${top.u}: ${skip}no residual entry of ${top.u} is left to try, so ${top.u} is a dead end. Pop it` +
            (stack.length ? ` and resume ${stack[stack.length - 1].u} where it stopped.` : '; the stack is now empty.'),
          vars(['u', top.u]),
          [stackStrip(), pathStrip()],
        );
        continue;
      }
      const v = found;
      parent.set(v, top.u);
      const room = stepRoom(net, res, top.u, v);
      if (v === sink) {
        const path = [sink];
        while (parent.get(path[path.length - 1]) !== null) path.push(parent.get(path[path.length - 1])!);
        path.reverse();
        r.clearRoles();
        path.forEach((p, k) => {
          r.nodeRole.set(p, 'active');
          if (k > 0) r.edgeRole.set(net.entryId(path[k - 1], p), 'active');
        });
        for (const d of dead) r.nodeRole.set(d, 'muted');
        r.snap(
          7,
          `At ${top.u}: ${skip}take ${top.u}${ARROW}${v}: ${room}, and ${v} is the sink. Follow parent back from ${sink}: the augmenting path is ${pathText(path)}.`,
          vars(['u', top.u], ['v', v]),
          [stackStrip(), pathStrip()],
        );
        searches.push([...parent.keys()]);
        return { path, reached: [...parent.keys()] };
      }
      stack.push({ u: v, list: entries(v), next: 0 });
      paint(net.entryId(top.u, v));
      r.snap(
        8,
        `At ${top.u}: ${skip}take ${top.u}${ARROW}${v}: ${room} and ${v} is not reached yet. parent[${v}] = ${top.u}; push ${v} and go deeper.`,
        vars(['u', top.u], ['v', v]),
        [stackStrip(), pathStrip()],
      );
    }
    searches.push([...parent.keys()]);
    return { path: null, reached: [...parent.keys()] };
  };

  for (;;) {
    round++;
    const { path, reached } = findPath();
    if (path === null) {
      r.clearRoles();
      for (const v of reached) r.nodeRole.set(v, 'done');
      r.snap(
        10,
        `_find_path returns None: the DFS reached ${setText(reached)} and never the sink ${sink}. No augmenting path is left, so the loop stops with max_flow = ${maxFlow}.`,
        vars(),
        [strip('DFS stack', [], '(empty)'), pathStrip()],
      );
      round--;
      break;
    }
    const steps = path.slice(0, -1).map((u, k) => [u, path[k + 1]] as const);
    const { values, b, at } = bottleneckOf(res, path);
    const tight = at.map((k) => `${steps[k][0]}${ARROW}${steps[k][1]}`);
    r.snap(
      11,
      `bottleneck = min(${values.join(', ')}) = ${b}: ${tight.join(' and ')} ${tight.length === 1 ? 'has' : 'have'} the least room. ` +
        `Every step can take ${b} more, and no more, so that is what the path carries.`,
      vars(['bottleneck', b]),
      [strip('DFS stack', [], '(empty)'), pathStrip()],
      { emphasis: at.map((k) => net.entryId(steps[k][0], steps[k][1])) },
    );
    for (const [u, v] of steps) {
      const text = pushStep(net, res, u, v, b);
      r.edgeRole.set(net.entryId(u, v), 'done');
      r.edgeRole.set(net.entryId(v, u), 'done');
      r.snap(12, `Push ${b} along ${u}${ARROW}${v}: ${text}`, vars(['u', u], ['v', v], ['bottleneck', b]), [strip('DFS stack', [], '(empty)'), pathStrip()]);
    }
    const before = maxFlow;
    maxFlow += b;
    paths.push([path, b]);
    r.clearRoles();
    r.snap(
      13,
      `max_flow = ${before} + ${b} = ${maxFlow}, and paths records (${pathText(path)}, ${b}). The next round searches the updated residual graph.`,
      vars(['bottleneck', b]),
      [strip('DFS stack', [], '(empty)'), pathStrip()],
    );
  }

  // min_cut: a stack search from the source over positive residual entries, on the final residual graph.
  const reach = new Set([source]);
  const todo = [source];
  while (todo.length) {
    const u = todo.pop()!;
    for (const [v, cap] of res.get(u) ?? new Map<string, number>()) {
      if (!reach.has(v) && cap > 0) {
        reach.add(v);
        todo.push(v);
      }
    }
  }
  const sideS = input.nodes.filter((n) => reach.has(n));
  const sideT = input.nodes.filter((n) => !reach.has(n));
  const cut = cutSummary(net, res, reach, maxFlow);
  r.clearRoles();
  for (const v of sideS) r.nodeRole.set(v, 'done');
  for (const i of cut.forward) r.edgeRole.set(`e${i}`, 'active');
  for (const i of cut.backward) r.edgeRole.set(`e${i}`, 'compare');
  r.snap(
    14,
    `min_cut: the vertices the source still reaches in the final residual graph are S = ${setText(sideS)}, and T = ${setText(sideT)} is the rest. ${cut.text}`,
    vars(['cut', cut.capacity]),
    [strip('DFS stack', [], '(empty)'), pathStrip()],
  );
  return { frames: r.frames, maxFlow, paths, residual: residualPairs(res), searches, cut: { value: maxFlow, source: sideS, sink: sideT } };
}

/** parseFlow plus the frame budget for this tracer. */
export function parseFordFulkerson(text: string): FlowInput {
  const input = parseFlow(text);
  const run = fordFulkersonTrace(input);
  return checkFrameBudget(input, run.frames.length, run.paths.length);
}

