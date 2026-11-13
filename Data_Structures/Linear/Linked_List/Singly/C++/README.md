# Singly Linked List -- C++ Implementation

## Files

| File | Contents |
| --- | --- |
| `singly_linked_list.cpp` | `Node` and `SinglyLinkedList` (no `main()`) |
| `singly_linked_list_test.cpp` | assert-based tests; includes the `.cpp` directly |

## API

- `SinglyLinkedList()`: empty list; `head` is private.
- `insert_at_head(int)`: O(1).
- `insert_at_tail(int)`: O(n).
- `delete_node(int key)`: removes and frees the first match; no effect if absent.
- `to_vector() const`: the values from head to tail (used by the tests).
- `display()`: prints the values, space separated.
- Copy constructor and copy assignment are deleted.

The names are snake_case here, while the C++ doubly and circular lists use camelCase.

## C++-Specific Notes

- The class owns raw `new`-allocated nodes. The destructor walks the chain and frees each node, so a list leaving scope leaks nothing.
- Copying is deleted: a shallow copy would make two lists free the same nodes.
- `delete_node` unlinks first and then frees the node, and handles the head case where `prev` is null.
- `display()` returns void, which is why `to_vector()` exists.

## How to Run

```bash
cd "Data_Structures/Linear/Linked_List/Singly/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD singly_linked_list_test.cpp -o /tmp/sll && /tmp/sll
# with AddressSanitizer:
g++ -std=c++17 -g -fsanitize=address,undefined -DIS_TEST_BUILD singly_linked_list_test.cpp -o /tmp/sll_asan && /tmp/sll_asan
```

## Key Takeaways

- Free every node in the destructor.
- Delete the copy operations of a class that owns raw pointers.
- Unlink a node before freeing it.
