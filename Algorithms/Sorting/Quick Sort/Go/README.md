# Quick Sort -- Go Implementation

## Files

- `main.go`: `QuickSort`, plus the unexported `quickSort` and `partition`.
- `main_test.go`: tests (basic sort, and edge cases including 2,000 sorted, reversed and all-equal elements).
- `go.mod`: the Go module for the folder.

## API

- `QuickSort(arr []int)`: sorts in place; does nothing for fewer than two elements.

```go
arr := []int{64, 34, 25, 12, 22, 11, 90}
QuickSort(arr)
```

## Go-Specific Notes

- Lomuto partition with the last element as the pivot; plain two-call recursion.
- On sorted or all-equal input the recursion is n deep and the time O(n^2). Go grows goroutine stacks on demand, so this is slow rather than fatal, up to the default 1 GB stack limit.
- Not stable. For production code use `slices.Sort` or `sort.Ints`.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- The partition places the pivot in its final position.
- A fixed pivot is quadratic on sorted input.
