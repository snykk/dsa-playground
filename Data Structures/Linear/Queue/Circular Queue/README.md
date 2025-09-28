# Circular Queue - Python

This folder contains a **Circular Queue** implementation in Python.

A **Circular Queue** is a linear data structure that overcomes the limitation of the simple queue by connecting the rear of the queue back to the front, forming a circle. This allows for efficient use of storage without shifting elements during dequeue operations.

---

## Concept

- Circular Queue avoids wasted space caused by dequeuing from a simple array-based queue.
- Front and Rear pointers wrap around to the beginning of the queue once the end is reached.
- Fixed-size queues are common, often implemented with arrays.

---

## Operations

| Operation       | Description                               |
| --------------- | ----------------------------------------- |
| `enqueue(item)` | Add item to the rear of the queue         |
| `dequeue()`     | Remove and return the front item          |
| `peek()`        | Return the front item without removing it |
| `is_empty()`    | Check if the queue has no elements        |
| `is_full()`     | Check if the queue has reached capacity   |
| `size()`        | Number of elements in the queue           |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Enqueue   | O(1)            | O(n)             |
| Dequeue   | O(1)            | O(n)             |
| Peek      | O(1)            | O(n)             |
| is_empty  | O(1)            | O(1)             |
| is_full   | O(1)            | O(1)             |
