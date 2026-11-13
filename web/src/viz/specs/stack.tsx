import type { VizSpec } from '../core/types';
import {
  DYNAMIC_MAX_ITEMS,
  LINKED_MAX_NODES,
  STATIC_MAX_CAPACITY,
  dynamicStack,
  linkedStack,
  parseDynamicStack,
  parseLinkedStack,
  parseStaticStack,
  staticStack,
  type StackInput,
} from '../algorithms/stack';
import { ArrayTrack, stabilizeTrack, type ArrayTrackState } from '../renderers/ArrayTrack';
import { ChainView, stabilizeChain, type ChainState } from '../renderers/ChainView';

const OPS_HELP =
  'Operations separated by commas: "push 5" (or just "5"), "pop", "peek", "size", "is_empty". Values are numbers from -99 to 999 or words of up to 3 letters; up to 30 operations.';

const OVERVIEW = 'capacity 3; push A, push B, push C, push D, pop, pop, peek, size';

/** A random script that never holds more than `max` items, with a few pops past empty now and then. */
function randomScript(max: number, prefix = ''): string {
  const ops: string[] = [];
  let live = 0;
  const count = 8 + Math.floor(Math.random() * 7);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (live === 0 && r < 0.1) {
      ops.push('pop');
    } else if ((r < 0.55 && live < max) || live === 0) {
      ops.push(`push ${1 + Math.floor(Math.random() * 99)}`);
      live++;
    } else if (r < 0.85) {
      ops.push('pop');
      live--;
    } else {
      ops.push(Math.random() < 0.5 ? 'peek' : 'size');
    }
  }
  return `${prefix}${ops.join(', ')}`;
}

export const staticArrayStack: VizSpec<StackInput, ArrayTrackState> = {
  id: 'static-array-stack',
  title: 'Static Array Stack',
  inputKind: 'stack-ops',
  inputLabel: 'Capacity and operations',
  inputHelp: `Start with "capacity N" (1 to ${STATIC_MAX_CAPACITY}; 5 if you leave it out, since the Python default of 100 would not fit). ${OPS_HELP}`,
  examples: [
    { label: 'Push until full', value: 'capacity 3; push 10, push 20, push 30, push 40, pop, push 50' },
    { label: 'Pop an empty stack', value: 'capacity 2; pop, push 7, peek, pop, pop' },
    { label: 'LIFO order', value: 'capacity 5; push A, push B, push C, pop, pop, pop' },
    { label: 'Capacity 1', value: 'capacity 1; push 5, push 6, is_empty, pop, is_empty' },
    { label: 'Overview sequence', value: OVERVIEW },
  ],
  randomInput: () => {
    const cap = 2 + Math.floor(Math.random() * 4);
    return randomScript(cap + 1, `capacity ${cap}; `);
  },
  parse: parseStaticStack,
  trace: (input) => stabilizeTrack(staticStack(input).frames),
  render: (state) => <ArrayTrack state={state} />,
  pseudocode: [
    'push(value):',
    '  if self.top == self.capacity - 1:       # every slot is in use',
    '    raise OverflowError("Stack overflow")',
    '  self.top += 1',
    '  self.stack[self.top] = value',
    'pop():',
    '  if self.is_empty(): raise IndexError("Pop from empty stack")',
    '  value = self.stack[self.top]',
    '  self.stack[self.top] = None             # do not keep it alive',
    '  self.top -= 1; return value',
    'peek(): if self.is_empty(): raise IndexError("Peek from empty stack")',
    '  return self.stack[self.top]',
    'size(): return self.top + 1',
    'is_empty(): return self.top == -1',
  ],
  legend: [
    { role: 'active', label: 'value being pushed or popped' },
    { role: 'compare', label: 'slot or top being checked' },
    { role: 'done', label: 'value returned' },
    { role: 'bad', label: 'overflow or empty-stack error' },
  ],
  complexity: { time: 'O(1) per operation', space: 'O(capacity), allocated once' },
};

