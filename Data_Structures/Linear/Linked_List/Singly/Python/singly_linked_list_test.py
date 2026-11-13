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

    def test_empty_list(self):
        self.assertEqual(self.ll.display(), [])
        self.ll.delete(1)  # no effect
        self.assertEqual(self.ll.display(), [])

    def test_delete_head_middle_tail_and_only_node(self):
        for v in (1, 2, 3, 4):
            self.ll.insert_at_tail(v)
        self.ll.delete(1)
        self.assertEqual(self.ll.display(), [2, 3, 4])
        self.ll.delete(3)
        self.assertEqual(self.ll.display(), [2, 4])
        self.ll.delete(4)
        self.assertEqual(self.ll.display(), [2])
        self.ll.delete(2)
        self.assertEqual(self.ll.display(), [])
        self.assertIsNone(self.ll.head)

    def test_delete_missing_key(self):
        self.ll.insert_at_tail(1)
        self.ll.delete(9)
        self.assertEqual(self.ll.display(), [1])

    def test_delete_removes_first_duplicate_only(self):
        for v in (5, 5, 6):
            self.ll.insert_at_tail(v)
        self.ll.delete(5)
        self.assertEqual(self.ll.display(), [5, 6])

if __name__ == "__main__":
    unittest.main()
