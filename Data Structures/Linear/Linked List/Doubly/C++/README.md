# Doubly Linked List -- C++ Implementation

## Files

| File | Contents |
| --- | --- |
| `doubly_linked_list.cpp` | `Node` and `DoublyLinkedList` (no `main()`) |
| `doubly_linked_list_test.cpp` | assert-based tests; includes the `.cpp` directly |

## API

- `DoublyLinkedList()`: empty list; the public member `head` is `nullptr`.
- `insertAtHead(int)`: O(1).
- `insertAtTail(int)`: O(n).
- `deleteValue(int)`: removes and frees the first match; returns nothing.
- `traverseForward()`, `traverseBackward()`: print values (`10 <-> 20 <-> NULL`).
- Copy constructor and copy assignment are deleted.

## C++-Specific Notes

- The class owns raw `new`-allocated nodes. The destructor walks `next` and frees each node, so a list going out of scope frees everything.
- Copying is deleted: a shallow copy would make two lists free the same nodes (a double free).
- `deleteValue` calls `delete` on the unlinked node after both neighbours are rewired.
- There is no tail pointer, so `insertAtTail` walks the list.
- `head` is public so the tests can walk the links.

## How to Run

```bash
cd "Data Structures/Linear/Linked List/Doubly/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD doubly_linked_list_test.cpp -o /tmp/dll && /tmp/dll
# with AddressSanitizer:
g++ -std=c++17 -g -fsanitize=address,undefined -DIS_TEST_BUILD doubly_linked_list_test.cpp -o /tmp/dll_asan && /tmp/dll_asan
```

## Key Takeaways

- Free every node in the destructor.
- Delete the copy operations of a class that owns raw pointers.
- Rewire both neighbours before deleting a node.
