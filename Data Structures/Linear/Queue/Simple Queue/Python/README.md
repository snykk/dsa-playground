# Simple Queue — Python Implementation

A **Simple Queue** is a FIFO (first-in, first-out) collection. This implementation demonstrates the core `enqueue` / `dequeue` / `peek` operations with well-defined underflow handling.

For the conceptual overview and comparison with other queue variants (circular, deque, priority), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `simple_queue.py` | `SimpleQueue` class with all FIFO operations |
| `simple_queue_test.py` | Unit tests including empty-queue dequeue behavior |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `enqueue(val)` | O(1) amortized | Uses `list.append()` |
| `dequeue()` | O(n) naive / O(1) with `deque` | See Python-Specific notes |
| `peek()` | O(1) | Return front without removal |
| `size()` | O(1) | Length of backing container |

---

## Python-Specific Notes

- **`list.pop(0)` is O(n).** Every element shifts left by one position. For a real queue, either (a) use `collections.deque` which gives O(1) at both ends, or (b) use the two-index trick where `dequeue` just advances a `head` counter.
- **`collections.deque` is the production answer.** Implemented in C, thread-safe for simple appends/pops, and O(1) at both ends. Almost always what you want.
- **`queue.Queue` adds locking.** `queue.Queue` from the stdlib is a thread-safe FIFO with blocking semantics. Use it for producer/consumer between threads — not for single-threaded algorithms (the locking overhead hurts).
- **Empty-queue semantics**: this implementation uses the "return `None` on empty" convention. Alternatives: raise `IndexError` (matches `list.pop(0)`) or return `(value, ok)` tuple. Pick one per project and document.

---

## How to Run

```bash
python3 -m unittest simple_queue_test.py
```

---

## Key Takeaways for Learners

1. **A "list-backed queue" is a performance trap.** `list.pop(0)` is O(n) per call — a million-element queue does ~500 billion operations to drain. Use `deque` or a ring buffer.
2. **`deque` vs `list` is a two-line change** with massive asymptotic consequences. If you see `pop(0)` in a hot loop, that's almost always your bottleneck.
3. **Underflow is a design decision.** Returning `None` is convenient but collides with queues that store `None` as a valid value. `(val, ok)` or raising on empty are both defensible — just be consistent.
