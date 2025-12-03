# Segment Tree - Python

This folder contains a Python implementation of a **Segment Tree**.

A **Segment Tree** is a tree data structure used for storing information about intervals (segments). It allows answering range queries efficiently while still being flexible enough to allow point updates.

---

## Concept

- **Range Queries**: Answer queries about ranges in O(log n)
- **Point Updates**: Update single elements in O(log n)
- **Binary Tree Structure**: Complete binary tree stored as array
- **Efficient**: O(log n) for both query and update

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `query(left, right)`     | Get sum in range [left, right]       | O(log n)        |
| `update(index, value)`   | Update value at index                | O(log n)        |
| `get(index)`             | Get value at index                   | O(1)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Build     | O(n)            | O(n)            |
| Query     | O(log n)        | O(1)            |
| Update    | O(log n)        | O(1)            |
| Space     | O(n)            | O(n)            |

---

## Usage

```python
from segment_tree import SegmentTree

# Initialize with array
arr = [1, 3, 5, 7, 9, 11]
st = SegmentTree(arr)

# Range sum query
print(st.query(0, 2))   # 9 (1 + 3 + 5)
print(st.query(1, 3))   # 15 (3 + 5 + 7)

# Point update
st.update(2, 10)
print(st.query(0, 2))   # 14 (1 + 3 + 10)

# Get single value
print(st.get(0))        # 1
```

---

## Applications

- Range sum queries
- Range minimum/maximum queries
- Range update queries (with lazy propagation)
- Competitive programming problems

---

## Run Test

```bash
python -m unittest segment_tree_test.py
```

