# Merge Sort -- Go Implementation

## Files

- `main.go`: `MergeSort` and the unexported `merge`.
- `main_test.go`: tests (basic sort and a table of edge cases: empty, single, duplicates, sorted, reversed).
- `go.mod`: the Go module for the folder.

## API

- `MergeSort(arr []int)`: sorts in place: it copies the two halves, sorts the copies recursively and merges them back into `arr`.

```go
arr := []int{38, 27, 43, 3, 9, 82, 10}
MergeSort(arr)
```

## Go-Specific Notes

- Each call allocates two new slices for the halves, so the extra space is O(n) live and many allocations in total.
- The merge takes the left element on a tie (`<=`), so it is stable, though with plain `int` values that cannot be observed.
- Only `[]int` is supported; there is no generic or iterative version.
- For production code use `slices.Sort` or `sort.SliceStable`.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Copy the halves before merging back into the original slice.
- O(n log n) in every case.
