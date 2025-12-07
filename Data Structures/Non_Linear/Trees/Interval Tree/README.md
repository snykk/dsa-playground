# Interval Tree

An **Interval Tree** is a data structure for storing intervals and efficiently querying intervals that overlap with a given interval or point.

---

## Overview

Interval Trees are specialized binary search trees designed to store intervals and answer queries like:
- Find all intervals that overlap with a given interval
- Find all intervals that contain a point
- Find all intervals that are contained in a given interval

---

## Key Characteristics

- **Efficient Overlap Queries**: O(log n + k) time where k is number of results
- **Point Queries**: Find all intervals containing a point
- **Containment Queries**: Find intervals contained in a range
- **BST Structure**: Based on balanced BST for efficient operations
- **Max Tracking**: Each node stores max high value in subtree

---

## Structure

Each node in the Interval Tree stores:
- **Interval**: [low, high] range
- **Max**: Maximum high value in the subtree rooted at this node
- **Left/Right**: Child nodes

The tree is organized as a BST based on the low value of intervals.

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| **Insert** | Insert an interval | O(log n) |
| **Search Overlapping** | Find intervals overlapping query | O(log n + k) |
| **Search Point** | Find intervals containing point | O(log n + k) |
| **Search Contained** | Find intervals in query range | O(log n + k) |
| **Delete** | Delete an interval | O(log n) |
| **Traversal** | Inorder traversal | O(n) |

Where `k` is the number of results.

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Insert    | O(log n)       | O(1)             |
| Search Overlapping | O(log n + k) | O(k) |
| Search Point | O(log n + k) | O(k) |
| Delete    | O(log n)       | O(1)             |
| Traversal | O(n)           | O(n)             |

---

## Search Algorithm

The overlap search uses the max value to prune subtrees:

1. Check if current interval overlaps with query
2. If left child exists and `left.max >= query.low`, search left
3. If right child exists and `node.low <= query.high`, search right

This ensures we only explore subtrees that might contain overlapping intervals.

---

## Advantages

1. ✅ **Efficient Queries**: O(log n + k) for overlap queries
2. ✅ **Multiple Query Types**: Overlap, point, containment
3. ✅ **BST Structure**: Familiar and well-understood
4. ✅ **Space Efficient**: O(n) space

---

## Disadvantages

1. ❌ **Not Self-Balancing**: Can degrade to O(n) if unbalanced
2. ❌ **Complex Deletion**: Requires careful handling
3. ❌ **Update Overhead**: Max values need updating

---

## Applications

1. **Scheduling Systems**: Find conflicting appointments
2. **Computational Geometry**: Line segment intersection
3. **Database Systems**: Range queries on intervals
4. **Resource Allocation**: Overlapping resource usage
5. **Genomics**: Finding overlapping gene sequences
6. **Network Routing**: Overlapping time slots

---

## When to Use

### ✅ Use Interval Tree when:
- You need to store and query intervals
- You need efficient overlap queries
- You need point containment queries
- You have many intervals and frequent queries

### ❌ Avoid Interval Tree when:
- You only need simple range queries
- You need to update intervals frequently
- You have very few intervals
- You need guaranteed O(log n) worst case

---

## Comparison with Other Structures

| Feature | Interval Tree | Segment Tree | Range Tree |
|---------|---------------|--------------|------------|
| Data Type | Intervals | Array ranges | Points/Ranges |
| Overlap Query | O(log n + k) | O(log n + k) | O(log n + k) |
| Point Query | O(log n + k) | O(log n) | O(log n) |
| Updates | O(log n) | O(log n) | O(log n) |
| Space | O(n) | O(n) | O(n log n) |

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Object-oriented implementation with comprehensive tests
- **C++** (`C++/`) - Efficient implementation with proper memory management
- **Go** (`Go/`) - Clean implementation with Go idioms

Each implementation includes:
- Complete source code with all operations
- Comprehensive test suite
- Detailed README with usage examples

---

## Visual Example

```
Intervals: [15,20], [10,30], [17,19], [5,20], [12,15], [30,40]

Interval Tree (sorted by low):
         [10,30] (max=40)
        /        \
    [5,20]      [15,20] (max=40)
   (max=20)    /        \
           [12,15]   [17,19] (max=40)
           (max=15)         \
                          [30,40]
                          (max=40)

Query [14,16] overlaps with:
- [10,30] (contains query)
- [15,20] (overlaps)
- [12,15] (overlaps)
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 14)
- "Computational Geometry" by de Berg et al.

---

## Related Data Structures

- **Segment Tree**: For range queries on arrays
- **Range Tree**: For multi-dimensional range queries
- **R-Tree**: For spatial indexing
- **Binary Search Tree**: Basic sorted tree structure

