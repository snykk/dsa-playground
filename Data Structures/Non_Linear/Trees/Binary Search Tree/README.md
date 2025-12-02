# Binary Search Tree (BST)

A **Binary Search Tree (BST)** is a binary tree data structure with an ordering property that enables efficient search, insertion, and deletion operations. For each node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater than the node's value.

---

## Overview

Binary Search Trees combine the benefits of:
- **Ordered Structure**: Maintains sorted order of elements
- **Efficient Operations**: O(log n) average case for search, insert, delete
- **Dynamic Size**: Grows and shrinks as needed
- **Flexible**: Can be used as a dynamic sorted array

---

## Key Characteristics

1. **BST Property**: For each node `n`:
   - All nodes in left subtree < `n.data`
   - All nodes in right subtree > `n.data`
   - No duplicates (in this implementation)

2. **Ordered Traversal**: Inorder traversal always produces sorted sequence

3. **Efficient Search**: Binary search principle - eliminate half the tree at each step

4. **Dynamic Structure**: Tree shape depends on insertion order

---

## Operations

| Operation      | Description                                    | Time Complexity (Avg) | Time Complexity (Worst) |
| -------------- | ---------------------------------------------- | --------------------- | ------------------------ |
| `insert(data)` | Insert data maintaining BST property           | O(log n)              | O(n)                     |
| `search(data)` | Search for data in the BST                    | O(log n)              | O(n)                     |
| `delete(data)` | Delete data from the BST                       | O(log n)              | O(n)                     |
| `find_min()`   | Find minimum value                             | O(log n)              | O(n)                     |
| `find_max()`   | Find maximum value                             | O(log n)              | O(n)                     |
| Traversals     | Inorder, Preorder, Postorder, Level-order      | O(n)                  | O(n)                     |
| `height()`     | Calculate tree height                          | O(n)                  | O(n)                     |
| `size()`       | Get number of nodes                            | O(n)                  | O(n)                     |

---

## BST Property Example

```
        5
       / \
      3   7
     / \
    1   4
```

**BST Property Verification:**
- Node 5: Left subtree [1,3,4] < 5, Right subtree [7] > 5 ✓
- Node 3: Left subtree [1] < 3, Right subtree [4] > 3 ✓
- Node 7: No children ✓

**Inorder Traversal**: [1, 3, 4, 5, 7] (sorted!)

---

## Delete Operation

Deletion in BST has three cases:

### Case 1: No Children (Leaf Node)
```
    5
   / \
  3   7
     /
    6
```
Delete 6: Simply remove the node

### Case 2: One Child
```
    5
   / \
  3   7
     /
    6
```
Delete 7: Replace with its child (6)

### Case 3: Two Children
```
    5
   / \
  3   7
 / \
1   4
```
Delete 3:
1. Find inorder successor (4 - minimum in right subtree)
2. Replace 3's data with 4's data
3. Delete the original 4 node

---

## Complexity Summary

| Operation | Average Case | Worst Case | Space |
| --------- | ------------ | ---------- | ----- |
| insert    | O(log n)     | O(n)       | O(h)  |
| search    | O(log n)     | O(n)       | O(h)  |
| delete    | O(log n)     | O(n)       | O(h)  |
| find_min  | O(log n)     | O(n)       | O(1)  |
| find_max  | O(log n)     | O(n)       | O(1)  |
| Traversal | O(n)         | O(n)       | O(h)  |

Where:
- `n` = number of nodes
- `h` = height (O(log n) for balanced, O(n) for skewed)

**Worst Case**: Occurs when tree becomes a linked list (all nodes in one path)

---

## Applications

1. **Dynamic Sorted Array**: Maintain sorted order with efficient insert/delete
2. **Symbol Tables**: Key-value mapping with ordered keys
3. **Priority Queues**: Can be used (though heap is more efficient)
4. **Database Indexing**: B-trees (generalization of BST) for database indices
5. **Expression Evaluation**: Expression trees
6. **Range Queries**: Find all values in a range efficiently

---

## Advantages

- ✅ **Efficient Search**: O(log n) average case
- ✅ **Dynamic Size**: No need to know size in advance
- ✅ **Sorted Order**: Inorder traversal gives sorted sequence
- ✅ **Flexible**: Easy to insert and delete

## Disadvantages

- ❌ **Worst Case O(n)**: Can degrade to linked list
- ❌ **No Guaranteed Balance**: Tree can become skewed
- ❌ **No Duplicates**: This implementation doesn't allow duplicates
- ❌ **Memory Overhead**: More memory than array (pointers)

---

## Balanced BST Variants

For guaranteed O(log n) operations, use:

- **AVL Tree**: Self-balancing with height difference ≤ 1
- **Red-Black Tree**: Self-balancing with color properties
- **Splay Tree**: Self-adjusting tree
- **B-Tree**: Multi-way tree for disk storage

---

## Traversal Methods

### 1. Inorder (Left, Root, Right)
- **Always produces sorted order** for BST
- Use case: Printing sorted list, range queries

### 2. Preorder (Root, Left, Right)
- Use case: Copying tree structure, prefix notation

### 3. Postorder (Left, Right, Root)
- Use case: Deleting tree, postfix notation

### 4. Level-Order (Breadth-First)
- Use case: Printing tree level by level, finding level-specific nodes

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Recursive implementation with all traversal methods
- **C++** (`C++/`) - With proper memory management and destructor
- **Go** (`Go/`) - Using `container/list` for queue operations

Each implementation includes:
- Complete source code with insert, search, delete operations
- Comprehensive test suite
- Detailed README with usage examples

---

## Comparison with Other Structures

| Structure      | Search    | Insert    | Delete    | Sorted Order |
| -------------- | --------- | --------- | --------- | ------------ |
| Array          | O(n)      | O(n)      | O(n)      | Yes (if sorted) |
| Sorted Array   | O(log n)  | O(n)      | O(n)      | Yes          |
| Linked List    | O(n)      | O(1)      | O(n)      | No           |
| **BST**        | **O(log n)** | **O(log n)** | **O(log n)** | **Yes**      |
| Hash Table     | O(1)      | O(1)      | O(1)      | No           |

---

## Further Reading

- [Binary Search Tree on Wikipedia](https://en.wikipedia.org/wiki/Binary_search_tree)
- Tree visualization: [Visualgo](https://visualgo.net/en/bst)
- [BST vs Hash Table](https://www.geeksforgeeks.org/advantages-of-bst-over-hash-table/)

---

**Note**: This implementation doesn't allow duplicate values. For balanced operations with guaranteed O(log n) performance, consider implementing AVL Tree or Red-Black Tree.

