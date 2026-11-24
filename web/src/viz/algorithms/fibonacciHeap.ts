/**
 * Fibonacci heap tracer, drawn with FibonacciHeapView (the root list as a row of trees).
 *
 * Mirrors Data_Structures/Non_Linear/Heaps/Fibonacci_Heap/Python/fibonacci_heap.py: FibonacciHeap,
 * node for node and pointer for pointer (left / right rings, parent, child, degree, marked, in_heap):
 *   insert(key): a one-node tree, returned as the handle; the first becomes min_node, later ones go
 *     through _add_to_root_list, which splices the node in right after min_node; min_node moves
 *     only when key < min_node.key (strict, so the earlier of equal keys stays the minimum).
 *   extract_min(): IndexError("Heap is empty") when empty. Each child of min_node, walking right
 *     from min_node.child, loses its parent and its mark and is spliced in right after min_node
 *     (so they land in reverse order). If min_node was alone, the heap becomes empty; otherwise
 *     min_node = min_node.right, the old minimum is unlinked and _consolidate() runs. _detach then
 *     sets in_heap = False (the handle is stale) and resets the node's links.
 *   _consolidate(): collect the roots walking right from min_node; for each, while the dict
 *     degree_table holds a tree of the same degree, the root with the larger key becomes the
 *     child of the other (on a tie the tree already in the table becomes the child), via _link,
 *     which inserts it right after parent.child and sets marked = False; then the root goes in
 *     the table under its new degree. The new min_node is the first smallest root in the dict's
 *     insertion order.
 *   decrease_key(node, k): ValueError for a stale handle, then for k > node.key. node.key = k; if
 *     it has a parent with a larger key, _cut(node, parent) (out of the child ring, parent.degree
 *     -= 1, spliced right after min_node, mark cleared) and _cascading_cut(parent): while the node
 *     has a parent, mark it and stop if it was unmarked, else cut it and climb. Last, min_node
 *     moves if k < min_node.key (strict).
 *   delete(node): ValueError for a stale handle; cut and cascade as above when the node has a
 *     parent, then min_node = node (as if its key were minus infinity, without writing one) and
 *     extract_min().
 *   merge(other): other's ring, from other.min_node, is spliced in right after min_node (four
 *     pointer writes); min_node moves if other.min_node.key is strictly smaller; the counts add up
 *     and other is emptied. Here "other" is always a fresh heap filled by insert.
 *   peek, size, is_empty, clear (every node detached, then min_node = None, count = 0).
 * The class takes no constructor argument: "build" raises TypeError.
 * Handles are numbered in insert order (the keys of a merge included); the script names a handle
 * after the key it was inserted with ("decrease_key 9 2" uses h9, the latest insert of 9).
 * Golden fixtures (__fixtures__/heapsGraphs.json) pin every tree (keys, degrees, child order,
 * marks), the root order from min_node, count and every return value after every operation.
 *
 * Input: "insert 5, insert 3, 7, extract, decrease_key 7 1, delete 5, merge 4 2, peek"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { FibHeapState, FibNodeView, FibPointerView, FibTableCell } from '../renderers/FibonacciHeapView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { HEAP_SCRIPT_HELP, readKey, readOp, splitOps } from './binaryHeap';
import { opsStrip, plural, resultStrip } from './stackQueueOps';

export type FibOp =
  | { kind: 'insert'; key: number }
  | { kind: 'extract' | 'peek' | 'size' | 'is_empty' | 'clear' }
  | { kind: 'build'; keys: number[] }
  /** handle: the index of the insert that made the node, counting the keys of every merge. */
  | { kind: 'decrease'; handle: number; key: number }
  | { kind: 'delete'; handle: number }
  /** other = FibonacciHeap(), the keys inserted into it in order, then heap.merge(other). */
  | { kind: 'merge'; keys: number[] };

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
  decrease_key: 'decrease',
  decreasekey: 'decrease',
  decrease: 'decrease',
  dec: 'decrease',
  delete: 'delete',
  del: 'delete',
  remove: 'delete',
  erase: 'delete',
  merge: 'merge',
  meld: 'merge',
  union: 'merge',
};

