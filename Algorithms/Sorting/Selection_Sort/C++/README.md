# Selection Sort -- C++ Implementation

## Files

- `selection_sort.cpp`: the `selectionSort` template, instantiated for `int` and `double`.
- `selection_sort_test.cpp`: assert-based tests (basic, edge cases, no self-swaps). It `#include`s `selection_sort.cpp` directly.

## API

- `template <typename T> void selectionSort(std::vector<T>& arr)`: sorts in place; returns nothing. `T` needs `operator<` and to be swappable.

```cpp
#include "selection_sort.cpp"

std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
selectionSort(arr);
```

## C++-Specific Notes

- Indices are `size_t`; the loops never subtract, so an empty vector is safe.
- The `min_idx != i` guard skips self-swaps; the tests count moves on a type with instrumented move operations to check that a sorted input is never touched.
- Swaps use `std::swap`, which moves rather than copies.
- Not stable. For production code use `std::sort` or `std::stable_sort`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD selection_sort_test.cpp -o selection_sort_test
./selection_sort_test
```

## Key Takeaways

- At most n - 1 swaps, but always n(n - 1)/2 comparisons.
- The long-distance swap is why it is not stable.
