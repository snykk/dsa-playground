/**
 * Priority queue tracer. Mirrors Data_Structures/Linear/Queue/Priority_Queue/Python/priority_queue.py:
 *   enqueue(item, priority): heapq.heappush(self.heap, (priority, self.count, item)); self.count += 1
 *   dequeue(): IndexError when empty, else priority, count, item = heapq.heappop(self.heap); return item
 *   peek(): self.heap[0][2];  clear(): self.heap = []; self.count = 0
 * and heapq's sift order (Lib/heapq.py _siftdown / _siftup; CPython runs the C versions in
 * Modules/_heapqmodule.c, which swap instead of moving a hole and leave the same array):
 *   heappush: append the entry, then siftdown(0, n - 1): while pos > 0 and entry < parent, swap them.
 *   heappop: last = heap.pop(); if entries remain: result = heap[0], heap[0] = last, then siftup(0):
 *     move the smaller child up (the right child unless left < right) until the entry reaches a leaf,
 *     never comparing the entry itself, then siftdown(0, pos) swaps it back up while entry < parent.
 * Entries compare as tuples: priority first, then the insertion counter, which is unique, so equal
 * priorities leave in insertion order and the item is never compared.
 * Golden fixtures (__fixtures__/stacksQueues.json) pin the heap array, the counter and every
 * return value after every operation.
 *
 * Input: "enqueue A 3, enqueue B 1, dequeue, peek"  ("A:3" is short for enqueue A 3)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { HeapNodeView, HeapState } from '../renderers/HeapView';
import { badValue, checkLive, opsStrip, plural, pyRepr, readCall, readValue, resultStrip, splitScript } from './stackQueueOps';
import type { PyResult } from './stack';

export type PqOp = { kind: 'enqueue'; item: string; priority: number } | { kind: 'dequeue' | 'peek' | 'size' | 'is_empty' | 'clear' };

export interface PqEntry {
  priority: number;
  count: number;
  item: string;
  /** Stable identity for the picture (the counter restarts after clear()). */
  id: number;
}

export interface PqStep {
  op: PqOp;
  result: PyResult;
  error: string | null;
  /** The heap list as Python holds it: (priority, count, item) tuples in index order. */
  heap: Array<[number, number, string]>;
  count: number;
}

export interface PqRun {
  frames: Array<Frame<HeapState>>;
  steps: PqStep[];
}

export const PQ_MAX_ENTRIES = 10;

const KINDS: Record<string, PqOp['kind']> = {
  enqueue: 'enqueue',
  enq: 'enqueue',
  push: 'enqueue',
  dequeue: 'dequeue',
  deq: 'dequeue',
  pop: 'dequeue',
  peek: 'peek',
  size: 'size',
  is_empty: 'is_empty',
  isempty: 'is_empty',
  empty: 'is_empty',
  clear: 'clear',
};

const SHORT = /^([A-Za-z0-9-]+)\s*:\s*(-?\d+)$/;

function readPriority(raw: string): number {
  if (!/^-?\d{1,2}$/.test(raw)) throw new InputError(`"${raw}" is not a priority: use a whole number from -99 to 99 (lower leaves first).`);
  return Number(raw);
}

function readEntry(itemRaw: string, priorityRaw: string): PqOp {
  const item = readValue(itemRaw);
  if (item === null) throw badValue(itemRaw, 'enqueue');
  return { kind: 'enqueue', item, priority: readPriority(priorityRaw) };
}

