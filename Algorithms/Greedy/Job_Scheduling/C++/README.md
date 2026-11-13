# Job Scheduling -- C++ Implementation

Job sequencing with deadlines (profit version) in C++17.

## Files

| File | Contents |
|------|----------|
| `job_scheduling.cpp` | `jobSchedulingDeadline` and `jobSchedulingDeadlineProfitOnly` |
| `job_scheduling_test.cpp` | 4 assert-based tests (basic, negative job id, the classic five-job example, empty input and a deadline of 0) |

## API

| Name | Description |
|------|-------------|
| `std::pair<int, std::vector<int>> jobSchedulingDeadline(std::vector<std::tuple<int, int, int>>& jobs)` | jobs are `(id, deadline, profit)`; returns `(total profit, accepted ids in profit order)`; `{0, {}}` for no jobs |
| `int jobSchedulingDeadlineProfitOnly(std::vector<std::tuple<int, int, int>>& jobs)` | only the total profit |

```cpp
std::vector<std::tuple<int, int, int>> jobs = {{1, 2, 100}, {2, 1, 19}, {3, 2, 27}, {4, 1, 25}, {5, 3, 15}};
auto result = jobSchedulingDeadline(jobs);  // {142, {1, 3, 5}}
```

Only the deadline version exists in C++. The earliest-deadline-first and weighted-completion-time variants are Python only.

## C++-Specific Notes

- `jobs` is a non-const reference and is **sorted in place** by profit: the caller's order changes.
- `std::sort` is not stable, so among jobs with equal profit the accepted one is unspecified.
- Slot usage is kept in a `std::vector<bool>`, so job ids may be any `int` (an id of -1 used to break the older "empty marker" approach).
- The slot vector has `maxDeadline + 1` entries, so a very large deadline allocates a lot of memory. A deadline of 0 or less is never scheduled.
- The sort uses a generic lambda, which needs C++14 or newer: compile with `-std=c++17`.

## How to Run

```bash
cd "Algorithms/Greedy/Job_Scheduling/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD job_scheduling_test.cpp -o job_test
./job_test
```

## Key Takeaways

- Sorted in place by profit; latest free slot per job.
- Occupancy is a separate boolean array, not an id sentinel.
- Needs C++14 or newer.
