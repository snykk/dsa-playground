# Job Scheduling (Python)

**Job Scheduling** problems involve scheduling jobs to optimize various objectives like profit, lateness, or weighted completion time using greedy strategies.

---

## Overview

Job scheduling is a fundamental optimization problem where we need to assign jobs to time slots to optimize an objective function. Different variants use different greedy strategies based on the objective.

---

## Variants

### 1. Deadline Scheduling (Maximize Profit)

Schedule jobs with deadlines to maximize total profit. Each job takes 1 unit of time.

**Greedy Strategy**: Sort by profit (descending), assign each job to latest available slot before deadline.

**Example**:
- Jobs: (id, deadline, profit) = [(1, 2, 100), (2, 1, 19), (3, 2, 27), (4, 1, 25)]
- Solution: Schedule jobs 1 and 3, profit = 127

### 2. Earliest Deadline First (Minimize Lateness)

Schedule jobs to minimize maximum lateness.

**Greedy Strategy**: Sort by deadline (earliest first).

### 3. Weighted Completion Time (Minimize Weighted Sum)

Minimize weighted sum of completion times.

**Greedy Strategy**: Sort by weight/processing_time ratio (descending).

---

## Algorithm

### Deadline Scheduling

1. Sort jobs by profit (descending)
2. For each job (in sorted order):
   - Find latest available time slot before deadline
   - If slot found, assign job to that slot
   - Otherwise, skip job
3. Return scheduled jobs and total profit

---

## Complexity Analysis

| Variant | Time | Space |
|---------|------|-------|
| **Deadline Scheduling** | O(n²) or O(n log n) | O(n) |
| **Earliest Deadline First** | O(n log n) | O(1) |
| **Weighted Completion Time** | O(n log n) | O(n) |

**Note**: O(n²) for deadline scheduling can be optimized to O(n log n) using Union-Find.

---

## Implementation Details

### Functions

1. **`job_scheduling_deadline(jobs)`**
   - Maximizes profit with deadlines
   - Returns (max_profit, scheduled_job_ids)
   - Time: O(n²), Space: O(n)

2. **`job_scheduling_earliest_deadline(jobs)`**
   - Minimizes maximum lateness
   - Returns list of scheduled job IDs
   - Time: O(n log n), Space: O(n)

3. **`job_scheduling_weighted_completion_time(jobs)`**
   - Minimizes weighted sum of completion times
   - Returns (scheduled_job_ids, total_weighted_completion_time)
   - Time: O(n log n), Space: O(n)

---

## Greedy Choice

**Deadline Scheduling**: Always schedule highest profit job that can be scheduled.

**Why it works**:
- If we can schedule a high-profit job, we should
- Scheduling it at latest possible time leaves more slots for other jobs
- This greedy choice leads to optimal solution

---

## Usage

```python
from job_scheduling import (
    job_scheduling_deadline,
    job_scheduling_earliest_deadline,
    job_scheduling_weighted_completion_time
)

# Deadline scheduling (maximize profit)
jobs = [(1, 2, 100), (2, 1, 19), (3, 2, 27), (4, 1, 25), (5, 3, 15)]
profit, scheduled = job_scheduling_deadline(jobs)
print(f"Max profit: {profit}")  # 142
print(f"Scheduled jobs: {scheduled}")  # [1, 3, 4]

# Earliest deadline first
jobs_edf = [(1, 4, 5), (2, 2, 3), (3, 6, 4)]
scheduled = job_scheduling_earliest_deadline(jobs_edf)
print(f"Scheduled: {scheduled}")  # [2, 1, 3]

# Weighted completion time
jobs_weighted = [(1, 3, 10), (2, 1, 20), (3, 2, 15)]
scheduled, total = job_scheduling_weighted_completion_time(jobs_weighted)
print(f"Total weighted: {total}")
```

---

## Important Notes

1. **Time slots**: Each job takes 1 unit of time
2. **Deadlines**: Job must finish by its deadline
3. **Profit**: Only scheduled jobs contribute to profit
4. **Optimization**: Can use Union-Find to optimize deadline scheduling to O(n log n)

---

## Advantages

1. ✅ **Optimal**: Greedy gives optimal solution for these variants
2. ✅ **Efficient**: O(n log n) for most variants
3. ✅ **Practical**: Models real scheduling problems

---

## Disadvantages

1. ❌ **Limited variants**: Only works for specific problem formulations
2. ❌ **Deadline scheduling**: O(n²) naive, needs optimization for O(n log n)
3. ❌ **Constraints**: Assumes each job takes 1 unit time

---

## When to Use

- ✅ Scheduling with deadlines and profits
- ✅ Minimizing lateness
- ✅ Weighted completion time optimization
- ❌ When jobs have different processing times (more complex)
- ❌ When multiple resources available (different problem)

---

## Testing

```bash
python job_scheduling_test.py
```

---

## Related Algorithms

- **Activity Selection**: Similar interval scheduling
- **Interval Scheduling**: Related scheduling problems
- **Resource Allocation**: Similar optimization problems

---

## Applications

1. **CPU Scheduling**: Operating system job scheduling
2. **Task Assignment**: Assign tasks to workers
3. **Project Management**: Schedule project tasks
4. **Manufacturing**: Schedule production jobs

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 16)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

