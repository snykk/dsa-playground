/**
 * DP on trees tracers, drawn with TreeDpView: the vertices are solved in post-order and each one
 * shows its DP values in cells underneath.
 *
 * Mirrors Algorithms/Dynamic_Programming/Advanced_DP/DP_on_Trees/Python/tree_dp.py:
 *   'mis'  tree_dp_max_independent_set(root): dfs(node) returns (include, exclude); a parent adds
 *          each child's exclude to its include and max(include, exclude) to its exclude.
 *   'path' tree_dp_max_path_sum(root): dfs(node) returns node.val + best1, where best1 >= best2
 *          are the two largest positive child chains (a strictly larger gain shifts best1 into
 *          best2), and max_sum = max(max_sum, node.val + best1 + best2) at every node.
 * Children are visited in list order, each once. An empty tree gives 0 ('mis') or -inf ('path').
 * Golden fixtures (__fixtures__/advancedDp.json) pin the value every dfs call returns, in order.
 *
 * Input: nested values, a node followed by its children in parentheses: "1(2(4, 5), 3)".
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { TdCell, TdNode, TreeDpState } from '../renderers/TreeDpView';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

export type TreeDpMode = 'mis' | 'path';

/** A TreeNode as the Python code builds it: a value and an ordered list of children. */
export interface TreeSpec {
  val: number;
  children: TreeSpec[];
}

export interface TreeInput {
  root: TreeSpec | null;
}

export const TREE_LIMITS = { maxNodes: 15, maxLeaves: 9, maxLevels: 6, lo: -99, hi: 99 };

/** "1(2(4, 5), 3)" -> the tree; "None" (or "empty", "[]") is the empty tree. */
export function parseTree(text: string): TreeInput {
  const t = text.trim();
  if (/^(none|null|empty|\[\s*\]|\(\s*\))$/i.test(t)) return { root: null };
  if (!t) throw new InputError('Enter a tree such as "1(2(4, 5), 3)": a value, then its children in parentheses. Write None for the empty tree.');
  let i = 0;
  let count = 0;
  const skip = () => {
    while (i < t.length && /\s/.test(t[i])) i++;
  };
  const node = (depth: number): TreeSpec => {
    skip();
    const m = t.slice(i).match(/^-?\d+/);
    if (!m) throw new InputError(`Expected a node value at "${t.slice(i, i + 8) || 'the end'}". Write a tree such as "1(2(4, 5), 3)".`);
    i += m[0].length;
    const val = Number(m[0]) || 0;
    if (val < TREE_LIMITS.lo || val > TREE_LIMITS.hi) throw new InputError(`Node values go from ${TREE_LIMITS.lo} to ${TREE_LIMITS.hi} (got ${m[0]}).`);
    count += 1;
    if (count > TREE_LIMITS.maxNodes) throw new InputError(`At most ${TREE_LIMITS.maxNodes} nodes, so every node and its values fit on screen.`);
    if (depth >= TREE_LIMITS.maxLevels) throw new InputError(`At most ${TREE_LIMITS.maxLevels} levels (root included), so the tree fits on screen.`);
    const children: TreeSpec[] = [];
    skip();
    if (t[i] === '(') {
      i++;
      skip();
      if (t[i] !== ')') {
        for (;;) {
          children.push(node(depth + 1));
          skip();
          if (t[i] === ',') {
            i++;
            continue;
          }
          if (t[i] === ')') break;
          throw new InputError(`Expected "," or ")" at "${t.slice(i, i + 8) || 'the end'}": every "(" needs its ")".`);
        }
      }
      i++;
    }
    return { val, children };
  };
  const root = node(0);
  skip();
  if (i < t.length) throw new InputError(`Unexpected "${t.slice(i, i + 8)}" after the tree: a tree has one root, as in "1(2, 3)".`);
  const leaves = (s: TreeSpec): number => (s.children.length ? s.children.reduce((a, c) => a + leaves(c), 0) : 1);
  if (leaves(root) > TREE_LIMITS.maxLeaves) throw new InputError(`At most ${TREE_LIMITS.maxLeaves} leaves, so the tree fits across the screen.`);
  return { root };
}

export function formatTree(s: TreeSpec | null): string {
  if (!s) return 'None';
  return s.children.length ? `${s.val}(${s.children.map(formatTree).join(', ')})` : String(s.val);
}

