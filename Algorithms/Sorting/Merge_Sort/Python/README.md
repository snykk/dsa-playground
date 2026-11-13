# Merge Sort -- Python Implementation

## Files

- `merge_sort.py`: `merge_sort`, `merge`, `merge_sort_iterative` and the private helper `_merge_into`.
- `merge_sort_test.py`: unit tests (basic, sorted, empty, single, iterative version, stability of both versions).

## API

- `merge_sort(arr)`: top-down Merge Sort; sorts `arr` in place (it sorts copies of the halves and writes the merge back) and returns the same list.
- `merge(arr, left, right)`: merges two sorted lists into `arr` starting at index 0.
- `merge_sort_iterative(arr)`: bottom-up version that merges runs of size 1, 2, 4, ... Python only. Same result, no recursion.

```python
from merge_sort import merge_sort

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))  # [3, 9, 10, 27, 38, 43, 82]
```

## Python-Specific Notes

- Works on items that support `<=` (the merge) and, for the empty/short checks, `len`.
- Stable: the merge takes the left element on a tie.
- Slicing creates new lists on every call, so extra space is O(n) live and many allocations in total.
- Recursion depth is log2(n), far below Python's limit.
- Python 3.9 and later. For real code use `sorted()`, which is also stable (it uses Timsort, a merge-based sort).

## How to Run

```bash
python3 -m unittest merge_sort_test
```

## Key Takeaways

- Split, sort halves, merge: O(n log n) in every case.
- `<=` in the merge gives stability.
- The iterative version shows that recursion is not essential.
