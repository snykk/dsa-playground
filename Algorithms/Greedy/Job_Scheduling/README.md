# Job Scheduling

Job scheduling orders jobs on one machine. The main problem here is job sequencing with deadlines: every job takes one unit of time, has a deadline and a profit, and the goal is the largest total profit. Taking jobs by decreasing profit and giving each the latest free slot before its deadline is optimal, in O(n log n + n * min(D, n) + D) time, where D is the largest deadline. Two sorting-based variants (earliest deadline first, and weighted completion time) are implemented too, in all three languages.

## Intuition

Picture a calendar with one box per day up to the last deadline. A job may sit in any box on or before its deadline, and you earn its profit only if it gets a box. Try the most profitable job first. Put it as late as its deadline allows, so the early boxes stay free for jobs with tight deadlines. A job that finds every box up to its deadline taken is dropped.

Why it is correct: a set of jobs can all finish exactly when, for every time `t`, at most `t` of them have a deadline of `t` or earlier. Sets with this property satisfy an exchange rule (they form a matroid), and for such sets, taking elements by decreasing weight and keeping each one that leaves the set feasible gives a maximum-weight set. The tests compare the result with brute force on small random inputs.

## Visual

```text
Jobs (id, deadline, profit): a (2, 100)  b (1, 19)  c (2, 27)  d (1, 25)  e (3, 15)
By profit: a 100, c 27, d 25, b 19, e 15

slots:       1     2     3
start      [  ] [  ] [  ]
a (d=2)    [  ] [a ] [  ]     slot 2 is free
c (d=2)    [c ] [a ] [  ]     slot 2 taken, slot 1 free
d (d=1)    [c ] [a ] [  ]     slot 1 taken: rejected
b (d=1)    [c ] [a ] [  ]     slot 1 taken: rejected
e (d=3)    [c ] [a ] [e ]     slot 3 free

profit = 100 + 27 + 15 = 142
```

## How It Works

Deadline version (`job_scheduling_deadline`):

1. Sort the jobs by profit, highest first.
2. Make one empty slot for each time unit from 1 to the largest deadline.
3. For each job, scan from its deadline down to slot 1 and put the job in the first empty slot. If none is free, skip the job.
4. Return the total profit and the ids of the placed jobs.

The other two variants are one sort each (same names in camelCase in C++ and Go):

- `job_scheduling_earliest_deadline` sorts by deadline (earliest deadline first, EDF) and returns the order of ids. It ignores `processing_time` and does not compute lateness.
- `job_scheduling_weighted_completion_time` sorts by `weight / processing_time`, highest first (Smith's rule), and returns the order and the sum of `weight * completion_time`.

## Step-by-Step Trace

The five jobs above, ids 1 to 5 for a to e (the code returns `(142, [1, 3, 5])`):

| Job | Deadline | Profit | Slots tried | Result |
|-----|----------|--------|-------------|--------|
| a (1) | 2 | 100 | 2 | placed in slot 2 |
| c (3) | 2 | 27 | 2, 1 | placed in slot 1 |
| d (4) | 1 | 25 | 1 | rejected |
| b (2) | 1 | 19 | 1 | rejected |
| e (5) | 3 | 15 | 3 | placed in slot 3 |

The returned list is the order in which jobs were accepted (by decreasing profit), not the order of the slots.

Smith's rule on `(id, processing_time, weight)` = `(J1, 3, 1)`, `(J2, 1, 2)`, `(J3, 2, 3)`:

| Order | Completion times | Sum of weight * completion |
|-------|------------------|----------------------------|
| J1, J2, J3 | 3, 4, 6 | 1*3 + 2*4 + 3*6 = 29 |
| J2, J3, J1 (Smith) | 1, 3, 6 | 2*1 + 3*3 + 1*6 = 17 |

## Complexity

| Variant | Time | Space | Why |
|---------|------|-------|-----|
| Deadline, profit | O(n log n + n * min(D, n) + D) | O(n + D) | sort, then each job scans at most min(D, n) slots; the D + 1 slots cost O(D) to create; worst case O(n^2) when D is about n |
| Earliest deadline first | O(n log n) | O(n) | one sort |
| Weighted completion time | O(n log n) | O(n) | one sort |

D is the largest deadline. The slot array has one entry per time unit, so memory depends on the value of the largest deadline: a deadline of 1,000,000,000 allocates a billion slots. Clamping deadlines to `n` would be safe (at most `n` slots can be used) but the code does not do it. A union-find over the slots, pointing each slot to the next free one below it, would make placement near O(n alpha(n)) after the sort; it is not implemented.

## When to Use

Use the deadline version when every task takes one time unit, has a hard deadline and a payoff, and you can accept only some of them. Use EDF to order tasks on one machine by urgency and Smith's rule to minimize the weighted sum of completion times. Do not use the deadline greedy when jobs have different lengths (the problem becomes harder and needs other methods such as dynamic programming).

## Job Scheduling vs. Activity Selection

| | Job Scheduling (deadlines) | Activity Selection |
|--|----------------------------|--------------------|
| Job timing | any free slot up to the deadline | fixed start and finish |
| Goal | maximum total profit | maximum number of activities |
| Sort key | profit, descending | finish time, ascending |
| Time | O(n log n + n * min(D, n) + D) | O(n log n) |

## Common Pitfalls

- **A real value as the empty marker.** Using -1 for "empty" while storing ids broke jobs with id -1 (fixed: `None` in Python, a `bool` array in C++ and Go).
- **Reading the result as a timetable.** It lists accepted jobs in profit order, not slot order.
- **Huge deadlines** allocate that many slots.
- **Deadline of 0 or less:** the job is never scheduled.
- **Negative profits** are not skipped: a job with a negative profit is still placed when a slot is free, which lowers the total.
- **Ties in profit.** Python's sort is stable (input order wins); the C++ and Go deadline functions use an unstable sort, so which tied job is chosen is unspecified. EDF and Smith's rule sort stably in all three languages, so equal keys keep input order.
- **Input order.** The C++ and Go deadline functions sort the vector or slice you pass in; the other two sort a copy.
- **Smith's rule with `processing_time` 0** raises `ZeroDivisionError` in Python; C++ throws `std::domain_error` and Go returns `ErrZeroProcessingTime`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `job_scheduling.py` | all three variants; sorts copies |
| C++ | [C++/](C++/) | `job_scheduling.cpp` | all three variants (`jobSchedulingDeadline` with `jobSchedulingDeadlineProfitOnly`, `jobSchedulingEarliestDeadline`, `jobSchedulingWeightedCompletionTime`); the deadline function sorts the input in place |
| Go | [Go/](Go/) | `main.go` | all three variants (`JobSchedulingDeadline`, `JobSchedulingEarliestDeadline`, `JobSchedulingWeightedCompletionTime`) on `[][]int` rows; the deadline function sorts the input in place |

## Practice Problems

- [Course Schedule III](https://leetcode.com/problems/course-schedule-iii/) (LeetCode 630)
- [Maximum Number of Events That Can Be Attended](https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended/) (LeetCode 1353)
- [Maximum Profit in Job Scheduling](https://leetcode.com/problems/maximum-profit-in-job-scheduling/) (LeetCode 1235, the weighted interval version)

## Related

- [Activity Selection](../Activity_Selection/) - fixed intervals, maximum count
- [Fractional Knapsack](../Fractional_Knapsack/) - another greedy that sorts by a ratio
- [Huffman Coding](../Huffman_Coding/) - another greedy that repeatedly takes the smallest items
- [Disjoint Set Union](../../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/) - the structure behind the faster slot search
- [Greedy algorithms overview](../)
