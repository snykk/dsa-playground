# Radix Sort -- C++ Implementation

## Files

- `radix_sort.cpp`: `radixSort` and `countingSortByDigit`.
- `radix_sort_test.cpp`: assert-based tests (basic, negative numbers, large values including `INT_MIN` and `INT_MAX`, empty input). It `#include`s `radix_sort.cpp` directly.

## API

- `void radixSort(std::vector<int>& arr)`: LSD radix sort, base 10, in place. Negative values are allowed; an empty vector is a no-op.
- `void countingSortByDigit(std::vector<int>& arr, long long exp, long long offset = 0)`: one stable pass on the digit `((value - offset) / exp) % 10`.

```cpp
#include "radix_sort.cpp"

std::vector<int> arr = {170, 45, 75, 90, 802, 24, 2, 66};
radixSort(arr);
```

## C++-Specific Notes

- It is int-only, not a template.
- The key offset, the maximum key and the exponent are `long long`, so `exp * 10` cannot overflow for any `int` input and the spread from `INT_MIN` to `INT_MAX` is handled.
- Each pass allocates an output vector of `n` elements.
- The test file includes the implementation, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD radix_sort_test.cpp -o radix_sort_test
./radix_sort_test
```

## Key Takeaways

- Use 64-bit arithmetic for the key and the exponent.
- Place elements back to front to keep each pass stable.
