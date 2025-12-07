# Splay Tree (Go)

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

```go
tree := NewSplayTree()
tree.Insert(10, "ten")
tree.Insert(5, "five")
tree.Insert(15, "fifteen")
```

**Time Complexity**: O(log n) amortized

### 2. Search

```go
value, found := tree.Search(10)  // Returns ("ten", true) and moves 10 to root
value, found := tree.Search(20)  // Returns ("", false) if not found
```

**Time Complexity**: O(log n) amortized

### 3. Delete

```go
deleted := tree.Delete(10)  // Returns true if deleted, false if not found
```

**Time Complexity**: O(log n) amortized

### 4. Find Min/Max

```go
min, found := tree.FindMin()  // Returns (minKey, true) or (0, false)
max, found := tree.FindMax()  // Returns (maxKey, true) or (0, false)
```

**Time Complexity**: O(log n) amortized

### 5. Traversal

```go
keys := tree.InorderTraversal()  // Returns sorted slice of keys
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

```go
package main

import (
    "fmt"
    "splaytree"
)

func main() {
    tree := NewSplayTree()
    
    // Insert elements
    tree.Insert(50, "fifty")
    tree.Insert(30, "thirty")
    tree.Insert(70, "seventy")
    tree.Insert(20, "twenty")
    tree.Insert(40, "forty")
    
    // Search
    value, found := tree.Search(20)  // Returns ("twenty", true)
    fmt.Println(value)
    
    // Find minimum
    min, _ := tree.FindMin()  // Returns 20
    fmt.Println(min)
    
    // Delete
    tree.Delete(30)
    
    // Traversal
    keys := tree.InorderTraversal()
    for _, key := range keys {
        fmt.Printf("%d ", key)
    }
}
```

---

## Testing

Run the test suite:

```bash
go test
```

Or run with verbose output:

```bash
go test -v
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

