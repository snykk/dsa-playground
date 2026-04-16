# Matrix Chain Multiplication (Go)

Go implementation of the Matrix Chain Multiplication problem using 2D interval DP to find the optimal parenthesization that minimizes the total number of scalar multiplications.

## Files

| File | Description |
|------|-------------|
| `main.go` | Main implementation with interval DP approach |
| `main_test.go` | Test cases for matrix chain solver |
| `go.mod` | Go module definition (`matrixchain`) |

## How to Run

```bash
go test ./...
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `MatrixChainMultiplication(dims []int) int` | Finds the minimum scalar multiplications needed for a chain of matrices | O(n^3) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n^3) where n = number of matrices |
| Space | O(n^2) for the 2D DP table |

## Notes

- Input `dims` is a slice of length n+1 where matrix i has dimensions `dims[i-1] x dims[i]`.
- Uses interval DP: iterates over chain lengths, then starting positions, then split points.
- `dp[i][j]` stores the minimum scalar multiplications to compute matrices i through j.
- Initializes costs to `1<<31 - 1` (max int) to represent infinity.

---

_Last Updated: April 2026_
