# Fenwick Tree -- Go Implementation

A Fenwick tree over `[]int`. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
| ---- | -------- |
| `main.go` | `FenwickTree` and a small `main` demo |
| `main_test.go` | unit tests, panic tests and a randomized test against brute force |
| `go.mod` | module `fenwick_tree` (Go 1.24.2) |

## API

| Call | Result |
| ---- | ------ |
| `NewFenwickTree(arr []int) *FenwickTree` | builds with `n` updates (the input slice is not kept) |
| `Update(index, delta int)` | adds `delta` to element `index` |
| `PrefixSum(index int) int` | sum of `0..index` |
| `Query(left, right int) int` | sum of `left..right`, inclusive |
| `Get(index int) int` | one element |

Bad indices and `left > right` panic.

## Go-Specific Notes

- `int` is 64-bit on 64-bit platforms, so ordinary sums do not overflow.
- Errors are panics, like an out-of-range slice index, rather than returned errors.
- `NewFenwickTree` copies the data into its own `tree` slice; changing the input afterwards does not affect it.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Fenwick_Tree/Go"
go test ./...
go run .
```

## Key Takeaways

- Check the index before `index++`.
- `Update` adds a delta; it does not assign.
- Query is the difference of two prefix sums.
