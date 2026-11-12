# Linear Search -- Go Implementation

Linear search over `[]int`, plus a generic version. For the idea and the trace see the [topic README](../README.md).

## Files

- `main.go` - the search functions (`package main`, no `main` function).
- `main_test.go` - 4 test functions with table-driven subtests (19 passing cases counting subtests).
- `go.mod` - the module `linearsearch`.

## API

- `LinearSearch(arr []int, target int) int` - index of the first match, or -1.
- `LinearSearchRecursive(arr []int, target int, index int) int` - the recursive form; pass `0` as the start.
- `LinearSearchAllOccurrences(arr []int, target int) []int` - all matching indexes (an empty slice if none).
- `LinearSearchGeneric[T comparable](arr []T, target T) int` - the first match in a slice of any comparable type.

## Go-Specific Notes

- `LinearSearchGeneric` uses type parameters (Go 1.18 and later); the module declares Go 1.21.
- Go grows the stack on demand, so deep recursion does not crash quickly, but it still uses O(n) memory.
- In real code, `slices.Index` and `slices.IndexFunc` (Go 1.21) do the same job.
- The package is `main` without a `main` function, so `go test` works but `go run .` and `go build` do not.

## How to Run

From this folder:

```bash
go test -v ./...
```

## Key Takeaways

- The first match wins; use `LinearSearchAllOccurrences` for every index.
- Use the generic form for non-integer slices.
- Prefer `slices.Index` in production code.
