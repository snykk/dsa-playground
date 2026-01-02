# Square Root Decomposition - Python

This folder contains a Python implementation of **Square Root Decomposition** for efficient range queries.

---

## Concept

Square Root Decomposition divides an array into blocks of size √N to enable efficient range queries and updates. Each query/update takes O(√N) time.

**Key Features:**
- Array decomposition into blocks
- Efficient range queries
- Point updates
- O(√N) per operation

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `SqrtDecomposition.update(index, value)` | Update value at index | O(1) |
| `SqrtDecomposition.query(left, right)` | Query sum in range | O(√N) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Query | O(√N) | O(1) |
| Update | O(1) | O(1) |
| Construction | O(N) | O(√N) |

---

## Usage

```python
from square_root_decomposition import SqrtDecomposition

arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
sd = SqrtDecomposition(arr)

result = sd.query(2, 7)  # Sum of range [2, 7]
sd.update(5, 20)  # Update index 5 to 20
```

---

## Running Tests

```bash
python square_root_decomposition_test.py
```

---

_Last Updated: December 2025_

