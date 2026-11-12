# Heap Sort -- C++ Implementation

## Files

- `heap_sort.cpp`: the `heapify` and `heapSort` templates, instantiated for `int` and `double`.
- `heap_sort_test.cpp`: assert-based tests (basic sort, empty and single-element input). It `#include`s `heap_sort.cpp` directly.

## API

- `template <typename T> void heapSort(std::vector<T>& arr)`: sorts in place; returns immediately for fewer than two elements. `T` needs `operator>`.
- `template <typename T> void heapify(std::vector<T>& arr, size_t n, size_t i)`: sifts index `i` down inside the first `n` elements.

```cpp
#include "heap_sort.cpp"

std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
heapSort(arr);
```

## C++-Specific Notes

- Indices are `size_t`. The early return for `n < 2` prevents `n - 1` from wrapping around on an empty vector.
- `heapify` is recursive, so the stack use is O(log n).
- Not stable: equal elements can change their order. For production code use `std::sort`, or `std::make_heap` and `std::sort_heap`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD heap_sort_test.cpp -o heap_sort_test
./heap_sort_test
```

## Key Takeaways

- Guard the empty input before using `n - 1` with unsigned types.
- The heap lives in the array; no extra buffer.
- O(n log n) in every case.
