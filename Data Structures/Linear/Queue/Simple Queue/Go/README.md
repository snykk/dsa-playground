# Simple Queue — Go Implementation

A **Simple Queue** is a FIFO (first-in, first-out) collection. Elements enter at the rear (`Enqueue`) and leave from the front (`Dequeue`). This implementation uses a Go slice as the backing store — the most idiomatic choice in Go.

For the conceptual overview, diagrams, and comparison with other queue variants (circular, deque, priority), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `SimpleQueue` type with `Enqueue` / `Dequeue` / `Peek` / `Size` |
| `main_test.go` | Table-driven tests for queue semantics and underflow |
| `go.mod` | Module definition |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `Enqueue(val)` | O(1) amortized | `append` may reallocate when capacity is exhausted |
| `Dequeue()` | O(n) with slice shift, or **O(1) amortized** with a two-index trick |
| `Peek()` | O(1) | Return front element without removal |
| `Size()` | O(1) | Cached length |

---

## Go-Specific Notes

- **Slice vs linked list**: a slice gives O(1) amortized `Enqueue` and excellent cache locality. Naive `Dequeue` is `q = q[1:]` which is O(1) on time but leaks capacity at the front. Best practice: keep two indices (`head`, `tail`) and periodically shift when `head` exceeds a threshold.
- **`container/list` works** but is doubly linked, pointer-chasing, and GC-heavy. Slices win for almost all queue workloads in Go.
- **Channels are queues too.** `ch := make(chan int, 100)` is a goroutine-safe, buffered FIFO queue with blocking semantics. For concurrent producer/consumer patterns, use channels instead of wrapping this type with a mutex.
- **No generics needed before Go 1.18.** Hardcoded to a single type (`int` here). For reusable code on 1.18+, parameterize: `type SimpleQueue[T any] struct { ... }`.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`q = q[1:]` is not free.** It doesn't move memory but _does_ permanently leak the front slot — the underlying array grows monotonically. Use a two-index ring or periodic shift to avoid unbounded memory growth.
2. **Channels are the Go-idiomatic queue** for concurrent code. This manual queue exists to teach the FIFO pattern; in production, `chan T` is almost always the right tool.
3. **Underflow is a contract decision.** Does `Dequeue` panic, return `(zero, false)`, or return `(zero, error)`? Pick one and document it — tests in this folder demonstrate the `(val, ok)` idiom.
