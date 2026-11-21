# Insertion Sort -- Python Implementation

## Files

- `insertion_sort.py`: the two functions below.
- `insertion_sort_test.py`: unit tests (basic, sorted, reversed, empty, single, duplicates, recursive version, stability).

## API

- `insertion_sort(arr)`: sorts `arr` in place and returns the same list.
- `insertion_sort_recursive(arr, n=None)`: sorts the first `n - 1` elements recursively, then inserts the last one. Returns the same list.

```python
from insertion_sort import insertion_sort

print(insertion_sort([64, 34, 25, 12, 22, 11, 90]))  # [11, 12, 22, 25, 34, 64, 90]
```

## Python-Specific Notes

- Works on any items that support `>`.
- Stable: only a strict `>` shifts an element.
- `insertion_sort_recursive` has recursion depth `n`; with Python's default limit of about 1,000 frames it raises `RecursionError` for lists of about 1,000 elements or more. It is for teaching.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest insertion_sort_test
```

## Key Takeaways

- The prefix `arr[0..i-1]` is always sorted.
- The number of shifts equals the number of inversions, so nearly sorted input is fast.
- Prefer `sorted()` or `list.sort()` in real code.
