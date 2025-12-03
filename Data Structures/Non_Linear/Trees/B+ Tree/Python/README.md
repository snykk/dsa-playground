# B+ Tree - Python

This folder contains a Python implementation of a **B+ Tree**.

A **B+ Tree** is a variant of B-Tree where all data is stored in leaf nodes, internal nodes only store keys for navigation, and leaf nodes are linked for sequential access. B+ Trees are better for range queries and database indexing.

---

## Concept

- **Data in Leaves**: All values stored only in leaf nodes
- **Internal Nodes**: Only store keys for navigation
- **Linked Leaves**: Leaf nodes linked for sequential access
- **Range Queries**: Efficient range search operations
- **Database Indexing**: Used in MySQL InnoDB, PostgreSQL

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `search(key)`            | Search for a key                     | O(log n)        |
| `insert(key, value)`     | Insert a key-value pair              | O(log n)        |
| `range_search(start, end)` | Search for keys in range          | O(log n + k)    |
| `traverse()`             | Get all keys in sorted order         | O(n)            |

Where `n` = number of keys, `k` = number of keys in range.

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Search    | O(log n)        | O(1)             |
| Insert    | O(log n)        | O(log n)         |
| Range Search | O(log n + k)  | O(k)             |
| Space     | O(n)            | O(n)             |

---

## B+ Tree vs B-Tree

| Feature         | B-Tree | B+ Tree |
| --------------- | ------ | ------- |
| Data Storage    | All nodes | Leaf only |
| Range Queries   | Slower | Faster |
| Sequential Access | Slower | Faster (linked leaves) |
| Internal Nodes | Store data | Keys only |

---

## Usage

```python
from b_plus_tree import BPlusTree

# Create B+ Tree
bptree = BPlusTree(min_degree=3)

# Insert key-value pairs
bptree.insert(10, "value10")
bptree.insert(20, "value20")
bptree.insert(5, "value5")

# Search
value = bptree.search(10)
print(value)  # "value10"

# Range search
result = bptree.range_search(5, 15)
print(result)  # [(5, 'value5'), (10, 'value10')]

# Traverse all
all_items = bptree.traverse()
print(all_items)  # All (key, value) pairs in sorted order
```

---

## Applications

- **Database Indexing**: MySQL InnoDB, PostgreSQL
- **File Systems**: Efficient file indexing
- **Range Queries**: Fast range search operations
- **Sequential Access**: Linked leaf nodes enable fast traversal

---

## Run Test

```bash
python -m unittest b_plus_tree_test.py
```

---

## Notes

- Better than B-Tree for range queries
- Linked leaf nodes enable efficient sequential access
- Used extensively in database systems
- All data stored in leaves simplifies structure

