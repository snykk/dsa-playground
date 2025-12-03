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

