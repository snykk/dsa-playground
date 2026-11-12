# Singly Linked List

A singly linked list is a chain of nodes, each holding a value and a reference to the next node. Insert at the head is O(1) and nothing is shifted; reaching the i-th element, appending (without a tail pointer) and deleting by value are O(n).

## Intuition

Think of a scavenger hunt: each clue tells you where the next one is, and you only know where the first clue is. To visit clue 5 you must follow clues 1 to 4. The list stores only `head`, the first clue; the last node's `next` is null and ends the hunt. The invariant: following `next` from `head` visits every element exactly once and then reaches null. Losing the reference to the head, or overwriting a `next` before saving it, loses the rest of the chain.

## Visual

```text
head
 |
 v
[7|*]--->[3|*]--->[9|*]--->[5|/]      (/ = null)

insert_at_head(1):  [1|*]--->[7|*]--->[3|*]--->...

delete(3):   prev=[7]  curr=[3]   ->   [7|*]----------->[9|*]
                                   prev.next = curr.next
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `insert_at_head(x)` | new node with `next = head`; `head = new` | O(1) |
| `insert_at_tail(x)` | walk to the last node, link the new node | O(n) |
| `delete(key)` | unlink the first node holding `key` | O(n) |
| `display()` | the values from head to tail | O(n) |

Name differences: Python and Go call delete `delete` / `Delete`; C++ calls it `delete_node`. `display` returns a list (Python) or slice (Go) and prints in C++, which also has `to_vector()`. There is no search, size or reverse.

### Delete by value

Walk with `prev` and `curr` until `curr` holds the key, then:

- if `prev` is null (the match is the head): `head = curr.next`;
- otherwise: `prev.next = curr.next`;
- if no node matches, nothing changes; if there are duplicates, only the first is removed.

C++ then frees the node with `delete`; Python and Go rely on garbage collection.

## Step-by-Step Trace

| Step | Call | List |
| --- | --- | --- |
| 1 | `insert_at_head(2)` | 2 |
| 2 | `insert_at_head(1)` | 1, 2 |
| 3 | `insert_at_tail(3)` | 1, 2, 3 |
| 4 | `delete(2)` (middle) | 1, 3 |
| 5 | `delete(1)` (head) | 3 |
| 6 | `delete(3)` (only node) | empty |

Reversal (an exercise, not in the code) uses three pointers. For `[1, 2, 3]`: set `next = curr.next`, `curr.next = prev`, `prev = curr`, `curr = next` three times; the new head is `prev`, giving `3, 2, 1`. It is O(n) time and O(1) extra space.

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| insert at head | O(1) | two pointer writes |
| insert at tail | O(n) | walk n - 1 links (O(1) with a tail pointer) |
| delete by value | O(n) | search with `prev`; the unlink is O(1) |
| search, access by index | O(n) | forward walk only |

Space is O(n) for n nodes; every operation uses O(1) extra space.

## When to Use

Use it for stacks, for queues (with a tail pointer), for hash-table chains and when you insert or remove at the front. Do not use it when you need indexing, backward movement or the best cache behaviour: use an array or a doubly linked list.

## Singly Linked List vs. Alternatives

| Operation | Singly linked list | Dynamic array |
| --- | --- | --- |
| access by index | O(n) | O(1) |
| insert at front | O(1) | O(n) |
| insert at end | O(n), O(1) with tail | O(1) amortized |
| insert after a node you hold | O(1) | O(n) |
| cache behaviour | poor | good |

## Common Pitfalls

- Losing the head: link the new node to the old chain before moving `head`.
- Null dereference: check `curr` before `curr.next`, and handle the empty list.
- Deleting without `prev`: track the predecessor while walking.
- Forgetting the head case in delete.
- Assuming tail insertion is O(1).
- C++: a missing destructor leaks every node, and copying a list that owns raw nodes double-frees (the destructor frees the chain; the copy operations are deleted).

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [`Python/`](./Python) | `singly_linked_list.py` | `display()` returns a list |
| C++ | [`C++/`](./C++) | `singly_linked_list.cpp` | `delete_node`; destructor; `to_vector()` for tests |
| Go | [`Go/`](./Go) | `main.go` | `Delete`, `Display() []int` |

## Practice Problems

- [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/)
- [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)
- [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)
- [Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)
- [Middle of the Linked List](https://leetcode.com/problems/middle-of-the-linked-list/)

## Related

- [Doubly Linked List](../Doubly)
- [Circular Linked List](../Circular)
- [Linked List Stack](../../Stack/Linked_List_Stack)
- [Simple Queue](../../Queue/Simple%20Queue)
