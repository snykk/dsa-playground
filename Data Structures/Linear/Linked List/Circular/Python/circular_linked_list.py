"""
Circular Linked List implementation in Python.

A circular linked list is a variation of a linked list where the last node
points back to the head, forming a circle. There is no None-terminated end.
"""


class Node:
    """
    A node in a circular linked list.

    Attributes:
        data: The value stored in this node.
        next: Reference to the next node in the circle.
    """

    def __init__(self, data):
        """
        Initialize a new node with the given data.

        Args:
            data: The value to store in this node.
        """
        self.data = data
        self.next = None

class CircularLinkedList:
    """
    Circular Linked List data structure.

    Supported operations:
        - insert_at_head: Insert a node at the beginning of the list.
        - insert_at_tail: Insert a node at the end of the list.
        - delete_value: Remove the first node matching a given key.
        - traverse: Collect elements into a list up to a given limit.
    """

    def __init__(self):
        """
        Initialize an empty circular linked list.
        """
        self.head = None

    def insert_at_head(self, data):
        """
        Insert a new node at the head of the circular list.

        The new node becomes the head, and the tail's next pointer is
        updated to reference the new head.

        Args:
            data: The value to insert.

        Time Complexity: O(n) due to traversal to find the tail node.
        """
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            new_node.next = self.head
            return
        temp = self.head
        while temp.next != self.head:
            temp = temp.next
        new_node.next = self.head
        self.head = new_node
        temp.next = self.head

    def insert_at_tail(self, data):
        """
        Insert a new node at the tail of the circular list.

        The new node is placed after the current last node and its next
        pointer references the head.

        Args:
            data: The value to insert.

        Time Complexity: O(n) due to traversal to find the tail node.
        """
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            new_node.next = self.head
            return
        temp = self.head
        while temp.next != self.head:
            temp = temp.next
        temp.next = new_node
        new_node.next = self.head

    def delete_value(self, key):
        """
        Delete the first node whose data matches the given key.

        Handles deletion of the head node by updating the tail's next
        pointer to the new head.

        Args:
            key: The value to search for and remove.

        Time Complexity: O(n)
        """
        if not self.head:
            return
        curr = self.head
        prev = None
        while True:
            if curr.data == key:
                if prev:
                    prev.next = curr.next
                else:  # deleting head
                    tail = self.head
                    while tail.next != self.head:
                        tail = tail.next
                    self.head = curr.next
                    tail.next = self.head
                return
            prev = curr
            curr = curr.next
            if curr == self.head:
                break

    def traverse(self, limit=10):
        """
        Collect all elements in the circular list up to a given limit.

        Traverses from the head and stops when it returns to the head
        or the limit is reached, preventing infinite loops.

        Args:
            limit: Maximum number of elements to collect (default 10).

        Returns:
            A list of element values in traversal order.

        Time Complexity: O(min(n, limit))
        """
        elements = []
        if not self.head:
            return elements
        temp = self.head
        count = 0
        while True:
            elements.append(temp.data)
            temp = temp.next
            count += 1
            if temp == self.head or count >= limit:
                break
        return elements
