# Fibonacci Heap -- C++ Implementation

A lazy forest of heap-ordered trees with a circular root list, cascading cuts and handles. See the [topic README](../README.md) for the theory.

## Files

- `fibonacci_heap.cpp`: `FibonacciHeapNode`, `FibonacciHeapHandle` and `FibonacciHeap`, plus a demo `main()` outside test builds (the test includes the file directly)
- `fibonacci_heap_test.cpp`: assert-based tests: the handles (stale, empty, outliving the heap), decrease-key, cascading cuts on hand-built trees, erase, merge, the script whose trees Python computed, long random runs against a `std::multiset` with the invariants checked, the link and cut counts, and a compile-time check that the heap is not copyable

## API

- `FibonacciHeapHandle insert(int key)`: O(1)
- `int extract_min()`: O(log n) amortized; throws `std::runtime_error` when empty
- `int peek()`: throws `std::runtime_error` when empty
- `void decrease_key(const FibonacciHeapHandle& handle, int new_key)`: O(1) amortized; throws `std::invalid_argument` for a stale or empty handle, then for a larger key
- `void erase(const FibonacciHeapHandle& handle)`: the `delete` of the other versions (`delete` is a keyword); O(log n) amortized; throws `std::invalid_argument` for a stale or empty handle
- `void merge(FibonacciHeap& other)`: O(1); empties `other`; throws `std::invalid_argument` when `other` is this heap
- `int size()`, `bool is_empty()`; `void clear()`: O(n)
- `long long link_count() const`, `long long cut_count() const`: the work counters of the amortized analysis
- `FibonacciHeapHandle`: `int key() const` (throws `std::invalid_argument` for an empty handle), `bool in_heap() const`

## C++-Specific Notes

Keys are `int`. A handle holds a `std::shared_ptr` to its node, and each node in the heap holds one to itself (`self`), which is the heap's share of the ownership. When a node leaves the heap (`extract_min`, `erase`, `clear` or the destructor), `in_heap` turns false and the heap drops its share: the node is freed at once if no handle refers to it, and otherwise lives on as long as the handle does, so a stale handle never dangles, even after the heap is destroyed. A default-constructed handle is empty and is rejected like a stale one.

Inside the heap the nodes are linked by raw pointers, so the copy constructor and copy assignment are deleted. The degree table is a `std::map`, and a separate list of degrees in insertion order picks the same node as Python among equal minimums. `clear` walks the trees with an explicit stack, because a tree can become a path of n nodes.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD fibonacci_heap_test.cpp -o fibonacci_heap_test
./fibonacci_heap_test
g++ -std=c++17 -O2 -Wall fibonacci_heap.cpp -o fibonacci_heap && ./fibonacci_heap   # demo
```

## Key Takeaways

- Insert and merge are splices; `extract_min` consolidates equal-degree trees.
- `decrease_key` cuts a node that beats its parent, and a parent's second lost child cuts the parent too.
- Shared ownership lets a handle outlive its node's time in the heap without dangling.
