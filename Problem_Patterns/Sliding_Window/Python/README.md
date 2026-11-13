# Sliding Window -- Python Implementation

Fixed and variable windows over arrays and strings. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `sliding_window.py` | The four functions and a demo `main` |
| `sliding_window_test.py` | Unit tests including `k <= 0` and negative sums |

## API

- `max_sum_subarray(arr, k)`: maximum sum of `k` consecutive elements; 0 if `k <= 0` or `k > len(arr)`.
- `longest_substring_k_distinct(s, k)`: longest substring with at most `k` distinct characters; 0 for an empty string or `k == 0`.
- `min_window_substring(s, t)`: shortest substring of `s` containing every character of `t` (with counts); `""` if none.
- `longest_substring_no_repeat(s)`: length of the longest substring without repeated characters.

## Python-Specific Notes

- Strings are sequences of code points, so non-ASCII characters count as one each.
- Counters are plain `dict`s; entries are deleted when they reach 0.
- Integers do not overflow.

## How to Run

```bash
python3 -m unittest sliding_window_test
python3 sliding_window.py
```

## Key Takeaways

- Both pointers only move forward, so the pass is O(n).
- Delete zero counts so the map size means "distinct characters".
- For the shortest window, record the answer inside the shrink loop.
