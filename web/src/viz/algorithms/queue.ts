/**
 * Queue tracers: three of the queues in Data_Structures/Linear/Queue, each mirroring its Python class.
 *
 * - simpleQueue mirrors Simple_Queue/Python/simple_queue.py: enqueue is list.append; dequeue is
 *     list.pop(0), which closes the gap at index 0 by moving every remaining item one slot left.
 * - circularQueue mirrors Circular_Queue/Python/circular_queue.py: a list of `capacity` slots with
 *     front = rear = -1 for empty; enqueue raises OverflowError when (rear + 1) % capacity == front,
 *     sets front = 0 on the first item, then rear = (rear + 1) % capacity; dequeue clears the slot and
 *     either resets both indices to -1 (front == rear) or advances front with wrap-around.
 * - deque mirrors Deque/Python/deque.py: push_front is list.insert(0, x) (the list grows by one slot,
 *     every item moves one slot right, x goes to index 0), pop_front is list.pop(0) (every item moves
 *     left), push_back / pop_back are append / pop.
 * Golden fixtures (__fixtures__/stacksQueues.json) pin the list (and front / rear) and every return
 * value or exception after every operation.
 *
 * Input: "capacity 4; enqueue A, enqueue B, dequeue, peek"  (a bare value is an enqueue)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ArrayTrackState, TrackItemView, TrackPointerView } from '../renderers/ArrayTrack';
import type { RingBufferState, RingItemView, RingPointerView } from '../renderers/RingBuffer';
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
import type { PyResult } from './stack';

export type QueueOp = { kind: 'enqueue'; value: string } | { kind: 'dequeue' | 'peek' | 'size' | 'is_empty' | 'is_full' };

export interface QueueInput {
  /** "capacity N" from the script; only the circular queue uses it. */
  capacity?: number;
  ops: QueueOp[];
}

export type DequeOp =
  | { kind: 'push_front' | 'push_back'; value: string }
  | { kind: 'pop_front' | 'pop_back' | 'peek_front' | 'peek_back' | 'size' | 'is_empty' | 'display' };

interface StepBase<O> {
  op: O;
  result: PyResult | string[];
  error: string | null;
}

export interface SimpleQueueStep extends StepBase<QueueOp> {
  queue: string[];
}

export interface CircularQueueStep extends StepBase<QueueOp> {
  queue: Array<string | null>;
  front: number;
  rear: number;
}

export interface DequeStep extends StepBase<DequeOp> {
  deque: string[];
}

export interface QueueRun<S, T> {
  frames: Array<Frame<S>>;
  steps: T[];
}

export const QUEUE_MAX_ITEMS = 10;
export const CIRCULAR_DEFAULT_CAPACITY = 5;
export const CIRCULAR_MAX_CAPACITY = 8;

const QUEUE_KINDS: Record<string, QueueOp['kind']> = {
  enqueue: 'enqueue',
  enq: 'enqueue',
  dequeue: 'dequeue',
  deq: 'dequeue',
  peek: 'peek',
  size: 'size',
  is_empty: 'is_empty',
  isempty: 'is_empty',
  empty: 'is_empty',
  is_full: 'is_full',
  isfull: 'is_full',
  full: 'is_full',
};

const DEQUE_KINDS: Record<string, DequeOp['kind']> = {
  push_front: 'push_front',
  pushfront: 'push_front',
  pf: 'push_front',
  push_back: 'push_back',
  pushback: 'push_back',
  pb: 'push_back',
  pop_front: 'pop_front',
  popfront: 'pop_front',
  popf: 'pop_front',
  pop_back: 'pop_back',
  popback: 'pop_back',
  popb: 'pop_back',
  peek_front: 'peek_front',
  peekfront: 'peek_front',
  peekf: 'peek_front',
  peek_back: 'peek_back',
  peekback: 'peek_back',
  peekb: 'peek_back',
  size: 'size',
  is_empty: 'is_empty',
  isempty: 'is_empty',
  empty: 'is_empty',
  display: 'display',
};

