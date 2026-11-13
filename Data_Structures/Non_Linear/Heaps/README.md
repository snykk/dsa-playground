# Heaps

This folder contains implementations of various **Heap Data Structures** - specialized tree-based data structures that satisfy the heap property.

---

## Overview

Heaps are complete binary trees that maintain a specific ordering property. They are commonly used to implement priority queues and are essential for many algorithms.

---

## Heap Types

### 1. Binary Heaps
- **Min Heap**: Parent ≤ Children, minimum at root
- **Max Heap**: Parent ≥ Children, maximum at root

### 2. Advanced Heaps
- **Fibonacci Heap**: Advanced heap with amortized O(1) insert

---

## Heap Characteristics

| Heap Type | Insert | Extract | Peek | Build |
| --------- | ------ | ------- | ---- | ----- |
| Min Heap | O(log n) | O(log n) | O(1) | O(n) |
| Max Heap | O(log n) | O(log n) | O(1) | O(n) |
| Fibonacci Heap | O(1) amortized | O(log n) amortized | O(1) | O(n) |

---

## Heap Property

### Min Heap
- Parent node ≤ All children
- Minimum element always at root
- Used for priority queues (lower value = higher priority)

### Max Heap
- Parent node ≥ All children
- Maximum element always at root
- Used for priority queues (higher value = higher priority)

---

## Heap Structure Example

```
Min Heap:
        1
       / \
      3   2
     / \ / \
    7  5 4  6

Max Heap:
        7
       / \
      5   6
     / \ / \
    3  4 2  1
```

**Array Representation:**
- Parent of index i: `(i-1)/2`
- Left child of index i: `2*i+1`
- Right child of index i: `2*i+2`

---

## Common Operations

- **Insert**: Add element while maintaining heap property
- **Extract Min/Max**: Remove and return root element
- **Peek**: Get root element without removing
- **Heapify**: Build heap from array in O(n) time
- **Size/IsEmpty**: Query heap state

---

## Implementations

Each heap is implemented in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

All implementations include:
- Source code
- Test files
- README documentation

---

## Learning Path

1. **Min Heap**: Start with basic min heap
2. **Max Heap**: Understand max heap (similar to min heap)
3. **Heap Operations**: Master insert, extract, heapify
4. **Fibonacci Heap**: Explore advanced heap structure

---

## Applications

- **Priority Queues**: Task scheduling, event simulation
- **Heap Sort**: O(n log n) sorting algorithm
- **Graph Algorithms**: Dijkstra's algorithm, Prim's MST
- **K Smallest/Largest**: Find k smallest/largest elements
- **Median Finding**: Using two heaps (min + max)

---

## Heap vs Other Structures

| Feature | Heap | BST | Array |
| ------- | ---- | --- | ----- |
| Min/Max Access | O(1) | O(log n) | O(n) |
| Insert | O(log n) | O(log n) | O(n) |
| Search | O(n) | O(log n) | O(n) |
| Use Case | Priority Queue | Sorted Data | General |

---

## Key Concepts

- **Complete Binary Tree**: All levels filled except possibly last
- **Heap Property**: Parent-child ordering constraint
- **Array Representation**: Efficient storage using array indexing
- **Heapify**: Process to maintain heap property
- **Amortized Analysis**: Average case analysis (Fibonacci Heap)

