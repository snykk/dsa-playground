# Priority Queue - Python

This folder contains a Python implementation of a **Priority Queue** using a min heap.

A **Priority Queue** is an abstract data type where each element has a priority. Elements are served based on priority rather than insertion order. Elements with higher priority (lower priority value in min heap) are served before elements with lower priority.

---

## Concept

- Priority Queue uses a **min heap** internally
- Lower priority values = higher priority (served first)
- For max heap behavior, negate priority values
- Maintains insertion order for elements with the same priority
- Implemented using Python's `heapq` module for efficiency

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

```python
from priority_queue import PriorityQueue

pq = PriorityQueue()

# Add items with priorities
pq.enqueue("urgent task", 1)
pq.enqueue("normal task", 5)
pq.enqueue("low priority task", 10)

# Items are dequeued based on priority (lower number = higher priority)
print(pq.dequeue())  # Output: "urgent task"
print(pq.dequeue())  # Output: "normal task"
print(pq.dequeue())  # Output: "low priority task"
```

### Max Heap Behavior

To use as a max heap (higher priority value = higher priority):

```python
pq = PriorityQueue()
pq.enqueue("item1", -10)  # Negate for max heap
pq.enqueue("item2", -5)
pq.enqueue("item3", -1)
# Now item3 (priority -1) will be dequeued first
```

### Same Priority Handling

Items with the same priority maintain insertion order:

```python
pq = PriorityQueue()
pq.enqueue("first", 1)
pq.enqueue("second", 1)
pq.enqueue("third", 1)
# Dequeued in order: first, second, third
```

---

## Run Test

```bash
python -m unittest priority_queue_test.py
```

Or:

```bash
python priority_queue_test.py
```

---

## Notes

- This implementation uses Python's built-in `heapq` module which provides efficient heap operations
- The implementation maintains a counter to preserve insertion order for items with equal priority
- For production use, consider using `queue.PriorityQueue` from Python's standard library for thread-safe operations

