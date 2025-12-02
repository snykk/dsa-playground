# Binary Search Tree (BST) - Python

This folder contains a Python implementation of a **Binary Search Tree (BST)**.

A **Binary Search Tree** is a binary tree with an ordering property: for each node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater than the node's value. This property enables efficient search, insertion, and deletion operations.

---

## Concept

- **BST Property**: For each node, `left child < node < right child`
- **Ordered Structure**: Inorder traversal produces sorted sequence
- **Efficient Operations**: O(log n) average case for search, insert, delete
- **No Duplicates**: This implementation doesn't allow duplicate values

---

## Operations

| Operation                | Description                                    | Time Complexity |
| ------------------------- | ---------------------------------------------- | --------------- |
| `insert(data)`           | Insert data maintaining BST property           | O(log n) avg    |
| `search(data)`           | Search for data in the BST                    | O(log n) avg    |
| `delete(data)`           | Delete data from the BST                       | O(log n) avg    |
| `find_min()`             | Find minimum value in BST                      | O(log n) avg    |
| `find_max()`             | Find maximum value in BST                      | O(log n) avg    |
| `inorder_traversal()`     | Traverse: Left, Root, Right (sorted order)     | O(n)            |
| `preorder_traversal()`    | Traverse: Root, Left, Right                    | O(n)            |
| `postorder_traversal()`   | Traverse: Left, Right, Root                    | O(n)            |
| `level_order_traversal()` | Traverse level by level (BFS)                  | O(n)            |
| `height()`               | Calculate height of the tree                   | O(n)            |
| `size()`                 | Get total number of nodes                      | O(n)            |
| `is_empty()`             | Check if tree is empty                         | O(1)            |

---

## Complexity

| Operation | Time Complexity (Average) | Time Complexity (Worst) | Space Complexity |
| --------- | -------------------------- | ----------------------- | ---------------- |
| insert    | O(log n)                   | O(n)                    | O(h)             |
| search    | O(log n)                   | O(n)                    | O(h)             |
| delete    | O(log n)                   | O(n)                    | O(h)             |
| find_min  | O(log n)                   | O(n)                    | O(1)             |
| find_max  | O(log n)                   | O(n)                    | O(1)             |
| Traversal | O(n)                       | O(n)                    | O(h)             |
| height    | O(n)                       | O(n)                    | O(h)             |
| size      | O(n)                       | O(n)                    | O(h)             |

Where:
- `n` = number of nodes
- `h` = height of tree (O(log n) for balanced, O(n) for skewed)

**Note**: Worst case occurs when tree becomes a linked list (skewed tree).

---

## Usage

```python
from bst import BinarySearchTree

# Create a BST
bst = BinarySearchTree()

# Insert elements (order doesn't matter - BST maintains ordering)
bst.insert(5)
bst.insert(3)
bst.insert(7)
bst.insert(1)
bst.insert(4)

# Search for elements
print(bst.search(3))  # True
print(bst.search(6))  # False

# Find min and max
print(bst.find_min())  # 1
print(bst.find_max())  # 7

# Delete elements
bst.delete(3)
print(bst.search(3))  # False

# Traverse (inorder produces sorted order)
print(bst.inorder_traversal())    # [1, 4, 5, 7]
print(bst.preorder_traversal())   # [5, 1, 4, 7]
print(bst.postorder_traversal())  # [1, 4, 7, 5]
print(bst.level_order_traversal()) # [5, 1, 7, 4]

# Get tree properties
print(bst.size())     # 4
print(bst.height())   # 2
print(bst.is_empty()) # False
```

---

## BST Property Example

```
        5
       / \
      3   7
     / \
    1   4
```

- All values in left subtree of 5 are < 5: [1, 3, 4]
- All values in right subtree of 5 are > 5: [7]
- Inorder traversal: [1, 3, 4, 5, 7] (sorted!)

---

## Delete Operation

BST delete has three cases:

1. **No children (Leaf)**: Simply remove the node
2. **One child**: Replace node with its child
3. **Two children**: 
   - Find inorder successor (minimum in right subtree)
   - Replace node's data with successor's data
   - Delete the successor

---

## Run Test

```bash
python -m unittest bst_test.py
```

Or:

```bash
python bst_test.py
```

---

## Notes

- This implementation doesn't allow duplicate values
- For balanced BST operations, consider AVL Tree or Red-Black Tree
- Inorder traversal always produces sorted sequence
- Insertion order affects tree structure but not the sorted property
- Worst case O(n) occurs when tree becomes skewed (like a linked list)

