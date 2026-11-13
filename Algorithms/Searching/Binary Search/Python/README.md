# Binary Search -- Python Implementation

Iterative and recursive binary search, first and last occurrence, and the closest element. For the idea, the invariant and the trace see the [topic README](../README.md).

## Files

- `binary_search.py` - the five search functions.
- `binary_search_test.py` - 18 unit tests: found and missing, ends, empty and single-element lists, negatives, a large list, duplicates and the closest element.

## API

- `binary_search(arr, target)` - index of `target` in the sorted list, or -1. O(log n), O(1) space.
- `binary_search_recursive(arr, target, left=0, right=None)` - the same, recursively. `right` defaults to the last index.
- `binary_search_first_occurrence(arr, target)` - leftmost index of a duplicate, or -1.
- `binary_search_last_occurrence(arr, target)` - rightmost index of a duplicate, or -1.
- `binary_search_closest(arr, target)` - index of the nearest element; the larger one on a tie (for `[1, 3, 5, 7, 9]` and 4 it returns the index of 5); -1 for an empty list.

```python
from binary_search import binary_search, binary_search_first_occurrence

binary_search([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 7)        # 6
binary_search_first_occurrence([1, 2, 2, 2, 3, 4, 5], 2)  # 1
```

## Python-Specific Notes

- Python integers do not overflow, so `left + (right - left) // 2` is only a habit here; it matters in C++ and Go.
- The input must be sorted in ascending order and the elements comparable; nothing is validated.
- For production code, `bisect.bisect_left` and `bisect.bisect_right` give the insertion point, which this module does not implement.
- The recursive version is limited by the recursion depth only in theory: it needs about log2(n) frames.

## How to Run

From this folder:

```bash
python3 -m unittest binary_search_test
```

## Key Takeaways

- Keep the invariant "the target, if present, is in `[left, right]`" and the bounds follow.
- First and last occurrence only change what happens on a match.
- Use `bisect` for insertion points in real code.
