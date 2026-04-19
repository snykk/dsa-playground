# Circular Linked List — Python Implementation

A **Circular Linked List** is a variant where the last node's `next` points back to the head instead of `None`. This small change enables round-robin traversal, cyclic buffers, and elegant solutions to problems like Josephus — but it also means every traversal needs a termination strategy.

For the conceptual overview, diagrams, and comparison with singly / doubly linked lists, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `circular_linked_list.py` | `Node` + `CircularLinkedList` classes with insert / delete / traverse |
| `circular_linked_list_test.py` | Unit tests including empty list, single-node, and head-deletion |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `insert_at_head(val)` | O(n) | We must update the tail's `next` pointer too |
| `insert_at_tail(val)` | O(n) | Walk to tail, then insert and re-link to head |
| `delete_by_value(val)` | O(n) | Standard walk, plus special case when deleting head |
| `traverse(max_steps)` | O(max_steps) | **Bounded** to avoid infinite loops |

---

## Python-Specific Notes

- **`None` has a new meaning in circular lists.** `node.next is None` no longer signals end-of-list — instead, `node.next is self.head` does. The tests in this folder specifically check that you don't re-enter the head during traversal.
- **Beware implicit `__repr__` / `__str__`** on circular structures. Naive `__repr__` that walks `.next` will loop forever. Always implement a bounded printer.
- **Python's garbage collector handles cycles.** Unlike reference-counting-only languages, CPython's generational GC eventually reclaims unreachable cycles — but that doesn't justify leaking them. Always break the cycle (`tail.next = None`) before dropping the last reference if you care about deterministic cleanup.
- **No native `deque` replacement.** `collections.deque` is doubly-linked internally and does not expose the circular topology. If you need true ring-buffer semantics, this hand-rolled version is the right model.

---

## How to Run

```bash
python3 -m unittest circular_linked_list_test.py
```

---

## Key Takeaways for Learners

1. **The head-deletion case is where bugs live.** When the list has a single node, deleting it must set `head = None`. When deleting the head of a multi-node list, you must update the tail's `next` to point to the new head.
2. **Traversal always needs a "have I seen head again?" check.** `while current is not self.head` — forget this and you get an infinite loop. In tests, always include a `max_steps` safeguard.
3. **Circular lists solve Josephus cleanly.** The classic "n people in a circle, count k and eliminate" problem is O(n·k) with this structure — hard to beat elegance-wise.
