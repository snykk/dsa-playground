# Fibonacci Heap

A **Fibonacci Heap** is an advanced heap data structure with amortized O(1) insert and O(log n) extract min. It's more complex than binary heaps but offers better performance for certain operations.

---

## Overview

Fibonacci Heaps are advanced data structures that provide:
- **Amortized O(1) Insert**: Very fast insertion
- **O(log n) Extract Min**: Efficient minimum extraction
- **Lazy Consolidation**: Trees are consolidated only when needed
- **Better for Many Inserts**: Better performance when you have many insertions

---

## Key Characteristics

1. **Collection of Trees**: Multiple min-heap ordered trees
2. **Amortized O(1) Insert**: Very fast insertion (amortized)
3. **Lazy Consolidation**: Trees are consolidated only when needed
4. **More Complex**: More complex than binary heaps
5. **Better for Many Inserts**: Better when you have many insertions

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `insert(key)`  | Insert key into heap           | O(1) amortized  |
| `extract_min()` | Remove and return minimum      | O(log n) amortized |
| `peek()`       | Get minimum without removing   | O(1)            |
| `is_empty()`   | Check if heap is empty         | O(1)            |
| `size()`       | Get number of elements         | O(1)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Insert    | O(1) amortized  | O(1)             |
| Extract   | O(log n) amortized | O(1)             |
| Peek      | O(1)            | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Comparison with Binary Heap

| Feature     | Fibonacci Heap | Binary Heap |
| ----------- | -------------- | ----------- |
| Insert      | O(1) amortized | O(log n)    |
| Extract Min | O(log n) amortized | O(log n)    |
| Complexity  | High           | Low         |
| Use Case    | Many inserts   | General use |

**Use Fibonacci Heap when:**
- You have many insertions
- You need amortized O(1) insert
- Complexity is acceptable

**Use Binary Heap when:**
- Simpler implementation is preferred
- O(log n) insert is acceptable
- General purpose priority queue

---

## Applications

- **Graph Algorithms**: Dijkstra's algorithm with many edges
- **Priority Queues**: When you have many insertions
- **Advanced Algorithms**: Algorithms requiring fast inserts

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