export function parsePriorityQueue(text: string, { maxOps = 30 } = {}): PqOp[] {
  const ops: PqOp[] = [];
  for (const raw of splitScript(text)) {
    const short = raw.match(SHORT);
    if (short) {
      ops.push(readEntry(short[1], short[2]));
      continue;
    }
    const call = readCall(raw);
    const kind = call ? KINDS[call.name] : undefined;
    if (!call || !kind) {
      throw new InputError(`Cannot read "${raw}". Write operations like "enqueue A 3" (or "A:3"), "dequeue", "peek", "size" or "clear", separated by commas.`);
    }
    if (kind === 'enqueue') {
      if (call.args.length !== 2) throw new InputError(`enqueue takes an item and a priority, e.g. "enqueue A 3" (got "${raw}").`);
      ops.push(readEntry(call.args[0], call.args[1]));
    } else {
      if (call.args.length > 0) throw new InputError(`${kind}() takes nothing (got "${raw}").`);
      ops.push({ kind });
    }
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, e.g. "enqueue A 3, enqueue B 1, dequeue".');
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  checkLive(ops, (op, live) => (op.kind === 'enqueue' ? 1 : op.kind === 'dequeue' && live > 0 ? -1 : op.kind === 'clear' ? -live : 0), PQ_MAX_ENTRIES, 'entries');
  return ops;
}

export function formatPqOp(op: PqOp): string {
  return op.kind === 'enqueue' ? `enqueue(${pyRepr(op.item)}, ${op.priority})` : `${op.kind}()`;
}

/** Python's tuple order for (priority, count, item). */
export function entryLess(a: PqEntry, b: PqEntry): boolean {
  if (a.priority !== b.priority) return a.priority < b.priority;
  if (a.count !== b.count) return a.count < b.count;
  return a.item < b.item;
}

const tuple = (e: PqEntry) => `(${e.priority}, ${e.count}, ${pyRepr(e.item)})`;

/** Why a < b (or not), in the words of a tuple comparison. */
function why(a: PqEntry, b: PqEntry): string {
  if (a.priority !== b.priority) return `${a.priority} ${a.priority < b.priority ? '<' : '>'} ${b.priority}`;
  return `equal priority ${a.priority}, and counter ${a.count} ${a.count < b.count ? '<' : '>'} ${b.count}`;
}

const pyBool = (b: boolean) => (b ? 'True' : 'False');

type Vars = Array<[string, string | number]>;

export function priorityQueue(ops: PqOp[]): PqRun {
  let heap: PqEntry[] = [];
  let count = 0;
  let ids = 0;
  let current = -1;
  const out: string[] = [];
  const labels = ops.map(formatPqOp);
  const frames: Array<Frame<HeapState>> = [];
  const steps: PqStep[] = [];

  interface Snap {
    roles?: Record<number, Role>;
    edges?: Record<number, Role>;
    leaving?: { entry: PqEntry; role?: Role };
    /** An empty-heap error: the heap[0] the call wanted does not exist. */
    missing?: boolean;
    vars?: Vars;
    fresh?: boolean;
  }
  const view = (e: PqEntry, role: Role): HeapNodeView => ({ id: e.id, label: e.priority, badge: `#${e.count}`, sub: e.item, role });
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const head: Vars = current >= 0 && current < ops.length ? [['op', labels[current]]] : [];
    frames.push({
      line,
      caption,
      vars: [...head, ['size', heap.length], ['count (next counter)', count], ['root', heap.length ? tuple(heap[0]) : '(empty)'], ...(o.vars ?? [])],
      state: {
        slots: heap.map((e, i) => view(e, o.roles?.[i] ?? 'idle')),
        floating: o.leaving ? [{ node: view(o.leaving.entry, o.leaving.role ?? 'done'), tag: 'returned' }] : undefined,
        edgeRoles: o.edges,
        markers: o.missing ? [{ index: 0, name: 'heap[0]', role: 'bad' }] : undefined,
        strips: [opsStrip(labels, current), resultStrip('Dequeued', out, o.fresh)],
      },
    });
  };
  const record = (op: PqOp, result: PyResult, error: string | null = null) =>
    steps.push({ op, result, error, heap: heap.map((e): [number, number, string] => [e.priority, e.count, e.item]), count });
  const swap = (i: number, j: number) => {
    [heap[i], heap[j]] = [heap[j], heap[i]];
  };

  /** heapq siftdown(startpos=0, pos): swap the entry with its parent while it is smaller. */
  const siftdown = (pos: number, line: number, leaving?: PqEntry, after = '') => {
    const keep = leaving ? { entry: leaving } : undefined;
    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const e = heap[pos];
      const p = heap[parent];
      if (!entryLess(e, p)) {
        snap(
          line,
          `${tuple(e)} is not smaller than its parent ${tuple(p)} at index ${parent} (${why(e, p)}), so it stays at index ${pos}: every parent is smaller than its children again.${after}`,
          { roles: { [pos]: 'active', [parent]: 'compare' }, edges: { [pos]: 'compare' }, leaving: keep, vars: [['i', pos], ['parent', parent]] },
        );
        return;
      }
      swap(pos, parent);
      snap(
        line,
        `${tuple(e)} < its parent ${tuple(p)} at index ${parent} (${why(e, p)}), so they swap: the entry rises to index ${parent}.${parent === 0 ? ` It is the root now.${after}` : ''}`,
        { roles: { [parent]: 'active', [pos]: 'compare' }, edges: { [pos]: 'active' }, leaving: keep, vars: [['i', parent], ['parent', parent]] },
      );
      pos = parent;
    }
  };

  snap(undefined, 'PriorityQueue(): self.heap = [] and self.count = 0. The heap is a list read as a complete binary tree: the children of index i sit at 2i + 1 and 2i + 2.');

  ops.forEach((op, i) => {
    current = i;
    if (op.kind === 'enqueue') {
      const entry: PqEntry = { priority: op.priority, count, item: op.item, id: ids++ };
      heap.push(entry);
      const n = heap.length - 1;
      const done = ` Then self.count becomes ${count + 1}.`;
      if (n === 0) {
        count += 1;
        snap(2, `enqueue(${pyRepr(op.item)}, ${op.priority}): heappush appends ${tuple(entry)} to the empty heap, so it is the root.${done}`, { roles: { 0: 'active' } });
        record(op, null);
        return;
      }
      snap(
        2,
        `enqueue(${pyRepr(op.item)}, ${op.priority}): heappush appends the entry ${tuple(entry)} at index ${n}, the next free leaf, so the tree stays complete. Its counter ${entry.count} records the arrival order.`,
        { roles: { [n]: 'active', [(n - 1) >> 1]: 'compare' }, edges: { [n]: 'compare' } },
      );
      siftdown(n, 3, undefined, done);
      count += 1;
      record(op, null);
      return;
    }
    if (op.kind === 'dequeue') {
      if (heap.length === 0) {
        snap(5, 'dequeue(): the heap is empty, so there is no heap[0] to return: dequeue raises IndexError("Priority queue is empty").', { missing: true });
        record(op, null, 'IndexError');
        return;
      }
      const last = heap.pop()!;
      let result: PqEntry;
      if (heap.length === 0) {
        result = last;
        snap(7, `heappop: last = heap.pop() takes ${tuple(last)}, the only entry, so it is the result and the heap is empty.`, { leaving: { entry: result } });
      } else {
        result = heap[0];
        heap[0] = last;
        snap(
          7,
          `heappop: last = heap.pop() takes ${tuple(last)} off the end. The root ${tuple(result)} is the smallest entry and becomes the result, and heap[0] = last fills the root${
            heap.length === 1 ? ': it is the only entry left, so there is nothing to sift.' : ', which may now be out of order.'
          }`,
          { roles: { 0: 'active' }, leaving: { entry: result } },
        );
        // siftup: move the smaller child up until the entry sits in a leaf.
        const n = heap.length;
        const limit = n >> 1;
        let pos = 0;
        while (pos < limit) {
          let child = 2 * pos + 1;
          const left = heap[child];
          let reason: string;
          if (child + 1 < n) {
            const right = heap[child + 1];
            if (!entryLess(left, right)) child += 1;
            reason = `its children are ${tuple(left)} at ${2 * pos + 1} and ${tuple(right)} at ${2 * pos + 2}; the smaller is ${tuple(heap[child])} (${why(heap[child], child === 2 * pos + 1 ? right : left)})`;
          } else {
            reason = `it has only a left child, ${tuple(left)} at ${child}`;
          }
          const moved = heap[child];
          swap(pos, child);
          snap(
            8,
            `siftup at index ${pos}: ${reason}. That child moves up and the entry moves down to index ${child}.${
              pos === 0 ? ' heapq does not compare the entry itself on the way down: it sinks to a leaf, then rises.' : ''
            }`,
            { roles: { [child]: 'active', [pos]: 'compare' }, edges: { [child]: 'active' }, leaving: { entry: result }, vars: [['i', child], ['moved up', tuple(moved)]] },
          );
          pos = child;
        }
        siftdown(pos, 9, result);
      }
      out.push(result.item);
      snap(6, `dequeue returns ${pyRepr(result.item)}, the item of ${tuple(result)}: the smallest entry, lowest priority first and the earliest counter among equals${heap.length ? '' : '. The heap is now empty'}.`, {
        fresh: true,
        roles: heap.length ? { 0: 'done' } : undefined,
      });
      record(op, result.item);
      return;
    }
    if (op.kind === 'peek') {
      if (heap.length === 0) {
        snap(10, 'peek(): the heap is empty, so there is no heap[0] to read: peek raises IndexError("Priority queue is empty").', { missing: true });
        record(op, null, 'IndexError');
        return;
      }
      snap(10, `peek() returns self.heap[0][2] = ${pyRepr(heap[0].item)}: the root ${tuple(heap[0])} is always the smallest entry, so nothing has to be searched.`, {
        roles: { 0: 'done' },
      });
      record(op, heap[0].item);
      return;
    }
    if (op.kind === 'size') {
      snap(11, `size() returns len(self.heap) = ${heap.length}.`);
      record(op, heap.length);
      return;
    }
    if (op.kind === 'is_empty') {
      snap(11, `is_empty() returns len(self.heap) == 0, which is ${pyBool(heap.length === 0)}.`);
      record(op, heap.length === 0);
      return;
    }
    const dropped = heap.length;
    heap = [];
    count = 0;
    snap(12, `clear(): self.heap = [] drops ${plural(dropped, 'entry', 'entries')} and self.count = 0 restarts the counter, which is safe because no old entry is left to tie with.`);
    record(op, null);
  });

  current = ops.length;
  snap(
    undefined,
    `Done: ${plural(heap.length, 'entry', 'entries')}${heap.length ? `, root ${tuple(heap[0])}` : ''}. Each enqueue and dequeue swapped along one path between the root and a leaf, so it took O(log n) steps.`,
  );
  return { frames, steps };
}
