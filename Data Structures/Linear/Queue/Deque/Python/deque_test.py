import unittest
from deque import Deque

class TestDeque(unittest.TestCase):
    def setUp(self):
        self.dq = Deque()

    def test_push_front_pop_front(self):
        self.dq.push_front(1)
        self.dq.push_front(2)
        self.assertEqual(self.dq.pop_front(), 2)
        self.assertEqual(self.dq.pop_front(), 1)

    def test_push_back_pop_back(self):
        self.dq.push_back(1)
        self.dq.push_back(2)
        self.assertEqual(self.dq.pop_back(), 2)
        self.assertEqual(self.dq.pop_back(), 1)

    def test_mixed_operations(self):
        self.dq.push_front(1)
        self.dq.push_back(2)
        self.dq.push_front(3)
        self.dq.push_back(4)
        # Deque should be: [3, 1, 2, 4]
        self.assertEqual(self.dq.peek_front(), 3)
        self.assertEqual(self.dq.peek_back(), 4)
        self.assertEqual(self.dq.size(), 4)

    def test_pop_front(self):
        self.dq.push_back(1)
        self.dq.push_back(2)
        self.assertEqual(self.dq.pop_front(), 1)
        self.assertEqual(self.dq.pop_front(), 2)

    def test_pop_back(self):
        self.dq.push_front(1)
        self.dq.push_front(2)
        self.assertEqual(self.dq.pop_back(), 1)
        self.assertEqual(self.dq.pop_back(), 2)

    def test_is_empty(self):
        self.assertTrue(self.dq.is_empty())
        self.dq.push_front(1)
        self.assertFalse(self.dq.is_empty())
        self.dq.pop_front()
        self.assertTrue(self.dq.is_empty())

    def test_size(self):
        self.assertEqual(self.dq.size(), 0)
        self.dq.push_front(1)
        self.dq.push_back(2)
        self.assertEqual(self.dq.size(), 2)
        self.dq.pop_front()
        self.assertEqual(self.dq.size(), 1)

    def test_peek_front_empty(self):
        with self.assertRaises(IndexError):
            self.dq.peek_front()

    def test_peek_back_empty(self):
        with self.assertRaises(IndexError):
            self.dq.peek_back()

    def test_pop_front_empty(self):
        with self.assertRaises(IndexError):
            self.dq.pop_front()

    def test_pop_back_empty(self):
        with self.assertRaises(IndexError):
            self.dq.pop_back()

    def test_display(self):
        self.dq.push_front(1)
        self.dq.push_back(2)
        self.dq.push_front(3)
        result = self.dq.display()
        self.assertEqual(result, [3, 1, 2])

if __name__ == "__main__":
    unittest.main()

