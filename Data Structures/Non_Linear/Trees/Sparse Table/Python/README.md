# Sparse Table - Python

This folder contains a Python implementation of a **Sparse Table**.

A **Sparse Table** is a static data structure that supports O(1) range minimum/maximum queries (RMQ) after O(n log n) preprocessing. It does not support updates.

---

## Concept

- **Static Structure**: Array cannot be modified after construction
- **O(1) Queries**: Fastest query time for RMQ (Range Minimum/Maximum Query)
- **O(n log n) Preprocessing**: Build time is O(n log n)
- **No Updates**: Cannot update array elements (use Segment Tree if updates needed)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `query(left, right)`     | Get min/max in range [left, right]   | O(1)            |
| `get(index)`             | Get value at index                   | O(1)            |

---

## Complexity

| Operation     | Time Complexity | Space Complexity |
| ------------- | --------------- | ---------------- |
| Build         | O(n log n)      | O(n log n)       |
| Query         | O(1)            | O(1)             |
| Update        | Not supported   | -                |
| Space         | O(n log n)      | O(n log n)       |

---

## Usage

```python
from sparse_table import SparseTable

# Initialize with array (min query)
arr = [1, 3, 5, 7, 9, 11, 2, 4, 6, 8]
st_min = SparseTable(arr, 'min')

# Range minimum query
print(st_min.query(0, 2))   # 1 (min of 1, 3, 5)
print(st_min.query(1, 3))   # 3 (min of 3, 5, 7)

# Initialize with array (max query)
st_max = SparseTable(arr, 'max')

# Range maximum query
print(st_max.query(0, 2))   # 5 (max of 1, 3, 5)
print(st_max.query(1, 3))   # 7 (max of 3, 5, 7)

# Get single value
print(st_min.get(0))        # 1
```

---

## Applications

- Range minimum/maximum queries (RMQ)
- Static array queries (no updates)
- Competitive programming (when updates are not needed)
- LCA (Lowest Common Ancestor) in trees

---

## Run Test

```bash
python -m unittest sparse_table_test.py
```

