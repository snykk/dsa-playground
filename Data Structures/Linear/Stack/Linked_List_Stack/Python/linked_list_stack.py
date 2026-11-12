"""
Linked List-Based Stack implementation in Python.

A stack implemented using a singly linked list. Each push/pop operates
on the head of the list, providing O(1) time for all core operations
without a fixed capacity limit.
"""


class Node:
    """
    A node in the linked list underlying the stack.

    Attributes:
        value: The value stored in this node.
        next: Reference to the next node below in the stack.
    """

    def __init__(self, value):
        """
        Initialize a new node with the given value.

        Args:
            value: The value to store in this node.
        """
        self.value = value
        self.next = None

class LinkedListStack:
    """
    Stack data structure backed by a singly linked list.

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
        self.top = None
        self._size = 0

    def push(self, value):
        """
        Push a value onto the top of the stack.

        Args:
            value: The value to push.

        Time Complexity: O(1)
        """
        new_node = Node(value)
        new_node.next = self.top
        self.top = new_node
        self._size += 1

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
        value = self.top.value
        self.top = self.top.next
        self._size -= 1
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
        return self.top.value

    def is_empty(self):
        """
        Check whether the stack is empty.

        Returns:
            True if the stack has no elements, False otherwise.

        Time Complexity: O(1)
        """
        return self.top is None

    def size(self):
        """
        Return the number of elements in the stack.

        Returns:
            The current size of the stack.

        Time Complexity: O(1)
        """
        return self._size
