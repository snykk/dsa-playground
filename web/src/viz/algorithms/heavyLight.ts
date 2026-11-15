/**
 * Heavy-light decomposition tracer, drawn with RootedTreeView: the tree with its subtree sizes,
 * heavy edges (thick) and chains (shaded tubes), and the position array underneath.
 *
 * Mirrors Algorithms/Advanced_Algorithms/Specialized_Techniques/Heavy_Light_Decomposition/Python/
 * heavy_light_decomposition.py: HLD.__init__ / build / dfs_size / decompose / lca / query_path.
 * build(root=0) resets parent, depth, size, heavy and cur_pos, then:
 * dfs_size walks the tree breadth-first (order = [root]; each u gets size 1 and appends its
 * neighbours other than parent[u]), adds every size to its parent in reversed order, and gives
 * each node the first child in adjacency order with the strictly largest size as heavy[u];
 * decompose pops (u, head) from an explicit stack, sets head[u] and pos[u] = cur_pos, pushes the
 * light children in reversed adjacency order as (v, v) and the heavy child last as (heavy, head),
 * so the heavy child is numbered next (a pre-order, heavy child first).
 * lca and query_path climb while head[u] != head[v]: when depth[head[u]] < depth[head[v]] they
 * swap, then u jumps to parent[head[u]] (query_path first records (pos[head[u]], pos[u])); on the
 * last chain they swap so that u is the shallower node, and query_path records (pos[u], pos[v]).
 * A node id outside 0..n-1 raises IndexError at head[...] before anything else.
 * Golden fixtures (__fixtures__/specializedTechniques.json) pin every array after build, the
 * order the sizes are written and the positions handed out, and every result.
 *
 * Input: "0-1 0-2 1-3 1-4 2-5 4-6; lca 3 6, path 3 6"   (an optional "root 4" first; "n 1" for one node)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { RootedTreeState, RtChain, RtEdge, RtNode, RtPill } from '../renderers/RootedTreeView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { parseCall, scriptSegments } from './hashTable';
import { opStrip } from './segmentTree';

/* ---------- the tree script shared with the centroid decomposition ---------- */

export const TREE_LIMITS = { maxNodes: 16, maxOps: 8, maxId: 99 };

export interface TreeShape {
  n: number;
  /** In input order: adj[u] lists the neighbours in the order their edges were given, as the Python tests build it. */
  edges: Array<[number, number]>;
}

/** adj[u] in the order the edges are listed: edge (u, v) appends v to adj[u] and u to adj[v]. */
export function adjacency(n: number, edges: Array<[number, number]>): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  return adj;
}

/** "0-1 0-2 1-3" (commas allowed), or "n 1" for the tree with one node. Checks that the edges form one tree on 0..n-1. */
export function parseTreeShape(head: string): TreeShape {
  const body = head.replace(/^(?:edges?|tree)\s*[:=]?\s*/i, '').trim();
  const single = body.match(/^n\s*[:=]?\s*(\d+)$/i);
  if (single) {
    if (Number(single[1]) !== 1) throw new InputError(`"n ${single[1]}" without edges is not a tree: list the ${Number(single[1]) - 1} edges, as in "0-1 1-2", or write "n 1" for one node.`);
    return { n: 1, edges: [] };
  }
  if (!body) throw new InputError('Start with the edges of the tree, as in "0-1 0-2 1-3; ...", or "n 1" for a tree with one node.');
  const edges: Array<[number, number]> = [];
  for (const token of body.replace(/\s*-\s*/g, '-').split(/[\s,]+/).filter(Boolean)) {
    const m = token.match(/^(\d+)-(\d+)$/);
    if (!m) throw new InputError(`Cannot read "${token}". Write each edge as two node numbers joined by a dash, for example 0-1.`);
    const u = Number(m[1]);
    const v = Number(m[2]);
    if (Math.max(u, v) >= TREE_LIMITS.maxNodes) throw new InputError(`Nodes are numbered 0 to ${TREE_LIMITS.maxNodes - 1}, so the tree fits on screen (got ${Math.max(u, v)} in ${token}).`);
    if (u === v) throw new InputError(`${token} joins node ${u} to itself; a tree has no such edge.`);
    if (edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u))) throw new InputError(`The edge ${u}-${v} appears twice.`);
    edges.push([u, v]);
  }
  const n = 1 + Math.max(...edges.flat());
  // Union-find: an edge between two nodes that are already connected closes a cycle.
  const root = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (root[x] === x ? x : (root[x] = find(root[x])));
  for (const [u, v] of edges) {
    const a = find(u);
    const b = find(v);
    if (a === b) throw new InputError(`The edge ${u}-${v} closes a cycle: ${u} and ${v} are already connected, and a tree has exactly one path between two nodes.`);
    root[a] = b;
  }
  for (let x = 1; x < n; x++) {
    if (find(x) !== find(0)) throw new InputError(`Node ${x} is not connected to node 0: the edges must form one tree on the nodes 0 to ${n - 1} (n - 1 = ${n - 1} edges, no gaps in the numbering).`);
  }
  return { n, edges };
}

