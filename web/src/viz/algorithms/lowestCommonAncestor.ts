/**
 * Lowest common ancestor tracers: binary lifting (drawn with LcaLifting) and the Euler tour with
 * a sparse table (drawn with EulerTourView: RootedTreeView above SparseTableView).
 *
 * Mirrors Algorithms/Advanced_Algorithms/Specialized_Techniques/Lowest_Common_Ancestor/Python/
 * lowest_common_ancestor.py:
 *   rooted_tree     adj[u] lists the neighbours in edge order; a breadth-first walk from the root
 *                   (queue with a head index) gives parent (-1 for the root) and depth. The parser
 *                   refuses anything that is not a tree, so ValueError never reaches a tracer.
 *   liftingTrace    BinaryLiftingLCA: levels = n.bit_length(); up[0][v] = parent[v], root for the
 *                   root; up[k][v] = up[k-1][up[k-1][v]] for k = 1..levels-1, v = 0..n-1.
 *                   kth_ancestor(v, k): IndexError outside 0..n-1, ValueError for k < 0, -1 when
 *                   k > depth[v], else one read up[level][v] per 1 bit of k, lowest bit first.
 *                   lca(u, v): IndexError first; swap so that u is the deeper node; u =
 *                   kth_ancestor(u, depth[u] - depth[v]); return u if u == v; else for k from
 *                   levels-1 down, read up[k][u] and up[k][v] and, when they differ, read both
 *                   again to jump; return up[0][u]. distance(u, v) = depth[u] + depth[v] - 2 *
 *                   depth[lca(u, v)].
 *   eulerTrace      EulerTourLCA: euler = [root], first[root] = 0; a stack walk that takes the
 *                   next neighbour nxt[u] of the top node u, enters it when it is not parent[u]
 *                   (first[v] = len(euler), append, push) and, when u has none left, pops u and
 *                   appends the new top. sparse[0] = euler; sparse[k][i] = shallower(sparse[k-1][i],
 *                   sparse[k-1][i + 2^(k-1)]) for i < m - 2^k + 1, while 2^k <= m; shallower keeps
 *                   the left node on equal depths. lca(u, v): IndexError first; left, right =
 *                   first[u], first[v], swapped when left > right; k = (right - left + 1).bit_length()
 *                   - 1; shallower(sparse[k][left], sparse[k][right - 2^k + 1]). The class has no
 *                   kth_ancestor: Python raises AttributeError.
 * Golden fixtures (__fixtures__/specializedTechniques.json, section lowestCommonAncestor) pin
 * parent, depth, levels, up, euler, first and sparse, and for every call on each class its result
 * (or the exception's name) and the table cells it reads, in order.
 *
 * Input: "0-1 0-2 1-3 1-4 2-5 3-6 3-7 5-8 6-9; lca 9 4, dist 9 8, kth 9 3"   (an optional "root 4" first)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { EulerTourState } from '../renderers/EulerTourView';
import type { LcaState } from '../renderers/LcaLifting';
import type { OkText } from '../renderers/OptimizationKit';
import type { RtEdge, RtPill } from '../renderers/RootedTreeView';
import type { SparseCell, SparseWindow } from '../renderers/SparseTableView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { parseCall } from './hashTable';
import { adjacency, parseRoot, parseTreeShape, splitTreeScript, type TreeShape } from './heavyLight';
import { opStrip } from './segmentTree';

/* ---------- input ---------- */

export const LCA_TREE_LIMITS = { maxNodes: 12, maxOps: 8, maxId: 99 };

export type LcaOpKind = 'lca' | 'dist' | 'kth';

/** lca(a, b), distance(a, b) or kth_ancestor(a, b): for kth, a is the node and b is k. */
export interface LcaOp {
  kind: LcaOpKind;
  a: number;
  b: number;
}

export interface LcaTreeInput extends TreeShape {
  root: number;
  ops: LcaOp[];
}

export type LcaResult = number | 'IndexError' | 'ValueError' | 'AttributeError';

const OP_NAMES: Record<string, LcaOpKind> = { lca: 'lca', dist: 'dist', distance: 'dist', kth: 'kth', kth_ancestor: 'kth', ancestor: 'kth' };
const EXAMPLE_WITH_ROOT = '0-1 0-2 1-3 1-4 2-5 3-6 3-7 5-8 6-9; root 4; lca 9 8, dist 9 8';

