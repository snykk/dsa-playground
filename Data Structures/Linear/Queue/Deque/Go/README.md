# Deque (Double-Ended Queue) - Go

This folder contains a Go implementation of a **Deque** (Double-Ended Queue).

A **Deque** is a linear data structure that allows insertion and deletion of elements from both ends (front and back). It combines the functionality of both stacks and queues, making it a versatile data structure.

---

## Concept

- Deque stands for "Double-Ended Queue"
- Elements can be added or removed from both the front and the back
- Can be used as both a stack (LIFO) and a queue (FIFO)
- This implementation uses a slice, which provides O(1) operations for append/pop from the end, but O(n) for insert/pop from the front

---

## Operations

| Operation        | Description                                    |
| ---------------- | ---------------------------------------------- |
| `PushFront(item)` | Add item to the front of the deque            |
| `PushBack(item)`  | Add item to the back of the deque             |
| `PopFront()`      | Remove and return the front item               |
| `PopBack()`       | Remove and return the back item                |
| `PeekFront()`     | Return the front item without removing it      |
| `PeekBack()`      | Return the back item without removing it       |
| `IsEmpty()`       | Check if the deque has no elements             |
| `Size()`          | Return the number of elements in the deque      |

---

## Complexity

| Operation    | Time Complexity | Space Complexity |
| ------------ | --------------- | ---------------- |
| PushFront    | O(n)            | O(1)             |
| PushBack     | O(1)            | O(1)             |
| PopFront     | O(n)            | O(1)             |
| PopBack      | O(1)            | O(1)             |
| PeekFront    | O(1)            | O(1)             |
| PeekBack     | O(1)            | O(1)             |
| IsEmpty      | O(1)            | O(1)             |
| Size         | O(1)            | O(1)             |

**Note:** Using a slice for deque operations results in O(n) for front operations. For O(1) operations on both ends, consider using a doubly-linked list implementation.

---

## Usage

```go
package main

import "fmt"

func main() {
    dq := NewDeque()

    // Add elements from both ends
    dq.PushFront(1)
    dq.PushBack(2)
    dq.PushFront(3)
    dq.PushBack(4)
    // Deque: [3, 1, 2, 4]

    // Peek at both ends
    front, _ := dq.PeekFront()
    back, _ := dq.PeekBack()
    fmt.Println("Front:", front)  // Output: Front: 3
    fmt.Println("Back:", back)    // Output: Back: 4

    // Remove from both ends
    val1, _ := dq.PopFront()
    val2, _ := dq.PopBack()
    fmt.Println("Popped front:", val1)  // Output: Popped front: 3
    fmt.Println("Popped back:", val2)   // Output: Popped back: 4

    // Check size and emptiness
    fmt.Println("Size:", dq.Size())      // Output: Size: 2
    fmt.Println("Is empty:", dq.IsEmpty()) // Output: Is empty: false
}
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

