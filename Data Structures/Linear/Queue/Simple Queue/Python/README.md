# Simple Queue - Python

This folder contains a Python implementation of a **Simple Queue** (FIFO).

## Usage

```python
from simple_queue import SimpleQueue

q = SimpleQueue()
q.enqueue(1)
q.enqueue(2)
print(q.dequeue())  # Output: 1
print(q.peek())     # Output: 2
```

---

## Run Test

```bash
python -m unittest simple_queue_test.py
```
