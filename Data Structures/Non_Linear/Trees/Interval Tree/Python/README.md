# Interval Tree (Python)

An **Interval Tree** is a data structure for storing intervals and efficiently querying intervals that overlap with a given interval or point.

---

## Overview

Interval Trees are specialized binary search trees designed to store intervals and answer queries like:
- Find all intervals that overlap with a given interval
- Find all intervals that contain a point
- Find all intervals that are contained in a given interval

---

## Key Features

- **Efficient Overlap Queries**: O(log n + k) time where k is number of results
- **Point Queries**: Find all intervals containing a point
- **Containment Queries**: Find intervals contained in a range
- **BST Structure**: Based on balanced BST for efficient operations

---

## Operations

### 1. Insert

Insert an interval into the tree.

```python
tree = IntervalTree()
tree.insert(Interval(10, 20))
tree.insert((15, 25))  # Can also use tuple
```

**Time Complexity**: O(log n) average

### 2. Search Overlapping

Find all intervals that overlap with a query interval.

```python
query = Interval(14, 16)
result = tree.search_overlapping(query)
# Returns list of overlapping intervals
```

**Time Complexity**: O(log n + k) where k is number of results

### 3. Search Containing Point

Find all intervals that contain a point.

```python
result = tree.search_containing_point(15)
# Returns all intervals containing point 15
```

**Time Complexity**: O(log n + k)

### 4. Search Contained In

Find all intervals completely contained in query interval.

```python
query = Interval(10, 30)
result = tree.search_contained_in(query)
# Returns intervals contained in [10, 30]
```

**Time Complexity**: O(log n + k)

### 5. Delete

Delete an interval from the tree.

```python
tree.delete(Interval(10, 20))
```

**Time Complexity**: O(log n) average

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Insert    | O(log n)       | O(1)             |
| Search Overlapping | O(log n + k) | O(k) |
| Search Point | O(log n + k) | O(k) |
| Delete    | O(log n)       | O(1)             |
| Traversal | O(n)           | O(n)             |

Where:
- `n` = number of intervals
- `k` = number of results

---

## Example Usage

```python
from interval_tree import IntervalTree, Interval

# Create tree
tree = IntervalTree()

# Insert intervals
tree.insert(Interval(15, 20))
tree.insert(Interval(10, 30))
tree.insert(Interval(17, 19))
tree.insert(Interval(5, 20))
tree.insert(Interval(12, 15))
tree.insert(Interval(30, 40))

# Search for overlapping intervals
query = Interval(14, 16)
overlapping = tree.search_overlapping(query)
print(f"Intervals overlapping {query}: {overlapping}")

# Search for intervals containing a point
point_intervals = tree.search_containing_point(15)
print(f"Intervals containing 15: {point_intervals}")

# Search for contained intervals
contained = tree.search_contained_in(Interval(10, 30))
print(f"Intervals contained in [10, 30]: {contained}")
```

---

## Applications

1. **Scheduling**: Find conflicting appointments
2. **Computational Geometry**: Line segment intersection
3. **Database Systems**: Range queries on intervals
4. **Resource Allocation**: Overlapping resource usage
5. **Genomics**: Finding overlapping gene sequences

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

---

## Testing

Run the test suite:

```bash
python interval_tree_test.py
```

---

## Related Data Structures

- **Segment Tree**: For range queries on arrays
- **Range Tree**: For multi-dimensional range queries
- **R-Tree**: For spatial indexing

