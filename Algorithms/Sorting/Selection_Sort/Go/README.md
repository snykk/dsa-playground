# Selection Sort -- Go Implementation

## Files

- `main.go`: `SelectionSort`.
- `main_test.go`: tests (basic sort and a table of edge cases: empty, single, duplicates, sorted, reversed).
- `go.mod`: the Go module for the folder.

## API

- `SelectionSort(arr []int)`: sorts in place; skips the swap when the minimum is already at position `i`.

```go
arr := []int{64, 34, 25, 12, 22, 11, 90}
SelectionSort(arr)
```

## Go-Specific Notes

- The slice is modified in place and nothing is returned.
- Only `[]int` is supported.
- For production code use `slices.Sort` or `sort.Ints`.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- At most n - 1 swaps, always n(n - 1)/2 comparisons.
- Not stable.
