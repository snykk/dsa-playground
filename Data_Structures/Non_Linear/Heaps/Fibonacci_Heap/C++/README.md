# Fibonacci Heap -- C++ Implementation

Lazy forest of heap-ordered trees with a circular root list. See the [topic README](../README.md) for the theory.

## Files

- `fibonacci_heap.cpp`: node struct and `FibonacciHeap` class (included directly by the test)
- `fibonacci_heap_test.cpp`: assert-based tests, including consolidation on 2000 keys and a compile-time check that the heap is not copyable

## API

- `void insert(int key)`
- `int extract_min()`: throws `std::runtime_error` when empty
- `int peek()`: throws `std::runtime_error` when empty
- `int size()`, `bool is_empty()`
- `void clear()`: frees every node by repeated `extract_min`, O(n log n)

None of the three versions has `decrease_key`, `delete` or `merge`; the `marked` flag is stored but unused.

## C++-Specific Notes

Keys are `int`. Nodes are allocated with `new` and freed by the destructor, so the copy constructor and copy assignment are deleted (copying would double free). The degree table is a `std::map`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD fibonacci_heap_test.cpp -o fibonacci_heap_test
./fibonacci_heap_test
```

## Key Takeaways

- Insert is a list splice; `extract_min` consolidates equal-degree trees.
- This is the lazy core, not a complete Fibonacci heap (no decrease-key).
- Empty-heap reads are errors, not sentinel values.
