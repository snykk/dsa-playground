# Monotonic Queue — Python Implementation

O(n)-total sliding window maximum / minimum via a monotonic deque.

For the conceptual overview, visuals, and common problems, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `monotonic_queue.py` | `sliding_window_max`, `sliding_window_min`, and a generic `MonotonicDeque` class |
| `monotonic_queue_test.py` | Unit tests including the LeetCode example and edge cases |

---

## Python-Specific Notes

- **`collections.deque`** is the canonical backbone. C-implemented, O(1) at both ends, thread-safe for single appends/pops. Using a list would make `pop(0)` O(n) and blow the algorithmic guarantee.
- **Store indices, not values**: you need indices to check window expiration (`dq[0] <= i - k`). Storing raw values loses that information.
- **`MonotonicDeque` with a custom comparator**: lets you reuse the same class for max-oriented or min-oriented queues. The comparator answers "should I pop from the back given this new element?" Entries are `(index, value)` pairs and `pop_front_if` evicts by index (call it once for every value that leaves the window), so repeated values are safe.
- **`>=` vs `>` for min-deque pop condition**: using `>=` (pop equal-or-larger) keeps the queue smaller by collapsing duplicates. Both are correct; `>=` is slightly faster in practice.

---

## How to Run

```bash
python3 -m unittest monotonic_queue_test.py
```

---

## Key Takeaways for Learners

1. **Every index enters and leaves the deque at most once.** That's the amortized O(n) argument. Don't let the `while` inside the `for` mislead you — total work is bounded by total pushes.
2. **Indices, not values.** This is the single most common bug students make. Indices give you window-expiration checking _for free_.
3. **The pattern generalizes beyond "max of window".** Any DP transition of the form `dp[i] = max(dp[j] + cost(i - j))` over a bounded `j` range can be optimized with monotonic deque — turning O(n·k) DPs into O(n).
