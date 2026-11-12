# Bubble Sort -- C++ Implementation

## Files

- `bubble_sort.cpp`: the `bubbleSort` template and explicit instantiations for `int`, `double` and `std::string`.
- `bubble_sort_test.cpp`: assert-based tests (basic, sorted, empty, single, duplicates and negatives, stability). It `#include`s `bubble_sort.cpp` directly.

## API

- `template <typename T> void bubbleSort(std::vector<T>& arr)`: sorts in place with early exit; returns nothing. `T` needs `operator>` and to be swappable.

```cpp
#include "bubble_sort.cpp"

std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
bubbleSort(arr);
```

## C++-Specific Notes

- Indices are `size_t`. The outer loop does not run for an empty vector, so `n - i - 1` never wraps.
- Only `operator>` is used, which makes the sort stable; the tests check this with a record type that compares keys only.
- The test file includes the implementation, so compile only the test file (compiling both gives duplicate symbols).
- The tests use `assert`, so do not build them with `-DNDEBUG`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD bubble_sort_test.cpp -o bubble_sort_test
./bubble_sort_test
```

## Key Takeaways

- A template keeps one implementation for all element types.
- Strict `>` keeps equal elements in order.
- O(n^2) time, O(1) space; early exit gives O(n) on sorted input.
