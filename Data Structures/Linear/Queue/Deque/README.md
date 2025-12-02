# Deque (Double-Ended Queue)

A **Deque** (pronounced "deck") is a linear data structure that allows insertion and deletion of elements from both ends (front and back). It combines the functionality of both stacks (LIFO) and queues (FIFO), making it a versatile data structure.

---

## Overview

Unlike a regular queue where elements can only be added at the rear and removed from the front, a deque allows operations on both ends:

- **Front operations**: Add/remove from the beginning
- **Back operations**: Add/remove from the end

This dual-ended nature makes deques useful in various scenarios:
- Implementing both stacks and queues
- Sliding window problems
- Palindrome checking
- Undo/redo functionality
- Task scheduling algorithms

---

## Key Characteristics

1. **Double-Ended Access**: Elements can be inserted or removed from either end
2. **Flexible Usage**: Can function as a stack, queue, or both
3. **Dynamic Size**: Can grow and shrink as needed (in dynamic implementations)
4. **Efficient Operations**: O(1) operations on both ends (with proper implementation)

---

## Operations

| Operation      | Description                                    | Time Complexity* |
| -------------- | ---------------------------------------------- | ---------------- |
| `push_front()` | Add element to the front                       | O(1) or O(n)     |
| `push_back()`  | Add element to the back                        | O(1)             |
| `pop_front()`  | Remove and return element from the front        | O(1) or O(n)     |
| `pop_back()`   | Remove and return element from the back         | O(1)             |
| `peek_front()` | View the front element without removing it      | O(1)             |
| `peek_back()`  | View the back element without removing it       | O(1)             |
| `is_empty()`   | Check if the deque is empty                     | O(1)             |
| `size()`       | Get the number of elements in the deque         | O(1)             |

\* *Time complexity depends on the underlying implementation. Array/slice-based implementations may have O(n) for front operations, while doubly-linked list implementations achieve O(1) for all operations.*

---

## Implementation Approaches

### 1. Array/Slice-Based (Current Implementation)
- **Pros**: Simple, cache-friendly, easy to understand
- **Cons**: O(n) operations on front (insert/delete at index 0)
- **Use Case**: When back operations are more frequent

### 2. Doubly-Linked List
- **Pros**: O(1) operations on both ends
- **Cons**: More memory overhead, less cache-friendly
- **Use Case**: When both ends are frequently accessed

### 3. Circular Buffer
- **Pros**: Fixed size, efficient memory usage
- **Cons**: Limited capacity, requires size management
- **Use Case**: When maximum size is known

---

## Applications

1. **Sliding Window Problems**: Efficiently maintain window boundaries
2. **Palindrome Checking**: Compare characters from both ends
3. **Undo/Redo Operations**: Maintain history stack
4. **Task Scheduling**: Priority-based task management
5. **Expression Evaluation**: Infix to postfix conversion
6. **BFS Variants**: Some graph traversal algorithms

---

## Example Use Cases

### As a Stack (LIFO)
```python
dq = Deque()
dq.push_back(1)  # Push
dq.push_back(2)
dq.pop_back()    # Pop (returns 2)
```

### As a Queue (FIFO)
```python
dq = Deque()
dq.push_back(1)  # Enqueue
dq.push_back(2)
dq.pop_front()   # Dequeue (returns 1)
```

### Mixed Operations
```python
dq = Deque()
dq.push_front(1)  # Add to front
dq.push_back(2)   # Add to back
dq.push_front(3)  # Add to front
# Deque: [3, 1, 2]
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List-based implementation
- **C++** (`C++/`) - Vector-based implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Operation    | Array/Slice | Doubly-Linked List |
| ------------ | ----------- | ------------------ |
| push_front   | O(n)        | O(1)               |
| push_back    | O(1)        | O(1)               |
| pop_front    | O(n)        | O(1)               |
| pop_back     | O(1)        | O(1)               |
| peek_front   | O(1)        | O(1)               |
| peek_back    | O(1)        | O(1)               |
| Space        | O(n)        | O(n)               |

---

## Related Data Structures

- **Queue**: Single-ended (FIFO)
- **Stack**: Single-ended (LIFO)
- **Circular Queue**: Fixed-size queue with wraparound
- **Priority Queue**: Queue with priority ordering

---

## Further Reading

- [Deque on Wikipedia](https://en.wikipedia.org/wiki/Double-ended_queue)
- Standard library implementations:
  - Python: `collections.deque`
  - C++: `std::deque`
  - Java: `java.util.ArrayDeque`

---

**Note**: The implementations in this folder use array/slice-based approaches for simplicity. For production use, consider using standard library implementations or doubly-linked list structures for optimal O(1) performance on both ends.

