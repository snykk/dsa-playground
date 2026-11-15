/**
 * DP on graphs tracer: the longest path in a DAG by memoized DFS, drawn with GraphView.
 *
 * Mirrors Algorithms/Dynamic_Programming/Advanced_DP/DP_on_Graphs/Python/graph_dp.py:
 * dag_longest_path(graph, start). dfs(node) returns dp[node] if it is finished, raises
 * ValueError if the node is still on the stack (a reachable cycle), otherwise walks
 * graph.get(node, []) in list order with max_path = max(max_path, dfs(neighbor)) and stores
 * dp[node] = max_path + 1 (nodes on the longest path from node). The answer is dfs(start) - 1
 * edges. A node that is not a key of the graph has no successors.
 * Golden fixtures (__fixtures__/advancedDp.json) pin every call and return in order, and the
 * result or the ValueError.
 *
 * Input: "0->1, 0->2, 1->3, 2->3; start 0" (edges in adjacency order; a bare name is a key with no edges).
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GraphState } from '../renderers/GraphView';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

export interface DagInput {
  /** Edges in input order; graph[u] lists the targets of u's edges in this order. */
  edges: Array<[string, string]>;
  /** Keys of the graph dictionary, in insertion order (sources of edges and bare names). */
  keys: string[];
  /** Every node to draw, in order of first appearance (the start included). */
  nodes: string[];
  start: string;
}

export const DAG_LIMITS = { maxNodes: 10, maxEdges: 20 };

const NAME = /^[A-Za-z0-9]{1,3}$/;

export function parseDag(text: string): DagInput {
  const [edgePart, ...options] = text.split(';');
  const edges: Array<[string, string]> = [];
  const keys: string[] = [];
  const nodes: string[] = [];
  const see = (v: string) => {
    if (!NAME.test(v)) throw new InputError(`Node names are 1 to 3 letters or digits ("${v}" is not).`);
    if (!nodes.includes(v)) nodes.push(v);
  };
  for (const raw of edgePart
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)) {
    const m = raw.match(/^([A-Za-z0-9]+)\s*->\s*([A-Za-z0-9]+)$/);
    if (m) {
      see(m[1]);
      see(m[2]);
      edges.push([m[1], m[2]]);
      if (!keys.includes(m[1])) keys.push(m[1]);
      continue;
    }
    if (NAME.test(raw)) {
      see(raw);
      if (!keys.includes(raw)) keys.push(raw);
      continue;
    }
    throw new InputError(`Cannot read "${raw}". Write directed edges like "0->1", separated by commas, then "; start 0".`);
  }
  let start: string | undefined;
  for (const opt of options.map((o) => o.trim()).filter(Boolean)) {
    const m = opt.match(/^start\s*[:=]?\s*([A-Za-z0-9]+)$/i);
    if (!m) throw new InputError(`Unknown option "${opt}". Use "start 0".`);
    start = m[1];
  }
  if (start === undefined) {
    if (nodes.length === 0) throw new InputError('Enter edges such as "0->1, 1->2" and a start node ("; start 0").');
    start = edges.length ? edges[0][0] : nodes[0];
  }
  see(start);
  if (edges.length > DAG_LIMITS.maxEdges) throw new InputError(`At most ${DAG_LIMITS.maxEdges} edges, please (got ${edges.length}).`);
  if (nodes.length > DAG_LIMITS.maxNodes) throw new InputError(`At most ${DAG_LIMITS.maxNodes} nodes, so the graph stays readable (got ${nodes.length}).`);
  return { edges, keys, nodes, start };
}

export function formatDag(input: DagInput): string {
  const bare = input.keys.filter((k) => !input.edges.some((e) => e[0] === k));
  return `${[...input.edges.map(([a, b]) => `${a}->${b}`), ...bare].join(', ')}; start ${input.start}`;
}

export const DAG_CODE = [
  'dag_longest_path(graph, start):',
  '  on_stack = set(); dp = {}          # dp[v] = nodes on the longest path from v',
  '  def dfs(node):',
  '    if node in dp: return dp[node]    # finished: reuse it',
  '    if node in on_stack: raise ValueError("graph has a cycle: longest path is undefined")',
  '    on_stack.add(node); max_path = 0',
  '    for neighbor in graph.get(node, []):',
  '      max_path = max(max_path, dfs(neighbor))',
  '    on_stack.discard(node)',
  '    dp[node] = max_path + 1',
  '    return dp[node]',
  '  return dfs(start) - 1                # edges, not nodes',
];

export type DagEvent = ['call', string] | ['ret', string, number] | ['raise', string];

