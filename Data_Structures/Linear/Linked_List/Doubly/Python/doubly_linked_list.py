"""
Doubly Linked List implementation in Python.

A doubly linked list is a linear data structure where each node contains
data, a reference to the next node, and a reference to the previous node.
This allows traversal in both forward and backward directions.
"""


class Node:
    """
    A node in a doubly linked list.

    Attributes:
        data: The value stored in this node.
        prev: Reference to the previous node, or None if this is the first node.
        next: Reference to the next node, or None if this is the last node.
    """

    def __init__(self, data):
        """
        Initialize a new node with the given data.

        Args:
            data: The value to store in this node.
        """
        self.data = data
        self.prev = None
        self.next = None

class DoublyLinkedList:
    """
    Doubly Linked List data structure.

    Supported operations:
        - insert_at_head: Insert a node at the beginning of the list.
        - insert_at_tail: Insert a node at the end of the list.
        - delete_value: Remove the first node matching a given value.
        - traverse_forward: Print all elements from head to tail.
        - traverse_backward: Print all elements from tail to head.
    """

    def __init__(self):
        """
        Initialize an empty doubly linked list.
        """
        self.head = None

    def insert_at_head(self, data):
        """
        Insert a new node at the head of the list.

        Args:
            data: The value to insert.

        Time Complexity: O(1)
        """
        new_node = Node(data)
        if self.head:
            self.head.prev = new_node
            new_node.next = self.head
        self.head = new_node

    def insert_at_tail(self, data):
        """
        Insert a new node at the tail of the list.

        Args:
            data: The value to insert.

        Time Complexity: O(n)
        """
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        temp = self.head
        while temp.next:
            temp = temp.next
        temp.next = new_node
        new_node.prev = temp

    def delete_value(self, data):
        """
        Delete the first node whose data matches the given value.

        Args:
            data: The value to search for and remove.

        Returns:
            True if the value was found and deleted, False otherwise.

        Time Complexity: O(n)
        """
        temp = self.head
        while temp:
            if temp.data == data:
                if temp.prev:
                    temp.prev.next = temp.next
                else:
                    self.head = temp.next
                if temp.next:
                    temp.next.prev = temp.prev
                return True
            temp = temp.next
        return False

    def traverse_forward(self):
        """
        Print all elements from head to tail.

        Prints each node's data followed by " -> " and ends with "None".

        Time Complexity: O(n)
        """
        temp = self.head
        while temp:
            print(temp.data, end=" -> ")
            temp = temp.next
        print("None")

    def traverse_backward(self):
        """
        Print all elements from tail to head.

        Traverses to the last node first, then prints each node's data
        in reverse order followed by " -> " and ends with "None".

        Time Complexity: O(n)
        """
        temp = self.head
        if not temp:
            print("None")
            return
        while temp.next:
            temp = temp.next
        while temp:
            print(temp.data, end=" -> ")
            temp = temp.prev
        print("None")
