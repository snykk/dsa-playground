# Binary Search -- Go Implementation

Binary search over `[]int`, with recursive and first/last occurrence variants. For the idea, the invariant and the trace see the [topic README](../README.md).

## Files

- `main.go` - the four search functions (`package main`, no `main` function).
- `main_test.go` - 4 test functions with table-driven subtests (14 passing cases counting subtests).
- `go.mod` - the module `binarysearch`.

## API

- `BinarySearch(arr []int, target int) int` - index or -1.
- `BinarySearchRecursive(arr []int, target int, left int, right int) int` - the recursive form; the caller passes the bounds, for example `0` and `len(arr)-1`.
- `BinarySearchFirstOccurrence(arr []int, target int) int` and `BinarySearchLastOccurrence(arr []int, target int) int`.

There is no closest-element search in Go (Python has one). For insertion points use `sort.SearchInts`.

## Go-Specific Notes

- The midpoint is `left + (right-left)/2`, which avoids the overflow of `(left+right)/2` for huge slices.
- `int` is 64-bit on common platforms, so overflow is not a practical risk, but the form costs nothing.
- Only `[]int` is supported; a generic version would use `cmp.Ordered`.
- The package is `main` without a `main` function, so `go test` works but `go run .` and `go build` do not.

## How to Run

From this folder:

```bash
go test -v ./...
```

## Key Takeaways

- Keep the invariant "the target, if present, is in `[left, right]`".
- First and last occurrence only change what happens on a match.
- `sort.SearchInts` gives the insertion point in real code.
