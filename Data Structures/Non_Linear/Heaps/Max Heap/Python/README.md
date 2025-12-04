# Max Heap - Python

This folder contains a Python implementation of a **Max Heap**.

A **Max Heap** is a complete binary tree where the parent node is always greater than or equal to its children. The maximum element is always at the root.

---

## Concept

- **Complete Binary Tree**: All levels are filled except possibly the last
- **Heap Property**: Parent ≥ Children (max heap property)
- **Array Representation**: Efficient storage using array indexing
- **Root is Maximum**: Largest element is always at root
- **O(log n) Operations**: Insert and extract operations are O(log n)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `insert(value)`          | Insert value into heap               | O(log n)        |
| `extract_max()`          | Remove and return maximum element    | O(log n)        |
| `peek()`                 | Get maximum element without removing | O(1)            |
| `is_empty()`             | Check if heap is empty               | O(1)            |
| `size()`                 | Get number of elements               | O(1)            |
| `clear()`                | Remove all elements                 | O(n)            |

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

## Usage

```python
from max_heap import MaxHeap

# Create empty heap
heap = MaxHeap()

# Insert elements
heap.insert(5)
heap.insert(3)
heap.insert(7)
heap.insert(1)

# Peek maximum
print(heap.peek())  # 7

# Extract maximum
print(heap.extract_max())  # 7
print(heap.extract_max())  # 5
print(heap.extract_max())  # 3
print(heap.extract_max())  # 1

# Build heap from array
arr = [5, 3, 7, 1, 9, 2]
heap = MaxHeap(arr)
while not heap.is_empty():
    print(heap.extract_max())  # 9, 7, 5, 3, 2, 1
```

---

## Heap Structure Example

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

## Applications

- Priority Queues (higher value = higher priority)
- Heap Sort algorithm (descending order)
- Finding k largest elements
- Task scheduling with priority

---

## Run Test

```bash
python -m unittest max_heap_test.py
```

