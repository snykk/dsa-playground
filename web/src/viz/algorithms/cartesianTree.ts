/**
 * Cartesian tree tracer: the O(n) stack build from an array (the stack is the right spine; values
 * strictly greater than the new one are popped and the last popped becomes its left child), then
 * range minimum queries that walk from the root to the lowest common ancestor of the two ends.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Cartesian_Tree/Python/cartesian_tree.py:
 * CartesianTree.build_from_array and get_min_index (go right while node.index < left, left while
 * node.index > right; the first node inside [left, right] is the answer; -1 for an empty tree or
 * an invalid range). Ties: only strictly greater values are popped, so the leftmost minimum is
 * the ancestor. Golden fixtures (__fixtures__/binaryTrees.json, section cartesian) pin the tree
 * and every query.
 *
 * Input: "9 3 7 1 8 12 10 20 15 18 5; rmq 4 8, rmq 0 2"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { TreeAxisCell, TreeState } from '../renderers/TreeView';
import type { StripData } from '../ui/molecules/Strip';
import { collectViews, pyList, type BNode } from './binaryTreesCommon';

export const CARTESIAN_LIMITS = { maxValues: 12, maxQueries: 10 };

export interface CartesianInput {
  array: number[];
  queries: Array<[number, number]>;
}

const EXAMPLE = 'Write the array, then queries: "9 3 7 1 8 12; rmq 1 4, rmq 0 5".';

export function parseCartesian(text: string): CartesianInput {
  const segments = text
    .split(/[;\n]|,(?=\s*(?:rmq|min|query|q|get_min_index)\b)/i)
    .map((s) => s.trim())
    .filter(Boolean);
  let array: number[] | undefined;
  const queries: Array<[number, number]> = [];
  for (const seg of segments) {
    const q = seg.match(/^(?:rmq|min|query|q|get_min_index)\s*\(?\s*\[?\s*(-?\d+)\s*[\s,]\s*(-?\d+)\s*\]?\s*\)?$/i);
    if (q) {
      const l = Number(q[1]);
      const r = Number(q[2]);
      if (Math.abs(l) > 99 || Math.abs(r) > 99) throw new InputError(`Query ends go from -99 to 99 (got "${seg}").`);
      queries.push([l, r]);
      continue;
    }
    if (/^[a-z_]/i.test(seg)) throw new InputError(`Cannot read "${seg}". ${EXAMPLE}`);
    if (array) throw new InputError(`Give the array once, then queries such as "rmq 1 4". ${EXAMPLE}`);
    const tokens = seg.replace(/^\[|\]$/g, '').split(/[\s,]+/).filter(Boolean);
    array = tokens.map((t) => {
      if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number. ${EXAMPLE}`);
      const v = Number(t);
      if (v < -99 || v > 999) throw new InputError(`Values go from -99 to 999 (got ${t}).`);
      return v;
    });
  }
  if (!array) throw new InputError(`Start with the array. ${EXAMPLE}`);
  if (array.length > CARTESIAN_LIMITS.maxValues) throw new InputError(`At most ${CARTESIAN_LIMITS.maxValues} values, so the tree fits on screen (got ${array.length}).`);
  if (queries.length > CARTESIAN_LIMITS.maxQueries) throw new InputError(`At most ${CARTESIAN_LIMITS.maxQueries} queries, please (got ${queries.length}).`);
  return { array, queries };
}

export const CARTESIAN_CODE = [
  'build_from_array(array): stack = []',
  '  for i, value in enumerate(array): node = CartesianNode(value, i); last_popped = None',
  '    while stack and stack[-1].value > value: last_popped = stack.pop()',
  '    if last_popped is not None: node.left = last_popped',
  '    if stack: stack[-1].right = node',
  '    stack.append(node)',
  '  root = stack[0]          # the bottom of the stack: the minimum',
  'get_min_index(left, right): if root is None or left < 0 or right >= n or left > right: return -1',
  '  node = root; while True:',
  '    if node.index < left: node = node.right       # the range is to the right',
  '    elif node.index > right: node = node.left     # the range is to the left',
  '    else: return node.index      # first node inside the range: LCA(left, right) = the minimum',
];

interface Node extends BNode {
  value: number;
  index: number;
  left: Node | null;
  right: Node | null;
}

export type CartNested = null | [number, number, CartNested, CartNested];

export interface CartesianRun {
  frames: Array<Frame<TreeState>>;
  tree: CartNested;
  results: number[];
  /** Nodes (by index) each query visited, in order. */
  paths: number[][];
}

