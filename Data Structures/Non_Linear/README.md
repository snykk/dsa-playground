# Non-Linear Data Structures

This folder contains implementations of **Non-Linear Data Structures** - data structures where elements are not arranged in a sequential manner.

---

## Overview

Non-linear data structures organize data in a hierarchical or network-like manner, allowing for more complex relationships between elements. Unlike linear structures, elements can have multiple predecessors and successors.

---

## Data Structures

### 1. Trees
- **Binary Tree**: Basic tree structure
- **Binary Search Tree (BST)**: Sorted binary tree
- **AVL Tree**: Self-balancing BST
- **Red-Black Tree**: Self-balancing BST with color properties
- **Segment Tree**: Range query data structure
- **Fenwick Tree**: Binary Indexed Tree for range sums
- **Trie**: Prefix tree for string operations
- **Suffix Tree / Suffix Array**: String pattern matching
- **B-Tree / B+ Tree**: Multi-way trees for databases
- **Sparse Table**: Static RMQ data structure

### 2. Heaps
- **Min Heap**: Minimum element at root
- **Max Heap**: Maximum element at root
- **Fibonacci Heap**: Advanced heap with amortized O(1) insert

### 3. Graph
- Coming soon...

---

## Characteristics

- **Hierarchical Structure**: Elements organized in levels
- **Complex Relationships**: Multiple connections between elements
- **Efficient Operations**: Optimized for specific operations
- **Advanced Algorithms**: Foundation for complex algorithms

---

## Common Operations

| Operation | Tree | Heap | Graph |
| --------- | ---- | ---- | ----- |
| Search    | O(log n) | O(n) | O(V+E) |
| Insert    | O(log n) | O(log n) | O(1) |
| Delete    | O(log n) | O(log n) | O(V+E) |
| Traversal | O(n) | O(n) | O(V+E) |

---

## Implementations

Each data structure is implemented in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

All implementations include:
- Source code
- Test files
- README documentation

---

## Learning Path

1. **Start with Trees**: Understand hierarchical structures
2. **Learn Binary Trees**: Foundation for all tree structures
3. **Master Self-Balancing Trees**: AVL, Red-Black trees
4. **Explore Specialized Trees**: Segment Tree, Trie, B-Tree
5. **Study Heaps**: Priority queues and heap operations
6. **Advance to Graphs**: Network structures and algorithms

---

## Applications

- **Trees**: File systems, databases, expression parsing, decision trees
- **Heaps**: Priority queues, heap sort, graph algorithms
- **Graphs**: Social networks, routing, dependency resolution

---

## Subfolders

- **Trees/**: All tree data structure implementations
- **Heaps/**: All heap data structure implementations
- **Graph/**: Graph data structure implementations (coming soon)