export const FIB_SCRIPT_HELP = `${HEAP_SCRIPT_HELP}, "decrease_key 9 2", "delete 9", "merge 4 8 1"`;

/**
 * Parse the heap script. "build" is accepted (the binary heap tabs share the script) and traced
 * as the TypeError the constructor raises; "extract_max" is not a method of this class.
 * decrease_key and delete name their handle by the key it was inserted with: h9 is the node of
 * the latest "insert 9" (or merge key 9) before the operation, whatever its key is now.
 */
export function parseFibScript(text: string): FibOp[] {
  const ops: FibOp[] = [];
  /** insert key -> the latest handle made with it */
  const named = new Map<number, number>();
  let handles = 0;
  const handleOf = (raw: string, segment: string): number => {
    const m = raw.match(/^h?(-?\d+)$/i);
    if (!m) throw new InputError(`"${segment}": name a node by the key it was inserted with, as in "delete 9" or "delete h9".`);
    const k = readKey(m[1]);
    const h = named.get(k);
    if (h === undefined) {
      throw new InputError(`"${segment}": there is no handle h${k} yet. A handle is named after the key it was inserted with, so insert ${k} first.`);
    }
    return h;
  };
  splitOps(text).forEach((segment, i) => {
    if (/^-?\d+$/.test(segment)) {
      const key = readKey(segment);
      ops.push({ kind: 'insert', key });
      named.set(key, handles++);
      return;
    }
    const call = readOp(segment);
    if (call && (call.name === 'extract_max' || call.name === 'extractmax')) {
      throw new InputError('FibonacciHeap has extract_min only: it is a min-heap. Write "extract".');
    }
    const kind = call ? KINDS[call.name] : undefined;
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write operations like ${FIB_SCRIPT_HELP}, separated by commas.`);
    if (kind === 'build') {
      if (i !== 0) throw new InputError('"build" calls the constructor, so it can only come first.');
      ops.push({ kind, keys: call.args.map((a) => readKey(a, 'value')) });
      return;
    }
    if (kind === 'insert') {
      if (call.args.length !== 1) throw new InputError(`"${segment}": insert takes one key, as in "insert 5".`);
      const key = readKey(call.args[0]);
      ops.push({ kind, key });
      named.set(key, handles++);
      return;
    }
    if (kind === 'decrease') {
      if (call.args.length !== 2) {
        throw new InputError(`"${segment}": decrease_key takes a handle and a new key, as in "decrease_key 9 2" (the node inserted as 9 gets key 2).`);
      }
      ops.push({ kind, handle: handleOf(call.args[0], segment), key: readKey(call.args[1]) });
      return;
    }
    if (kind === 'delete') {
      if (call.args.length !== 1) throw new InputError(`"${segment}": delete takes one handle, as in "delete 9" (the node inserted as 9).`);
      ops.push({ kind, handle: handleOf(call.args[0], segment) });
      return;
    }
    if (kind === 'merge') {
      const keys = call.args.map((a) => readKey(a));
      if (keys.length > FIB_LIMITS.maxSize) throw new InputError(`"${segment}": the other heap takes at most ${FIB_LIMITS.maxSize} keys.`);
      ops.push({ kind, keys });
      for (const key of keys) named.set(key, handles++);
      return;
    }
    if (call.args.length > 0) throw new InputError(`"${segment}": ${kind}() takes no value.`);
    ops.push({ kind });
  });
  if (ops.length === 0) throw new InputError(`Add at least one operation, for example ${FIB_SCRIPT_HELP}.`);
  if (ops.length > FIB_LIMITS.maxOps) throw new InputError(`At most ${FIB_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  // Which node an extract_min removes, and so whether a later delete removes anything, depends on
  // the shape of the heap: run it to count the keys.
  fibTrace(ops).steps.forEach((s, i) => {
    if (s.count > FIB_LIMITS.maxSize) throw new InputError(`At most ${FIB_LIMITS.maxSize} keys at once fit in the picture; operation ${i + 1} would make ${s.count}.`);
  });
  return ops;
}

/** The key each handle was inserted with, in handle order. */
function handleKeys(ops: FibOp[]): number[] {
  const keys: number[] = [];
  for (const op of ops) {
    if (op.kind === 'insert') keys.push(op.key);
    else if (op.kind === 'merge') keys.push(...op.keys);
  }
  return keys;
}

const handleName = (key: number) => `h${key}`;

/**
 * The operation as Python code. `keys` gives each handle's insert key, `handle` is the handle an
 * insert makes, and `named` lists the handles a later operation uses ("h5 = insert(5)").
 */
export function formatFibOp(op: FibOp, keys: number[] = [], handle = -1, named: Set<number> = new Set()): string {
  if (op.kind === 'insert') return named.has(handle) ? `${handleName(op.key)} = insert(${op.key})` : `insert(${op.key})`;
  if (op.kind === 'build') return `FibonacciHeap([${op.keys.join(', ')}])`;
  if (op.kind === 'decrease') return `decrease_key(${handleName(keys[op.handle])}, ${op.key})`;
  if (op.kind === 'delete') return `delete(${handleName(keys[op.handle])})`;
  if (op.kind === 'merge') return `merge(other: ${op.keys.length ? op.keys.join(', ') : 'empty'})`;
  return `${op.kind === 'extract' ? 'extract_min' : op.kind}()`;
}

/* ---------- pseudocode ---------- */

export const FIB_CODE = [
  'insert(key): node = FibonacciHeapNode(key)',
  '  if self.min_node is None: self.min_node = node',
  '  else: self._add_to_root_list(node)       # right after min_node',
  '    if key < self.min_node.key: self.min_node = node',
  '  self.count += 1; return node              # the handle',
  'extract_min(): if self.is_empty(): raise IndexError("Heap is empty")',
  '  min_node = self.min_node; min_key = min_node.key',
  '  for child in the ring of min_node.child: child.parent = None; child.marked = False; self._add_to_root_list(child)',
  '  if min_node == min_node.right: self.min_node = None',
  '  else: self.min_node = min_node.right; self._remove_from_root_list(min_node)',
  '    self._consolidate()',
  '  self._detach(min_node); self.count -= 1; return min_key   # _detach: in_heap = False',
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
  'size(): self.count   is_empty(): self.min_node is None   clear(): _detach every node; self.min_node = None; self.count = 0',
  '__init__(self): self.min_node = None; self.count = 0      # takes no arguments',
  'decrease_key(node, new_key): if not node.in_heap: raise ValueError("stale handle: ...")',
  '  if new_key > node.key: raise ValueError("new key is greater than the current key")',
  '  node.key = new_key; parent = node.parent',
  '  if parent is not None and node.key < parent.key: self._cut(node, parent); self._cascading_cut(parent)',
  '  if node.key < self.min_node.key: self.min_node = node',
  "_cut(node, parent): take node out of parent's child ring; parent.degree -= 1",
  '  self._add_to_root_list(node); node.parent = None; node.marked = False',
  '_cascading_cut(node): parent = node.parent; while parent is not None:',
  '  if not node.marked: node.marked = True; return       # its first lost child',
  '  self._cut(node, parent); node = parent; parent = node.parent   # its second',
  'delete(node): if not node.in_heap: raise ValueError("stale handle: ...")',
  '  if node.parent is not None: parent = node.parent; self._cut(node, parent); self._cascading_cut(parent)',
  '  self.min_node = node; self.extract_min()    # as if node.key were minus infinity',
  'merge(other): if other is self: raise ValueError(...)',
  "  splice other's root ring in right after min_node    # four pointer writes",
  '  if other.min_node.key < self.min_node.key: self.min_node = other.min_node',
  '  self.count += other.count; other.min_node = None; other.count = 0',
];

const L = {
  insertFirst: 1,
  insertSplice: 2,
  insertMin: 3,
  insertReturn: 4,
  extractEmpty: 5,
  extractTake: 6,
  promote: 7,
  alone: 8,
  unlink: 9,
  extractReturn: 11,
  collect: 12,
  table: 14,
  link: 16,
  store: 17,
  newMin: 18,
  peek: 21,
  misc: 22,
  ctor: 23,
  dkStale: 24,
  dkLarger: 25,
  dkSet: 26,
  dkMin: 28,
  cut: 29,
  cascade: 31,
  mark: 32,
  cascadeCut: 33,
  delStale: 34,
  delMin: 36,
  mergeSelf: 37,
  mergeSplice: 38,
  mergeMin: 39,
  mergeCount: 40,
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
  inHeap: boolean;
  /** Why the node left the heap, for the caption of a stale handle. */
  gone?: string;
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
  /** Python's repr of the return value ('None' for clear, the node for insert); null when it raised. */
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
  let cuts = 0;
  /** The root drawn first: kept stable so the row does not rotate when min_node moves. */
  let anchor: FNode | null = null;
  const keys = handleKeys(ops);
  const names = keys.map(handleName);
  const used = new Set<number>();
  for (const op of ops) if (op.kind === 'decrease' || op.kind === 'delete') used.add(op.handle);
  const labels: string[] = [];
  {
    let h = 0;
    for (const op of ops) {
      labels.push(formatFibOp(op, keys, h, used));
      if (op.kind === 'insert') h += 1;
      else if (op.kind === 'merge') h += op.keys.length;
    }
  }
  /** Every node ever made, by handle. */
  const handles: FNode[] = [];
  const out: string[] = [];
  const frames: Array<Frame<FibHeapState>> = [];
  const steps: FibStep[] = [];

  const make = (key: number): FNode => {
    const n = { id: ids++, key, degree: 0, parent: null, child: null, marked: false, inHeap: true } as unknown as FNode;
    n.left = n;
    n.right = n;
    handles.push(n);
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
  const detach = (node: FNode, why: string) => {
    node.inHeap = false;
    node.gone = why;
    node.parent = null;
    node.child = null;
    node.left = node;
    node.right = node;
  };
  const cutNode = (node: FNode, parent: FNode) => {
    if (node.right === node) parent.child = null;
    else {
      if (parent.child === node) parent.child = node.right;
      node.left.right = node.right;
      node.right.left = node.left;
    }
    parent.degree -= 1;
    addToRootList(node);
    node.parent = null;
    node.marked = false;
    cuts += 1;
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
    /** Nodes outside the heap: the extracted or deleted node, or the other heap of a merge. */
    floating?: Array<{ node: FNode; tag: string; role?: Role }>;
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
    marked: n.marked || undefined,
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
        ['cuts so far', cuts],
      ],
      state: {
        roots: roots.map((r) => view(r, o.roles, true)),
        floating: o.floating?.length
          ? o.floating.map((f) => ({ node: { id: f.node.id, label: f.node.key, role: f.role ?? 'done', children: [] }, tag: f.tag }))
          : undefined,
        pointers,
        table,
        strips,
      },
    });
  };
  const keysOf = (ns: FNode[]) => `[${ns.map((n) => n.key).join(', ')}]`;
  const forest = () => ring(minNode).map(dumpNode);

  const consolidate = () => {
    const start = minNode!;
    const nodes = ring(start);
    const table = new Map<number, FNode>();
    // Room for the degrees this run reaches: about log2(n) without cuts. A tree that lost nodes to
    // cuts can have a higher degree (degree d still means at least F(d + 2) nodes), so the table
    // also grows whenever a larger degree appears.
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
        tableSize = Math.max(tableSize, degree + 1);
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
        tableSize = Math.max(tableSize, degree + 1);
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

  /**
   * extract_min() on a non-empty heap. `deleting` names the handle when delete() made its node
   * min_node; the key then goes nowhere, because delete returns None.
   */
  const extractMin = (label: string, deleting: string | null): number => {
    const m: FNode = minNode!;
    const kids = ring(m.child);
    const tag = deleting ? 'deleted' : 'returned';
    const own: Role = deleting ? 'bad' : 'done';
    snap(
      L.extractTake,
      (deleting
        ? `extract_min(): min_node is the node of ${deleting} (key ${m.key}), so that node is removed, whatever the other keys are. `
        : `${label}: min_node holds ${m.key}, the smallest key, so min_key = ${m.key}. `) +
        (kids.length ? `Its ${plural(kids.length, 'child', 'children')} ${keysOf(kids)} must join the root list before it leaves.` : 'It has no children to move.'),
      { roles: new Map([[m, own]]) },
    );
    kids.forEach((child, i) => {
      const wasMarked = child.marked;
      child.parent = null;
      child.marked = false;
      addToRootList(child);
      snap(
        L.promote,
        `child ${child.key}: parent = None and _add_to_root_list splices it in right after min_node, so it becomes a root with its whole subtree.` +
          (wasMarked ? ' Its mark is cleared: a root is never marked.' : '') +
          (i > 0 ? ` It lands before ${kids[i - 1].key}: each promoted child goes right after min_node, so they end up in reverse order.` : ''),
        { roles: new Map<FNode, Role>([[m, own], [child, 'active']]) },
      );
    });
    if (m === m.right) {
      minNode = null;
      anchor = null;
      count -= 1;
      detach(m, deleting ? 'delete removed it' : 'extract_min returned it');
      if (!deleting) out.push(String(m.key));
      snap(
        L.alone,
        `min_node.right is min_node itself: it was the only root and had no children, so min_node = None and the heap is empty. ` +
          `_detach sets in_heap = False, so its handle is stale from now on. count = ${count}` +
          (deleting ? '.' : `; extract_min returns ${m.key}.`),
        { floating: [{ node: m, tag, role: own }], fresh: !deleting },
      );
      return m.key;
    }
    const next = m.right;
    if (anchor === m) anchor = next;
    minNode = next;
    removeFromRootList(m);
    snap(
      L.unlink,
      `min_node = min_node.right = ${next.key}, only a starting point for now, and ${m.key} is unlinked from the root list. ` +
        `The root list holds ${plural(ring(next).length, 'tree')}; _consolidate() cleans it up.`,
      { floating: [{ node: m, tag: 'min_key', role: own }], roles: new Map([[next, 'compare']]) },
    );
    consolidate();
    count -= 1;
    detach(m, deleting ? 'delete removed it' : 'extract_min returned it');
    if (!deleting) out.push(String(m.key));
    snap(
      L.extractReturn,
      `_detach sets in_heap = False on the old node, so its handle is stale from now on. count = ${count}` +
        (deleting ? `. The new min_node is ${minNode!.key}.` : `, and extract_min returns ${m.key}. The new min_node is ${minNode!.key}.`),
      { floating: [{ node: m, tag, role: own }], roles: new Map([[minNode!, 'done']]), fresh: !deleting },
    );
    return m.key;
  };

  /** _cut(node, parent), then _cascading_cut(parent), one frame per step. */
  const cutAndCascade = (node: FNode, parent: FNode, name: string, why: string) => {
    const pointer = { name, node, role: 'active' as Role };
    cutNode(node, parent);
    snap(
      L.cut,
      `_cut(${node.key}, ${parent.key}): ${why} The node leaves the children of ${parent.key}, whose degree drops to ${parent.degree}, and is spliced into the root list right after min_node ` +
        `with its whole subtree. node.parent = None and node.marked = False: a root is never marked.`,
      { roles: new Map<FNode, Role>([[node, 'active'], [parent, 'compare']]), pointers: [pointer] },
    );
    let y: FNode = parent;
    let z = y.parent;
    if (z === null) {
      snap(L.cascade, `_cascading_cut(${y.key}): ${y.key} is a root, and a root is never marked, so the walk stops at once.`, {
        roles: new Map<FNode, Role>([[node, 'active'], [y, 'compare']]),
        pointers: [pointer],
      });
      return;
    }
    while (z !== null) {
      if (!y.marked) {
        y.marked = true;
        snap(
          L.mark,
          `_cascading_cut(${y.key}): ${y.key} has lost its first child since it was linked under ${z.key}, so it is marked (dashed outline and a *) and the walk stops. ` +
            `If it loses a second child, it will be cut too.`,
          { roles: new Map<FNode, Role>([[node, 'active'], [y, 'compare']]), pointers: [pointer] },
        );
        return;
      }
      const above: FNode = z;
      cutNode(y, above);
      snap(
        L.cascadeCut,
        `_cascading_cut: ${y.key} was already marked, so this is its second lost child: it is cut from ${above.key} too and joins the root list, unmarked. ` +
          `Cutting it keeps every tree bushy: a node of degree d still roots at least F(d + 2) nodes. The walk climbs to ${above.key}.`,
        { roles: new Map<FNode, Role>([[node, 'active'], [y, 'active'], [above, 'compare']]), pointers: [pointer] },
      );
      y = above;
      z = y.parent;
      if (z === null) {
        snap(L.cascade, `${y.key} is a root, and a root is never marked: the cascade stops.`, {
          roles: new Map<FNode, Role>([[node, 'active'], [y, 'compare']]),
          pointers: [pointer],
        });
      }
    }
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
      const handle = handles.length - 1;
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
      if (used.has(handle)) {
        snap(
          L.insertReturn,
          `insert returns the node itself: the handle ${names[handle]}. A later decrease_key or delete passes it back, so the heap never has to search for the node.`,
          { roles: new Map([[node, 'active']]), pointers: [{ name: names[handle], node, role: 'active' }] },
        );
      }
      steps.push({ op, result: `FibonacciHeapNode(key=${op.key})`, error: null, roots: forest(), count });
      return;
    }
    if (op.kind === 'extract') {
      if (minNode === null) {
        snap(L.extractEmpty, `${label}: min_node is None, so the heap is empty: extract_min raises IndexError("Heap is empty").`);
        steps.push({ op, result: null, error: 'IndexError', roots: [], count });
        return;
      }
      const key = extractMin(label, null);
      steps.push({ op, result: String(key), error: null, roots: forest(), count });
      return;
    }
    if (op.kind === 'decrease' || op.kind === 'delete') {
      const node = handles[op.handle];
      const name = names[op.handle];
      const pointer = { name, node, role: 'active' as Role };
      if (!node.inHeap) {
        snap(
          op.kind === 'decrease' ? L.dkStale : L.delStale,
          `${label}: ${name} is a stale handle: its node already left the heap (${node.gone}), so in_heap is False and ${op.kind === 'decrease' ? 'decrease_key' : 'delete'} raises ValueError. Nothing changes.`,
        );
        steps.push({ op, result: null, error: 'ValueError', roots: forest(), count });
        return;
      }
      if (op.kind === 'decrease') {
        if (op.key > node.key) {
          snap(L.dkLarger, `${label}: ${op.key} > ${node.key}, the current key. decrease_key only lowers a key, so it raises ValueError and nothing changes.`, {
            roles: new Map([[node, 'bad']]),
            pointers: [{ name, node, role: 'bad' }],
          });
          steps.push({ op, result: null, error: 'ValueError', roots: forest(), count });
          return;
        }
        const old = node.key;
        node.key = op.key;
        const parent = node.parent;
        const breaks = parent !== null && node.key < parent.key;
        snap(
          L.dkSet,
          `${label}: node.key = ${op.key} (it was ${old}). ` +
            (parent === null
              ? 'The node is a root: no parent can be larger, so nothing is cut.'
              : breaks
                ? `Its parent ${parent.key} is now larger: heap order breaks, so the node is cut.`
                : `Its parent ${parent.key} is still <= ${op.key}: heap order holds and nothing moves.`),
          {
            roles: new Map<FNode, Role>(parent ? [[node, 'active'], [parent, 'compare']] : [[node, 'active']]),
            pointers: [pointer],
          },
        );
        if (breaks) cutAndCascade(node, parent!, name, `${op.key} < ${parent!.key}.`);
        const oldMin: FNode = minNode!;
        if (node.key < oldMin.key) {
          minNode = node;
          snap(L.dkMin, `${node.key} < ${oldMin.key}, the key at min_node, so min_node moves to this node.`, {
            roles: new Map([[node, 'done']]),
            pointers: [pointer],
          });
        } else {
          snap(
            L.dkMin,
            `${node.key} is not < ${oldMin.key}${node === oldMin ? ' (the node is min_node already)' : node.key === oldMin.key ? ' (a tie keeps the earlier minimum)' : ''}, so min_node stays.`,
            { roles: new Map<FNode, Role>(node === oldMin ? [[node, 'done']] : [[node, 'active'], [oldMin, 'done']]), pointers: [pointer] },
          );
        }
        steps.push({ op, result: 'None', error: null, roots: forest(), count });
        return;
      }
      const parent = node.parent;
      if (parent !== null) cutAndCascade(node, parent, name, `delete acts like decrease_key to minus infinity, which beats the parent ${parent.key}.`);
      minNode = node;
      snap(
        L.delMin,
        `${label}: min_node = the node of ${name} (key ${node.key}), as if its key were minus infinity. The key itself is never changed, so the key type needs no such value. Now extract_min() removes it.`,
        { roles: new Map([[node, 'bad']]), pointers: [{ name, node, role: 'bad' }] },
      );
      extractMin(label, name);
      steps.push({ op, result: 'None', error: null, roots: forest(), count });
      return;
    }
    if (op.kind === 'merge') {
      // other = FibonacciHeap(), then other.insert(key) for each key: its own root list.
      let otherMin: FNode | null = null;
      for (const key of op.keys) {
        const node = make(key);
        if (otherMin === null) otherMin = node;
        else {
          node.left = otherMin;
          node.right = otherMin.right;
          otherMin.right.left = node;
          otherMin.right = node;
          if (key < otherMin.key) otherMin = node;
        }
      }
      if (otherMin === null) {
        snap(L.mergeCount, `${label}: other is an empty heap, so there is nothing to splice: count stays ${count} and other stays empty.`);
        steps.push({ op, result: 'None', error: null, roots: forest(), count });
        return;
      }
      const theirs: FNode = otherMin;
      const others = ring(theirs);
      snap(
        L.mergeSelf,
        `${label}: other = FibonacciHeap() received [${op.keys.join(', ')}] by insert, so its root list holds ${plural(others.length, 'one-node tree')}, ` +
          `${keysOf(others)} from other.min_node = ${theirs.key}. merge(other) moves them all into this heap.`,
        {
          // No tag: the other.min_node label above the first one names the other heap.
          floating: others.map((n) => ({ node: n, tag: '', role: n === theirs ? 'compare' : 'idle' })),
          pointers: [{ name: 'other.min_node', node: theirs, role: 'compare' }],
        },
      );
      if (minNode === null) {
        minNode = theirs;
        anchor = theirs;
        count += others.length;
        snap(L.mergeSplice, `This heap is empty, so min_node = other.min_node = ${theirs.key}: other's whole root list is now this heap's. count = ${count}; other is emptied.`, {
          roles: new Map([[theirs, 'done']]),
        });
      } else {
        const mine: FNode = minNode;
        const last = theirs.left;
        const after = mine.right;
        mine.right = theirs;
        theirs.left = mine;
        last.right = after;
        after.left = last;
        snap(
          L.mergeSplice,
          `Splice: min_node.right = other.min_node, and other's last root (${last.key}) now leads on to ${after.key}: four pointer writes, ` +
            `no comparison and no link, so merge is O(1) whatever the sizes. The next extract_min consolidates them.`,
          { roles: new Map<FNode, Role>(others.map((n) => [n, 'active'] as [FNode, Role])) },
        );
        if (theirs.key < mine.key) {
          minNode = theirs;
          snap(L.mergeMin, `${theirs.key} < ${mine.key}, so min_node moves to other's minimum.`, { roles: new Map([[theirs, 'done']]) });
        } else {
          snap(L.mergeMin, `${theirs.key} is not < ${mine.key}${theirs.key === mine.key ? " (a tie keeps this heap's minimum)" : ''}, so min_node stays at ${mine.key}.`, {
            roles: new Map<FNode, Role>([[mine, 'done'], [theirs, 'compare']]),
          });
        }
        count += others.length;
        snap(L.mergeCount, `count = ${count}; other.min_node = None and other.count = 0. The handles of other's nodes stay valid and now belong to this heap.`);
      }
      steps.push({ op, result: 'None', error: null, roots: forest(), count });
      return;
    }
    if (op.kind === 'peek') {
      if (minNode === null) {
        snap(L.peek, `${label}: min_node is None, so peek raises IndexError("Heap is empty").`);
        steps.push({ op, result: null, error: 'IndexError', roots: [], count });
        return;
      }
      snap(L.peek, `${label} returns min_node.key = ${minNode.key} in O(1): every operation keeps the pointer up to date.`, {
        roles: new Map([[minNode, 'done']]),
      });
      steps.push({ op, result: String(minNode.key), error: null, roots: forest(), count });
      return;
    }
    if (op.kind === 'size') {
      snap(L.misc, `${label} returns self.count = ${count}, kept by every operation, so nothing is counted.`);
      steps.push({ op, result: String(count), error: null, roots: forest(), count });
      return;
    }
    if (op.kind === 'is_empty') {
      snap(L.misc, `${label} returns self.min_node is None, which is ${minNode === null ? 'True' : 'False'}.`);
      steps.push({ op, result: minNode === null ? 'True' : 'False', error: null, roots: forest(), count });
      return;
    }
    const had = count;
    const all: FNode[] = [];
    const rings: FNode[] = minNode ? [minNode] : [];
    while (rings.length) {
      for (const n of ring(rings.pop()!)) {
        all.push(n);
        if (n.child) rings.push(n.child);
      }
    }
    for (const n of all) detach(n, 'clear emptied the heap');
    minNode = null;
    anchor = null;
    count = 0;
    snap(
      L.misc,
      `${label}: _detach flags ${had === 1 ? 'the only node' : `all ${plural(had, 'node')}`} with in_heap = False, so every old handle is stale, then min_node = None and count = 0. ` +
        'O(n), because each node is visited once.',
    );
    steps.push({ op, result: 'None', error: null, roots: [], count });
  });

  current = ops.length;
  // minNode is assigned inside the callbacks above, which TypeScript does not track.
  const last = minNode as FNode | null;
  const roots = ring(last);
  snap(
    undefined,
    last
      ? `Done: ${plural(count, 'key')} in ${plural(roots.length, 'tree')}, min_node ${last.key}. Inserts and merges only spliced; extract_min linked trees of equal degree ` +
          `(${plural(links, 'link')} in total), and decrease_key and delete made ${plural(cuts, 'cut')}.`
      : `Done: the heap is empty. ${plural(links, 'link')} and ${plural(cuts, 'cut')} in total.`,
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
