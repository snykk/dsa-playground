# Min Heap -- C++ Implementation

Array-backed binary min heap. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `min_heap.cpp`: the `MinHeap` class (included directly by the test)
- `min_heap_test.cpp`: assert-based tests (duplicates, 1000 random values, empty heap throws)

## API

- `MinHeap()` and `MinHeap(const vector<int>&)` (heapify a copy)
- `void insert(int)`: O(log n)
- `int extract_min()`: throws `std::runtime_error` when empty
- `int peek()`: throws `std::runtime_error` when empty
- `int size() const`, `bool is_empty() const`, `void clear()`

## C++-Specific Notes

Values are `int`. Storage is a `std::vector`, so the class is safely copyable. `std::priority_queue` is the standard library equivalent (a max heap by default).

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD min_heap_test.cpp -o min_heap_test
./min_heap_test
```

## Key Takeaways

- The minimum is always at index 0; insert sifts up, extract min sifts down.
- Building from an array with bottom-up heapify is O(n), cheaper than n inserts.
- Only the root is ordered: the array is not sorted.
