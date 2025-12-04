# Min Heap - Python

This folder contains a Python implementation of a **Min Heap**.

A **Min Heap** is a complete binary tree where the parent node is always less than or equal to its children. The minimum element is always at the root.

---

## Concept

- **Complete Binary Tree**: All levels are filled except possibly the last
- **Heap Property**: Parent ≤ Children (min heap property)
- **Array Representation**: Efficient storage using array indexing
- **Root is Minimum**: Smallest element is always at root
- **O(log n) Operations**: Insert and extract operations are O(log n)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `insert(value)`          | Insert value into heap               | O(log n)        |
| `extract_min()`          | Remove and return minimum element    | O(log n)        |
| `peek()`                 | Get minimum element without removing | O(1)            |
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
from min_heap import MinHeap

# Create empty heap
heap = MinHeap()

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

# Build heap from array
arr = [5, 3, 7, 1, 9, 2]
heap = MinHeap(arr)
while not heap.is_empty():
    print(heap.extract_min())  # 1, 2, 3, 5, 7, 9
```

---

## Heap Structure Example

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

## Applications

- Priority Queues
- Heap Sort algorithm
- Finding k smallest elements
- Graph algorithms (Dijkstra's, Prim's)
- Task scheduling

---

## Run Test

```bash
python -m unittest min_heap_test.py
```

