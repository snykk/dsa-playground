# Longest Common Subsequence (C++)

C++ implementation of the Longest Common Subsequence (LCS) algorithm using 2D dynamic programming to find the length of the longest subsequence common to two strings.

## Files

| File | Description |
|------|-------------|
| `lcs.cpp` | Main implementation with DP table approach |
| `lcs_test.cpp` | Test cases for LCS computation |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test lcs_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `lcsLength(s1, s2)` | Computes the length of the longest common subsequence of two strings | O(m * n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(m * n) where m, n are the lengths of the input strings |
| Space | O(m * n) for the 2D DP table |

## Notes

- A subsequence is derived by deleting zero or more elements without changing order.
- The DP table `dp[i][j]` stores the LCS length of `s1[0..i-1]` and `s2[0..j-1]`.
- When characters match, extend the diagonal value; otherwise, take the max of left and top neighbors.

---

_Last Updated: April 2026_
