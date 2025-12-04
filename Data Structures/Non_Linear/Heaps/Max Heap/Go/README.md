# Max Heap - Go

This folder contains a Go implementation of a **Max Heap**.

A **Max Heap** is a complete binary tree where the parent node is always greater than or equal to its children. The maximum element is always at the root.

---

## Concept

- **Complete Binary Tree**: All levels are filled except possibly the last
- **Heap Property**: Parent ≥ Children (max heap property)
- **Array Representation**: Efficient storage using slice
- **Root is Maximum**: Largest element is always at root
- **O(log n) Operations**: Insert and extract operations are O(log n)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `Insert(value)`          | Insert value into heap               | O(log n)        |
| `ExtractMax()`           | Remove and return maximum element    | O(log n)        |
| `Peek()`                 | Get maximum element without removing | O(1)            |
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
    heap := NewMaxHeap()
    
    // Insert elements
    heap.Insert(5)
    heap.Insert(3)
    heap.Insert(7)
    heap.Insert(1)
    
    // Peek maximum
    fmt.Println(heap.Peek())  // 7
    
    // Extract maximum
    fmt.Println(heap.ExtractMax())  // 7
    fmt.Println(heap.ExtractMax())  // 5
    
    // Build heap from array
    arr := []int{5, 3, 7, 1, 9, 2}
    heap2 := NewMaxHeapFromArray(arr)
    for !heap2.IsEmpty() {
        fmt.Println(heap2.ExtractMax())  // 9, 7, 5, 3, 2, 1
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

- Priority Queues (higher value = higher priority)
- Heap Sort algorithm (descending order)
- Finding k largest elements
- Task scheduling with priority

