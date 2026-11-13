# Big-Theta (Theta) -- Go Implementation

## Files

- `main.go`: three example functions and `DemonstrateBigTheta` (package `main`, so it cannot be imported).
- `main_test.go`: tests for every example.
- `go.mod`: the Go module for the folder.

## API

- `TightBoundExample(arr []int) int`: sum, `Theta(n)` on every input.
- `BinarySearchExample(arr []int, target int) int`: index or -1; best case `Theta(1)`, worst case `Theta(log n)`.
- `MergeSortExample(arr []int) []int`: sorts a copy with `sort.Ints`.

```go
idx := BinarySearchExample([]int{1, 3, 5, 7, 9, 11}, 9) // 4
```

## Go-Specific Notes

- `MergeSortExample` is not a merge sort: `sort.Ints` is a pattern-defeating quicksort, `O(n log n)` in the worst case but close to linear on sorted input (measured 65,547 comparisons for 65,536 sorted ints against 1,098,760 for random ones in the audit). It is therefore not `Theta(n log n)` for every input.
- `mid := (left + right) / 2` can overflow on huge slices; `left + (right-left)/2` avoids it.
- There is no matrix multiplication example in Go.

## How to Run

```bash
cd "Complexity_Analysis/Time Complexity/Big-Theta (Θ)/Go"
go test ./...
go run .
```

## Key Takeaways

- Big-Theta is a tight bound on one function; best, average and worst case each get their own Theta.
- `f = Theta(g)` exactly when `f = O(g)` and `f = Omega(g)`.
- Binary search is `Theta(1)` in the best case and `Theta(log n)` in the worst case.

