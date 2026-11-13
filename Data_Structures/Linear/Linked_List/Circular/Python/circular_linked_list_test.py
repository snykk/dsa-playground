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

    def test_delete_only_node(self):
        self.cll.insert_at_head(42)
        self.cll.delete_value(42)
        self.assertEqual(self.cll.traverse(), [])
        self.assertIsNone(self.cll.head)
        self.cll.insert_at_tail(7)
        self.assertEqual(self.cll.traverse(), [7])

    def test_delete_only_node_missing_key(self):
        self.cll.insert_at_head(42)
        self.cll.delete_value(1)
        self.assertEqual(self.cll.traverse(), [42])

    def test_delete_head_and_tail(self):
        for v in (1, 2, 3):
            self.cll.insert_at_tail(v)
        self.cll.delete_value(1)
        self.assertEqual(self.cll.traverse(), [2, 3])
        self.cll.delete_value(3)
        self.assertEqual(self.cll.traverse(), [2])
        self.assertIs(self.cll.head.next, self.cll.head)

    def test_delete_missing_and_empty(self):
        self.cll.delete_value(1)
        for v in (1, 2):
            self.cll.insert_at_tail(v)
        self.cll.delete_value(9)
        self.assertEqual(self.cll.traverse(), [1, 2])

    def test_traverse_is_not_truncated_by_default(self):
        for v in range(15):
            self.cll.insert_at_tail(v)
        self.assertEqual(self.cll.traverse(), list(range(15)))
        self.assertEqual(self.cll.traverse(3), [0, 1, 2])

if __name__ == "__main__":
    unittest.main()
