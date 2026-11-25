# Unbounded Knapsack -- Go Implementation

The one-row table going up (each item reusable) and going down (each item once), the multiset of items read back from it, the 2D table, and the two ways of counting. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | the functions below and a demo `main` |
| `main_test.go` | 10 test functions: the worked example, both loop directions against brute force, the multiset and its ties, the table row by row, edge cases, invalid input, overflow, the counts against brute force, the number of updates, and 44 + 24 inputs pinned to the Python outputs |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `UnboundedKnapsack(weights []int, values []int64, capacity int) (int64, error)`: the best total value, each item usable any number of times.
- `UnboundedKnapsackItems(weights []int, values []int64, capacity int) (int64, []int, error)`: the best value and `counts[i]` copies of item `i` that reach it.
- `UnboundedKnapsackTable(weights []int, values []int64, capacity int) ([][]int64, error)`: the `(n + 1) x (W + 1)` table; row `i` uses the first `i` items.
- `ZeroOneKnapsack(weights []int, values []int64, capacity int) (int64, error)`: the same loop with `w` going down, each item at most once.
- `CountCombinations(weights []int, target int) (int64, error)` and `CountPermutations(weights []int, target int) (int64, error)`: the number of multisets, and of sequences, of items whose weights add up to `target`.

A weight below 1, a negative capacity or target, or slices of different lengths return an error wrapping `ErrInvalidInput`; a result that does not fit in an `int64`, one wrapping `ErrOverflow`. Check them with `errors.Is`.

```go
weights, values := []int{1, 3, 4, 5}, []int64{1, 4, 5, 7}
best, _ := UnboundedKnapsack(weights, values, 10)       // 14
_, counts, _ := UnboundedKnapsackItems(weights, values, 10) // [0 0 0 2]
once, _ := ZeroOneKnapsack(weights, values, 10)         // 13
comb, _ := CountCombinations([]int{1, 2, 5}, 5)         // 4
perm, _ := CountPermutations([]int{1, 2, 5}, 5)         // 9
```

## Go-Specific Notes

- **`int64` values, checked.** The sum `dp[w - weight] + value` is checked against `math.MaxInt64` before it is formed, so a best value that does not fit returns `ErrOverflow` instead of wrapping around; counts saturate at -1 ("too many") and only the target's own entry decides, as in C++.
- **Errors, not panics.** Bad input comes back through the `error` result with a zero value and nil slices; valid input never fails, except by overflow.
- **Empty is not nil.** With no items, `UnboundedKnapsackItems` returns an empty `[]int{}`, like Python's `[]` and C++'s empty vector.
- **Same output as Python.** The items are tried in input order with a strict `>`; `TestAgreementWithPython` checks the value, the counts, the downward value and both counts on inputs computed by the Python code. The unexported `fillRow` takes a `*counters` that the tests use to count the updates.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Linear_DP/Unbounded_Knapsack/Go"
go test ./...
go run main.go   # demo: the worked example and the two counts
```

## Key Takeaways

1. The direction of one `for` loop decides between reuse and a single use.
2. Return `ErrOverflow` rather than a wrapped-around number.
3. The values, the counts and the copies agree with the Python and C++ versions.
