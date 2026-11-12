# Binary Search on Answer -- Go Implementation

Binary search over the answer range with a greedy feasibility check. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `main.go` | The search, three problems and a demo `main` |
| `main_test.go` | One test per problem plus the infeasible case |
| `go.mod` | Module definition |

## API

- `binarySearchAnswer(left, right int, condition func(int) bool) int`: smallest value with `condition` true, or `-1`.
- `findMinCapacity(weights []int, days int) int`
- `findKthSmallestDistance(nums []int, k int) int`: sorts a copy; `-1` if fewer than `k` pairs.
- `splitArrayLargestSum(nums []int, m int) int`

## Go-Specific Notes

- `int` is 64 bits on common platforms, so overflow is unlikely, but `mid` is still computed as `left + (right-left)/2`.
- Feasibility checks are closures over the input slice.
- `sort.Search` in the standard library does the same boundary search over `[0, n)`; this code spells the loop out to show the pattern.
- Empty input is not guarded: `findMinCapacity` returns 0 and `findKthSmallestDistance` panics on an empty slice.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- A monotone predicate is the whole requirement.
- Closures make the check cheap to write and inline.
- Return `-1` for "no feasible answer".
