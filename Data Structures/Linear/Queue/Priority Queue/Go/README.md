# Priority Queue - Go

This folder contains a Go implementation of a **Priority Queue** using a min heap.

A **Priority Queue** is an abstract data type where each element has a priority. Elements are served based on priority rather than insertion order. Elements with higher priority (lower priority value in min heap) are served before elements with lower priority.

---

## Concept

- Priority Queue uses a **min heap** internally
- Lower priority values = higher priority (served first)
- For max heap behavior, negate priority values
- Maintains insertion order for elements with the same priority
- Implemented using Go's `container/heap` package for efficiency

---

## Operations

| Operation              | Description                                    | Time Complexity |
| ---------------------- | ---------------------------------------------- | --------------- |
| `Enqueue(item, priority)` | Add item with given priority                  | O(log n)        |
| `Dequeue()`           | Remove and return item with highest priority    | O(log n)        |
| `Peek()`              | Return item with highest priority without removing | O(1)         |
| `IsEmpty()`           | Check if the queue is empty                     | O(1)            |
| `Size()`              | Return the number of elements                   | O(1)            |
| `Clear()`             | Remove all elements from the queue              | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Enqueue   | O(log n)        | O(1)             |
| Dequeue   | O(log n)        | O(1)             |
| Peek      | O(1)            | O(1)             |
| IsEmpty   | O(1)            | O(1)             |
| Size      | O(1)            | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Usage

```go
package main

import "fmt"

func main() {
    pq := NewPriorityQueueWrapper()

    // Add items with priorities
    pq.Enqueue(10, 1)  // item=10, priority=1 (high priority)
    pq.Enqueue(20, 5)  // item=20, priority=5 (medium priority)
    pq.Enqueue(30, 10) // item=30, priority=10 (low priority)

    // Items are dequeued based on priority (lower number = higher priority)
    val1, _ := pq.Dequeue()
    fmt.Println(val1) // Output: 10
    val2, _ := pq.Dequeue()
    fmt.Println(val2) // Output: 20
    val3, _ := pq.Dequeue()
    fmt.Println(val3) // Output: 30
}
```

### Max Heap Behavior

To use as a max heap (higher priority value = higher priority):

```go
pq := NewPriorityQueueWrapper()
pq.Enqueue(1, -10)  // Negate for max heap
pq.Enqueue(2, -5)
pq.Enqueue(3, -1)
// Now item 3 (priority -1) will be dequeued first
```

### Same Priority Handling

Items with the same priority maintain insertion order:

```go
pq := NewPriorityQueueWrapper()
pq.Enqueue(1, 1)
pq.Enqueue(2, 1)
pq.Enqueue(3, 1)
// Dequeued in order: 1, 2, 3
```

---

## Run Test

```bash
go test -v
```

Or run the main program:

```bash
go run main.go
```

---

## Notes

- This implementation uses Go's built-in `container/heap` package which provides efficient heap operations
- The implementation maintains a counter to preserve insertion order for items with equal priority
- The PriorityQueue type implements the `heap.Interface` interface required by the `container/heap` package
- PriorityQueueWrapper provides a cleaner API on top of the heap implementation

