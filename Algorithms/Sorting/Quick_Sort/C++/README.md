# Quick Sort -- C++ Implementation

## Files

- `quick_sort.cpp`: the `partition` and `quickSort` templates, instantiated for `int` and `double`.
- `quick_sort_test.cpp`: assert-based tests (basic sort, and edge cases including 2,000 sorted, reversed and all-equal elements). It `#include`s `quick_sort.cpp` directly.

## API

- `template <typename T> void quickSort(std::vector<T>& arr)`: sorts the whole vector in place; does nothing for fewer than two elements.
- `template <typename T> void quickSort(std::vector<T>& arr, size_t low, size_t high)`: sorts the inclusive range `[low, high]`.
- `template <typename T> size_t partition(std::vector<T>& arr, size_t low, size_t high)`: Lomuto partition with `arr[high]` as the pivot; returns the pivot's final index.

```cpp
#include "quick_sort.cpp"

std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
quickSort(arr);
```

## C++-Specific Notes

- Lomuto partition only; there is no Hoare version, and the pivot is always the last element.
- Plain two-call recursion: on sorted or all-equal input the depth is n, so a very large such input can overflow the stack (and takes O(n^2) time). `quickSort(arr, low, pi - 1)` is guarded by `pi > 0` because the indices are unsigned.
- Not stable.
- `std::sort` is an introsort (Quick Sort with a Heap Sort fallback and Insertion Sort for small ranges); use it in production.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD quick_sort_test.cpp -o quick_sort_test
./quick_sort_test
```

## Key Takeaways

- With unsigned indices, guard `pi - 1` when `pi` can be 0.
- The last-element pivot makes sorted input the worst case.
- Recurse into the smaller side to bound the stack.
