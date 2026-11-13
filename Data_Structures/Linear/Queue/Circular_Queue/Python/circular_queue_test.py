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

    def test_invalid_capacity(self):
        for bad in (0, -2):
            with self.assertRaises(ValueError):
                CircularQueue(bad)

    def test_wrap_around_many_laps(self):
        q = CircularQueue(3)
        for i in range(20):
            q.enqueue(i)
            self.assertEqual(q.dequeue(), i)
        for i in range(3):
            q.enqueue(i)
        self.assertEqual([q.dequeue() for _ in range(3)], [0, 1, 2])

    def test_capacity_one(self):
        q = CircularQueue(1)
        q.enqueue(7)
        self.assertTrue(q.is_full())
        with self.assertRaises(OverflowError):
            q.enqueue(8)
        self.assertEqual(q.dequeue(), 7)
        self.assertTrue(q.is_empty())

    def test_peek_empty(self):
        with self.assertRaises(IndexError):
            self.q.peek()

if __name__ == "__main__":
    unittest.main()