export interface DagRun {
  frames: Array<Frame<GraphState>>;
  events: DagEvent[];
  /** Edges on the longest path, or null when ValueError was raised. */
  result: number | null;
  error?: string;
  /** dp in insertion order (finishing order). */
  dp: Array<[string, number]>;
}

const W = 600;
const H = 380;

/**
 * Layers left to right: a DFS (nodes in order of appearance, edges in list order) drops the
 * edges that close a cycle, then every node sits one layer right of its furthest predecessor.
 */
export function dagLayout(input: DagInput): Map<string, { x: number; y: number }> {
  const succ = new Map<string, string[]>(input.nodes.map((v) => [v, []]));
  for (const [a, b] of input.edges) succ.get(a)!.push(b);
  const color = new Map<string, number>();
  const forward: Array<[string, string]> = [];
  const visit = (v: string) => {
    color.set(v, 1);
    for (const w of succ.get(v)!) {
      const c = color.get(w) ?? 0;
      if (c === 1) continue; // back edge (or a self-loop): not used for the layers
      forward.push([v, w]);
      if (c === 0) visit(w);
    }
    color.set(v, 2);
  };
  for (const v of input.nodes) if (!color.has(v)) visit(v);
  const layer = new Map<string, number>(input.nodes.map((v) => [v, 0]));
  for (let round = 0; round < input.nodes.length; round++) {
    for (const [a, b] of forward) layer.set(b, Math.max(layer.get(b)!, layer.get(a)! + 1));
  }
  const layers: string[][] = [];
  for (const v of input.nodes) (layers[layer.get(v)!] ??= []).push(v);
  // One barycentre pass keeps edges short: order each layer by the mean place of its predecessors.
  const place = new Map<string, number>();
  layers.forEach((ls, k) => {
    if (k > 0) {
      const key = (v: string) => {
        const preds = forward.filter(([a, b]) => b === v && place.has(a)).map(([a]) => place.get(a)!);
        return preds.length ? preds.reduce((s, x) => s + x, 0) / preds.length : Infinity;
      };
      ls.sort((a, b) => key(a) - key(b));
    }
    ls.forEach((v, i) => place.set(v, (i + 0.5) / ls.length));
  });
  const L = Math.max(1, layers.length - 1);
  // An edge that skips a layer (or closes a cycle) would run straight through the nodes between
  // its ends, so lone nodes then zig-zag above and below the middle.
  const skips = input.edges.some(([a, b]) => Math.abs(layer.get(a)! - layer.get(b)!) >= 2 || (layer.get(a)! >= layer.get(b)! && a !== b));
  const pos = new Map<string, { x: number; y: number }>();
  const placeAll = (shifts: number[]) => {
    layers.forEach((ls, k) => {
      ls.forEach((v, i) => {
        const x = layers.length === 1 ? W / 2 : 46 + (k * (W - 92)) / L;
        pos.set(v, { x, y: 40 + ((i + 0.5) * (H - 70)) / ls.length + shifts[k] });
      });
    });
  };
  const shifts: number[] = layers.map((ls, k) => (ls.length === 1 ? (skips ? (k % 2 ? 50 : -50) : 0) : k % 2 ? 14 : 0));
  // The zig-zag above is a first guess; then each layer in turn tries other shifts and keeps the
  // one that leaves the most room between every edge and the nodes it does not touch.
  const CLEAR = 30;
  const crowding = () => {
    let total = 0;
    for (const [a, b] of input.edges) {
      const p = pos.get(a)!;
      const q = pos.get(b)!;
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len2 = dx * dx + dy * dy;
      for (const v of input.nodes) {
        if (v === a || v === b || len2 === 0) continue;
        const r = pos.get(v)!;
        const t = Math.max(0, Math.min(1, ((r.x - p.x) * dx + (r.y - p.y) * dy) / len2));
        const d = Math.hypot(r.x - p.x - t * dx, r.y - p.y - t * dy);
        if (d < CLEAR) total += CLEAR - d;
      }
    }
    return total;
  };
  const fits = (k: number, s: number) =>
    layers[k].every((_, i) => {
      const y = 40 + ((i + 0.5) * (H - 70)) / layers[k].length + s;
      return y >= 30 && y <= H - 30;
    });
  placeAll(shifts);
  let best = crowding();
  for (let pass = 0; pass < 4 && best > 0; pass++) {
    for (let k = 0; k < layers.length; k++) {
      for (const s of [-90, -60, -40, -20, 0, 20, 40, 60, 90]) {
        if (s === shifts[k] || !fits(k, s)) continue;
        const keep = shifts[k];
        shifts[k] = s;
        placeAll(shifts);
        const c = crowding();
        if (c < best) best = c;
        else shifts[k] = keep;
      }
    }
    placeAll(shifts);
  }
  placeAll(shifts);
  return pos;
}

