# Mo's Algorithm -- Go Implementation

## Files

| File | Contents |
|------|----------|
| `main.go` | the `MoSAlgorithm` type, `countDistinctInRanges` and a demo `main()` |
| `main_test.go` | tests |
| `go.mod` | module `mos_algorithm` |

## API

| Function | Description |
|----------|-------------|
| `NewMoSAlgorithm(arr []int) *MoSAlgorithm` | stores the slice; block size is at least 1 |
| `processQueries(queries [][]int) []int` | distinct counts for 0-indexed inclusive `{l, r}` pairs, in input order |
| `countDistinctInRanges(arr, queries)` | convenience wrapper |

## Go-Specific Notes

- Everything but `NewMoSAlgorithm` is unexported (the package is `main`), so it is used from the tests and the demo only.
- The slice is stored, not copied; it is never modified.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Same algorithm as Python and C++.
- Queries are `[]int{l, r}`, not a struct.
