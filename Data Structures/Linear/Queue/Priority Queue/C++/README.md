# Priority Queue - C++

This folder contains a C++ implementation of a **Priority Queue** using a min heap.

A **Priority Queue** is an abstract data type where each element has a priority. Elements are served based on priority rather than insertion order. Elements with higher priority (lower priority value in min heap) are served before elements with lower priority.

---

## Concept

- Priority Queue uses a **min heap** internally
- Lower priority values = higher priority (served first)
- For max heap behavior, negate priority values
- Maintains insertion order for elements with the same priority
- Custom heap implementation for educational purposes

---

## Operations

| Operation              | Description                                    | Time Complexity |
| ---------------------- | ---------------------------------------------- | --------------- |
| `enqueue(item, priority)` | Add item with given priority                  | O(log n)        |
| `dequeue()`           | Remove and return item with highest priority    | O(log n)        |
| `peek()`              | Return item with highest priority without removing | O(1)         |
| `is_empty()`          | Check if the queue is empty                     | O(1)            |
| `size()`              | Return the number of elements                   | O(1)            |
| `clear()`             | Remove all elements from the queue              | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| enqueue   | O(log n)        | O(1)             |
| dequeue   | O(log n)        | O(1)             |
| peek      | O(1)            | O(1)             |
| is_empty  | O(1)            | O(1)             |
| size      | O(1)            | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Usage

```cpp
#include "priority_queue.cpp"
#include <iostream>
using namespace std;

int main() {
    PriorityQueue pq;

    // Add items with priorities
    pq.enqueue(10, 1);  // item=10, priority=1 (high priority)
    pq.enqueue(20, 5);  // item=20, priority=5 (medium priority)
    pq.enqueue(30, 10); // item=30, priority=10 (low priority)

    // Items are dequeued based on priority (lower number = higher priority)
    cout << pq.dequeue() << endl;  // Output: 10
    cout << pq.dequeue() << endl;  // Output: 20
    cout << pq.dequeue() << endl;  // Output: 30

    return 0;
}
```

### Max Heap Behavior

To use as a max heap (higher priority value = higher priority):

```cpp
PriorityQueue pq;
pq.enqueue(1, -10);  // Negate for max heap
pq.enqueue(2, -5);
pq.enqueue(3, -1);
// Now item 3 (priority -1) will be dequeued first
```

### Same Priority Handling

Items with the same priority maintain insertion order:

```cpp
PriorityQueue pq;
pq.enqueue(1, 1);
pq.enqueue(2, 1);
pq.enqueue(3, 1);
// Dequeued in order: 1, 2, 3
```

---

## Compile and Run

```bash
# Compile
g++ -o priority_queue_test priority_queue_test.cpp

# Run
./priority_queue_test
```

Or compile and run in one command:

```bash
g++ priority_queue_test.cpp -o priority_queue_test && ./priority_queue_test
```

---

## Notes

- This implementation uses a custom min heap for educational purposes
- The implementation maintains a counter to preserve insertion order for items with equal priority
- For production use, consider using `std::priority_queue` from the C++ standard library
- The heap is implemented using a vector with heapify operations

