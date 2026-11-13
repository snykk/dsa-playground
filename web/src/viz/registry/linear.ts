/** Visualization registry: Linear structures (arrays, linked lists, stacks, queues, strings). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  // Arrays and linked lists
  {
    id: 'dynamic-array',
    title: 'Dynamic Array',
    group: 'Linear Structures',
    blurb: 'Append doubles the capacity when the array is full and pop halves it at a quarter full: watch every element a resize copies.',
    topics: ['Data_Structures/Linear/Array'],
  },
  {
    id: 'singly-linked-list',
    title: 'Singly Linked List',
    group: 'Linear Structures',
    blurb: 'Insert at the head with two pointer writes, walk to the tail, and unlink a value with prev and curr.',
    topics: ['Data_Structures/Linear/Linked_List/Singly', 'Data_Structures/Linear/Linked_List'],
  },
  {
    id: 'doubly-linked-list',
    title: 'Doubly Linked List',
    group: 'Linear Structures',
    blurb: 'Each insert and delete rewires next and prev one pointer write at a time, so the list reads the same in both directions.',
    topics: ['Data_Structures/Linear/Linked_List/Doubly', 'Data_Structures/Linear/Linked_List'],
  },
  {
    id: 'circular-linked-list',
    title: 'Circular Linked List',
    group: 'Linear Structures',
    blurb: 'The last node points back to the head: inserts walk to the tail to keep the ring closed, and deleting the only node empties it.',
    topics: ['Data_Structures/Linear/Linked_List/Circular', 'Data_Structures/Linear/Linked_List'],
  },
  {
    id: 'skip-list',
    title: 'Skip List',
    group: 'Linear Structures',
    blurb: 'Seeded coin flips build the towers; a search moves right or drops a level, and insert and delete splice every level a tower reaches.',
    topics: ['Data_Structures/Linear/Linked_List/Skip_List', 'Data_Structures/Linear/Linked_List'],
  },

  // Stacks and queues
  {
    id: 'static-array-stack',
    title: 'Static Array Stack',
    group: 'Linear Structures',
    blurb: 'A fixed array and a top index: push and pop move only top, and a push onto a full stack raises OverflowError.',
    topics: ['Data_Structures/Linear/Stack/Static_Array_Stack', 'Data_Structures/Linear/Stack'],
  },
  {
    id: 'dynamic-array-stack',
    title: 'Dynamic Array Stack',
    group: 'Linear Structures',
    blurb: "A Python list underneath: watch CPython's allocated slots grow by a factor and shrink when under half full.",
    topics: ['Data_Structures/Linear/Stack/Dynamic_Array_Stack', 'Data_Structures/Linear/Stack'],
  },
  {
    id: 'linked-list-stack',
    title: 'Linked List Stack',
    group: 'Linear Structures',
    blurb: 'Push links a new node in front of top and pop moves top to the next node: no capacity, no copying.',
    topics: ['Data_Structures/Linear/Stack/Linked_List_Stack', 'Data_Structures/Linear/Stack'],
  },
  {
    id: 'simple-queue',
    title: 'Simple Queue',
    group: 'Linear Structures',
    blurb: 'Enqueue appends at the back; dequeue is pop(0), so every remaining item shifts one slot left.',
    topics: ['Data_Structures/Linear/Queue/Simple_Queue', 'Data_Structures/Linear/Queue'],
  },
  {
    id: 'circular-queue',
    title: 'Circular Queue',
    group: 'Linear Structures',
    blurb: 'A fixed array used as a ring: front and rear wrap around with % capacity, and -1 marks an empty queue.',
    topics: ['Data_Structures/Linear/Queue/Circular_Queue', 'Data_Structures/Linear/Queue'],
  },
  {
    id: 'deque',
    title: 'Deque',
    group: 'Linear Structures',
    blurb: 'Push and pop at both ends of a Python list: the back is O(1), the front shifts every item.',
    topics: ['Data_Structures/Linear/Queue/Deque', 'Data_Structures/Linear/Queue'],
  },
  {
    id: 'priority-queue',
    title: 'Priority Queue (heapq)',
    group: 'Linear Structures',
    blurb: 'A binary min heap of (priority, count, item) entries: sift-up on enqueue, sift-down on dequeue, ties in arrival order.',
    topics: ['Data_Structures/Linear/Queue/Priority_Queue', 'Data_Structures/Linear/Queue'],
  },

  // Strings
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  // Arrays and linked lists
  'dynamic-array': () => import('../specs/dynamicArray').then((m) => m.dynamicArray),
  'singly-linked-list': () => import('../specs/linkedList').then((m) => m.singlyLinkedList),
  'doubly-linked-list': () => import('../specs/linkedList').then((m) => m.doublyLinkedList),
  'circular-linked-list': () => import('../specs/linkedList').then((m) => m.circularLinkedList),
  'skip-list': () => import('../specs/skipList').then((m) => m.skipList),

  // Stacks and queues
  'static-array-stack': () => import('../specs/stack').then((m) => m.staticArrayStack),
  'dynamic-array-stack': () => import('../specs/stack').then((m) => m.dynamicArrayStack),
  'linked-list-stack': () => import('../specs/stack').then((m) => m.linkedListStack),
  'simple-queue': () => import('../specs/queue').then((m) => m.simpleQueue),
  'circular-queue': () => import('../specs/queue').then((m) => m.circularQueue),
  deque: () => import('../specs/queue').then((m) => m.deque),
  'priority-queue': () => import('../specs/priorityQueue').then((m) => m.priorityQueue),

  // Strings
};
