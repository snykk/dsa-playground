# Max Heap

A **Max Heap** is a complete binary tree data structure where the parent node is always greater than or equal to its children. The maximum element is always at the root.

---

## Overview

Max Heaps are essential for:
- Priority Queues (higher value = higher priority)
- Heap Sort algorithm (descending order)
- Finding k largest elements efficiently
- Task scheduling with priority

---

## Key Characteristics

1. **Complete Binary Tree**: All levels are filled except possibly the last
2. **Heap Property**: Parent ≥ Children (max heap property)
3. **Array Representation**: Efficient storage using array indexing
4. **Root is Maximum**: Largest element is always at root
5. **O(log n) Operations**: Insert and extract operations are O(log n)

---

## Structure Example

For array `[11, 9, 7, 5, 3, 1]`, Max Heap structure:

```
        11
       / \
      9   7
     / \ /
    5  3 1
```

**Array representation:** `[11, 9, 7, 5, 3, 1]`
- Index 0: Root (maximum)
- Parent of index i: `(i-1)/2`
- Left child of index i: `2*i+1`
- Right child of index i: `2*i+2`

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `insert(value)` | Insert value into heap         | O(log n)        |
| `extract_max()` | Remove and return maximum      | O(log n)        |
| `peek()`       | Get maximum without removing   | O(1)            |
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

## Comparison with Min Heap

| Feature     | Max Heap | Min Heap |
| ----------- | -------- | -------- |
| Root        | Maximum  | Minimum  |
| Property    | Parent ≥ Children | Parent ≤ Children |
| Use Case    | Priority Queue (higher = higher priority) | Priority Queue (lower = higher priority) |

---

## Applications

- **Priority Queues**: Task scheduling, event simulation
- **Heap Sort**: O(n log n) sorting algorithm (descending order)
- **Graph Algorithms**: Some graph algorithms use max heap
- **K Largest Elements**: Find k largest elements efficiently
- **Task Scheduling**: Process tasks by priority (higher priority first)

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

