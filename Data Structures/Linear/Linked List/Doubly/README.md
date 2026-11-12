# Doubly Linked List

A doubly linked list gives every node a `next` and a `prev` link, so it can be walked in both directions and a node can be unlinked without finding its predecessor. In this implementation only the `head` is stored, so insert at head is O(1) while insert at tail, delete by value and traversals are O(n).

## Intuition

Think of a train where each carriage is coupled to the one in front and the one behind. From any carriage you can step forward or backward, and to remove one you re-couple its two neighbours to each other. The invariant: for every node `x`, `x.next.prev == x` and `x.prev.next == x`. Every insert and delete is a matter of updating both halves of that pair.

## Visual

```text
        head
         |
         v
None <- [10] <-> [20] <-> [30] -> None
        prev  next

delete 20: rewire both neighbours

None <- [10] <-> [30] -> None
        (10.next = 30, 30.prev = 10)
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `insert_at_head(x)` | new node in front, old head's `prev` set | O(1) |
| `insert_at_tail(x)` | walk to the last node, append | O(n) |
| `delete_value(x)` | find the first match, rewire both neighbours | O(n) |
| `traverse_forward()` | print head to tail | O(n) |
| `traverse_backward()` | walk to the last node, print via `prev` | O(n) |

Names: Python `insert_at_head`, `delete_value`, `traverse_forward`; C++ `insertAtHead`, `deleteValue`, `traverseForward`; Go `InsertAtHead`, `DeleteValue`, `TraverseForward`. Traversals print. Only Python's `delete_value` returns a value (True if something was deleted).

### Delete by value: cases

| Match is | Update |
| --- | --- |
| the head | `head = head.next`; the new head's `prev` becomes null |
| in the middle | `prev.next = next` and `next.prev = prev` |
| the last node | `prev.next = null` |
| the only node | `head` becomes null |

C++ frees the removed node with `delete`; Python and Go leave it to the garbage collector.

## Step-by-Step Trace

| Step | Call | List (head to tail) |
| --- | --- | --- |
| 1 | `insert_at_head(10)` | 10 |
| 2 | `insert_at_tail(20)` | 10, 20 |
| 3 | `insert_at_tail(30)` | 10, 20, 30 |
| 4 | `delete_value(20)` | 10, 30 |
| 5 | `traverse_backward()` | prints 30, 10 |

## Complexity

| Operation | This code | With a tail pointer |
| --- | --- | --- |
| insert at head | O(1) | O(1) |
| insert at tail | O(n) | O(1) |
| delete a node you hold | not offered (API takes a value) | O(1) |
| delete by value | O(n) | O(n) |
| search | O(n) | O(n) |

Space is O(n) with two references per node. Deleting a node you already hold is O(1) because both neighbours are one link away; this code deletes by value, so it searches first.

## When to Use

Use it when you walk in both directions or remove nodes you already hold (an LRU cache, a deque, undo history). Do not use it for random access (use an array) or when memory per element matters and you only walk forward (a singly linked list uses one link less).

## Doubly Linked List vs. Alternatives

| Structure | Walk backward | Delete a held node | Memory per node |
| --- | --- | --- | --- |
| Doubly linked list | yes | O(1) | two links |
| Singly linked list | no | O(n) to find the predecessor | one link |
| Dynamic array | yes, by index | O(n) shift | none |
| Circular linked list | no (singly) | O(n) | one link |

## Common Pitfalls

- Updating only one direction on delete: a backward walk then still sees the removed node.
- Null dereference at the ends: the head has no `prev`, the tail has no `next`.
- Forgetting to move `head` when the head is deleted.
- Overwriting a neighbour's link before saving the reference you still need.
- Assuming insert at tail is O(1) without a stored tail.
- C++: forgetting to free nodes (the destructor does) or copying a list that owns raw nodes (the copy operations are deleted).

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [`Python/`](./Python) | `doubly_linked_list.py` | `delete_value` returns a bool |
| C++ | [`C++/`](./C++) | `doubly_linked_list.cpp` | destructor frees all nodes; copying deleted |
| Go | [`Go/`](./Go) | `main.go` | garbage collected; `DeleteValue` returns nothing |

## Practice Problems

- [Design Linked List](https://leetcode.com/problems/design-linked-list/)
- [LRU Cache](https://leetcode.com/problems/lru-cache/)
- [Flatten a Multilevel Doubly Linked List](https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/)
- [Design Browser History](https://leetcode.com/problems/design-browser-history/)

## Related

- [Singly Linked List](../Singly)
- [Circular Linked List](../Circular)
- [Deque](../../Queue/Deque)
- [LRU Cache](../../../Advanced_Structures/LRU%20Cache)
