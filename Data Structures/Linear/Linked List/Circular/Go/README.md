# Circular Linked List — Go Implementation

A **Circular Linked List** is a singly linked list where the last node's `next` loops back to the head. Useful for round-robin scheduling, ring buffers, and Josephus-style problems — with the caveat that every traversal needs an explicit stop condition.

For the conceptual overview and comparison with singly / doubly linked lists, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `Node` struct + `CircularLinkedList` type |
| `main_test.go` | Table-driven tests for insert / delete / traverse |
| `go.mod` | Module definition |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `InsertAtHead(val)` | O(n) | Must update tail's `Next` pointer |
| `InsertAtTail(val)` | O(n) | Walk to tail, insert, re-link to head |
| `DeleteByValue(val)` | O(n) | Special cases: single node, head removal |
| `Traverse(maxSteps)` | O(maxSteps) | Bounded walk |

---

## Go-Specific Notes

- **No manual memory management, but cycles still matter.** Go's GC handles cycles cleanly — unlike C++ where destructors need to unlink the cycle first. You can safely drop the list reference and let GC reclaim it.
- **Pointer receivers are mandatory for mutating methods.** `func (l *CircularLinkedList) InsertAtHead(...)` — value receivers would operate on a copy and leave the original untouched.
- **Interface note**: `container/ring` in the stdlib implements a circular doubly-linked list with no size tracking. It's a reference worth studying, but its API is awkward for general use.
- **Concurrency**: the implementation is not goroutine-safe. For concurrent access, wrap operations with `sync.RWMutex`.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Head-deletion is the bug-prone case.** Three sub-cases: list becomes empty, deleted node is head of multi-node list, deleted node is not head. Writing them as explicit branches is clearer than trying to unify.
2. **GC does not excuse cycles from logic bugs.** Go's GC reclaims the memory, but your traversal will still loop forever if you forget the "did I see head again?" check.
3. **`container/ring` exists.** For production use, `ring.Ring` from the stdlib is often enough. Reading its source is a short lesson in how Go models cyclic structures idiomatically.
