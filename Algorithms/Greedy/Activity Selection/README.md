# Activity Selection

**Activity Selection Problem** selects the maximum number of non-overlapping activities that can be performed by a single person.

---

## Overview

Given n activities with start and finish times, select the maximum number of activities that don't overlap. This is solved using a greedy approach: always select the activity that finishes earliest.

---

## Algorithm

1. Sort activities by finish time
2. Select first activity (earliest finish)
3. For each remaining activity, if it starts after last selected finishes, select it

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(n log n) | O(1) |

---

## Greedy Choice

**Always select the activity that finishes earliest** - this greedy choice leads to optimal solution.

---

## Implementations

- **Python** (`Python/`) - Complete with variants
- **C++** (`C++/`) - Template-based
- **Go** (`Go/`) - Clean implementation

---

## When to Use

- ✅ Scheduling problems
- ✅ Resource allocation
- ✅ Interval problems

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 16)

---

_Last Updated: December 2025_

