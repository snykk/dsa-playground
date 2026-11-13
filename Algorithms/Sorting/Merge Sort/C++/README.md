# Merge Sort -- C++ Implementation

## Files

- `merge_sort.cpp`: the `merge` and `mergeSort` templates, instantiated for `int` and `double`.
- `merge_sort_test.cpp`: assert-based tests (basic, edge cases, stability). It `#include`s `merge_sort.cpp` directly.

## API

- `template <typename T> void mergeSort(std::vector<T>& arr)`: sorts the whole vector in place. `T` needs `operator<=`, default construction and copy assignment.
- `template <typename T> void mergeSort(std::vector<T>& arr, size_t left, size_t right)`: sorts the inclusive range `[left, right]`.
- `template <typename T> void merge(std::vector<T>& arr, size_t left, size_t mid, size_t right)`: merges the sorted ranges `[left, mid]` and `[mid + 1, right]`.

```cpp
#include "merge_sort.cpp"

std::vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
mergeSort(arr);
```

## C++-Specific Notes

- Ranges are inclusive and indices are `size_t`; the whole-vector overload returns early for fewer than two elements, so `size() - 1` never wraps.
- `mid = left + (right - left) / 2` avoids overflow of `left + right`.
- Every `merge` allocates two temporary vectors (`L` and `R`). The code does not reuse a single buffer.
- Stable: `L[i] <= R[j]` takes the left element on a tie.
- For production code use `std::stable_sort`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD merge_sort_test.cpp -o merge_sort_test
./merge_sort_test
```

## Key Takeaways

- Inclusive ranges need `mid + 1` for the right half.
- `<=` keeps equal elements in order.
- O(n log n) time, O(n) temporary space.