/** "root 4" anywhere before the operations: the argument of build(root). */
export function parseRoot(segment: string): number | undefined {
  const m = segment.match(/^(?:root|build)\s*[:=(]?\s*(\d+)\s*\)?$/i);
  return m ? Number(m[1]) : undefined;
}

/** Split a script into the tree (before the first semicolon or new line) and the segments after it. */
export function splitTreeScript(text: string): { head: string; segments: string[] } {
  const cut = text.search(/[;\n]/);
  return { head: (cut < 0 ? text : text.slice(0, cut)).trim(), segments: scriptSegments(cut < 0 ? '' : text.slice(cut + 1)) };
}

/** Read "root r", checking it is a node, the way build(root) needs it. */
export function readRoot(segments: string[], n: number, example: string): { root: number; rest: string[] } {
  let root = 0;
  const rest: string[] = [];
  let seen = false;
  for (const s of segments) {
    const r = parseRoot(s);
    if (r === undefined) {
      rest.push(s);
      continue;
    }
    if (seen) throw new InputError('Give the root ("root 2") only once.');
    if (rest.length) throw new InputError(`Put "root ${r}" first, before the operations: build(root) runs before any query (as in "${example}").`);
    if (r >= n) throw new InputError(`build(${r}) would raise IndexError: the tree has nodes 0 to ${n - 1}.`);
    seen = true;
    root = r;
  }
  return { root, rest };
}

/** The tree drawn hanging from `root`: parent and children (in adjacency order) from a breadth-first walk. */
export function hang(n: number, adj: number[][], root: number): { parent: number[]; children: number[][]; depth: number[] } {
  const parent = new Array(n).fill(-1);
  const depth = new Array(n).fill(0);
  const children: number[][] = Array.from({ length: n }, () => []);
  const order = [root];
  const seen = new Set([root]);
  for (let i = 0; i < order.length; i++) {
    const u = order[i];
    for (const v of adj[u]) {
      if (seen.has(v)) continue;
      seen.add(v);
      parent[v] = u;
      depth[v] = depth[u] + 1;
      children[u].push(v);
      order.push(v);
    }
  }
  return { parent, children, depth };
}

export const listText = (xs: number[]) => `[${xs.join(', ')}]`;

/* ---------- input ---------- */

export type HldOp = { kind: 'lca' | 'path'; u: number; v: number };

export interface HldInput extends TreeShape {
  root: number;
  ops: HldOp[];
}

const HLD_NAMES: Record<string, HldOp['kind']> = { lca: 'lca', path: 'path', query_path: 'path', querypath: 'path', qp: 'path' };
const HLD_EXAMPLE = '0-1 0-2 1-3 1-4 2-5 4-6; lca 3 6, path 3 6';

