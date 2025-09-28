# Circular Queue - Python

Python implementation of a **Circular Queue** (fixed-size FIFO) using a list.

## Concept

Circular Queue wraps around the end of the array to the front to reuse empty space. Efficient O(1) enqueue/dequeue.

## Usage

```python
from circular_queue import CircularQueue

q = CircularQueue(3)
q.enqueue(10)
q.enqueue(20)
q.enqueue(30)
print(q.dequeue())  # 10
q.enqueue(40)
print(q.peek())     # 20
```

---

## Run Test

```bash
python -m unittest circular_queue_test.py
```
