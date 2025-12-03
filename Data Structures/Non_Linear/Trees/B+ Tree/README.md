# B+ Tree

A **B+ Tree** is a variant of B-Tree where all data is stored in leaf nodes, internal nodes only store keys for navigation, and leaf nodes are linked for sequential access. B+ Trees are better for range queries and database indexing.

---

## Overview

B+ Tree is optimized for:
- **Range Queries**: Efficient range search operations
- **Sequential Access**: Linked leaf nodes enable fast traversal
- **Database Indexing**: Used in MySQL InnoDB, PostgreSQL
- **File Systems**: Efficient file indexing

---

## Key Characteristics

1. **Data in Leaves**: All values stored only in leaf nodes
2. **Internal Nodes**: Only store keys for navigation
3. **Linked Leaves**: Leaf nodes linked for sequential access
4. **Range Queries**: O(log n + k) for range search
5. **Better than B-Tree**: For range queries and sequential access

---

## B+ Tree vs B-Tree

| Feature         | B-Tree | B+ Tree |
| --------------- | ------ | ------- |
| Data Storage    | All nodes | Leaf only |
| Range Queries   | Slower | Faster |
| Sequential Access | Slower | Faster (linked leaves) |
| Internal Nodes | Store data | Keys only |
| Use Case        | General | Database indexing |

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `search(key)`  | Search for a key               | O(log n)        |
| `insert(key, value)` | Insert key-value pair    | O(log n)        |
| `range_search(start, end)` | Search keys in range | O(log n + k) |
| `traverse()`   | Get all keys in sorted order   | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Search    | O(log n)        | O(1)             |
| Insert    | O(log n)        | O(log n)         |
| Range Search | O(log n + k)  | O(k)             |
| Space     | O(n)            | O(n)             |

---

## Applications

1. **Database Indexing**: MySQL InnoDB, PostgreSQL
2. **File Systems**: Efficient file indexing
3. **Range Queries**: Fast range search operations
4. **Sequential Access**: Linked leaf nodes enable fast traversal

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`) - Full implementation with range search
- **C++** (`C++/`) - Basic implementation
- **Go** (`Go/`) - Basic implementation

---

## Structure Example

```
Internal Node: [10, 20]
              /   |   \
        [5,7]  [15,17]  [25,30]
         |       |        |
    Leaf: 5,7  15,17   25,30
           ↓     ↓       ↓
         (linked)
```

