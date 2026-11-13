# Constructive Algorithms -- Go Implementation

## Files

| File | Contents |
|------|----------|
| `main.go` | three builders, a priority queue and a demo `main()` |
| `main_test.go` | tests, including the permutation builder over all `n <= 12` |
| `go.mod` | module `constructive` |

## API

| Function | Returns |
|----------|---------|
| `ConstructPermutation(n, k int) []int` | permutation with exactly `k` distinct adjacent differences, or `nil` |
| `ConstructArrayWithSum(n, total, minVal, maxVal int) []int` | array, or `nil` |
| `ConstructGraph(degrees []int) []Edge` | edges (Havel-Hakimi) as `Edge{U, V}`, or `nil` |

Go implements three of the nine builders that Python has.

## Go-Specific Notes

- Impossible input returns `nil`.
- `ConstructGraph` uses `container/heap` with a package-level `Node` type; an empty edge list is also `nil`.
- Integers are `int`; huge `n * maxVal` products can overflow.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Only the permutation, array and graph builders exist in Go.
- Tests check the permutation builder against a distinct-difference counter.
