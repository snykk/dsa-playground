import unittest
from array_stack import ArrayStack

class TestArrayStack(unittest.TestCase):
    def test_push_pop(self):
        s = ArrayStack()
        s.push(10)
        s.push(20)
        self.assertEqual(s.pop(), 20)
        self.assertEqual(s.pop(), 10)

    def test_peek(self):
        s = ArrayStack()
        s.push(5)
        self.assertEqual(s.peek(), 5)
        s.push(15)
        self.assertEqual(s.peek(), 15)

    def test_is_empty_size(self):
        s = ArrayStack()
        self.assertTrue(s.is_empty())
        s.push(1)
        self.assertFalse(s.is_empty())
        self.assertEqual(s.size(), 1)

if __name__ == "__main__":
    unittest.main()
