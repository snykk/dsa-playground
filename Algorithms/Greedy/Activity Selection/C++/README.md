# Activity Selection (C++)

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

1. **`activitySelection(activities)`**
   - Standard greedy activity selection
   - Takes vector of pairs (start_time, finish_time)
   - Returns vector of selected activity indices (0-indexed)
   - Time: O(n log n), Space: O(1) excluding output

### Data Structures

- **`std::vector<std::pair<int, int>>`**: Activities as (start, finish) pairs
- **`std::vector<int>`**: Selected activity indices

---

## Usage

```cpp
#include <vector>
#include <algorithm>
#include "activity_selection.cpp"

int main() {
    // Activities: (start_time, finish_time)
    std::vector<std::pair<int, int>> activities = {
        {1, 4}, {3, 5}, {0, 6}, {5, 7}, {8, 9}, {5, 9}
    };
    
    std::vector<int> selected = activitySelection(activities);
    
    // Print selected activities
    std::cout << "Selected activities: ";
    for (int idx : selected) {
        std::cout << idx << " ";
    }
    std::cout << "\n";
    // Output: Selected activities: 0 3 4
    
    return 0;
}
```

---

## Important Notes

1. **Sorting is crucial**: Must sort by finish time, not start time
2. **Overlap check**: Activity (s, f) overlaps with (s', f') if s < f' and s' < f
3. **Greedy optimal**: Greedy approach gives optimal solution for maximum count
4. **Index preservation**: Returns original indices, not sorted positions
5. **C++ sorting**: Use std::sort with custom comparator

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

## Compilation

```bash
g++ -std=c++11 activity_selection.cpp activity_selection_test.cpp -o test
./test
```

---

## Testing

Run the test suite:

```bash
g++ -std=c++11 activity_selection_test.cpp -o test && ./test
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
