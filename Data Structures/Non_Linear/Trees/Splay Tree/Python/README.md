# Splay Tree (Python)

A **Splay Tree** is a self-adjusting binary search tree that automatically moves recently accessed elements to the root through a process called "splaying". This improves access time for frequently used elements.

---

## Overview

Splay Trees are a type of binary search tree that reorganize themselves after each access operation. When a node is accessed (searched, inserted, or deleted), it is moved to the root through a series of rotations called "splaying".

---

## Key Features

- **Self-Adjusting**: Frequently accessed nodes move closer to the root
- **Amortized O(log n)**: Average-case performance is O(log n) for all operations
- **No Extra Storage**: Unlike AVL or Red-Black trees, no balance information is stored
- **Cache-Friendly**: Recently accessed elements are at the root, improving cache performance

---

## Operations

### 1. Insert

Insert a key-value pair and splay the node to root.

```python
tree = SplayTree()
tree.insert(10, "ten")
tree.insert(5, "five")
tree.insert(15, "fifteen")
```

**Time Complexity**: O(log n) amortized

### 2. Search

Search for a key and splay it to root if found.

```python
value = tree.search(10)  # Returns "ten" and moves 10 to root
value = tree.search(20)  # Returns None if not found
```

**Time Complexity**: O(log n) amortized

### 3. Delete

Delete a key and splay the parent to root.

```python
tree.delete(10)  # Returns True if deleted, False if not found
```

**Time Complexity**: O(log n) amortized

### 4. Find Min/Max

Find minimum or maximum key and splay to root.

```python
min_key = tree.find_min()  # Returns minimum key
max_key = tree.find_max()  # Returns maximum key
```

**Time Complexity**: O(log n) amortized

### 5. Traversal

Inorder traversal returns keys in sorted order.

```python
keys = tree.inorder_traversal()  # Returns sorted list of keys
```

**Time Complexity**: O(n)

---

## Splaying Operations

Splaying uses three types of rotations:

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

---

## Example Usage

```python
from splay_tree import SplayTree

# Create a splay tree
tree = SplayTree()

# Insert elements
tree.insert(50, "fifty")
tree.insert(30, "thirty")
tree.insert(70, "seventy")
tree.insert(20, "twenty")
tree.insert(40, "forty")

# Search - accessed node moves to root
value = tree.search(20)  # Returns "twenty"
print(tree.root.key)     # Prints 20 (now at root)

# Find minimum
min_key = tree.find_min()  # Returns 20
print(tree.root.key)       # Prints 20 (splayed to root)

# Delete
tree.delete(30)  # Deletes 30

# Traversal
keys = tree.inorder_traversal()  # [20, 40, 50, 70]
```

---

## Advantages

1. **Simple Implementation**: No balance information needed
2. **Locality of Reference**: Frequently accessed nodes are near root
3. **Amortized Performance**: Good average-case performance
4. **Cache Efficiency**: Hot data stays at the top

---

## Disadvantages

1. **Worst Case O(n)**: Can degrade to linear time in worst case
2. **No Guaranteed Balance**: Tree can become unbalanced
3. **Amortized Analysis**: Performance is amortized, not worst-case

---

## Applications

1. **Caching**: Frequently accessed items move to root
2. **Network Routing**: Hot routes stay accessible
3. **Garbage Collection**: Recently used objects stay accessible
4. **Text Editors**: Recently edited lines stay accessible
5. **Operating Systems**: Frequently used files stay accessible

---

## When to Use

- ✅ When access patterns are non-uniform (some keys accessed more frequently)
- ✅ When you need simple implementation without balance tracking
- ✅ When amortized performance is acceptable
- ❌ When worst-case guarantees are required
- ❌ When uniform access patterns are expected

---

## Related Data Structures

- **Binary Search Tree**: Basic sorted tree structure
- **AVL Tree**: Height-balanced BST with guaranteed O(log n)
- **Red-Black Tree**: Self-balancing BST with color properties
- **Treap**: Randomized BST with heap property

---

## Testing

Run the test suite:

```bash
python splay_tree_test.py
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Data Structures and Algorithms" by Aho, Hopcroft, Ullman