export function parseLcaTree(text: string): LcaTreeInput {
  const { head, segments } = splitTreeScript(text);
  const shape = parseTreeShape(head);
  if (shape.n > LCA_TREE_LIMITS.maxNodes) {
    throw new InputError(`Up to ${LCA_TREE_LIMITS.maxNodes} nodes (0 to ${LCA_TREE_LIMITS.maxNodes - 1}), so the tree, the table and the tour fit on screen (got ${shape.n}).`);
  }
  // The root is an argument of the constructors, which raise ValueError (not IndexError) for one outside the tree.
  let root = 0;
  let rootSeen = false;
  const rest: string[] = [];
  for (const segment of segments) {
    const r = parseRoot(segment);
    if (r === undefined) {
      rest.push(segment);
      continue;
    }
    if (rootSeen) throw new InputError('Give the root ("root 4") only once.');
    if (rest.length) throw new InputError(`Put "root ${r}" before the queries: the constructor takes the root, as in "${EXAMPLE_WITH_ROOT}".`);
    if (r >= shape.n) throw new InputError(`BinaryLiftingLCA(${shape.n}, edges, root=${r}) would raise ValueError: the tree has the nodes 0 to ${shape.n - 1}.`);
    rootSeen = true;
    root = r;
  }
  const ops = rest.map((segment): LcaOp => {
    const call = parseCall(segment);
    const kind = call && OP_NAMES[call.name];
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write queries like "lca 9 4", "dist 9 8" or "kth 9 3" (the ancestor 3 levels above 9), separated by commas, after the edges and a semicolon.`);
    if (call.args.length !== 2) throw new InputError(`"${segment}": ${kind} takes two numbers, as in "${kind} 9 ${kind === 'kth' ? 3 : 4}".`);
    const [a, b] = call.args.map((t) => {
      if (!/^\d+$/.test(t)) throw new InputError(`"${segment}": "${t}" is not a whole number from 0 (nodes are 0, 1, 2, ...).`);
      const x = Number(t);
      if (x > LCA_TREE_LIMITS.maxId) throw new InputError(`"${segment}": numbers go up to ${LCA_TREE_LIMITS.maxId} here (got ${t}).`);
      return x;
    });
    return { kind, a, b };
  });
  if (ops.length > LCA_TREE_LIMITS.maxOps) throw new InputError(`At most ${LCA_TREE_LIMITS.maxOps} queries, please (got ${ops.length}).`);
  return { ...shape, root, ops };
}

export function formatLcaOp(op: LcaOp): string {
  return op.kind === 'lca' ? `lca(${op.a}, ${op.b})` : op.kind === 'dist' ? `distance(${op.a}, ${op.b})` : `kth_ancestor(${op.a}, ${op.b})`;
}

/* ---------- shared helpers ---------- */

/** int.bit_length() for 0 <= x < 2^31, with integers only (no floating-point log2). */
export const bitLength = (x: number) => 32 - Math.clz32(x);

/** rooted_tree: parent and depth from the breadth-first walk, the order nodes leave the queue, and what each one discovered. */
export function rootedTree(n: number, edges: Array<[number, number]>, root: number) {
  const adj = adjacency(n, edges);
  const parent = new Array<number>(n).fill(-1);
  const depth = new Array<number>(n).fill(0);
  const seen = new Array<boolean>(n).fill(false);
  seen[root] = true;
  const queue = [root];
  const found: number[][] = [];
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    const fresh: number[] = [];
    for (const v of adj[u]) {
      if (!seen[v]) {
        seen[v] = true;
        parent[v] = u;
        depth[v] = depth[u] + 1;
        queue.push(v);
        fresh.push(v);
      }
    }
    found.push(fresh);
  }
  // Children in adjacency order: the order the Euler tour enters them.
  const children = Array.from({ length: n }, (_, u) => adj[u].filter((v) => parent[v] === u));
  return { adj, parent, depth, queue, found, children };
}

/** The LCA by walking up one parent at a time, to check every answer. */
function naiveLca(parent: number[], depth: number[], u: number, v: number): number {
  while (depth[u] > depth[v]) u = parent[u];
  while (depth[v] > depth[u]) v = parent[v];
  while (u !== v) {
    u = parent[u];
    v = parent[v];
  }
  return u;
}

function naiveKth(parent: number[], v: number, k: number): number {
  for (let i = 0; i < k && v !== -1; i++) v = parent[v];
  return v;
}

const plural = (k: number, word: string) => `${k} ${word}${k === 1 ? '' : 's'}`;
const listText = (xs: number[]) => (xs.length === 1 ? `${xs[0]}` : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** What a correct answer is, for the check mark: the naive LCA, distance or k-th ancestor. */
function naiveAnswer(op: LcaOp, n: number, parent: number[], depth: number[]): LcaResult {
  if (op.kind === 'kth') {
    if (op.a >= n) return 'IndexError';
    return op.b > depth[op.a] ? -1 : naiveKth(parent, op.a, op.b);
  }
  if (op.a >= n || op.b >= n) return 'IndexError';
  const w = naiveLca(parent, depth, op.a, op.b);
  return op.kind === 'lca' ? w : depth[op.a] + depth[op.b] - 2 * depth[w];
}

/* ---------- binary lifting ---------- */

export const LIFT_CODE = [
  'rooted_tree(n, edges, root): ValueError unless n >= 1, root and endpoints in 0..n-1, n - 1 edges',
  '  queue = [root]; while head < len(queue): u = queue[head]; head += 1',
  '    for v in adj[u]: if not seen[v]: seen[v] = True; parent[v] = u; depth[v] = depth[u] + 1; queue.append(v)',
  '  if len(queue) != n: raise ValueError          # some node unreached: a cycle, not a tree',
  'levels = n.bit_length(); up = [[root if p == -1 else p for p in parent]]',
  'for k in range(1, levels): for v in range(n):',
  '    up[k][v] = up[k-1][up[k-1][v]]            # two jumps of 2^(k-1) make one of 2^k',
  'kth_ancestor(v, k): IndexError unless 0 <= v < n; ValueError if k < 0',
  '  if k > depth[v]: return -1',
  '  level = 0; while k: if k & 1: v = up[level][v]; k >>= 1; level += 1',
  '  return v',
  'lca(u, v): IndexError unless both in 0..n-1; if depth[u] < depth[v]: u, v = v, u',
  '  u = kth_ancestor(u, depth[u] - depth[v])       # lift the deeper node',
  '  if u == v: return u',
  '  for k in range(levels - 1, -1, -1):',
  '    if up[k][u] != up[k][v]: u = up[k][u]; v = up[k][v]',
  '  return up[0][u]',
  'distance(u, v): w = lca(u, v); return depth[u] + depth[v] - 2 * depth[w]',
];

export interface LiftRun {
  frames: Array<Frame<LcaState>>;
  parent: number[];
  depth: number[];
  levels: number;
  up: number[][];
  results: LcaResult[];
  /** The [k, v] cells of up each call reads, in order. */
  reads: Array<Array<[number, number]>>;
}

export function liftingTrace(input: LcaTreeInput): LiftRun {
  const { n, edges, root, ops } = input;
  const tree = rootedTree(n, edges, root);
  const { adj, parent, depth, queue, found, children } = tree;
  const levels = bitLength(n);
  const up: number[][] = Array.from({ length: levels }, () => new Array<number>(n).fill(0));
  const written: boolean[][] = Array.from({ length: levels }, () => new Array<boolean>(n).fill(false));
  const seen = new Array<boolean>(n).fill(false);
  const shownDepth = new Array<boolean>(n).fill(false);
  const frames: Array<Frame<LcaState>> = [];
  const answerLines: OkText[] = [];
  const results: LcaResult[] = [];
  const reads: Array<Array<[number, number]>> = [];
  let queueView: number[] = [root];
  let opReads: Array<[number, number]> = [];

  interface Snap {
    nodes?: Record<number, Role>;
    cells?: Record<string, Role>;
    jumps?: LcaState['jumps'];
    pills?: LcaState['pills'];
    work?: OkText[];
    vars?: Array<[string, string | number]>;
  }
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n], ['levels', levels], ['reads by this query', opReads.length]],
      state: {
        label: `Tree on ${n} nodes rooted at ${root}; up table by node: ${up[0].map((_, v) => `${v}:[${up.map((row) => row[v]).join(',')}]`).join(' ')}`,
        n,
        log: levels,
        root,
        children,
        visited: [...seen],
        nodeRoles: o.nodes ?? {},
        depth: depth.map((d, v) => (shownDepth[v] ? d : null)),
        table: Array.from({ length: n }, (_, v) => up.map((row, k) => ({ value: written[k][v] ? row[v] : '', written: written[k][v] }))),
        cellRoles: o.cells ?? {},
        jumps: o.jumps ?? [],
        pills: o.pills ?? [],
        stack: queueView.map(String),
        stackLabel: 'BFS queue',
        rowHeader: 'v',
        work: o.work ?? [],
        answers: answerLines.map((l) => ({ ...l })),
        answerRows: ops.length,
        workChars: 1,
      },
    });
  };
  /** A read of up[k][v], logged in the order Python makes it. */
  const read = (k: number, v: number) => {
    opReads.push([k, v]);
    return up[k][v];
  };

  // ---- rooted_tree
  seen[root] = true;
  shownDepth[root] = true;
  snap(
    0,
    `rooted_tree(${n}, edges, root=${root}): ${plural(n - 1, 'edge')} for ${plural(n, 'node')}, every endpoint in 0..${n - 1}. adj[u] lists the neighbours of u in the order the edges are given. ` +
      'A breadth-first walk from the root gives every parent and depth.',
    { nodes: { [root]: 'compare' } },
  );
  queue.forEach((u, head) => {
    const fresh = found[head];
    for (const v of fresh) {
      seen[v] = true;
      shownDepth[v] = true;
    }
    queueView = queue.slice(head + 1, queue.length).filter((x) => seen[x]);
    const others = adj[u].filter((v) => !fresh.includes(v));
    snap(
      2,
      `Dequeue ${u} (depth ${depth[u]}). ` +
        (fresh.length
          ? `Its unseen neighbour${fresh.length > 1 ? 's' : ''} ${listText(fresh)} get${fresh.length > 1 ? '' : 's'} parent ${u} and depth ${depth[u] + 1}, and join the queue.` +
            (others.length ? ` ${listText(others)} ${others.length > 1 ? 'were' : 'was'} seen already.` : '')
          : adj[u].length
            ? `Every neighbour (${listText(adj[u])}) was seen already: ${u} is a leaf of the walk.`
            : `${u} has no neighbour: the tree is this one node.`),
      { nodes: { [u]: 'active', ...Object.fromEntries(fresh.map((v) => [v, 'compare' as Role])) }, vars: [['u', u], ['depth[u]', depth[u]]] },
    );
  });
  queueView = [];
  snap(3, `The queue reached all ${plural(n, 'node')}, so the edges form one tree: parent and depth are final. (Had some node been left out, n - 1 edges would have to close a cycle, and the code raises ValueError.)`);

  // ---- the table
  const fresh0: Record<string, Role> = {};
  for (let v = 0; v < n; v++) {
    up[0][v] = parent[v] === -1 ? root : parent[v];
    written[0][v] = true;
    fresh0[`${v},0`] = v === root ? 'compare' : 'active';
  }
  const jumpsList = Array.from({ length: levels }, (_, k) => 2 ** k);
  snap(
    4,
    `levels = ${n}.bit_length() = ${levels}: jumps of ${listText(jumpsList)}, together ${2 ** levels - 1} >= n - 1 = ${n - 1}, the deepest a node can be. ` +
      `up[0][v] is the parent of v. The root ${root} has none, so it points to itself: a jump past the root stops at the root, and the table needs no -1.`,
    { cells: fresh0, nodes: { [root]: 'compare' } },
  );
  for (let k = 1; k < levels; k++) {
    for (let v = 0; v < n; v++) {
      const mid = up[k - 1][v];
      const target = up[k - 1][mid];
      up[k][v] = target;
      written[k][v] = true;
      const formula = `up[${k}][${v}] = up[${k - 1}][up[${k - 1}][${v}]] = up[${k - 1}][${mid}] = ${target}`;
      let why: string;
      if (v === root) why = 'the root stays at itself.';
      else if (depth[v] < 2 ** k) why = `${v} is only ${plural(depth[v], 'level')} deep, fewer than ${2 ** k}, so the jump stops at the root.`;
      else why = `${2 ** k} levels up is ${2 ** (k - 1)} up to ${mid}, then ${2 ** (k - 1)} more, both already in column ${k - 1}.`;
      const jumps: LcaState['jumps'] = [];
      if (mid !== v && target !== mid) jumps.push({ from: v, to: mid, label: '', role: 'compare' }, { from: mid, to: target, label: '', role: 'compare' });
      if (target !== v) jumps.push({ from: v, to: target, label: `${2 ** k}`, role: 'active' });
      snap(6, `${formula}: ${why}`, {
        nodes: { [v]: 'compare', [mid]: 'compare', [target]: 'active' },
        cells: { [`${v},${k - 1}`]: 'compare', [`${mid},${k - 1}`]: 'compare', [`${v},${k}`]: 'active' },
        jumps,
        vars: [['k', k], ['v', v]],
      });
    }
  }
  snap(undefined, `Built: ${n} ${SYM.times} ${levels} = ${n * levels} entries in O(n log n). A query now climbs by powers of two: at most ${levels} jump${levels === 1 ? '' : 's'} to lift, and ${levels} more steps for both nodes together.`);

  // ---- queries
  ops.forEach((op) => {
    opReads = [];
    const name = formatLcaOp(op);
    const want = naiveAnswer(op, n, parent, depth);
    const work: OkText[] = [{ text: name, role: 'active' }];
    const finish = (result: LcaResult, line: number | undefined, caption: string, o: Snap = {}) => {
      results.push(result);
      reads.push(opReads);
      const ok = result === want;
      answerLines.push({ text: `${name} = ${result}`, role: typeof result === 'number' ? (ok ? 'good' : 'bad') : 'bad' });
      snap(line, caption + (typeof result === 'number' ? (ok ? ' Walking up one parent at a time gives the same answer.' : ` A plain walk up gives ${want}: they disagree.`) : ''), { ...o, work: [...work, { text: `  ${typeof result === 'number' ? `return ${result}` : result}`, role: typeof result === 'number' ? (ok ? 'good' : 'bad') : 'bad' }] });
    };

    /** kth_ancestor's loop, one frame per 1 bit; returns the node reached. */
    const lift = (v: number, k: number, pills: (at: number) => LcaState['pills'], other?: number): number => {
      const trail: LcaState['jumps'] = [];
      let level = 0;
      let rest = k;
      while (rest) {
        if (rest & 1) {
          const to = read(level, v);
          trail.push({ from: v, to, label: `${2 ** level}`, role: 'active' });
          snap(9, `Bit ${level} of ${k} (0b${k.toString(2)}) is 1: jump ${plural(2 ** level, 'level')} up, from ${v} to up[${level}][${v}] = ${to}.`, {
            pills: pills(to),
            cells: { [`${v},${level}`]: 'active' },
            nodes: other === undefined ? { [to]: 'active' } : { [to]: 'active', [other]: 'compare' },
            jumps: trail.map((t, i) => ({ ...t, role: i === trail.length - 1 ? 'active' : 'muted' })),
            work: [...work, { text: `  v = up[${level}][${v}] = ${to}` }],
            vars: [['level', level], ['k', rest]],
          });
          v = to;
        }
        rest >>= 1;
        level += 1;
      }
      return v;
    };

    if (op.kind === 'kth') {
      const { a: v0, b: k } = op;
      if (v0 >= n) {
        work.push({ text: `  node ${v0} is not in 0..${n - 1}`, role: 'bad' });
        return finish('IndexError', 7, `${name}: node ${v0} is not in 0..${n - 1}, so the check raises IndexError before any lookup.`);
      }
      const vPill = (at: number): LcaState['pills'] => [{ name: 'v', at, role: 'active' }];
      if (k > depth[v0]) {
        return finish(-1, 8, `${name}: k = ${k} > depth[${v0}] = ${depth[v0]}, so there is no ancestor that far up: return -1 without reading the table.`, { pills: vPill(v0), nodes: { [v0]: 'compare' } });
      }
      snap(9, `${name}: k = ${k} = 0b${k.toString(2)}. Every 1 bit is one jump from the table, lowest bit first: ${k === 0 ? 'no bits, so no jump' : plural(k.toString(2).split('').filter((c) => c === '1').length, 'jump')}.`, {
        pills: vPill(v0),
        nodes: { [v0]: 'active' },
        work: [...work, { text: `  k = ${k} = 0b${k.toString(2)}` }],
      });
      const end = lift(v0, k, vPill);
      return finish(end, 10, `${name} = ${end}: ${k === 0 ? `${v0} itself` : `the node ${plural(k, 'level')} above ${v0}`}, found with ${plural(opReads.length, 'table read')}.`, { pills: vPill(end), nodes: { [end]: 'good' } });
    }

    // lca, and distance through lca
    const { a, b } = op;
    if (a >= n || b >= n) {
      const bad = a >= n ? a : b;
      work.push({ text: `  node ${bad} is not in 0..${n - 1}`, role: 'bad' });
      return finish('IndexError', 11, `${name}: node ${bad} is not in 0..${n - 1}, so ${op.kind === 'dist' ? 'lca (which distance calls first)' : 'the check'} raises IndexError before any lookup.`);
    }
    let u = a;
    let v = b;
    const swapped = depth[u] < depth[v];
    if (swapped) [u, v] = [v, u];
    const pills = (pu: number, pv: number): LcaState['pills'] => [
      { name: 'u', at: pu, role: 'active' },
      { name: 'v', at: pv, role: 'compare' },
    ];
    work.push({ text: `  u = ${u}, v = ${v}` });
    snap(
      11,
      `${name}${op.kind === 'dist' ? ' first calls lca' : ''}: depth[${a}] = ${depth[a]}, depth[${b}] = ${depth[b]}. ` +
        (swapped ? `${a} is the shallower one, so swap: u = ${u} is the deeper node.` : `u = ${u} is at least as deep as v = ${v}.`),
      { pills: pills(u, v), nodes: { [u]: 'active', [v]: 'compare' } },
    );
    const diff = depth[u] - depth[v];
    work.push({ text: `  lift u by ${diff}` });
    snap(12, diff === 0 ? `Both are at depth ${depth[u]}: kth_ancestor(${u}, 0) returns ${u} without a jump.` : `Lift u by depth[${u}] - depth[${v}] = ${diff} = 0b${diff.toString(2)}: kth_ancestor(${u}, ${diff}), one jump per 1 bit.`, {
      pills: pills(u, v),
      nodes: { [u]: 'active', [v]: 'compare' },
      vars: [['diff', diff]],
    });
    const v0 = v;
    u = lift(u, diff, (at) => pills(at, v0), v0);
    let result: number;
    if (u === v) {
      result = u;
      work.push({ text: `  u == v` });
      if (op.kind === 'lca') {
        return finish(u, 13, `u and v are both ${u} now: ${u} was an ancestor of the deeper node, so it is the LCA.`, { pills: pills(u, v), nodes: { [u]: 'good' } });
      }
      snap(13, `u and v are both ${u} now: ${u} was an ancestor of the deeper node, so lca returns ${u}.`, { pills: pills(u, v), nodes: { [u]: 'good' } });
    } else {
      snap(14, `Same depth (${depth[u]}), different nodes ${u} and ${v}: climb both together, from the largest jump down, while their ancestors still differ.`, { pills: pills(u, v), nodes: { [u]: 'active', [v]: 'compare' } });
      const trail: LcaState['jumps'] = [];
      for (let k = levels - 1; k >= 0; k--) {
        const ua = read(k, u);
        const va = read(k, v);
        if (ua !== va) {
          read(k, u);
          read(k, v);
          trail.push({ from: u, to: ua, label: `${2 ** k}`, role: 'active' }, { from: v, to: va, label: `${2 ** k}`, role: 'active' });
          snap(15, `up[${k}][${u}] = ${ua} and up[${k}][${v}] = ${va} differ: the common ancestor is higher still, so both jump ${plural(2 ** k, 'level')} up.`, {
            pills: pills(ua, va),
            cells: { [`${u},${k}`]: 'active', [`${v},${k}`]: 'active' },
            nodes: { [ua]: 'active', [va]: 'compare' },
            jumps: trail.map((t, i) => ({ ...t, role: i >= trail.length - 2 ? 'active' : 'muted' })),
            work: [...work, { text: `  k = ${k}: u = ${ua}, v = ${va}` }],
            vars: [['k', k]],
          });
          u = ua;
          v = va;
        } else {
          snap(
            15,
            `up[${k}][${u}] = up[${k}][${v}] = ${ua}: a common ancestor, but maybe not the lowest one, so do not jump.` + (ua === root && depth[u] < 2 ** k ? ` (A jump of ${2 ** k} goes past the root and stops there.)` : ''),
            { pills: pills(u, v), cells: { [`${u},${k}`]: 'compare', [`${v},${k}`]: 'compare' }, nodes: { [ua]: 'compare' }, jumps: trail.map((t) => ({ ...t, role: 'muted' })), vars: [['k', k]] },
          );
        }
      }
      result = read(0, u);
      work.push({ text: `  up[0][${u}] = ${result}` });
      if (op.kind === 'lca') {
        return finish(result, 16, `u = ${u} and v = ${v} are children of one node: return up[0][${u}] = ${result}.`, { pills: pills(u, v), cells: { [`${u},0`]: 'good' }, nodes: { [result]: 'good' } });
      }
      snap(16, `u = ${u} and v = ${v} are children of one node: lca returns up[0][${u}] = ${result}.`, { pills: pills(u, v), cells: { [`${u},0`]: 'good' }, nodes: { [result]: 'good' } });
    }
    const dist = depth[a] + depth[b] - 2 * depth[result];
    return finish(dist, 17, `${name} = depth[${a}] + depth[${b}] - 2 ${SYM.times} depth[${result}] = ${depth[a]} + ${depth[b]} - ${2 * depth[result]} = ${dist} edges: up from ${a} to ${result}, then down to ${b}.`, {
      pills: pills(a, b),
      nodes: { [a]: 'active', [b]: 'compare', [result]: 'good' },
    });
  });

  const workChars = Math.max(30, ...frames.flatMap((f) => [...f.state.work, ...f.state.answers].map((l) => l.text.length + 2)), ...frames.map((f) => f.state.stack.join(', ').length + 16));
  for (const f of frames) f.state.workChars = workChars;
  return { frames, parent, depth, levels, up, results, reads };
}

/* ---------- Euler tour and sparse table ---------- */

export const EULER_CODE = [
  'rooted_tree(n, edges, root): parent and depth, breadth-first; ValueError unless the edges form a tree',
  'euler = [root]; first[root] = 0; nxt = [0] * n; stack = [root]',
  'while stack: u = stack[-1]',
  '  if nxt[u] < len(adj[u]): v = adj[u][nxt[u]]; nxt[u] += 1',
  '    if v != parent[u]: first[v] = len(euler); euler.append(v); stack.append(v)',
  '  else: stack.pop(); if stack: euler.append(stack[-1])     # back in the parent',
  'sparse = [euler[:]]; k = 1; while 2^k <= m:                  # m = len(euler) = 2n - 1',
  '    sparse[k][i] = shallower(sparse[k-1][i], sparse[k-1][i + 2^(k-1)]) for i in 0..m - 2^k',
  'shallower(a, b): return a if depth[a] <= depth[b] else b     # ties: the left one',
  'lca(u, v): IndexError unless both in 0..n-1',
  '  left, right = first[u], first[v]; if left > right: left, right = right, left',
  '  k = (right - left + 1).bit_length() - 1                    # largest 2^k <= length',
  '  return shallower(sparse[k][left], sparse[k][right - 2^k + 1])',
  'distance(u, v): w = lca(u, v); return depth[u] + depth[v] - 2 * depth[w]',
];

export interface EulerRun {
  frames: Array<Frame<EulerTourState>>;
  euler: number[];
  first: number[];
  sparse: number[][];
  results: LcaResult[];
  /** The [k, i] cells of sparse each call reads, in order. */
  reads: Array<Array<[number, number]>>;
}

export function eulerTrace(input: LcaTreeInput): EulerRun {
  const { n, edges, root, ops } = input;
  const { adj, parent, depth, children } = rootedTree(n, edges, root);
  const m = 2 * n - 1;
  const levelCount = bitLength(m);
  const euler: number[] = [root];
  const first = new Array<number>(n).fill(-1);
  first[root] = 0;
  const sparse: number[][] = [];
  /** sparse cells written so far, for the drawing: per level, how many. */
  const builtCells = new Array<number>(levelCount).fill(0);
  const stack: number[] = [root];
  const left = new Set<number>(); // popped: the whole subtree is done
  const frames: Array<Frame<EulerTourState>> = [];
  const names = ops.map(formatLcaOp);
  const answers: StripItem[] = [];
  const results: LcaResult[] = [];
  const reads: Array<Array<[number, number]>> = [];
  let current = -1;
  let opReads: Array<[number, number]> = [];

  interface Snap {
    nodes?: Record<number, Role>;
    edgeRoles?: Record<number, Role>;
    pills?: RtPill[];
    tour?: Record<number, Role>;
    cells?: Record<string, Role>;
    windows?: [SparseWindow | null, SparseWindow | null];
    labels?: [string, string];
    vars?: Array<[string, string | number]>;
    note?: string;
  }
  const walkRoles = (): Record<number, Role> => {
    const roles: Record<number, Role> = {};
    for (const x of left) roles[x] = 'done';
    for (const x of stack) roles[x] = 'compare';
    if (stack.length) roles[stack[stack.length - 1]] = 'active';
    return roles;
  };
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const nodeRoles = o.nodes ?? {};
    const edgeStyle: Record<string, RtEdge> = {};
    for (const [c, role] of Object.entries(o.edgeRoles ?? {})) edgeStyle[c] = { role };
    const strips: StripData[] = [opStrip(names, current), { label: 'Stack', items: stack.length ? stack.map((x, i) => ({ text: String(x), role: i === stack.length - 1 ? 'active' : undefined })) : [{ text: 'empty' }] }];
    if (answers.length) strips.push({ label: 'Answers', items: answers.map((it) => ({ ...it })) });
    const cellOf = (x: number, i: number, role?: Role): SparseCell => ({ value: x, role, title: `euler[${i}] = ${x}, depth ${depth[x]}` });
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n], ['m', euler.length], ['reads by this query', opReads.length]],
      state: {
        tree: {
          label: `Tree on ${n} nodes rooted at ${root}; depth ${depth.join(',')}; first ${first.join(',')}`,
          trees: [
            {
              id: 't',
              root: String(root),
              nodes: Array.from({ length: n }, (_, v) => ({
                id: String(v),
                label: String(v),
                children: children[v].map(String),
                role: nodeRoles[v],
                badge: String(depth[v]),
                sub: first[v] >= 0 ? `f${first[v]}` : undefined,
              })),
              edges: edgeStyle,
            },
          ],
          pills: o.pills ?? [],
        },
        table: {
          label: `Euler tour of ${euler.length} entries (${euler.join(' ')}) with depths, and its sparse table of ${levelCount} levels`,
          arrLabel: 'node',
          arr: euler.map((x, i) => cellOf(x, i, o.tour?.[i])),
          rows: [{ label: 'depth', cells: euler.map((x, i) => ({ value: depth[x], role: o.tour?.[i], title: `depth[${x}] = ${depth[x]}` })) }],
          windows: o.windows ?? [null, null],
          windowLabels: o.labels ?? ['', ''],
          levels: Array.from({ length: levelCount }, (_, k) => ({
            label: `k=${k} (${2 ** k})`,
            cells: Array.from({ length: m - 2 ** k + 1 }, (_, i): SparseCell => {
              const done = i < builtCells[k];
              return {
                value: done ? sparse[k][i] : '',
                role: o.cells?.[`${i},${k}`],
                title: done ? `sparse[${k}][${i}] = ${sparse[k][i]}, the shallowest node of euler[${i}..${i + 2 ** k - 1}]` : `sparse[${k}][${i}]: not built yet`,
              };
            }),
          })),
          note: o.note,
          strips,
        },
      },
    });
  };
  const windowOf = (start: number, len: number, role: Role): SparseWindow => ({ start, cells: euler.slice(start, start + len).map((x) => ({ value: x, role })) });
  const shallower = (a: number, b: number) => (depth[a] <= depth[b] ? a : b);

  // ---- rooted_tree and the walk
  snap(0, `rooted_tree(${n}, edges, root=${root}) checks the edges and walks them breadth-first for parent and depth (the binary lifting tab shows that walk step by step). The badge on each node is its depth.`, {
    nodes: { [root]: 'compare' },
  });
  snap(1, `euler = [${root}], first[${root}] = 0 and the stack holds the root. A depth-first walk now writes a node into the tour each time it enters it and each time it comes back to it from a child.`, {
    nodes: walkRoles(),
    tour: { 0: 'active' },
  });
  const nxt = new Array<number>(n).fill(0);
  let skipped: string[] = [];
  while (stack.length) {
    const u = stack[stack.length - 1];
    if (nxt[u] < adj[u].length) {
      const v = adj[u][nxt[u]];
      nxt[u] += 1;
      if (v === parent[u]) {
        skipped.push(`${u} skips ${v}, its parent`);
        continue;
      }
      first[v] = euler.length;
      euler.push(v);
      stack.push(v);
      snap(
        4,
        (skipped.length ? `(${skipped.join('; ')}.) ` : '') + `${u} takes its next neighbour, ${v}: a child, so enter it. first[${v}] = ${first[v]}, euler gets ${v} (depth ${depth[v]}), and ${v} goes on the stack.`,
        { nodes: walkRoles(), edgeRoles: { [v]: 'active' }, tour: { [euler.length - 1]: 'active' }, vars: [['u', u], ['v', v]] },
      );
      skipped = [];
    } else {
      stack.pop();
      left.add(u);
      if (stack.length) {
        const p = stack[stack.length - 1];
        euler.push(p);
        snap(
          5,
          (skipped.length ? `(${skipped.join('; ')}.) ` : '') + `${u} has no neighbour left: its whole subtree is in the tour. Pop it; the walk is back in ${p}, so euler gets ${p} again (index ${euler.length - 1}).`,
          { nodes: walkRoles(), edgeRoles: { [u]: 'done' }, tour: { [euler.length - 1]: 'active' }, vars: [['u', u]] },
        );
      } else {
        snap(
          5,
          (skipped.length ? `(${skipped.join('; ')}.) ` : '') +
            `Pop the root ${u}: the walk is over. The tour has ${euler.length} = 2n - 1 entries: each node once when it is entered, and its parent once more after each of the ${n - 1} returns.`,
          { nodes: walkRoles() },
        );
      }
      skipped = [];
    }
  }

  // ---- the sparse table
  sparse.push([...euler]);
  builtCells[0] = m;
  const level0: Record<string, Role> = {};
  for (let i = 0; i < m; i++) level0[`${i},0`] = 'active';
  snap(6, `sparse[0] is the tour itself: a window of one entry has one node. Each level k keeps, for every start i, the shallowest node of the ${m >= 2 ? 'windows' : 'window'} euler[i..i + 2^k - 1]; there are ${levelCount} level${levelCount === 1 ? '' : 's'} because 2^${levelCount - 1} <= m = ${m}.`, {
    cells: level0,
  });
  for (let k = 1; k < levelCount; k++) {
    const half = 2 ** (k - 1);
    const row: number[] = [];
    sparse.push(row);
    for (let i = 0; i < m - 2 ** k + 1; i++) {
      const a = sparse[k - 1][i];
      const b = sparse[k - 1][i + half];
      const best = shallower(a, b);
      row.push(best);
      builtCells[k] = i + 1;
      const why =
        a === b
          ? `both halves hold ${a}, so it is ${a}.`
          : depth[a] === depth[b]
            ? `equal depths ${depth[a]}: the left one, ${a}, is kept.`
            : `depth ${depth[a]} against ${depth[b]}: ${best} is shallower.`;
      snap(7, `sparse[${k}][${i}] = shallower(sparse[${k - 1}][${i}], sparse[${k - 1}][${i + half}]) = shallower(${a}, ${b}) = ${best}: ${why}`, {
        cells: { [`${i},${k}`]: 'active', [`${i},${k - 1}`]: 'compare', [`${i + half},${k - 1}`]: 'compare' },
        windows: [windowOf(i, half, 'compare'), windowOf(i + half, half, 'compare')],
        labels: ['half 1', 'half 2'],
        vars: [['k', k], ['i', i]],
      });
    }
  }
  const cellCount = sparse.reduce((s, r) => s + r.length, 0);
  snap(undefined, `Built: the tour (${m} entries) and ${cellCount} table cells, O(n log n). A query is now two reads: the first time each node appears, and the shallowest node between them.`);

  // ---- queries
  ops.forEach((op, index) => {
    current = index;
    opReads = [];
    const name = names[index];
    const finish = (result: LcaResult, line: number | undefined, caption: string, o: Snap = {}) => {
      results.push(result);
      reads.push(opReads);
      const want = op.kind === 'kth' ? 'AttributeError' : naiveAnswer(op, n, parent, depth);
      const ok = result === want;
      const good = typeof result === 'number' && ok;
      answers.push({ text: `${name} = ${result}`, role: good ? 'good' : 'bad' });
      snap(line, caption + (typeof result === 'number' ? (ok ? ' Walking up one parent at a time gives the same answer.' : ` A plain walk up gives ${want}: they disagree.`) : ''), {
        ...o,
        note: `${name} = ${result}${good ? ` ${SYM.check}` : typeof result === 'number' ? ` ${SYM.cross}` : ''}`,
      });
    };
    if (op.kind === 'kth') {
      return finish('AttributeError', undefined, `${name}: EulerTourLCA has no kth_ancestor, so Python raises AttributeError. The tour knows where each node first appears, not which node lies k levels above it; the binary lifting tab answers this query.`);
    }
    const { a, b } = op;
    if (a >= n || b >= n) {
      const bad = a >= n ? a : b;
      return finish('IndexError', 9, `${name}: node ${bad} is not in 0..${n - 1}, so ${op.kind === 'dist' ? 'lca (which distance calls first)' : 'the check'} raises IndexError before any lookup.`);
    }
    const pills: RtPill[] = [
      { name: 'u', at: `t/${a}`, role: 'active', side: 'left' },
      { name: 'v', at: `t/${b}`, role: 'compare', side: 'right' },
    ];
    let lo = first[a];
    let hi = first[b];
    const swapped = lo > hi;
    if (swapped) [lo, hi] = [hi, lo];
    const range: Record<number, Role> = {};
    for (let i = lo; i <= hi; i++) range[i] = 'compare';
    snap(
      10,
      `${name}${op.kind === 'dist' ? ' first calls lca' : ''}: first[${a}] = ${first[a]} and first[${b}] = ${first[b]}` +
        (swapped ? `, so swap: left = ${lo}, right = ${hi}.` : `: left = ${lo}, right = ${hi}.`) +
        ` Between those two entries the walk goes from ${a} to ${b} without leaving the subtree of their LCA, and passes through the LCA itself.`,
      { pills, nodes: { [a]: 'active', [b]: 'compare' }, tour: range, vars: [['left', lo], ['right', hi]] },
    );
    const length = hi - lo + 1;
    const k = bitLength(length) - 1;
    const w = 2 ** k;
    const second = hi - w + 1;
    snap(
      11,
      `length = ${length}, k = ${length}.bit_length() - 1 = ${k}: ${w} is the largest power of two that fits. ` +
        (second === lo ? 'The length is a power of two, so the two windows are the same one.' : `A window of ${w} from the left end and one ending at the right end cover the range, overlapping in the middle.`),
      {
        pills,
        tour: range,
        cells: { [`${lo},${k}`]: 'compare', [`${second},${k}`]: 'active' },
        windows: [windowOf(lo, w, 'compare'), windowOf(second, w, 'active')],
        labels: [`[${k}][${lo}]`, `[${k}][${second}]`],
        vars: [['left', lo], ['right', hi], ['k', k]],
      },
    );
    opReads.push([k, lo]);
    const x = sparse[k][lo];
    opReads.push([k, second]);
    const y = sparse[k][second];
    const w0 = shallower(x, y);
    const at = euler.indexOf(w0, lo);
    const tourRoles: Record<number, Role> = { ...range, [at]: 'good' };
    const why = x === y ? `both windows give ${x}` : `${x} has depth ${depth[x]} and ${y} has depth ${depth[y]}`;
    if (op.kind === 'lca') {
      return finish(w0, 12, `shallower(sparse[${k}][${lo}], sparse[${k}][${second}]) = shallower(${x}, ${y}) = ${w0}: ${why}. Two reads, O(1): lca(${a}, ${b}) = ${w0}.`, {
        pills,
        nodes: { [w0]: 'good' },
        tour: tourRoles,
        cells: { [`${lo},${k}`]: 'compare', [`${second},${k}`]: 'compare' },
        windows: [windowOf(lo, w, 'compare'), windowOf(second, w, 'compare')],
        labels: [`[${k}][${lo}]`, `[${k}][${second}]`],
      });
    }
    snap(12, `shallower(${x}, ${y}) = ${w0}: ${why}. lca returns ${w0}.`, {
      pills,
      nodes: { [w0]: 'good' },
      tour: tourRoles,
      cells: { [`${lo},${k}`]: 'compare', [`${second},${k}`]: 'compare' },
    });
    const dist = depth[a] + depth[b] - 2 * depth[w0];
    return finish(dist, 13, `${name} = depth[${a}] + depth[${b}] - 2 ${SYM.times} depth[${w0}] = ${depth[a]} + ${depth[b]} - ${2 * depth[w0]} = ${dist} edges.`, {
      pills,
      nodes: { [a]: 'active', [b]: 'compare', [w0]: 'good' },
    });
  });

  return { frames, euler, first, sparse, results, reads };
}
