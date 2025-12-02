# Priority Queue

A **Priority Queue** is an abstract data type where each element has a priority associated with it. Elements are served based on priority rather than insertion order. Elements with higher priority are served before elements with lower priority.

---

## Overview

Unlike a regular queue (FIFO), a Priority Queue processes elements based on their priority:

- **High Priority First**: Elements with higher priority are processed before lower priority elements
- **Heap-Based**: Typically implemented using a heap data structure for efficiency
- **Flexible Ordering**: Can be configured as min heap or max heap

This makes priority queues essential for:
- Task scheduling systems
- Dijkstra's shortest path algorithm
- Huffman coding
- Event-driven simulation
- Operating system process scheduling

---

## Key Characteristics

1. **Priority-Based Ordering**: Elements are ordered by priority, not insertion order
2. **Heap Implementation**: Uses heap data structure for O(log n) insert/extract operations
3. **Min/Max Heap**: Can be configured as min heap (lower value = higher priority) or max heap
4. **Efficient Operations**: O(log n) for insert and extract, O(1) for peek

---

## Operations

| Operation      | Description                                    | Time Complexity |
| -------------- | ---------------------------------------------- | --------------- |
| `enqueue(item, priority)` | Add element with given priority              | O(log n)        |
| `dequeue()`    | Remove and return element with highest priority | O(log n)        |
| `peek()`       | View highest priority element without removing  | O(1)            |
| `is_empty()`   | Check if the queue is empty                     | O(1)            |
| `size()`       | Get the number of elements                      | O(1)            |
| `clear()`      | Remove all elements from the queue              | O(n)            |

---

## Implementation Approaches

### 1. Min Heap (Current Implementation)
- **Priority**: Lower priority value = higher priority
- **Use Case**: When lower numbers represent higher priority (e.g., task urgency 1-10)
- **Example**: Priority 1 tasks are processed before priority 10 tasks

### 2. Max Heap
- **Priority**: Higher priority value = higher priority
- **Implementation**: Negate priority values when using min heap
- **Use Case**: When higher numbers represent higher priority

### 3. Array-Based (Simple)
- **Pros**: Simple to understand
- **Cons**: O(n) for insert/extract operations
- **Use Case**: Small datasets or educational purposes

---

## Applications

1. **Task Scheduling**: Operating system process scheduling, job queues
2. **Graph Algorithms**: Dijkstra's algorithm, Prim's MST algorithm
3. **Data Compression**: Huffman coding
4. **Event Simulation**: Discrete event simulation systems
5. **Bandwidth Management**: Network packet prioritization
6. **A\* Search**: Pathfinding algorithms in AI/games

---

## Example Use Cases

### Task Scheduling
```python
pq = PriorityQueue()
pq.enqueue("Backup database", priority=3)
pq.enqueue("Process payment", priority=1)  # High priority
pq.enqueue("Send email", priority=5)       # Low priority

# Tasks processed in order: payment, backup, email
```

### Dijkstra's Algorithm
Priority queues are essential for finding shortest paths in graphs, where nodes are processed based on their current distance from the source.

### Huffman Coding
Used to build optimal prefix codes by repeatedly combining the two least frequent symbols.

---

## Heap Structure

Priority queues are typically implemented using a **binary heap**:

```
        1 (highest priority)
       / \
      3   2
     / \ / \
    5  4 6  7
```

- **Complete Binary Tree**: All levels filled except possibly the last
- **Heap Property**: Parent priority ≤ child priorities (min heap)
- **Array Representation**: Efficient storage using array indexing

---

## Complexity Summary

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| enqueue   | O(log n)        | O(1)             |
| dequeue   | O(log n)        | O(1)             |
| peek      | O(1)            | O(1)             |
| is_empty  | O(1)            | O(1)             |
| size      | O(1)            | O(1)             |
| build     | O(n)            | O(n)             |
| Space     | O(n)            | O(n)             |

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Uses `heapq` module for efficient heap operations
- **C++** (`C++/`) - Custom min heap implementation using vector
- **Go** (`Go/`) - Uses `container/heap` package

Each implementation includes:
- Complete source code with heap operations
- Comprehensive test suite
- Detailed README with usage examples

---

## Comparison with Other Queue Types

| Queue Type        | Ordering        | Use Case                    |
| ----------------- | --------------- | --------------------------- |
| Simple Queue      | FIFO            | Task processing, BFS         |
| Circular Queue    | FIFO (fixed)    | Fixed-size buffers          |
| Deque             | Both ends       | Sliding windows, palindromes |
| Priority Queue    | Priority-based  | Scheduling, graph algorithms |

---

## Standard Library Implementations

For production use, consider standard library implementations:

- **Python**: `queue.PriorityQueue` (thread-safe) or `heapq`
- **C++**: `std::priority_queue` from `<queue>`
- **Go**: `container/heap` package
- **Java**: `java.util.PriorityQueue`

---

## Further Reading

- [Priority Queue on Wikipedia](https://en.wikipedia.org/wiki/Priority_queue)
- [Binary Heap on Wikipedia](https://en.wikipedia.org/wiki/Binary_heap)
- Heap visualization: [Visualgo](https://visualgo.net/en/heap)

---

**Note**: The implementations in this folder use min heap by default. Lower priority values represent higher priority. To use as max heap, negate priority values when enqueueing.

