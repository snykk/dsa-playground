# Activity Selection (Python)

**Activity Selection Problem** is a classic greedy algorithm problem that selects the maximum number of non-overlapping activities that can be performed by a single person, assuming that a person can only work on a single activity at a time.

---

## Overview

Given n activities with their start and finish times, we want to select the maximum number of activities that don't overlap. This problem demonstrates the greedy choice property: always selecting the activity that finishes earliest leads to an optimal solution.

**Example**:
- Activities: [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)]
- Sorted by finish: [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)]
- Selected: Activities at indices 0, 3, 4 (finish at 4, 7, 9)
- Maximum: 3 activities

---

## Algorithm

1. **Sort**: Sort all activities by finish time (ascending)
2. **Initialize**: Select first activity (earliest finish time)
3. **Greedy Selection**: For each remaining activity:
   - If activity starts after last selected finishes: select it
   - Otherwise: skip it (overlaps with last selected)
4. **Result**: Return indices of selected activities

**Key Insight**: By always choosing the activity that finishes earliest, we leave maximum time for remaining activities.

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(n log n) | O(1) |

**Note**: 
- O(n log n) is for sorting activities by finish time
- Selection itself is O(n) after sorting
- Space is O(1) excluding output array

---

## Implementation Details

### Functions

1. **`activity_selection(activities)`**
   - Standard greedy activity selection
   - Returns list of selected activity indices (0-indexed)
   - Time: O(n log n), Space: O(1) excluding output

2. **`activity_selection_with_weights(activities)`**
   - Activity selection with weights (maximize total weight)
   - Uses dynamic programming (greedy doesn't work here)
   - Returns maximum total weight
   - Time: O(n²), Space: O(n)

3. **`activity_selection_recursive(activities)`**
   - Recursive implementation
   - More intuitive but less efficient
   - Time: O(n log n), Space: O(n) for recursion stack

---

## Greedy Choice

**Always select the activity that finishes earliest** among remaining activities. This greedy choice leads to optimal solution.

**Why it works**:
1. **Greedy Choice Property**: If there's an optimal solution, we can always replace the first activity with the earliest-finishing one
2. **Optimal Substructure**: After selecting earliest-finishing activity, remaining problem is similar
3. **Proof**: If we don't select earliest-finishing activity, we can swap it with first activity in optimal solution without reducing count

---

## Usage

```python
from activity_selection import (
    activity_selection,
    activity_selection_with_weights,
    activity_selection_recursive
)

# Standard activity selection
activities = [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)]
selected = activity_selection(activities)
print(selected)  # Output: [0, 3, 4] (indices of selected activities)

# With weights (uses DP)
activities_weighted = [(1, 4, 10), (3, 5, 5), (0, 6, 15), (5, 7, 7)]
max_weight = activity_selection_with_weights(activities_weighted)
print(max_weight)  # Output: Maximum total weight

# Recursive version
selected = activity_selection_recursive(activities)
print(selected)  # Output: [0, 3, 4]
```

---

## Important Notes

1. **Sorting is crucial**: Must sort by finish time, not start time
2. **Overlap check**: Activity (s, f) overlaps with (s', f') if s < f' and s' < f
3. **Greedy optimal**: Greedy approach gives optimal solution for maximum count
4. **Weights require DP**: If activities have weights, greedy may not work
5. **Index preservation**: Returns original indices, not sorted positions

---

## Advantages

1. ✅ **Optimal**: Greedy gives optimal solution
2. ✅ **Efficient**: O(n log n) time complexity
3. ✅ **Simple**: Easy to understand and implement
4. ✅ **Space efficient**: O(1) space excluding output

---

## Disadvantages

1. ❌ **Only for count**: Greedy works for maximum count, not maximum weight
2. ❌ **Sorting overhead**: Requires sorting step
3. ❌ **Single resource**: Assumes one person/resource

---

## When to Use

- ✅ **Maximum count**: When goal is to maximize number of activities
- ✅ **Non-overlapping**: When activities cannot overlap
- ✅ **Single resource**: When only one person/resource available
- ❌ **Maximum weight**: Use DP for weighted version
- ❌ **Multiple resources**: Different problem (assignment)

---

## Comparison: Greedy vs DP

| Aspect | Greedy (Count) | DP (Weight) |
|--------|----------------|-------------|
| **Objective** | Maximize count | Maximize weight |
| **Time** | O(n log n) | O(n²) |
| **Optimality** | Always optimal | Always optimal |
| **When** | Simple count | Weighted activities |

---

## Testing

Run the test suite:

```bash
python activity_selection_test.py
```

---

## Related Algorithms

- **Interval Scheduling**: Similar problem with different constraints
- **Job Scheduling**: Related scheduling with deadlines
- **Greedy Coloring**: Graph coloring with greedy approach
- **Meeting Rooms**: Similar interval problem

---

## Applications

1. **Resource Scheduling**: Schedule tasks on single resource
2. **Meeting Room Booking**: Book maximum non-overlapping meetings
3. **CPU Scheduling**: Schedule processes without overlap
4. **Event Planning**: Select maximum non-conflicting events

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 16)
- "Algorithm Design Manual" by Steven Skiena
- LeetCode Problem 435: Non-overlapping Intervals

---

_Last Updated: December 2025_

