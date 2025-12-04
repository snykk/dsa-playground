# Min Heap - Go

This folder contains a Go implementation of a **Min Heap**.

A **Min Heap** is a complete binary tree where the parent node is always less than or equal to its children. The minimum element is always at the root.

---

## Concept

- **Complete Binary Tree**: All levels are filled except possibly the last
- **Heap Property**: Parent ≤ Children (min heap property)
- **Array Representation**: Efficient storage using slice
- **Root is Minimum**: Smallest element is always at root
- **O(log n) Operations**: Insert and extract operations are O(log n)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `Insert(value)`          | Insert value into heap               | O(log n)        |
| `ExtractMin()`           | Remove and return minimum element    | O(log n)        |
| `Peek()`                 | Get minimum element without removing | O(1)            |
| `IsEmpty()`              | Check if heap is empty               | O(1)            |
| `Size()`                 | Get number of elements               | O(1)            |
| `Clear()`                | Remove all elements                 | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Insert    | O(log n)        | O(1)             |
| Extract   | O(log n)        | O(1)             |
| Peek      | O(1)            | O(1)             |
| Heapify   | O(n)            | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Create empty heap
    heap := NewMinHeap()
    
    // Insert elements
    heap.Insert(5)
    heap.Insert(3)
    heap.Insert(7)
    heap.Insert(1)
    
    // Peek minimum
    fmt.Println(heap.Peek())  // 1
    
    // Extract minimum
    fmt.Println(heap.ExtractMin())  // 1
    fmt.Println(heap.ExtractMin())  // 3
    
    // Build heap from array
    arr := []int{5, 3, 7, 1, 9, 2}
    heap2 := NewMinHeapFromArray(arr)
    for !heap2.IsEmpty() {
        fmt.Println(heap2.ExtractMin())  // 1, 2, 3, 5, 7, 9
    }
}
```

---

## Run Test

```bash
go test
```

---

## Applications

- Priority Queues
- Heap Sort algorithm
- Finding k smallest elements
- Graph algorithms (Dijkstra's, Prim's)
- Task scheduling

