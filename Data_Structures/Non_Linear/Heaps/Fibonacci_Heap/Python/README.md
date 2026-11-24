# Fibonacci Heap -- Python Implementation

A lazy forest of heap-ordered trees with a circular root list, cascading cuts and handles. See the [topic README](../README.md) for the theory.

## Files

- `fibonacci_heap.py`: `FibonacciHeapNode` (also the handle) and `FibonacciHeap`
- `fibonacci_heap_test.py`: unit tests (38): the handles, decrease-key, cascading cuts on hand-built trees, delete, merge, long random runs against `heapq` with the invariants checked after every operation, the link and cut counts of the amortized analysis, the script the C++ and Go tests pin, and the Dijkstra example

## API

- `insert(key)`: O(1); returns the new `FibonacciHeapNode`, the handle
- `extract_min()`: O(log n) amortized; raises `IndexError` when empty
- `peek()`: raises `IndexError` when empty
- `decrease_key(handle, new_key)`: O(1) amortized; raises `ValueError` for a stale handle or `None`, then for a key larger than the current one
- `delete(handle)`: O(log n) amortized; raises `ValueError` for a stale handle or `None`
- `merge(other)`: O(1); moves every node of `other` into this heap and empties `other`; raises `ValueError` when `other` is this heap
- `size()`, `is_empty()` (O(1)), `clear()` (O(n))
- `link_count`, `cut_count`: how many links and cuts the heap has made, for the amortized analysis
- On a handle: `handle.key` (its current key) and `handle.in_heap` (False once it is stale)

## Python-Specific Notes

The handle is the node object itself, so the caller can read `handle.key` and `handle.in_heap`; the other fields belong to the heap. A handle is stale once its node was extracted, deleted or cleared: `extract_min`, `delete` and `clear` set `in_heap` to False and reset the node's links, so a stale handle holds no reference into the heap. `decrease_key` and `delete` check the flag first.

Keys can be any mutually comparable values, such as `(distance, vertex)` tuples. `delete` never writes a smaller key, so it works for key types that have no minus infinity. The degree table in consolidation is a `dict`, whose insertion order decides between equal minimums. Every walk over the trees uses a loop or an explicit stack, because a crafted sequence can turn a tree into a path of n nodes, deeper than Python's recursion limit.

## How to Run

```bash
python3 -m unittest fibonacci_heap_test
```

## Key Takeaways

- Insert and merge are splices; `extract_min` consolidates equal-degree trees.
- `decrease_key` cuts a node that beats its parent, and a parent's second lost child cuts the parent too.
- A handle goes stale when its node leaves the heap, and the heap rejects it.
