# Edit Distance (C++)

C++ implementation of the Edit Distance (Levenshtein Distance) algorithm using 2D dynamic programming to compute the minimum number of operations to transform one string into another.

## Files

| File | Description |
|------|-------------|
| `edit_distance.cpp` | Main implementation with DP table approach |
| `edit_distance_test.cpp` | Test cases for edit distance computation |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test edit_distance_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `editDistance(s1, s2)` | Computes minimum edit distance between two strings using bottom-up DP | O(m * n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(m * n) where m, n are the lengths of the input strings |
| Space | O(m * n) for the 2D DP table |

## Notes

- Three operations allowed: insert, delete, and replace, each with cost 1.
- The DP table `dp[i][j]` stores the edit distance between `s1[0..i-1]` and `s2[0..j-1]`.
- Base cases: `dp[i][0] = i` (delete all) and `dp[0][j] = j` (insert all).
- Uses `std::min` with initializer list to select the minimum of three choices.

---

_Last Updated: April 2026_
