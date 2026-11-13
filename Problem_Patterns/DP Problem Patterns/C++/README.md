# DP Problem Patterns -- C++ Implementation

The same three DPs as the Python version, as static methods of a `DPPatterns` class.

## Files

| File | Description |
|------|-------------|
| `dp_patterns.cpp` | `DPPatterns::knapsack01`, `lcs`, `lis` and a demo `main` (disabled when `IS_TEST_BUILD` is defined) |
| `dp_patterns_test.cpp` | Assertion-based tests (3 functions); it includes the `.cpp` file |

## API

- `static int knapsack01(const vector<int>& weights, const vector<int>& values, int capacity)`: maximum value, each item once. O(N * W) time, O(W) space.
- `static int lcs(string text1, string text2)`: LCS length. O(N * M) time, O(min(N, M)) space.
- `static int lis(const vector<int>& nums)`: length of the longest strictly increasing subsequence, via `std::lower_bound`. O(N log N).

## C++-Specific Notes

- Values and sums are `int`; use `long long` for large values, since the sums can overflow 32 bits.
- `capacity` must be non-negative (the DP array has `capacity + 1` entries).
- `std::lower_bound` gives the strict version; `std::upper_bound` would allow equal elements.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD dp_patterns_test.cpp -o dp_patterns_test
./dp_patterns_test
```

## Key Takeaways

- The test file includes the `.cpp`, so build it alone with `-DIS_TEST_BUILD` (otherwise `main` is defined twice).
- The inner loop of the 1D knapsack runs downwards to use each item once.
