# Red-Black Tree - Python

This folder contains a Python implementation of a **Red-Black Tree**.

A **Red-Black Tree** is a self-balancing Binary Search Tree where each node has an extra bit for color (RED or BLACK). It maintains balance through color properties and rotations, guaranteeing O(log n) time complexity.

---

## Concept

- **Self-Balancing**: Maintains balance through color properties
- **Color Property**: Every node is RED or BLACK
- **Root Property**: Root is always BLACK
- **Red Property**: If node is RED, both children are BLACK
- **Black Height**: Every path from node to leaf has same number of BLACK nodes
- **Guaranteed O(log n)**: All operations are O(log n)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `insert(data)`           | Insert data with auto-balancing      | O(log n)        |
| `search(data)`           | Search for data                      | O(log n)        |
| `inorder_traversal()`    | Traverse: Left, Root, Right (sorted) | O(n)            |
| `height()`               | Calculate tree height                | O(n)            |
| `size()`                 | Get total number of nodes            | O(n)            |
| `is_empty()`             | Check if tree is empty               | O(1)            |
| `find_min()`             | Find minimum value                   | O(log n)        |
| `find_max()`             | Find maximum value                   | O(log n)        |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| insert    | O(log n)        | O(log n)         |
| search    | O(log n)        | O(log n)         |
| Traversal | O(n)            | O(log n)         |
| height    | O(n)            | O(log n)         |
| size      | O(n)            | O(log n)         |

**Key Advantage**: All operations are **guaranteed O(log n)** with fewer rotations than AVL Tree.

---

## Usage

```python
from red_black_tree import RedBlackTree

rbt = RedBlackTree()

# Insert elements
rbt.insert(10)
rbt.insert(20)
rbt.insert(30)
rbt.insert(40)
rbt.insert(50)

# Search
print(rbt.search(30))  # True
print(rbt.search(60))  # False

# Find min and max
print(rbt.find_min())  # 10
print(rbt.find_max())  # 50

# Traverse (sorted order)
print(rbt.inorder_traversal())  # [10, 20, 30, 40, 50]
```

---

## Run Test

```bash
python -m unittest red_black_tree_test.py
```

---

## Notes

- Red-Black Tree guarantees O(log n) for all operations
- Fewer rotations than AVL Tree, making it better for write-heavy workloads
- Uses sentinel node (NIL) for leaf nodes
- More complex than AVL Tree but more efficient for frequent insertions/deletions