/** Reads a queue script (simple or circular). The capacity clause is optional. */
export function parseQueue(text: string, { maxOps = 30 } = {}): QueueInput {
  let capacity: number | undefined;
  const ops: QueueOp[] = [];
  for (const raw of splitScript(text)) {
    const cap = readCapacity(raw);
    if (cap !== null) {
      if (capacity !== undefined) throw new InputError('Give the capacity ("capacity 4") only once.');
      capacity = cap;
      continue;
    }
    const call = readCall(raw);
    const kind = call ? QUEUE_KINDS[call.name] : undefined;
    if (call && kind) {
      if (kind === 'enqueue') {
        if (call.args.length !== 1) throw new InputError(`enqueue takes one value, e.g. "enqueue 5" (got "${raw}").`);
        const value = readValue(call.args[0]);
        if (value === null) throw badValue(call.args[0], 'enqueue');
        ops.push({ kind, value });
      } else {
        if (call.args.length > 0) throw new InputError(`${kind}() takes no value (got "${raw}").`);
        ops.push({ kind });
      }
      continue;
    }
    const value = readValue(raw);
    if (value !== null) {
      ops.push({ kind: 'enqueue', value });
      continue;
    }
    throw new InputError(`Cannot read "${raw}". Write operations like "enqueue 5", "dequeue", "peek" or "size", separated by commas; values are ${VALUE_HELP}.`);
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, e.g. "enqueue 10, enqueue 20, dequeue".');
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  return { capacity, ops };
}

/** The simple queue's input: no is_full (it never fills up), at most 10 items at once on screen. */
export function parseSimpleQueue(text: string): QueueInput {
  const input = parseQueue(text);
  if (input.ops.some((op) => op.kind === 'is_full')) throw new InputError('SimpleQueue has no is_full(): its list grows as needed, so it is never full.');
  checkLive(input.ops, (op, live) => (op.kind === 'enqueue' ? 1 : op.kind === 'dequeue' && live > 0 ? -1 : 0), QUEUE_MAX_ITEMS, 'items');
  return input;
}

/** The circular queue's input: the capacity defaults to 5 and must be 1..8. */
export function parseCircularQueue(text: string): QueueInput {
  const input = parseQueue(text);
  const capacity = input.capacity ?? CIRCULAR_DEFAULT_CAPACITY;
  if (capacity < 1) throw new InputError(`CircularQueue(${capacity}) raises ValueError("Capacity must be at least 1"): use a capacity from 1 to ${CIRCULAR_MAX_CAPACITY}.`);
  if (capacity > CIRCULAR_MAX_CAPACITY) throw new InputError(`At most ${CIRCULAR_MAX_CAPACITY} slots fit on the ring (got capacity ${capacity}).`);
  return { capacity, ops: input.ops };
}

export function parseDeque(text: string, { maxOps = 30 } = {}): DequeOp[] {
  const ops: DequeOp[] = [];
  for (const raw of splitScript(text)) {
    const call = readCall(raw);
    const kind = call ? DEQUE_KINDS[call.name] : undefined;
    if (!call || !kind) {
      if (readValue(raw) !== null) throw new InputError(`Which end should "${raw}" go to? Write "push_front ${raw}" or "push_back ${raw}".`);
      throw new InputError(
        `Cannot read "${raw}". Write operations like "push_front 5", "push_back 7", "pop_front", "pop_back", "peek_front" or "peek_back", separated by commas.`,
      );
    }
    if (kind === 'push_front' || kind === 'push_back') {
      if (call.args.length !== 1) throw new InputError(`${kind} takes one value, e.g. "${kind} 5" (got "${raw}").`);
      const value = readValue(call.args[0]);
      if (value === null) throw badValue(call.args[0], kind);
      ops.push({ kind, value });
    } else {
      if (call.args.length > 0) throw new InputError(`${kind}() takes no value (got "${raw}").`);
      ops.push({ kind });
    }
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, e.g. "push_back 1, push_front 2, pop_back".');
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  checkLive(
    ops,
    (op, live) => (op.kind === 'push_front' || op.kind === 'push_back' ? 1 : (op.kind === 'pop_front' || op.kind === 'pop_back') && live > 0 ? -1 : 0),
    QUEUE_MAX_ITEMS,
    'items',
  );
  return ops;
}

export function formatQueueOp(op: QueueOp): string {
  return op.kind === 'enqueue' ? `enqueue(${pyRepr(op.value)})` : `${op.kind}()`;
}

export function formatDequeOp(op: DequeOp): string {
  return op.kind === 'push_front' || op.kind === 'push_back' ? `${op.kind}(${pyRepr(op.value)})` : `${op.kind}()`;
}

const pyBool = (b: boolean) => (b ? 'True' : 'False');

interface Item {
  id: number;
  value: string;
}

type Vars = Array<[string, string | number]>;

/** What a list-backed queue (simple queue, deque) shows in one frame. */
interface ListSnap {
  roles?: Record<number, Role>;
  /** Item positions that differ from their index: the shift before or after it happens. */
  slotOf?: (index: number) => number;
  lifted?: { item: Item; slot: number; role?: Role };
  /** Slots drawn for the list: one more than len while append / insert make room. */
  slots?: number;
  ptrRoles?: { front?: Role; back?: Role };
  /** On an empty list: the end the call wanted, drawn at slot 0 in the bad role (it does not exist). */
  missing?: 'front' | 'back';
  vars?: Vars;
  fresh?: boolean;
}

/** Shared frame builder for the two list-backed queues. */
function listRecorder(labels: string[], resultLabel: string) {
  const list: Item[] = [];
  const out: string[] = [];
  const frames: Array<Frame<ArrayTrackState>> = [];
  let current = -1;
  let moves = 0;
  const snap = (line: number | undefined, caption: string, o: ListSnap = {}) => {
    const items: TrackItemView[] = list.map((it, i) => ({ id: it.id, value: it.value, slot: o.slotOf ? o.slotOf(i) : i, role: o.roles?.[i] ?? 'idle' }));
    if (o.lifted) items.push({ id: o.lifted.item.id, value: o.lifted.item.value, slot: o.lifted.slot, row: -1, role: o.lifted.role ?? 'active' });
    // The front is always index 0 of the list: during a shift the items move towards it.
    const pointers: TrackPointerView[] = [];
    if (list.length > 0) {
      pointers.push({ name: 'front', slot: 0, role: o.ptrRoles?.front });
      pointers.push({ name: 'back', slot: o.slotOf ? o.slotOf(list.length - 1) : list.length - 1, role: o.ptrRoles?.back });
    } else if (o.missing) pointers.push({ name: o.missing, slot: 0, role: 'bad' });
    const head: Vars = current >= 0 && current < labels.length ? [['op', labels[current]]] : [];
    frames.push({
      line,
      caption,
      vars: [...head, ['len', list.length], ['moves so far', moves], ...(o.vars ?? [])],
      state: {
        blocks: [{ id: 'list', row: 0, slots: o.slots ?? list.length }],
        items,
        pointers,
        strips: [opsStrip(labels, current), resultStrip(resultLabel, out, o.fresh)],
      },
    });
  };
  return {
    list,
    out,
    frames,
    snap,
    setCurrent: (i: number) => {
      current = i;
    },
    addMoves: (n: number) => {
      moves += n;
    },
    moves: () => moves,
  };
}

/** "the remaining item moves one slot left" / "all 3 remaining items move one slot left" */
const shifted = (n: number, dir: string) => (n === 1 ? `the remaining item moves one slot ${dir}` : `all ${n} remaining items move one slot ${dir}`);

const allRoles = (n: number, role: Role, from = 0) => Object.fromEntries(Array.from({ length: n - from }, (_, k) => [k + from, role]));

/** Simple queue: a Python list, enqueue appends, dequeue is pop(0). */
export function simpleQueue({ capacity, ops }: QueueInput): QueueRun<ArrayTrackState, SimpleQueueStep> {
  const labels = ops.map(formatQueueOp);
  const rec = listRecorder(labels, 'Dequeued');
  const { list, out, snap } = rec;
  const steps: SimpleQueueStep[] = [];
  let ids = 0;
  const record = (op: QueueOp, result: PyResult, error: string | null = null) => steps.push({ op, result, error, queue: list.map((it) => it.value) });

  snap(
    undefined,
    `SimpleQueue(): self.queue = [], an empty Python list. The front of the queue is index 0 and the back is the last index${
      capacity !== undefined ? `; the capacity ${capacity} in the script is ignored, because this queue grows as needed` : ''
    }.`,
  );

  ops.forEach((op, i) => {
    rec.setCurrent(i);
    if (op.kind === 'enqueue') {
      const item: Item = { id: ids++, value: op.value };
      const v = pyRepr(op.value);
      const n = list.length;
      snap(1, `enqueue(${v}) calls append(${v}): the list grows by one slot at the back, index ${n}. Nothing else moves.`, {
        lifted: { item, slot: n },
        slots: n + 1,
      });
      list.push(item);
      snap(1, `queue[${n}] = ${v}: ${n === 0 ? `${v} is both the front and the back of the queue, so it is the next to leave` : `${v} is now the back of the queue, so it leaves after the ${plural(n, 'item')} ahead of it`}.`, {
        roles: { [n]: 'active' },
      });
      record(op, null);
      return;
    }
    if (op.kind === 'dequeue') {
      if (list.length === 0) {
        snap(3, 'dequeue(): the queue is empty (is_empty() is True), so there is no front item and dequeue raises IndexError("Queue is empty").', { missing: 'front' });
        record(op, null, 'IndexError');
        return;
      }
      const [item] = list.splice(0, 1);
      const v = pyRepr(item.value);
      const n = list.length;
      if (n === 0) {
        out.push(item.value);
        snap(4, `dequeue() calls pop(0): it takes ${v} from index 0. It was the only item, so nothing has to move, and dequeue returns ${v}.`, {
          lifted: { item, slot: 0, role: 'done' },
          slots: 0,
          fresh: true,
        });
        record(op, item.value);
        return;
      }
      snap(4, `dequeue() calls pop(0): it takes ${v}, the oldest item, out of index 0. That leaves a gap at the front of the list.`, {
        lifted: { item, slot: 0 },
        slotOf: (k) => k + 1,
        slots: n + 1,
        ptrRoles: { front: 'compare' },
      });
      rec.addMoves(n);
      out.push(item.value);
      snap(
        4,
        `pop(0) closes the gap: ${shifted(n, 'left')} (${plural(n, 'move')}, ${rec.moves()} so far). Shifting the rest is why dequeue is O(n) here. dequeue returns ${v}.`,
        { lifted: { item, slot: 0, role: 'done' }, roles: allRoles(n, 'active'), fresh: true, vars: [['moves this op', n]] },
      );
      record(op, item.value);
      return;
    }
    if (op.kind === 'peek') {
      if (list.length === 0) {
        snap(5, 'peek(): the queue is empty, so there is no front item and peek raises IndexError("Queue is empty").', { missing: 'front' });
        record(op, null, 'IndexError');
        return;
      }
      snap(5, `peek() returns queue[0] = ${pyRepr(list[0].value)}, the item that has waited longest, and changes nothing.`, {
        roles: { 0: 'done' },
        ptrRoles: { front: 'done' },
      });
      record(op, list[0].value);
      return;
    }
    if (op.kind === 'size') {
      snap(6, `size() returns len(self.queue) = ${list.length}.`);
      record(op, list.length);
      return;
    }
    snap(6, `is_empty() returns len(self.queue) == 0, which is ${pyBool(list.length === 0)}.`);
    record(op, list.length === 0);
  });

  rec.setCurrent(ops.length);
  snap(
    undefined,
    `Done: ${pyList(list.map((it) => it.value))}${list.length ? `, front ${pyRepr(list[0].value)}` : ''}. The dequeues moved ${plural(rec.moves(), 'item')} in total: every pop(0) shifts all the items behind the front.`,
  );
  return { frames: rec.frames, steps };
}

/** Deque: a Python list with insert(0, x) / pop(0) at the front and append / pop at the back. */
export function dequeTrace(ops: DequeOp[]): QueueRun<ArrayTrackState, DequeStep> {
  const labels = ops.map(formatDequeOp);
  const rec = listRecorder(labels, 'Popped');
  const { list, out, snap } = rec;
  const steps: DequeStep[] = [];
  let ids = 0;
  const record = (op: DequeOp, result: PyResult | string[], error: string | null = null) => steps.push({ op, result, error, deque: list.map((it) => it.value) });

  snap(undefined, 'Deque(): self.deque = [], an empty Python list. The front is index 0 and the back is the last index.');

  ops.forEach((op, i) => {
    rec.setCurrent(i);
    if (op.kind === 'push_front') {
      const item: Item = { id: ids++, value: op.value };
      const v = pyRepr(op.value);
      const n = list.length;
      snap(0, `push_front(${v}) calls insert(0, ${v}). The list first grows by one slot at the end, ${n === 0 ? 'and since it was empty, nothing has to move.' : 'then has to free index 0.'}`, {
        lifted: { item, slot: 0 },
        slots: n + 1,
      });
      if (n > 0) {
        rec.addMoves(n);
        snap(
          0,
          `${n === 1 ? 'The item moves' : `All ${n} items move`} one slot right, starting from the back: ${plural(n, 'move')} (${rec.moves()} so far). This shift is why push_front is O(n) on a list.`,
          { lifted: { item, slot: 0 }, slotOf: (k) => k + 1, slots: n + 1, roles: allRoles(n, 'active'), vars: [['moves this op', n]] },
        );
      }
      list.unshift(item);
      snap(0, `deque[0] = ${v}: the new item is the front.`, { roles: { 0: 'active' }, ptrRoles: { front: 'active' } });
      record(op, null);
      return;
    }
    if (op.kind === 'push_back') {
      const item: Item = { id: ids++, value: op.value };
      const v = pyRepr(op.value);
      const n = list.length;
      snap(1, `push_back(${v}) calls append(${v}): the list grows by one slot at the back, index ${n}. Nothing else moves.`, {
        lifted: { item, slot: n },
        slots: n + 1,
      });
      list.push(item);
      snap(1, `deque[${n}] = ${v}: the new item is the back.`, { roles: { [n]: 'active' }, ptrRoles: { back: 'active' } });
      record(op, null);
      return;
    }
    if (op.kind === 'pop_front' || op.kind === 'pop_back') {
      const front = op.kind === 'pop_front';
      if (list.length === 0) {
        snap(front ? 2 : 4, `${op.kind}(): the deque is empty, so there is no ${front ? 'front' : 'back'} item and it raises IndexError("Deque is empty").`, {
          missing: front ? 'front' : 'back',
        });
        record(op, null, 'IndexError');
        return;
      }
      const item = front ? list.splice(0, 1)[0] : list.pop()!;
      const v = pyRepr(item.value);
      const n = list.length;
      if (!front || n === 0) out.push(item.value);
      if (!front) {
        snap(5, `pop_back() calls pop(): it takes ${v} from the end, index ${n}. Nothing else moves (O(1)), and it returns ${v}.`, {
          lifted: { item, slot: n, role: 'done' },
          fresh: true,
        });
        record(op, item.value);
        return;
      }
      if (n === 0) {
        snap(3, `pop_front() calls pop(0): it takes ${v}, the only item, so nothing has to move. It returns ${v}.`, {
          lifted: { item, slot: 0, role: 'done' },
          slots: 0,
          fresh: true,
        });
        record(op, item.value);
        return;
      }
      snap(3, `pop_front() calls pop(0): it takes ${v} out of index 0, which leaves a gap at the front.`, {
        lifted: { item, slot: 0 },
        slotOf: (k) => k + 1,
        slots: n + 1,
        ptrRoles: { front: 'compare' },
      });
      rec.addMoves(n);
      out.push(item.value);
      snap(
        3,
        `pop(0) closes the gap: ${shifted(n, 'left')} (${plural(n, 'move')}, ${rec.moves()} so far), so pop_front is O(n). It returns ${v}.`,
        { lifted: { item, slot: 0, role: 'done' }, roles: allRoles(n, 'active'), fresh: true, vars: [['moves this op', n]] },
      );
      record(op, item.value);
      return;
    }
    if (op.kind === 'peek_front' || op.kind === 'peek_back') {
      const front = op.kind === 'peek_front';
      if (list.length === 0) {
        snap(6, `${op.kind}(): the deque is empty, so there is no ${front ? 'front' : 'back'} item and it raises IndexError("Deque is empty").`, {
          missing: front ? 'front' : 'back',
        });
        record(op, null, 'IndexError');
        return;
      }
      const k = front ? 0 : list.length - 1;
      snap(6, `${op.kind}() returns deque[${front ? '0' : '-1'}] = ${pyRepr(list[k].value)} without removing it.`, {
        roles: { [k]: 'done' },
        ptrRoles: front ? { front: 'done' } : { back: 'done' },
      });
      record(op, list[k].value);
      return;
    }
    if (op.kind === 'display') {
      const copy = list.map((it) => it.value);
      snap(7, `display() returns a copy of the list, ${pyList(copy)}: front first, back last.`, { roles: allRoles(list.length, 'compare') });
      record(op, copy);
      return;
    }
    if (op.kind === 'size') {
      snap(7, `size() returns len(self.deque) = ${list.length}.`);
      record(op, list.length);
      return;
    }
    snap(7, `is_empty() returns len(self.deque) == 0, which is ${pyBool(list.length === 0)}.`);
    record(op, list.length === 0);
  });

  rec.setCurrent(ops.length);
  snap(
    undefined,
    `Done: ${pyList(list.map((it) => it.value))}. The front operations moved ${plural(rec.moves(), 'item')} in total; the back operations moved none.`,
  );
  return { frames: rec.frames, steps };
}

/** Circular queue: a ring of `capacity` slots with front / rear indices and the -1 sentinel for empty. */
export function circularQueue({ capacity = CIRCULAR_DEFAULT_CAPACITY, ops }: QueueInput): QueueRun<RingBufferState, CircularQueueStep> {
  const queue: Array<Item | null> = new Array<Item | null>(capacity).fill(null);
  let front = -1;
  let rear = -1;
  let ids = 0;
  let current = -1;
  const out: string[] = [];
  const labels = ops.map(formatQueueOp);
  const frames: Array<Frame<RingBufferState>> = [];
  const steps: CircularQueueStep[] = [];
  // front and rear are never below -1, so JavaScript's % agrees with Python's here.
  const next = (i: number) => (i + 1) % capacity;
  const isEmpty = () => front === -1;
  const isFull = () => next(rear) === front;
  const size = () => (isEmpty() ? 0 : rear >= front ? rear - front + 1 : capacity - front + rear + 1);

  interface Snap {
    roles?: Record<number, Role>;
    flying?: { item: Item; role?: Role };
    slots?: Record<number, Role>;
    frontRole?: Role;
    rearRole?: Role;
    vars?: Vars;
    fresh?: boolean;
  }
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const items: RingItemView[] = [];
    queue.forEach((it, i) => {
      if (it) items.push({ id: it.id, value: it.value, slot: i, role: o.roles?.[i] ?? 'idle' });
    });
    if (o.flying) items.push({ id: o.flying.item.id, value: o.flying.item.value, slot: -1, role: o.flying.role ?? 'active' });
    const pointers: RingPointerView[] = [
      { name: 'front', slot: front, role: o.frontRole },
      { name: 'rear', slot: rear, role: o.rearRole },
    ];
    const head: Vars = current >= 0 && current < ops.length ? [['op', labels[current]]] : [];
    frames.push({
      line,
      caption,
      vars: [...head, ['front', front], ['rear', rear], ['size', size()], ['capacity', capacity], ['(rear + 1) % capacity', next(rear)], ...(o.vars ?? [])],
      state: {
        capacity,
        items,
        pointers,
        slotRoles: o.slots,
        emptyText: 'None',
        listLabel: 'self.queue',
        strips: [opsStrip(labels, current), resultStrip('Dequeued', out, o.fresh)],
      },
    });
  };
  const record = (op: QueueOp, result: PyResult, error: string | null = null) =>
    steps.push({ op, result, error, queue: queue.map((it) => it?.value ?? null), front, rear });
  const fullTest = () => `(rear + 1) % capacity = (${rear} + 1) % ${capacity} = ${next(rear)}`;

  snap(
    undefined,
    `CircularQueue(${capacity}): self.queue = [None] * ${capacity} and front = rear = -1, the sentinel for an empty queue. The slots are used as a ring: after slot ${capacity - 1} comes slot 0.`,
  );

  ops.forEach((op, i) => {
    current = i;
    if (op.kind === 'enqueue') {
      const item: Item = { id: ids++, value: op.value };
      const v = pyRepr(op.value);
      if (isFull()) {
        snap(
          1,
          `enqueue(${v}): is_full() checks ${fullTest()} == front: the next slot to write still holds the oldest item, so all ${capacity} slots are taken and enqueue raises OverflowError("Queue is full").`,
          { flying: { item, role: 'bad' }, slots: { [next(rear)]: 'bad' }, frontRole: 'bad', rearRole: 'bad' },
        );
        record(op, null, 'OverflowError');
        return;
      }
      snap(
        1,
        isEmpty()
          ? `enqueue(${v}): is_full() checks ${fullTest()} against front = -1: they differ (the queue is empty), so there is room.`
          : `enqueue(${v}): is_full() checks ${fullTest()} against front = ${front}: they differ, so slot ${next(rear)} is free.`,
        { flying: { item }, slots: { [next(rear)]: 'compare' }, rearRole: 'compare' },
      );
      if (isEmpty()) {
        front = 0;
        snap(2, 'is_empty() is True (front == -1), so this is the first item: front = 0.', { flying: { item }, frontRole: 'active' });
      }
      const old = rear;
      rear = next(rear);
      snap(
        3,
        old === capacity - 1
          ? `rear = (rear + 1) % capacity = (${old} + 1) % ${capacity} = 0: past the last slot the index wraps around to slot 0, which a dequeue freed.`
          : `rear = (rear + 1) % capacity = (${old} + 1) % ${capacity} = ${rear}.`,
        { flying: { item }, rearRole: 'active' },
      );
      queue[rear] = item;
      snap(4, `queue[${rear}] = ${v}: the item is stored at the rear. No item moved, so enqueue is O(1).`, { roles: { [rear]: 'active' } });
      record(op, null);
      return;
    }
    if (op.kind === 'dequeue') {
      if (isEmpty()) {
        snap(6, 'dequeue(): front == -1, so the queue is empty: dequeue raises IndexError("Queue is empty").', { frontRole: 'bad' });
        record(op, null, 'IndexError');
        return;
      }
      const item = queue[front]!;
      const v = pyRepr(item.value);
      snap(7, `dequeue(): front = ${front}, so the queue is not empty. item = queue[${front}] = ${v}, the oldest item.`, {
        roles: { [front]: 'compare' },
        frontRole: 'compare',
      });
      queue[front] = null;
      snap(7, `queue[${front}] = None: the slot is cleared, so the list no longer keeps ${v} alive.`, { flying: { item }, slots: { [front]: 'compare' } });
      out.push(item.value);
      if (front === rear) {
        const at = front;
        front = -1;
        rear = -1;
        snap(8, `front == rear == ${at}: that was the only item, so front = rear = -1 and the queue is empty again. dequeue returns ${v}.`, {
          flying: { item, role: 'done' },
          frontRole: 'active',
          rearRole: 'active',
          fresh: true,
        });
      } else {
        const old = front;
        front = next(front);
        snap(
          9,
          `front = (front + 1) % capacity = (${old} + 1) % ${capacity} = ${front}${old === capacity - 1 ? ': the front wraps around to slot 0' : ''}. dequeue returns ${v}; no item moved, so it is O(1).`,
          { flying: { item, role: 'done' }, frontRole: 'active', fresh: true },
        );
      }
      record(op, item.value);
      return;
    }
    if (op.kind === 'peek') {
      if (isEmpty()) {
        snap(10, 'peek(): front == -1, so the queue is empty: peek raises IndexError("Queue is empty").', { frontRole: 'bad' });
        record(op, null, 'IndexError');
        return;
      }
      snap(10, `peek() returns queue[front] = queue[${front}] = ${pyRepr(queue[front]!.value)} without removing it.`, {
        roles: { [front]: 'done' },
        frontRole: 'compare',
      });
      record(op, queue[front]!.value);
      return;
    }
    if (op.kind === 'size') {
      const n = size();
      snap(
        11,
        isEmpty()
          ? 'size(): front == -1, so the queue is empty and size() returns 0.'
          : rear >= front
            ? `size(): rear = ${rear} >= front = ${front}, so the items sit in one run: rear - front + 1 = ${n}.`
            : `size(): rear = ${rear} < front = ${front}, so the items wrap past the end: capacity - front + rear + 1 = ${capacity} - ${front} + ${rear} + 1 = ${n}.`,
        { frontRole: 'compare', rearRole: 'compare' },
      );
      record(op, n);
      return;
    }
    if (op.kind === 'is_full') {
      snap(12, `is_full() returns ${fullTest()} == front (${front}), which is ${pyBool(isFull())}.`, {
        slots: isEmpty() ? undefined : { [next(rear)]: 'compare' },
        frontRole: 'compare',
      });
      record(op, isFull());
      return;
    }
    snap(12, `is_empty() returns front == -1, which is ${pyBool(isEmpty())}.`, { frontRole: 'compare' });
    record(op, isEmpty());
  });

  current = ops.length;
  const live: string[] = [];
  for (let k = 0, at = front; k < size(); k++, at = next(at)) live.push(queue[at]!.value);
  snap(
    undefined,
    `Done: ${plural(size(), 'item')} in the ring${live.length ? `, ${pyList(live)} from front to rear` : ''}. front and rear only ever moved forward by one slot with % capacity, so every operation was O(1).`,
  );
  return { frames, steps };
}
