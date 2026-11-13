import type { VizSpec } from '../core/types';
import { parseListOps, traceLinkedList, type ListKind, type ListOp } from '../algorithms/linkedList';
import { ChainView, stabilizeChain, type ChainState } from '../renderers/ChainView';

/** The three plain lists share one input box: the same script runs on each tab. */
const INPUT_KIND = 'linked-list-ops';

const HELP_BASE =
  'Operations separated by commas: "head 5" inserts at the head, "tail 5" at the tail, "delete 5" removes the first 5 (h, t, d for short; "tail 1 2 3" inserts three).';

function randomOps(kind: ListKind): string {
  const pool = Array.from({ length: 30 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  const present: number[] = [];
  const ops: string[] = [];
  const count = 6 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (present.length >= 2 && r < 0.3) {
      const v = present.splice(Math.floor(Math.random() * present.length), 1)[0];
      ops.push(`delete ${v}`);
    } else if (r < 0.37) {
      ops.push(`delete ${pool.pop()}`);
    } else if (present.length < 6) {
      const v = pool.pop() as number;
      present.push(v);
      ops.push(`${Math.random() < 0.5 ? 'head' : 'tail'} ${v}`);
    }
  }
  if (kind === 'doubly') ops.push(Math.random() < 0.5 ? 'forward' : 'backward');
  else ops.push(kind === 'circular' && Math.random() < 0.4 ? 'traverse 3' : kind === 'singly' ? 'display' : 'traverse');
  return ops.join(', ');
}

const SHARED_EXAMPLE = { label: 'Heads, a tail, delete the head', value: 'head 1, head 2, head 3, tail 4, delete 3' };

function trace(kind: ListKind) {
  return (ops: ListOp[]) => stabilizeChain(traceLinkedList(kind, ops).frames);
}

export const singlyLinkedList: VizSpec<ListOp[], ChainState> = {
  id: 'singly-linked-list',
  title: 'Singly Linked List',
  inputKind: INPUT_KIND,
  inputLabel: 'Operations',
  inputHelp: `${HELP_BASE} "display" walks the list. Up to 30 operations and 10 nodes.`,
  examples: [
    SHARED_EXAMPLE,
    { label: 'Walk to the tail', value: 'head 3, head 7, tail 9, tail 5, display' },
    { label: 'Delete head, middle, tail', value: 'tail 1 2 3 4, delete 1, delete 3, delete 4, display' },
    { label: 'Delete the only node', value: 'head 42, delete 42, tail 7' },
    { label: 'Missing key, duplicates', value: 'tail 5 5 6, delete 9, delete 5, display' },
  ],
  randomInput: () => randomOps('singly'),
  parse: (text) => parseListOps(text, 'singly'),
  trace: trace('singly'),
  render: (state) => <ChainView state={state} />,
  pseudocode: [
    'insert_at_head(data):',
    '  node = Node(data)',
    '  node.next = self.head',
    '  self.head = node',
    'insert_at_tail(data):',
    '  node = Node(data)',
    '  if not self.head: self.head = node; return',
    '  curr = self.head',
    '  while curr.next: curr = curr.next      # walk to the last node',
    '  curr.next = node',
    'delete(key):',
    '  curr = self.head; prev = None',
    '  while curr and curr.data != key: prev = curr; curr = curr.next',
    '  if not curr: return                    # key not in the list',
    '  if prev: prev.next = curr.next',
    '  else: self.head = curr.next',
    'display():',
    '  elems = []; curr = self.head',
    '  while curr: elems.append(curr.data); curr = curr.next',
    '  return elems',
  ],
  legend: [
    { role: 'active', label: 'new node / the node being unlinked' },
    { role: 'compare', label: 'curr: the node the walk is on' },
    { role: 'done', label: 'placed / already visited' },
    { role: 'idle', label: 'other nodes' },
  ],
  complexity: { time: 'O(1) at the head; O(n) at the tail, delete and display', space: 'O(n), one next link per node' },
};

export const doublyLinkedList: VizSpec<ListOp[], ChainState> = {
  id: 'doubly-linked-list',
  title: 'Doubly Linked List',
  inputKind: INPUT_KIND,
  inputLabel: 'Operations',
  inputHelp: `${HELP_BASE} "forward" and "backward" run traverse_forward() and traverse_backward(). Up to 30 operations and 10 nodes.`,
  examples: [
    SHARED_EXAMPLE,
    { label: 'Both directions', value: 'head 10, tail 20, tail 30, head 5, forward, backward' },
    { label: 'Delete keeps prev links', value: 'tail 1 2 3 4, delete 2, delete 1, delete 4, backward' },
    { label: 'Only node, missing key', value: 'head 5, delete 9, delete 5, delete 5' },
    { label: 'Duplicates', value: 'tail 7 7 8, delete 7, forward, backward' },
  ],
  randomInput: () => randomOps('doubly'),
  parse: (text) => parseListOps(text, 'doubly'),
  trace: trace('doubly'),
  render: (state) => <ChainView state={state} />,
  pseudocode: [
    'insert_at_head(data):',
    '  new_node = Node(data)',
    '  if self.head:',
    '    self.head.prev = new_node',
    '    new_node.next = self.head',
    '  self.head = new_node',
    'insert_at_tail(data): new_node = Node(data)',
    '  if not self.head: self.head = new_node; return',
    '  temp = self.head',
    '  while temp.next: temp = temp.next      # walk to the last node',
    '  temp.next = new_node',
    '  new_node.prev = temp',
    'delete_value(data):',
    '  temp = self.head',
    '  while temp:',
    '    if temp.data == data:',
    '      if temp.prev: temp.prev.next = temp.next',
    '      else: self.head = temp.next',
    '      if temp.next: temp.next.prev = temp.prev',
    '      return True',
    '    temp = temp.next',
    '  return False',
    'traverse_forward(): temp = self.head',
    '  while temp: print(temp.data, end=" -> "); temp = temp.next',
    '  print("None")',
    'traverse_backward(): temp = self.head  (None: print "None")',
    '  while temp.next: temp = temp.next      # walk to the last node',
    '  while temp: print(temp.data, end=" -> "); temp = temp.prev',
    '  print("None")',
  ],
  legend: [
    { role: 'active', label: 'new node / a link just written' },
    { role: 'compare', label: 'temp: the node the walk is on' },
    { role: 'done', label: 'placed / already printed' },
    { role: 'idle', label: 'other nodes' },
  ],
  complexity: { time: 'O(1) at the head; O(n) at the tail, delete_value and the traversals', space: 'O(n), two links per node' },
};

export const circularLinkedList: VizSpec<ListOp[], ChainState> = {
  id: 'circular-linked-list',
  title: 'Circular Linked List',
  inputKind: INPUT_KIND,
  inputLabel: 'Operations',
  inputHelp: `${HELP_BASE} "traverse" walks one lap; "traverse 3" stops after 3 nodes. Up to 30 operations and 10 nodes.`,
  examples: [
    SHARED_EXAMPLE,
    { label: 'Delete the only node', value: 'head 42, delete 42, tail 7, traverse' },
    { label: 'Delete head, middle, tail', value: 'tail 1 2 3 4, delete 1, delete 3, delete 4, traverse' },
    { label: 'Missing key: one full lap', value: 'tail 1 2 3, delete 9, traverse' },
    { label: 'Traverse with a limit', value: 'head 10, head 20, tail 30, traverse 2, traverse' },
  ],
  randomInput: () => randomOps('circular'),
  parse: (text) => parseListOps(text, 'circular'),
  trace: trace('circular'),
  render: (state) => <ChainView state={state} />,
  pseudocode: [
    'insert_at_head(data):',
    '  new_node = Node(data)',
    '  if not self.head: self.head = new_node; new_node.next = self.head; return',
    '  temp = self.head',
    '  while temp.next != self.head: temp = temp.next   # find the tail',
    '  new_node.next = self.head',
    '  self.head = new_node',
    '  temp.next = self.head',
    'insert_at_tail(data):',
    '  new_node = Node(data)',
    '  if not self.head: (as in insert_at_head)',
    '  temp = self.head; while temp.next != self.head: temp = temp.next',
    '  temp.next = new_node',
    '  new_node.next = self.head',
    'delete_value(key):',
    '  if not self.head: return',
    '  if self.head.next is self.head:         # a single node',
    '    if self.head.data == key: self.head = None',
    '    return',
    '  curr = self.head; prev = None',
    '  while True: if curr.data == key:',
    '      if prev: prev.next = curr.next',
    '      else: tail = self.head; while tail.next != self.head: tail = tail.next',
    '            self.head = curr.next; tail.next = self.head',
    '      return',
    '    prev = curr; curr = curr.next; if curr == self.head: break',
    'traverse(limit=None):',
    '  elements = []; if not self.head: return elements',
    '  temp = self.head; count = 0',
    '  while True: elements.append(temp.data); temp = temp.next; count += 1',
    '    if temp == self.head or (limit is not None and count >= limit): break',
    '  return elements',
  ],
  legend: [
    { role: 'active', label: 'new node / the node being unlinked' },
    { role: 'compare', label: 'the node the walk is on' },
    { role: 'done', label: 'placed / already collected' },
    { role: 'idle', label: 'other nodes' },
  ],
  complexity: { time: 'O(n) for every operation: the code walks to the tail', space: 'O(n), one next link per node' },
};
