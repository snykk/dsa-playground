# Cartesian Tree (Go)

A **Cartesian Tree** is a binary tree derived from a sequence of numbers with min-heap property and inorder traversal that produces the original sequence.

---

## Overview

Cartesian Trees are built from arrays such that the inorder traversal returns the original array, while maintaining a min-heap structure.

---

## Operations

### 1. Build from Array

```go
array := []int{9, 3, 7, 1, 8, 12, 10}
tree := NewCartesianTreeFromArray(array)
```

**Time Complexity**: O(n)

### 2. Traversals

```go
inorder := tree.InorderTraversal()    // Original array
preorder := tree.PreorderTraversal()  // Root, Left, Right
postorder := tree.PostorderTraversal() // Left, Right, Root
```

**Time Complexity**: O(n)

### 3. Range Minimum Query

```go
minIdx := tree.GetMinIndex(0, 4)  // Find min in range [0, 4]
```

**Time Complexity**: O(log n) average

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build     | O(n)           | O(n)             |
| Inorder   | O(n)           | O(n)             |
| RMQ       | O(log n) avg   | O(1)             |
| Height    | O(n)           | O(h)             |
| Size      | O(n)           | O(h)             |

---

## Example Usage

```go
package main

import (
    "fmt"
    "cartesiantree"
)

func main() {
    array := []int{9, 3, 7, 1, 8, 12, 10}
    tree := NewCartesianTreeFromArray(array)
    
    // Inorder returns original array
    result := tree.InorderTraversal()
    fmt.Println(result)
    
    // Root is minimum
    fmt.Printf("Root value: %d\n", tree.GetRootValue())
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

## Related Data Structures

- **Segment Tree**: Another structure for range queries
- **Sparse Table**: Static RMQ with O(1) queries
- **Treap**: Combination of BST and heap

