# Longest Common Subsequence (Go)

Go implementation of the Longest Common Subsequence (LCS) algorithm using 2D dynamic programming to find the length of the longest subsequence common to two strings.

## Files

| File | Description |
|------|-------------|
| `main.go` | Main implementation with DP table approach |
| `main_test.go` | Test cases for LCS computation |
| `go.mod` | Go module definition (`lcs`) |

## How to Run

```bash
go test ./...
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `LCSLength(s1, s2 string) int` | Computes the length of the longest common subsequence of two strings | O(m * n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(m * n) where m, n are the lengths of the input strings |
| Space | O(m * n) for the 2D DP table |

## Notes

- A subsequence is derived by deleting zero or more elements without changing order.
- The DP table `dp[i][j]` stores the LCS length of `s1[0..i-1]` and `s2[0..j-1]`.
- Uses manual comparison to select the larger of two values instead of a built-in max function.

---

_Last Updated: April 2026_
