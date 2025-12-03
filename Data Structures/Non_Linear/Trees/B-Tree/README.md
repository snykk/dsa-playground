# B-Tree

A **B-Tree** is a self-balancing tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in O(log n). B-Trees are commonly used in databases and file systems.

---

## Overview

B-Tree is optimized for:
- **Disk Storage**: Minimizes disk I/O operations
- **Database Indexing**: Used in MySQL, PostgreSQL
- **File Systems**: NTFS, ext4 use B-Trees
- **Large Datasets**: Efficient for external storage

---

## Key Characteristics

1. **Self-Balancing**: Automatically maintains balance
2. **Multi-way Tree**: Each node can have multiple children
3. **Sorted Keys**: Keys in each node are sorted
4. **Min/Max Keys**: Each node has between t-1 and 2t-1 keys
5. **All Leaves at Same Level**: Ensures balanced height

---

## B-Tree Properties

- **Root**: 1 to 2t-1 keys
- **Internal Nodes**: t-1 to 2t-1 keys
- **Leaf Nodes**: t-1 to 2t-1 keys
- **Min Degree (t)**: Minimum number of children (typically 3)

---

## Structure Example

For B-Tree with min_degree t=3 (max 5 keys per node):

```
                    [10, 20]
                   /    |    \
          [5, 7]    [15, 17]    [25, 30]
           |          |           |
        Leaf      Leaf        Leaf
```

**Key Points:**
- Each node can have multiple keys (sorted)
- Each key has corresponding children
- All leaves at same level (balanced)
- Search: Compare key, go to appropriate child
- Example: Search 17 → Compare with [10,20] → Go to middle child [15,17] → Found!

**Node Structure:**
- Internal node: `[key1, key2, ...]` with children pointers
- Leaf node: `[key1, key2, ...]` with actual data

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `search(key)`  | Search for a key               | O(log n)        |
| `insert(key)`  | Insert a key                   | O(log n)        |
| `delete(key)`  | Delete a key                   | O(log n)        |
| `traverse()`   | Get all keys in sorted order   | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Search    | O(log n)        | O(1)             |
| Insert    | O(log n)        | O(log n)         |
| Delete    | O(log n)        | O(log n)         |
| Space     | O(n)            | O(n)             |

---

## Applications

1. **Database Indexing**: Primary index structure
2. **File Systems**: Directory structures
3. **Large Data Sets**: External storage systems
4. **Range Queries**: Fast sequential access

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`) - Full implementation with delete
- **C++** (`C++/`) - Basic implementation
- **Go** (`Go/`) - Basic implementation

---

## Comparison with BST

| Feature         | BST      | B-Tree   |
| --------------- | -------- | -------- |
| Height          | O(n)     | O(log n) |
| Disk I/O        | High     | Low      |
| Self-Balancing  | No       | Yes      |
| Use Case        | Memory   | Disk     |

