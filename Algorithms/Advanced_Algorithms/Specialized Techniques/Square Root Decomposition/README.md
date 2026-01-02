# Square Root Decomposition

**Square Root Decomposition** is a technique that divides an array into blocks of size approximately √N to enable efficient range queries and updates. It provides a simpler alternative to segment trees for certain problems.

---

## Overview

Square Root Decomposition works by:
1. Dividing array into blocks of size √N
2. Precomputing block-level information (sum, min, max, etc.)
3. Answering queries by combining:
   - Complete blocks (using precomputed values)
   - Partial blocks (brute force on remaining elements)

This approach achieves:
- O(√N) per query/update
- O(N) preprocessing
- Simpler implementation than segment trees

The technique is particularly useful when:
- Queries and updates are balanced
- Simpler code is preferred over optimal complexity
- Range operations can be decomposed into blocks

---

## Key Characteristics

1. **Block-Based**: Divides array into √N blocks
2. **Precomputation**: Precomputes block-level aggregates
3. **Hybrid Approach**: Combines block queries with brute force
4. **Simple Implementation**: Easier than segment trees

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `update(index, value)` | Update value at index | O(√N) |
| `query(left, right)` | Query range [left, right] | O(√N) |
| `update_range(left, right, val)` | Update range [left, right] | O(√N) |
| `query_range(left, right)` | Query range [left, right] | O(√N) |

---

## Implementation Approaches

### 1. Standard Square Root Decomposition
- **Pros**: Simple, handles range sum queries
- **Cons**: O(√N) per operation
- **Use Case**: Range sum, range min/max

### 2. Lazy Propagation
- **Pros**: Efficient range updates
- **Cons**: More complex
- **Use Case**: Range updates with queries

### 3. Mo's Algorithm Variant
- **Pros**: Optimized for multiple queries
- **Cons**: Requires offline queries
- **Use Case**: Multiple offline range queries

---

## Applications

1. **Range Sum Queries**: Sum of elements in range
2. **Range Min/Max**: Minimum/maximum in range
3. **Range Updates**: Updating ranges efficiently
4. **Frequency Queries**: Counting frequencies in ranges
5. **Competitive Programming**: Common in contests

---

## Example Use Cases

### Range Sum Query
```python
arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
sqrt_dec = SqrtDecomposition(arr)
result = sqrt_dec.query(2, 7)
# Returns sum of elements from index 2 to 7
```

### Point Update
```python
sqrt_dec.update(5, 20)
# Updates element at index 5 to 20
```

### Range Update
```python
sqrt_dec.update_range(1, 4, 5)
# Adds 5 to all elements from index 1 to 4
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
| **Construction** | O(N) | O(√N) |
| **Point Update** | O(√N) | O(1) |
| **Range Query** | O(√N) | O(1) |
| **Range Update** | O(√N) | O(1) |

Where N is array size.

---

## When to Use

- **Range Queries**: When need range queries and updates
- **Simplicity**: When prefer simpler code over optimal complexity
- **Balanced Operations**: When queries and updates are balanced
- **Competitive Programming**: When segment tree is overkill

---

## Related Patterns

- **Segment Trees**: Alternative with O(log N) operations
- **Fenwick Trees**: Alternative for range sum
- **Mo's Algorithm**: Uses square root decomposition

---

## Further Reading

- "Competitive Programming" by Halim & Halim
- "Algorithm Design Manual" by Steven Skiena
- Codeforces: Square Root Decomposition tutorials

---

**Note**: Square Root Decomposition provides O(√N) operations, which is slower than segment trees' O(log N) but simpler to implement. It's a good choice when code simplicity is valued over optimal performance, or when the constant factors of segment trees are too high.

---

_Last Updated: December 2025_
