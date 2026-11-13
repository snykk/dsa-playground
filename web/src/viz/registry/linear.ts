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
    topics: ['Data_Structures/Linear/Array', 'Data_Structures/Linear'],
  },
  {
    id: 'singly-linked-list',
    title: 'Singly Linked List',
    group: 'Linear Structures',
    blurb: 'Insert at the head with two pointer writes, walk to the tail, and unlink a value with prev and curr.',
    topics: ['Data_Structures/Linear/Linked_List/Singly', 'Data_Structures/Linear/Linked_List', 'Data_Structures/Linear'],
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
    topics: ['Data_Structures/Linear/Stack/Static_Array_Stack', 'Data_Structures/Linear/Stack', 'Data_Structures/Linear'],
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
    topics: ['Data_Structures/Linear/Queue/Circular_Queue', 'Data_Structures/Linear/Queue', 'Data_Structures/Linear'],
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
  {
    id: 'string-basics',
    title: 'String Basics',
    group: 'Linear Structures',
    blurb: 'Index, measure, traverse, slice and concatenate: s[i] raises out of range, a slice clamps its bounds, and s + t copies both strings.',
    topics: ['Data_Structures/Linear/String/String_Basics', 'Data_Structures/Linear/String', 'Data_Structures/Linear'],
  },
  {
    id: 'string-reverse',
    title: 'Reverse and Palindrome',
    group: 'Linear Structures',
    blurb: 's[::-1] builds a reversed copy from the last index; the palindrome check builds that whole copy, then compares from the left.',
    topics: ['Data_Structures/Linear/String/String_Manipulation', 'Data_Structures/Linear/String'],
  },
  {
    id: 'string-count-replace',
    title: 'Vowels, Replace and Case',
    group: 'Linear Structures',
    blurb: 'One pass each: count the characters in "aeiouAEIOU", replace leftmost matches without overlaps, map every letter to the other case.',
    topics: ['Data_Structures/Linear/String/String_Manipulation', 'Data_Structures/Linear/String'],
  },
  {
    id: 'string-split-join',
    title: 'Split and Join',
    group: 'Linear Structures',
    blurb: 'split(sep) cuts at every separator and keeps empty fields; join adds up the sizes, allocates once and copies the pieces in.',
    topics: ['Data_Structures/Linear/String/String_Manipulation', 'Data_Structures/Linear/String'],
  },
  {
    id: 'rope',
    title: 'Rope',
    group: 'Linear Structures',
    blurb: 'A tree of short fragments: index follows the weights, split cuts one path, and an AVL-style join keeps the tree balanced with rotations.',
    topics: ['Data_Structures/Linear/String/Rope', 'Data_Structures/Linear/String'],
  },
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
  'string-basics': () => import('../specs/stringBasics').then((m) => m.stringBasics),
  'string-reverse': () => import('../specs/stringManipulation').then((m) => m.stringReverse),
  'string-count-replace': () => import('../specs/stringManipulation').then((m) => m.stringCountReplace),
  'string-split-join': () => import('../specs/stringManipulation').then((m) => m.stringSplitJoin),
  rope: () => import('../specs/rope').then((m) => m.rope),
};
