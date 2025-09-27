class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class SinglyLinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, data):
        node = Node(data)
        node.next = self.head
        self.head = node

    def insert_at_tail(self, data):
        node = Node(data)
        if not self.head:
            self.head = node
            return
        curr = self.head
        while curr.next:
            curr = curr.next
        curr.next = node

    def delete(self, key):
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
        elems = []
        curr = self.head
        while curr:
            elems.append(curr.data)
            curr = curr.next
        return elems
