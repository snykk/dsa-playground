# Interpolation Search -- Python Implementation

Iterative and recursive interpolation search on a sorted list. For the idea, the formula and the traces see the [topic README](../README.md).

## Files

- `interpolation_search.py` - the two search functions.
- `interpolation_search_test.py` - 16 unit tests: found and missing, ends, empty and single-element lists, uniform and skewed data, out-of-range targets, all-equal and duplicate values, huge floats.

## API

- `interpolation_search(arr, target)` - index of `target` in the sorted list, or -1.
- `interpolation_search_recursive(arr, target, left=0, right=None)` - the same, recursively. `right` defaults to the last index.

```python
from interpolation_search import interpolation_search

interpolation_search([10, 20, 30, 40, 50, 60, 70, 80, 90, 100], 70)   # 6
interpolation_search([5, 5, 5], 5)                                    # 0
```

## Python-Specific Notes

- The probe uses floor division on Python integers, so it is exact for arbitrarily large values; there is no overflow and no float rounding for ints above 2^53.
- A window with equal ends returns at once, so a run of duplicates never divides by zero.
- The input must be sorted in ascending order with numeric keys; nothing is validated.
- With duplicates the result is some matching index, not necessarily the first.

## How to Run

From this folder:

```bash
python3 -m unittest interpolation_search_test
```

## Key Takeaways

- The estimate is `left + (target - arr[left]) * (right - left) // (arr[right] - arr[left])`.
- Check the range and the flat window before computing it.
- Fast on uniform data, linear on skewed data.
