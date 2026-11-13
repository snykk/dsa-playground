class SimpleQueue:
    """Simple array-based queue implementation (FIFO)."""

    def __init__(self):
        self.queue = []

    def enqueue(self, item):
        """Add item to the end of the queue."""
        self.queue.append(item)

    def dequeue(self):
        """Remove and return item from the front of the queue."""
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.queue.pop(0)

    def peek(self):
        """Return the front item without removing it."""
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.queue[0]

    def is_empty(self):
        return len(self.queue) == 0

    def size(self):
        return len(self.queue)
