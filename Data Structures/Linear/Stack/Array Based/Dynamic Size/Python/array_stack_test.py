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

if __name__ == "__main__":
    unittest.main()
