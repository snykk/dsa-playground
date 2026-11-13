# Linked List

A linked list stores items in nodes joined by links, so inserting needs no shifting but reaching the i-th item means following i links. The four kinds here differ in the links: one way, both ways, a ring, or extra skip lanes on a sorted list.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Singly Linked List](Singly/) | The base case. Each node has one next link, so you can only walk forward. Insert at the head is O(1). | Beginner |
| 2 | [Doubly Linked List](Doubly/) | Each node also links back, so the list can be walked both ways and a known node can be unlinked in O(1). | Intermediate |
| 3 | [Circular Linked List](Circular/) | The last node points back to the first, forming a ring with no null end. Suits round-robin work. | Intermediate |
| 4 | [Skip List](Skip_List/) | A sorted list with random express lanes. Search, insert and delete take expected O(log n) without rebalancing. | Advanced |

These versions keep only a head pointer, with no tail pointer and no stored length. That is why inserting at the tail walks the whole list.

## How They Compare

| Kind | Links per node | Key property | Insert at head | Insert at tail | Delete by value |
|------|----------------|--------------|----------------|----------------|-----------------|
| Singly | one (`next`) | simplest; walks forward only | O(1) | O(n) | O(n) |
| Doubly | two (`next`, `prev`) | walks both ways; unlinking a known node is O(1) | O(1) | O(n) | O(n) |
| Circular | one (`next`) | no null end: the last node points to the head | O(n) | O(n) | O(n) |
| Skip list | one per level, random heights | sorted keys, no duplicates, no rebalancing | not applicable | not applicable | O(log n) expected |

The circular list is O(n) at the head because it must update the tail's link, and the code finds the tail by walking from the head. The skip list inserts a key at its sorted position, so it has no head or tail insert. Search is O(n) in the first three and O(log n) expected (O(n) worst) in the skip list.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Items are added and removed at the front | Singly | O(1) at the head with one link per node |
| You need to walk backward, or you hold a node and must unlink it | Doubly | the `prev` link removes the search for the predecessor |
| Work cycles through items forever, such as round-robin | Circular | after the last item the walk continues at the head |
| A sorted collection with fast search and simple code | Skip list | expected O(log n) without rotations |
| Index access or a lot of scanning | an [array](../Array/) | one contiguous block is faster and needs no links |

## Common Pitfalls

- Set the new node's `next` before you change the old links, or the rest of the list becomes unreachable.
- Deleting the first node must move `head`. In the circular list the tail's link changes too.
- A circular list has no null end, so stop a walk when you are back at the head.
- Insert at the tail is O(n) here, because there is no tail pointer.
- The skip list's O(log n) is expected, not worst case, and it does not store duplicate keys.

## Related

- [Array](../Array/): read first.
- [Linked List Stack](../Stack/Linked_List_Stack/): a head pointer is a stack.
- [Deque](../Queue/Deque/): a list with two ends works as a queue.
- [LRU Cache](../../Advanced_Structures/LRU_Cache/): a doubly linked list moves an entry to the front in O(1).
- [Binary Search Tree](../../Non_Linear/Trees/Binary_Search_Tree/): the skip list is the randomized alternative to a balanced tree.
