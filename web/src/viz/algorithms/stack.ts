/**
 * Stack tracers: the three stacks of Data_Structures/Linear/Stack, each mirroring its Python class.
 *
 * - staticStack mirrors Static_Array_Stack/Python/array_stack.py, ArrayStack(capacity):
 *     stack = [None] * capacity, top = -1; push raises OverflowError when top == capacity - 1,
 *     else top += 1 and stack[top] = value; pop reads stack[top], sets the slot back to None and
 *     does top -= 1; pop and peek raise IndexError on an empty stack.
 * - dynamicStack mirrors Dynamic_Array_Stack/Python/array_stack.py: a plain list with append and
 *     pop. It also shows the slots CPython keeps allocated behind the list: list_resize in
 *     Objects/listobject.c (3.9 and later) grows a full list to (n + n // 8 + 6) & ~3 slots and
 *     shrinks it when fewer than half the slots are in use (see listResize).
 * - linkedStack mirrors Linked_List_Stack/Python/linked_list_stack.py: push makes a Node, points
 *     its next at top and moves top to it; pop moves top to top.next.
 * Golden fixtures (__fixtures__/stacksQueues.json) pin the array and top, the list and its
 * allocation, the chain and every return value or exception after every operation.
 *
 * Input: "capacity 4; push 10, push 20, pop, peek, size, is_empty"  (a bare value is a push)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ArrayTrackState, TrackBlockView, TrackItemView, TrackPointerView } from '../renderers/ArrayTrack';
import type { ChainLinkView, ChainNodeView, ChainPointerView, ChainState } from '../renderers/ChainView';
import {
  VALUE_HELP,
  badValue,
  checkLive,
  opsStrip,
  plural,
  pyList,
  pyRepr,
  readCall,
  readCapacity,
  readValue,
  resultStrip,
  splitScript,
} from './stackQueueOps';

export type StackOp = { kind: 'push'; value: string } | { kind: 'pop' | 'peek' | 'size' | 'is_empty' };

export interface StackInput {
  /** "capacity N" from the script; only the static stack uses it. */
  capacity?: number;
  ops: StackOp[];
}

/** A Python return value: a stored value, a size, a boolean, or None (push returns None). */
export type PyResult = string | number | boolean | null;

interface StepBase {
  op: StackOp;
  result: PyResult;
  /** The exception the call raised (OverflowError, IndexError), or null. */
  error: string | null;
}

export interface StaticStackStep extends StepBase {
  stack: Array<string | null>;
  top: number;
}

export interface DynamicStackStep extends StepBase {
  stack: string[];
  /** Slots CPython has allocated for the list (len <= allocated). */
  allocated: number;
}

export interface LinkedStackStep extends StepBase {
  /** Values from top to bottom. */
  items: string[];
  size: number;
}

export interface StackRun<S, T> {
  frames: Array<Frame<S>>;
  steps: T[];
}

const KINDS: Record<string, StackOp['kind']> = {
  push: 'push',
  pop: 'pop',
  peek: 'peek',
  size: 'size',
  is_empty: 'is_empty',
  isempty: 'is_empty',
  empty: 'is_empty',
};

export const STATIC_DEFAULT_CAPACITY = 5;
export const STATIC_MAX_CAPACITY = 8;
export const DYNAMIC_MAX_ITEMS = 12;
export const LINKED_MAX_NODES = 8;

