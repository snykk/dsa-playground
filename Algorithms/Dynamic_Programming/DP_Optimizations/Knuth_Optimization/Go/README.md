# Knuth Optimization -- Go Implementation

Knuth's optimization of the interval DP `dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + C(i, j)`: each cell tries only the splits between `split[i][j-1]` and `split[i+1][j]`, O(n^2) instead of O(n^3). Applied to Interval DP's pile merging (with the merges read back) and to the optimal binary search tree. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | the functions below and a demo `main` |
| `main_test.go` | 11 test functions: the worked example, the tables against an independent plain DP and brute force, the window and the monotone split table, both conditions and a cost that breaks them, the merges replayed and their tie rule, the optimal binary search tree, edge cases, invalid input, overflow, the exact number of splits tried, and 40 + 20 + 16 inputs pinned to the Python outputs |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `SplitDP(n int, cost func(i, j int) int64, knuth bool) (int64, error)`: `dp[0][n-1]` for `dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + cost(i, j)`; with `knuth` false every `k` is tried.
- `MergePiles(piles []int64) (int64, error)`: the minimum total cost of merging neighbouring piles into one.
- `type Merge struct{ I, K, J int }` and `MergePilesPlan(piles []int64) (int64, []Merge, error)`: the cost and the merges, in post-order, the smallest `K` on ties; the same list as Interval DP's `MergePilesPlan`.
- `OptimalBST(freq []int64) (int64, error)`: the least `sum(freq[t] * depth(t))` over the binary search trees on the keys, the root at depth 1.

A value below 0 (a pile, a frequency, a cost, or `n`) returns an error wrapping `ErrInvalidInput`; an answer that does not fit in an `int64`, one wrapping `ErrOverflow`. Check them with `errors.Is`.

```go
piles := []int64{3, 2, 4, 1}
cost, _ := MergePiles(piles)               // 20
_, merges, _ := MergePilesPlan(piles)      // [{0 0 1} {2 2 3} {0 1 3}]
bst, _ := OptimalBST([]int64{34, 8, 50})   // 142
v, _ := SplitDP(4, func(i, j int) int64 { return int64(j - i) }, true) // any cost of 0 or more
```

## Go-Specific Notes

- **`int64`, checked.** As in C++, -1 (`tooLarge`) stands for a cost above `math.MaxInt64`: such a candidate never wins, and only the answer's own cell decides whether `ErrOverflow` is returned. A total of the piles or frequencies that does not fit returns `ErrOverflow` at once.
- **A cell that does not fit** keeps its window's first `k` as its split, so the windows that read it stay inside the table; the answer is then too large too.
- **Errors, not panics.** Bad input comes back through the `error` result with a zero value and a nil slice of merges.
- **Empty is not nil.** With no piles or one pile, `MergePilesPlan` returns an empty `[]Merge{}`, like Python's `[]` and C++'s empty vector.
- **Same output as Python.** The windows are tried in increasing order with a strict `<`, and the merges are read with the same stack; `TestAgreementWithPython` checks the costs, the merges and the number of splits tried on inputs computed by the Python code. The unexported fill functions take a `*counters` that the tests use to count the splits exactly.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/DP_Optimizations/Knuth_Optimization/Go"
go test ./...
go run main.go   # demo: the worked example, a tree and a cost that breaks the condition
```

## Key Takeaways

1. The window is two cells of the previous diagonal: fill by length.
2. Return `ErrOverflow` rather than a wrapped-around number, and keep every split inside its window.
3. The costs, merges and numbers of splits tried agree with the Python and C++ versions.
