# Bubble Sort -- Python Implementation

## Files

- `bubble_sort.py`: the three functions below.
- `bubble_sort_test.py`: unit tests (basic, sorted, reversed, empty, single, duplicates, negatives, stability, recursive edge cases).

## API

- `bubble_sort(arr)`: sorts `arr` in place with early exit and returns the same list.
- `bubble_sort_optimized(arr)`: identical to `bubble_sort` (the early exit is already built in); kept for API compatibility.
- `bubble_sort_recursive(arr, n=None)`: one pass, then recurses on the first `n - 1` elements. Returns the same list.

```python
from bubble_sort import bubble_sort

print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))  # [11, 12, 22, 25, 34, 64, 90]
```

## Python-Specific Notes

- Works for any items that support `>`: ints, floats, strings, or objects defining `__gt__`.
- Sorting is in place; copy first (`arr.copy()`) if you need the original.
- Stable: only a strict `>` triggers a swap.
- `bubble_sort_recursive` uses one stack frame per pass. Python's default recursion limit is about 1,000 frames, so it raises `RecursionError` for lists of a few thousand elements. Use it only to study recursion.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest bubble_sort_test
```

## Key Takeaways

- The loop invariant: after `i` passes the last `i` elements are final.
- The early exit makes sorted input cost O(n).
- Prefer `sorted()` or `list.sort()` in real code.
