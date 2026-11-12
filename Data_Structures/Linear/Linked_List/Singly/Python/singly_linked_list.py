"""
Singly Linked List implementation in Python.

A singly linked list is a linear data structure where each node contains
data and a reference to the next node. Traversal is only possible in the
forward direction.
"""


class Node:
    """
    A node in a singly linked list.

    Attributes:
        data: The value stored in this node.
        next: Reference to the next node, or None if this is the last node.
    """

    def __init__(self, data):
        """
        Initialize a new node with the given data.

        Args:
            data: The value to store in this node.
        """
        self.data = data
        self.next = None

class SinglyLinkedList:
    """
    Singly Linked List data structure.

    Supported operations:
        - insert_at_head: Insert a node at the beginning of the list.
        - insert_at_tail: Insert a node at the end of the list.
        - delete: Remove the first node matching a given key.
        - display: Return all elements as a list.
    """

    def __init__(self):
        """
        Initialize an empty singly linked list.
        """
        self.head = None

    def insert_at_head(self, data):
        """
        Insert a new node at the head of the list.

        Args:
            data: The value to insert.

        Time Complexity: O(1)
        """
        node = Node(data)
        node.next = self.head
        self.head = node

    def insert_at_tail(self, data):
        """
        Insert a new node at the tail of the list.

        Args:
            data: The value to insert.

        Time Complexity: O(n)
        """
        node = Node(data)
        if not self.head:
            self.head = node
            return
        curr = self.head
        while curr.next:
            curr = curr.next
        curr.next = node

    def delete(self, key):
        """
        Delete the first node whose data matches the given key.

        Args:
            key: The value to search for and remove.

        Time Complexity: O(n)
        """
        curr = self.head
        prev = None
        while curr and curr.data != key:
            prev = curr
            curr = curr.next
        if not curr:
            return
        if prev:
            prev.next = curr.next
        else:
            self.head = curr.next

    def display(self):
        """
        Collect all node values into a list.

        Returns:
            A list of all element values in order from head to tail.

        Time Complexity: O(n)
        """
        elems = []
        curr = self.head
        while curr:
            elems.append(curr.data)
            curr = curr.next
        return elems
