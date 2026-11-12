# Trees

This folder contains implementations of various **Tree Data Structures** - hierarchical data structures where each node can have zero or more children.

---

## Overview

Trees are fundamental non-linear data structures that organize data hierarchically. Each tree consists of nodes connected by edges, with one root node and potentially many leaf nodes.

---

## Tree Types

### 1. Basic Trees
- **Binary Tree**: Each node has at most 2 children
- **Binary Search Tree (BST)**: Sorted binary tree with O(log n) search

### 2. Self-Balancing Trees
- **AVL Tree**: Height-balanced BST with rotations
- **Red-Black Tree**: Self-balancing BST with color properties

### 3. Specialized Trees
- **Segment Tree**: Range query data structure (sum, min, max)
- **Fenwick Tree**: Binary Indexed Tree for efficient range sums
- **Sparse Table**: Static RMQ (Range Minimum/Maximum Query)

### 4. String Trees
- **Trie**: Prefix tree for string operations
- **Suffix Tree**: Compressed trie of all suffixes
- **Suffix Array**: Sorted array of all suffixes

### 5. Database Trees
- **B-Tree**: Multi-way tree for database indexing
- **B+ Tree**: B-Tree variant optimized for range queries

---

## Tree Characteristics

| Tree Type | Search | Insert | Delete | Balance |
| --------- | ------ | ------ | ------ | ------- |
| Binary Tree | O(n) | O(n) | O(n) | No |
| BST | O(log n) | O(log n) | O(log n) | No |
| AVL Tree | O(log n) | O(log n) | O(log n) | Yes |
| Red-Black Tree | O(log n) | O(log n) | O(log n) | Yes |
| Segment Tree | O(log n) | O(log n) | O(log n) | Yes |
| Fenwick Tree | O(log n) | O(log n) | - | Yes |
| Sparse Table | O(1) | - | - | Static |
| Trie | O(m) | O(m) | O(m) | Yes |
| B-Tree | O(log n) | O(log n) | O(log n) | Yes |

---

## Common Operations

- **Traversal**: Inorder, Preorder, Postorder, Level-order
- **Search**: Find element in tree
- **Insert**: Add new element
- **Delete**: Remove element
- **Rotation**: Balance operations (AVL, Red-Black)

---

## Tree Structure Example

```
Binary Tree:
        1
       / \
      2   3
     / \   \
    4   5   6

BST:
        4
       / \
      2   6
     / \ / \
    1  3 5  7
```

---

## Implementations

Each tree is implemented in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

All implementations include:
- Source code
- Test files
- README documentation

---

## Learning Path

1. **Binary Tree**: Start with basic tree structure
2. **BST**: Learn sorted tree operations
3. **AVL Tree**: Understand self-balancing concepts
4. **Red-Black Tree**: Learn alternative balancing method
5. **Segment Tree**: Master range query operations
6. **Trie**: Explore string-based trees
7. **B-Tree**: Understand database indexing

---

## Applications

- **Binary Tree**: Expression parsing, decision trees
- **BST**: Sorted data storage, search operations
- **AVL/Red-Black Tree**: Database indexes, language implementations
- **Segment Tree**: Range queries, competitive programming
- **Fenwick Tree**: Range sum queries, inversion counting
- **Trie**: Autocomplete, spell checkers, IP routing
- **Suffix Tree/Array**: Pattern matching, bioinformatics
- **B-Tree/B+ Tree**: Database systems, file systems

---

## Tree Properties

- **Height**: Maximum depth from root to leaf
- **Depth**: Distance from root to node
- **Degree**: Number of children a node has
- **Leaf**: Node with no children
- **Internal Node**: Node with at least one child
- **Balanced**: Height difference between subtrees is bounded

