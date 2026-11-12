# Circular Linked List -- C++ Implementation

## Files

| File | Contents |
| --- | --- |
| `circular_linked_list.cpp` | `Node` and `CircularLinkedList` (no `main()`) |
| `circular_linked_list_test.cpp` | assert-based tests; includes the `.cpp` directly |

## API

- `CircularLinkedList()`: empty list; the public member `head` is `nullptr`.
- `insertAtHead(int)`, `insertAtTail(int)`: O(n) each (walk to the tail).
- `deleteValue(int key)`: removes the first match; the only-node case frees the node and sets `head = nullptr`.
- `traverse(int limit = 10)`: prints values from the head, stopping when back at the head or after `limit` values.
- Copy constructor and copy assignment are deleted.

## C++-Specific Notes

- The class owns its nodes. The destructor finds the tail, sets `tail->next = nullptr` to open the ring, then frees the nodes in a loop. Without opening the ring the loop would never end.
- Copying is deleted because a shallow copy would make two lists free the same nodes.
- `traverse` prints and has a default limit of 10, so a longer list is cut short; pass a larger limit. The tests read the ring through `head`.
- `deleteValue` handles the single-node case before the general loop, because there `head` and the tail are the same node.

## How to Run

```bash
cd "Data Structures/Linear/Linked List/Circular/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD circular_linked_list_test.cpp -o /tmp/circ && /tmp/circ
# with AddressSanitizer (use-after-free and overflow checks):
g++ -std=c++17 -g -fsanitize=address,undefined -DIS_TEST_BUILD circular_linked_list_test.cpp -o /tmp/circ_asan && /tmp/circ_asan
```

## Key Takeaways

- Open the ring before freeing it.
- Never `delete` a node that `head` still points to.
- Own raw nodes in one place and delete the copy operations.