/** Reads a stack script. The capacity clause is optional; the static stack checks its range. */
export function parseStack(text: string, { maxOps = 30 } = {}): StackInput {
  let capacity: number | undefined;
  const ops: StackOp[] = [];
  for (const raw of splitScript(text)) {
    const cap = readCapacity(raw);
    if (cap !== null) {
      if (capacity !== undefined) throw new InputError('Give the capacity ("capacity 4") only once.');
      capacity = cap;
      continue;
    }
    const call = readCall(raw);
    const kind = call ? KINDS[call.name] : undefined;
    if (call && kind) {
      if (kind === 'push') {
        if (call.args.length !== 1) throw new InputError(`push takes one value, e.g. "push 5" (got "${raw}").`);
        const value = readValue(call.args[0]);
        if (value === null) throw badValue(call.args[0], 'push');
        ops.push({ kind, value });
      } else {
        if (call.args.length > 0) throw new InputError(`${kind}() takes no value (got "${raw}").`);
        ops.push({ kind });
      }
      continue;
    }
    const value = readValue(raw);
    if (value !== null) {
      ops.push({ kind: 'push', value });
      continue;
    }
    throw new InputError(`Cannot read "${raw}". Write operations like "push 5", "pop", "peek", "size" or "is_empty", separated by commas; values are ${VALUE_HELP}.`);
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, e.g. "push 10, push 20, pop".');
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  return { capacity, ops };
}

/** The static stack's input: the capacity defaults to 5 (the Python default of 100 would not fit on screen). */
export function parseStaticStack(text: string): StackInput {
  const input = parseStack(text);
  const capacity = input.capacity ?? STATIC_DEFAULT_CAPACITY;
  if (capacity < 1) throw new InputError(`ArrayStack(${capacity}) raises ValueError("Capacity must be at least 1"): use a capacity from 1 to ${STATIC_MAX_CAPACITY}.`);
  if (capacity > STATIC_MAX_CAPACITY) throw new InputError(`At most ${STATIC_MAX_CAPACITY} slots fit in the picture (got capacity ${capacity}).`);
  return { capacity, ops: input.ops };
}

const stackDelta = (op: StackOp, live: number) => (op.kind === 'push' ? 1 : op.kind === 'pop' && live > 0 ? -1 : 0);

/** The dynamic stack's input: unbounded in Python, at most 12 items at once on screen. */
export function parseDynamicStack(text: string): StackInput {
  const input = parseStack(text);
  checkLive(input.ops, stackDelta, DYNAMIC_MAX_ITEMS, 'items');
  return input;
}

/** The linked stack's input: at most 8 nodes at once on screen. */
export function parseLinkedStack(text: string): StackInput {
  const input = parseStack(text);
  checkLive(input.ops, stackDelta, LINKED_MAX_NODES, 'nodes');
  return input;
}

export function formatStackOp(op: StackOp): string {
  return op.kind === 'push' ? `push(${pyRepr(op.value)})` : `${op.kind}()`;
}

const pyBool = (b: boolean) => (b ? 'True' : 'False');

interface Item {
  id: number;
  value: string;
}

type Vars = Array<[string, string | number]>;

/** Static-size stack: a preallocated list of `capacity` slots and a top index. */
export function staticStack({ capacity = STATIC_DEFAULT_CAPACITY, ops }: StackInput): StackRun<ArrayTrackState, StaticStackStep> {
  const stack: Array<Item | null> = new Array<Item | null>(capacity).fill(null);
  let top = -1;
  let ids = 0;
  let current = -1;
  let overflows = 0;
  const popped: string[] = [];
  const labels = ops.map(formatStackOp);
  const frames: Array<Frame<ArrayTrackState>> = [];
  const steps: StaticStackStep[] = [];

  interface Snap {
    roles?: Record<number, Role>;
    lifted?: { item: Item; slot: number; role?: Role };
    slots?: Record<number, Role>;
    topRole?: Role;
    vars?: Vars;
    fresh?: boolean;
  }
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const items: TrackItemView[] = [];
    stack.forEach((it, i) => {
      if (it) items.push({ id: it.id, value: it.value, slot: i, role: o.roles?.[i] ?? 'idle' });
    });
    if (o.lifted) items.push({ id: o.lifted.item.id, value: o.lifted.item.value, slot: o.lifted.slot, row: -1, role: o.lifted.role ?? 'active' });
    const head: Vars = current >= 0 && current < ops.length ? [['op', labels[current]]] : [];
    frames.push({
      line,
      caption,
      vars: [...head, ['top', top], ['capacity', capacity], ['size (top + 1)', top + 1], ...(o.vars ?? [])],
      state: {
        blocks: [{ id: 'stack', row: 0, slots: capacity, emptyText: 'None', slotRoles: o.slots }],
        items,
        pointers: [{ name: 'top', slot: top, role: o.topRole }],
        strips: [opsStrip(labels, current), resultStrip('Popped', popped, o.fresh)],
      },
    });
  };
  const record = (op: StackOp, result: PyResult, error: string | null = null) =>
    steps.push({ op, result, error, stack: stack.map((it) => it?.value ?? null), top });

  snap(
    undefined,
    `ArrayStack(${capacity}): the list [None] * ${capacity} is allocated once and top = -1, so the stack starts empty. It never grows: a push onto a full stack raises OverflowError.`,
  );

  ops.forEach((op, i) => {
    current = i;
    if (op.kind === 'push') {
      const item: Item = { id: ids++, value: op.value };
      const v = pyRepr(op.value);
      if (top === capacity - 1) {
        overflows++;
        snap(
          2,
          `push(${v}): top = ${top} = capacity - 1, so all ${capacity} slots are in use. The array never grows, so push raises OverflowError("Stack overflow") and the stack stays as it was.`,
          { lifted: { item, slot: capacity, role: 'bad' }, topRole: 'bad' },
        );
        record(op, null, 'OverflowError');
        return;
      }
      snap(
        1,
        `push(${v}): top = ${top}${top === -1 ? ' (empty)' : ''} and capacity - 1 = ${capacity - 1}, so top < capacity - 1: slot ${top + 1} is free.`,
        { lifted: { item, slot: top + 1 }, slots: { [top + 1]: 'compare' }, topRole: 'compare' },
      );
      top += 1;
      snap(3, `top += 1: top moves from ${top - 1} to ${top}, the free slot the value will use.`, { lifted: { item, slot: top }, topRole: 'active' });
      stack[top] = item;
      snap(4, `stack[${top}] = ${v}: the value goes into the slot. Nothing else moved, so push is O(1).`, { roles: { [top]: 'active' } });
      record(op, null);
      return;
    }
    if (op.kind === 'pop') {
      if (top === -1) {
        snap(6, 'pop(): top = -1, so the stack is empty and there is nothing to return: pop raises IndexError("Pop from empty stack").', { topRole: 'bad' });
        record(op, null, 'IndexError');
        return;
      }
      const item = stack[top]!;
      const v = pyRepr(item.value);
      snap(7, `pop(): top = ${top}, not -1, so the stack has items. value = stack[${top}] = ${v}, the item pushed last.`, {
        roles: { [top]: 'compare' },
        topRole: 'compare',
        vars: [['value', v]],
      });
      stack[top] = null;
      snap(8, `stack[${top}] = None: the slot is cleared, so the list no longer keeps ${v} alive. The local variable value still holds it.`, {
        lifted: { item, slot: top },
        vars: [['value', v]],
      });
      top -= 1;
      popped.push(item.value);
      snap(9, `top -= 1: top is ${top} now${top === -1 ? ' (empty again)' : ''}, and pop returns ${v}. Only top moved: O(1).`, {
        lifted: { item, slot: top + 1, role: 'done' },
        topRole: 'active',
        vars: [['value', v]],
        fresh: true,
      });
      record(op, item.value);
      return;
    }
    if (op.kind === 'peek') {
      if (top === -1) {
        snap(10, 'peek(): top = -1, so the stack is empty: peek raises IndexError("Peek from empty stack").', { topRole: 'bad' });
        record(op, null, 'IndexError');
        return;
      }
      const v = stack[top]!.value;
      snap(11, `peek() returns stack[${top}] = ${pyRepr(v)}, the top item, and changes nothing.`, { roles: { [top]: 'done' }, topRole: 'compare' });
      record(op, v);
      return;
    }
    if (op.kind === 'size') {
      snap(12, `size() returns top + 1 = ${top + 1}: the slots 0..top hold the items.`, { topRole: 'compare' });
      record(op, top + 1);
      return;
    }
    snap(13, `is_empty() returns top == -1, which is ${pyBool(top === -1)}.`, { topRole: 'compare' });
    record(op, top === -1);
  });

  current = ops.length;
  const left = stack.filter(Boolean).map((it) => it!.value);
  snap(
    undefined,
    `Done: ${top + 1} of ${capacity} slots in use${left.length ? ` (${pyList(left)}, top = ${top})` : ''}. Each push and pop moved only top, so each took O(1)${
      overflows ? `; ${plural(overflows, 'push', 'pushes')} found the stack full and raised OverflowError` : ''
    }.`,
  );
  return { frames, steps };
}

