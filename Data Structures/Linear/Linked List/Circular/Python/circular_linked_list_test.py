import unittest
from circular_linked_list import CircularLinkedList

class TestCircularLinkedList(unittest.TestCase):
    def setUp(self):
        self.cll = CircularLinkedList()

    def test_insert_and_traverse(self):
        self.cll.insert_at_head(10)
        self.cll.insert_at_head(20)
        self.cll.insert_at_tail(30)
        self.assertEqual(self.cll.traverse(5), [20, 10, 30])

    def test_delete_value(self):
        self.cll.insert_at_head(1)
        self.cll.insert_at_tail(2)
        self.cll.insert_at_tail(3)
        self.cll.delete_value(2)
        self.assertEqual(self.cll.traverse(5), [1,3])

if __name__ == "__main__":
    unittest.main()
