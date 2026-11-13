# Fibonacci Heap -- Python Implementation

Lazy forest of heap-ordered trees with a circular root list. See the [topic README](../README.md) for the theory.

## Files

- `fibonacci_heap.py`: `FibonacciHeapNode` and `FibonacciHeap`
- `fibonacci_heap_test.py`: unit tests (10), including 2000 random keys and an interleaved comparison with `heapq`

## API

- `insert(key)`: O(1)
- `extract_min()`: O(log n) amortized, raises `IndexError` when empty
- `peek()`: raises `IndexError` when empty
- `size()`, `is_empty()`, `clear()` (O(1))

None of the three versions has `decrease_key`, `delete` or `merge`; the `marked` flag is stored but unused.

## Python-Specific Notes

Keys can be any mutually comparable values. The degree table in consolidation is a `dict`. Memory is garbage collected, so `clear()` just drops the root.

## How to Run

```bash
python3 -m unittest fibonacci_heap_test
```

## Key Takeaways

- Insert is a list splice; `extract_min` consolidates equal-degree trees.
- This is the lazy core, not a complete Fibonacci heap (no decrease-key).
- Empty-heap reads are errors, not sentinel values.
