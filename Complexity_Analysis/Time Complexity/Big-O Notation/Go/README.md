# Big-O Notation -- Go Implementation

## Files

- `main.go`: seven example functions and `DemonstrateBigO` (package `main`, so it cannot be imported).
- `main_test.go`: tests for every example.
- `go.mod`: the Go module for the folder.

## API

- `ConstantTimeExample(n int) int`: O(1).
- `LogarithmicTimeExample(n int) int`: number of halvings, O(log n).
- `LinearTimeExample(arr []int) int`: sum, O(n).
- `LinearithmicTimeExample(arr []int) []int`: sorts a copy with `sort.Ints`.
- `QuadraticTimeExample(arr []int) [][2]int`: all pairs, O(n^2).
- `CubicTimeExample(n int) int`: counts `n^3` iterations.
- `ExponentialTimeExample(n int) int`: naive Fibonacci, O(2^n) (valid but loose).

```go
sorted := LinearithmicTimeExample([]int{64, 34, 25, 12})  // [12 25 34 64]
```

## Go-Specific Notes

- `sort.Ints` is a pattern-defeating quicksort: O(n log n) in the worst case, but close to O(n) on already sorted input. It is not a merge sort.
- The functions are exported, but the package is `package main`, so you cannot import it from elsewhere.
- There is no factorial example in Go.

## How to Run

```bash
cd "Complexity_Analysis/Time Complexity/Big-O Notation/Go"
go test ./...
go run .
```

## Key Takeaways

- Big-O is an upper bound on a function; best, average and worst case are different functions you can bound.
- Drop constants and lower-order terms; keep the dominant term.
- To prove a bound, exhibit `c` and `n0`.

