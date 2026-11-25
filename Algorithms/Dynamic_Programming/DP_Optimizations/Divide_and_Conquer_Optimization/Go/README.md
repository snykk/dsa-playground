# Divide and Conquer Optimization -- Go Implementation

The layered DP `dp[g][i] = min over j < i of dp[g-1][j] + C(j, i)` with each layer computed by the divide-and-conquer recursion, the plain DP beside it, and the groups read back from the best `j` of every cell. The example cost is the square of a group's sum. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | the functions below and a demo `main` |
| `main_test.go` | 10 test functions: the worked example and its cost evaluations, the recursion against the plain DP and brute force, the groups, the quadrangle inequality, a cost that breaks it, edge cases, invalid input, overflow, the number of cost evaluations, and 44 + 12 + 8 cases pinned to the Python outputs |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `type Partition struct { Cost int64; Bounds []int }`: the best total, and `k + 1` bounds with group `g` = `values[Bounds[g]:Bounds[g+1]]`.
- `MinCostPartition(values []int64, k int) (Partition, error)`: the least sum of `(group sum)^2` over `k` contiguous non-empty groups, with the recursion. O(k n log n).
- `MinCostPartitionPlain(values []int64, k int) (Partition, error)`: the same answer and bounds from the plain DP. O(k n^2).
- `PartitionDP(n, k int, cost func(j, i int) int64, optimized bool) (Partition, error)`: any cost of the group `[j, i)`; `optimized = false` is the plain DP.

`k < 1`, `k > n` (so every `k` on an empty slice) and, in the two concrete functions, a negative value return an error wrapping `ErrInvalidInput`; a total above 3037000499 (the concrete functions) or a sum of costs that does not fit (`PartitionDP`) returns one wrapping `ErrOverflow`. Check them with `errors.Is`.

```go
values := []int64{3, 1, 4, 1, 5, 9, 2, 6}
best, _ := MinCostPartition(values, 3)       // {341 [0 4 6 8]}
plain, _ := MinCostPartitionPlain(values, 3) // {341 [0 4 6 8]}

p := []int64{0, 1, 3, 7, 2} // prefix sums of 1, 2, 4, -5
square := func(j, i int) int64 { return (p[i] - p[j]) * (p[i] - p[j]) }
fast, _ := PartitionDP(4, 2, square, true)  // {10 [0 2 4]}: wrong, opt is not monotone
slow, _ := PartitionDP(4, 2, square, false) // {2 [0 1 4]}
```

## Go-Specific Notes

- **`int64`, checked once.** Every number the DP forms is at most the square of the total, and the DP forms that square itself (`dp[1][n]`), so `MinCostPartition` checks while it builds the prefix sums that the total stays at most 3037000499 and returns `ErrOverflow` otherwise; Python returns the exact number there. `PartitionDP` checks every sum it forms, since the costs come from the caller.
- **Errors, not panics.** Bad input comes back through the `error` result with a zero `Partition`; the recursion returns the first overflow error up through every call.
- **A cost is a closure.** The tests pass one that counts its calls: that is how they count the cost evaluations and check the bound. The built-in `min` and `max` clamp the range of `j`, which is why the module asks for Go 1.21.
- **Same output as Python.** `j` is tried upward with a strict `<`; `TestAgreementWithPython` checks the cost and the bounds of both versions on inputs computed by the Python code, including the wrong answers on a failing cost and the number of cost evaluations.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/DP_Optimizations/Divide_and_Conquer_Optimization/Go"
go test ./...
go run main.go   # demo: the worked example and the failing cost
```

## Key Takeaways

1. The middle cell's best `j` bounds both halves of the layer.
2. Return `ErrOverflow` rather than a wrapped-around number.
3. The costs and the bounds agree with the Python and C++ versions.
