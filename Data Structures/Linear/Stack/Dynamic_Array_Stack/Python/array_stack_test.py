import unittest
from array_stack import ArrayStack

class TestArrayStack(unittest.TestCase):
    def test_stack_operations(self):
        stack = ArrayStack()
        stack.push(10)
        stack.push(20)
        stack.push(30)

        self.assertEqual(stack.peek(), 30)
        self.assertEqual(stack.pop(), 30)
        self.assertEqual(stack.pop(), 20)
        self.assertFalse(stack.is_empty())
        self.assertEqual(stack.pop(), 10)
        self.assertTrue(stack.is_empty())

    def test_empty_pop_and_peek(self):
        stack = ArrayStack()
        with self.assertRaises(IndexError):
            stack.pop()
        with self.assertRaises(IndexError):
            stack.peek()

    def test_growth_and_lifo_order(self):
        stack = ArrayStack()
        for i in range(1000):
            stack.push(i)
        self.assertEqual(stack.size(), 1000)
        self.assertEqual([stack.pop() for _ in range(1000)], list(range(999, -1, -1)))
        self.assertTrue(stack.is_empty())

if __name__ == "__main__":
    unittest.main()
