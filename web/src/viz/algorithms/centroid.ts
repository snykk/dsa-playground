/**
 * Centroid decomposition tracer, drawn with RootedTreeView: the tree (removed centroids fade,
 * the current piece is highlighted with its subtree sizes) beside the centroid tree it builds.
 *
 * Mirrors Algorithms/Advanced_Algorithms/Specialized_Techniques/Centroid_Decomposition/Python/
 * centroid_decomposition.py: CentroidDecomposition.build / decompose / dfs_size / find_centroid /
 * get_centroid_tree. build(root=0) resets removed and parent and calls decompose(root, -1).
 * decompose(u, p): total = dfs_size(u, -1), which walks the piece breadth-first from u over nodes
 * that are not removed (size 1 each, in visiting order) and then adds each size to its parent in
 * reverse; find_centroid(u, -1, total) starts at u and moves to the first neighbour, in adjacency
 * order, that is not where it came from, not removed and has size > total // 2, until there is
 * none. The centroid is removed, parent[centroid] = p, and decompose recurses on every neighbour
 * that is still not removed, in adjacency order (the recursion is only O(log n) deep).
 * get_centroid_tree() turns the parent array into an adjacency list, node by node.
 * Golden fixtures (__fixtures__/specializedTechniques.json) pin every decompose call, the sizes
 * it writes and reads, the centroid it picks, the parent array and the centroid tree.
 *
 * Input: "0-1 0-2 1-3 1-4 2-5 4-6"   (an optional "; root 4" for build(4); "n 1" for one node)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { RootedTreeState, RtEdge, RtNode, RtPill } from '../renderers/RootedTreeView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { adjacency, hang, listText, parseTreeShape, readRoot, splitTreeScript, type TreeShape } from './heavyLight';

export interface CentroidInput extends TreeShape {
  root: number;
}

const CENTROID_EXAMPLE = '0-1 0-2 1-3 1-4 2-5 4-6; root 0';

export function parseCentroid(text: string): CentroidInput {
  const { head, segments } = splitTreeScript(text);
  const shape = parseTreeShape(head);
  const { root, rest } = readRoot(segments, shape.n, CENTROID_EXAMPLE);
  if (rest.length) throw new InputError(`Cannot read "${rest[0]}". After the edges, only "root r" may follow (build(r) decomposes the whole tree; the code has no queries), as in "${CENTROID_EXAMPLE}".`);
  return { ...shape, root };
}

export const CENTROID_CODE = [
  'build(root=0): removed = [False] * n; parent = [-1] * n; decompose(root, -1)',
  'decompose(u, p): total = dfs_size(u, -1)',
  '  centroid = find_centroid(u, -1, total)',
  '  removed[centroid] = True; parent[centroid] = p',
  '  for v in adj[centroid]: if not removed[v]: decompose(v, centroid)',
  'dfs_size(u, p): order = [u]; par = {u: p}            # breadth-first over the piece',
  '  for x in order: size[x] = 1; for v in adj[x]: if v != par[x] and not removed[v]: par[v] = x; order.append(v)',
  '  for x in reversed(order[1:]): size[par[x]] += size[x]',
  '  return size[u]',
  'find_centroid(u, p, total): while True:',
  '    for v in adj[u]: if v != p and not removed[v] and size[v] > total // 2: p, u = u, v; break',
  '    else: return u                                  # no side has more than half',
  'get_centroid_tree(): for i with parent[i] != -1: tree[parent[i]].append(i); tree[i].append(parent[i])',
];

export interface CentroidCall {
  u: number;
  p: number;
  total: number;
  sizeWrites: Array<[number, number]>;
  sizeReads: number[];
  centroid: number;
}

export interface CentroidRun {
  frames: Array<Frame<RootedTreeState>>;
  calls: CentroidCall[];
  parent: number[];
  tree: number[][];
}

/** The repository algorithm, recorded call by call (no frames). */
function decomposeAll(n: number, adj: number[][], root: number): { calls: CentroidCall[]; parent: number[]; orders: number[][]; walks: number[][] } {
  const size = new Array(n).fill(0);
  const removed = new Array(n).fill(false);
  const parent = new Array(n).fill(-1);
  const calls: CentroidCall[] = [];
  const orders: number[][] = [];
  const walks: number[][] = [];
  const decompose = (u: number, p: number) => {
    const call: CentroidCall = { u, p, total: 0, sizeWrites: [], sizeReads: [], centroid: -1 };
    calls.push(call);
    // dfs_size(u, -1)
    const order = [u];
    const par = new Map<number, number>([[u, -1]]);
    for (let i = 0; i < order.length; i++) {
      const x = order[i];
      size[x] = 1;
      call.sizeWrites.push([x, 1]);
      for (const v of adj[x]) {
        if (v !== par.get(x) && !removed[v]) {
          par.set(v, x);
          order.push(v);
        }
      }
    }
    for (const x of order.slice(1).reverse()) {
      const px = par.get(x)!;
      size[px] += size[x];
      call.sizeWrites.push([px, size[px]]);
    }
    call.total = size[u];
    orders.push(order);
    // find_centroid(u, -1, total)
    let at = u;
    let from = -1;
    const walk = [at];
    for (;;) {
      let next = -1;
      for (const v of adj[at]) {
        if (v !== from && !removed[v]) {
          call.sizeReads.push(v);
          if (size[v] > Math.floor(call.total / 2)) {
            next = v;
            break;
          }
        }
      }
      if (next < 0) break;
      from = at;
      at = next;
      walk.push(at);
    }
    walks.push(walk);
    call.centroid = at;
    removed[at] = true;
    parent[at] = p;
    for (const v of adj[at]) if (!removed[v]) decompose(v, at);
  };
  decompose(root, -1);
  return { calls, parent, orders, walks };
}

