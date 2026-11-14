/**
 * Fibonacci heap tracer, drawn with FibonacciHeapView (the root list as a row of trees).
 *
 * Mirrors Data_Structures/Non_Linear/Heaps/Fibonacci_Heap/Python/fibonacci_heap.py: FibonacciHeap,
 * node for node and pointer for pointer (left / right rings, parent, child, degree, marked):
 *   insert(key): a one-node tree; the first becomes min_node, later ones go through
 *     _add_to_root_list, which splices the node in right after min_node; min_node moves only
 *     when key < min_node.key (strict, so the earlier of equal keys stays the minimum).
 *   extract_min(): IndexError("Heap is empty") when empty. Each child of min_node, walking
 *     right from min_node.child, loses its parent and is spliced in right after min_node (so
 *     they land in reverse order). If min_node was alone, the heap becomes empty; otherwise
 *     min_node = min_node.right, the old minimum is unlinked and _consolidate() runs.
 *   _consolidate(): collect the roots walking right from min_node; for each, while the dict
 *     degree_table holds a tree of the same degree, the root with the larger key becomes the
 *     child of the other (on a tie the tree already in the table becomes the child), via _link,
 *     which inserts it right after parent.child and sets marked = False; then the root goes in
 *     the table under its new degree. The new min_node is the first smallest root in the dict's
 *     insertion order.
 *   peek, size, is_empty, clear (min_node = None, count = 0).
 * The class has no decrease_key, delete or merge, and no constructor argument: "build" raises
 * TypeError. `marked` is stored but never set to True, so no node is ever marked.
 * Golden fixtures (__fixtures__/heapsGraphs.json) pin every tree (keys, degrees, child order,
 * marks), the root order from min_node, count and every return value after every operation.
 *
 * Input: "insert 5, insert 3, 7, extract, peek"   (the heap script of the binary heaps)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { FibHeapState, FibNodeView, FibPointerView, FibTableCell } from '../renderers/FibonacciHeapView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { HEAP_SCRIPT_HELP, readKey, readOp, splitOps } from './binaryHeap';
import { opsStrip, plural, resultStrip } from './stackQueueOps';

export type FibOp = { kind: 'insert'; key: number } | { kind: 'extract' | 'peek' | 'size' | 'is_empty' | 'clear' } | { kind: 'build'; keys: number[] };

export const FIB_LIMITS = { maxOps: 30, maxSize: 15 };

const KINDS: Record<string, FibOp['kind']> = {
  insert: 'insert',
  push: 'insert',
  add: 'insert',
  ins: 'insert',
  extract: 'extract',
  extract_min: 'extract',
  extractmin: 'extract',
  pop: 'extract',
  peek: 'peek',
  top: 'peek',
  size: 'size',
  len: 'size',
  is_empty: 'is_empty',
  isempty: 'is_empty',
  empty: 'is_empty',
  clear: 'clear',
  build: 'build',
  heapify: 'build',
};

/**
 * Parse the heap script. "build" is accepted (the binary heap tabs share the script) and traced
 * as the TypeError the constructor raises; "extract_max" is not a method of this class.
 */
