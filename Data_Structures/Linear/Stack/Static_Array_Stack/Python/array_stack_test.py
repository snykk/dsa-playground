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

    def test_overflow(self):
        s = ArrayStack(3)
        for i in range(3):
            s.push(i)
        self.assertEqual(s.size(), 3)
        with self.assertRaises(OverflowError):
            s.push(3)
        self.assertEqual(s.pop(), 2)
        s.push(9)
        self.assertEqual(s.peek(), 9)

    def test_invalid_capacity(self):
        for bad in (0, -1):
            with self.assertRaises(ValueError):
                ArrayStack(bad)

    def test_empty_pop_and_peek(self):
        s = ArrayStack(2)
        with self.assertRaises(IndexError):
            s.pop()
        with self.assertRaises(IndexError):
            s.peek()

    def test_default_capacity_is_bounded(self):
        s = ArrayStack()
        for i in range(100):
            s.push(i)
        with self.assertRaises(OverflowError):
            s.push(100)

if __name__ == "__main__":
    unittest.main()
