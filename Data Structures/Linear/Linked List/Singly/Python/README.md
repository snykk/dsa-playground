# Singly Linked List -- Python Implementation

## Files

| File | Contents |
| --- | --- |
| `singly_linked_list.py` | `Node` and `SinglyLinkedList` |
| `singly_linked_list_test.py` | unit tests |

## API

- `Node(data)`: fields `data` and `next`.
- `SinglyLinkedList()`: empty list, `head = None`.
- `insert_at_head(data)`: O(1).
- `insert_at_tail(data)`: O(n), walks from the head.
- `delete(key)`: removes the first node whose `data == key`; no effect if absent. O(n).
- `display()`: list of values from head to tail. O(n).

There is no search, size or reverse.

## Python-Specific Notes

- Removed nodes are reclaimed by the garbage collector once nothing references them.
- `display()` returns a plain list, so tests compare it with `assertEqual`.
- For a real queue use `collections.deque`; for a stack use a list.

## How to Run

```bash
cd "Data Structures/Linear/Linked List/Singly/Python"
python3 -m unittest singly_linked_list_test
```

The tests cover head and tail insertion, deleting the head, a middle node, the tail and the only node, a missing key, an empty list and duplicates.

## Key Takeaways

- Keep a `prev` reference while walking so you can unlink.
- The head is a special case in delete.
- `insert_at_tail` is O(n) because there is no tail pointer.
