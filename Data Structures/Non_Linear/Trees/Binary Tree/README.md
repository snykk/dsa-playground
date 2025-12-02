# Binary Tree

A **Binary Tree** is a fundamental hierarchical data structure where each node has at most two children, referred to as the **left child** and **right child**. Unlike Binary Search Trees (BST), Binary Trees don't enforce any ordering constraint on the nodes.

---

## Overview

Binary Trees are the foundation for many advanced tree data structures:

- **No Ordering**: Unlike BST, nodes can be in any order
- **Hierarchical Structure**: Parent-child relationships form a tree
- **Maximum 2 Children**: Each node can have 0, 1, or 2 children
- **Root Node**: Topmost node with no parent
- **Leaf Nodes**: Nodes with no children

---

## Key Characteristics

1. **Node Structure**: Each node contains data and references to left/right children
2. **Tree Properties**: Height, size, depth, level
3. **Traversal Methods**: Multiple ways to visit all nodes
4. **Flexible Structure**: Can be balanced or unbalanced, complete or incomplete

---

## Tree Terminology

- **Root**: The topmost node (no parent)
- **Parent**: A node with one or more children
- **Child**: A node directly below another node
- **Leaf**: A node with no children
- **Internal Node**: A node with at least one child
- **Height**: Number of edges from root to deepest leaf
- **Depth**: Number of edges from root to a specific node
- **Level**: Depth + 1 (root is at level 1)

---

## Operations

| Operation                | Description                                    | Time Complexity |
| ------------------------- | ---------------------------------------------- | --------------- |
| `insert(data)`           | Insert data using level-order insertion        | O(n)            |
| `search(data)`           | Search for data in the tree                    | O(n)            |
| `inorder_traversal()`    | Traverse: Left, Root, Right                    | O(n)            |
| `preorder_traversal()`   | Traverse: Root, Left, Right                    | O(n)            |
| `postorder_traversal()`  | Traverse: Left, Right, Root                    | O(n)            |
| `level_order_traversal()`| Traverse level by level (BFS)                  | O(n)            |
| `height()`               | Calculate height of the tree                   | O(n)            |
| `size()`                 | Get total number of nodes                      | O(n)            |
| `is_empty()`             | Check if tree is empty                         | O(1)            |

---

## Traversal Methods

### 1. Inorder Traversal (Left, Root, Right)
- Visit left subtree → root → right subtree
- **Use Case**: Produces sorted output for BST, expression evaluation

### 2. Preorder Traversal (Root, Left, Right)
- Visit root → left subtree → right subtree
- **Use Case**: Copying tree structure, prefix notation

### 3. Postorder Traversal (Left, Right, Root)
- Visit left subtree → right subtree → root
- **Use Case**: Deleting tree, postfix notation

### 4. Level-Order Traversal (Breadth-First)
- Visit nodes level by level from top to bottom
- **Use Case**: Printing tree structure, finding level-specific nodes

---

## Example Tree Structure

```
        1
       / \
      2   3
     / \
    4   5
```

**Traversal Results:**
- **Inorder**: 4, 2, 5, 1, 3
- **Preorder**: 1, 2, 4, 5, 3
- **Postorder**: 4, 5, 2, 3, 1
- **Level-order**: 1, 2, 3, 4, 5

---

## Complexity Summary

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| insert    | O(n)            | O(n)             |
| search    | O(n)            | O(h)             |
| Traversal | O(n)            | O(h)             |
| height    | O(n)            | O(h)             |
| size      | O(n)            | O(h)             |
| Space     | O(n)            | O(n)             |

Where:
- `n` = number of nodes
- `h` = height of tree (O(log n) for balanced, O(n) for skewed)

---

## Applications

1. **Expression Trees**: Represent mathematical expressions
2. **File System**: Directory structure representation
3. **Decision Trees**: Machine learning and AI
4. **Syntax Trees**: Compiler design
5. **Huffman Coding**: Data compression
6. **Game Trees**: Game AI and decision making
7. **Heap Implementation**: Priority queues

---

## Tree Types

Binary Trees can be classified into various types:

- **Full Binary Tree**: Every node has 0 or 2 children
- **Complete Binary Tree**: All levels filled except possibly the last, filled left to right
- **Perfect Binary Tree**: All internal nodes have 2 children, all leaves at same level
- **Balanced Binary Tree**: Height difference between left and right subtrees ≤ 1
- **Skewed Binary Tree**: All nodes have only one child (left or right)

---

## Implementation Approaches

### 1. Level-Order Insertion (Current Implementation)
- Fills tree from left to right, level by level
- Simple and predictable structure
- Good for complete binary trees

### 2. Recursive Insertion
- More flexible insertion based on conditions
- Used in BST and specialized trees

### 3. Array Representation
- Store tree in array using index relationships
- Efficient for complete binary trees
- Parent at index `i`, children at `2i+1` and `2i+2`

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Uses `collections.deque` for queue operations
- **C++** (`C++/`) - Uses `std::queue` and proper memory management
- **Go** (`Go/`) - Uses `container/list` for queue operations

Each implementation includes:
- Complete source code with all traversal methods
- Comprehensive test suite
- Detailed README with usage examples

---

## Related Data Structures

- **Binary Search Tree (BST)**: Binary tree with ordering constraint
- **AVL Tree**: Self-balancing BST
- **Red-Black Tree**: Another self-balancing BST
- **Heap**: Complete binary tree with heap property
- **Trie**: Tree for string operations

---

## Further Reading

- [Binary Tree on Wikipedia](https://en.wikipedia.org/wiki/Binary_tree)
- Tree visualization: [Visualgo](https://visualgo.net/en/binarytree)
- [Tree Traversal Techniques](https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/)

---

**Note**: This implementation uses level-order insertion for simplicity. For more specialized use cases, consider Binary Search Tree (BST) which maintains ordering constraints for efficient search operations.

