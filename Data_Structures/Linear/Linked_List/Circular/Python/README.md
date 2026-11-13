# Circular Linked List -- Python Implementation

## Files

| File | Contents |
| --- | --- |
| `circular_linked_list.py` | `Node` and `CircularLinkedList` |
| `circular_linked_list_test.py` | unit tests |

## API

- `Node(data)`: fields `data` and `next`.
- `CircularLinkedList()`: empty list, `head = None`.
- `insert_at_head(data)`: new first node; O(n) (walks to the tail).
- `insert_at_tail(data)`: new last node; O(n).
- `delete_value(key)`: removes the first node holding `key`; does nothing if absent. Deleting the only node leaves `head = None`.
- `traverse(limit=None)`: list of values from the head; stops when back at the head, or after `limit` values when a limit is given.

## Python-Specific Notes

- Nodes are garbage collected; a ring of references is collected once nothing outside it points in.
- `traverse` returns a list, so tests compare it directly. C++ and Go print instead.
- Comparisons use `!=` and `==` on nodes, which are identity comparisons because `Node` defines no `__eq__`.
- There is no `__len__`, `search` or `__iter__`.

## How to Run

```bash
cd "Data_Structures/Linear/Linked_List/Circular/Python"
python3 -m unittest circular_linked_list_test
```

The tests cover insertion order, deleting a middle node, the only node, the head and the tail, a missing key and an empty list, and that `traverse()` is not truncated for lists longer than 10.

## Key Takeaways

- The one-node list (`head.next is head`) is its own case in delete.
- Stop a walk when you are back at the head, not at `None`.
- A stored tail pointer would make both inserts O(1).
