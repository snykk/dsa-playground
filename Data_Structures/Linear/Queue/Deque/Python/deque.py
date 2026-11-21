class Deque:
    """Double-Ended Queue (Deque) implementation using list.
    
    A deque allows insertion and deletion at both ends. This list-backed
    version is O(1) at the back but O(n) at the front, where items shift.
    """

    def __init__(self):
        self.deque = []

    def push_front(self, item):
        """Add item to the front of the deque."""
        self.deque.insert(0, item)

    def push_back(self, item):
        """Add item to the back of the deque."""
        self.deque.append(item)

    def pop_front(self):
        """Remove and return item from the front of the deque."""
        if self.is_empty():
            raise IndexError("Deque is empty")
        return self.deque.pop(0)

    def pop_back(self):
        """Remove and return item from the back of the deque."""
        if self.is_empty():
            raise IndexError("Deque is empty")
        return self.deque.pop()

    def peek_front(self):
        """Return the front item without removing it."""
        if self.is_empty():
            raise IndexError("Deque is empty")
        return self.deque[0]

    def peek_back(self):
        """Return the back item without removing it."""
        if self.is_empty():
            raise IndexError("Deque is empty")
        return self.deque[-1]

    def is_empty(self):
        """Check if the deque is empty."""
        return len(self.deque) == 0

    def size(self):
        """Return the number of elements in the deque."""
        return len(self.deque)

    def display(self):
        """Return a list representation of the deque."""
        return self.deque.copy()

