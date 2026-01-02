# DP Patterns in Go

Implementation of DP patterns in Go.

## Patterns

1.  **Knapsack01**: 0/1 Knapsack optimization.
2.  **LCS**: Longest Common Subsequence.
3.  **LIS**: Longest Increasing Subsequence (O(N log N)).

## Usage

```go
// Knapsack
val := Knapsack01([]int{10, 20}, []int{60, 100}, 30)

// LCS
l := LCS("abc", "ac")

// LIS
l := LIS([]int{10, 9, 2, 5, 3})
```

## Testing

Run the tests:

```bash
go test -v
```
