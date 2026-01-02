# Mo's Algorithm - Python

This folder contains a Python implementation of **Mo's Algorithm** for efficient offline range queries.

---

## Concept

Mo's Algorithm is a square root decomposition technique that efficiently answers multiple range queries offline. It sorts queries by block and processes them in an optimized order.

**Key Features:**
- Square root decomposition
- Offline query processing
- Efficient for multiple range queries
- O((N + Q) × √N) complexity

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `count_distinct_in_ranges(arr, queries)` | Count distinct elements in ranges | O((N+Q)√N) |
| `MoSAlgorithm.process_queries(queries)` | Process queries using Mo's algorithm | O((N+Q)√N) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Process Queries | O((N+Q)√N) | O(N) |
| Query Answer | O(1) amortized | O(1) |

---

## Usage

```python
from mos_algorithm import count_distinct_in_ranges

arr = [1, 1, 2, 1, 3, 4, 3, 3, 4]
queries = [(0, 4), (1, 3), (2, 6), (0, 8)]

results = count_distinct_in_ranges(arr, queries)
for i, (l, r) in enumerate(queries):
    print(f"Range [{l}, {r}]: {results[i]} distinct")
```

---

## Running Tests

```bash
python mos_algorithm_test.py
```

---

_Last Updated: December 2025_

