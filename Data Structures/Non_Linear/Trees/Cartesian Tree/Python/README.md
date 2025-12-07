# Cartesian Tree (Python)

A **Cartesian Tree** is a binary tree derived from a sequence of numbers with two key properties:
1. **Min-heap property**: Parent value ≤ children values
2. **Inorder traversal**: Produces the original sequence

---

## Overview

Cartesian Trees are built from arrays such that the inorder traversal returns the original array, while maintaining a min-heap structure. This makes them useful for range minimum queries (RMQ) and other applications.

---

## Key Features

- **Min-Heap Property**: Parent value ≤ children values
- **Inorder = Original Array**: Inorder traversal gives the original sequence
- **O(n) Construction**: Can be built in linear time using a stack
- **Range Queries**: Efficient for finding minimum in a range

---

## Operations

### 1. Build from Array

Build a Cartesian Tree from an array.

```python
array = [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]
tree = CartesianTree(array)
```

**Time Complexity**: O(n)

### 2. Inorder Traversal

Get the original array sequence.

```python
result = tree.inorder_traversal()  # Returns [9, 3, 7, 1, 8, ...]
```

**Time Complexity**: O(n)

### 3. Range Minimum Query

Find the index of minimum value in a range.

```python
min_idx = tree.get_min_index(0, 4)  # Find min in range [0, 4]
```

**Time Complexity**: O(log n) average

### 4. Traversals

```python
preorder = tree.preorder_traversal()   # Root, Left, Right
postorder = tree.postorder_traversal()  # Left, Right, Root
```

---

## Construction Algorithm

The tree is built using a stack-based approach:

1. Process array elements left to right
2. For each element, pop nodes from stack until finding a smaller value
3. Attach popped nodes as left child of current node
4. Attach current node as right child of stack top
5. Push current node to stack

**Example**: Building from `[9, 3, 7, 1, 8]`

```
Step 1: 9
Step 2: 3 (9 becomes left child of 3)
Step 3: 7 (attached as right child of 3)
Step 4: 1 (3, 7 become left subtree of 1)
Step 5: 8 (attached as right child of 1)

Final Tree:
        1
       / \
      3   8
     / \
    9   7
```

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build     | O(n)           | O(n)             |
| Inorder   | O(n)           | O(n)             |
| RMQ       | O(log n) avg   | O(1)             |
| Height    | O(n)           | O(h)             |
| Size      | O(n)           | O(h)             |

Where:
- `n` = number of elements
- `h` = height of tree (O(log n) average, O(n) worst case)

---

## Example Usage

```python
from cartesian_tree import CartesianTree

# Build tree from array
array = [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]
tree = CartesianTree(array)

# Inorder traversal returns original array
result = tree.inorder_traversal()
print(result)  # [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]

# Verify min-heap property
# Root is always the minimum
print(tree.root.value)  # 1 (minimum value)

# Range minimum query
min_idx = tree.get_min_index(0, 4)
print(f"Minimum in range [0, 4] is at index {min_idx}")

# Traversals
preorder = tree.preorder_traversal()
postorder = tree.postorder_traversal()
```

---

## Properties

### 1. Min-Heap Property
For every node, `node.value ≤ node.left.value` and `node.value ≤ node.right.value` (if children exist).

### 2. Inorder = Original Array
Inorder traversal always returns the original array in the same order.

### 3. Root is Minimum
The root always contains the minimum value of the entire array.

---

## Advantages

1. ✅ **Fast Construction**: O(n) time using stack
2. ✅ **Range Queries**: Efficient for finding minimum in range
3. ✅ **Preserves Order**: Inorder traversal gives original sequence
4. ✅ **Simple Structure**: Binary tree with heap property

---

## Disadvantages

1. ❌ **Worst Case Height**: Can be O(n) for certain arrays
2. ❌ **Not Self-Balancing**: No automatic balancing mechanism
3. ❌ **Limited Operations**: Primarily for range minimum queries

---

## Applications

1. **Range Minimum Query (RMQ)**: Find minimum in a range efficiently
2. **Treap Construction**: Used in building treaps
3. **Expression Parsing**: Can represent expressions
4. **Competitive Programming**: Useful for certain problems

---

## When to Use

### ✅ Use Cartesian Tree when:
- You need range minimum queries
- You need to preserve array order in traversal
- You need O(n) construction time
- You're working with static arrays

### ❌ Avoid Cartesian Tree when:
- You need frequent updates
- You need guaranteed balanced tree
- You need more general range queries

---

## Comparison with Other Structures

| Feature | Cartesian Tree | Segment Tree | Sparse Table |
|---------|---------------|--------------|--------------|
| Construction | O(n) | O(n) | O(n log n) |
| RMQ Query | O(log n) | O(log n) | O(1) |
| Updates | Not supported | O(log n) | Not supported |
| Space | O(n) | O(n) | O(n log n) |

---

## Testing

Run the test suite:

```bash
python cartesian_tree_test.py
```

---

## Related Data Structures

- **Segment Tree**: Another structure for range queries
- **Sparse Table**: Static RMQ with O(1) queries
- **Treap**: Combination of BST and heap
- **Heap**: Min/max heap data structure

---

## References

- "Introduction to Algorithms" by CLRS
- "Competitive Programming" by Steven Halim

