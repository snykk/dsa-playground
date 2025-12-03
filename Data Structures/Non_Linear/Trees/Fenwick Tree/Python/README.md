# Fenwick Tree (Binary Indexed Tree) - Python

This folder contains a Python implementation of a **Fenwick Tree** (also known as Binary Indexed Tree).

A **Fenwick Tree** is a data structure that supports efficient range sum queries and point updates. It is simpler and more memory-efficient than Segment Tree for range sum operations.

---

## Concept

- **1-indexed internally**: Tree uses 1-indexed array internally
- **LSB (Least Significant Bit)**: Uses bit manipulation for efficient traversal
- **Prefix Sum**: Efficiently calculates prefix sums
- **Range Query**: Range sum = prefix_sum(right) - prefix_sum(left-1)
- **Point Update**: Updates propagate to parent nodes using LSB

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `query(left, right)`     | Get sum in range [left, right]       | O(log n)        |
| `prefix_sum(index)`      | Get sum from 0 to index              | O(log n)        |
| `update(index, delta)`    | Add delta to value at index          | O(log n)        |
| `get(index)`             | Get value at index                   | O(log n)        |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Build     | O(n log n)      | O(n)            |
| Query     | O(log n)        | O(1)            |
| Update    | O(log n)        | O(1)            |
| Space     | O(n)            | O(n)            |

---

## Usage

```python
from fenwick_tree import FenwickTree

# Initialize with array
arr = [1, 3, 5, 7, 9, 11]
ft = FenwickTree(arr)

# Range sum query
print(ft.query(0, 2))   # 9 (1 + 3 + 5)
print(ft.query(1, 3))   # 15 (3 + 5 + 7)

# Prefix sum
print(ft.prefix_sum(2)) # 9 (1 + 3 + 5)

# Point update (add delta)
ft.update(2, 5)  # Add 5 to index 2
print(ft.query(0, 2))   # 14 (1 + 3 + 10)

# Get single value
print(ft.get(0))        # 1
```

---

## How It Works

Fenwick Tree uses the concept of **Least Significant Bit (LSB)**:
- To update: Add LSB to index (move to parent)
- To query: Subtract LSB from index (move to previous segment)

Example: index = 6 (binary: 110)
- LSB(6) = 2 (binary: 10)
- Update: 6 → 8 → 16 → ...
- Query: 6 → 4 → 0

---

## Applications

- Range sum queries
- Point updates
- Inversion count problems
- Competitive programming

---

## Comparison with Segment Tree

| Feature         | Segment Tree | Fenwick Tree |
| --------------- | ------------ | ------------ |
| Memory          | 4n           | n            |
| Code Complexity | More complex | Simpler      |
| Range Updates   | Yes (lazy)   | No           |
| Range Min/Max   | Yes          | No           |
| Range Sum       | Yes          | Yes          |

---

## Run Test

```bash
python -m unittest fenwick_tree_test.py
```

