# Longest Increasing Subsequence (Go)

Go implementation of the Longest Increasing Subsequence (LIS) problem using dynamic programming to find the length of the longest strictly increasing subsequence in an array.

## Files

| File | Description |
|------|-------------|
| `main.go` | Main implementation with O(n^2) DP approach |
| `main_test.go` | Test cases for LIS computation |
| `go.mod` | Go module definition (`lis`) |

## How to Run

```bash
go test ./...
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `LISDP(arr []int) int` | Computes the length of the longest strictly increasing subsequence | O(n^2) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n^2) where n = length of the input array |
| Space | O(n) for the 1D DP array |

## Notes

- `dp[i]` stores the length of the LIS ending at index `i`, initialized to 1.
- For each element, scans all previous elements to extend valid increasing subsequences.
- Finds the overall maximum by iterating through all `dp` values after computation.
- Handles the empty array edge case by returning 0.

---

_Last Updated: April 2026_