export function parseFibScript(text: string): FibOp[] {
  const ops: FibOp[] = [];
  splitOps(text).forEach((segment, i) => {
    if (/^-?\d+$/.test(segment)) {
      ops.push({ kind: 'insert', key: readKey(segment) });
      return;
    }
    const call = readOp(segment);
    if (call && (call.name === 'extract_max' || call.name === 'extractmax')) {
      throw new InputError('FibonacciHeap has extract_min only: it is a min-heap. Write "extract".');
    }
    const kind = call ? KINDS[call.name] : undefined;
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write operations like ${HEAP_SCRIPT_HELP}, separated by commas.`);
    if (kind === 'build') {
      if (i !== 0) throw new InputError('"build" calls the constructor, so it can only come first.');
      ops.push({ kind, keys: call.args.map((a) => readKey(a, 'value')) });
      return;
    }
    if (kind === 'insert') {
      if (call.args.length !== 1) throw new InputError(`"${segment}": insert takes one key, as in "insert 5".`);
      ops.push({ kind, key: readKey(call.args[0]) });
      return;
    }
    if (call.args.length > 0) throw new InputError(`"${segment}": ${kind}() takes no value.`);
    ops.push({ kind });
  });
  if (ops.length === 0) throw new InputError(`Add at least one operation, for example ${HEAP_SCRIPT_HELP}.`);
  if (ops.length > FIB_LIMITS.maxOps) throw new InputError(`At most ${FIB_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  let live = 0;
  ops.forEach((op, i) => {
    if (op.kind === 'insert') live += 1;
    else if (op.kind === 'extract' && live > 0) live -= 1;
    else if (op.kind === 'clear') live = 0;
    if (live > FIB_LIMITS.maxSize) throw new InputError(`At most ${FIB_LIMITS.maxSize} keys at once fit in the picture; operation ${i + 1} would make ${live}.`);
  });
  return ops;
}

export function formatFibOp(op: FibOp): string {
  if (op.kind === 'insert') return `insert(${op.key})`;
  if (op.kind === 'build') return `FibonacciHeap([${op.keys.join(', ')}])`;
  return `${op.kind === 'extract' ? 'extract_min' : op.kind}()`;
}

/* ---------- pseudocode ---------- */

export const FIB_CODE = [
  'insert(key): node = FibonacciHeapNode(key)',
  '  if self.min_node is None: self.min_node = node',
  '  else: self._add_to_root_list(node)       # right after min_node',
  '    if key < self.min_node.key: self.min_node = node',
  '  self.count += 1',
  'extract_min(): if self.is_empty(): raise IndexError("Heap is empty")',
  '  min_node = self.min_node; min_key = min_node.key',
  '  for child in the ring of min_node.child: child.parent = None; self._add_to_root_list(child)',
  '  if min_node == min_node.right: self.min_node = None',
  '  else: self.min_node = min_node.right; self._remove_from_root_list(min_node)',
  '    self._consolidate()',
  '  self.count -= 1; return min_key',
  '_consolidate(): degree_table = {}; nodes_to_process = the roots, from min_node rightwards',
  '  for node in nodes_to_process: degree = node.degree',
  '    while degree in degree_table: other = degree_table[degree]',
  '      if node.key > other.key: node, other = other, node',
  '      self._link(other, node); del degree_table[degree]; degree += 1',
  '    degree_table[degree] = node',
  '  self.min_node = the first smallest key in degree_table.values()',
  '_link(child, parent): remove child from the root list; child.parent = parent; child.marked = False',
  '  insert child right after parent.child; parent.degree += 1',
  'peek(): if self.is_empty(): raise IndexError(...); return self.min_node.key',
  'size(): self.count   is_empty(): self.min_node is None   clear(): self.min_node = None; self.count = 0',
  '__init__(self): self.min_node = None; self.count = 0      # takes no arguments',
];

const L = {
  insertNew: 0,
  insertFirst: 1,
  insertSplice: 2,
  insertMin: 3,
  extractEmpty: 5,
  extractTake: 6,
  promote: 7,
  alone: 8,
  unlink: 9,
  consolidate: 10,
  extractReturn: 11,
  collect: 12,
  outer: 13,
  table: 14,
  swap: 15,
  link: 16,
  store: 17,
  newMin: 18,
  peek: 21,
  misc: 22,
  ctor: 23,
};

/* ---------- the Python structure, pointer for pointer ---------- */

interface FNode {
  id: number;
  key: number;
  degree: number;
  parent: FNode | null;
  child: FNode | null;
  left: FNode;
  right: FNode;
  marked: boolean;
}

/** The ring that starts at `start` and follows .right. */
function ring(start: FNode | null): FNode[] {
  if (!start) return [];
  const out: FNode[] = [];
  let cur = start;
  do {
    out.push(cur);
    cur = cur.right;
  } while (cur !== start && out.length < 1000);
  return out;
}

/** A tree as the fixture stores it: [key, degree, marked, [children from node.child rightwards]]. */
export type FibDump = [number, number, boolean, FibDump[]];

function dumpNode(n: FNode): FibDump {
  return [n.key, n.degree, n.marked, ring(n.child).map(dumpNode)];
}

export interface FibStep {
  op: FibOp;
  /** Python's repr of the return value ('None' for insert and clear); null when it raised. */
  result: string | null;
  error: string | null;
  /** The trees in root-list order, starting at min_node. */
  roots: FibDump[];
  count: number;
}

export interface FibRun {
  frames: Array<Frame<FibHeapState>>;
  steps: FibStep[];
}

export function fibTrace(ops: FibOp[]): FibRun {
  let minNode: FNode | null = null;
  let count = 0;
  let ids = 0;
  let current = -1;
  let links = 0;
  /** The root drawn first: kept stable so the row does not rotate when min_node moves. */
  let anchor: FNode | null = null;
  const labels = ops.map(formatFibOp);
  const out: string[] = [];
  const frames: Array<Frame<FibHeapState>> = [];
  const steps: FibStep[] = [];

  const make = (key: number): FNode => {
    const n = { id: ids++, key, degree: 0, parent: null, child: null, marked: false } as unknown as FNode;
    n.left = n;
    n.right = n;
    return n;
  };
  const addToRootList = (node: FNode) => {
    if (!minNode) return;
    node.left = minNode;
    node.right = minNode.right;
    minNode.right.left = node;
    minNode.right = node;
  };
  const removeFromRootList = (node: FNode) => {
    node.left.right = node.right;
    node.right.left = node.left;
  };
  const link = (child: FNode, parent: FNode) => {
    removeFromRootList(child);
    child.parent = parent;
    child.marked = false;
    if (parent.child === null) {
      parent.child = child;
      child.left = child;
      child.right = child;
    } else {
      child.left = parent.child;
      child.right = parent.child.right;
      parent.child.right.left = child;
      parent.child.right = child;
    }
    parent.degree += 1;
    links += 1;
  };

  /** The root of the tree that holds n (a linked node climbs to its root, which is in the root list). */
  const rootOf = (n: FNode): FNode => {
    let a = n;
    while (a.parent) a = a.parent;
    return a;
  };
  /**
   * The live roots in drawing order: the root ring entered at `from` (or at the root of its
   * tree), rotated to start at the anchor's tree, so the row keeps its place when min_node moves.
   */
  const rootsInOrder = (from: FNode | null): FNode[] => {
    if (!from) return [];
    const all = ring(rootOf(from));
    if (anchor) {
      const a = rootOf(anchor);
      if (all.includes(a)) {
        anchor = a;
        return ring(a);
      }
    }
    anchor = all[0];
    return all;
  };

  interface Snap {
    /** Where the root ring is entered (min_node, or the start node during an extract). */
    from?: FNode | null;
    roles?: Map<FNode, Role>;
    pointers?: Array<{ name: string; node: FNode; role?: Role }>;
    leaving?: { node: FNode; tag: string; role?: Role };
    table?: { entries: Map<number, FNode>; size: number; touched?: number; role?: Role } | null;
    process?: { nodes: FNode[]; at: number };
    vars?: Array<[string, string | number]>;
    fresh?: boolean;
  }

  let tableSize = 0;
  // A promoted child keeps min_node.child pointing at it, but its parent is None: draw real children only.
  const view = (n: FNode, roles: Map<FNode, Role> | undefined, root: boolean): FibNodeView => ({
    id: n.id,
    label: n.key,
    role: roles?.get(n) ?? 'idle',
    badge: root ? `d${n.degree}` : undefined,
    children: ring(n.child)
      .filter((c) => c.parent === n)
      .map((c) => view(c, roles, false)),
  });
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const from = o.from === undefined ? minNode : o.from;
    const roots = rootsInOrder(from);
    const pointers: FibPointerView[] = [];
    if (minNode) pointers.push({ name: 'min_node', target: minNode.id, role: 'done' });
    for (const p of o.pointers ?? []) pointers.push({ name: p.name, target: p.node.id, role: p.role });
    const strips: StripData[] = [];
    if (ops.length) strips.push(opsStrip(labels, current));
    if (o.process) {
      strips.push({
        label: 'nodes_to_process',
        items: o.process.nodes.map((n, i): StripItem => ({ text: String(n.key), role: i === o.process!.at ? 'active' : i < o.process!.at ? 'muted' : undefined })),
      });
    }
    strips.push(resultStrip('Extracted', out, o.fresh));
    let table: FibTableCell[] | undefined;
    if (o.table) {
      const t = o.table;
      table = Array.from({ length: t.size }, (_, d) => {
        const n = t.entries.get(d);
        return { degree: d, id: n ? n.id : null, label: n ? String(n.key) : '', role: t.touched === d ? t.role : undefined };
      });
    }
    frames.push({
      line,
      caption,
      vars: [
        ...(current >= 0 && current < ops.length ? ([['op', labels[current]]] as Array<[string, string]>) : []),
        ['count', count],
        ['min_node', minNode ? minNode.key : 'None'],
        ['roots', roots.length],
        ...(o.vars ?? []),
        ['links so far', links],
      ],
      state: {
        roots: roots.map((r) => view(r, o.roles, true)),
        floating: o.leaving ? [{ node: { id: o.leaving.node.id, label: o.leaving.node.key, role: o.leaving.role ?? 'done', children: [] }, tag: o.leaving.tag }] : undefined,
        pointers,
        table,
        strips,
      },
    });
  };
  const keysOf = (ns: FNode[]) => `[${ns.map((n) => n.key).join(', ')}]`;

  const consolidate = () => {
    const start = minNode!;
    const nodes = ring(start);
    const table = new Map<number, FNode>();
    // Room for every degree this run reaches: a tree of degree d has 2^d nodes here (no cuts).
    tableSize = Math.max(tableSize, Math.floor(Math.log2(Math.max(1, count))) + 1);
    snap(
      L.collect,
      `_consolidate: nodes_to_process = ${keysOf(nodes)}, the ${plural(nodes.length, 'root')} walking right from min_node. ` +
        `Each one goes into degree_table under its degree; two trees of the same degree are linked into one, so at most one tree per degree survives.`,
      { from: start, table: { entries: table, size: tableSize }, process: { nodes, at: -1 } },
    );
    nodes.forEach((first, at) => {
      let node = first;
      let degree = node.degree;
      const process = { nodes, at };
      if (!table.has(degree)) {
        table.set(degree, node);
        snap(L.store, `node = ${node.key}, degree ${degree}. degree_table has no tree of degree ${degree}, so degree_table[${degree}] = ${node.key}.`, {
          from: start,
          roles: new Map([[node, 'active']]),
          pointers: [{ name: 'node', node, role: 'active' }],
          table: { entries: table, size: tableSize, touched: degree, role: 'active' },
          process,
          vars: [['degree', degree]],
        });
        return;
      }
      while (table.has(degree)) {
        let other = table.get(degree)!;
        snap(
          L.table,
          `node = ${node.key}, degree ${degree}. degree_table[${degree}] already holds ${other.key}: two trees of degree ${degree}, so they are linked into one of degree ${degree + 1}.`,
          {
            from: start,
            roles: new Map<FNode, Role>([
              [node, 'active'],
              [other, 'compare'],
            ]),
            pointers: [
              { name: 'node', node, role: 'active' },
              { name: 'other', node: other, role: 'compare' },
            ],
            table: { entries: table, size: tableSize, touched: degree, role: 'compare' },
            process,
            vars: [['degree', degree]],
          },
        );
        let why: string;
        if (node.key > other.key) {
          why = `${node.key} > ${other.key}, so node and other swap: ${other.key} stays a root and ${node.key} becomes its child`;
          [node, other] = [other, node];
        } else if (node.key === other.key) {
          why = `${node.key} is not > ${other.key} (a tie), so ${other.key}, the tree already in the table, becomes the child of node`;
        } else {
          why = `${node.key} < ${other.key}, so ${other.key} becomes the child of ${node.key}`;
        }
        const firstChild = node.child;
        link(other, node);
        table.delete(degree);
        degree += 1;
        snap(
          L.link,
          `${why}: _link(other, node) unlinks ${other.key} from the root list and inserts it ${firstChild ? `right after ${firstChild.key}, node.child` : 'as the only child'}. ` +
            `Heap order holds, because the smaller key is on top. del degree_table[${degree - 1}]; node.degree and degree are now ${degree}.`,
          {
            from: start,
            roles: new Map<FNode, Role>([
              [node, 'active'],
              [other, 'compare'],
            ]),
            pointers: [{ name: 'node', node, role: 'active' }],
            table: { entries: table, size: tableSize, touched: degree - 1, role: 'muted' },
            process,
            vars: [['degree', degree]],
          },
        );
      }
      table.set(degree, node);
      snap(L.store, `degree_table has no tree of degree ${degree}, so degree_table[${degree}] = ${node.key}.`, {
        from: start,
        roles: new Map([[node, 'active']]),
        pointers: [{ name: 'node', node, role: 'active' }],
        table: { entries: table, size: tableSize, touched: degree, role: 'active' },
        process,
        vars: [['degree', degree]],
      });
    });
    let best: FNode | null = null;
    for (const n of table.values()) if (best === null || n.key < best.key) best = n;
    minNode = best;
    const order = [...table.values()];
    const ties = order.filter((n) => n.key === best!.key).length > 1;
    snap(
      L.newMin,
      `The new min_node is the smallest key among degree_table.values(), read in insertion order: ${keysOf(order)} gives ${best!.key}` +
        (ties ? ', the first of the equal keys, because the comparison is a strict <.' : '.') +
        ` ${plural(order.length, 'tree')} remain, one per degree.`,
      { roles: new Map([[best!, 'done']]), table: { entries: table, size: tableSize, touched: undefined } },
    );
  };

  snap(undefined, 'FibonacciHeap(): min_node = None and count = 0. The heap will be a circular list of heap-ordered trees (the root list), entered at min_node, the root with the smallest key.');

  ops.forEach((op, k) => {
    current = k;
    const label = labels[k];
    if (op.kind === 'build') {
      snap(
        L.ctor,
        `${label} raises TypeError: __init__ takes no arguments, because this class has no build-from-array. The run continues with the empty heap; insert the keys one by one instead.`,
      );
      steps.push({ op, result: null, error: 'TypeError', roots: [], count });
      return;
    }
    if (op.kind === 'insert') {
      const node = make(op.key);
      if (minNode === null) {
        minNode = node;
        anchor = node;
        count += 1;
        snap(L.insertFirst, `${label}: the heap is empty, so the new node becomes min_node. Its left and right point to itself: a root list of one tree. count = ${count}.`, {
          roles: new Map([[node, 'active']]),
        });
      } else {
        const old: FNode = minNode;
        addToRootList(node);
        snap(
          L.insertSplice,
          `${label}: _add_to_root_list splices the new one-node tree in right after min_node (${old.key}): four pointer updates, no comparison with the other roots. This laziness is what makes insert O(1).`,
          { roles: new Map([[node, 'active']]) },
        );
        count += 1;
        if (op.key < old.key) {
          minNode = node;
          snap(L.insertMin, `${op.key} < ${old.key}, so min_node moves to the new node. count = ${count}.`, { roles: new Map([[node, 'done']]) });
        } else {
          snap(
            L.insertMin,
            `${op.key} is not < ${old.key}${op.key === old.key ? ' (equal keys keep the earlier minimum)' : ''}, so min_node stays at ${old.key}. count = ${count}.`,
            { roles: new Map<FNode, Role>([[node, 'active'], [old, 'done']]) },
          );
        }
      }
      steps.push({ op, result: 'None', error: null, roots: ring(minNode).map(dumpNode), count });
      return;
    }
    if (op.kind === 'extract') {
      if (minNode === null) {
        snap(L.extractEmpty, `${label}: min_node is None, so the heap is empty: extract_min raises IndexError("Heap is empty").`);
        steps.push({ op, result: null, error: 'IndexError', roots: [], count });
        return;
      }
      const m: FNode = minNode;
      const kids = ring(m.child);
      snap(
        L.extractTake,
        `${label}: min_node holds ${m.key}, the smallest key, so min_key = ${m.key}. ` +
          (kids.length
            ? `Its ${plural(kids.length, 'child', 'children')} ${keysOf(kids)} must join the root list before it leaves.`
            : 'It has no children to move.'),
        { roles: new Map([[m, 'done']]) },
      );
      kids.forEach((child, i) => {
        child.parent = null;
        addToRootList(child);
        snap(
          L.promote,
          `child ${child.key}: parent = None and _add_to_root_list splices it in right after min_node, so it becomes a root with its whole subtree.` +
            (i > 0 ? ` It lands before ${kids[i - 1].key}: each promoted child goes right after min_node, so they end up in reverse order.` : ''),
          { roles: new Map<FNode, Role>([[m, 'done'], [child, 'active']]) },
        );
      });
      if (m === m.right) {
        minNode = null;
        anchor = null;
        count -= 1;
        out.push(String(m.key));
        snap(L.alone, `min_node.right is min_node itself: it was the only root and had no children, so min_node = None and the heap is empty. count = ${count}; extract_min returns ${m.key}.`, {
          leaving: { node: m, tag: 'returned' },
          fresh: true,
        });
        steps.push({ op, result: String(m.key), error: null, roots: [], count });
        return;
      }
      const next = m.right;
      if (anchor === m) anchor = next;
      minNode = next;
      removeFromRootList(m);
      snap(
        L.unlink,
        `min_node = min_node.right = ${next.key}, only a starting point for now, and ${m.key} is unlinked from the root list. ` +
          `The root list holds ${plural(ring(next).length, 'tree')}; _consolidate() cleans it up.`,
        { leaving: { node: m, tag: 'min_key' }, roles: new Map([[next, 'compare']]) },
      );
      consolidate();
      count -= 1;
      out.push(String(m.key));
      snap(L.extractReturn, `count = ${count}, and extract_min returns ${m.key}. The new min_node is ${minNode!.key}.`, {
        leaving: { node: m, tag: 'returned' },
        roles: new Map([[minNode!, 'done']]),
        fresh: true,
      });
      steps.push({ op, result: String(m.key), error: null, roots: ring(minNode).map(dumpNode), count });
      return;
    }
    if (op.kind === 'peek') {
      if (minNode === null) {
        snap(L.peek, `${label}: min_node is None, so peek raises IndexError("Heap is empty").`);
        steps.push({ op, result: null, error: 'IndexError', roots: [], count });
        return;
      }
      snap(L.peek, `${label} returns min_node.key = ${minNode.key} in O(1): the pointer is kept up to date by insert and extract_min.`, {
        roles: new Map([[minNode, 'done']]),
      });
      steps.push({ op, result: String(minNode.key), error: null, roots: ring(minNode).map(dumpNode), count });
      return;
    }
    if (op.kind === 'size') {
      snap(L.misc, `${label} returns self.count = ${count}, kept by insert and extract_min, so nothing is counted.`);
      steps.push({ op, result: String(count), error: null, roots: ring(minNode).map(dumpNode), count });
      return;
    }
    if (op.kind === 'is_empty') {
      snap(L.misc, `${label} returns self.min_node is None, which is ${minNode === null ? 'True' : 'False'}.`);
      steps.push({ op, result: minNode === null ? 'True' : 'False', error: null, roots: ring(minNode).map(dumpNode), count });
      return;
    }
    const had = count;
    minNode = null;
    anchor = null;
    count = 0;
    snap(L.misc, `${label}: min_node = None and count = 0 forget all ${plural(had, 'node')} in O(1).`);
    steps.push({ op, result: 'None', error: null, roots: [], count });
  });

  current = ops.length;
  // minNode is assigned inside the callbacks above, which TypeScript does not track.
  const last = minNode as FNode | null;
  const roots = ring(last);
  snap(
    undefined,
    last
      ? `Done: ${plural(count, 'key')} in ${plural(roots.length, 'tree')}, min_node ${last.key}. Inserts only spliced, and every extract_min linked trees of equal degree, ${plural(links, 'link')} in total. No node is ever marked: marked is only reset by _link.`
      : `Done: the heap is empty. ${plural(links, 'link')} in total.`,
    { roles: last ? new Map([[last, 'done']]) : undefined },
  );
  // Every frame shows the same degree table width once a consolidation has run.
  if (tableSize > 0) {
    for (const f of frames) {
      if (f.state.table && f.state.table.length < tableSize) {
        const t = f.state.table;
        for (let d = t.length; d < tableSize; d++) t.push({ degree: d, id: null, label: '' });
      }
    }
  }
  return { frames, steps };
}

/** Dump helper for tests: the keys of a FibDump forest in any order. */
export function fibKeys(roots: FibDump[]): number[] {
  const out: number[] = [];
  const walk = (t: FibDump) => {
    out.push(t[0]);
    t[3].forEach(walk);
  };
  roots.forEach(walk);
  return out;
}
