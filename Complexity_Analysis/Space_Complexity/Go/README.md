# Space Complexity -- Go Implementation

## Files

- `main.go`: four examples and `DemonstrateSpaceComplexity` (package `main`, so it cannot be imported).
- `main_test.go`: tests for every example.
- `go.mod`: the Go module for the folder.

## API

- `ConstantSpaceExample(n int) int`: O(1) space.
- `LinearSpaceExample(n int) []int`: O(n) space; preallocates capacity `n`.
- `QuadraticSpaceExample(n int) [][]int`: O(n^2) space.
- `InPlaceReverse(arr []int)`: O(1) auxiliary space.

```go
test := []int{1, 2, 3, 4, 5}
InPlaceReverse(test) // [5 4 3 2 1]
```

## Go-Specific Notes

- There are no recursive examples here; the logarithmic, Fibonacci and Merge Sort examples exist only in Python.
- Goroutine stacks start small (2 KB in current Go versions) and grow on demand up to a maximum (1 GB by default on 64-bit systems), so deep recursion is slow before it is fatal.
- Slices share their backing array: `arr[a:b]` is O(1) space, unlike Python slicing, which copies.

## How to Run

```bash
cd "Complexity_Analysis/Space_Complexity/Go"
go test ./...
go run .
```

## Key Takeaways

- Space complexity counts auxiliary memory, including the recursion stack, not the input.
- Count what is alive at the same time, not everything ever allocated.
- Recursion depth `d` costs O(d) memory.