export const TREE_CODE: Record<TreeDpMode, string[]> = {
  mis: [
    'tree_dp_max_independent_set(root):',
    '  def dfs(node):                         # returns (include, exclude)',
    '    if not node: return 0, 0',
    '    include = node.val; exclude = 0',
    '    for child in node.children:',
    '      child_include, child_exclude = dfs(child)',
    '      include += child_exclude           # node taken: the child must be skipped',
    '      exclude += max(child_include, child_exclude)   # node skipped: the child is free',
    '    return include, exclude',
    '  include, exclude = dfs(root)',
    '  return max(include, exclude)',
  ],
  path: [
    'tree_dp_max_path_sum(root):',
    "  max_sum = float('-inf')",
    '  def dfs(node):                         # best downward chain from node',
    '    if not node: return 0',
    '    best1 = best2 = 0                    # two largest positive child chains',
    '    for child in node.children:',
    '      gain = dfs(child)',
    '      if gain > best1: best1, best2 = gain, best1',
    '      elif gain > best2: best2 = gain',
    '    max_sum = max(max_sum, node.val + best1 + best2)',
    '    return node.val + best1',
    '  dfs(root)',
    '  return max_sum',
  ],
};

/** What one dfs call returned: (include, exclude) for 'mis'; chain, best1, best2, max_sum for 'path'. */
export interface TreeCall {
  /** Pre-order index of the node, null for dfs(None). */
  id: number | null;
  values: number[];
}

export interface TreeRun {
  frames: Array<Frame<TreeDpState>>;
  calls: TreeCall[];
  result: number;
}

interface Flat {
  id: number;
  val: number;
  children: number[];
  parent: number | null;
}

/** Pre-order numbering, as the fixtures use: the root is 0. */
export function flatten(root: TreeSpec | null): Flat[] {
  const out: Flat[] = [];
  const walk = (s: TreeSpec, parent: number | null): number => {
    const id = out.length;
    const f: Flat = { id, val: s.val, children: [], parent };
    out.push(f);
    f.children = s.children.map((c) => walk(c, id));
    return id;
  };
  if (root) walk(root, null);
  return out;
}

const tagOf = (id: number) => String.fromCharCode(65 + id);
const fmt = (v: number) => (v === -Infinity ? '-inf' : v === Infinity ? 'inf' : String(v));

