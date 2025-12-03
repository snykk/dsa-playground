# Segment Tree

A **Segment Tree** is a tree data structure used for storing information about intervals (segments). It allows answering range queries efficiently while still being flexible enough to allow point updates.

---

## Overview

Segment Trees are essential for competitive programming, especially for problems involving:
- Range sum queries
- Range minimum/maximum queries
- Range update queries (with lazy propagation)

---

## Structure Example

For array `[1, 3, 5, 7, 9, 11]` (indices 0-5), Segment Tree structure:

```
                    [0-5] = 36
                   /          \
            [0-2] = 9        [3-5] = 27
           /      \          /      \
      [0-1] = 4  [2] = 5  [3-4] = 16  [5] = 11
     /      \                    /      \
  [0] = 1  [1] = 3          [3] = 7  [4] = 9
```

**Range Query [1-4] (sum = 3+5+7+9 = 24):**
- Start at root [0-5]
- Go left to [0-2], but need [1-2] → split
- [1] from left child + [2] from left child + [3-4] from right child
- Result: 3 + 5 + 16 = 24 ✓

**Key Points:**
- Each node stores sum of its range
- Leaf nodes store individual array elements
- Internal nodes store sum of their children
- Query time: O(log n) by traversing relevant segments

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `query(l, r)`  | Get sum in range [l, r]        | O(log n)        |
| `update(i, v)` | Update value at index i        | O(log n)        |
| `get(i)`       | Get value at index i           | O(1)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Build     | O(n)            | O(n)            |
| Query     | O(log n)        | O(1)            |
| Update    | O(log n)        | O(1)            |

---

## Applications

- Range sum queries
- Range minimum/maximum queries
- Range update with lazy propagation
- Competitive programming

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

