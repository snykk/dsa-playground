# Red-Black Tree

A **Red-Black Tree** is a self-balancing Binary Search Tree where each node has an extra bit for color (RED or BLACK). It maintains balance through color properties and rotations, guaranteeing O(log n) time complexity for all operations.

---

## Overview

Red-Black Trees are widely used in practice (e.g., C++ STL `std::map`, Java `TreeMap`) because they provide good balance between performance and implementation complexity.

---

## Red-Black Tree Properties

1. **Color Property**: Every node is either RED or BLACK
2. **Root Property**: Root is always BLACK
3. **Leaf Property**: Every leaf (NIL) is BLACK
4. **Red Property**: If a node is RED, both its children are BLACK
5. **Black Height Property**: Every path from a node to any descendant leaf contains the same number of BLACK nodes

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `insert(data)` | Insert with auto-balancing     | O(log n)        |
| `search(data)` | Search for data                | O(log n)        |
| Traversals     | Inorder, Preorder, Postorder   | O(n)            |
| `height()`     | Calculate tree height          | O(n)            |
| `size()`       | Get number of nodes            | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| insert    | O(log n)        | O(log n)         |
| search    | O(log n)        | O(log n)         |
| delete    | O(log n)        | O(log n)         |
| Traversal | O(n)            | O(log n)         |

**Key Advantage**: All operations are **guaranteed O(log n)** with fewer rotations than AVL Tree.

---

## Comparison with AVL Tree

| Feature         | AVL Tree     | Red-Black Tree |
| --------------- | ------------ | -------------- |
| Rotations       | More frequent | Less frequent |
| Balance         | Stricter     | More relaxed   |
| Insert/Delete   | More rotations | Fewer rotations |
| Search          | Slightly faster | Slightly slower |
| Use Case        | Read-heavy   | Write-heavy    |

---

## Applications

- C++ STL `std::map`, `std::set`
- Java `TreeMap`, `TreeSet`
- Linux kernel (process scheduling)
- Database indexing

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`) - Complete implementation
- **C++** (`C++/`) - With proper memory management
- **Go** (`Go/`) - Idiomatic Go implementation

