# Job Scheduling -- Go Implementation

Job sequencing with deadlines (profit version) in Go.

## Files

| File | Contents |
|------|----------|
| `main.go` | `JobSchedulingDeadline` (`package main`, no `main` function) |
| `main_test.go` | 4 tests (basic, negative job id, the classic five-job example, empty input and a deadline of 0) |
| `go.mod` | module definition |

## API

| Name | Description |
|------|-------------|
| `JobSchedulingDeadline(jobs [][]int) (int, []int)` | each job is `{id, deadline, profit}`; returns the total profit and the accepted ids in profit order; `(0, [])` for no jobs |

```go
jobs := [][]int{{1, 2, 100}, {2, 1, 19}, {3, 2, 27}, {4, 1, 25}, {5, 3, 15}}
profit, scheduled := JobSchedulingDeadline(jobs) // 142, [1 3 5]
```

Only the deadline version exists in Go. The earliest-deadline-first and weighted-completion-time variants are Python only.

## Go-Specific Notes

- `jobs` is **sorted in place** by profit with `sort.Slice`: the caller's slice changes order. Among equal profits the order is unspecified (the sort is not stable).
- Each row must have at least three elements; a shorter row panics with an index out of range.
- Slot usage is kept in a `[]bool`, so job ids may be any `int` (an id of -1 used to break the older "empty marker" approach).
- The slot slice has `maxDeadline+1` entries, so a very large deadline allocates a lot of memory. A deadline of 0 or less is never scheduled.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Greedy/Job Scheduling/Go"
go test ./...
```

## Key Takeaways

- The input slice is sorted in place by profit.
- Occupancy is a separate `[]bool`, not an id sentinel.
- Rows are `{id, deadline, profit}`, always three values.
