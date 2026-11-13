# 0/1 Knapsack -- Go Implementation

The 2D table solution for the 0/1 knapsack.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Knapsack01` |
| `main_test.go` | table-driven test |
| `go.mod` | module `knapsack01` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `Knapsack01(weights, values []int, capacity int) int` | 2D table; returns the best value | O(n * W) | O(n * W) |

There is no one-row version and no item recovery here. Input is not validated: the slices must have equal length and `capacity` must not be negative (a negative capacity panics).

## Go-Specific Notes

- `int` is 64 bits on common platforms, so overflow is not a practical concern.
- The table is a slice of slices; each row is allocated separately.
- The package is `main` with no `main` function, so only `go test` runs it.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- The table has `n + 1` rows and `capacity + 1` columns; item `i` is `weights[i-1]`.
- The skip / take choice reads only the previous row.
- Time and memory both scale with the capacity value.