export function treeDpTrace(input: TreeInput, mode: TreeDpMode): TreeRun {
  const nodes = flatten(input.root);
  const frames: Array<Frame<TreeDpState>> = [];
  const calls: TreeCall[] = [];
  const cellNames = mode === 'mis' ? ['incl', 'excl'] : ['chain', 'path'];
  /** Values shown under each node (null = not computed yet). */
  const values: Array<Array<number | null>> = nodes.map(() => [null, null]);
  const state = new Map<number, 'open' | 'done'>();
  const stack: number[] = [];
  let maxSum = -Infinity;
  const name = (id: number) => `${tagOf(id)} (${nodes[id].val})`;

  interface Look {
    nodes?: Record<number, Role>;
    cells?: Record<string, Role>; // "id,k"
    edges?: Record<number, Role>; // child id
    total?: Role;
  }
  const snap = (line: number | undefined, caption: string, look: Look = {}, vars: Array<[string, string | number]> = []) => {
    const tds: TdNode[] = nodes.map((n) => {
      const st = state.get(n.id);
      // The running call is active; the calls below it on the stack wait (idle, their cells partly filled).
      const role = look.nodes?.[n.id] ?? (st === 'open' && stack[stack.length - 1] === n.id ? 'active' : st === 'done' ? 'done' : 'idle');
      const cells: Array<TdCell | null> = values[n.id].map((v, k) => {
        if (v === null) return null;
        const r = look.cells?.[`${n.id},${k}`];
        return { text: fmt(v), role: r ?? (st === 'open' && stack[stack.length - 1] === n.id ? 'active' : undefined) };
      });
      return { id: `n${n.id}`, label: String(n.val), tag: tagOf(n.id), children: n.children.map((c) => `n${c}`), role, cells };
    });
    const edges: Record<string, Role> = {};
    for (const [c, r] of Object.entries(look.edges ?? {})) edges[`n${c}`] = r;
    const strip: StripItem[] = stack.map((id, k) => ({ text: `dfs(${tagOf(id)})`, role: k === stack.length - 1 ? 'active' : 'compare' }));
    frames.push({
      line,
      caption,
      vars,
      state: {
        label: mode === 'mis' ? 'Tree with include and exclude sums under each node' : 'Tree with the best chain and the best path through each node',
        root: nodes.length ? 'n0' : null,
        nodes: tds,
        cellNames,
        edges,
        totals: mode === 'path' ? [{ label: 'max_sum', value: fmt(maxSum), role: look.total }] : undefined,
        empty: 'root = None',
        strips: [{ label: 'Call stack', items: strip.length ? strip : [{ text: SYM.emptySet, role: 'muted' }] }],
      },
    });
  };

  if (nodes.length === 0) {
    if (mode === 'mis') {
      calls.push({ id: null, values: [0, 0] });
      snap(2, 'root is None: dfs(None) hits "if not node" and returns (0, 0). There is no node to choose.', {}, [
        ['include', 0],
        ['exclude', 0],
      ]);
      snap(10, 'max(include, exclude) = max(0, 0) = 0: the empty set is the best independent set of an empty tree.', {}, [['result', 0]]);
      return { frames, calls, result: 0 };
    }
    calls.push({ id: null, values: [0, 0, 0, -Infinity] });
    snap(3, "root is None: dfs(None) returns 0 at once, and max_sum keeps its start value float('-inf').", { total: 'bad' }, [['max_sum', '-inf']]);
    snap(12, "return max_sum = -inf: a path needs at least one node, so an empty tree has no path at all. The code reports that as float('-inf').", { total: 'bad' }, [
      ['result', '-inf'],
    ]);
    return { frames, calls, result: -Infinity };
  }

  if (mode === 'mis') {
    snap(
      9,
      `Call dfs on the root ${name(0)}. Every call returns a pair for its subtree: include, the best sum if the node is taken, and exclude, the best sum if it is skipped. ` +
        'A taken node forbids its children, so the parent needs both numbers of each child. Children are solved first (post-order).',
      {},
      [['nodes', nodes.length]],
    );
    const dfs = (id: number): [number, number] => {
      const n = nodes[id];
      stack.push(id);
      state.set(id, 'open');
      let include = n.val;
      let exclude = 0;
      values[id] = [include, exclude];
      if (n.children.length === 0) {
        calls.push({ id, values: [include, exclude] });
        snap(
          8,
          `dfs(${name(id)}): a leaf, so the loop has nothing to do. include = ${n.val} (take it), exclude = 0 (skip it): return (${include}, ${exclude}).`,
          { nodes: { [id]: 'active' }, cells: { [`${id},0`]: 'active', [`${id},1`]: 'active' } },
          [
            ['node', name(id)],
            ['include', include],
            ['exclude', exclude],
          ],
        );
        state.set(id, 'done');
        stack.pop();
        return [include, exclude];
      }
      snap(
        3,
        `dfs(${name(id)}): include starts at its value ${n.val} (the node is taken), exclude at 0 (it is skipped). Its ${n.children.length} child${n.children.length === 1 ? '' : 'ren'} must be solved first.`,
        { cells: { [`${id},0`]: 'active', [`${id},1`]: 'active' } },
        [
          ['node', name(id)],
          ['include', include],
          ['exclude', exclude],
        ],
      );
      for (const c of n.children) {
        const [ci, ce] = dfs(c);
        const bi = include;
        const be = exclude;
        include += ce;
        exclude += Math.max(ci, ce);
        values[id] = [include, exclude];
        snap(
          7,
          `Back in ${name(id)}: child ${tagOf(c)} returned (${ci}, ${ce}). include += ${ce}, its exclude, because a taken ${tagOf(id)} forbids ${tagOf(c)}: ${bi} + ${ce} = ${include}. ` +
            `exclude += max(${ci}, ${ce}) = ${Math.max(ci, ce)}, because a skipped ${tagOf(id)} leaves ${tagOf(c)} free: ${be} + ${Math.max(ci, ce)} = ${exclude}.`,
          { cells: { [`${c},0`]: 'compare', [`${c},1`]: 'compare', [`${id},0`]: 'active', [`${id},1`]: 'active' }, nodes: { [c]: 'compare' }, edges: { [c]: 'compare' } },
          [
            ['node', name(id)],
            ['child', tagOf(c)],
            ['child_include', ci],
            ['child_exclude', ce],
            ['include', include],
            ['exclude', exclude],
          ],
        );
      }
      calls.push({ id, values: [include, exclude] });
      snap(
        8,
        `dfs(${name(id)}) returns (${include}, ${exclude}): with ${tagOf(id)} taken its subtree is worth ${include}, with it skipped ${exclude}. Every child was called once, so the whole pass is O(n).`,
        { nodes: { [id]: 'done' }, cells: { [`${id},0`]: 'done', [`${id},1`]: 'done' } },
        [
          ['node', name(id)],
          ['include', include],
          ['exclude', exclude],
        ],
      );
      state.set(id, 'done');
      stack.pop();
      return [include, exclude];
    };
    const [inc, exc] = dfs(0);
    const result = Math.max(inc, exc);
    snap(
      10,
      `max(include, exclude) = max(${inc}, ${exc}) = ${result}: the best independent set ${inc > exc ? 'takes the root' : inc < exc ? 'skips the root' : 'may take or skip the root (both sums are equal)'}.`,
      { cells: { [`0,${inc >= exc ? 0 : 1}`]: 'good' } },
      [['result', result]],
    );
    // Read one optimal set back from the pairs (the code returns only the sum).
    const taken = new Set<number>();
    const choose = (id: number, parentTaken: boolean) => {
      const [i, e] = values[id] as [number, number];
      const take = !parentTaken && i > e;
      if (take) taken.add(id);
      for (const c of nodes[id].children) choose(c, take);
    };
    choose(0, false);
    const roles: Record<number, Role> = {};
    for (const n of nodes) roles[n.id] = taken.has(n.id) ? 'good' : 'muted';
    snap(
      undefined,
      `One optimal set, read back from the pairs top-down (the code itself returns only the sum): ${taken.size ? `{${[...taken].map(tagOf).join(', ')}}` : 'the empty set'}, total ${result}. ` +
        'A node is taken when its parent is not and include beats exclude; no two taken nodes share an edge.',
      { nodes: roles },
      [['result', result]],
    );
    return { frames, calls, result };
  }

  // ---------- maximum path sum ----------
  const best = nodes.map(() => ({ b1: 0, b2: 0, c1: -1, c2: -1 }));
  let bestAt = -1;
  snap(
    11,
    `max_sum = -inf, then dfs on the root ${name(0)}. dfs(node) returns the best chain going down from node (it may stop at node). ` +
      'A path whose highest node is v goes down at most two children, so v combines its two best positive chains.',
    { total: 'compare' },
    [['max_sum', '-inf']],
  );
  const chainEdges = (id: number): Record<number, Role> => {
    const out: Record<number, Role> = {};
    if (best[id].c1 >= 0) out[best[id].c1] = 'done';
    if (best[id].c2 >= 0) out[best[id].c2] = 'done';
    return out;
  };
  const dfs = (id: number): number => {
    const n = nodes[id];
    stack.push(id);
    state.set(id, 'open');
    const b = best[id];
    if (n.children.length) {
      snap(
        4,
        `dfs(${name(id)}): best1 = best2 = 0. They will hold the two largest positive chains of its ${n.children.length} child${n.children.length === 1 ? '' : 'ren'}; 0 means "stop here".`,
        {},
        [
          ['node', name(id)],
          ['best1', 0],
          ['best2', 0],
        ],
      );
    }
    for (const c of n.children) {
      const gain = dfs(c);
      let how: string;
      if (gain > b.b1) {
        how = `${gain} > best1 ${b.b1}: best1, best2 = ${gain}, ${b.b1} (the old best moves down to second place).`;
        b.b2 = b.b1;
        b.c2 = b.c1;
        b.b1 = gain;
        b.c1 = c;
      } else if (gain > b.b2) {
        how = `${gain} is not above best1 ${b.b1} but is above best2 ${b.b2}: best2 = ${gain}.`;
        b.b2 = gain;
        b.c2 = c;
      } else {
        how =
          gain <= 0
            ? `${gain} is not positive: a chain that loses value is never worth taking, so best1 and best2 stay.`
            : `${gain} is not above best1 ${b.b1} or best2 ${b.b2}: a third chain cannot be on the same path, so it is dropped.`;
      }
      snap(
        b.c1 === c ? 7 : 8,
        `Back in ${name(id)}: child ${tagOf(c)} returned the chain gain = ${gain}. ${how}`,
        { cells: { [`${c},0`]: 'compare' }, nodes: { [c]: 'compare' }, edges: { ...chainEdges(id), [c]: b.c1 === c || b.c2 === c ? 'done' : 'compare' } },
        [
          ['node', name(id)],
          ['gain', gain],
          ['best1', b.b1],
          ['best2', b.b2],
        ],
      );
    }
    const through = n.val + b.b1 + b.b2;
    const before = maxSum;
    if (through > maxSum) {
      maxSum = through;
      bestAt = id;
    }
    const chain = n.val + b.b1;
    values[id] = [chain, through];
    calls.push({ id, values: [chain, b.b1, b.b2, maxSum] });
    snap(
      9,
      (n.children.length ? '' : `dfs(${name(id)}): a leaf, so best1 = best2 = 0. `) +
        `The best path with ${tagOf(id)} as its highest node is ${n.val} + ${b.b1} + ${b.b2} = ${through}` +
        (through > before ? `, above ${fmt(before)}: max_sum = ${through}.` : `, not above max_sum ${fmt(before)}, which stays.`) +
        ` The parent can extend only one chain, so return ${n.val} + ${b.b1} = ${chain}.`,
      {
        nodes: { [id]: 'active' },
        cells: { [`${id},0`]: 'active', [`${id},1`]: through > before ? 'good' : 'active' },
        edges: chainEdges(id),
        total: through > before ? 'active' : undefined,
      },
      [
        ['node', name(id)],
        ['best1', b.b1],
        ['best2', b.b2],
        ['path', through],
        ['returns', chain],
        ['max_sum', fmt(maxSum)],
      ],
    );
    state.set(id, 'done');
    stack.pop();
    return chain;
  };
  dfs(0);
  snap(12, `return max_sum = ${maxSum}: the largest path sum over every choice of highest node.`, { total: 'done' }, [['result', maxSum]]);
  // Read the best path back (the code returns only its sum).
  const onPath = new Set<number>([bestAt]);
  const edgesOn: Record<number, Role> = {};
  const down = (from: number) => {
    let v = from;
    while (v >= 0) {
      onPath.add(v);
      const next = best[v].c1;
      if (next >= 0) edgesOn[next] = 'good';
      v = next;
    }
  };
  if (best[bestAt].c1 >= 0) {
    edgesOn[best[bestAt].c1] = 'good';
    down(best[bestAt].c1);
  }
  if (best[bestAt].c2 >= 0) {
    edgesOn[best[bestAt].c2] = 'good';
    down(best[bestAt].c2);
  }
  const roles: Record<number, Role> = {};
  for (const n of nodes) roles[n.id] = onPath.has(n.id) ? 'good' : 'muted';
  const order = [...onPath].sort((a, b) => a - b);
  snap(
    undefined,
    `The path itself, read back from the stored chains (the code returns only its sum): highest node ${tagOf(bestAt)}, then down its best chains: ` +
      `${order.map(tagOf).join(', ')}, sum ${maxSum}.`,
    { nodes: roles, edges: edgesOn, total: 'done' },
    [['result', maxSum]],
  );
  return { frames, calls, result: maxSum };
}

