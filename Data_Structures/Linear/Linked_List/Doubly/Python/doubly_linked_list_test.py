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

    def _forward(self):
        out, temp = [], self.dll.head
        while temp:
            out.append(temp.data)
            temp = temp.next
        return out

    def _backward(self):
        out, temp = [], self.dll.head
        while temp and temp.next:
            temp = temp.next
        while temp:
            out.append(temp.data)
            temp = temp.prev
        return out

    def test_delete_keeps_prev_links(self):
        for v in (1, 2, 3, 4):
            self.dll.insert_at_tail(v)
        self.assertTrue(self.dll.delete_value(2))
        self.assertEqual(self._forward(), [1, 3, 4])
        self.assertEqual(self._backward(), [4, 3, 1])
        self.assertTrue(self.dll.delete_value(1))  # head
        self.assertIsNone(self.dll.head.prev)
        self.assertEqual(self._backward(), [4, 3])
        self.assertTrue(self.dll.delete_value(4))  # tail
        self.assertEqual(self._forward(), [3])
        self.assertEqual(self._backward(), [3])

    def test_delete_only_node_and_missing_key(self):
        self.assertFalse(self.dll.delete_value(1))  # empty list
        self.dll.insert_at_head(5)
        self.assertFalse(self.dll.delete_value(9))
        self.assertTrue(self.dll.delete_value(5))
        self.assertIsNone(self.dll.head)

    def test_delete_removes_first_duplicate_only(self):
        for v in (7, 7, 8):
            self.dll.insert_at_tail(v)
        self.dll.delete_value(7)
        self.assertEqual(self._forward(), [7, 8])
        self.assertEqual(self._backward(), [8, 7])

if __name__ == "__main__":
    unittest.main()
