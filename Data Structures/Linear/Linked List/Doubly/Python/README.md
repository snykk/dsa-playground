# Doubly Linked List -- Python Implementation

## Files

| File | Contents |
| --- | --- |
| `doubly_linked_list.py` | `Node` and `DoublyLinkedList` |
| `doubly_linked_list_test.py` | unit tests |

## API

- `Node(data)`: fields `data`, `prev`, `next`.
- `DoublyLinkedList()`: empty list, `head = None`.
- `insert_at_head(data)`: O(1).
- `insert_at_tail(data)`: O(n), walks from the head.
- `delete_value(data)`: removes the first match; returns `True` if a node was removed, `False` otherwise. O(n).
- `traverse_forward()`, `traverse_backward()`: print values (`10 -> 20 -> None`). O(n).

There is no `tail` attribute, search, size or node-based delete.

## Python-Specific Notes

- Removed nodes are reclaimed by the garbage collector. A node and its neighbours reference each other, so deleting only works because `delete_value` rewires both `prev.next` and `next.prev` before returning.
- The traversals print instead of returning a list, so the tests walk `head`, `next` and `prev` by hand.
- Python's `collections.deque` is the standard double-ended queue (a block-linked structure, not a plain node-per-element list).

## How to Run

```bash
cd "Data Structures/Linear/Linked List/Doubly/Python"
python3 -m unittest doubly_linked_list_test
```

The tests cover head and tail insertion, deleting a middle node, the head, the tail and the only node, a missing key, duplicates, and `prev` links in both directions after deletes.

## Key Takeaways

- Keep `next` and `prev` in sync on every change.
- `insert_at_tail` is O(n) because no tail is stored.
- `delete_value` returning a bool is Python-only.
