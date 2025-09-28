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

if __name__ == "__main__":
    unittest.main()
