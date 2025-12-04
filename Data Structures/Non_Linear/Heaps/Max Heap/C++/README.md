# Max Heap - C++

This folder contains a C++ implementation of a **Max Heap**.

A **Max Heap** is a complete binary tree where the parent node is always greater than or equal to its children. The maximum element is always at the root.

---

## Concept

- **Complete Binary Tree**: All levels are filled except possibly the last
- **Heap Property**: Parent ≥ Children (max heap property)
- **Array Representation**: Efficient storage using vector
- **Root is Maximum**: Largest element is always at root
- **O(log n) Operations**: Insert and extract operations are O(log n)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `insert(value)`         | Insert value into heap               | O(log n)        |
| `extract_max()`          | Remove and return maximum element    | O(log n)        |
| `peek()`                 | Get maximum element without removing | O(1)            |
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
#include "max_heap.cpp"
#include <vector>
using namespace std;

// Create empty heap
MaxHeap heap;

// Insert elements
heap.insert(5);
heap.insert(3);
heap.insert(7);
heap.insert(1);

// Peek maximum
cout << heap.peek() << endl;  // 7

// Extract maximum
cout << heap.extract_max() << endl;  // 7
cout << heap.extract_max() << endl;  // 5

// Build heap from array
vector<int> arr = {5, 3, 7, 1, 9, 2};
MaxHeap heap2(arr);
while (!heap2.is_empty()) {
    cout << heap2.extract_max() << endl;  // 9, 7, 5, 3, 2, 1
}
```

---

## Compile and Run

```bash
# Compile
g++ -o max_heap_test max_heap_test.cpp

# Run
./max_heap_test
```

---

## Applications

- Priority Queues (higher value = higher priority)
- Heap Sort algorithm (descending order)
- Finding k largest elements
- Task scheduling with priority

