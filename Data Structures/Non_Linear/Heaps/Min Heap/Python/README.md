# Min Heap -- Python Implementation

Array-backed binary min heap. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `min_heap.py`: the `MinHeap` class
- `min_heap_test.py`: unit tests (random heapify against `sorted`, duplicates, empty heap)

## API

- `MinHeap(arr=None)`: optionally heapify a copy of `arr`, O(n)
- `insert(value)`: O(log n)
- `extract_min()`: O(log n), raises `IndexError` when empty
- `peek()`: O(1), raises `IndexError` when empty
- `size()`, `is_empty()`, `clear()`

## Python-Specific Notes

Values can be any mutually comparable objects. The constructor copies its argument. For a ready-made min heap on lists use the standard `heapq` module.

## How to Run

```bash
python3 -m unittest min_heap_test
```

## Key Takeaways

- The minimum is always at index 0; insert sifts up, extract min sifts down.
- Building from an array with bottom-up heapify is O(n), cheaper than n inserts.
- Only the root is ordered: the array is not sorted.
