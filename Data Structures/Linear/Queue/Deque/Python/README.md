# Deque (Double-Ended Queue) - Python

This folder contains a Python implementation of a **Deque** (Double-Ended Queue).

A **Deque** is a linear data structure that allows insertion and deletion of elements from both ends (front and back). It combines the functionality of both stacks and queues, making it a versatile data structure.

---

## Concept

- Deque stands for "Double-Ended Queue"
- Elements can be added or removed from both the front and the back
- Can be used as both a stack (LIFO) and a queue (FIFO)
- This implementation uses a Python list, which provides O(1) operations for append/pop from the end, but O(n) for insert/pop from the front

---

## Operations

| Operation           | Description                                    |
| ------------------- | ---------------------------------------------- |
| `push_front(item)`  | Add item to the front of the deque            |
| `push_back(item)`   | Add item to the back of the deque             |
| `pop_front()`       | Remove and return the front item               |
| `pop_back()`        | Remove and return the back item                |
| `peek_front()`      | Return the front item without removing it      |
| `peek_back()`       | Return the back item without removing it       |
| `is_empty()`        | Check if the deque has no elements             |
| `size()`            | Return the number of elements in the deque     |
| `display()`         | Return a list representation of the deque      |

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

**Note:** Using a list for deque operations results in O(n) for front operations. For O(1) operations on both ends, consider using `collections.deque` from Python's standard library or a doubly-linked list implementation.

---

## Usage

```python
from deque import Deque

dq = Deque()

# Add elements from both ends
dq.push_front(1)
dq.push_back(2)
dq.push_front(3)
dq.push_back(4)
# Deque: [3, 1, 2, 4]

# Peek at both ends
print(dq.peek_front())  # Output: 3
print(dq.peek_back())   # Output: 4

# Remove from both ends
print(dq.pop_front())   # Output: 3
print(dq.pop_back())    # Output: 4

# Check size and emptiness
print(dq.size())        # Output: 2
print(dq.is_empty())    # Output: False
```

---

## Run Test

```bash
python -m unittest deque_test.py
```

Or:

```bash
python deque_test.py
```

