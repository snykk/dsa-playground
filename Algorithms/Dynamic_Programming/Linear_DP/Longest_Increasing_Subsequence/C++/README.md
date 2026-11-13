# Longest Increasing Subsequence -- C++ Implementation

The O(n^2) table for the length.

## Files

| File | Contents |
|------|----------|
| `lis.cpp` | `lisDP` |
| `lis_test.cpp` | `assert`-based tests; it `#include`s `lis.cpp` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `int lisDP(const std::vector<int>& arr)` | length of the longest strictly increasing subsequence; 0 for an empty vector | O(n^2) | O(n) |

There is no O(n log n) version and no sequence recovery here; the Python folder has both.

## C++-Specific Notes

- The result is the maximum of the `dp` vector (`std::max_element`), not its last entry.
- Equal values do not extend a run, so `{7, 7, 7, 7}` gives 1.
- The test file includes the `.cpp`, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD lis_test.cpp -o lis_test
./lis_test
```

## Key Takeaways

- Take the maximum over all entries of `dp`.
- Strict comparison `arr[j] < arr[i]` is what excludes duplicates.
- Quadratic time limits it to a few thousand elements.
