# Matrix Chain Multiplication -- Go Implementation

Bottom-up interval DP for the cheapest matrix chain order.

## Files

| File | Contents |
|------|----------|
| `main.go` | `MatrixChainMultiplication` |
| `main_test.go` | table-driven test, including large costs and short inputs |
| `go.mod` | module `matrixchain` (Go 1.21) |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `MatrixChainMultiplication(dims []int) int` | minimum number of scalar multiplications; returns 0 for fewer than two matrices | O(n^3) | O(n^2) |

It returns only the cost, not the parenthesization.

## Go-Specific Notes

- `int` is 64 bits on 64-bit platforms, so costs above 2^31 are exact (a previous version started each cell at `1<<31 - 1`, which capped them). The starting value is now `math.MaxInt`, which also works on 32-bit platforms for the values that fit.
- Fewer than three entries in `dims` returns 0 before the table is built.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Start each cell at `math.MaxInt`, never at a fixed 32-bit constant.
- `n` matrices need `n + 1` dimensions.
- Fill by chain length.
