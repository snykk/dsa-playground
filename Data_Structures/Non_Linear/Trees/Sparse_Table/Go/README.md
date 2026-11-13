# Sparse Table -- Go Implementation

A static range minimum or maximum table: O(n log n) build, O(1) query. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
| ---- | -------- |
| `main.go` | `SparseTable` and a small demo `main` |
| `main_test.go` | unit tests, empty-input, invalid-kind and range tests, and an exhaustive comparison with brute force |
| `go.mod` | module `sparse_table` (Go 1.24.2) |

## API

| Call | Result |
| ---- | ------ |
| `NewSparseTable(arr []int, queryType string) *SparseTable` | builds from a copy of `arr`; panics unless `queryType` is `"min"` or `"max"` |
| `Query(left, right int) int` | min or max of `left..right`; swapped bounds are reordered; panics outside `0..n-1` |
| `Get(index int) int` | the original element; panics outside `0..n-1` |

An empty slice is allowed; every query on it panics.

## Go-Specific Notes

- The level count and the query exponent use `math/bits.Len`, not `math.Log2`.
- The input slice is copied (earlier versions kept the caller's slice).
- The built-in `min` and `max` (Go 1.21 and later) are used for the combine step.
- Errors are panics, like an out-of-range slice index.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Sparse_Table/Go"
go test ./...
go run .
```

## Key Takeaways

- Two overlapping power-of-two windows answer any range.
- Copy the input so the table stays a valid snapshot.
- Use `bits.Len` for integer logarithms.
