import type { VizSpec } from '../core/types';
import {
  CIRCULAR_MAX_CAPACITY,
  QUEUE_MAX_ITEMS,
  circularQueue as circularTrace,
  dequeTrace,
  parseCircularQueue,
  parseDeque,
  parseSimpleQueue,
  simpleQueue as simpleTrace,
  type DequeOp,
  type QueueInput,
} from '../algorithms/queue';
import { ArrayTrack, stabilizeTrack, type ArrayTrackState } from '../renderers/ArrayTrack';
import { RingBuffer, type RingBufferState } from '../renderers/RingBuffer';

const OPS_HELP =
  'Operations separated by commas: "enqueue 5" (or just "5"), "dequeue", "peek", "size", "is_empty". Values are numbers from -99 to 999 or words of up to 3 letters; up to 30 operations.';

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/** A random queue script that never holds more than `max` items. */
function randomQueueScript(max: number, extra: string[], prefix = ''): string {
  const ops: string[] = [];
  let live = 0;
  const count = 9 + Math.floor(Math.random() * 7);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (live === 0 && r < 0.1) ops.push('dequeue');
    else if ((r < 0.55 && live < max) || live === 0) {
      ops.push(`enqueue ${1 + Math.floor(Math.random() * 99)}`);
      live++;
    } else if (r < 0.85) {
      ops.push('dequeue');
      live--;
    } else ops.push(pick(extra));
  }
  return `${prefix}${ops.join(', ')}`;
}

export const simpleQueue: VizSpec<QueueInput, ArrayTrackState> = {
  id: 'simple-queue',
  title: 'Simple Queue',
  inputKind: 'queue-ops',
  inputLabel: 'Operations',
  inputHelp: `${OPS_HELP} At most ${QUEUE_MAX_ITEMS} items at once; a "capacity" clause is ignored, because this queue grows.`,
  examples: [
    { label: 'Dequeue shifts', value: 'enqueue 10, enqueue 20, enqueue 30, dequeue, enqueue 40, dequeue' },
    { label: 'Long line', value: 'enqueue 1, enqueue 2, enqueue 3, enqueue 4, enqueue 5, enqueue 6, enqueue 7, dequeue, dequeue, dequeue' },
    { label: 'FIFO order', value: 'enqueue A, enqueue B, enqueue C, dequeue, dequeue, dequeue' },
    { label: 'Empty queue', value: 'dequeue, enqueue 5, peek, dequeue, peek, is_empty' },
  ],
  randomInput: () => randomQueueScript(QUEUE_MAX_ITEMS - 2, ['peek', 'size']),
  parse: parseSimpleQueue,
  trace: (input) => stabilizeTrack(simpleTrace(input).frames),
  render: (state) => <ArrayTrack state={state} />,
  pseudocode: [
    'enqueue(item):',
    '  self.queue.append(item)              # at the back: nothing moves',
    'dequeue():',
    '  if self.is_empty(): raise IndexError("Queue is empty")',
    '  return self.queue.pop(0)             # every other item moves one slot left',
    'peek(): if self.is_empty(): raise IndexError(...); return self.queue[0]',
    'size(): return len(self.queue)    is_empty(): return len(self.queue) == 0',
  ],
  legend: [
    { role: 'active', label: 'item arriving, leaving or shifting' },
    { role: 'compare', label: 'front being emptied' },
    { role: 'done', label: 'item returned' },
  ],
  complexity: { time: 'O(1) enqueue, O(n) dequeue (pop(0) shifts)', space: 'O(n)' },
};

