# Maximum Subarray (Kadane's Algorithm) -- Python Implementation

Three versions of Kadane's algorithm.

## Files

| File | Contents |
|------|----------|
| `kadane.py` | the functions below |
| `kadane_test.py` | `unittest` cases |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `kadane_algorithm(arr)` | the maximum subarray sum (0 for an empty list) | O(n) | O(1) |
| `kadane_with_indices(arr)` | `(max_sum, start, end)`, the earliest window on ties; `(0, -1, -1)` for an empty list | O(n) | O(1) |
| `kadane_dp(arr)` | the same sum with an explicit `dp` table | O(n) | O(n) |

```python
from kadane import kadane_algorithm, kadane_with_indices

arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(kadane_algorithm(arr))        # 6
print(kadane_with_indices(arr))     # (6, 3, 6)
print(kadane_algorithm([-3, -1, -2]))  # -1
```

## Python-Specific Notes

- Integers are unbounded, so sums never overflow.
- `kadane_algorithm` uses `max(arr[i], cur + arr[i])`; `kadane_with_indices` uses the equivalent "restart when `cur < 0`" form so it can track the start index.
- The subarray of a non-empty input is never empty, so an all-negative list returns its largest element.

## How to Run

From this folder:

```bash
python3 -m unittest kadane_test
```

## Key Takeaways

- `cur` only needs the previous value, so the table collapses to one variable.
- Initialize from `arr[0]`, not 0.
- The window is updated only when `best` strictly improves.
