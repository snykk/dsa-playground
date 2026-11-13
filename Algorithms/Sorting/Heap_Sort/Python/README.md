# Heap Sort -- Python Implementation

## Files

- `heap_sort.py`: `heap_sort` and `heapify`.
- `heap_sort_test.py`: unit tests (basic, sorted, empty, single element).

## API

- `heap_sort(arr)`: sorts `arr` in place with a max-heap and returns the same list.
- `heapify(arr, n, i)`: sifts the element at index `i` down inside the heap `arr[0..n-1]`.

```python
from heap_sort import heap_sort

print(heap_sort([64, 34, 25, 12, 22, 11, 90]))  # [11, 12, 22, 25, 34, 64, 90]
```

## Python-Specific Notes

- Works on any items that support `>`.
- `heapify` is recursive: the depth is at most log2(n), far below Python's recursion limit.
- Not stable. For heap operations in real code use the standard `heapq` module; for sorting use `sorted()`.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest heap_sort_test
```

## Key Takeaways

- Build the heap bottom-up from `n // 2 - 1`: it costs O(n).
- After each swap the heap is `arr[0..i-1]`, so `heapify(arr, i, 0)`.
- O(n log n) in every case.
