import type { VizSpec } from '../core/types';
import { PQ_MAX_ENTRIES, parsePriorityQueue, priorityQueue as pqTrace, type PqOp } from '../algorithms/priorityQueue';
import { HeapView, stabilizeHeap, type HeapState } from '../renderers/HeapView';

const ITEMS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];

function randomOps(): string {
  const ops: string[] = [];
  let live = 0;
  let next = 0;
  const count = 10 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if ((r < 0.6 && live < PQ_MAX_ENTRIES - 2) || live === 0) {
      ops.push(`enqueue ${ITEMS[next++ % ITEMS.length]} ${Math.floor(Math.random() * 5)}`);
      live++;
    } else if (r < 0.9) {
      ops.push('dequeue');
      live--;
    } else ops.push('peek');
  }
  return ops.join(', ');
}

export const priorityQueue: VizSpec<PqOp[], HeapState> = {
  id: 'priority-queue',
  title: 'Priority Queue (heapq)',
  inputKind: 'pq-ops',
  inputLabel: 'Operations',
  inputHelp: `Operations separated by commas: "enqueue A 3" (item and priority; "A:3" for short), "dequeue", "peek", "size", "is_empty", "clear". A lower priority leaves first. Items are short words or numbers, priorities -99 to 99; at most ${PQ_MAX_ENTRIES} entries at once and 30 operations.`,
  examples: [
    { label: 'Tasks, ties keep order', value: 'enqueue rep 3, enqueue fix 1, enqueue eml 3, enqueue dep 2, enqueue rev 1, dequeue, dequeue, dequeue, dequeue, dequeue' },
    { label: 'Equal priorities', value: 'A:1, B:1, C:1, D:1, dequeue, dequeue, dequeue' },
    { label: 'Sift up to the root', value: 'A:5, B:4, C:3, D:2, E:1, F:0, peek' },
    { label: 'Sift down to a leaf', value: 'A:1, B:2, C:3, D:4, E:5, F:6, G:7, dequeue, dequeue' },
    { label: 'Max first by negating', value: 'i1:-10, i2:-5, i3:-1, dequeue, dequeue' },
  ],
  randomInput: randomOps,
  parse: (text) => parsePriorityQueue(text),
  trace: (ops) => stabilizeHeap(pqTrace(ops).frames),
  render: (state) => <HeapView state={state} />,
  pseudocode: [
    'enqueue(item, priority):',
    '  heapq.heappush(self.heap, (priority, self.count, item)); self.count += 1',
    '    heappush: append the entry at the end, a new leaf',
    '      siftdown: while entry < parent: swap them',
    'dequeue():',
    '  if self.is_empty(): raise IndexError("Priority queue is empty")',
    '  priority, count, item = heapq.heappop(self.heap); return item',
    '    heappop: last = heap.pop(); result = heap[0]; heap[0] = last',
    '      siftup: swap with the smaller child until a leaf',
    '      siftdown: then swap back up while entry < parent',
    'peek(): if self.is_empty(): raise IndexError(...); return self.heap[0][2]',
    'size(): len(self.heap)    is_empty(): len(self.heap) == 0',
    'clear(): self.heap = []; self.count = 0',
  ],
  legend: [
    { role: 'active', label: 'entry being placed' },
    { role: 'compare', label: 'parent or child it is compared with' },
    { role: 'done', label: 'smallest entry: returned or peeked' },
  ],
  complexity: { time: 'O(log n) enqueue and dequeue, O(1) peek', space: 'O(n)' },
};
