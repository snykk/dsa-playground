# Linear Search -- Python Implementation

Iterative, recursive and all-occurrences linear search on a list. For the idea and the trace see the [topic README](../README.md).

## Files

- `linear_search.py` - the three search functions.
- `linear_search_test.py` - 16 unit tests: found and missing, ends, empty and single-element lists, duplicates, strings and all occurrences.

## API

- `linear_search(arr, target)` - index of the first match, or -1.
- `linear_search_recursive(arr, target, index=0)` - the same, recursively.
- `linear_search_all_occurrences(arr, target)` - the list of all matching indexes (empty if none).

```python
from linear_search import linear_search, linear_search_all_occurrences

linear_search([10, 20, 30, 40, 50], 30)          # 2
linear_search_all_occurrences([4, 7, 4, 9, 4], 4)  # [0, 2, 4]
```

## Python-Specific Notes

- Works on any list of elements that support `==`; the list need not be sorted.
- `linear_search_recursive` uses one stack frame per element and raises `RecursionError` once it has to scan about a thousand elements or more (the default limit). Use the loop version in real code.
- The built-in `list.index(x)` does the same job (it raises `ValueError` on a miss instead of returning -1).

## How to Run

From this folder:

```bash
python3 -m unittest linear_search_test
```

## Key Takeaways

- The first match wins; use the all-occurrences function for every index.
- The recursive form is an exercise, not a tool.
- Prefer `list.index` or `in` for everyday code.