export function dagTrace(input: DagInput): DagRun {
  const { edges, nodes, start } = input;
  const graph = new Map<string, string[]>();
  for (const k of input.keys) graph.set(k, []);
  // edge index per (source, position in its list), so the right arrow lights up
  const edgeIds = new Map<string, number[]>();
  edges.forEach(([a, b], i) => {
    graph.get(a)!.push(b);
    edgeIds.set(a, [...(edgeIds.get(a) ?? []), i]);
  });
  const pos = dagLayout(input);
  const frames: Array<Frame<GraphState>> = [];
  const events: DagEvent[] = [];
  const dp = new Map<string, number>();
  const onStack: string[] = [];
  const maxPath = new Map<string, number>();
  const used = new Set<number>();

  interface Look {
    nodes?: Record<string, Role>;
    edges?: Record<number, Role>;
  }
  const snap = (line: number | undefined, caption: string, look: Look = {}, vars: Array<[string, string | number]> = []) => {
    const top = onStack[onStack.length - 1];
    const stackItems: StripItem[] = onStack.map((v) => ({ text: `dfs(${v})`, role: v === top ? 'active' : 'compare' }));
    const dpItems: StripItem[] = [...dp].map(([v, d]) => ({ text: `${v}: ${d}` }));
    frames.push({
      line,
      caption,
      vars: [...vars, ['finished', dp.size]],
      state: {
        nodes: nodes.map((v) => ({
          id: v,
          ...pos.get(v)!,
          role: look.nodes?.[v] ?? (v === top ? 'active' : onStack.includes(v) ? 'compare' : dp.has(v) ? 'done' : 'idle'),
          badge: dp.has(v) ? `dp ${dp.get(v)}` : maxPath.has(v) ? `max ${maxPath.get(v)}` : undefined,
        })),
        edges: edges.map(([a, b], i) => ({ id: i, from: a, to: b, directed: true, weight: 1, role: look.edges?.[i] ?? (used.has(i) ? 'done' : 'idle') })),
        showWeights: false,
        strips: [
          { label: 'on_stack (open calls)', items: stackItems.length ? stackItems : [{ text: SYM.emptySet, role: 'muted' }] },
          { label: 'dp, in finishing order', items: dpItems.length ? dpItems : [{ text: SYM.emptySet, role: 'muted' }] },
        ],
      },
    });
  };

  snap(
    1,
    `dp = {} and on_stack = set(). dp[v] will be the number of nodes on the longest path that starts at v; on_stack holds the nodes whose call is still running. Call dfs(${start}).`,
    { nodes: { [start]: 'compare' } },
    [['start', start]],
  );

  class Cycle extends Error {}
  /** `via` is the edge index that led here, or null for the first call. */
  const dfs = (node: string, via: number | null): number => {
    events.push(['call', node]);
    const from = via === null ? '' : `Follow edge ${edges[via][0]}->${node}: `;
    if (dp.has(node)) {
      const v = dp.get(node)!;
      events.push(['ret', node, v]);
      snap(
        3,
        `${from}${node} is finished, dp[${node}] = ${v}: return it without walking ${node}'s successors again. A node reached by several paths is solved once, which keeps the work O(V + E).`,
        { nodes: { [node]: 'good' }, edges: via === null ? {} : { [via]: 'compare' } },
        [
          ['node', node],
          ['dp[node]', v],
        ],
      );
      return v;
    }
    if (onStack.includes(node)) {
      events.push(['raise', node]);
      const loop = onStack.slice(onStack.indexOf(node));
      const roles: Record<string, Role> = {};
      for (const v of loop) roles[v] = 'bad';
      snap(
        4,
        `${from}${node} is on the stack: its call has not finished, so this edge leads back into the current path (${[...loop, node].join(' -> ')}). That is a cycle, and a longest path along a cycle is undefined: raise ValueError.`,
        { nodes: roles, edges: via === null ? {} : { [via]: 'active' } },
        [
          ['node', node],
          ['on_stack', `{${onStack.join(', ')}}`],
        ],
      );
      throw new Cycle();
    }
    onStack.push(node);
    maxPath.set(node, 0);
    const succ = graph.get(node);
    snap(
      5,
      `${from}dfs(${node}): not finished and not on the stack, so add it to on_stack and set max_path = 0. ` +
        (succ === undefined
          ? `${node} is not a key of the graph: graph.get(${node}, []) is empty, so it is a sink.`
          : succ.length === 0
            ? `graph[${node}] is empty: a sink.`
            : `Its successors, in list order: ${succ.join(', ')}.`),
      { edges: via === null ? {} : { [via]: 'active' } },
      [
        ['node', node],
        ['max_path', 0],
      ],
    );
    (succ ?? []).forEach((w, k) => {
      const id = edgeIds.get(node)![k];
      const got = dfs(w, id);
      used.add(id);
      const before = maxPath.get(node)!;
      const after = Math.max(before, got);
      maxPath.set(node, after);
      snap(
        7,
        `Back in ${node}: dfs(${w}) returned ${got}, so max_path = max(${before}, ${got}) = ${after}` + (got > before ? ': the longest path so far goes through ' + w + '.' : '.'),
        { nodes: { [w]: 'compare' }, edges: { [id]: 'compare' } },
        [
          ['node', node],
          ['neighbor', w],
          ['dfs(neighbor)', got],
          ['max_path', after],
        ],
      );
    });
    const best = maxPath.get(node)!;
    onStack.splice(onStack.lastIndexOf(node), 1);
    maxPath.delete(node);
    dp.set(node, best + 1);
    events.push(['ret', node, best + 1]);
    snap(
      9,
      `${node} has no successor left: take it off the stack and store dp[${node}] = max_path + 1 = ${best + 1} (${node} itself plus the longest path after it). Return ${best + 1}.`,
      { nodes: { [node]: 'done' } },
      [
        ['node', node],
        ['dp[node]', best + 1],
      ],
    );
    return best + 1;
  };

  try {
    const total = dfs(start, null);
    const result = total - 1;
    // One longest path, read back from dp (the code returns only its length).
    const path = [start];
    // Only the path keeps a colour at the end; the other edges go back to grey.
    const pathEdges: Record<number, Role> = Object.fromEntries(edges.map((_, i) => [i, 'idle' as Role]));
    let v = start;
    while (dp.get(v)! > 1) {
      const k = graph.get(v)!.findIndex((w) => dp.get(w) === dp.get(v)! - 1);
      const id = edgeIds.get(v)![k];
      pathEdges[id] = 'done';
      v = graph.get(v)![k];
      path.push(v);
    }
    const roles: Record<string, Role> = {};
    for (const n of nodes) roles[n] = path.includes(n) ? 'good' : dp.has(n) ? 'idle' : 'muted';
    snap(
      11,
      `dfs(${start}) = ${total} node${total === 1 ? '' : 's'}, so the longest path from ${start} has ${total} - 1 = ${result} edge${result === 1 ? '' : 's'}. ` +
        `One such path, read back from dp (the code returns only the length): ${path.join(' -> ')}.` +
        (dp.size < nodes.length ? ` Nodes not reachable from ${start} were never visited.` : ''),
      { nodes: roles, edges: pathEdges },
      [['result', result]],
    );
    return { frames, events, result, dp: [...dp] };
  } catch (err) {
    if (!(err instanceof Cycle)) throw err;
    const roles: Record<string, Role> = {};
    for (const n of nodes) roles[n] = onStack.includes(n) ? 'bad' : dp.has(n) ? 'done' : 'idle';
    snap(
      undefined,
      `ValueError("graph has a cycle: longest path is undefined") propagates out of every open call (${onStack.join(', ')}), so dag_longest_path raises instead of returning a wrong length.`,
      { nodes: roles },
      [['raises', 'ValueError']],
    );
    return { frames, events, result: null, error: 'graph has a cycle: longest path is undefined', dp: [...dp] };
  }
}

/** Brute force for the tests: the longest simple path from start by trying every path, or null if a cycle is reachable. */
export function dagBrute(input: DagInput): number | null {
  const succ = new Map<string, string[]>();
  for (const [a, b] of input.edges) succ.set(a, [...(succ.get(a) ?? []), b]);
  // a reachable cycle?
  const color = new Map<string, number>();
  let cyclic = false;
  const visit = (v: string) => {
    color.set(v, 1);
    for (const w of succ.get(v) ?? []) {
      if (color.get(w) === 1) cyclic = true;
      else if (!color.has(w)) visit(w);
    }
    color.set(v, 2);
  };
  visit(input.start);
  if (cyclic) return null;
  let best = 0;
  const walk = (v: string, len: number) => {
    best = Math.max(best, len);
    for (const w of succ.get(v) ?? []) walk(w, len + 1);
  };
  walk(input.start, 0);
  return best;
}
