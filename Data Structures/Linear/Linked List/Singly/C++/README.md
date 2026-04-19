# Singly Linked List — C++ Implementation

A **Singly Linked List** is a chain of nodes where each node holds a value and a single `next` pointer. It's the simplest linked structure — and a great vehicle for practicing manual memory management in C++.

For the conceptual overview, visual diagrams, and comparison with arrays / `std::forward_list`, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `singly_linked_list.cpp` | `Node` struct + `SinglyLinkedList` class with full lifetime management |
| `singly_linked_list_test.cpp` | Assertion-based tests |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `insertAtHead(val)` | O(1) | Pointer swap |
| `insertAtTail(val)` | O(n) | O(1) if you cache a tail pointer |
| `deleteByValue(val)` | O(n) | Walk with "previous" bookkeeping |
| `traverse()` | O(n) | Standard walk |
| Destructor | O(n) | Iterative, not recursive — see below |

---

## C++-Specific Notes

- **Manual memory management** is the defining characteristic. Every `insertAtHead` does `new Node{...}`. Every `deleteByValue` must `delete` the removed node. The destructor must walk the list and `delete` every node — no smart pointer shortcut without extra work.
- **Iterative destructor, not recursive.** `~SinglyLinkedList() { delete head; }` if `Node` destroys its own `next` recursively will blow the stack on long lists. Always walk iteratively.
- **`std::forward_list` exists.** It's the stdlib singly-linked list. Use it in real code; hand-rolling this structure is educational.
- **`std::unique_ptr<Node>` for safety**: if you use `std::unique_ptr<Node> next;`, the destructor handles cleanup automatically — but transferring ownership in insert/delete needs `std::move`. Worth learning once.
- **Rule of Three/Five applies.** If you implement a destructor, you probably need to implement (or delete) the copy constructor and copy assignment — otherwise a copy double-frees.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall singly_linked_list_test.cpp -o singly_linked_list_test
./singly_linked_list_test
```

---

## Key Takeaways for Learners

1. **Every `new` needs a matching `delete`, always.** The most common bug in hand-written lists is the forgotten `delete` in `deleteByValue` or in the destructor — causing a slow leak that passes all functional tests.
2. **Rule of Three is real.** If you write a destructor because of `new`, you need to handle copy construction — or declare `SinglyLinkedList(const SinglyLinkedList&) = delete;` to forbid copies. Shallow copy + destructor = double free.
3. **Prefer `std::forward_list` in real code.** It's the stdlib answer, uses the empty-base optimization for a single pointer per node, and handles all the lifetime details correctly.
