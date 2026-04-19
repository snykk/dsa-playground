# Monotonic Queue — C++ Implementation

O(n) sliding-window maximum / minimum via a monotonic deque.

For the conceptual overview, visuals, and common problems, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `monotonic_queue.h` | Header-only `slidingWindowMax` / `slidingWindowMin` |
| `monotonic_queue_test.cpp` | Assertion-based tests |

---

## C++-Specific Notes

- **`std::deque<int>`** is the obvious container — O(1) at both ends, stable element lifetimes, part of the stdlib.
- **Index-based deque** (`std::deque<int>` of indices, not `pair<int,int>`): halves memory and makes window-expiration a single integer compare.
- **`reserve` on the result vector** doesn't help here since we don't know the output size precisely; `push_back` amortized cost is fine.
- **`inline` on header-only functions**: prevents multiple-definition errors when the header is included from multiple translation units.
- **No `auto&` iteration needed**: we work with indices exclusively, keeping the inner loop cache-friendly and branch-predictable.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall monotonic_queue_test.cpp -o monotonic_queue_test
./monotonic_queue_test
```

---

## Key Takeaways for Learners

1. **`std::deque` is pronounced "deck" for a reason.** It's the workhorse for any problem requiring fast access/removal at both ends. Don't reach for `std::list` — the node-per-element indirection trashes performance.
2. **Two `while` loops inside the `for` are fine.** The amortization argument says total inner-loop iterations across all `i` is bounded by total pushes (= n).
3. **Window-expiration BEFORE output.** The evict step must run before you read the front. Swapping the order causes off-by-one errors that only show up on specific test cases.
