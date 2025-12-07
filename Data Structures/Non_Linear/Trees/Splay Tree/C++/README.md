# Splay Tree (C++)

A **Splay Tree** is a self-adjusting binary search tree that automatically moves recently accessed elements to the root through a process called "splaying".

---

## Overview

Splay Trees reorganize themselves after each access operation. When a node is accessed (searched, inserted, or deleted), it is moved to the root through a series of rotations called "splaying".

---

## Features

- **Self-Adjusting**: Frequently accessed nodes move closer to the root
- **Amortized O(log n)**: Average-case performance is O(log n) for all operations
- **No Extra Storage**: Unlike AVL or Red-Black trees, no balance information is stored
- **Cache-Friendly**: Recently accessed elements are at the root

---

## Operations

### 1. Insert

```cpp
SplayTree tree;
tree.insert(10, "ten");
tree.insert(5, "five");
tree.insert(15, "fifteen");
```

**Time Complexity**: O(log n) amortized

### 2. Search

```cpp
std::string value = tree.search(10);  // Returns "ten" and moves 10 to root
std::string value = tree.search(20);  // Returns empty string if not found
```

**Time Complexity**: O(log n) amortized

### 3. Delete

```cpp
bool deleted = tree.remove(10);  // Returns true if deleted, false if not found
```

**Time Complexity**: O(log n) amortized

### 4. Find Min/Max

```cpp
int min_key = tree.findMin();  // Returns minimum key
int max_key = tree.findMax();  // Returns maximum key
```

**Time Complexity**: O(log n) amortized

### 5. Traversal

```cpp
std::vector<int> keys = tree.inorderTraversal();  // Returns sorted keys
```

**Time Complexity**: O(n)

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

```cpp
#include "splay_tree.cpp"
#include <iostream>

int main() {
    SplayTree tree;
    
    // Insert elements
    tree.insert(50, "fifty");
    tree.insert(30, "thirty");
    tree.insert(70, "seventy");
    tree.insert(20, "twenty");
    tree.insert(40, "forty");
    
    // Search
    std::string value = tree.search(20);  // Returns "twenty"
    
    // Find minimum
    int min_key = tree.findMin();  // Returns 20
    
    // Delete
    tree.remove(30);
    
    // Traversal
    std::vector<int> keys = tree.inorderTraversal();
    for (int key : keys) {
        std::cout << key << " ";
    }
    
    return 0;
}
```

---

## Compilation

```bash
g++ -std=c++11 splay_tree.cpp splay_tree_test.cpp -o splay_tree_test
./splay_tree_test
```

---

## Testing

Run the test suite:

```bash
g++ -std=c++11 splay_tree_test.cpp -o test
./test
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

## Related Data Structures

- **Binary Search Tree**: Basic sorted tree structure
- **AVL Tree**: Height-balanced BST with guaranteed O(log n)
- **Red-Black Tree**: Self-balancing BST with color properties
- **Treap**: Randomized BST with heap property

