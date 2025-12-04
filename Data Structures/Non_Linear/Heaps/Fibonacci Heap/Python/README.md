# Fibonacci Heap - Python

This folder contains a Python implementation of a **Fibonacci Heap**.

A **Fibonacci Heap** is an advanced heap data structure with amortized O(1) insert and O(log n) extract min. It's more complex than binary heaps but offers better performance for certain operations.

---

## Concept

- **Collection of Trees**: Multiple min-heap ordered trees
- **Amortized O(1) Insert**: Very fast insertion
- **Lazy Consolidation**: Trees are consolidated only when needed
- **More Complex**: More complex than binary heaps
- **Better for Many Inserts**: Better when you have many insertions

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `insert(key)`            | Insert key into heap                 | O(1) amortized  |
| `extract_min()`          | Remove and return minimum element    | O(log n) amortized |
| `peek()`                 | Get minimum element without removing | O(1)            |
| `is_empty()`             | Check if heap is empty               | O(1)            |
| `size()`                 | Get number of elements               | O(1)            |
| `clear()`                | Remove all elements                 | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Insert    | O(1) amortized  | O(1)             |
| Extract   | O(log n) amortized | O(1)             |
| Peek      | O(1)            | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Usage

```python
from fibonacci_heap import FibonacciHeap

# Create empty heap
heap = FibonacciHeap()

# Insert elements
heap.insert(5)
heap.insert(3)
heap.insert(7)
heap.insert(1)

# Peek minimum
print(heap.peek())  # 1

# Extract minimum
print(heap.extract_min())  # 1
print(heap.extract_min())  # 3
print(heap.extract_min())  # 5
print(heap.extract_min())  # 7
```

---

## Applications

- Graph algorithms (Dijkstra's with many edges)
- Priority queues with many insertions
- Advanced algorithms requiring fast inserts

---

## Run Test

```bash
python -m unittest fibonacci_heap_test.py
```

