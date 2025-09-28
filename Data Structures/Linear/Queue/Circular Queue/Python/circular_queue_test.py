import unittest
from circular_queue import CircularQueue

class TestCircularQueue(unittest.TestCase):

    def setUp(self):
        self.q = CircularQueue(3)

    def test_enqueue_dequeue(self):
        self.q.enqueue(1)
        self.q.enqueue(2)
        self.q.enqueue(3)
        self.assertTrue(self.q.is_full())
        self.assertEqual(self.q.dequeue(), 1)
        self.q.enqueue(4)
        self.assertEqual(self.q.peek(), 2)
        self.assertEqual(self.q.size(), 3)

    def test_empty_queue(self):
        self.assertTrue(self.q.is_empty())
        with self.assertRaises(IndexError):
            self.q.dequeue()

    def test_full_queue(self):
        self.q.enqueue(1)
        self.q.enqueue(2)
        self.q.enqueue(3)
        with self.assertRaises(OverflowError):
            self.q.enqueue(4)

if __name__ == "__main__":
    unittest.main()
