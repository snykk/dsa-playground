# AVL Tree - Python

This folder contains a Python implementation of an **AVL Tree** (Adelson-Velsky and Landis Tree).

An **AVL Tree** is a self-balancing Binary Search Tree where the height difference between left and right subtrees of any node is at most 1. This guarantees O(log n) time complexity for all operations.

---

## Concept

- **Self-Balancing**: Automatically maintains balance after insert/delete
- **Balance Factor**: height(left) - height(right) must be -1, 0, or 1
- **Rotations**: Uses rotations to restore balance when needed
- **Guaranteed O(log n)**: All operations are O(log n) even in worst case
- **BST Property**: Maintains binary search tree ordering

---

## Operations

| Operation                | Description                                    | Time Complexity |
| ------------------------- | ---------------------------------------------- | --------------- |
| `insert(data)`           | Insert data with automatic balancing           | O(log n)        |
| `search(data)`           | Search for data in the tree                    | O(log n)        |
| `delete(data)`           | Delete data with automatic balancing            | O(log n)        |
| `find_min()`             | Find minimum value                              | O(log n)        |
| `find_max()`             | Find maximum value                              | O(log n)        |
| `inorder_traversal()`     | Traverse: Left, Root, Right (sorted)            | O(n)            |
| `preorder_traversal()`   | Traverse: Root, Left, Right                    | O(n)            |
| `postorder_traversal()`  | Traverse: Left, Right, Root                    | O(n)            |
| `level_order_traversal()`| Traverse level by level (BFS)                  | O(n)            |
| `height()`               | Calculate tree height                          | O(1)            |
| `size()`                 | Get total number of nodes                       | O(n)            |
| `is_empty()`             | Check if tree is empty                          | O(1)            |
| `is_balanced()`          | Check if tree maintains AVL property            | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| insert    | O(log n)        | O(log n)         |
| search    | O(log n)        | O(log n)         |
| delete    | O(log n)        | O(log n)         |
| find_min  | O(log n)        | O(1)             |
| find_max  | O(log n)        | O(1)             |
| Traversal | O(n)            | O(log n)         |
| height    | O(1)            | O(1)             |
| size      | O(n)            | O(log n)         |

**Key Advantage**: All operations are **guaranteed O(log n)** even in worst case, unlike regular BST which can degrade to O(n).

---

## Rotations

AVL Tree uses 4 types of rotations to maintain balance:

### 1. Left Rotation (Right-Right Case)
```
    x                  y
     \                / \
      y      =>      x   T3
     / \              \
    T2  T3            T2
```

### 2. Right Rotation (Left-Left Case)
```
      y                x
     / \              / \
    x   T3    =>     T1  y
   / \                  / \
  T1  T2               T2  T3
```

### 3. Left-Right Rotation (Left-Right Case)
First left rotate left child, then right rotate root.

### 4. Right-Left Rotation (Right-Left Case)
First right rotate right child, then left rotate root.

---

## Usage

```python
from avl_tree import AVLTree

# Create an AVL tree
avl = AVLTree()

# Insert elements (tree auto-balances)
avl.insert(10)
avl.insert(20)
avl.insert(30)
avl.insert(40)
avl.insert(50)
# Tree automatically balances - height stays O(log n)

# Search
print(avl.search(30))  # True
print(avl.search(60))  # False

# Find min and max
print(avl.find_min())  # 10
print(avl.find_max())  # 50

# Delete (tree auto-balances)
avl.delete(30)
print(avl.search(30))  # False
print(avl.is_balanced())  # True

# Traverse (inorder produces sorted order)
print(avl.inorder_traversal())    # [10, 20, 40, 50]

# Check tree properties
print(avl.height())     # O(log n) - balanced!
print(avl.size())       # 4
print(avl.is_balanced()) # True
```

---

## Balance Factor

For each node, balance factor = height(left) - height(right)

- **-1**: Right subtree is 1 level taller
- **0**: Both subtrees have same height
- **1**: Left subtree is 1 level taller
- **|balance| > 1**: Unbalanced - rotation needed

---

## Run Test

```bash
python -m unittest avl_tree_test.py
```

Or:

```bash
python avl_tree_test.py
```

---

## Notes

- AVL Tree guarantees O(log n) for all operations
- More rotations than Red-Black Tree, but simpler to understand
- Better for read-heavy workloads
- Height is always O(log n), making it more balanced than regular BST
- Each node stores its height for efficient balance factor calculation

---

## Comparison with BST

| Feature         | BST          | AVL Tree     |
| --------------- | ------------ | ------------ |
| Search (worst)  | O(n)         | O(log n)     |
| Insert (worst)  | O(n)         | O(log n)     |
| Delete (worst)  | O(n)         | O(log n)     |
| Balance         | Not guaranteed | Always balanced |
| Rotations       | None         | After insert/delete |
| Memory          | Less         | Slightly more (height field) |

