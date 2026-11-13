# Quick Sort -- Python Implementation

## Files

- `quick_sort.py`: the four functions below.
- `quick_sort_test.py`: unit tests (basic, sorted, empty, single, Hoare version, 2,000 sorted and all-equal elements, duplicates and negatives).

## API

- `quick_sort(arr, low=0, high=None)`: Lomuto partition, last element as pivot. Sorts in place and returns the same list. Recurses into the smaller side and loops on the larger one, so the recursion depth is at most log2(n).
- `partition(arr, low, high)`: Lomuto partition; returns the final index of the pivot.
- `quick_sort_hoare(arr, low=0, high=None)`: Hoare partition, first element as pivot; same smaller-side-first recursion.
- `partition_hoare(arr, low, high)`: Hoare partition; returns a split point (not the pivot's index).

```python
from quick_sort import quick_sort

print(quick_sort([64, 34, 25, 12, 22, 11, 90]))  # [11, 12, 22, 25, 34, 64, 90]
```

## Python-Specific Notes

- The pivot is fixed (last or first element), so sorted input is still O(n^2) in time, but the stack stays O(log n); 2,000 sorted or all-equal elements sort without a `RecursionError`.
- Not stable.
- Works on any items that support `<=`, `<` and `>` as the partition needs.
- Python 3.9 and later. For real code use `sorted()` or `list.sort()`.

## How to Run

```bash
python3 -m unittest quick_sort_test
```

## Key Takeaways

- Partition once, then the two sides are independent.
- Recursing into the smaller side bounds the stack.
- A fixed pivot has quadratic worst cases; randomize or use median-of-three for hostile input.