function nested(n: Node | null): CartNested {
  return n ? [n.value, n.index, nested(n.left), nested(n.right)] : null;
}

interface SnapOpts {
  roles?: Record<number, Role>;
  tags?: Record<number, string>;
  path?: number[];
  cells?: Record<number, Role>;
  stack?: Node[];
  floating?: Node | null;
  vars?: Array<[string, string | number]>;
}

export function cartesianTrace({ array, queries }: CartesianInput): CartesianRun {
  const n = array.length;
  const frames: Array<Frame<TreeState>> = [];
  let root: Node | null = null;
  let read = 0;
  const results: number[] = [];
  const paths: number[][] = [];
  const queryText = queries.map(([l, r]) => `get_min_index(${l}, ${r})`);
  let currentQuery = -1;

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const onPath = new Set(o.path ?? []);
    const forest = o.floating ? [...(root ? [{ root: root.id }] : []), { root: o.floating.id }] : undefined;
    const axis: TreeAxisCell[] = array.map((v, i) => ({ text: String(v), sub: String(i), role: o.cells?.[i] ?? (i < read ? 'idle' : 'muted') }));
    const strips: StripData[] = [];
    if (o.stack) strips.push({ label: 'Stack (bottom first)', items: o.stack.length ? o.stack.map((s) => ({ text: `${s.value} @${s.index}`, role: 'compare' as Role })) : [{ text: 'empty' }] });
    if (queries.length) strips.push({ label: 'Queries', items: queryText.map((t, i) => ({ text: i < results.length ? `${t} = ${results[i]}` : t, role: i === currentQuery ? 'active' : i < currentQuery ? 'muted' : undefined })) });
    frames.push({
      line,
      caption,
      state: {
        nodes: collectViews([root, o.floating ?? null], (x: Node) => ({
          key: x.value,
          role: o.roles?.[x.id] ?? 'idle',
          tag: o.tags?.[x.id],
          edgeRole: onPath.has(x.id) ? 'compare' : undefined,
        })),
        root: root?.id ?? null,
        forest,
        forestGap: 0,
        axis,
        strips,
      },
      vars: [...(o.vars ?? []), ['n', n]],
    });
  };

  snap(0, n ? `CartesianTree(${pyList(array)}): read the array left to right. The stack holds the right spine of the tree built so far, values increasing from the bottom.` : 'CartesianTree([]): the array is empty, so the root stays None.', { stack: [] });

  const stack: Node[] = [];
  const nodes: Node[] = [];
  for (let i = 0; i < n; i++) {
    const value = array[i];
    const node: Node = { id: i + 1, value, index: i, left: null, right: null };
    nodes.push(node);
    read = i;
    const spine = (extra: Record<number, Role> = {}) => {
      const r: Record<number, Role> = {};
      for (const s of stack) r[s.id] = 'compare';
      return { ...r, ...extra };
    };
    snap(1, `Read array[${i}] = ${value} and make its node. In-order position is array position, so it sits in column ${i}; the stack decides where it hangs.`, {
      roles: spine({ [node.id]: 'active' }),
      cells: { [i]: 'active' },
      stack: [...stack],
      floating: node,
      vars: [['i', i], ['value', value]],
    });
    let lastPopped: Node | null = null;
    while (stack.length && stack[stack.length - 1].value > value) {
      const top = stack.pop()!;
      lastPopped = top;
      snap(2, `Top of the stack ${top.value} (index ${top.index}) > ${value}: pop it. ${value} is smaller and comes later in the array, so it must be an ancestor of ${top.value}; ${top.value} leaves the right spine.`, {
        roles: spine({ [node.id]: 'active', [top.id]: 'idle' }),
        tags: { [top.id]: 'popped' },
        cells: { [i]: 'active', [top.index]: 'compare' },
        stack: [...stack],
        floating: node,
        vars: [['i', i], ['value', value]],
      });
    }
    const top = stack[stack.length - 1];
    const why = top
      ? `${top.value} <= ${value}${top.value === value ? ' (equal values are not popped, so the earlier one stays the ancestor)' : ''}`
      : `the stack is empty, so ${value} is the smallest value so far`;
    if (lastPopped) node.left = lastPopped;
    if (top) top.right = node;
    else root = node;
    stack.push(node);
    snap(
      top ? 4 : lastPopped ? 3 : 5,
      `Stop: ${why}. ` +
        (lastPopped ? `The last popped node, ${lastPopped.value}, and everything under it become ${value}'s left subtree. ` : '') +
        (top ? `${value} becomes the right child of ${top.value}` : `${value} becomes the root`) +
        `, and is pushed: it is now the bottom-right end of the spine.`,
      {
        roles: { ...Object.fromEntries(stack.map((s) => [s.id, 'compare' as Role])), [node.id]: 'active', ...(lastPopped ? { [lastPopped.id]: 'done' as Role } : {}) },
        cells: { [i]: 'active' },
        stack: [...stack],
        vars: [['i', i], ['value', value]],
      },
    );
  }
  read = n;
  if (n) {
    snap(6, `All ${n} values are in. The root is the bottom of the stack, ${root!.value}, the minimum. Each value was pushed once and popped at most once, so the build is O(n). Reading the tree in-order gives the array back.`, {
      roles: { [root!.id]: 'done' },
      stack: [...stack],
    });
  }

  queries.forEach(([l, r], q) => {
    currentQuery = q;
    const range: Record<number, Role> = {};
    for (let i = Math.max(0, l); i <= Math.min(n - 1, r); i++) range[i] = 'compare';
    if (!root || l < 0 || r >= n || l > r) {
      const why = !root ? 'the tree is empty' : l < 0 ? `left = ${l} < 0` : r >= n ? `right = ${r} is past the last index ${n - 1}` : `left = ${l} > right = ${r}`;
      results.push(-1);
      paths.push([]);
      snap(7, `get_min_index(${l}, ${r}): ${why}, so the range is invalid and the method returns -1 (it does not raise).`, { cells: range, vars: [['left', l], ['right', r]] });
      return;
    }
    let node = root;
    const seen: Record<number, Role> = {};
    const path: number[] = [];
    const visited: number[] = [];
    snap(8, `get_min_index(${l}, ${r}): the minimum of array[${l}..${r}] is the lowest common ancestor of the nodes at ${l} and ${r}. Walk down from the root toward the range.`, {
      roles: { [node.id]: 'active' },
      cells: range,
      vars: [['left', l], ['right', r]],
    });
    for (;;) {
      visited.push(node.index);
      if (node.index < l) {
        snap(9, `${node.value} is at index ${node.index} < ${l}: it lies left of the range, and every index of the range is in its right subtree. Go right.`, {
          roles: { ...seen, [node.id]: 'active' },
          path: [...path],
          cells: { ...range, [node.index]: 'active' },
          vars: [['left', l], ['right', r], ['node.index', node.index]],
        });
        seen[node.id] = 'compare';
        node = node.right!;
      } else if (node.index > r) {
        snap(10, `${node.value} is at index ${node.index} > ${r}: it lies right of the range. Go left.`, {
          roles: { ...seen, [node.id]: 'active' },
          path: [...path],
          cells: { ...range, [node.index]: 'active' },
          vars: [['left', l], ['right', r], ['node.index', node.index]],
        });
        seen[node.id] = 'compare';
        node = node.left!;
      } else {
        results.push(node.index);
        paths.push(visited);
        snap(11, `${node.value} at index ${node.index} is inside [${l}, ${r}]: it is an ancestor of every node in the range and, by heap order, no larger than any of them. get_min_index returns ${node.index} (value ${node.value}) after ${visited.length} node${visited.length === 1 ? '' : 's'}.`, {
          roles: { ...seen, [node.id]: 'good' },
          path,
          cells: { ...range, [node.index]: 'good' },
          vars: [['left', l], ['right', r], ['result', node.index]],
        });
        break;
      }
      path.push(node.id);
    }
  });
  currentQuery = queries.length;
  if (queries.length) snap(undefined, `Done: ${queries.length} quer${queries.length === 1 ? 'y' : 'ies'}, each one root-to-LCA walk: O(h), where h is the height (n - 1 for a sorted array).`);
  return { frames, tree: nested(root), results, paths };
}
