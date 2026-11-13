# 0/1 Knapsack -- C++ Implementation

The 2D table solution for the 0/1 knapsack.

## Files

| File | Contents |
|------|----------|
| `knapsack_01.cpp` | `knapsack01` |
| `knapsack_01_test.cpp` | `assert`-based tests; it `#include`s `knapsack_01.cpp` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `int knapsack01(const std::vector<int>& weights, const std::vector<int>& values, int capacity)` | 2D table; returns the best value | O(n * W) | O(n * W) |

There is no one-row version and no item recovery here (the Python folder has the one-row version). Input is not validated: the two vectors must have equal length and `capacity` must not be negative (a negative capacity is undefined behaviour or throws `std::length_error`).

## C++-Specific Notes

- Values and the table use `int`: a total value above `INT_MAX` overflows. Change the types to `long long` for large inputs.
- The test file includes the `.cpp` directly, so compile only the test file; compiling both gives duplicate symbols.
- Weightless items work: `weights[i-1] <= w` is true for every `w`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD knapsack_01_test.cpp -o knapsack_test
./knapsack_test
```

## Key Takeaways

- The table has `n + 1` rows and `capacity + 1` columns; item `i` is `weights[i - 1]`.
- Each cell reads only the row above, which is why an item is used at most once.
- Mind the `int` range when values are large.