export const circularQueue: VizSpec<QueueInput, RingBufferState> = {
  id: 'circular-queue',
  title: 'Circular Queue',
  inputKind: 'queue-ops',
  inputLabel: 'Capacity and operations',
  inputHelp: `Start with "capacity N" (1 to ${CIRCULAR_MAX_CAPACITY}; 5 if you leave it out). ${OPS_HELP} "is_full" is available too.`,
  examples: [
    { label: 'Wrap around', value: 'capacity 5; enqueue A, enqueue B, enqueue C, enqueue D, enqueue E, dequeue, dequeue, enqueue F, enqueue G' },
    { label: 'Full queue', value: 'capacity 3; enqueue 1, enqueue 2, enqueue 3, is_full, enqueue 4, dequeue, enqueue 4' },
    { label: 'Empty again (-1)', value: 'capacity 3; enqueue 1, dequeue, is_empty, dequeue, enqueue 2' },
    { label: 'Size after wrapping', value: 'capacity 4; enqueue 1, enqueue 2, enqueue 3, dequeue, dequeue, enqueue 4, enqueue 5, size' },
    { label: 'Capacity 1', value: 'capacity 1; enqueue 7, enqueue 8, dequeue, enqueue 9, is_full' },
  ],
  randomInput: () => {
    const cap = 3 + Math.floor(Math.random() * 4);
    return randomQueueScript(cap + 1, ['peek', 'size', 'is_full'], `capacity ${cap}; `);
  },
  parse: parseCircularQueue,
  trace: (input) => circularTrace(input).frames,
  render: (state) => <RingBuffer state={state} />,
  pseudocode: [
    'enqueue(item):',
    '  if self.is_full(): raise OverflowError("Queue is full")   # (rear + 1) % capacity == front',
    '  if self.is_empty(): self.front = 0                        # front == -1',
    '  self.rear = (self.rear + 1) % self.capacity',
    '  self.queue[self.rear] = item',
    'dequeue():',
    '  if self.is_empty(): raise IndexError("Queue is empty")',
    '  item = self.queue[self.front]; self.queue[self.front] = None',
    '  if self.front == self.rear: self.front = self.rear = -1   # the last item left',
    '  else: self.front = (self.front + 1) % self.capacity; return item',
    'peek(): if self.is_empty(): raise IndexError(...); return self.queue[self.front]',
    'size(): 0 if empty, rear - front + 1 if rear >= front, else capacity - front + rear + 1',
    'is_full(): (rear + 1) % capacity == front    is_empty(): front == -1',
  ],
  legend: [
    { role: 'active', label: 'item or index being moved' },
    { role: 'compare', label: 'slot or index being checked' },
    { role: 'done', label: 'item returned' },
    { role: 'bad', label: 'full or empty: the call raises' },
  ],
  complexity: { time: 'O(1) per operation', space: 'O(capacity), allocated once' },
};

export const deque: VizSpec<DequeOp[], ArrayTrackState> = {
  id: 'deque',
  title: 'Deque',
  inputKind: 'deque-ops',
  inputLabel: 'Operations',
  inputHelp: `Operations separated by commas: "push_front 5" (pf), "push_back 5" (pb), "pop_front" (popf), "pop_back" (popb), "peek_front", "peek_back", "size", "is_empty", "display". At most ${QUEUE_MAX_ITEMS} items at once and 30 operations.`,
  examples: [
    { label: 'Both ends', value: 'push_front 1, push_back 2, push_front 3, push_back 4, display, pop_front, pop_back' },
    { label: 'Front is O(n)', value: 'push_back 1, push_back 2, push_back 3, push_back 4, push_front 0, pop_front, pop_front' },
    { label: 'Used as a stack', value: 'push_back A, push_back B, pop_back, pop_back, pop_back' },
    { label: 'Empty deque', value: 'pop_front, peek_back, push_front 9, peek_front, is_empty' },
  ],
  randomInput: () => {
    const ops: string[] = [];
    let live = 0;
    const count = 9 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      if ((r < 0.55 && live < QUEUE_MAX_ITEMS - 2) || live === 0) {
        ops.push(`${Math.random() < 0.5 ? 'push_front' : 'push_back'} ${1 + Math.floor(Math.random() * 99)}`);
        live++;
      } else if (r < 0.85) {
        ops.push(Math.random() < 0.5 ? 'pop_front' : 'pop_back');
        live--;
      } else ops.push(pick(['peek_front', 'peek_back', 'size', 'display']));
    }
    return ops.join(', ');
  },
  parse: (text) => parseDeque(text),
  trace: (ops) => stabilizeTrack(dequeTrace(ops).frames),
  render: (state) => <ArrayTrack state={state} />,
  pseudocode: [
    'push_front(item): self.deque.insert(0, item)     # every item moves one slot right',
    'push_back(item):  self.deque.append(item)',
    'pop_front(): if self.is_empty(): raise IndexError("Deque is empty")',
    '  return self.deque.pop(0)                       # every item moves one slot left',
    'pop_back():  if self.is_empty(): raise IndexError("Deque is empty")',
    '  return self.deque.pop()',
    'peek_front(): return self.deque[0]    peek_back(): return self.deque[-1]',
    'size(): len(self.deque)    is_empty(): len == 0    display(): self.deque.copy()',
  ],
  legend: [
    { role: 'active', label: 'item arriving, leaving or shifting' },
    { role: 'compare', label: 'end being emptied, or items copied by display' },
    { role: 'done', label: 'item returned' },
  ],
  complexity: { time: 'O(1) at the back, O(n) at the front (the list shifts)', space: 'O(n)' },
};
