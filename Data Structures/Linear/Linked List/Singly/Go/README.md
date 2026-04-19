# Singly Linked List — Go Implementation

A **Singly Linked List** is a chain of nodes, each holding a value and a single `Next` pointer. It's the simplest linked structure and a useful exercise in pointer-handling idioms in Go.

For the conceptual overview and comparison with slices, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `Node` struct + `SinglyLinkedList` type with insert / delete / traverse |
| `main_test.go` | Table-driven tests |
| `go.mod` | Module definition |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `InsertAtHead(val)` | O(1) | Pointer swap |
| `InsertAtTail(val)` | O(n) | Unless tail is cached |
| `DeleteByValue(val)` | O(n) | Walk with "previous" bookkeeping |
| `Traverse()` | O(n) | Standard `for current != nil` loop |
| `Search(val)` | O(n) | Linear scan |

---

## Go-Specific Notes

- **GC handles memory, you handle pointers.** Unlike C++, no manual `free` / `delete`. When you unlink a node, the GC reclaims it once no references remain.
- **Value vs pointer receivers**: mutating methods must use pointer receivers (`func (l *SinglyLinkedList)`). Value receivers operate on a copy and leave the original untouched — classic beginner bug.
- **`container/list` is in the stdlib but doubly linked.** Go has no idiomatic singly linked list in its stdlib — hand-rolling is the norm when you specifically need singly linked semantics.
- **Slices beat linked lists in almost all Go code.** Go's `[]T` is growable, cache-friendly, and stdlib-supported. Reach for linked lists only when you need stable node references across insertions (e.g., LRU caches with doubly linked) or when you're teaching the concept.
- **Concurrency**: not goroutine-safe. Wrap with `sync.RWMutex` for concurrent access.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Pointer receivers are mandatory for mutation.** `func (l SinglyLinkedList) InsertAtHead(...)` compiles but does nothing to the caller's list. Read your method signatures carefully.
2. **Deletion needs a `previous` pointer.** Walk with two pointers, one step behind. When the current node matches, rewire `prev.Next = current.Next`.
3. **Compare against a slice** before choosing this structure. In Go, the question "do I really need a linked list?" is almost always "no". Slices win on performance, simplicity, and ecosystem fit.
