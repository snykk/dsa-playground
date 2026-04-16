# Segment Tree with Lazy Propagation

A **Segment Tree with Lazy Propagation** extends the regular segment tree by deferring updates to child nodes until they are actually needed. This optimization enables efficient range updates in O(log n) time.

---

## Overview

In a regular segment tree, updating a range of elements requires updating each element individually, leading to O(n log n) time. Lazy propagation solves this by storing pending updates at internal nodes and only propagating them downward ("pushing down") when a query or update needs to access child nodes.

---

## How Lazy Propagation Works

1. **Range Update**: When updating a range, mark the node with a pending (lazy) value instead of recursing into all children.
2. **Push Down**: Before querying or updating a node's children, propagate any pending updates to the children and clear the parent's lazy value.
3. **Range Query**: During a query, push down lazy values as needed so that node values are always accurate when read.

```
Update range [1, 4] with +3:

Before:                          After (lazy values shown in parentheses):
      [0-5] = 36                       [0-5] = 48
     /          \                      /          \
  [0-2] = 9   [3-5] = 27         [0-2] = 15(+3) [3-5] = 33(+3)
                                  (only partially propagated)
```

---

## Operations

| Operation              | Description                          | Time Complexity |
| ---------------------- | ------------------------------------ | --------------- |
| `query(l, r)`          | Get sum in range [l, r]              | O(log n)        |
| `update_range(l, r, v)`| Add v to all elements in [l, r]      | O(log n)        |

---

## Complexity

| Operation    | Time Complexity | Space Complexity |
| ------------ | --------------- | ---------------- |
| Build        | O(n)            | O(n)             |
| Range Query  | O(log n)        | O(log n)         |
| Range Update | O(log n)        | O(log n)         |

---

## Applications

- Range sum/min/max queries with range updates
- Interval scheduling and modification
- Competitive programming problems requiring bulk updates
- Database range operations

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)
