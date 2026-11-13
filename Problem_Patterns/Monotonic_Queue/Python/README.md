# Monotonic Queue -- Python Implementation

Sliding window maximum and minimum with a monotonic deque of indices. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `monotonic_queue.py` | `sliding_window_max`, `sliding_window_min` and the `MonotonicDeque` class |
| `monotonic_queue_test.py` | Unit tests: the standard example, edge cases, duplicates and a brute-force comparison |

## API

- `sliding_window_max(arr, k)`: maximum of every window of size `k`; `[]` if `k <= 0`, `arr` is empty or `k > len(arr)`.
- `sliding_window_min(arr, k)`: the same for minima.
- `MonotonicDeque(should_pop)`: `should_pop(existing, new)` decides whether to pop the back. `push(value)`, `pop_front_if(value)` (evict the oldest value in the window), `front()` and `len()`.

## Python-Specific Notes

- `collections.deque` gives O(1) at both ends; a list would make `pop(0)` O(n).
- `MonotonicDeque` stores `(index, value)` pairs and evicts by index. Call `pop_front_if` once for every value that leaves the window, oldest first.
- With `lambda e, n: e <= n` it is a max deque, with `e >= n` a min deque. Equal values are safe because eviction goes by index.

## How to Run

```bash
python3 -m unittest monotonic_queue_test
python3 monotonic_queue.py
```

## Key Takeaways

- Each index enters and leaves once: O(n) total.
- Keep indices, not bare values.
- Evict the expired front before reading the answer.
