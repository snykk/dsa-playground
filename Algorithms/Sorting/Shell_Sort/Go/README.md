# Shell Sort -- Go Implementation

## Files

- `main.go`: the `Sequence` type, the gap functions, `HSort`, `HSortGeneric`, `ShellSort`, `ShellSortGeneric` and a demo `main`.
- `main_test.go`: tests (the gap sequences, gaps near `math.MaxInt`, edge cases and random slices against `sort.Ints` for every sequence, h-sorted passes, panics, the instability example, counted comparisons and shifts, and 40 slices whose counts are pinned to the Python outputs).
- `go.mod`: module `shellsort`, Go 1.21.

## API

- `ShellSort(arr []int, seq Sequence)`: sorts in place.
- `ShellSortGeneric[T any](arr []T, less func(a, b T) bool, seq Sequence)`: the same for any element type, ordered by `less`.
- `HSort(arr []int, gap int)` and `HSortGeneric[T any](arr []T, less func(a, b T) bool, gap int)`: one pass with stride `gap`.
- `GapSequence(n int, seq Sequence) []int`: the gaps for `n` elements, largest first.
- `ShellGaps(n)`, `KnuthGaps(n)`, `CiuraGaps(n)`: one sequence each.
- `type Sequence int` with `Ciura` (the zero value), `Knuth` and `Shell`; `String()` returns the Python names.

```go
arr := []int{98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38}
ShellSort(arr, Ciura)
```

## Go-Specific Notes

- Go has no default arguments, so `Ciura` is the zero value of `Sequence`: a `Sequence` left unset is the default.
- The generic version asks `less(key, arr[j-gap])`, which is the Python and C++ test `arr[j - gap] > key`, so all three make the same comparisons.
- Errors: `GapSequence` (and so `ShellSort`) panics with `shellsort: unknown gap sequence <n>` on another `Sequence` value, and `HSort` panics with `shellsort: gap must be at least 1, got <gap>`. A gap of at least `len(arr)` changes nothing; a negative `n` gives no gaps.
- The gap functions never compute a number above `n`, so they cannot overflow; the tests run them for `n` up to `math.MaxInt`.
- Not stable. For production code use `slices.Sort`, or `slices.SortStableFunc` when equal keys must keep their order.

## How to Run

```bash
go test ./...
go run .   # the demo
```

## Key Takeaways

- A `less` function makes one sort work for records and custom orders, and lets the tests count comparisons.
- Making the default the zero value replaces a default argument.
- Every pass is Insertion Sort with a stride; Ciura's gaps make the fewest comparisons.
