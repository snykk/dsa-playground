# Prefix Sum / Difference Array Pattern

A **Prefix Sum / Difference Array** is a technique for efficient range queries and updates using preprocessing. Prefix sums enable O(1) range sum queries after O(n) preprocessing, while difference arrays enable O(1) range updates that can be applied in batch.

---

## Overview

These two complementary techniques solve different but related problems:

- **Prefix Sum**: Precomputes cumulative sums to answer range sum queries in O(1)
- **Difference Array**: Tracks range updates efficiently, allowing batch application of multiple updates

Together, they form a powerful toolkit for problems involving:
- Multiple range sum queries
- Range updates (add value to all elements in range)
- Cumulative operations
- Interval problems

---

## Key Characteristics

1. **Prefix Sum**: O(1) queries after O(n) preprocessing
2. **Difference Array**: O(1) updates, O(n) final array construction
3. **Space Efficient**: O(n) additional space
4. **Batch Operations**: Can handle multiple queries/updates efficiently

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `PrefixSum(arr)` | Construct prefix sum array | O(n) |
| `query(left, right)` | Get sum of range [left, right] | O(1) |
| `DifferenceArray(size)` | Initialize difference array | O(n) |
| `update(left, right, value)` | Add value to range [left, right] | O(1) |
| `get_array()` | Get final array after updates | O(n) |

---

## Implementation Approaches

### 1. Prefix Sum Array
- **Pros**: O(1) range sum queries, simple implementation
- **Cons**: Requires O(n) preprocessing, not suitable for updates
- **Use Case**: Multiple range sum queries on static array

### 2. Difference Array
- **Pros**: O(1) range updates, efficient batch updates
- **Cons**: Requires O(n) to get final array
- **Use Case**: Multiple range updates, then query final state

### 3. Combined Approach
- **Pros**: Handles both queries and updates
- **Cons**: More complex implementation
- **Use Case**: Problems requiring both range queries and updates

---

## Applications

1. **Range Sum Queries**: Multiple queries on subarray sums
2. **Range Updates**: Adding value to all elements in range
3. **Cumulative Problems**: Problems involving cumulative operations
4. **Interval Problems**: Scheduling, booking, timeline problems
5. **2D Prefix Sum**: Extending to 2D arrays for rectangle queries
6. **Frequency Arrays**: Counting occurrences in ranges

---

## Example Use Cases

### Range Sum Queries
```python
arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
ps = PrefixSum(arr)
result = ps.query(0, 4)  # Sum of [1, 2, 3, 4, 5] = 15
```

### Range Updates
```python
da = DifferenceArray(10)
da.update(0, 4, 5)  # Add 5 to indices 0-4
da.update(2, 6, 3)  # Add 3 to indices 2-6
result = da.get_array()  # Get final array
```

### Combined Usage
```python
# Apply multiple range updates
da.update(0, 4, 5)
da.update(1, 3, 2)
final = da.get_array()
# Then use prefix sum for queries
ps = PrefixSum(final)
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
| **Prefix Sum Construction** | O(n) | O(n) |
| **Range Sum Query** | O(1) | O(1) |
| **Difference Array Init** | O(n) | O(n) |
| **Range Update** | O(1) | O(1) |
| **Get Final Array** | O(n) | O(n) |

---

## When to Use

- **Multiple Range Queries**: When need many range sum queries
- **Range Updates**: When need to update ranges efficiently
- **Static Arrays**: When array doesn't change between queries
- **Cumulative Operations**: Problems involving cumulative sums
- **Interval Problems**: Scheduling, booking, timeline problems

---

## Related Patterns

- **Segment Trees**: For dynamic range queries and updates
- **Fenwick Trees**: Alternative for range sum queries
- **Sparse Tables**: For range minimum/maximum queries

---

## Further Reading

- "Competitive Programming" by Halim & Halim
- "Algorithm Design Manual" by Steven Skiena
- LeetCode problems: Range Sum Query, Range Addition

---

**Note**: Prefix sum is ideal for static arrays with many queries. For dynamic arrays with frequent updates, consider using segment trees or Fenwick trees instead.

---

_Last Updated: December 2025_
