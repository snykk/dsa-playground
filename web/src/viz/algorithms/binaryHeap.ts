/**
 * Min heap and max heap tracers, drawn with HeapView (the tree and the array at once).
 *
 * Mirrors two Python classes, which differ only in their comparisons:
 *   'min' Data_Structures/Non_Linear/Heaps/Min_Heap/Python/min_heap.py: MinHeap
 *   'max' Data_Structures/Non_Linear/Heaps/Max_Heap/Python/max_heap.py: MaxHeap
 * __init__(arr): self.heap = arr.copy(); self._heapify(), which runs _heapify_down(i) for i
 *   from n // 2 - 1 down to 0 (bottom-up heapify).
 * insert(value): append, then _heapify_up: while index > 0, stop when heap[parent] <= heap[index]
 *   (max: >=), else swap with the parent. Equal keys never swap.
 * extract_min / extract_max: IndexError("Heap is empty") when empty; one element: return
 *   heap.pop(); else min_val = heap[0], heap[0] = heap.pop(), _heapify_down(0).
 * _heapify_down: smallest = index; take the left child if heap[left] < heap[smallest], then the
 *   right child if heap[right] < heap[smallest] (max: >, largest). Strict comparisons, so on a
 *   tie between the children the left one wins, and a child equal to the parent never swaps.
 * peek: IndexError when empty, else heap[0]. size, is_empty, clear: on the list.
 * Golden fixtures (__fixtures__/heapsGraphs.json) pin the array after the constructor and after
 * every operation, and every return value.
 *
 * Input: "build 9 5 7 1; insert 4, extract, peek"   (a bare number inserts it)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { HeapMarkerView, HeapNodeView, HeapState } from '../renderers/HeapView';
import type { StripData } from '../ui/molecules/Strip';
import { opsStrip, plural, resultStrip } from './stackQueueOps';

export type HeapMode = 'min' | 'max';

export type HeapOp = { kind: 'insert'; value: number } | { kind: 'extract' | 'peek' | 'size' | 'is_empty' | 'clear' };

export interface HeapInput {
  /** The constructor's array, or null for MinHeap() / MaxHeap(). */
  build: number[] | null;
  ops: HeapOp[];
}

export const HEAP_LIMITS = { maxOps: 30, maxSize: 15, lo: -99, hi: 999 };

/* ---------- script syntax (shared with the Fibonacci heap) ---------- */

