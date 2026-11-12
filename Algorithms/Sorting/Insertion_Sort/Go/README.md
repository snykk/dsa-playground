# Insertion Sort -- Go Implementation

## Files

- `main.go`: `InsertionSort`.
- `main_test.go`: tests (basic sort and a table of edge cases: empty, single, duplicates, sorted, reversed).
- `go.mod`: the Go module for the folder.

## API

- `InsertionSort(arr []int)`: sorts in place; returns nothing.

```go
arr := []int{64, 34, 25, 12, 22, 11, 90}
InsertionSort(arr)
```

## Go-Specific Notes

- Signed `int` indices make `j >= 0` a safe loop test.
- The slice is modified in place.
- For production code use `slices.Sort` or `sort.Ints`.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Save the key before shifting.
- The loop runs once per inversion, so sorted input is linear.
