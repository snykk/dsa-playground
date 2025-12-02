# Binary Tree - Python

This folder contains a Python implementation of a **Binary Tree**.

A **Binary Tree** is a hierarchical data structure where each node has at most two children, referred to as the left child and right child. Unlike Binary Search Trees, Binary Trees don't enforce any ordering constraint on the nodes.

---

## Concept

- Each node can have at most **2 children** (left and right)
- No ordering constraint (unlike BST)
- Hierarchical structure with a root node
- Can be empty (no nodes)
- Used as a foundation for more specialized trees (BST, AVL, etc.)

---

## Operations

| Operation                | Description                                    | Time Complexity |
| ------------------------- | ---------------------------------------------- | --------------- |
| `insert(data)`           | Insert data using level-order insertion        | O(n)            |
| `search(data)`           | Search for data in the tree                    | O(n)            |
| `inorder_traversal()`     | Traverse: Left, Root, Right                    | O(n)            |
| `preorder_traversal()`    | Traverse: Root, Left, Right                    | O(n)            |
| `postorder_traversal()`   | Traverse: Left, Right, Root                    | O(n)            |
| `level_order_traversal()` | Traverse level by level (BFS)                  | O(n)            |
| `height()`               | Calculate height of the tree                   | O(n)            |
| `size()`                  | Get total number of nodes                      | O(n)            |
| `is_empty()`              | Check if tree is empty                         | O(1)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| insert    | O(n)            | O(n)             |
| search    | O(n)            | O(h)             |
| Traversal | O(n)            | O(h)             |
| height    | O(n)            | O(h)             |
| size      | O(n)            | O(h)             |
| Space     | O(n)            | O(n)             |

Where `h` is the height of the tree (O(log n) for balanced tree, O(n) for skewed tree).

---

## Traversal Methods

### 1. Inorder Traversal (Left, Root, Right)
```python
tree = BinaryTree()
tree.insert(1)
tree.insert(2)
tree.insert(3)
# Tree:     1
#          / \
#         2   3
result = tree.inorder_traversal()
# Output: [2, 1, 3]
```

### 2. Preorder Traversal (Root, Left, Right)
```python
result = tree.preorder_traversal()
# Output: [1, 2, 3]
```

### 3. Postorder Traversal (Left, Right, Root)
```python
result = tree.postorder_traversal()
# Output: [2, 3, 1]
```

### 4. Level-Order Traversal (Breadth-First)
```python
result = tree.level_order_traversal()
# Output: [1, 2, 3]
```

---

## Usage

```python
from binary_tree import BinaryTree

# Create a binary tree
tree = BinaryTree()

# Insert elements
tree.insert(1)
tree.insert(2)
tree.insert(3)
tree.insert(4)
tree.insert(5)

# Search for an element
print(tree.search(3))  # True
print(tree.search(6))  # False

# Get tree properties
print(tree.size())     # 5
print(tree.height())   # 2
print(tree.is_empty()) # False

# Traverse the tree
print(tree.inorder_traversal())    # [4, 2, 5, 1, 3]
print(tree.preorder_traversal())   # [1, 2, 4, 5, 3]
print(tree.postorder_traversal())  # [4, 5, 2, 3, 1]
print(tree.level_order_traversal()) # [1, 2, 3, 4, 5]
```

---

## Tree Structure Example

```
        1
       / \
      2   3
     / \
    4   5
```

- **Inorder**: 4, 2, 5, 1, 3
- **Preorder**: 1, 2, 4, 5, 3
- **Postorder**: 4, 5, 2, 3, 1
- **Level-order**: 1, 2, 3, 4, 5

---

## Run Test

```bash
python -m unittest binary_tree_test.py
```

Or:

```bash
python binary_tree_test.py
```

---

## Notes

- This implementation uses level-order insertion (fills from left to right)
- For more specialized trees, consider Binary Search Tree (BST) which enforces ordering
- Traversal methods use recursion, which may cause stack overflow for very deep trees
- For iterative implementations, use explicit stack/queue data structures

