# Interpolation Search -- Go Implementation

Interpolation search over `[]int`, iterative and recursive. For the idea, the formula and the traces see the [topic README](../README.md).

## Files

- `main.go` - the two search functions and the `interpolationOffset` helper (`package main`, no `main` function).
- `main_test.go` - 5 test functions, including all-equal, duplicate and full-range (`MinInt64` to `MaxInt64`) inputs.
- `go.mod` - the module `interpolationsearch`.

## API

- `InterpolationSearch(arr []int, target int) int` - index or -1.
- `InterpolationSearchRecursive(arr []int, target int, left int, right int) int` - the recursive form; the caller passes the bounds, for example `0` and `len(arr)-1`.

## Go-Specific Notes

- `interpolationOffset` takes the differences as `uint64`: they are non-negative and always fit, while `int` subtraction can overflow for `math.MaxInt64 - math.MinInt64`.
- The result is then computed in `float64`, so for very wide values the estimate is approximate; this affects only speed.
- A flat window (`arr[left] == arr[right]`) returns before the division.
- The package is `main` without a `main` function, so `go test` works but `go run .` and `go build` do not.

## How to Run

From this folder:

```bash
go test -v ./...
```

## Key Takeaways

- Do the subtraction in an unsigned type to avoid overflow.
- Guard the flat window before dividing.
- Prefer binary search unless the keys are close to uniform.
