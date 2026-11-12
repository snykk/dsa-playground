import unittest
from linked_list_stack import LinkedListStack

class TestLinkedListStack(unittest.TestCase):
    def test_push_pop(self):
        s = LinkedListStack()
        s.push(1)
        s.push(2)
        self.assertEqual(s.pop(), 2)
        self.assertEqual(s.pop(), 1)

    def test_peek(self):
        s = LinkedListStack()
        s.push(5)
        self.assertEqual(s.peek(), 5)
        s.push(10)
        self.assertEqual(s.peek(), 10)

    def test_is_empty_size(self):
        s = LinkedListStack()
        self.assertTrue(s.is_empty())
        s.push(1)
        self.assertFalse(s.is_empty())
        self.assertEqual(s.size(), 1)

    def test_empty_pop_and_peek(self):
        s = LinkedListStack()
        with self.assertRaises(IndexError):
            s.pop()
        with self.assertRaises(IndexError):
            s.peek()

    def test_lifo_order_and_size(self):
        s = LinkedListStack()
        for i in range(100):
            s.push(i)
        self.assertEqual(s.size(), 100)
        self.assertEqual([s.pop() for _ in range(100)], list(range(99, -1, -1)))
        self.assertEqual(s.size(), 0)
        self.assertTrue(s.is_empty())

if __name__ == "__main__":
    unittest.main()
