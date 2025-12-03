# AVL Tree

An **AVL Tree** (Adelson-Velsky and Landis Tree) is a self-balancing Binary Search Tree where the height difference between left and right subtrees of any node is at most 1. This guarantees O(log n) time complexity for all operations, even in the worst case.

---

## Overview

AVL Trees were the first self-balancing binary search trees, invented in 1962. They maintain balance through rotations after insertions and deletions, ensuring the tree height remains O(log n).

**Key Advantage**: Unlike regular BST which can degrade to O(n) in worst case, AVL Tree **guarantees O(log n)** for all operations.

---

## Key Characteristics

1. **Self-Balancing**: Automatically maintains balance after insert/delete
2. **Balance Factor**: For each node, |height(left) - height(right)| ≤ 1
3. **Rotations**: Uses 4 types of rotations to restore balance
4. **BST Property**: Maintains binary search tree ordering
5. **Height Guarantee**: Height is always O(log n)

---

## Balance Factor

For each node, **balance factor = height(left) - height(right)**

- **-1**: Right subtree is 1 level taller
- **0**: Both subtrees have same height  
- **1**: Left subtree is 1 level taller
- **|balance| > 1**: Unbalanced - rotation needed

---

## Rotations

AVL Tree uses 4 types of rotations to maintain balance:

### 1. Right Rotation (Left-Left Case)
When left subtree is too tall and left child's left subtree is taller.

**Before (Unbalanced):**
```
        z (BF = +2)
       /
      y (BF = +1)
     /
    x
```

**After (Right Rotate):**
```
      y
     / \
    x   z
```

### 2. Left Rotation (Right-Right Case)
When right subtree is too tall and right child's right subtree is taller.

**Before (Unbalanced):**
```
    z (BF = -2)
     \
      y (BF = -1)
       \
        x
```

**After (Left Rotate):**
```
      y
     / \
    z   x
```

### 3. Left-Right Rotation (Left-Right Case)
When left subtree is too tall but left child's right subtree is taller.

**Before (Unbalanced):**
```
        z (BF = +2)
       /
      y (BF = -1)
       \
        x
```

**Step 1: Left Rotate y**
```
        z
       /
      x
     /
    y
```

**Step 2: Right Rotate z**
```
      x
     / \
    y   z
```

### 4. Right-Left Rotation (Right-Left Case)
When right subtree is too tall but right child's left subtree is taller.

**Before (Unbalanced):**
```
    z (BF = -2)
     \
      y (BF = +1)
     /
    x
```

**Step 1: Right Rotate y**
```
    z
     \
      x
       \
        y
```

**Step 2: Left Rotate z**
```
      x
     / \
    z   y
```

---

## Operations

| Operation      | Description                          | Time Complexity |
| -------------- | ------------------------------------ | --------------- |
| `insert(data)` | Insert with automatic balancing      | O(log n)        |
| `search(data)` | Search for data                      | O(log n)        |
| `delete(data)` | Delete with automatic balancing       | O(log n)        |
| `find_min()`   | Find minimum value                    | O(log n)        |
| `find_max()`   | Find maximum value                    | O(log n)        |
| Traversals     | Inorder, Preorder, Postorder          | O(n)            |
| `height()`     | Get tree height                       | O(1)            |
| `size()`       | Get number of nodes                   | O(n)            |
| `is_balanced()`| Check AVL property                    | O(n)            |

---

## Complexity Summary

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

**All operations are guaranteed O(log n)**, unlike regular BST.

---

## Applications

1. **Database Indexing**: Maintain sorted order with guaranteed performance
2. **Priority Queues**: Can be used (though heap is more common)
3. **Symbol Tables**: Key-value mapping with ordered keys
4. **Range Queries**: Efficient range search operations
5. **Memory Management**: Used in some memory allocators

---

## Comparison with Other Trees

| Feature         | BST          | AVL Tree     | Red-Black Tree |
| --------------- | ------------ | ------------ | -------------- |
| Search (worst)  | O(n)         | O(log n)     | O(log n)       |
| Insert (worst)  | O(n)         | O(log n)     | O(log n)       |
| Delete (worst)  | O(n)         | O(log n)     | O(log n)       |
| Balance         | Not guaranteed | Always balanced | Always balanced |
| Rotations       | None         | More frequent | Less frequent |
| Height          | O(n) worst   | O(log n)     | O(log n)       |
| Complexity      | Simple       | Medium       | Complex        |

---

## Advantages

- ✅ **Guaranteed O(log n)**: All operations are O(log n) even in worst case
- ✅ **Predictable Performance**: No degradation to O(n)
- ✅ **Simple Concept**: Easier to understand than Red-Black Tree
- ✅ **Good for Read-Heavy**: Excellent for frequent searches

## Disadvantages

- ❌ **More Rotations**: More rotations than Red-Black Tree
- ❌ **Memory Overhead**: Each node stores height
- ❌ **Insert/Delete Overhead**: Balancing adds overhead

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Complete implementation with all rotations
- **C++** (`C++/`) - With proper memory management
- **Go** (`Go/`) - Idiomatic Go implementation

Each implementation includes:
- Complete source code with all rotation types
- Comprehensive test suite
- Detailed README with usage examples

---

## Further Reading

- [AVL Tree on Wikipedia](https://en.wikipedia.org/wiki/AVL_tree)
- Tree visualization: [Visualgo](https://visualgo.net/en/avl)
- [AVL vs Red-Black Tree](https://www.geeksforgeeks.org/difference-between-avl-tree-and-red-black-tree/)

---

**Note**: AVL Tree is ideal when you need guaranteed O(log n) performance and can tolerate more rotations. For write-heavy workloads, Red-Black Tree might be better due to fewer rotations.

