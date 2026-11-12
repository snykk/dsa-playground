# Linear Data Structures

This folder contains implementations of **Linear Data Structures** - data structures where elements are arranged in a sequential manner.

---

## Overview

Linear data structures are fundamental building blocks in computer science where elements are stored in a linear (sequential) order. Each element has a unique predecessor and successor (except the first and last elements).

---

## Data Structures

### 1. Array
- **Static Array**: Fixed-size array
- **Dynamic Array**: Resizable array
- **Multi-dimensional Array**: 2D, 3D arrays

### 2. String
- **String Manipulation**: Basic string operations
- **Pattern Matching**: String search algorithms
- **Introduction**: String fundamentals

### 3. Linked List
- **Singly Linked List**: One-way linked list
- **Doubly Linked List**: Two-way linked list
- **Circular Linked List**: Circular linked list

### 4. Stack
- **Static_Array_Stack** and **Dynamic_Array_Stack**: array-backed, fixed or growing capacity
- **Linked_List_Stack**: one linked node per item

### 5. Queue
- **Simple Queue**: Basic FIFO queue
- **Circular Queue**: Circular buffer implementation
- **Deque**: Double-ended queue
- **Priority Queue**: Priority-based queue

---

## Characteristics

- **Sequential Access**: Elements accessed in order
- **Linear Memory**: Elements stored contiguously (arrays) or linked (linked lists)
- **Simple Structure**: Easier to understand and implement
- **Foundation**: Building blocks for more complex structures

---

## Common Operations

| Operation | Array | Linked List | Stack | Queue |
| --------- | ----- | ----------- | ----- | ----- |
| Access    | O(1)  | O(n)        | O(1)  | O(1)  |
| Search    | O(n)  | O(n)        | O(n)  | O(n)  |
| Insert    | O(n)  | O(1)        | O(1)  | O(1)  |
| Delete    | O(n)  | O(1)        | O(1)  | O(1)  |

---

## Implementations

Each data structure is implemented in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

All implementations include:
- Source code
- Test files
- README documentation

---

## Learning Path

1. **Start with Arrays**: Understand basic sequential storage
2. **Learn Linked Lists**: Understand dynamic memory allocation
3. **Master Stack & Queue**: Understand LIFO and FIFO principles
4. **Explore Advanced**: Priority queues, deques, and string algorithms

---

## Applications

- **Arrays**: Matrix operations, image processing, data storage
- **Linked Lists**: Dynamic memory management, undo/redo operations
- **Stack**: Expression evaluation, function calls, backtracking
- **Queue**: Task scheduling, BFS, buffering
- **String**: Text processing, pattern matching, parsing

