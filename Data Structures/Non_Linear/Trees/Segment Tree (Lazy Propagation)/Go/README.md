# Segment Tree (Lazy Propagation) -- Go Implementation

A recursive segment tree with lazy tags: range add and range sum. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
| ---- | -------- |
| `main.go` | `LazySegmentTree` and a small demo `main` |
| `main_test.go` | unit tests and a randomized test against brute force |
| `go.mod` | module `segmenttreelazy` (Go 1.24.2) |

## API

| Call | Result |
| ---- | ------ |
| `NewLazySegmentTree(arr []int) *LazySegmentTree` | builds the tree in O(n) |
| `UpdateRange(left, right int, val int64)` | adds `val` to every element of `left..right` (inclusive) |
| `Query(left, right int) int64` | sum of elements `left..right` (inclusive) |

There is no index validation: a range partly outside the array is clipped, and a range outside does nothing.

## Go-Specific Notes

- Sums, tags and update values are `int64`, independent of the platform `int` width.
- `tree` and `lazy` are `[]int64` of length `4n`.
- Everything is in `package main`; the demo `main` is not run by `go test`.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/Segment Tree (Lazy Propagation)/Go"
go test ./...
go run .
```

## Key Takeaways

- Tags rest only on fully covered nodes.
- Push down before recursing into a partial node.
- A push scales the tag by each child's own length.
