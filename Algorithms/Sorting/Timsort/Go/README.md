# Timsort -- Go Implementation

## Files

- `main.go`: `ComputeMinrun`, `CountRun`, `BinaryInsertionSort`, `GallopLeft`, `GallopRight`, `Run`, `InvariantsHold`, `Options`, `Timsort`, `TimsortFunc`, `TimsortWith`, the unexported merge state and merges, and a demo `main`.
- `main_test.go`: tests (minrun against CPython's rule, runs, binary insertion, the gallop searches against `sort.SearchInts` and their cost, random and structured slices against `sort.SliceStable` with a payload, galloping on and off, the stack invariants after every collapse, the 2015 example, merges and `minGallop`, `n - 1` comparisons on sorted and strictly descending input, the panic, and 40 slices whose comparison counts are pinned to the Python outputs).
- `go.mod`: module `timsort`, Go 1.21.

## API

- `Timsort(arr []int)`: sorts in place, stably.
- `TimsortFunc[T any](arr []T, less func(a, b T) bool)`: the same for any element type, ordered by `less`.
- `TimsortWith[T any](arr []T, less func(a, b T) bool, opts Options)`: with `Options{NoGallop bool; MinRun int; AfterCollapse func(runs []Run)}`; the zero value is the default (galloping on, minrun computed).
- `ComputeMinrun(n int) int`; `CountRun(arr, less, lo, hi) (int, bool)`; `BinaryInsertionSort(arr, less, lo, hi, start)`; `GallopLeft(key, a, less, base, n, hint) int` and `GallopRight(...)`.
- `type Run struct{ Base, Length int }` and `InvariantsHold(runs []Run) bool`. `MinGallop` is 7.

```go
arr := []int{43, 37, 31, 24, 15, 9, 12, 40, 6, 28, 2, 5}
TimsortWith(arr, func(a, b int) bool { return a < b }, Options{MinRun: 4})
```

## Go-Specific Notes

- Go has no default arguments, so the options are a struct whose zero value is the default: `NoGallop` rather than `Gallop`, and `MinRun` 0 for the computed value.
- `less(a, b)` is the Python and C++ `a < b`, called in the same order, so all three make the same comparisons.
- `TimsortWith` panics with `timsort: MinRun must be 0 (computed) or positive, got <n>` on a negative `MinRun`. A panicking `less` can leave the slice with elements lost and others duplicated.
- `copy` handles overlapping slices, so the block moves need no direction of their own. The temporary copy is one slice in the merge state, reused by every merge.
- For production code use `slices.SortStableFunc` or `sort.SliceStable`.

## How to Run

```bash
go test ./...
go run .   # minrun for a few n, the stack after every collapse, the sorted slice
```

## Key Takeaways

- A `less` function makes one sort work for any element type and lets the tests count comparisons.
- Options with a useful zero value replace default arguments.
- The `AfterCollapse` hook exposes the stack, so the invariants are checked on every push.