export function parseHld(text: string): HldInput {
  const { head, segments } = splitTreeScript(text);
  const shape = parseTreeShape(head);
  const { root, rest } = readRoot(segments, shape.n, HLD_EXAMPLE);
  const ops = rest.map((segment): HldOp => {
    const call = parseCall(segment);
    const kind = call && HLD_NAMES[call.name];
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write operations like "lca 3 6" or "path 3 6", separated by commas, after the edges and a semicolon.`);
    if (call.args.length !== 2) throw new InputError(`"${segment}": ${kind} takes two nodes, as in "${kind} 3 6".`);
    const [u, v] = call.args.map((a) => {
      if (!/^\d+$/.test(a)) throw new InputError(`"${segment}": "${a}" is not a node number (nodes are 0, 1, 2, ...).`);
      const x = Number(a);
      if (x > TREE_LIMITS.maxId) throw new InputError(`"${segment}": node numbers go up to ${TREE_LIMITS.maxId} here (got ${a}).`);
      return x;
    });
    return { kind, u, v };
  });
  if (ops.length > TREE_LIMITS.maxOps) throw new InputError(`At most ${TREE_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  return { ...shape, root, ops };
}

export function formatHldOp(op: HldOp): string {
  return op.kind === 'lca' ? `lca(${op.u}, ${op.v})` : `query_path(${op.u}, ${op.v})`;
}

/* ---------- pseudocode ---------- */

export const HLD_CODE = [
  'build(root=0): parent, depth, size, heavy, cur_pos = reset; dfs_size(root, -1); decompose(root, root)',
  'dfs_size(root, p): parent[root] = p; depth[root] = 0; order = [root]',
  '  for u in order: size[u] = 1                       # breadth-first: order grows while we walk it',
  '    for v in adj[u]: if v != parent[u]: parent[v] = u; depth[v] = depth[u] + 1; order.append(v)',
  '  for u in reversed(order): if u != root: size[parent[u]] += size[u]',
  '  for u in order: max_size = 0',
  '    for v in adj[u]: if v != parent[u] and size[v] > max_size: max_size = size[v]; heavy[u] = v',
  'decompose(root, h): stack = [(root, h)]',
  '  while stack: u, head = stack.pop(); head[u] = head; pos[u] = cur_pos; cur_pos += 1',
  '    for v in reversed(adj[u]): if v != parent[u] and v != heavy[u]: stack.append((v, v))',
  '    if heavy[u] != -1: stack.append((heavy[u], head))   # pushed last, popped next',
  'lca(u, v): while head[u] != head[v]:',
  '    if depth[head[u]] < depth[head[v]]: u, v = v, u',
  '    u = parent[head[u]]                             # jump over the whole chain',
  '  if depth[u] > depth[v]: u, v = v, u',
  '  return u',
  'query_path(u, v): path = []; while head[u] != head[v]:',
  '    if depth[head[u]] < depth[head[v]]: u, v = v, u',
  '    path.append((pos[head[u]], pos[u])); u = parent[head[u]]',
  '  if depth[u] > depth[v]: u, v = v, u',
  '  path.append((pos[u], pos[v])); return path',
];

/* ---------- tracer ---------- */

export type HldResult = number | Array<[number, number]> | 'IndexError';

export interface HldRun {
  frames: Array<Frame<RootedTreeState>>;
  parent: number[];
  depth: number[];
  size: number[];
  heavy: number[];
  head: number[];
  pos: number[];
  /** (index, value) of every write to size, in order (dfs_size). */
  sizeWrites: Array<[number, number]>;
  /** The node of every write to pos, in order (decompose). */
  posOrder: number[];
  results: HldResult[];
}

interface SnapOpts {
  roles?: Record<number, Role>;
  edgeRoles?: Record<number, Role>;
  cellRoles?: Record<number, Role>;
  pills?: Array<{ name: string; node: number; role?: Role; side?: 'left' | 'right' }>;
  strips?: StripData[];
  vars?: Array<[string, string | number]>;
  note?: string;
}

export function hldTrace(input: HldInput): HldRun {
  const { n, edges, root, ops } = input;
  const adj = adjacency(n, edges);
  const drawn = hang(n, adj, root);
  // HLD.__init__, then build(root) resets parent, depth, size, heavy and cur_pos.
  let parent: number[] = new Array(n).fill(-1);
  let depth: number[] = new Array(n).fill(0);
  let size: number[] = new Array(n).fill(0);
  let heavy: number[] = new Array(n).fill(-1);
  const head: number[] = new Array(n).fill(0);
  const pos: number[] = new Array(n).fill(0);
  let curPos = 0;
  const sizeWrites: Array<[number, number]> = [];
  const posOrder: number[] = [];
  const results: HldResult[] = [];
  const frames: Array<Frame<RootedTreeState>> = [];
  const names = ops.map(formatHldOp);
  let current = -1;
  /** Nodes whose heavy child has been chosen: their child edges are drawn heavy or light. */
  const chosen = new Set<number>();
  const placed = new Set<number>();

  const chainsNow = (): { chains: RtChain[]; groups: Array<{ lo: number; hi: number; label: string }> } => {
    const byHead = new Map<number, number[]>();
    for (const u of [...placed].sort((a, b) => pos[a] - pos[b])) byHead.set(head[u], [...(byHead.get(head[u]) ?? []), u]);
    const chains: RtChain[] = [];
    const groups: Array<{ lo: number; hi: number; label: string }> = [];
    for (const [h, members] of byHead) {
      chains.push({ nodes: members.map(String) });
      groups.push({ lo: pos[members[0]], hi: pos[members[members.length - 1]], label: `h${h}` });
    }
    return { chains, groups };
  };

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const nodes: RtNode[] = Array.from({ length: n }, (_, u) => ({
      id: String(u),
      label: String(u),
      children: drawn.children[u].map(String),
      role: o.roles?.[u] ?? 'idle',
      badge: size[u] > 0 ? String(size[u]) : undefined,
      sub: placed.has(u) ? `p${pos[u]}` : undefined,
    }));
    const edgeMap: Record<string, RtEdge> = {};
    for (let c = 0; c < n; c++) {
      const p = drawn.parent[c];
      if (p < 0) continue;
      edgeMap[String(c)] = { kind: chosen.has(p) ? (heavy[p] === c ? 'heavy' : 'light') : undefined, role: o.edgeRoles?.[c] };
    }
    const { chains, groups } = chainsNow();
    const cells = Array.from({ length: n }, (_, p) => {
      const u = [...placed].find((x) => pos[x] === p);
      return u === undefined ? null : { text: String(u), role: o.cellRoles?.[p] ?? 'idle' };
    });
    const pills: RtPill[] = (o.pills ?? []).filter((p) => p.node >= 0 && p.node < n).map((p) => ({ name: p.name, at: `t/${p.node}`, role: p.role, side: p.side }));
    const strips: StripData[] = [...(ops.length ? [opStrip(names, current)] : []), ...(o.strips ?? [])];
    frames.push({
      line,
      caption,
      vars: [
        ...(o.vars ?? []),
        ['parent', listText(parent)],
        ['size', listText(size)],
        ['heavy', listText(heavy)],
        ['head', listText(head)],
        ['pos', listText(pos)],
      ],
      state: {
        label: `Tree of ${n} node${n === 1 ? '' : 's'} rooted at ${root}; ${chains.length} chain${chains.length === 1 ? '' : 's'} so far`,
        trees: [{ id: 't', root: String(root), nodes, edges: edgeMap, chains }],
        pills,
        row: { label: 'pos', cells, groups },
        note: o.note,
        strips,
      },
    });
  };

  // ---- build(root)
  snap(
    0,
    `build(${root}): reset parent, depth, size and heavy, set cur_pos = 0, then make two passes. dfs_size measures every subtree; decompose then numbers the nodes chain by chain into pos.` +
      ' (build resets its state, so it can be called again.)',
    { roles: { [root]: 'active' } },
  );
  parent = new Array(n).fill(-1);
  depth = new Array(n).fill(0);
  size = new Array(n).fill(0);
  heavy = new Array(n).fill(-1);
  curPos = 0;

  // dfs_size: a breadth-first order.
  parent[root] = -1;
  depth[root] = 0;
  const order = [root];
  const orderStrip = (at: number): StripData => ({ label: 'order', items: order.map((u, i): StripItem => ({ text: String(u), role: i === at ? 'active' : i < at ? 'muted' : undefined })) });
  snap(1, `dfs_size(${root}, -1): the root has no parent (-1) and depth 0. order = [${root}] is the list of nodes to visit; the loop appends to it while it walks it, which makes the walk breadth-first (no recursion, so a long path is safe).`, {
    roles: { [root]: 'active' },
    strips: [orderStrip(0)],
  });
  for (let i = 0; i < order.length; i++) {
    const u = order[i];
    size[u] = 1;
    sizeWrites.push([u, 1]);
    const fresh: number[] = [];
    for (const v of adj[u]) {
      if (v !== parent[u]) {
        parent[v] = u;
        depth[v] = depth[u] + 1;
        order.push(v);
        fresh.push(v);
      }
    }
    const roles: Record<number, Role> = { [u]: 'active' };
    const edgeRoles: Record<number, Role> = {};
    for (const v of fresh) {
      roles[v] = 'compare';
      edgeRoles[v] = 'compare';
    }
    snap(
      fresh.length ? 3 : 2,
      fresh.length
        ? `u = ${u}: size[${u}] = 1 for now (just itself). Its neighbours other than its parent${parent[u] >= 0 ? ` ${parent[u]}` : ''} are ${fresh.join(', ')}: they become its children at depth ${depth[u] + 1} and join the end of order.`
        : `u = ${u}: size[${u}] = 1. Its only neighbour is its parent ${parent[u]}, so it is a leaf and nothing joins the order.`,
      { roles, edgeRoles, strips: [orderStrip(i)], vars: [['u', u], ['depth[u]', depth[u]]] },
    );
  }
  // Sizes, deepest first.
  const rev = [...order].reverse();
  for (const u of rev) {
    if (parent[u] !== -1 && u !== root) {
      const p = parent[u];
      const before = size[p];
      size[p] += size[u];
      sizeWrites.push([p, size[p]]);
      snap(
        4,
        `Reversed order visits children before parents, so size[${u}] = ${size[u]} is final. Add it to its parent: size[${p}] = ${before} + ${size[u]} = ${size[p]}.`,
        { roles: { [u]: 'done', [p]: 'active' }, edgeRoles: { [u]: 'active' }, strips: [{ label: 'reversed order', items: rev.map((x): StripItem => ({ text: String(x), role: x === u ? 'active' : undefined })) }], vars: [['u', u]] },
      );
    }
  }
  // Heavy children.
  for (const u of order) {
    let maxSize = 0;
    const kids: number[] = [];
    for (const v of adj[u]) {
      if (v !== parent[u]) {
        kids.push(v);
        if (size[v] > maxSize) {
          maxSize = size[v];
          heavy[u] = v;
        }
      }
    }
    chosen.add(u);
    if (kids.length === 0) continue;
    const roles: Record<number, Role> = { [u]: 'active' };
    for (const v of kids) roles[v] = v === heavy[u] ? 'done' : 'compare';
    const tied = kids.filter((v) => v !== heavy[u] && size[v] === maxSize);
    const why =
      kids.length === 1
        ? `${u} has one child, ${heavy[u]}, so it is the heavy child.`
        : `Children of ${u}: ${kids.map((v) => `${v} (size ${size[v]})`).join(', ')}. ` +
          (tied.length
            ? `${heavy[u]} comes first in adj[${u}] among the largest, and only a strictly larger size replaces the choice, so heavy[${u}] = ${heavy[u]}.`
            : `The largest subtree is ${heavy[u]}'s, so heavy[${u}] = ${heavy[u]}.`);
    snap(6, `${why} The edge ${u}-${heavy[u]} is heavy (thick)${kids.length > 1 ? '; the others are light (dashed)' : ''}.`, {
      roles,
      edgeRoles: { [heavy[u]]: 'active' },
      vars: [['u', u], ['max_size', maxSize]],
    });
  }
  const leaves = order.filter((u) => heavy[u] === -1);
  snap(
    5,
    `Leaves (${leaves.join(', ')}) keep heavy = -1. Heavy edges join into vertical chains. A light edge leads to a child with at most half of its parent's subtree, so a path to the root crosses at most log2(n) of them.`,
  );

  // decompose: an explicit stack, heavy child pushed last.
  const stack: Array<[number, number]> = [[root, root]];
  const stackStrip = (popped?: [number, number]): StripData => ({
    label: 'stack (top last)',
    items: stack.length ? stack.map(([u, h], i): StripItem => ({ text: `(${u}, ${h})`, role: i === stack.length - 1 ? 'compare' : undefined })) : [{ text: popped ? 'empty' : '-' }],
  });
  snap(7, `decompose(${root}, ${root}): the root heads the first chain. stack = [(${root}, ${root})] holds (node, head of its chain) pairs still to number.`, {
    roles: { [root]: 'compare' },
    strips: [stackStrip()],
  });
  while (stack.length) {
    const [u, h] = stack.pop()!;
    head[u] = h;
    pos[u] = curPos;
    posOrder.push(u);
    curPos += 1;
    placed.add(u);
    snap(
      8,
      `Pop (${u}, ${h}): head[${u}] = ${h} and pos[${u}] = ${pos[u]}, then cur_pos = ${curPos}. ` +
        (u === h ? (u === root ? `The root starts the first chain.` : `${u} is a light child, so it starts a new chain at position ${pos[u]}.`) : `${u} is the heavy child of ${parent[u]}, so it continues the chain of ${h} at the next position.`),
      { roles: { [u]: 'active' }, cellRoles: { [pos[u]]: 'active' }, strips: [stackStrip([u, h])], vars: [['u', u], ['head', h], ['cur_pos', curPos]] },
    );
    const light: number[] = [];
    for (let k = adj[u].length - 1; k >= 0; k--) {
      const v = adj[u][k];
      if (v !== parent[u] && v !== heavy[u]) {
        stack.push([v, v]);
        light.push(v);
      }
    }
    if (heavy[u] !== -1) stack.push([heavy[u], h]);
    if (light.length || heavy[u] !== -1) {
      const roles: Record<number, Role> = { [u]: 'active' };
      for (const v of light) roles[v] = 'compare';
      if (heavy[u] !== -1) roles[heavy[u]] = 'compare';
      snap(
        heavy[u] !== -1 ? 10 : 9,
        (light.length ? `Push the light child${light.length > 1 ? 'ren' : ''} ${light.join(', ')} as (v, v): each will head its own chain. ` : '') +
          (heavy[u] !== -1
            ? `Push the heavy child as (${heavy[u]}, ${h}) last, so it is popped next and takes position ${curPos}: a chain gets consecutive positions.`
            : 'No heavy child: this chain ends here.'),
        { roles, cellRoles: { [pos[u]]: 'active' }, strips: [stackStrip()], vars: [['u', u], ['cur_pos', curPos]] },
      );
    }
  }
  const { chains } = chainsNow();
  snap(
    undefined,
    `Built: ${chains.length} chain${chains.length === 1 ? '' : 's'}, each a contiguous run of pos (the brackets under the row, named after their head). ` +
      `Because the heavy child is numbered first, every subtree is contiguous too: the subtree of u is pos[u] .. pos[u] + size[u] - 1.`,
  );

  // ---- operations
  ops.forEach((op, k) => {
    current = k;
    const name = names[k];
    const opVars: Array<[string, string | number]> = [['op', name]];
    const isPath = op.kind === 'path';
    const L = isPath ? { loop: 16, swap: 17, jump: 18, last: 19, ret: 20 } : { loop: 11, swap: 12, jump: 13, last: 14, ret: 15 };
    if (op.u >= n || op.v >= n) {
      const bad = op.u >= n ? op.u : op.v;
      snap(L.loop, `${name} raises IndexError: the loop condition reads head[${bad}], but the tree has nodes 0 to ${n - 1}. Nothing is computed.`, {
        pills: [
          { name: 'u', node: op.u, role: 'compare', side: 'left' },
          { name: 'v', node: op.v, role: 'compare', side: 'right' },
        ],
        vars: opVars,
        note: `${String.fromCodePoint(0x2715)} IndexError: list index out of range`,
      });
      results.push('IndexError');
      return;
    }
    let u = op.u;
    let v = op.v;
    const segments: Array<[number, number]> = [];
    const segNodes: number[][] = [];
    const pillsOf = (): SnapOpts['pills'] => [
      { name: 'u', node: u, role: 'compare', side: 'left' },
      { name: 'v', node: v, role: 'compare', side: 'right' },
    ];
    const segStrip = (): StripData[] => (isPath ? [{ label: 'path', items: segments.length ? segments.map(([a, b], i): StripItem => ({ text: `(${a}, ${b})`, role: i === segments.length - 1 ? 'active' : 'done' })) : [{ text: '[]' }] }] : []);
    const segRoles = (last: Role): { roles: Record<number, Role>; cellRoles: Record<number, Role> } => {
      const roles: Record<number, Role> = {};
      const cellRoles: Record<number, Role> = {};
      segNodes.forEach((ns, i) => {
        for (const x of ns) {
          roles[x] = i === segNodes.length - 1 ? last : 'done';
          cellRoles[pos[x]] = i === segNodes.length - 1 ? last : 'done';
        }
      });
      return { roles, cellRoles };
    };
    /** u, parent[u], ... up to head[u]: the part of u's chain the next jump skips. */
    const climb = (x: number) => {
      const out = [x];
      while (x !== head[x]) {
        x = parent[x];
        out.push(x);
      }
      return out;
    };
    const qv = () => [...opVars, ['u', u], ['v', v], ['head[u]', head[u]], ['head[v]', head[v]]] as Array<[string, string | number]>;
    snap(L.loop, `${name}: ${head[u] === head[v] ? `head[${u}] = head[${v}] = ${head[u]}: both nodes are already on one chain.` : `head[${u}] = ${head[u]} and head[${v}] = ${head[v]} differ, so ${u} and ${v} are on different chains: climb one chain at a time.`}`, {
      roles: { [u]: 'compare', [v]: 'compare' },
      pills: pillsOf(),
      strips: segStrip(),
      vars: qv(),
    });
    while (head[u] !== head[v]) {
      if (depth[head[u]] < depth[head[v]]) {
        const [a, b] = [u, v];
        [u, v] = [v, u];
        snap(L.swap, `depth[head[${a}]] = ${depth[head[a]]} < depth[head[${b}]] = ${depth[head[b]]}: swap, so u is the node whose chain head is deeper. That chain cannot contain the meeting point, so it is safe to climb.`, {
          ...segRoles('done'),
          pills: pillsOf(),
          strips: segStrip(),
          vars: qv(),
        });
      }
      const ns = climb(u);
      const h = head[u];
      const up = parent[h];
      if (isPath) {
        segments.push([pos[h], pos[u]]);
        segNodes.push(ns);
        snap(L.jump, `depth[head[u]] = ${depth[h]} >= depth[head[v]] = ${depth[head[v]]}: record the segment (pos[${h}], pos[${u}]) = (${pos[h]}, ${pos[u]}), the chain from ${h} down to ${u}, contiguous in pos.`, {
          ...segRoles('active'),
          pills: pillsOf(),
          strips: segStrip(),
          vars: qv(),
        });
      }
      const was = u;
      u = up;
      const roles: Record<number, Role> = isPath ? segRoles('done').roles : {};
      if (!isPath) for (const x of ns) roles[x] = 'muted';
      snap(
        L.jump,
        isPath
          ? `Jump: u = parent[head[u]] = parent[${h}] = ${u}, the first node above that chain.`
          : `depth[head[${was}]] = ${depth[h]} >= depth[head[${v}]] = ${depth[head[v]]}: the whole chain from ${h} down to ${was} lies below the meeting point. Jump over it in one step: u = parent[${h}] = ${u}.`,
        { roles: { ...roles, [u]: 'compare', [v]: 'compare' }, cellRoles: isPath ? segRoles('done').cellRoles : {}, pills: pillsOf(), strips: segStrip(), vars: qv() },
      );
    }
    if (depth[u] > depth[v]) {
      const [a, b] = [u, v];
      [u, v] = [v, u];
      snap(L.last, `Same chain (head ${head[u]}). depth[${a}] = ${depth[a]} > depth[${b}] = ${depth[b]}: swap, so u is the shallower node.`, {
        ...segRoles('done'),
        roles: { ...segRoles('done').roles, [u]: 'compare', [v]: 'compare' },
        pills: pillsOf(),
        strips: segStrip(),
        vars: qv(),
      });
    }
    if (isPath) {
      segments.push([pos[u], pos[v]]);
      const last: number[] = [];
      for (let x = v; ; x = parent[x]) {
        last.push(x);
        if (x === u) break;
      }
      segNodes.push(last);
      const roles: Record<number, Role> = {};
      const cellRoles: Record<number, Role> = {};
      for (const ns of segNodes) for (const x of ns) roles[x] = 'good';
      for (const ns of segNodes) for (const x of ns) cellRoles[pos[x]] = 'good';
      const covered = segNodes.flat();
      results.push(segments.map(([a, b]) => [a, b] as [number, number]));
      snap(
        L.ret,
        `On one chain: the last segment is (pos[${u}], pos[${v}]) = (${pos[u]}, ${pos[v]}). query_path returns [${segments.map(([a, b]) => `(${a}, ${b})`).join(', ')}]: ` +
          `${segments.length} range${segments.length === 1 ? '' : 's'} of pos covering the ${covered.length} node${covered.length === 1 ? '' : 's'} of the path (${covered.join(', ')}). The LCA is ${u}, the shallower end of the last range.`,
        { roles, cellRoles, pills: pillsOf(), strips: segStrip(), vars: qv() },
      );
    } else {
      results.push(u);
      snap(L.ret, `Same chain: the shallower of the two, ${u}, is an ancestor of both. lca(${op.u}, ${op.v}) returns ${u}.`, {
        roles: { [u]: 'good', [v]: v === u ? 'good' : 'compare' },
        pills: pillsOf(),
        vars: qv(),
      });
    }
  });

  current = ops.length;
  if (ops.length) snap(undefined, `Done: ${ops.length} operation${ops.length === 1 ? '' : 's'} on ${chains.length} chain${chains.length === 1 ? '' : 's'}. Each one jumped over at most one chain per loop.`);
  return { frames, parent, depth, size, heavy, head, pos, sizeWrites, posOrder, results };
}