/** Brute force for the tests: the best independent set over all subsets. */
export function misBrute(root: TreeSpec | null): number {
  const nodes = flatten(root);
  let best = 0;
  for (let mask = 0; mask < 1 << nodes.length; mask++) {
    let ok = true;
    let sum = 0;
    for (const n of nodes) {
      if (!(mask & (1 << n.id))) continue;
      sum += n.val;
      if (n.parent !== null && mask & (1 << n.parent)) ok = false;
    }
    if (ok && sum > best) best = sum;
  }
  return best;
}

/** Brute force for the tests: the best sum over all simple paths (every pair of end nodes). */
export function pathBrute(root: TreeSpec | null): number {
  const nodes = flatten(root);
  if (nodes.length === 0) return -Infinity;
  const ancestors = (v: number) => {
    const out: number[] = [];
    for (let u: number | null = v; u !== null; u = nodes[u].parent) out.push(u);
    return out;
  };
  let best = -Infinity;
  for (const a of nodes) {
    for (const b of nodes) {
      const pa = ancestors(a.id);
      const pb = ancestors(b.id);
      const lca = pa.find((u) => pb.includes(u))!;
      let sum = 0;
      for (const u of pa) {
        sum += nodes[u].val;
        if (u === lca) break;
      }
      for (const u of pb) {
        if (u === lca) break;
        sum += nodes[u].val;
      }
      if (sum > best) best = sum;
    }
  }
  return best;
}
