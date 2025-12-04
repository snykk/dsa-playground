# Fibonacci Heap - C++

This folder contains a C++ implementation of a **Fibonacci Heap**.

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
| `insert(key)`            | Insert key into heap                 | O(1) amortized  |
| `extract_min()`          | Remove and return minimum element    | O(log n) amortized |
| `peek()`                 | Get minimum element without removing | O(1)            |
| `is_empty()`             | Check if heap is empty               | O(1)            |
| `size()`                 | Get number of elements               | O(1)            |
| `clear()`                | Remove all elements                 | O(n)            |

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

```cpp
#include "fibonacci_heap.cpp"
using namespace std;

// Create empty heap
FibonacciHeap heap;

// Insert elements
heap.insert(5);
heap.insert(3);
heap.insert(7);
heap.insert(1);

// Peek minimum
cout << heap.peek() << endl;  // 1

// Extract minimum
cout << heap.extract_min() << endl;  // 1
cout << heap.extract_min() << endl;  // 3
```

---

## Compile and Run

```bash
# Compile
g++ -o fibonacci_heap_test fibonacci_heap_test.cpp

# Run
./fibonacci_heap_test
```

---

## Applications

- Graph algorithms (Dijkstra's with many edges)
- Priority queues with many insertions
- Advanced algorithms requiring fast inserts