export const dynamicArrayStack: VizSpec<StackInput, ArrayTrackState> = {
  id: 'dynamic-array-stack',
  title: 'Dynamic Array Stack',
  inputKind: 'stack-ops',
  inputLabel: 'Operations',
  inputHelp: `${OPS_HELP} At most ${DYNAMIC_MAX_ITEMS} items at once; a "capacity" clause is ignored, because this stack grows.`,
  examples: [
    { label: 'Grow 0, 4, 8', value: 'push 1, push 2, push 3, push 4, push 5' },
    { label: 'Grow to 16, shrink to 12', value: 'push 1, push 2, push 3, push 4, push 5, push 6, push 7, push 8, push 9, pop, pop, pop' },
    { label: 'Pop to empty', value: 'push A, push B, pop, pop, pop, peek' },
    { label: 'Overview sequence', value: OVERVIEW },
  ],
  randomInput: () => randomScript(DYNAMIC_MAX_ITEMS),
  parse: parseDynamicStack,
  trace: (input) => stabilizeTrack(dynamicStack(input).frames),
  render: (state) => <ArrayTrack state={state} />,
  pseudocode: [
    'push(value):',
    '  self.stack.append(value)              # stored at index len(stack)',
    '    # no free slot: list_resize allocates (n + n // 8 + 6) & ~3 slots and copies',
    'pop():',
    '  if self.is_empty(): raise IndexError("Pop from empty stack")',
    '  return self.stack.pop()               # under half full: the block shrinks',
    'peek(): if self.is_empty(): raise IndexError(...); return self.stack[-1]',
    'size(): return len(self.stack)    is_empty(): return len(self.stack) == 0',
  ],
  legend: [
    { role: 'active', label: 'value being pushed or popped, item being copied' },
    { role: 'compare', label: 'len being checked against the allocation' },
    { role: 'done', label: 'value returned' },
    { role: 'bad', label: 'no free slot, or empty-stack error' },
  ],
  complexity: { time: 'O(1) amortized push, O(1) pop and peek', space: 'O(n), plus spare slots' },
};

export const linkedListStack: VizSpec<StackInput, ChainState> = {
  id: 'linked-list-stack',
  title: 'Linked List Stack',
  inputKind: 'stack-ops',
  inputLabel: 'Operations',
  inputHelp: `${OPS_HELP} At most ${LINKED_MAX_NODES} nodes at once; a "capacity" clause is ignored.`,
  examples: [
    { label: 'Push and pop', value: 'push 10, push 20, push 30, pop, peek' },
    { label: 'Pop until empty', value: 'push 1, pop, pop, is_empty' },
    { label: 'LIFO order', value: 'push A, push B, push C, pop, pop, pop' },
    { label: 'Overview sequence', value: OVERVIEW },
  ],
  randomInput: () => randomScript(LINKED_MAX_NODES),
  parse: parseLinkedStack,
  trace: (input) => stabilizeChain(linkedStack(input).frames),
  render: (state) => <ChainView state={state} />,
  pseudocode: [
    'push(value):',
    '  new_node = Node(value)               # next is None',
    '  new_node.next = self.top             # link first ...',
    '  self.top = new_node                  # ... then move top',
    '  self._size += 1',
    'pop():',
    '  if self.is_empty(): raise IndexError("Pop from empty stack")',
    '  value = self.top.value',
    '  self.top = self.top.next',
    '  self._size -= 1; return value',
    'peek(): if self.is_empty(): raise IndexError(...); return self.top.value',
    'size(): return self._size    is_empty(): return self.top is None',
  ],
  legend: [
    { role: 'active', label: 'new node, or the pointer just changed' },
    { role: 'compare', label: 'node being read' },
    { role: 'done', label: 'value returned' },
    { role: 'muted', label: 'unlinked node (garbage)' },
    { role: 'bad', label: 'empty-stack error' },
  ],
  complexity: { time: 'O(1) per operation', space: 'O(n): a node per item' },
};
