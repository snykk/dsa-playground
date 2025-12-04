# Min Heap - C++

This folder contains a C++ implementation of a **Min Heap**.

A **Min Heap** is a complete binary tree where the parent node is always less than or equal to its children. The minimum element is always at the root.

---

## Concept

- **Complete Binary Tree**: All levels are filled except possibly the last
- **Heap Property**: Parent ≤ Children (min heap property)
- **Array Representation**: Efficient storage using vector
- **Root is Minimum**: Smallest element is always at root
- **O(log n) Operations**: Insert and extract operations are O(log n)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `insert(value)`         | Insert value into heap               | O(log n)        |
| `extract_min()`          | Remove and return minimum element    | O(log n)        |
| `peek()`                 | Get minimum element without removing | O(1)            |
| `is_empty()`             | Check if heap is empty               | O(1)            |
| `size()`                 | Get number of elements               | O(1)            |
| `clear()`                | Remove all elements                 | O(n)            |

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

```cpp
#include "min_heap.cpp"
#include <vector>
using namespace std;

// Create empty heap
MinHeap heap;

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

// Build heap from array
vector<int> arr = {5, 3, 7, 1, 9, 2};
MinHeap heap2(arr);
while (!heap2.is_empty()) {
    cout << heap2.extract_min() << endl;  // 1, 2, 3, 5, 7, 9
}
```

---

## Compile and Run

```bash
# Compile
g++ -o min_heap_test min_heap_test.cpp

# Run
./min_heap_test
```

---

## Applications

- Priority Queues
- Heap Sort algorithm
- Finding k smallest elements
- Graph algorithms (Dijkstra's, Prim's)
- Task scheduling