/**
 * CPython's list_resize (Objects/listobject.c, 3.9 and later): the slots a list keeps allocated
 * after its length changes from `size` to `newsize`. Inside [allocated / 2, allocated] nothing
 * changes; otherwise the list asks for (newsize + newsize // 8 + 6) rounded down to a multiple
 * of 4, and an empty list keeps no slots at all.
 */
export function listResize(allocated: number, size: number, newsize: number): number {
  if (allocated >= newsize && newsize >= allocated >> 1) return allocated;
  let next = (newsize + (newsize >> 3) + 6) & ~3;
  if (newsize - size > next - newsize) next = (newsize + 3) & ~3;
  return newsize === 0 ? 0 : next;
}

/** The arithmetic list_resize does for `n` items, as a caption shows it. */
function resizeFormula(n: number): string {
  return `(${n} + ${n} // 8 + 6) & ~3 = ${(n + (n >> 3) + 6) & ~3}`;
}

/** Dynamic-size stack: a Python list, with the allocated slots CPython keeps behind it. */
export function dynamicStack({ capacity, ops }: StackInput): StackRun<ArrayTrackState, DynamicStackStep> {
  const list: Item[] = [];
  let allocated = 0;
  let block = 0;
  let ids = 0;
  let current = -1;
  let copies = 0;
  let pushes = 0;
  const popped: string[] = [];
  const labels = ops.map(formatStackOp);
  const frames: Array<Frame<ArrayTrackState>> = [];
  const steps: DynamicStackStep[] = [];

  interface Snap {
    roles?: Record<number, Role>;
    lifted?: { item: Item; slot: number; role?: Role };
    /** A second block under the list (a reallocation), and the row the items sit in. */
    second?: { id: number; slots: number };
    itemsRow?: 0 | 1;
    /** Draw the list's block faded (being freed), or not at all. */
    blockGhost?: boolean;
    noBlock?: boolean;
    lenRole?: Role;
    fresh?: boolean;
    note?: string;
  }
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const blocks: TrackBlockView[] = [];
    if (allocated > 0 && !o.noBlock) blocks.push({ id: block, row: 0, slots: allocated, ghost: o.blockGhost });
    if (o.second) blocks.push({ id: o.second.id, row: 1, slots: o.second.slots });
    const items: TrackItemView[] = list.map((it, i) => ({ id: it.id, value: it.value, slot: i, row: o.itemsRow ?? 0, role: o.roles?.[i] ?? 'idle' }));
    if (o.lifted) items.push({ id: o.lifted.item.id, value: o.lifted.item.value, slot: o.lifted.slot, row: -1, role: o.lifted.role ?? 'active' });
    const pointers: TrackPointerView[] = [];
    if (list.length > 0) pointers.push({ name: 'top', slot: list.length - 1 });
    pointers.push({ name: 'len', slot: list.length, role: o.lenRole });
    const head: Vars = current >= 0 && current < ops.length ? [['op', labels[current]]] : [];
    frames.push({
      line,
      caption,
      vars: [
        ...head,
        ['len', list.length],
        ['allocated', allocated],
        ['spare slots', allocated - list.length],
        ['copies so far', copies],
        ['pushes so far', pushes],
        ['copies per push', pushes ? (copies / pushes).toFixed(2) : '0'],
      ],
      state: { blocks, items, pointers, note: o.note, strips: [opsStrip(labels, current), resultStrip('Popped', popped, o.fresh)] },
    });
  };
  const record = (op: StackOp, result: PyResult, error: string | null = null) =>
    steps.push({ op, result, error, stack: list.map((it) => it.value), allocated });

  /** Animates a reallocation to `next` slots: the new block appears, the items move down, the old block goes. */
  const reallocate = (next: number, lifted: Snap['lifted'], why: string) => {
    const fresh = block + 1;
    const n = list.length;
    snap(2, why, { lifted, second: { id: fresh, slots: next }, note: `New block of ${next} slots below the list` });
    copies += n;
    snap(
      2,
      `realloc moves the ${plural(n, 'item pointer')} into the new block: ${plural(n, 'copy', 'copies')}, ${copies} so far over ${plural(pushes, 'push', 'pushes')}.`,
      { lifted, second: { id: fresh, slots: next }, itemsRow: 1, roles: Object.fromEntries(list.map((_, i) => [i, 'active' as Role])), note: `New block of ${next} slots` },
    );
    block = fresh;
    allocated = next;
    snap(2, `The old block is freed and the list keeps the new one: allocated = ${next}.`, { lifted });
  };

  snap(
    undefined,
    `ArrayStack(): self.stack = [], an empty Python list. CPython has not allocated any slots yet (allocated = 0)${
      capacity !== undefined ? `; the capacity ${capacity} in the script is ignored, because this stack has no fixed capacity` : ''
    }.`,
  );

  ops.forEach((op, i) => {
    current = i;
    if (op.kind === 'push') {
      const item: Item = { id: ids++, value: op.value };
      const v = pyRepr(op.value);
      const n = list.length;
      pushes++;
      const next = listResize(allocated, n, n + 1);
      if (next === allocated) {
        snap(1, `push(${v}) calls append(${v}). len ${n} < allocated ${allocated}: a spare slot is waiting at index ${n}, so no copying is needed.`, {
          lifted: { item, slot: n },
          lenRole: 'compare',
        });
      } else {
        snap(1, `push(${v}) calls append(${v}). len ${n} == allocated ${allocated}: there is no free slot, so the list has to grow first.`, {
          lifted: { item, slot: n },
          lenRole: 'bad',
        });
        if (n === 0) {
          block += 1;
          allocated = next;
          snap(2, `list_resize asks for ${resizeFormula(1)} slots for 1 item. The list had no block yet, so nothing is copied.`, { lifted: { item, slot: 0 } });
        } else {
          reallocate(
            next,
            { item, slot: n },
            `list_resize asks for ${resizeFormula(n + 1)} slots for ${n + 1} items: about an eighth more than needed plus a few, rounded down to a multiple of 4. A bigger block is allocated.`,
          );
        }
      }
      list.push(item);
      const spare = allocated - n - 1;
      snap(1, `stack[${n}] = ${v}: the value is stored at the end. len is ${n + 1}, and ${
        spare === 0 ? 'no spare slot is left, so the next push will have to grow the list' : `${plural(spare, 'spare slot')} ${spare === 1 ? 'is' : 'are'} left for the next pushes`
      }.`, {
        roles: { [n]: 'active' },
      });
      record(op, null);
      return;
    }
    if (op.kind === 'pop') {
      if (list.length === 0) {
        snap(4, 'pop(): the list is empty, so is_empty() is True and pop raises IndexError("Pop from empty stack").', { lenRole: 'bad' });
        record(op, null, 'IndexError');
        return;
      }
      const item = list.pop()!;
      const v = pyRepr(item.value);
      const n = list.length;
      const next = listResize(allocated, n + 1, n);
      const lifted = { item, slot: n };
      if (next === allocated) {
        const same = n < allocated >> 1;
        popped.push(item.value);
        snap(
          5,
          `pop() calls list.pop(), which removes the last item, ${v}, from index ${n}: nothing else moves, and it returns ${v}.${
            same ? ` len ${n} < ${allocated} / 2 asks list_resize to shrink, but ${resizeFormula(n)} is the same size, so the block stays.` : ''
          }`,
          { lifted: { ...lifted, role: 'done' }, fresh: true },
        );
        record(op, item.value);
        return;
      }
      snap(5, `pop() calls list.pop(), which removes the last item, ${v}, from index ${n}. Now len ${n} < allocated ${allocated} / 2, so CPython gives memory back.`, {
        lifted,
        lenRole: 'compare',
      });
      if (n === 0) {
        snap(5, 'The list is empty, so CPython frees its whole block: allocated = 0.', { lifted, blockGhost: true });
        allocated = 0;
        block += 1;
      } else {
        reallocate(next, lifted, `list_resize shrinks the block to ${resizeFormula(n)} slots for ${plural(n, 'item')}, so a smaller block is allocated.`);
      }
      popped.push(item.value);
      snap(5, `pop returns ${v}, the item pushed last.`, { lifted: { ...lifted, role: 'done' }, fresh: true });
      record(op, item.value);
      return;
    }
    if (op.kind === 'peek') {
      if (list.length === 0) {
        snap(6, 'peek(): the list is empty, so peek raises IndexError("Peek from empty stack").', { lenRole: 'bad' });
        record(op, null, 'IndexError');
        return;
      }
      const top = list[list.length - 1];
      snap(6, `peek() returns stack[-1] = ${pyRepr(top.value)}, the last item, and changes nothing.`, { roles: { [list.length - 1]: 'done' } });
      record(op, top.value);
      return;
    }
    if (op.kind === 'size') {
      snap(7, `size() returns len(stack) = ${list.length}. The ${plural(allocated - list.length, 'spare slot')} do not count.`, { lenRole: 'compare' });
      record(op, list.length);
      return;
    }
    snap(7, `is_empty() returns len(stack) == 0, which is ${pyBool(list.length === 0)}.`, { lenRole: 'compare' });
    record(op, list.length === 0);
  });

  current = ops.length;
  snap(
    undefined,
    `Done: len ${list.length} in ${allocated} allocated slots. ${plural(pushes, 'push', 'pushes')} cost ${plural(copies, 'copy', 'copies')} during resizes${
      pushes ? `, ${(copies / pushes).toFixed(2)} per push` : ''
    }. The block grows by a constant factor, so the copies stay a constant per push on average: push is O(1) amortized.`,
  );
  return { frames, steps };
}

