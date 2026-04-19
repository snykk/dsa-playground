# Simple Queue — C++ Implementation

A **Simple Queue** is a FIFO (first-in, first-out) collection. This implementation uses `std::vector` as the backing store to demonstrate the core operations and trade-offs. In production C++, you would reach for `std::queue` (which wraps `std::deque` by default).

For the conceptual overview and comparison with other queue variants, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `simple_queue.cpp` | `SimpleQueue` class with `enqueue` / `dequeue` / `peek` |
| `simple_queue_test.cpp` | Assertion-based tests |

---

## Supported Operations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `enqueue(val)` | O(1) amortized | `push_back` reallocates when capacity is exhausted |
| `dequeue()` | O(n) with `erase(begin())` | See notes below |
| `peek()` | O(1) | Return front element by reference |

---

## C++-Specific Notes

- **`std::queue<T>` is the stdlib answer.** It's a container _adapter_ wrapping `std::deque` by default, giving O(1) at both ends. Use it in real code:
  ```cpp
  std::queue<int> q;
  q.push(1); q.push(2);
  int front = q.front(); q.pop();
  ```
- **`std::deque` gives both ends O(1)** with chunked storage (block-linked array). It's what `std::queue` uses under the hood.
- **`std::vector::erase(begin())` is O(n)** — shifts every element. For a production vector-backed queue, use two indices (`head`, `tail`) and wrap around or shift periodically.
- **`peek()` should return a `const T&`**, not a copy. For large value types, returning by copy is a hidden O(size(T)) cost per call.
- **Underflow** is undefined if you call `front()` / `pop()` on empty `std::queue`. Our implementation throws `std::runtime_error` instead — safer for beginners.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall simple_queue_test.cpp -o simple_queue_test
./simple_queue_test
```

---

## Key Takeaways for Learners

1. **Prefer `std::queue<T>` in real C++ code.** It's zero-cost, stdlib-blessed, and uses `std::deque` for O(1) operations at both ends.
2. **Understand container adapters.** `std::queue`, `std::stack`, `std::priority_queue` are all thin wrappers over existing containers. They don't add performance — they restrict the interface so callers can't violate invariants.
3. **Vector-backed queues are a teaching exercise.** The `erase(begin())` cost is real; a naive implementation works for small data but fails dramatically at scale. Benchmarking against `std::queue` on a million elements is eye-opening.
