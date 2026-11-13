# Ternary Search -- Python Implementation

Iterative and recursive ternary search on a sorted list, plus an integer peak finder for unimodal functions. For the idea and the traces see the [topic README](../README.md).

## Files

- `ternary_search.py` - the three functions.
- `ternary_search_test.py` - 12 unit tests: found and missing, ends, empty and single-element lists, recursion and unimodal functions.

## API

- `ternary_search(arr, target)` - index of `target` in the sorted list, or -1.
- `ternary_search_recursive(arr, target, left=0, right=None)` - the same, recursively. `right` defaults to the last index.
- `ternary_search_unimodal(func, left, right)` - the integer `x` in `[left, right]` where `func` is largest, assuming `func` strictly increases and then strictly decreases. Integer bounds only (floats raise `TypeError`); maxima only (negate `func` for a minimum).

```python
from ternary_search import ternary_search, ternary_search_unimodal

ternary_search([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)              # 4
ternary_search_unimodal(lambda x: -(x - 7) ** 2 + 3, 0, 20)      # 7
```

## Python-Specific Notes

- `ternary_search_unimodal` ends with a scan of the last few points, so a window of width 2 or less is handled exactly.
- It breaks on plateaus: if `func(mid1) == func(mid2)` away from the peak, the right side is discarded. For example, with `f(x)` rising to 5 at x = 5, flat until x = 15 and then rising to 10 at x = 20, it returns 5.
- The input list must be sorted ascending; nothing is validated.
- For real-valued functions, copy the loop with float bounds and a tolerance; this module does not do that.

## How to Run

From this folder:

```bash
python3 -m unittest ternary_search_test
```

## Key Takeaways

- For lookup, Binary Search is cheaper: ternary makes about 1.26 times as many probes.
- Ternary search shines on unimodal functions, where two evaluations tell you the side of the peak.
- Strict unimodality is required.
