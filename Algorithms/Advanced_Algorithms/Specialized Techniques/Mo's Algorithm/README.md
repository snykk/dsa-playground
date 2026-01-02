# Mo's Algorithm

**Mo's Algorithm** (also known as the Square Root Decomposition for Range Queries) is an offline algorithm for efficiently answering multiple range queries on an array. It uses square root decomposition and query sorting to achieve O((N + Q) × √N) time complexity.

---

## Overview

Mo's Algorithm is designed for offline range query problems where:
- You have multiple range queries to answer
- Queries can be processed in any order
- Each query asks about a range [L, R] in the array
- You need to answer queries efficiently

The algorithm works by:
1. Dividing array into blocks of size √N
2. Sorting queries by block of left endpoint, then by right endpoint
3. Processing queries in sorted order, maintaining a sliding window
4. Answering each query using the current window state

This approach minimizes window movements, leading to efficient query processing.

---

## Key Characteristics

1. **Offline Algorithm**: All queries must be known in advance
2. **Square Root Decomposition**: Uses √N block size
3. **Query Sorting**: Sorts queries for efficient processing
4. **Sliding Window**: Maintains current range [L, R]

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `get_block(index)` | Get block number for index | O(1) |
| `process_queries(arr, queries)` | Process all range queries | O((N + Q) × √N) |
| `add(index)` | Add element at index to window | O(1) |
| `remove(index)` | Remove element at index from window | O(1) |

Where N is array size, Q is number of queries.

---

## Implementation Approaches

### 1. Standard Mo's Algorithm
- **Pros**: Simple, works for most range query problems
- **Cons**: Requires offline queries
- **Use Case**: Range sum, range count, distinct elements

### 2. Mo's with Updates
- **Pros**: Handles point updates
- **Cons**: More complex, O(N^(5/3)) complexity
- **Use Case**: Range queries with updates

### 3. Mo's on Trees
- **Pros**: Extends to tree path queries
- **Cons**: Requires Euler Tour
- **Use Case**: Tree path queries

---

## Applications

1. **Range Sum Queries**: Sum of elements in range
2. **Distinct Elements**: Count distinct elements in range
3. **Range Frequency**: Frequency of elements in range
4. **Inversion Count**: Count inversions in range
5. **Offline Queries**: Any offline range query problem

---

## Example Use Cases

### Range Sum Queries
```python
arr = [1, 2, 3, 4, 5, 6, 7, 8]
queries = [(0, 3), (2, 5), (1, 4)]
mos = MoSAlgorithm(arr)
results = mos.process_queries(queries)
# Returns [10, 18, 14] (sums of ranges)
```

### Distinct Elements
```python
arr = [1, 2, 1, 3, 2, 1, 4, 2]
queries = [(0, 3), (2, 5)]
# Count distinct elements in each range
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List-based implementation
- **C++** (`C++/`) - Vector-based implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **Construction** | O(N) | O(N) |
| **Process Queries** | O((N + Q) × √N) | O(N + Q) |
| **Add/Remove** | O(1) | O(1) |
| **Answer Query** | O(1) | O(1) |

Where N is array size, Q is number of queries.

---

## When to Use

- **Offline Queries**: When all queries are known in advance
- **Multiple Queries**: When have many range queries
- **Range Problems**: Range sum, count, frequency problems
- **Competitive Programming**: Common in competitive programming

---

## Related Patterns

- **Square Root Decomposition**: Similar block-based approach
- **Segment Trees**: Alternative for online queries
- **Fenwick Trees**: Alternative for range sum queries

---

## Further Reading

- "Competitive Programming" by Halim & Halim
- "Algorithm Design Manual" by Steven Skiena
- Codeforces: Mo's Algorithm tutorials

---

**Note**: Mo's Algorithm is most effective when you have many offline range queries. For online queries (queries arrive one by one), consider using segment trees or Fenwick trees instead. The algorithm works best when Q ≈ N.

---

_Last Updated: December 2025_
