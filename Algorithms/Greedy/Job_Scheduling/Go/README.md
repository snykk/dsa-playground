# Job Scheduling -- Go Implementation

The three greedy scheduling rules in Go: job sequencing with deadlines (profit version), earliest deadline first, and weighted completion time (Smith's rule).

## Files

| File | Contents |
|------|----------|
| `main.go` | `JobSchedulingDeadline`, `JobSchedulingEarliestDeadline`, `JobSchedulingWeightedCompletionTime` and `ErrZeroProcessingTime` (`package main`, no `main` function) |
| `main_test.go` | 12 tests: the deadline examples (basic, classic five jobs, empty input and a deadline of 0, negative job id), the Python tests for EDF and Smith's rule, a processing time of 0, 55 cases whose outputs come from the Python code, seeded random checks against brute force over all subsets (deadline) and all orders (EDF, Smith's rule), and the tie order on 60-job inputs |
| `go.mod` | module definition |

## API

| Name | Description |
|------|-------------|
| `JobSchedulingDeadline(jobs [][]int) (int, []int)` | each job is `{id, deadline, profit}`; returns the total profit and the accepted ids in profit order; `(0, [])` for no jobs |
| `JobSchedulingEarliestDeadline(jobs [][]int) []int` | each job is `{id, deadline, processingTime}`; returns the ids by deadline, earliest first (`processingTime` is ignored); `[]` for no jobs |
| `JobSchedulingWeightedCompletionTime(jobs [][]int) ([]int, int, error)` | each job is `{id, processingTime, weight}`; returns the ids by `weight / processingTime`, highest first, and the sum of `weight * completion time`; `([], 0, nil)` for no jobs; `(nil, 0, ErrZeroProcessingTime)` if a processing time is 0 |

```go
jobs := [][]int{{1, 2, 100}, {2, 1, 19}, {3, 2, 27}, {4, 1, 25}, {5, 3, 15}}
profit, scheduled := JobSchedulingDeadline(jobs) // 142, [1 3 5]

order, total, err := JobSchedulingWeightedCompletionTime([][]int{{1, 3, 1}, {2, 1, 2}, {3, 2, 3}}) // [2 3 1], 17, nil
```

## Go-Specific Notes

- `JobSchedulingDeadline` **sorts `jobs` in place** by profit with `sort.Slice`: the caller's slice changes order. Among equal profits the order is unspecified (the sort is not stable).
- `JobSchedulingEarliestDeadline` and `JobSchedulingWeightedCompletionTime` sort a copy with `sort.SliceStable`, so equal keys keep input order, exactly as Python's `sorted` does.
- Smith's rule compares `float64(weight) / float64(processingTime)`, the same float Python computes for values up to 2^53, so two ratios that round to one float tie in both. A processing time of 0 returns `ErrZeroProcessingTime` (compare with `errors.Is`) where Python raises `ZeroDivisionError`.
- The weighted total is an `int` and wraps around silently past 2^63 - 1; Python's integers keep growing.
- Each row must have at least three elements; a shorter row panics with an index out of range.
- Slot usage is kept in a `[]bool`, so job ids may be any `int` (an id of -1 used to break the older "empty marker" approach).
- The slot slice has `maxDeadline+1` entries, so a very large deadline allocates a lot of memory. A deadline of 0 or less is never scheduled.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Greedy/Job_Scheduling/Go"
go test ./...
```

## Key Takeaways

- The deadline version sorts the input slice in place by profit; EDF and Smith's rule sort a stable copy and match Python tie for tie.
- Occupancy is a separate `[]bool`, not an id sentinel.
- Rows are `{id, deadline, profit}`, always three values.
