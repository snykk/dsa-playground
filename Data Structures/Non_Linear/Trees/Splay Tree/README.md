# Splay Tree

A **Splay Tree** is a self-adjusting binary search tree that automatically moves recently accessed elements to the root through a process called "splaying". This improves access time for frequently used elements.

---

## Overview

Splay Trees are a type of binary search tree that reorganize themselves after each access operation. When a node is accessed (searched, inserted, or deleted), it is moved to the root through a series of rotations called "splaying".

Unlike other self-balancing trees (like AVL or Red-Black trees), Splay Trees don't store any balance information. Instead, they rely on the splaying operation to maintain reasonable balance over time.

---

## Key Characteristics

- **Self-Adjusting**: Frequently accessed nodes move closer to the root
- **Amortized O(log n)**: Average-case performance is O(log n) for all operations
- **No Extra Storage**: No balance information is stored in nodes
- **Cache-Friendly**: Recently accessed elements are at the root, improving cache performance
- **Simple Implementation**: Easier to implement than AVL or Red-Black trees

---

## Splaying Operations

Splaying uses three types of rotations to move a node to the root:

### 1. Zig (Single Rotation)
When the node is a direct child of the root.

```
     y                x
    / \              / \
   x   C    -->     A   y
  / \                  / \
 A   B                B   C
```

### 2. Zig-Zig (Two Same-Direction Rotations)
When the node and its parent are both left children or both right children.

```
       z                x
      / \              / \
     y   D            A   y
    / \        -->       / \
   x   C                B   z
  / \                      / \
 A   B                    C   D
```

### 3. Zig-Zag (Two Opposite-Direction Rotations)
When the node is a left child and parent is a right child, or vice versa.

```
     z                x
    / \              /   \
   y   D            y     z
  / \        -->   / \   / \
 A   x            A   B C   D
    / \
   B   C
```

---

## Operations

| Operation | Description | Time Complexity (Amortized) |
|-----------|-------------|----------------------------|
| **Search** | Find a key and splay it to root | O(log n) |
| **Insert** | Insert a key-value pair and splay to root | O(log n) |
| **Delete** | Delete a key and splay parent to root | O(log n) |
| **Find Min** | Find minimum key and splay to root | O(log n) |
| **Find Max** | Find maximum key and splay to root | O(log n) |
| **Traversal** | Inorder traversal (sorted order) | O(n) |

---

## Complexity Analysis

| Operation | Average Case | Worst Case | Amortized |
|-----------|-------------|------------|-----------|
| Search    | O(log n)    | O(n)       | O(log n)  |
| Insert    | O(log n)    | O(n)       | O(log n)  |
| Delete    | O(log n)    | O(n)       | O(log n)  |
| Find Min  | O(log n)    | O(n)       | O(log n)  |
| Find Max  | O(log n)    | O(n)       | O(log n)  |
| Traversal | O(n)        | O(n)       | O(n)      |

**Space Complexity**: O(n)

**Note**: Worst case occurs when the tree becomes a linked list, but amortized analysis shows that over a sequence of operations, the average time per operation is O(log n).

---

## Advantages

1. ✅ **Simple Implementation**: No balance information needed
2. ✅ **Locality of Reference**: Frequently accessed nodes are near root
3. ✅ **Amortized Performance**: Good average-case performance
4. ✅ **Cache Efficiency**: Hot data stays at the top
5. ✅ **No Extra Memory**: No balance fields required

---

## Disadvantages

1. ❌ **Worst Case O(n)**: Can degrade to linear time in worst case
2. ❌ **No Guaranteed Balance**: Tree can become unbalanced
3. ❌ **Amortized Analysis**: Performance is amortized, not worst-case guaranteed
4. ❌ **Not Thread-Safe**: Splaying operations are not easily parallelizable

---

## Applications

1. **Caching Systems**: Frequently accessed items move to root
2. **Network Routing**: Hot routes stay accessible
3. **Garbage Collection**: Recently used objects stay accessible
4. **Text Editors**: Recently edited lines stay accessible
5. **Operating Systems**: Frequently used files stay accessible
6. **Database Systems**: Hot data stays in memory

---

## When to Use

### ✅ Use Splay Tree when:
- Access patterns are non-uniform (some keys accessed more frequently)
- You need simple implementation without balance tracking
- Amortized performance is acceptable
- Cache locality is important

### ❌ Avoid Splay Tree when:
- Worst-case guarantees are required
- Uniform access patterns are expected
- Thread-safety is critical
- Real-time constraints exist

---

## Comparison with Other Trees

| Feature | Splay Tree | AVL Tree | Red-Black Tree |
|---------|-----------|----------|----------------|
| Balance Guarantee | No | Yes (strict) | Yes (loose) |
| Extra Storage | No | Yes (height) | Yes (color) |
| Worst Case | O(n) | O(log n) | O(log n) |
| Amortized | O(log n) | O(log n) | O(log n) |
| Implementation | Simple | Moderate | Complex |
| Cache Locality | Excellent | Good | Good |

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Object-oriented implementation with comprehensive tests
- **C++** (`C++/`) - Efficient implementation with proper memory management
- **Go** (`Go/`) - Clean implementation with Go idioms

Each implementation includes:
- Complete source code with all operations
- Comprehensive test suite
- Detailed README with usage examples

---

## Learning Path

1. **Start with BST**: Understand basic binary search tree operations
2. **Learn Rotations**: Master left and right rotations
3. **Understand Splaying**: Learn the three splaying cases (Zig, Zig-Zig, Zig-Zag)
4. **Study Amortized Analysis**: Understand why splaying works well on average
5. **Compare with Other Trees**: See when to use Splay Tree vs AVL/Red-Black

---

## Visual Example

```
Initial Tree:
        50
       /  \
     30    70
    /  \  /  \
  20  40 60  80

After searching for 20 (splayed to root):
        20
         \
         30
           \
           50
          /  \
        40    70
            /  \
          60   80
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 13)
- "Data Structures and Algorithms" by Aho, Hopcroft, Ullman
- Original Paper: "Self-Adjusting Binary Search Trees" by Sleator and Tarjan (1985)

---

## Related Data Structures

- **Binary Search Tree**: Basic sorted tree structure
- **AVL Tree**: Height-balanced BST with guaranteed O(log n)
- **Red-Black Tree**: Self-balancing BST with color properties
- **Treap**: Randomized BST with heap property
- **B-Tree**: Multi-way tree for database indexing

