# Circular Linked List

A circular linked list is a singly linked list whose last node points back to the first, forming a ring with no null end. It is the natural shape for round-robin work. This implementation keeps only a `head` pointer, so inserts and deletes are O(n).

## Intuition

Picture people sitting around a table passing a token: whoever holds it hands it to the next person, and after the last person it returns to the first. You know a lap is complete when the token is back at the starting seat. In the list, each node holds a value and a `next` reference, the last node's `next` is the head, and a traversal stops when it returns to the head.

Invariant: for a non-empty list, following `next` from the head returns to the head after exactly n steps. An empty list has `head = None`; a one-node list has `head.next == head`.

## Visual

```text
head
 |
 v
[20] --> [10] --> [30] --+
 ^                       |
 +-----------------------+   tail.next == head

one node:   head --> [42] --+
                      ^     |
                      +-----+

empty:      head = None
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `insert_at_head(x)` | walk to the tail, put the new node before the head, repoint the tail | O(n) |
| `insert_at_tail(x)` | walk to the tail, append the new node, point it at the head | O(n) |
| `delete_value(key)` | remove the first node holding `key` | O(n) |
| `traverse(limit)` | collect or print values from the head until back at the head | O(n) |

### Delete by value: cases

1. Empty list: nothing happens.
2. Only node (`head.next == head`): if it matches, `head` becomes null (C++ frees the node first).
3. Matching node is the head of a longer list: walk to the tail, then `head = head.next` and `tail.next = head`.
4. Matching node is in the middle or at the tail: set `prev.next = curr.next`.
5. No match: the scan returns to the head and stops.

Names: `insert_at_head`, `delete_value`, `traverse` (Python); `insertAtHead`, `deleteValue`, `traverse` (C++); `InsertAtHead`, `DeleteValue`, `Traverse` (Go). Python `traverse` returns a list and has no limit by default; C++ and Go print, and take a limit (C++ default 10).

## Step-by-Step Trace

| Step | Call | Ring (from head) |
| --- | --- | --- |
| 1 | `insert_at_head(10)` | 10 |
| 2 | `insert_at_head(20)` | 20, 10 |
| 3 | `insert_at_tail(30)` | 20, 10, 30 |
| 4 | `delete_value(10)` (middle) | 20, 30 |
| 5 | `delete_value(20)` (head) | 30 |
| 6 | `delete_value(30)` (only node) | empty |

## Complexity

| Operation | Time | Space |
| --- | --- | --- |
| insert at head or tail | O(n) | O(1) |
| delete by value | O(n) | O(1) |
| traverse | O(n) | O(1) |

Inserts are O(n) only because the code stores no tail pointer and must walk to the last node. If you store `tail` instead and use `tail.next` as the head, inserting at the head or the tail is O(1). Total space is O(n) for n nodes.

## When to Use

Use it when you cycle through items repeatedly (round-robin scheduling, turn order, carousels) and never want a null end. Do not use it when you need random access (use an array) or backward movement (use a doubly linked list).

## Circular Linked List vs. Alternatives

| Structure | End of chain | Strength |
| --- | --- | --- |
| Circular linked list | points to the head | endless cycling |
| Singly linked list | null | simple forward sequence |
| Doubly linked list | null at both ends | backward walks, O(1) delete of a known node |
| Circular queue (array) | indexes wrap with modulo | fixed-size FIFO buffer |

## Common Pitfalls

- Looping until null: there is none. Stop at the head.
- Deleting the only node like any other node: the tail is the node itself, so moving the head changes nothing. Set the head to null.
- Forgetting to repoint the tail when the head changes.
- Comparing values instead of node identity to detect a full lap (values can repeat).
- C++: freeing a ring with a plain `while (head)` loop never ends. Open the ring first (the destructor does).
- Counting on the C++ default `limit` of 10: a longer list is silently cut short.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [`Python/`](./Python) | `circular_linked_list.py` | `traverse` returns a list |
| C++ | [`C++/`](./C++) | `circular_linked_list.cpp` | destructor frees the ring; copying is deleted; `traverse` prints |
| Go | [`Go/`](./Go) | `main.go` | garbage collected; `Traverse` prints |

## Practice Problems

- [Find the Winner of the Circular Game](https://leetcode.com/problems/find-the-winner-of-the-circular-game/)
- [Insert into a Sorted Circular Linked List](https://leetcode.com/problems/insert-into-a-sorted-circular-linked-list/)
- [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)
- [Design Circular Queue](https://leetcode.com/problems/design-circular-queue/)

## Related

- [Singly Linked List](../Singly)
- [Doubly Linked List](../Doubly)
- [Circular Queue](../../Queue/Circular%20Queue)
