class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class CircularLinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, data):
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
