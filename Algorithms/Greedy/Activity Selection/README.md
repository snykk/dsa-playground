# Activity Selection

Activity selection picks the largest set of pairwise non-overlapping activities from a list of `(start, finish)` intervals. Sorting by finish time and taking every activity that fits is optimal, in O(n log n) time.

## Intuition

One person can do one thing at a time. Every activity you accept blocks everyone who overlaps it, so you want to block as little future time as possible: take the activity that finishes first, then the first activity after it that fits, and so on.

Why it is correct (exchange argument): take any optimal schedule and look at its first activity. The earliest-finishing activity ends no later than that one, so swapping it in cannot collide with the rest of the schedule and the count does not change. So some optimal schedule contains the greedy choice, and what is left is the same problem on the activities that start at or after that finish. Repeat.

## Visual

```text
time:      0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16
i0 1-4        [-------]
i1 3-5              [----]
i2 0-6     [----------------]
i3 5-7                    [----]
i4 3-9              [----------------]
i5 5-9                    [----------]
i6 6-10                      [----------]
i7 8-11                            [-------]
i8 8-12                            [----------]
i9 2-14          [----------------------------------]
i10 12-16                                      [----------]

picked: i0 (1-4), i3 (5-7), i7 (8-11), i10 (12-16)
```

## How It Works

1. Sort the activities by finish time, keeping each one's original index.
2. Select the first activity and remember its finish time as `last_finish`.
3. For every later activity: if `start >= last_finish`, select it and update `last_finish`; otherwise skip it.
4. Return the selected original indices.

Touching activities are compatible: `1-2` and `2-3` can both be selected.

## Step-by-Step Trace

The 11 activities above (already in finish order):

| Activity | start-finish | last_finish before | Decision |
|----------|--------------|--------------------|----------|
| i0 | 1-4 | none | select, last_finish = 4 |
| i1 | 3-5 | 4 | skip (3 < 4) |
| i2 | 0-6 | 4 | skip |
| i3 | 5-7 | 4 | select (5 >= 4), last_finish = 7 |
| i4 | 3-9 | 7 | skip |
| i5 | 5-9 | 7 | skip |
| i6 | 6-10 | 7 | skip |
| i7 | 8-11 | 7 | select (8 >= 7), last_finish = 11 |
| i8 | 8-12 | 11 | skip |
| i9 | 2-14 | 11 | skip |
| i10 | 12-16 | 11 | select (12 >= 11) |

`activity_selection` returns `[0, 3, 7, 10]`.

## Complexity

| Quantity | Cost | Why |
|----------|------|-----|
| Time | O(n log n) | the sort; the scan is O(n), so presorted input costs O(n) |
| Space | O(n) | an indexed, sorted copy of the input, plus the output |

The weighted variant (Python only) is O(n^2): for each activity it scans backwards for the last compatible one. A binary search would make it O(n log n); the code does not do that. The recursive Python variant is O(n^2) time and space (it copies the remaining list in every call) and recurses n levels deep.

## When to Use

Use it to maximise the number of non-overlapping intervals on one resource: meeting rooms, one machine, one antenna. It also answers "what is the fewest intervals to remove so the rest do not overlap" (n minus the answer).

Do not use it when activities have weights (use dynamic programming), when there are several resources, or when the goal is to schedule everything with as few resources as possible.

## Activity Selection vs. Other Rules

Sorting by finish time is the only one of the obvious greedy rules that is optimal:

| Rule | Counterexample (start-finish) | Rule picks | Optimum |
|------|-------------------------------|------------|---------|
| Earliest start | 0-10, 1-2, 3-4 | 1 activity | 2 activities |
| Shortest duration | 0-5, 4-6, 5-10 | 1 activity | 2 activities |
| Earliest finish | any input | optimal | optimal |

For weights: `(1, 4, 10)`, `(3, 5, 5)`, `(0, 6, 15)`, `(5, 7, 7)` have best total weight 17 (`(1, 4)` and `(5, 7)`), while the single activity `(0, 6)` is worth 15. The Python function `activity_selection_with_weights` computes 17 by dynamic programming.

## Common Pitfalls

- **Sorting by start time or by duration.** Both are wrong; see the counterexamples above.
- **`>` instead of `>=`.** Activities that touch are compatible.
- **Losing the original indices** after sorting. The code sorts `(index, activity)` pairs.
- **A real time as the "nothing selected" sentinel.** A start value of -1 or 0 breaks inputs with negative times (the Python recursive version once started `last_finish` at -1). Start from negative infinity, or from the first selected activity.
- **Ties.** Among activities with the same finish time, Python (stable sort) picks the one that comes first in the input; C++ `std::sort` and Go `sort.Slice` are not stable, so the chosen index is unspecified. The count is the same.
- **Using it for weights.** It gives wrong answers.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `activity_selection.py` | `activity_selection`, `activity_selection_with_weights` (DP), `activity_selection_recursive` |
| C++ | [C++/](C++/) | `activity_selection.cpp` | `activitySelection` only; takes a `std::vector<std::pair<int, int>>` |
| Go | [Go/](Go/) | `main.go` | `ActivitySelection` only; takes `[]Activity` |

## Practice Problems

- [Movie Festival](https://cses.fi/problemset/task/1629) (CSES)
- [Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/) (LeetCode 435)
- [Minimum Number of Arrows to Burst Balloons](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/) (LeetCode 452)
- [Maximum Profit in Job Scheduling](https://leetcode.com/problems/maximum-profit-in-job-scheduling/) (LeetCode 1235, the weighted version)
- [Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii/) (LeetCode 253, a related problem)

## Related

- [Job Scheduling](../Job%20Scheduling/) - greedy scheduling with deadlines and profits
- [Fractional Knapsack](../Fractional%20Knapsack/) - another greedy that sorts by a ratio
- [0-1 Knapsack](../../Dynamic_Programming/2D%20DP/0-1%20Knapsack/) - where greedy stops working and dynamic programming takes over
- [Greedy algorithms overview](../)
