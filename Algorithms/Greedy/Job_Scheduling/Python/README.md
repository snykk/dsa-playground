# Job Scheduling -- Python Implementation

Three greedy scheduling functions: profit with deadlines, earliest deadline first, and weighted completion time.

## Files

| File | Contents |
|------|----------|
| `job_scheduling.py` | the three functions below |
| `job_scheduling_test.py` | 7 `unittest` tests (classic example, negative job id, edge cases, brute force over subsets and over permutations, EDF, Smith's rule) |

## API

| Function | Input tuple | Returns |
|----------|-------------|---------|
| `job_scheduling_deadline(jobs)` | `(job_id, deadline, profit)` | `(total_profit, scheduled_ids)`; ids in acceptance order (profit descending); `(0, [])` for no jobs |
| `job_scheduling_earliest_deadline(jobs)` | `(job_id, deadline, processing_time)` | the ids sorted by deadline; `processing_time` is ignored; `[]` for no jobs |
| `job_scheduling_weighted_completion_time(jobs)` | `(job_id, processing_time, weight)` | `(ordered_ids, sum of weight * completion_time)`; `([], 0)` for no jobs |

```python
from job_scheduling import job_scheduling_deadline, job_scheduling_weighted_completion_time

job_scheduling_deadline([(1, 2, 100), (2, 1, 19), (3, 2, 27), (4, 1, 25), (5, 3, 15)])
# (142, [1, 3, 5])
job_scheduling_weighted_completion_time([("J1", 3, 1), ("J2", 1, 2), ("J3", 2, 3)])
# (['J2', 'J3', 'J1'], 17)
```

## Python-Specific Notes

- All functions sort a copy; the stable `sorted` keeps input order among ties.
- The slot list uses `None` for "empty", so any value (including -1) works as a job id.
- The slot list has `max_deadline + 1` entries: a huge deadline means a huge list.
- A job with a negative profit is still scheduled when a slot is free.
- `job_scheduling_weighted_completion_time` raises `ZeroDivisionError` when a `processing_time` is 0.
- The C++ and Go versions have only the deadline function.

## How to Run

```bash
cd "Algorithms/Greedy/Job_Scheduling/Python"
python3 -m unittest job_scheduling_test
```

## Key Takeaways

- Profit first, latest free slot: O(n log n + n * min(D, n)).
- The two other variants are plain sorts with the right key.
- The returned id list is not a timetable.
