# Sparse Table

A **Sparse Table** is a static data structure that supports O(1) range minimum/maximum queries (RMQ) after O(n log n) preprocessing. It is the fastest data structure for RMQ queries on static arrays.

---

## Overview

Sparse Tables are essential for competitive programming when you need fast range queries on static arrays (no updates). They provide O(1) query time, which is faster than Segment Trees (O(log n)) for RMQ.

**Key Characteristics:**
- **O(1) Query Time**: Fastest possible for RMQ
- **O(n log n) Preprocessing**: Build time is O(n log n)
- **Static Structure**: Array cannot be modified after construction
- **No Updates**: Cannot update array elements

---

## Structure Example

For array `[1, 3, 5, 7, 9, 11, 2, 4, 6, 8]`, Sparse Table structure:

**Table[i][j] = min/max of range starting at i with length 2^j**

```
Length 1 (2^0): [1] [3] [5] [7] [9] [11] [2] [4] [6] [8]
Length 2 (2^1): [1,3] [3,5] [5,7] [7,9] [9,11] [11,2] [2,4] [4,6] [6,8]
Length 4 (2^2): [1,3,5,7] [3,5,7,9] [5,7,9,11] [7,9,11,2] [9,11,2,4] [11,2,4,6] [2,4,6,8]
Length 8 (2^3): [1,3,5,7,9,11,2,4] [3,5,7,9,11,2,4,6] [5,7,9,11,2,4,6,8]
```

**Query [2-7] (min of indices 2-7):**
- Length = 7 - 2 + 1 = 6
- k = floor(log2(6)) = 2 (use length 4)
- Query two overlapping ranges of length 4:
  - Range [2-5]: min(5, 7, 9, 11) = 5
  - Range [4-7]: min(9, 11, 2, 4) = 2
- Result: min(5, 2) = 2 ✓

**Key Points:**
- Table stores min/max for ranges of power-of-2 lengths
- Query uses two overlapping ranges to cover any range
- O(1) query by using precomputed values

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `query(l, r)`  | Get min/max in range [l, r]    | O(1)            |
| `get(i)`       | Get value at index i           | O(1)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Build     | O(n log n)      | O(n log n)       |
| Query     | O(1)            | O(1)             |
| Update    | Not supported   | -                |

---

## Comparison with Other Structures

| Feature         | Sparse Table | Segment Tree | Fenwick Tree |
| --------------- | ------------ | ------------ | ------------ |
| Query Time      | O(1)         | O(log n)     | O(log n)     |
| Build Time      | O(n log n)   | O(n)         | O(n log n)   |
| Update          | No           | Yes (O(log n))| Yes (O(log n))|
| Space           | O(n log n)   | O(n)         | O(n)         |
| Use Case        | Static RMQ   | Dynamic      | Range Sum    |

**Use Sparse Table when:**
- Array is static (no updates)
- Need fastest RMQ queries (O(1))
- Many queries on same array

**Use Segment Tree when:**
- Array needs updates
- Need range sum/min/max queries
- O(log n) query time is acceptable

---

## Applications

- Range minimum/maximum queries (RMQ)
- Static array queries (no updates)
- Competitive programming (when updates are not needed)
- LCA (Lowest Common Ancestor) in trees
- Longest Common Substring problems

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

