# Job Scheduling (Go)

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

1. **`JobSchedulingDeadline(jobs)`**
   - Maximizes profit with deadlines
   - Takes slice of slices: [job_id, deadline, profit]
   - Returns (max_profit, scheduled_job_ids)
   - Time: O(n²), Space: O(n)

---

## Usage

```go
package main

import (
    "fmt"
    "sort"
)

func main() {
    // Jobs: [job_id, deadline, profit]
    jobs := [][]int{
        {1, 2, 100}, {2, 1, 19}, {3, 2, 27}, {4, 1, 25}, {5, 3, 15},
    }
    
    profit, scheduled := JobSchedulingDeadline(jobs)
    fmt.Printf("Max profit: %d\n", profit)  // 142
    fmt.Printf("Scheduled jobs: %v\n", scheduled)  // [1 3 4]
}
```

---

## Important Notes

1. **Time slots**: Each job takes 1 unit of time
2. **Deadlines**: Job must finish by its deadline
3. **Profit**: Only scheduled jobs contribute to profit
4. **Optimization**: Can use Union-Find to optimize deadline scheduling to O(n log n)
5. **Go slices**: Use [][]int for job representation

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

Run the test suite:

```bash
go test -v
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
