# Interval Tree (C++)

An **Interval Tree** is a data structure for storing intervals and efficiently querying intervals that overlap with a given interval or point.

---

## Operations

### 1. Insert

```cpp
IntervalTree tree;
tree.insert(Interval(10, 20));
tree.insert(Interval(15, 25));
```

**Time Complexity**: O(log n)

### 2. Search Overlapping

```cpp
std::vector<Interval> result = tree.searchOverlapping(Interval(14, 16));
```

**Time Complexity**: O(log n + k)

### 3. Search Point

```cpp
std::vector<Interval> result = tree.searchContainingPoint(15);
```

**Time Complexity**: O(log n + k)

---

## Compilation

```bash
g++ -std=c++11 interval_tree.cpp interval_tree_test.cpp -o interval_tree_test
./interval_tree_test
```

---

## Related Data Structures

- **Segment Tree**: For range queries on arrays
- **Range Tree**: For multi-dimensional range queries

