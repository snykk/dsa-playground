# Doubly Linked List — Python Implementation

A **Doubly Linked List** adds a `prev` pointer to each node, enabling O(1) deletion when you already hold the node and cheap bidirectional traversal. It's the linked structure that powers LRU caches, browser history, and `collections.deque`.

For the conceptual overview, diagrams, and comparison with singly linked lists, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `doubly_linked_list.py` | `Node` + `DoublyLinkedList` classes with forward/backward walk |
| `doubly_linked_list_test.py` | Unit tests |

---

## Supported Operations

| Operation | Complexity | vs Singly |
|-----------|------------|-----------|
| `insert_at_head(val)` | O(1) | Same |
| `insert_at_tail(val)` | O(1) | **Faster** if tail is tracked (singly: O(n) without cache) |
| `delete_node(node)` | O(1) | **Much faster** (singly needs O(n) walk to find `prev`) |
| `delete_by_value(val)` | O(n) | Same |
| `traverse_forward()` / `traverse_backward()` | O(n) | **New capability** |

---

## Python-Specific Notes

- **Two pointers per node = 2× memory** vs singly. Each Python object already has ~56 bytes of overhead, so the extra `prev` pointer (8 bytes) is small in relative terms — but the penalty is real in tight memory scenarios.
- **Iterator pattern**: implement both `__iter__` (forward) and `__reversed__` (backward). Then `list(reversed(llist))` works out of the box.
- **`collections.deque` is a C-implemented doubly linked list** (actually a block-linked list of chunks, but doubly linked at the block level). If you just need O(1) append/pop at both ends, reach for `deque` first.
- **Deletion given a node reference is the killer feature.** LRU caches exploit this: when an item is accessed, move its node to the front in O(1). That's impossible with a singly linked list without a second hash table.

---

## How to Run

```bash
python3 -m unittest doubly_linked_list_test.py
```

---

## Key Takeaways for Learners

1. **O(1) deletion is the reason doubly linked exists.** If you're writing code that holds node references and removes them in any order, you need doubly linked. Caches, schedulers, editable text buffers — all use this.
2. **Every insert/delete touches 4 pointers.** Set the new node's `prev`, new node's `next`, neighbor's `next`, and neighbor's `prev`. Forgetting one leaves the list partially broken and traversal diverges between forward and backward walks.
3. **Test forward and backward traversal separately.** A subtle bug (e.g., forgotten `prev` update during insert) often passes `traverse_forward` but breaks `traverse_backward`. Both tests are essential.
