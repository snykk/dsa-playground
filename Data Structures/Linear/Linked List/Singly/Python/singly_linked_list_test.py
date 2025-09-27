import unittest
from singly_linked_list import SinglyLinkedList

class TestSinglyLinkedList(unittest.TestCase):
    def setUp(self):
        self.ll = SinglyLinkedList()

    def test_insert_head_tail(self):
        self.ll.insert_at_head(1)
        self.ll.insert_at_tail(2)
        self.assertEqual(self.ll.display(), [1,2])

    def test_delete(self):
        self.ll.insert_at_head(1)
        self.ll.insert_at_head(2)
        self.ll.delete(2)
        self.assertEqual(self.ll.display(), [1])

if __name__ == "__main__":
    unittest.main()
