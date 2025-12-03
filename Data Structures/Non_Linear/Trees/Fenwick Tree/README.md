# Fenwick Tree (Binary Indexed Tree)

A **Fenwick Tree** (also known as Binary Indexed Tree) is a data structure that supports efficient range sum queries and point updates. It is simpler and more memory-efficient than Segment Tree for range sum operations.

---

## Overview

Fenwick Tree uses bit manipulation (Least Significant Bit) to efficiently update and query ranges. It's particularly useful in competitive programming for range sum problems.

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `query(l, r)`  | Get sum in range [l, r]        | O(log n)        |
| `prefix_sum(i)`| Get sum from 0 to i            | O(log n)        |
| `update(i, d)` | Add delta to value at index i  | O(log n)        |
| `get(i)`       | Get value at index i           | O(log n)        |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Build     | O(n log n)      | O(n)            |
| Query     | O(log n)        | O(1)            |
| Update    | O(log n)        | O(1)            |
| Space     | O(n)            | O(n)            |

---

## Key Features

- **Memory Efficient**: Uses only O(n) space (vs 4n for Segment Tree)
- **Simple Implementation**: Easier to code than Segment Tree
- **Bit Manipulation**: Uses LSB (Least Significant Bit) for efficient traversal
- **1-indexed**: Internally uses 1-indexed array

---

## LSB (Least Significant Bit) Concept

Fenwick Tree uses LSB to determine which indices to update/query.

**LSB Examples:**
- Index 1: Binary `001` → LSB = 1 (covers range [1])
- Index 2: Binary `010` → LSB = 2 (covers range [1-2])
- Index 3: Binary `011` → LSB = 1 (covers range [3])
- Index 4: Binary `100` → LSB = 4 (covers range [1-4])
- Index 6: Binary `110` → LSB = 2 (covers range [5-6])
- Index 8: Binary `1000` → LSB = 8 (covers range [1-8])

**Structure Example for array [1, 3, 5, 7, 9, 11] (1-indexed):**

```
Index:  1   2   3   4   5   6   7   8
Array: [1] [3] [5] [7] [9] [11]
Fenwick:
  [1] = 1 (covers [1])
  [2] = 4 (covers [1-2]: 1+3)
  [3] = 5 (covers [3])
  [4] = 16 (covers [1-4]: 1+3+5+7)
  [5] = 9 (covers [5])
  [6] = 20 (covers [5-6]: 9+11)
```

**Query Prefix Sum [1-6]:**
- Start at index 6: Add tree[6] = 20
- Remove LSB(6)=2: Go to 6-2=4: Add tree[4] = 16
- Remove LSB(4)=4: Go to 4-4=0: Stop
- Result: 20 + 16 = 36 ✓ (1+3+5+7+9+11)

---

## Comparison with Segment Tree

| Feature         | Segment Tree | Fenwick Tree |
| --------------- | ------------ | ------------ |
| Memory          | 4n           | n            |
| Code Complexity | More complex | Simpler      |
| Range Updates   | Yes (lazy)   | No           |
| Range Min/Max   | Yes          | No           |
| Range Sum       | Yes          | Yes          |

**Use Fenwick Tree when**: You only need range sum queries
**Use Segment Tree when**: You need range min/max or range updates

---

## Applications

- Range sum queries
- Point updates
- Inversion count problems
- Competitive programming

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

