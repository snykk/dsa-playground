"""
Static-Size Array-Based Stack implementation in Python.

A stack backed by a Python list that follows the Last-In-First-Out
(LIFO) principle. Although Python lists are inherently dynamic, this
implementation represents the static-size stack concept.
"""


class ArrayStack:
    """
    Array-based stack data structure.

    Supported operations:
        - push: Add a value to the top of the stack.
        - pop: Remove and return the top value.
        - peek: View the top value without removing it.
        - is_empty: Check whether the stack is empty.
        - size: Return the number of elements in the stack.
    """

    def __init__(self):
        """
        Initialize an empty stack.
        """
        self.stack = []

    def push(self, value):
        """
        Push a value onto the top of the stack.

        Args:
            value: The value to push.

        Time Complexity: O(1)
        """
        self.stack.append(value)

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
        return self.stack.pop()

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
        return self.stack[-1]

    def is_empty(self):
        """
        Check whether the stack is empty.

        Returns:
            True if the stack contains no elements, False otherwise.

        Time Complexity: O(1)
        """
        return len(self.stack) == 0

    def size(self):
        """
        Return the number of elements in the stack.

        Returns:
            The current size of the stack.

        Time Complexity: O(1)
        """
        return len(self.stack)
