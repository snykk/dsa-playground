# Doubly Linked List — C++ Implementation

A **Doubly Linked List** adds a `prev` pointer to each node, enabling O(1) node-reference deletion and bidirectional traversal. It's the foundation of LRU caches, editor buffers, and the stdlib's `std::list`.

For the conceptual overview, diagrams, and comparison with singly linked lists, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `doubly_linked_list.cpp` | `Node` struct + `DoublyLinkedList` class with full lifetime management |
| `doubly_linked_list_test.cpp` | Assertion-based tests |

---

## Supported Operations

| Operation | Complexity | vs Singly |
|-----------|------------|-----------|
| `insertAtHead(val)` | O(1) | Same |
| `insertAtTail(val)` | O(1) | Faster (cached tail, no walk) |
| `deleteNode(ptr)` | O(1) | Much faster (no `prev` search) |
| `deleteByValue(val)` | O(n) | Same |
| `traverseForward()` / `traverseBackward()` | O(n) | New capability |

---

## C++-Specific Notes

- **`std::list` is the stdlib doubly linked list.** It supports O(1) splice, stable iterators (insert/erase don't invalidate others), and all the lifetime management for free. Use it in real code.
- **Extra memory per node**: two pointers (16 bytes on 64-bit) + value + heap alloc overhead. Compared to `std::vector`, this is ~3–4× memory and ~10× slower for sequential access due to cache misses.
- **Every insert/delete updates 4 pointers.** Miss one and the list is silently corrupted — `traverseForward` may still work while `traverseBackward` segfaults. Paired tests catch these.
- **Destructor must be iterative.** `~DoublyLinkedList() { while (head) { Node* n = head->next; delete head; head = n; } }` — recursion on a million-node list blows the stack.
- **Rule of Five**: with a manual destructor, also declare (or `= delete`) the copy/move constructors and assignment operators to avoid double-free on copy.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall doubly_linked_list_test.cpp -o doubly_linked_list_test
./doubly_linked_list_test
```

---

## Key Takeaways for Learners

1. **4 pointer updates per insert — miss one and your list is broken asymmetrically.** Test forward _and_ backward traversal; a one-way walk often still passes with a broken `prev` pointer.
2. **`std::list::splice` is magic.** It moves a sub-range between lists in O(1) without copying any values. This is one of the few things `std::vector` simply cannot do.
3. **Iterator stability matters.** In `std::list`, inserting / erasing never invalidates iterators to other nodes. This is exactly why LRU cache implementations use it — they hold iterators in a hash map and move them around in O(1).
