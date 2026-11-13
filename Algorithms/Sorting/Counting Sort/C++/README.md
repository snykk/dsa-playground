# Counting Sort -- C++ Implementation

## Files

- `counting_sort.cpp`: `countingSort`.
- `counting_sort_test.cpp`: assert-based tests (basic, negative numbers, too-small `maxVal`). It `#include`s `counting_sort.cpp` directly.

## API

- `std::vector<int> countingSort(const std::vector<int>& arr, int maxVal)`: stable counting sort; returns a new vector. Throws `std::invalid_argument` if an element is larger than `maxVal`. An empty input returns an empty vector. Negative values are allowed.

```cpp
#include "counting_sort.cpp"

std::vector<int> sorted = countingSort({4, 2, 2, 8, 3, 3, 1}, 8);
```

## C++-Specific Notes

- It is a plain function over `std::vector<int>`, not a template, and `maxVal` is required (Python detects it).
- `minVal` comes from `std::min_element`; the slot of `x` is `x - minVal`, computed in 64-bit so that a wide range (for example `INT_MIN` to `INT_MAX`) does not overflow `int`. Such a range would still ask for gigabytes of count array.
- The input is `const` and untouched; the output is a separate vector.
- The test file includes the implementation, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD counting_sort_test.cpp -o counting_sort_test
./counting_sort_test
```

## Key Takeaways

- Offset by the minimum; validate `maxVal`.
- Walk the input backwards for stability.
- Memory is `maxVal - minVal + 1` counters plus the output.
