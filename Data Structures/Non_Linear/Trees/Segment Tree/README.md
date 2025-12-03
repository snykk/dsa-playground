# Segment Tree

A **Segment Tree** is a tree data structure used for storing information about intervals (segments). It allows answering range queries efficiently while still being flexible enough to allow point updates.

---

## Overview

Segment Trees are essential for competitive programming, especially for problems involving:
- Range sum queries
- Range minimum/maximum queries
- Range update queries (with lazy propagation)

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

