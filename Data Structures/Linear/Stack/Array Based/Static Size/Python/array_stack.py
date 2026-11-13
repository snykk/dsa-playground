"""
Static-Size Array-Based Stack implementation in Python.

A stack backed by a preallocated list of fixed capacity that follows the
Last-In-First-Out (LIFO) principle. The list is created once and never
grows: pushing onto a full stack raises OverflowError.
"""


class ArrayStack:
    """
    Fixed-capacity array-based stack data structure.

    Supported operations:
        - push: Add a value to the top of the stack (fails when full).
        - pop: Remove and return the top value.
        - peek: View the top value without removing it.
        - is_empty: Check whether the stack is empty.
        - size: Return the number of elements in the stack.
    """

    def __init__(self, capacity=100):
        """
        Initialize an empty stack with a fixed capacity.

        Args:
            capacity: The maximum number of items (default 100).

        Raises:
            ValueError: If capacity is less than 1.
        """
        if capacity < 1:
            raise ValueError("Capacity must be at least 1")
        self.capacity = capacity
        self.stack = [None] * capacity
        self.top = -1

    def push(self, value):
        """
        Push a value onto the top of the stack.

        Args:
            value: The value to push.

        Raises:
            OverflowError: If the stack is full.

        Time Complexity: O(1)
        """
        if self.top == self.capacity - 1:
            raise OverflowError("Stack overflow")
        self.top += 1
        self.stack[self.top] = value

    def pop(self):
        """
        Remove and return the value at the top of the stack.

        Returns:
            The value at the top of the stack.

        Raises:
            IndexError: If the stack is empty.

        Time Complexity: O(1)
        """
        if self.is_empty():
            raise IndexError("Pop from empty stack")
        value = self.stack[self.top]
        self.stack[self.top] = None  # do not keep the popped object alive
        self.top -= 1
        return value

    def peek(self):
        """
        Return the value at the top of the stack without removing it.

        Returns:
            The value at the top of the stack.

        Raises:
            IndexError: If the stack is empty.

        Time Complexity: O(1)
        """
        if self.is_empty():
            raise IndexError("Peek from empty stack")
        return self.stack[self.top]

    def is_empty(self):
        """
        Check whether the stack is empty.

        Returns:
            True if the stack contains no elements, False otherwise.

        Time Complexity: O(1)
        """
        return self.top == -1

    def size(self):
        """
        Return the number of elements in the stack.

        Returns:
            The current size of the stack.

        Time Complexity: O(1)
        """
        return self.top + 1
