# Insertion Sort -- C++ Implementation

## Files

- `insertion_sort.cpp`: the `insertionSort` template, instantiated for `int` and `double`.
- `insertion_sort_test.cpp`: assert-based tests (basic, edge cases, stability). It `#include`s `insertion_sort.cpp` directly.

## API

- `template <typename T> void insertionSort(std::vector<T>& arr)`: sorts in place; returns nothing. `T` needs `operator>`.

```cpp
#include "insertion_sort.cpp"

std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
insertionSort(arr);
```

## C++-Specific Notes

- The index `j` marks the gap (not the element to compare), so the loop condition `j > 0 && arr[j - 1] > key` never underflows the unsigned `size_t`.
- The key is copied (`T key = arr[i]`), which is fine for numbers; for large objects consider moving it.
- Stable: only a strict `>` shifts an element.
- For production code use `std::sort` or `std::stable_sort`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD insertion_sort_test.cpp -o insertion_sort_test
./insertion_sort_test
```

## Key Takeaways

- Track the gap instead of `j - 1` to stay safe with unsigned indices.
- Strict `>` keeps equal elements in order.
- O(n) on sorted input, O(n^2) on reversed input.
