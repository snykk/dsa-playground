# Deque (Double-Ended Queue) - C++

This folder contains a C++ implementation of a **Deque** (Double-Ended Queue).

A **Deque** is a linear data structure that allows insertion and deletion of elements from both ends (front and back). It combines the functionality of both stacks and queues, making it a versatile data structure.

---

## Concept

- Deque stands for "Double-Ended Queue"
- Elements can be added or removed from both the front and the back
- Can be used as both a stack (LIFO) and a queue (FIFO)
- This implementation uses `std::vector`, which provides O(1) operations for push_back/pop_back, but O(n) for push_front/pop_front

---

## Operations

| Operation       | Description                                    |
| --------------- | ---------------------------------------------- |
| `push_front(x)` | Add item to the front of the deque            |
| `push_back(x)`  | Add item to the back of the deque             |
| `pop_front()`   | Remove and return the front item               |
| `pop_back()`    | Remove and return the back item                |
| `peek_front()`  | Return the front item without removing it      |
| `peek_back()`   | Return the back item without removing it       |
| `is_empty()`    | Check if the deque has no elements             |
| `size()`        | Return the number of elements in the deque     |

---

## Complexity

| Operation    | Time Complexity | Space Complexity |
| ------------ | --------------- | ---------------- |
| push_front   | O(n)            | O(1)             |
| push_back    | O(1)            | O(1)             |
| pop_front    | O(n)            | O(1)             |
| pop_back     | O(1)            | O(1)             |
| peek_front   | O(1)            | O(1)             |
| peek_back    | O(1)            | O(1)             |
| is_empty     | O(1)            | O(1)             |
| size         | O(1)            | O(1)             |

**Note:** Using a vector for deque operations results in O(n) for front operations. For O(1) operations on both ends, consider using `std::deque` from the C++ standard library or a doubly-linked list implementation.

---

## Usage

```cpp
#include "deque.cpp"

Deque dq;

// Add elements from both ends
dq.push_front(1);
dq.push_back(2);
dq.push_front(3);
dq.push_back(4);
// Deque: [3, 1, 2, 4]

// Peek at both ends
cout << dq.peek_front() << endl;  // Output: 3
cout << dq.peek_back() << endl;    // Output: 4

// Remove from both ends
cout << dq.pop_front() << endl;   // Output: 3
cout << dq.pop_back() << endl;    // Output: 4

// Check size and emptiness
cout << dq.size() << endl;        // Output: 2
cout << dq.is_empty() << endl;    // Output: 0 (false)
```

---

## Compile and Run

```bash
# Compile
g++ -o deque_test deque_test.cpp

# Run
./deque_test
```

Or compile and run in one command:

```bash
g++ deque_test.cpp -o deque_test && ./deque_test
```