/** get_centroid_tree(): node by node, an edge to its parent in both directions. */
export function centroidTree(parent: number[]): number[][] {
  const tree: number[][] = parent.map(() => []);
  parent.forEach((p, i) => {
    if (p !== -1) {
      tree[p].push(i);
      tree[i].push(p);
    }
  });
  return tree;
}

interface SnapOpts {
  roles?: Record<number, Role>;
  ctRoles?: Record<number, Role>;
  edgeRoles?: Record<number, Role>;
  badges?: Record<number, number>;
  /** The centroid tree node that sits on top of its original vertex this frame (it flies across next). */
  lifting?: number;
  pills?: Array<{ name: string; node: number; role?: Role }>;
  strips?: StripData[];
  vars?: Array<[string, string | number]>;
  note?: string;
}

export function centroidTrace(input: CentroidInput): CentroidRun {
  const { n, edges, root } = input;
  const adj = adjacency(n, edges);
  const drawn = hang(n, adj, root);
  const plan = decomposeAll(n, adj, root);
  const finalParent = plan.parent;
  // The centroid tree, children in the order the recursion attaches them.
  const ctChildren: number[][] = Array.from({ length: n }, () => []);
  for (const c of plan.calls) if (c.p !== -1) ctChildren[c.p].push(c.centroid);
  const ctRoot = plan.calls[0].centroid;
  const ctDepth = new Array(n).fill(0);
  for (const c of plan.calls) ctDepth[c.centroid] = c.p === -1 ? 1 : ctDepth[c.p] + 1;
  const levels = Math.max(...ctDepth);
  const log2 = Math.floor(Math.log2(n)) + 1;

  const removed = new Array(n).fill(false);
  const parent = new Array(n).fill(-1);
  const size = new Array(n).fill(0);
  const frames: Array<Frame<RootedTreeState>> = [];
  const stack: string[] = [];

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const nodes: RtNode[] = Array.from({ length: n }, (_, u) => ({
      id: String(u),
      label: String(u),
      children: drawn.children[u].map(String),
      role: removed[u] ? 'muted' : (o.roles?.[u] ?? 'idle'),
      removed: removed[u],
      badge: o.badges?.[u] !== undefined ? String(o.badges[u]) : undefined,
    }));
    const edgeMap: Record<string, RtEdge> = {};
    for (let c = 0; c < n; c++) {
      const p = drawn.parent[c];
      if (p < 0) continue;
      edgeMap[String(c)] = removed[c] || removed[p] ? { kind: 'cut' } : { role: o.edgeRoles?.[c] };
    }
    const ctNodes: RtNode[] = Array.from({ length: n }, (_, u) => ({
      id: String(u),
      label: String(u),
      children: ctChildren[u].map(String),
      role: o.ctRoles?.[u] ?? 'done',
      hidden: !removed[u],
      from: o.lifting === u ? `t/${u}` : undefined,
    }));
    const pills: RtPill[] = (o.pills ?? []).map((p) => ({ name: p.name, at: `t/${p.node}`, role: p.role, side: 'left' }));
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['parent', listText(parent)], ['removed', removed.map((r, i) => (r ? i : null)).filter((x) => x !== null).join(', ') || '-']],
      state: {
        label: `Tree of ${n} node${n === 1 ? '' : 's'} with ${removed.filter(Boolean).length} centroid${removed.filter(Boolean).length === 1 ? '' : 's'} removed, beside the centroid tree`,
        trees: [
          { id: 't', title: `tree (build root ${root})`, root: String(root), nodes, edges: edgeMap },
          { id: 'c', title: 'centroid tree', root: String(ctRoot), nodes: ctNodes },
        ],
        pills,
        note: o.note,
        strips: [{ label: 'call stack', items: stack.length ? stack.map((s, i): StripItem => ({ text: s, role: i === stack.length - 1 ? 'active' : undefined })) : [{ text: 'empty' }] }, ...(o.strips ?? [])],
      },
    });
  };

  snap(
    0,
    `build(${root}): every node starts not removed with parent -1, then decompose(${root}, -1) splits the whole tree. ` +
      `Each call finds the centroid of its piece, removes it and recurses on what is left, so every piece is at most half the size of the one before.`,
    { roles: { [root]: 'active' } },
  );

  let k = 0;
  const run = (u: number, p: number, skipped: number[]) => {
    const idx = k++;
    const call = plan.calls[idx];
    if (call.u !== u || call.p !== p) throw new Error('centroid trace disagrees with its own plan');
    const order = plan.orders[idx];
    const walk = plan.walks[idx];
    stack.push(`decompose(${u}, ${p})`);
    const piece: Record<number, Role> = {};
    for (const x of order) piece[x] = 'compare';
    const ones: Record<number, number> = {};
    for (const x of order) ones[x] = 1;
    snap(
      5,
      (p === -1 ? `decompose(${u}, -1): the first piece is the whole tree. ` : `decompose(${u}, ${p}): ${u} is a neighbour of the centroid ${p} that is still in the tree${skipped.length ? ` (${skipped.join(', ')} ${skipped.length === 1 ? 'is' : 'are'} removed, so skipped)` : ''}, so it starts a new piece. `) +
        `dfs_size walks breadth-first from ${u} over nodes not yet removed: order = [${order.join(', ')}], and each gets size 1.`,
      { roles: { ...piece, [u]: 'active' }, badges: ones, strips: [{ label: 'order', items: order.map((x): StripItem => ({ text: String(x) })) }], vars: [['u', u], ['p', p]] },
    );
    for (const [x, v] of call.sizeWrites) size[x] = v;
    const sizes: Record<number, number> = {};
    for (const x of order) sizes[x] = size[x];
    const half = Math.floor(call.total / 2);
    snap(
      7,
      order.length === 1
        ? `The piece is the single node ${u}: total = 1.`
        : `In reverse order every node adds its size to the node it was reached from (the piece hangs from ${u}): total = size[${u}] = ${call.total}. A centroid leaves no side with more than total // 2 = ${half} nodes.`,
      { roles: { ...piece, [u]: 'active' }, badges: sizes, vars: [['u', u], ['total', call.total], ['total // 2', half]] },
    );
    // find_centroid: one frame per step of the walk.
    for (let s = 1; s < walk.length; s++) {
      const from = walk[s - 1];
      const to = walk[s];
      snap(
        10,
        `At ${from}: neighbour ${to} has size[${to}] = ${size[to]} > ${half}, so more than half of the piece lies on ${to}'s side and the centroid must be there too. Move to ${to}.`,
        {
          roles: { ...piece, [from]: 'compare', [to]: 'active' },
          edgeRoles: { [drawn.parent[to] === from ? to : from]: 'active' },
          badges: sizes,
          pills: [{ name: 'u', node: to, role: 'active' }],
          vars: [['u', to], ['p', from], ['total', call.total]],
        },
      );
    }
    const c = call.centroid;
    const came = walk.length > 1 ? walk[walk.length - 2] : -1;
    const sides = adj[c].filter((v) => !removed[v] && v !== came);
    const rest = call.total - 1 - sides.reduce((s, v) => s + size[v], 0);
    snap(
      11,
      (sides.length
        ? `At ${c}: ${sides.map((v) => `size[${v}] = ${size[v]}`).join(', ')} ${sides.length === 1 ? 'is' : 'are all'} at most ${half}`
        : `At ${c}: no neighbour is left to move to`) +
        (came >= 0 ? `, and the side we came from has ${rest} node${rest === 1 ? '' : 's'}, also at most ${half} (that is why the walk never turns back)` : '') +
        `. ${c} is the centroid of this piece.`,
      { roles: { ...piece, [c]: 'good' }, badges: sizes, pills: [{ name: 'u', node: c, role: 'active' }], vars: [['centroid', c], ['total', call.total]] },
    );
    removed[c] = true;
    parent[c] = p;
    const left = adj[c].filter((v) => !removed[v]);
    snap(
      3,
      `removed[${c}] = True and parent[${c}] = ${p}: ${c} joins the centroid tree ${p === -1 ? 'as its root' : `under ${p}`}. ` +
        (left.length ? `Removing it splits the piece into ${left.length} part${left.length === 1 ? '' : 's'}, one per neighbour still present (${left.join(', ')}), each of at most ${half} node${half === 1 ? '' : 's'}.` : 'No neighbour is left in the tree, so this call has nothing to recurse on.'),
      { ctRoles: { [c]: 'good' }, lifting: c, vars: [['centroid', c], ['parent[centroid]', p]] },
    );
    let skippedNow: number[] = [];
    for (const v of adj[c]) {
      if (removed[v]) {
        skippedNow.push(v);
        continue;
      }
      run(v, c, skippedNow);
      skippedNow = [];
    }
    stack.pop();
  };
  run(root, -1, []);

  const tree = centroidTree(parent);
  const ctRoles: Record<number, Role> = {};
  for (let i = 0; i < n; i++) ctRoles[i] = 'done';
  snap(
    12,
    `Every node is removed: the parent array ${listText(parent)} is the centroid tree, rooted at ${ctRoot}. It has ${levels} level${levels === 1 ? '' : 's'} for ${n} node${n === 1 ? '' : 's'}, ` +
      `within floor(log2 ${n}) + 1 = ${log2}, because each level at least halves the pieces. get_centroid_tree() returns it as an adjacency list.`,
    {
      ctRoles,
      strips: [{ label: 'get_centroid_tree()', items: tree.map((nb, i): StripItem => ({ text: `${i}: ${listText(nb)}` })) }],
      vars: [['levels', levels], ['floor(log2 n) + 1', log2]],
    },
  );
  if (parent.some((x, i) => x !== finalParent[i])) throw new Error('centroid trace disagrees with its own plan');
  return { frames, calls: plan.calls, parent, tree };
}
