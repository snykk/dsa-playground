# Singly Linked List — Python Implementation

A **Singly Linked List** is a chain of nodes where each node holds a value and a single `next` pointer. It's the simplest linked structure and the one every other linked list variant (doubly, circular, skip) builds upon.

For the conceptual overview, visual diagrams, and comparison with arrays, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `singly_linked_list.py` | `Node` + `SinglyLinkedList` classes |
| `singly_linked_list_test.py` | Unit tests covering empty list, single-node, and walk semantics |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `insert_at_head(val)` | O(1) | Pure pointer swap — the fast path |
| `insert_at_tail(val)` | O(n) | Linear walk unless you cache a tail pointer |
| `delete_by_value(val)` | O(n) | Walk with "previous" bookkeeping |
| `traverse()` | O(n) | Standard `while current:` loop |
| `search(val)` | O(n) | Linear scan |

---

## Python-Specific Notes

- **Classes, not `struct`.** Python has no struct — we use a thin `Node` class with `__slots__` if memory matters. A plain `class Node` works fine for learning; every instance costs ~56 bytes of overhead compared to C.
- **`None` is the sentinel.** `node.next is None` marks the end. Use `is None` (identity), not `== None` (equality), for the idiomatic and faster check.
- **Iterator support**: implement `__iter__` so `for x in llist:` works naturally:
  ```python
  def __iter__(self):
      current = self.head
      while current:
          yield current.value
          current = current.next
  ```
- **Reversal in place** is a classic interview question. The trick is three-pointer shuffle: `prev`, `current`, `next_node`. Memorize the pattern — it generalizes to doubly-linked and graph edge reversals.

---

## How to Run

```bash
python3 -m unittest singly_linked_list_test.py
```

---

## Key Takeaways for Learners

1. **`insert_at_head` is O(1); `insert_at_tail` is O(n).** This asymmetry is the linked-list signature. Caching a `tail` pointer makes tail insert O(1) at the cost of one extra field to maintain.
2. **Delete needs the _previous_ node.** Walk with `prev, current = None, self.head`. When `current.value == target`, rewire `prev.next = current.next`. Forgetting `prev` is the most common beginner bug.
3. **Linked lists lose to arrays in modern hardware.** CPU caches love contiguous memory; pointer-chasing busts the cache. A linked list that _fits in L1_ is fast; one that doesn't is 10–100× slower than an equivalent array walk.
