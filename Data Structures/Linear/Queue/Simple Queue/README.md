# Simple Queue

A **Queue** is a fundamental **linear data structure** that follows the **First-In-First-Out (FIFO)** principle: the first element added is the first to be removed.  
This folder contains **Simple Queue** implementations in Python, C++, and Go, focusing on clarity, correctness, and educational value.

---

## Table of Contents

1. [Concept](#concept)
2. [Operations](#operations)
3. [Time & Space Complexity](#time--space-complexity)
4. [Implementations](#implementations)
5. [Use Cases](#use-cases)
6. [Running Tests](#running-tests)
7. [References](#references)

---

## Concept

A **Simple Queue** is a basic queue without circular behavior or priority handling.  
It typically supports the following operations:

- **Enqueue** – Add an element to the rear of the queue
- **Dequeue** – Remove and return the element at the front
- **Peek / Front** – Retrieve the front element without removing it
- **is_empty** – Check whether the queue has any elements
- **Size / Length** – Number of elements in the queue

Queue operations ensure that elements are processed in the **exact order they arrive**, making queues ideal for task scheduling, breadth-first search, and real-time systems.

---

## Operations

| Operation       | Description                                  |
| --------------- | -------------------------------------------- |
| `enqueue(item)` | Add `item` to the rear of the queue          |
| `dequeue()`     | Remove and return the front element          |
| `peek()`        | Return the front element without removing it |
| `is_empty()`    | Check if the queue has no elements           |
| `size()`        | Return the total number of elements          |

---

## Time & Space Complexity

| Operation | Python (List) | C++ (Vector)   | Go (Slice)     |
| --------- | ------------- | -------------- | -------------- |
| Enqueue   | O(1)          | O(1) amortized | O(1) amortized |
| Dequeue   | O(n)          | O(n)           | O(n)           |
| Peek      | O(1)          | O(1)           | O(1)           |
| is_empty  | O(1)          | O(1)           | O(1)           |
| Size      | O(1)          | O(1)           | O(1)           |
| Space     | O(n)          | O(n)           | O(n)           |

> Note: In Python and Go, dequeuing from the front of a slice/list is O(n) because elements must be shifted. Circular queues or linked list implementations can improve this to O(1).

---

## Implementations

| Language | Folder    | Highlights                                            |
| -------- | --------- | ----------------------------------------------------- |
| Python   | `Python/` | Simple list-based queue, educational and clear syntax |
| C++      | `C++/`    | `std::vector` backed queue, dynamic resizing          |
| Go       | `Go/`     | Slice-based queue, idiomatic Go implementation        |

### Python Example

```python
from simple_queue import SimpleQueue

q = SimpleQueue()
q.enqueue(10)
q.enqueue(20)
print(q.dequeue())  # 10
print(q.peek())     # 20
```

### C++ Example

```cpp
#include "simple_queue.cpp"
#include <iostream>
using namespace std;

int main() {
    SimpleQueue q;
    q.enqueue(10);
    q.enqueue(20);
    cout << q.dequeue() << endl; // 10
    cout << q.peek() << endl;    // 20
    return 0;
}
```

### Go Example

```go
q := NewSimpleQueue()
q.Enqueue(10)
q.Enqueue(20)
val, _ := q.Dequeue()
fmt.Println(val) // 10
fmt.Println(q.Peek()) // 20
```

## Use Cases

- **Task Scheduling** – Print queue, CPU scheduling
- **Breadth-First Search (BFS)** – Traversing graphs or trees
- **Data Buffers** – Network packet buffers, I/O buffers
- **Simulation** – Handling processes in FIFO order

## Insights & Best Practices

- For frequent dequeuing, consider **Circular Queue** or **Linked List-based Queue** to avoid O(n) shifting.
- Use **Priority Queue** when elements must be processed based on priority rather than insertion order.
- Queues are often combined with **Stacks** in more complex algorithms (e.g., BFS with level tracking).
- Always handle **empty queue scenarios** carefully to prevent runtime errors.