interface LNode {
  id: number;
  value: string;
}

/** Linked-list stack: a chain of nodes from top, drawn by ChainView. */
export function linkedStack({ ops }: StackInput): StackRun<ChainState, LinkedStackStep> {
  let chain: LNode[] = [];
  let ids = 0;
  let current = -1;
  const popped: string[] = [];
  const labels = ops.map(formatStackOp);
  const frames: Array<Frame<ChainState>> = [];
  const steps: LinkedStackStep[] = [];

  interface Snap {
    /** A node off the row: the new node of a push, or the unlinked node of a pop. */
    loose?: { node: LNode; next: number | null; ghost?: boolean; role?: Role; linkRole?: Role };
    /** The chain starts at column 1, making room for the loose node at column 0. */
    shifted?: boolean;
    top?: number | null;
    topRole?: Role;
    newNode?: boolean;
    roles?: Record<number, Role>;
    /** An empty-stack error: top refers to None, drawn as a dashed box in the bad role. */
    none?: boolean;
    fresh?: boolean;
  }
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const off = o.shifted ? 1 : 0;
    const nodes: ChainNodeView[] = chain.map((n, k) => ({ id: n.id, label: n.value, col: k + off, role: o.roles?.[n.id] ?? 'idle' }));
    const links: ChainLinkView[] = chain.map((n, k) => ({ from: n.id, to: chain[k + 1]?.id ?? null }));
    if (o.loose) {
      nodes.unshift({ id: o.loose.node.id, label: o.loose.node.value, col: 0, row: 0.8, role: o.loose.role ?? 'active', ghost: o.loose.ghost });
      links.unshift({ from: o.loose.node.id, to: o.loose.next, role: o.loose.linkRole });
    }
    const target = o.top !== undefined ? o.top : (chain[0]?.id ?? null);
    if (o.none) nodes.push({ id: 'none', label: 'None', col: 0, sentinel: true, role: 'bad' });
    const pointers: ChainPointerView[] = [{ name: 'top', target: o.none ? 'none' : target, role: o.topRole }];
    if (o.newNode && o.loose) pointers.push({ name: 'new_node', target: o.loose.node.id, side: 'below', role: 'active' });
    const head: Vars = current >= 0 && current < ops.length ? [['op', labels[current]]] : [];
    frames.push({
      line,
      caption,
      vars: [...head, ['size', chain.length], ['top', target === null ? 'None' : `node ${pyRepr(nodeValue(target))}`]],
      state: { nodes, links, pointers, strips: [opsStrip(labels, current), resultStrip('Popped', popped, o.fresh)] },
    });
  };
  const values = new Map<number, string>();
  const nodeValue = (id: number) => values.get(id) ?? '';
  const record = (op: StackOp, result: PyResult, error: string | null = null) =>
    steps.push({ op, result, error, items: chain.map((n) => n.value), size: chain.length });

  snap(undefined, 'LinkedListStack(): top = None and size 0. The stack is a chain of nodes that starts at top; it has no capacity to fill.');

  ops.forEach((op, i) => {
    current = i;
    if (op.kind === 'push') {
      const node: LNode = { id: ids++, value: op.value };
      values.set(node.id, node.value);
      const v = pyRepr(op.value);
      const old = chain[0]?.id ?? null;
      snap(1, `push(${v}): new_node = Node(${v}) makes a fresh node whose next is None. The stack is untouched so far.`, {
        loose: { node, next: null },
        shifted: true,
        newNode: true,
      });
      snap(
        2,
        old === null
          ? 'new_node.next = self.top: top is None (the stack is empty), so new_node.next stays None: this node will be the bottom.'
          : `new_node.next = self.top: the new node now points at the old top, ${pyRepr(chain[0].value)}. Linking first keeps the old nodes reachable.`,
        { loose: { node, next: old, linkRole: 'active' }, shifted: true, newNode: true },
      );
      snap(3, `self.top = new_node: top moves to the new node, so ${v} is now the top item.`, {
        loose: { node, next: old },
        shifted: true,
        newNode: true,
        top: node.id,
        topRole: 'active',
      });
      chain = [node, ...chain];
      snap(4, `self._size += 1: size is ${chain.length}. Only top and one next pointer changed, so push is O(1) with no copying.`, {
        roles: { [node.id]: 'active' },
      });
      record(op, null);
      return;
    }
    if (op.kind === 'pop') {
      if (chain.length === 0) {
        snap(6, 'pop(): top is None, so the stack is empty: pop raises IndexError("Pop from empty stack").', { topRole: 'bad', none: true });
        record(op, null, 'IndexError');
        return;
      }
      const [node, ...rest] = chain;
      const v = pyRepr(node.value);
      snap(7, `pop(): top is not None, so value = self.top.value = ${v}.`, { roles: { [node.id]: 'compare' }, topRole: 'compare' });
      chain = rest;
      snap(
        8,
        `self.top = self.top.next: top moves to ${rest.length ? pyRepr(rest[0].value) : 'None'}. Nothing points at the ${v} node any more, so it is unlinked (its own next still points down, but nothing can reach it).`,
        { loose: { node, next: rest[0]?.id ?? null, ghost: true, role: 'muted' }, shifted: true, topRole: 'active' },
      );
      popped.push(node.value);
      snap(9, `self._size -= 1: size is ${chain.length}, and pop returns ${v}. Python's garbage collector frees the unreachable node.`, { fresh: true });
      record(op, node.value);
      return;
    }
    if (op.kind === 'peek') {
      if (chain.length === 0) {
        snap(10, 'peek(): top is None, so the stack is empty: peek raises IndexError("Peek from empty stack").', { topRole: 'bad', none: true });
        record(op, null, 'IndexError');
        return;
      }
      snap(10, `peek() returns self.top.value = ${pyRepr(chain[0].value)} without changing anything.`, { roles: { [chain[0].id]: 'done' }, topRole: 'compare' });
      record(op, chain[0].value);
      return;
    }
    if (op.kind === 'size') {
      snap(11, `size() returns the counter self._size = ${chain.length}, without walking the chain.`);
      record(op, chain.length);
      return;
    }
    snap(11, `is_empty() returns self.top is None, which is ${pyBool(chain.length === 0)}.`, { topRole: 'compare' });
    record(op, chain.length === 0);
  });

  current = ops.length;
  snap(
    undefined,
    `Done: ${plural(chain.length, 'node')}${chain.length ? `, top = ${pyRepr(chain[0].value)}` : ''}. Every push and pop changed only top and at most one next pointer: O(1), and nothing was ever copied.`,
  );
  return { frames, steps };
}
