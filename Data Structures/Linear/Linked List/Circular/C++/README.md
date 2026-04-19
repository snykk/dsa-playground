# Circular Linked List — C++ Implementation

A **Circular Linked List** is a singly linked list where the last node points back to the head. Great for round-robin scheduling, cyclic buffers, and the Josephus problem — but every traversal needs an explicit stop condition.

For the conceptual overview and comparison with singly / doubly linked lists, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `circular_linked_list.cpp` | `Node` struct + `CircularLinkedList` class |
| `circular_linked_list_test.cpp` | Assertion tests for insert / delete / traverse |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `insertAtHead(val)` | O(n) | Tail's `next` must be updated to the new head |
| `insertAtTail(val)` | O(n) | Walk to tail, link in, re-point to head |
| `deleteByValue(val)` | O(n) | Special-case single-node and head-deletion |
| `traverse(maxSteps)` | O(maxSteps) | Bounded to defend against logic bugs |

---

## C++-Specific Notes

- **Manual memory management**: every `insert` does `new Node(...)`, every `delete` path does `delete`. Missing the `delete` on head-removal is the most common leak. Consider `std::unique_ptr<Node>` for safety — but note that `unique_ptr` in a cycle will never get destroyed until you manually break the cycle.
- **Destructor must break the cycle**: naive `~CircularLinkedList()` that walks via `node->next` will loop forever. Save the tail's `next`, set it to `nullptr` first, then delete linearly.
- **Don't use `std::list`**. The stdlib provides a doubly-linked list but not a circular one — you must hand-roll the structure.
- **Template `T` instead of hard-coding `int`** if you want reusable code: `template<typename T> class CircularLinkedList { ... }`. Otherwise you lock this structure to one value type.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall circular_linked_list_test.cpp -o circular_linked_list_test
./circular_linked_list_test
```

---

## Key Takeaways for Learners

1. **Cycle-aware destructor is mandatory.** Forgetting to break the cycle before traversal leads to `double free` or infinite loops during cleanup — both memory-safety nightmares.
2. **Head-deletion is a state machine.** Case 1: list becomes empty (`head = nullptr`). Case 2: new head is `oldHead->next`, tail's `next` updates. Case 3: deleting a non-head is ordinary. Write them out as explicit branches; don't try to unify.
3. **Bounded traversal is a defensive-programming habit.** Real-world circular-list bugs manifest as hangs, not crashes. A `maxSteps` parameter turns a hang into a loud failure.