/** Operations are separated by commas, semicolons or new lines; commas inside () or [] belong to the call. */
export function splitOps(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth += 1;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if ((ch === ';' || ch === '\n' || ch === ',') && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((t) => t.trim()).filter(Boolean);
}

/** "insert 5", "insert(5)", "build [9, 5, 7]", "extract": the lower-case name and its argument tokens. */
export function readOp(segment: string): { name: string; args: string[] } | null {
  const m = segment.match(/^([A-Za-z_]+)\s*(.*)$/);
  if (!m) return null;
  const rest = m[2].trim().replace(/^\(\s*|\s*\)$/g, '').replace(/^\[\s*|\s*\]$/g, '');
  return { name: m[1].toLowerCase(), args: rest.split(/[\s,]+/).filter(Boolean) };
}

export function readKey(raw: string, what = 'key'): number {
  if (!/^-?\d+$/.test(raw)) throw new InputError(`"${raw}" is not a whole number: every ${what} is an integer from ${HEAP_LIMITS.lo} to ${HEAP_LIMITS.hi}.`);
  const v = Number(raw) || 0;
  if (v < HEAP_LIMITS.lo || v > HEAP_LIMITS.hi) throw new InputError(`${raw} is out of range: every ${what} goes from ${HEAP_LIMITS.lo} to ${HEAP_LIMITS.hi}, so it fits in a node.`);
  return v;
}

const KINDS: Record<string, HeapOp['kind'] | 'build'> = {
  insert: 'insert',
  push: 'insert',
  add: 'insert',
  ins: 'insert',
  extract: 'extract',
  extract_min: 'extract',
  extract_max: 'extract',
  extractmin: 'extract',
  extractmax: 'extract',
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
  minheap: 'build',
  maxheap: 'build',
};

export const HEAP_SCRIPT_HELP = '"insert 5" (or just "5"), "extract", "peek", "size", "is_empty", "clear"';

/** Parse the shared heap script: an optional "build 9 5 7" first, then operations. */
export function parseHeapScript(text: string): HeapInput {
  let build: number[] | null = null;
  const ops: HeapOp[] = [];
  splitOps(text).forEach((segment, i) => {
    if (/^-?\d+$/.test(segment)) {
      ops.push({ kind: 'insert', value: readKey(segment) });
      return;
    }
    const call = readOp(segment);
    const kind = call ? KINDS[call.name] : undefined;
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write operations like ${HEAP_SCRIPT_HELP}, separated by commas.`);
    if (kind === 'build') {
      if (i !== 0) throw new InputError('"build" calls the constructor, so it can only come first, as in "build 9 5 7 1; insert 4".');
      if (call.args.length > HEAP_LIMITS.maxSize) throw new InputError(`Build from at most ${HEAP_LIMITS.maxSize} values, so the tree fits on screen (got ${call.args.length}).`);
      build = call.args.map((a) => readKey(a, 'value'));
      return;
    }
    if (kind === 'insert') {
      if (call.args.length !== 1) throw new InputError(`"${segment}": insert takes one value, as in "insert 5".`);
      ops.push({ kind, value: readKey(call.args[0]) });
      return;
    }
    if (call.args.length > 0) throw new InputError(`"${segment}": ${kind}() takes no value.`);
    ops.push({ kind });
  });
  if (ops.length === 0 && build === null) throw new InputError(`Add at least one operation, for example ${HEAP_SCRIPT_HELP}.`);
  if (ops.length > HEAP_LIMITS.maxOps) throw new InputError(`At most ${HEAP_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  let live = build ? (build as number[]).length : 0;
  ops.forEach((op, i) => {
    if (op.kind === 'insert') live += 1;
    else if (op.kind === 'extract' && live > 0) live -= 1;
    else if (op.kind === 'clear') live = 0;
    if (live > HEAP_LIMITS.maxSize) throw new InputError(`At most ${HEAP_LIMITS.maxSize} values at once fit in the tree; operation ${i + 1} would make ${live}.`);
  });
  return { build, ops };
}

/* ---------- pseudocode ---------- */

export function heapPseudocode(mode: HeapMode): string[] {
  const max = mode === 'max';
  const name = max ? 'max' : 'min';
  const pick = max ? 'largest' : 'smallest';
  const better = max ? '>' : '<';
  return [
    'insert(value):',
    '  self.heap.append(value)',
    '  self._heapify_up(len(self.heap) - 1)',
    '_heapify_up(index): while index > 0:',
    '  parent = (index - 1) // 2',
    `  if self.heap[parent] ${max ? '>=' : '<='} self.heap[index]: break`,
    '  self._swap(parent, index); index = parent',
    `extract_${name}():`,
    '  if self.is_empty(): raise IndexError("Heap is empty")',
    '  if len(self.heap) == 1: return self.heap.pop()',
    `  ${name}_val = self.heap[0]`,
    '  self.heap[0] = self.heap.pop()',
    `  self._heapify_down(0); return ${name}_val`,
    `_heapify_down(index): while True: ${pick} = index`,
    '  left, right = 2 * index + 1, 2 * index + 2',
    `  if left < len(heap) and heap[left] ${better} heap[${pick}]: ${pick} = left`,
    `  if right < len(heap) and heap[right] ${better} heap[${pick}]: ${pick} = right`,
    `  if ${pick} == index: break`,
    `  self._swap(index, ${pick}); index = ${pick}`,
    `__init__(arr): self.heap = arr.copy(); self._heapify()`,
    '_heapify(): for i in range(n // 2 - 1, -1, -1):',
    '  self._heapify_down(i)',
    'peek(): if self.is_empty(): raise IndexError(...); return self.heap[0]',
    'size(): len(self.heap)   is_empty(): len(self.heap) == 0   clear(): self.heap = []',
  ];
}

const L = {
  insert: 1,
  insertUp: 2,
  upParent: 4,
  upCheck: 5,
  upSwap: 6,
  empty: 8,
  single: 9,
  take: 10,
  moveLast: 11,
  ret: 12,
  downCompare: 16,
  downStop: 17,
  downSwap: 18,
  ctor: 19,
  heapifyLoop: 20,
  peek: 22,
  misc: 23,
};

/* ---------- tracer ---------- */

export interface HeapStep {
  op: HeapOp;
  /** Python's repr of the return value ('None' for insert and clear); null when it raised. */
  result: string | null;
  error: string | null;
  heap: number[];
}

export interface HeapRun {
  frames: Array<Frame<HeapState>>;
  /** The array after the constructor (empty without "build"). */
  initial: number[];
  steps: HeapStep[];
}

interface Item {
  id: number;
  value: number;
}

export function formatHeapOp(op: HeapOp, mode: HeapMode): string {
  if (op.kind === 'insert') return `insert(${op.value})`;
  if (op.kind === 'extract') return `extract_${mode}()`;
  return `${op.kind}()`;
}

export function heapTrace(input: HeapInput, mode: HeapMode): HeapRun {
  const max = mode === 'max';
  const cls = max ? 'MaxHeap' : 'MinHeap';
  const name = max ? 'max' : 'min';
  const pick = max ? 'largest' : 'smallest';
  /** a is strictly better than b: the comparison _heapify_down uses. */
  const better = (a: number, b: number) => (max ? a > b : a < b);
  const betterSym = max ? '>' : '<';
  const worseSym = max ? '<' : '>';
  const okSym = max ? '>=' : '<=';
  const { ops } = input;
  const labels = ops.map((op) => formatHeapOp(op, mode));
  let heap: Item[] = [];
  let ids = 0;
  let current = -1;
  let swaps = 0;
  let compares = 0;
  const out: string[] = [];
  const frames: Array<Frame<HeapState>> = [];
  const steps: HeapStep[] = [];

  interface Snap {
    roles?: Record<number, Role>;
    edges?: Record<number, Role>;
    markers?: HeapMarkerView[];
    leaving?: { item: Item; tag: string; role?: Role };
    vars?: Array<[string, string | number]>;
    fresh?: boolean;
  }
  const view = (it: Item, role: Role): HeapNodeView => ({ id: it.id, label: it.value, role });
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const head: Array<[string, string | number]> = current >= 0 && current < ops.length ? [['op', labels[current]]] : [];
    const strips: StripData[] = [];
    if (ops.length) strips.push(opsStrip(labels, current));
    strips.push(resultStrip(max ? 'Extracted (largest first)' : 'Extracted (smallest first)', out, o.fresh));
    frames.push({
      line,
      caption,
      vars: [...head, ['len(heap)', heap.length], ['root', heap.length ? heap[0].value : '(empty)'], ...(o.vars ?? []), ['swaps so far', swaps], ['comparisons so far', compares]],
      state: {
        slots: heap.map((it, i) => view(it, o.roles?.[i] ?? 'idle')),
        floating: o.leaving ? [{ node: view(o.leaving.item, o.leaving.role ?? 'done'), tag: o.leaving.tag }] : undefined,
        edgeRoles: o.edges,
        markers: o.markers,
        strips,
      },
    });
  };
  const swap = (i: number, j: number) => {
    [heap[i], heap[j]] = [heap[j], heap[i]];
    swaps += 1;
  };
  const values = () => heap.map((it) => it.value);
  const list = (xs: number[]) => `[${xs.join(', ')}]`;

  /** _heapify_down(index), one compare frame and one swap frame per level. */
  const siftDown = (start: number, leaving?: Snap['leaving']) => {
    let index = start;
    for (;;) {
      const n = heap.length;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      const x = heap[index].value;
      let best = index;
      const parts: string[] = [];
      const roles: Record<number, Role> = { [index]: 'active' };
      const edges: Record<number, Role> = {};
      const markers: HeapMarkerView[] = [{ index, name: 'index', role: 'active' }];
      if (left < n) {
        compares += 1;
        roles[left] = 'compare';
        edges[left] = 'compare';
        markers.push({ index: left, name: 'left', role: 'compare' });
        const lv = heap[left].value;
        if (better(lv, heap[best].value)) {
          parts.push(`left child ${lv} (index ${left}) ${betterSym} ${x}, so ${pick} = ${left}`);
          best = left;
        } else parts.push(`left child ${lv} (index ${left}) is not ${betterSym} ${x}`);
      }
      if (right < n) {
        compares += 1;
        roles[right] = 'compare';
        edges[right] = 'compare';
        markers.push({ index: right, name: 'right', role: 'compare' });
        const rv = heap[right].value;
        const against = heap[best].value;
        if (better(rv, against)) {
          parts.push(`right child ${rv} (index ${right}) ${betterSym} ${against}, so ${pick} = ${right}`);
          best = right;
        } else
          parts.push(
            best === left
              ? `right child ${rv} (index ${right}) is not ${betterSym} ${against}, so ${pick} stays ${left}${rv === against ? ' (on a tie the left child wins)' : ''}`
              : `right child ${rv} (index ${right}) is not ${betterSym} ${x}`,
          );
      }
      const vars: Array<[string, string | number]> = [['index', index], [pick, best]];
      if (left >= n) {
        snap(L.downStop, `${x} at index ${index} has no children (left = 2 * ${index} + 1 = ${left} is past the end, len = ${n}), so ${pick} == index: it has sunk to a leaf. Stop.`, {
          roles: { [index]: 'done' },
          markers: [{ index, name: 'index', role: 'done' }],
          leaving,
          vars,
        });
        return;
      }
      const text = `${x} at index ${index}: ${parts.join('; ')}.`;
      if (best === index) {
        snap(
          L.downStop,
          `${text} ${pick} == index: no child is ${max ? 'larger' : 'smaller'} than ${x}, so the heap order holds here. Stop.`,
          { roles: { ...roles, [index]: 'done' }, edges, markers, leaving, vars },
        );
        return;
      }
      snap(L.downCompare, `${text} The ${max ? 'larger' : 'smaller'} child must move up, or it would sit below a ${max ? 'smaller' : 'larger'} parent.`, {
        roles,
        edges,
        markers,
        leaving,
        vars,
      });
      const child = heap[best].value;
      swap(index, best);
      snap(L.downSwap, `Swap: ${child} rises to index ${index}, and ${x} sinks to index ${best}. Then repeat from index ${best}.`, {
        roles: { [best]: 'active', [index]: 'compare' },
        edges: { [best]: 'active' },
        markers: [{ index: best, name: 'index', role: 'active' }],
        leaving,
        vars: [['index', best]],
      });
      index = best;
    }
  };

  /** _heapify_up(index). */
  const siftUp = (start: number) => {
    let index = start;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      const x = heap[index].value;
      const p = heap[parent].value;
      compares += 1;
      const vars: Array<[string, string | number]> = [['index', index], ['parent', parent]];
      const markers: HeapMarkerView[] = [
        { index, name: 'index', role: 'active' },
        { index: parent, name: 'parent', role: 'compare' },
      ];
      if (!better(x, p)) {
        snap(
          L.upCheck,
          `parent = (${index} - 1) // 2 = ${parent} holds ${p}, and ${p} ${okSym} ${x}: the heap order holds, so ${x} stays at index ${index}.${p === x ? ' Equal keys never swap.' : ''}`,
          { roles: { [index]: 'done', [parent]: 'compare' }, edges: { [index]: 'compare' }, markers, vars },
        );
        return;
      }
      swap(parent, index);
      snap(
        L.upSwap,
        `parent = (${index} - 1) // 2 = ${parent} holds ${p}, and ${p} ${worseSym} ${x} breaks the heap order: swap them. ${x} rises to index ${parent}.` +
          (parent === 0 ? ` It is the root now, so the loop ends: index is 0.` : ''),
        { roles: { [parent]: 'active', [index]: 'compare' }, edges: { [index]: 'active' }, markers: [{ index: parent, name: 'index', role: 'active' }], vars: [['index', parent]] },
      );
      index = parent;
    }
  };

  // Constructor
  if (input.build === null) {
    snap(
      undefined,
      `${cls}(): self.heap = []. The heap is a list read as a complete binary tree: the children of index i sit at 2i + 1 and 2i + 2, and its parent at (i - 1) // 2. ` +
        `Every parent is ${max ? '>=' : '<='} its children, so the ${max ? 'largest' : 'smallest'} value is at index 0.`,
    );
  } else {
    heap = input.build.map((value) => ({ id: ids++, value }));
    const n = heap.length;
    const last = Math.floor(n / 2) - 1;
    snap(
      L.ctor,
      `${cls}(${list(input.build)}): self.heap = arr.copy(). The list is already a complete tree, but not yet in heap order. ` +
        (last >= 0
          ? `_heapify() sifts down every internal node, from the last one, n // 2 - 1 = ${last}, back to the root; the ${n - last - 1} leaves are one-element heaps already.`
          : `With ${plural(n, 'element')} there is no internal node, so _heapify() has nothing to do.`),
    );
    for (let i = last; i >= 0; i--) {
      snap(
        L.heapifyLoop,
        `_heapify: i = ${i}. Below index ${i} every subtree is a heap already, so sifting ${heap[i].value} down makes the subtree rooted at ${i} a heap too.`,
        { roles: { [i]: 'active' }, markers: [{ index: i, name: 'i', role: 'active' }], vars: [['i', i]] },
      );
      siftDown(i);
    }
    if (n > 0) {
      snap(
        L.heapifyLoop,
        `Heapify done: ${list(values())} is a ${name} heap after ${plural(swaps, 'swap')} and ${plural(compares, 'comparison')}. ` +
          `A node sinks at most its height, and most nodes sit near the bottom, so the total stays O(n) instead of n inserts at O(log n) each.`,
        { roles: { 0: 'done' } },
      );
    }
  }
  const initial = values();

  ops.forEach((op, k) => {
    current = k;
    const label = labels[k];
    if (op.kind === 'insert') {
      const item: Item = { id: ids++, value: op.value };
      heap.push(item);
      const n = heap.length - 1;
      if (n === 0) {
        snap(L.insert, `${label}: the heap was empty, so ${op.value} is appended at index 0 and is the root. _heapify_up(0) does nothing: index is not > 0.`, {
          roles: { 0: 'done' },
        });
      } else {
        snap(
          L.insert,
          `${label}: append ${op.value} at index ${n}, the next free leaf, so the tree stays complete. Now _heapify_up(${n}) compares it with its parent until the heap order holds.`,
          { roles: { [n]: 'active' }, markers: [{ index: n, name: 'index', role: 'active' }] },
        );
        siftUp(n);
      }
      steps.push({ op, result: 'None', error: null, heap: values() });
      return;
    }
    if (op.kind === 'extract') {
      if (heap.length === 0) {
        snap(L.empty, `${label}: the heap is empty, so there is no root to take: extract_${name} raises IndexError("Heap is empty").`, {
          markers: [{ index: 0, name: 'heap[0]', role: 'bad' }],
        });
        steps.push({ op, result: null, error: 'IndexError', heap: [] });
        return;
      }
      if (heap.length === 1) {
        const only = heap.pop()!;
        out.push(String(only.value));
        snap(L.single, `${label}: len(self.heap) == 1, so return self.heap.pop() takes ${only.value}, the only element. The heap is empty now.`, {
          leaving: { item: only, tag: 'returned' },
          fresh: true,
        });
        steps.push({ op, result: String(only.value), error: null, heap: [] });
        return;
      }
      const top = heap[0];
      snap(L.take, `${label}: ${name}_val = self.heap[0] = ${top.value}. The root is always the ${max ? 'largest' : 'smallest'} value, so no search is needed.`, {
        roles: { 0: 'done' },
      });
      const last = heap.pop()!;
      heap[0] = last;
      snap(
        L.moveLast,
        `self.heap[0] = self.heap.pop(): the last element ${last.value} leaves index ${heap.length} and overwrites the root, so the tree stays complete. ` +
          (heap.length === 1 ? `It is the only element left.` : `${last.value} is probably out of place now, so _heapify_down(0) sinks it.`),
        { roles: { 0: 'active' }, leaving: { item: top, tag: `${name}_val` } },
      );
      siftDown(0, { item: top, tag: `${name}_val` });
      out.push(String(top.value));
      snap(L.ret, `extract_${name} returns ${top.value}. One root-to-leaf path was repaired, so it took O(log n) swaps.`, {
        leaving: { item: top, tag: 'returned' },
        roles: { 0: 'done' },
        fresh: true,
      });
      steps.push({ op, result: String(top.value), error: null, heap: values() });
      return;
    }
    if (op.kind === 'peek') {
      if (heap.length === 0) {
        snap(L.peek, `${label}: the heap is empty, so there is no heap[0] to read: peek raises IndexError("Heap is empty").`, {
          markers: [{ index: 0, name: 'heap[0]', role: 'bad' }],
        });
        steps.push({ op, result: null, error: 'IndexError', heap: [] });
        return;
      }
      snap(L.peek, `${label} returns self.heap[0] = ${heap[0].value}, the ${max ? 'largest' : 'smallest'} value, in O(1). Nothing moves.`, { roles: { 0: 'done' } });
      steps.push({ op, result: String(heap[0].value), error: null, heap: values() });
      return;
    }
    if (op.kind === 'size') {
      snap(L.misc, `${label} returns len(self.heap) = ${heap.length}.`);
      steps.push({ op, result: String(heap.length), error: null, heap: values() });
      return;
    }
    if (op.kind === 'is_empty') {
      const empty = heap.length === 0;
      snap(L.misc, `${label} returns len(self.heap) == 0, which is ${empty ? 'True' : 'False'}.`);
      steps.push({ op, result: empty ? 'True' : 'False', error: null, heap: values() });
      return;
    }
    const dropped = heap.length;
    heap = [];
    snap(L.misc, `${label}: self.heap = [] drops ${plural(dropped, 'element')} at once.`);
    steps.push({ op, result: 'None', error: null, heap: [] });
  });

  current = ops.length;
  snap(
    undefined,
    heap.length
      ? `Done: ${list(values())}, root ${heap[0].value}. In total ${plural(swaps, 'swap')} and ${plural(compares, 'comparison')}; each insert or extract walks one path of the tree, O(log n).`
      : `Done: the heap is empty. In total ${plural(swaps, 'swap')} and ${plural(compares, 'comparison')}.`,
    { roles: heap.length ? { 0: 'done' } : undefined },
  );
  return { frames, initial, steps };
}
