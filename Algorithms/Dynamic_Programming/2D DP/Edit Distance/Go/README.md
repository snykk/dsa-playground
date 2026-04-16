# Edit Distance (Go)

Go implementation of the Edit Distance (Levenshtein Distance) algorithm using 2D dynamic programming to compute the minimum number of operations to transform one string into another.

## Files

| File | Description |
|------|-------------|
| `main.go` | Main implementation with DP table approach |
| `main_test.go` | Test cases for edit distance computation |
| `go.mod` | Go module definition (`editdistance`) |

## How to Run

```bash
go test ./...
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `EditDistance(s1, s2 string) int` | Computes minimum edit distance between two strings using bottom-up DP | O(m * n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(m * n) where m, n are the lengths of the input strings |
| Space | O(m * n) for the 2D DP table |

## Notes

- Three operations allowed: insert, delete, and replace, each with cost 1.
- The DP table `dp[i][j]` stores the edit distance between `s1[0..i-1]` and `s2[0..j-1]`.
- Base cases: `dp[i][0] = i` (delete all) and `dp[0][j] = j` (insert all).
- Manually compares to find the minimum of three choices (no generic `min` for int in older Go versions).

---

_Last Updated: April 2026_
