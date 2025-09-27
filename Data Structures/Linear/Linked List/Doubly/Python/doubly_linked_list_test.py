import unittest
from doubly_linked_list import DoublyLinkedList

class TestDoublyLinkedList(unittest.TestCase):
    def setUp(self):
        self.dll = DoublyLinkedList()

    def test_insert_head(self):
        self.dll.insert_at_head(10)
        self.assertEqual(self.dll.head.data, 10)
        self.dll.insert_at_head(20)
        self.assertEqual(self.dll.head.data, 20)

    def test_insert_tail(self):
        self.dll.insert_at_tail(30)
        self.assertEqual(self.dll.head.data, 30)
        self.dll.insert_at_tail(40)
        temp = self.dll.head
        while temp.next:
            temp = temp.next
        self.assertEqual(temp.data, 40)

    def test_delete_value(self):
        self.dll.insert_at_head(10)
        self.dll.insert_at_tail(20)
        self.dll.insert_at_tail(30)
        self.dll.delete_value(20)
        temp = self.dll.head
        while temp:
            self.assertNotEqual(temp.data, 20)
            temp = temp.next

    def test_traverse_forward_backward(self):
        self.dll.insert_at_head(1)
        self.dll.insert_at_tail(2)
        self.dll.insert_at_tail(3)
        forward = []
        temp = self.dll.head
        while temp:
            forward.append(temp.data)
            temp = temp.next
        backward = []
        temp = self.dll.head
        while temp.next:
            temp = temp.next
        while temp:
            backward.append(temp.data)
            temp = temp.prev
        self.assertEqual(forward, [1,2,3])
        self.assertEqual(backward, [3,2,1])

if __name__ == "__main__":
    unittest.main()
