# Big-Omega (Omega) -- Go Implementation

## Files

- `main.go`: three example functions and `DemonstrateBigOmega` (package `main`, so it cannot be imported).
- `main_test.go`: tests for every example.
- `go.mod`: the Go module for the folder.

## API

- `LinearSearchBestCase(arr []int, target int) int`: index or -1. `Omega(1)` on every input; best `Theta(1)`, worst `Theta(n)`.
- `BubbleSortBestCase(arr []int) []int`: sorts a copy with the early-exit flag. `Omega(n)` on every input.
- `MatrixTraversalLowerBound(matrix [][]int) int`: sum of all elements, `Theta(n^2)`.

```go
sorted := BubbleSortBestCase([]int{5, 4, 3, 2, 1}) // [1 2 3 4 5]
```

## Go-Specific Notes

- `BubbleSortBestCase` copies its input first, so the caller's slice is unchanged.
- There is no quick sort example in Go. For production sorting use `slices.Sort` or `sort.Ints`.
- The package is `package main`; run the demo with `go run .`.

## How to Run

```bash
cd "Complexity_Analysis/Time Complexity/Big-Omega (Ω)/Go"
go test ./...
go run .
```

## Key Takeaways

- Big-Omega is a lower bound on a function; best, average and worst case are different functions you can bound.
- Useful lower bounds are the largest you can prove; `Omega(1)` is always true.
- Comparison sorting is `Omega(n log n)` in the worst case, not on every input.

