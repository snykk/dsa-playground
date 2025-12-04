# Min Heap

A **Min Heap** is a complete binary tree data structure where the parent node is always less than or equal to its children. The minimum element is always at the root.

---

## Overview

Min Heaps are essential for:
- Priority Queues (lower value = higher priority)
- Heap Sort algorithm
- Finding k smallest elements efficiently
- Graph algorithms (Dijkstra's shortest path, Prim's MST)

---

## Key Characteristics

1. **Complete Binary Tree**: All levels are filled except possibly the last
2. **Heap Property**: Parent ≤ Children (min heap property)
3. **Array Representation**: Efficient storage using array indexing
4. **Root is Minimum**: Smallest element is always at root
5. **O(log n) Operations**: Insert and extract operations are O(log n)

---

## Structure Example

For array `[1, 3, 5, 7, 9, 11]`, Min Heap structure:

```
        1
       / \
      3   5
     / \ /
    7  9 11
```

**Array representation:** `[1, 3, 5, 7, 9, 11]`
- Index 0: Root (minimum)
- Parent of index i: `(i-1)/2`
- Left child of index i: `2*i+1`
- Right child of index i: `2*i+2`

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `insert(value)` | Insert value into heap         | O(log n)        |
| `extract_min()` | Remove and return minimum      | O(log n)        |
| `peek()`       | Get minimum without removing   | O(1)            |
| `is_empty()`   | Check if heap is empty         | O(1)            |
| `size()`       | Get number of elements         | O(1)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Insert    | O(log n)        | O(1)             |
| Extract   | O(log n)        | O(1)             |
| Peek      | O(1)            | O(1)             |
| Heapify   | O(n)            | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Comparison with Max Heap

| Feature     | Min Heap | Max Heap |
| ----------- | -------- | -------- |
| Root        | Minimum  | Maximum  |
| Property    | Parent ≤ Children | Parent ≥ Children |
| Use Case    | Priority Queue (lower = higher priority) | Priority Queue (higher = higher priority) |

---

## Applications

- **Priority Queues**: Task scheduling, event simulation
- **Heap Sort**: O(n log n) sorting algorithm
- **Graph Algorithms**: Dijkstra's algorithm, Prim's MST
- **K Smallest Elements**: Find k smallest elements efficiently
- **Task Scheduling**: Process tasks by priority

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

