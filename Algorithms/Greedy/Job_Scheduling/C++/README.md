# Job Scheduling -- C++ Implementation

The three greedy scheduling rules in C++17: job sequencing with deadlines (profit version), earliest deadline first, and weighted completion time (Smith's rule).

## Files

| File | Contents |
|------|----------|
| `job_scheduling.cpp` | `jobSchedulingDeadline`, `jobSchedulingDeadlineProfitOnly`, `jobSchedulingEarliestDeadline` and `jobSchedulingWeightedCompletionTime` |
| `job_scheduling_test.cpp` | 12 assert-based tests: the deadline examples (basic, negative job id, classic five jobs, empty input and a deadline of 0), the Python tests for EDF and Smith's rule, a processing time of 0, 55 cases whose outputs come from the Python code, seeded random checks against brute force over all subsets (deadline) and all orders (EDF, Smith's rule), and the tie order on 60-job inputs |

## API

| Name | Description |
|------|-------------|
| `std::pair<int, std::vector<int>> jobSchedulingDeadline(std::vector<std::tuple<int, int, int>>& jobs)` | jobs are `(id, deadline, profit)`; returns `(total profit, accepted ids in profit order)`; `{0, {}}` for no jobs |
| `int jobSchedulingDeadlineProfitOnly(std::vector<std::tuple<int, int, int>>& jobs)` | only the total profit |
| `std::vector<int> jobSchedulingEarliestDeadline(const std::vector<std::tuple<int, int, int>>& jobs)` | jobs are `(id, deadline, processing_time)`; returns the ids by deadline, earliest first (`processing_time` is ignored); `{}` for no jobs |
| `std::pair<std::vector<int>, long long> jobSchedulingWeightedCompletionTime(const std::vector<std::tuple<int, int, int>>& jobs)` | jobs are `(id, processing_time, weight)`; returns the ids by `weight / processing_time`, highest first, and the sum of `weight * completion_time`; `{{}, 0}` for no jobs; throws `std::domain_error` if a processing time is 0 |

```cpp
std::vector<std::tuple<int, int, int>> jobs = {{1, 2, 100}, {2, 1, 19}, {3, 2, 27}, {4, 1, 25}, {5, 3, 15}};
auto result = jobSchedulingDeadline(jobs);  // {142, {1, 3, 5}}

auto smith = jobSchedulingWeightedCompletionTime({{1, 3, 1}, {2, 1, 2}, {3, 2, 3}});  // {{2, 3, 1}, 17}
```

## C++-Specific Notes

- In `jobSchedulingDeadline`, `jobs` is a non-const reference and is **sorted in place** by profit: the caller's order changes.
- That `std::sort` is not stable, so among jobs with equal profit the accepted one is unspecified.
- `jobSchedulingEarliestDeadline` and `jobSchedulingWeightedCompletionTime` take a const reference and sort a copy with `std::stable_sort`, so equal keys keep input order, exactly as Python's `sorted` does.
- Smith's rule compares `static_cast<double>(weight) / processing_time`, the same double Python computes, so two ratios that round to one double tie in both. A processing time of 0 throws `std::domain_error` before anything is sorted (Python raises `ZeroDivisionError`).
- The weighted total is a `long long`; it overflows (undefined behaviour) only past about 9.2e18, where Python's integers keep growing.
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

- Deadline version: sorted in place by profit; latest free slot per job.
- EDF and Smith's rule: a stable sort of a copy, so they match Python tie for tie.
- Occupancy is a separate boolean array, not an id sentinel.
- Needs C++14 or newer.
