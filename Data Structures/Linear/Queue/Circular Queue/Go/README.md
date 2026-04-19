# Circular Queue — Go Implementation

A **Circular Queue** (ring buffer) is a fixed-capacity FIFO where the `head` and `tail` indices wrap around the backing array. It's the textbook way to get **O(1) enqueue _and_ dequeue** without pointer chasing or periodic reshuffling.

For the conceptual overview, diagrams, and comparison with simple queues, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `CircularQueue` type with `Enqueue` / `Dequeue` / `Peek` / `IsFull` / `IsEmpty` |
| `main_test.go` | Table-driven tests covering wrap-around, full, and empty states |
| `go.mod` | Module definition |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `Enqueue(val)` | O(1) | Returns `false` if queue is full |
| `Dequeue()` | O(1) | Returns `(val, ok)` — `ok=false` on empty |
| `Peek()` | O(1) | Read front without removal |
| `IsFull()` / `IsEmpty()` | O(1) | Boundary checks |

---

## Go-Specific Notes

- **Fixed capacity at construction**: `NewCircularQueue(cap int)` pre-allocates the backing slice. No `append` / growth logic — that's the point.
- **Size tracking vs. distinguishable head/tail**: when `head == tail`, is the queue empty or full? Two common answers:
  1. Keep an explicit `size int` counter (this implementation's choice) — simple and clear.
  2. Waste one slot so `head == tail` always means empty — one less field but one less usable slot.
- **Modular arithmetic for wrap-around**: `tail = (tail + 1) % capacity`. The modulo is cheap; compilers often optimize to a mask when `capacity` is a power of two.
- **Concurrency**: not goroutine-safe. For single-producer/single-consumer scenarios, consider a lock-free ring (beyond scope here) or just use a buffered channel.
- **Compared to a Go channel**: `make(chan T, n)` is literally a fixed-capacity ring buffer under the hood — with goroutine-safe blocking semantics. For concurrent code, channels are the Go-idiomatic answer.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Ring buffers solve the `dequeue is O(n)` problem** of naive slice queues without needing a linked list. They're how real-world streaming and bounded-memory queues are built.
2. **The empty-vs-full ambiguity is a design decision.** An explicit size counter is the cleanest fix; the "sacrifice one slot" variant is cleverer but confusing to first-time readers.
3. **Go's buffered channels are ring buffers with concurrency for free.** Before writing your own, ask: "can I use `chan T` here?"
