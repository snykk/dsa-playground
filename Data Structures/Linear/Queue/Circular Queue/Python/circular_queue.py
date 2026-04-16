"""
Circular Queue (Ring Buffer) implementation in Python.

A circular queue is a linear data structure that uses a fixed-size array
in a circular fashion. When the rear reaches the end of the array, it
wraps around to the beginning, making efficient use of space.
"""


class CircularQueue:
    """
    Circular Queue data structure backed by a fixed-size array.

    Supported operations:
        - enqueue: Add an item to the rear of the queue.
        - dequeue: Remove and return the item at the front of the queue.
        - peek: View the front item without removing it.
        - is_empty: Check whether the queue is empty.
        - is_full: Check whether the queue is at capacity.
        - size: Return the current number of items in the queue.
    """

    def __init__(self, capacity):
        """
        Initialize a circular queue with the given capacity.

        Args:
            capacity: The maximum number of items the queue can hold.
        """
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = -1
        self.rear = -1

    def enqueue(self, item):
        """
        Add an item to the rear of the queue.

        Args:
            item: The value to add.

        Raises:
            OverflowError: If the queue is full.

        Time Complexity: O(1)
        """
        if self.is_full():
            raise OverflowError("Queue is full")
        if self.is_empty():
            self.front = 0
        self.rear = (self.rear + 1) % self.capacity
        self.queue[self.rear] = item

    def dequeue(self):
        """
        Remove and return the item at the front of the queue.

        Returns:
            The value at the front of the queue.

        Raises:
            IndexError: If the queue is empty.

        Time Complexity: O(1)
        """
        if self.is_empty():
            raise IndexError("Queue is empty")
        item = self.queue[self.front]
        if self.front == self.rear:
            self.front = self.rear = -1
        else:
            self.front = (self.front + 1) % self.capacity
        return item

    def peek(self):
        """
        Return the item at the front of the queue without removing it.

        Returns:
            The value at the front of the queue.

        Raises:
            IndexError: If the queue is empty.

        Time Complexity: O(1)
        """
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.queue[self.front]

    def is_empty(self):
        """
        Check whether the queue is empty.

        Returns:
            True if the queue contains no items, False otherwise.

        Time Complexity: O(1)
        """
        return self.front == -1

    def is_full(self):
        """
        Check whether the queue is at capacity.

        Returns:
            True if the queue is full, False otherwise.

        Time Complexity: O(1)
        """
        return (self.rear + 1) % self.capacity == self.front

    def size(self):
        """
        Return the current number of items in the queue.

        Returns:
            The number of items currently in the queue.

        Time Complexity: O(1)
        """
        if self.is_empty():
            return 0
        if self.rear >= self.front:
            return self.rear - self.front + 1
        return self.capacity - self.front + self.rear + 1
