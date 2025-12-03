# B-Tree - Python

This folder contains a Python implementation of a **B-Tree**.

A **B-Tree** is a self-balancing tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in O(log n). B-Trees are commonly used in databases and file systems.

---

## Concept

- **Self-Balancing**: Automatically maintains balance during insertions/deletions
- **Multi-way Tree**: Each node can have multiple children (not just 2)
- **Sorted Keys**: Keys in each node are sorted
- **Database Indexing**: Optimized for disk-based storage systems
- **Min/Max Keys**: Each node (except root) has between t-1 and 2t-1 keys

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `search(key)`            | Search for a key                     | O(log n)        |
| `insert(key)`            | Insert a key                         | O(log n)        |
| `delete(key)`            | Delete a key                         | O(log n)        |
| `traverse()`             | Get all keys in sorted order         | O(n)            |

Where `n` = number of keys.

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Search    | O(log n)        | O(1)             |
| Insert    | O(log n)        | O(log n)         |
| Delete    | O(log n)        | O(log n)         |
| Space     | O(n)            | O(n)             |

---

## B-Tree Properties

1. **Root**: Can have 1 to 2t-1 keys
2. **Internal Nodes**: Have t-1 to 2t-1 keys
3. **Leaf Nodes**: Have t-1 to 2t-1 keys
4. **All Leaves**: At the same level
5. **Min Degree (t)**: Minimum number of children (default: 3)

---

## Usage

```python
from b_tree import BTree

# Create B-Tree with min_degree=3
btree = BTree(min_degree=3)

# Insert keys
btree.insert(10)
btree.insert(20)
btree.insert(5)
btree.insert(6)

# Search
result = btree.search(10)
if result:
    node, index = result
    print(f"Found: {node.keys[index]}")

# Traverse (in-order)
keys = btree.traverse()
print(keys)  # [5, 6, 10, 20]

# Delete
btree.delete(10)
```

---

## Applications

- **Database Indexing**: MySQL, PostgreSQL use B-Trees
- **File Systems**: NTFS, ext4 use B-Trees
- **Large Data Sets**: Efficient for disk-based storage
- **Range Queries**: Fast sequential access

---

## Run Test

```bash
python -m unittest b_tree_test.py
```

---

## Notes

- B-Tree minimizes disk I/O operations
- Better than BST for large datasets on disk
- Self-balancing ensures O(log n) operations
- Used extensively in database systems

