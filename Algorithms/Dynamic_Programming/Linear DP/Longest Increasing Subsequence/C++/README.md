# Longest Increasing Subsequence (C++)

C++ implementation of the Longest Increasing Subsequence (LIS) problem using dynamic programming to find the length of the longest strictly increasing subsequence in an array.

## Files

| File | Description |
|------|-------------|
| `lis.cpp` | Main implementation with O(n^2) DP approach |
| `lis_test.cpp` | Test cases for LIS computation |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test lis_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `lisDP(arr)` | Computes the length of the longest strictly increasing subsequence | O(n^2) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n^2) where n = length of the input array |
| Space | O(n) for the 1D DP array |

## Notes

- `dp[i]` stores the length of the LIS ending at index `i`, initialized to 1.
- For each element, scans all previous elements to extend valid increasing subsequences.
- Returns the maximum value across all `dp[i]` entries via `std::max_element`.
- Handles the empty array edge case by returning 0.

---

_Last Updated: April 2026_
