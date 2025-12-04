# Fibonacci Heap - Go

This folder contains a Go implementation of a **Fibonacci Heap**.

A **Fibonacci Heap** is an advanced heap data structure with amortized O(1) insert and O(log n) extract min. It's more complex than binary heaps but offers better performance for certain operations.

---

## Concept

- **Collection of Trees**: Multiple min-heap ordered trees
- **Amortized O(1) Insert**: Very fast insertion
- **Lazy Consolidation**: Trees are consolidated only when needed
- **More Complex**: More complex than binary heaps
- **Better for Many Inserts**: Better when you have many insertions

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `Insert(key)`            | Insert key into heap                 | O(1) amortized  |
| `ExtractMin()`           | Remove and return minimum element    | O(log n) amortized |
| `Peek()`                 | Get minimum element without removing | O(1)            |
| `IsEmpty()`              | Check if heap is empty               | O(1)            |
| `Size()`                 | Get number of elements               | O(1)            |
| `Clear()`                | Remove all elements                 | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Insert    | O(1) amortized  | O(1)             |
| Extract   | O(log n) amortized | O(1)             |
| Peek      | O(1)            | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Create empty heap
    heap := NewFibonacciHeap()
    
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
}
```

---

## Run Test

```bash
go test
```

---

## Applications

- Graph algorithms (Dijkstra's with many edges)
- Priority queues with many insertions
- Advanced algorithms requiring fast inserts

