# Ternary Search -- Go Implementation

Ternary search over a sorted `[]int`, iterative and recursive. For the idea and the traces see the [topic README](../README.md).

## Files

- `main.go` - the two search functions (`package main`, no `main` function).
- `main_test.go` - 2 test functions with table-driven subtests (7 passing cases counting subtests).
- `go.mod` - the module `ternarysearch`.

## API

- `TernarySearch(arr []int, target int) int` - index or -1.
- `TernarySearchRecursive(arr []int, target int, left int, right int) int` - the recursive form; the caller passes the bounds, for example `0` and `len(arr)-1`.

There is no unimodal-function search in Go (Python has one).

## Go-Specific Notes

- The probes are `left + (right-left)/3` and `right - (right-left)/3`, which cannot overflow.
- Only `[]int` is supported.
- For lookups, `sort.SearchInts` (binary search) is the better choice.
- The package is `main` without a `main` function, so `go test` works but `go run .` and `go build` do not.

## How to Run

From this folder:

```bash
go test -v ./...
```

## Key Takeaways

- Two probes per round, a third discarded: more probes in total than binary search.
- Use `sort.SearchInts` for lookups in real code.
- Ternary search is for unimodal functions, which this folder does not implement in Go.
