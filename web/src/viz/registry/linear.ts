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

  // Strings
};
