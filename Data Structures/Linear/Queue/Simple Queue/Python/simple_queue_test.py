import unittest
from simple_queue import SimpleQueue

class TestSimpleQueue(unittest.TestCase):
    def setUp(self):
        self.q = SimpleQueue()

    def test_enqueue_dequeue(self):
        self.q.enqueue(1)
        self.q.enqueue(2)
        self.assertEqual(self.q.dequeue(), 1)
        self.assertEqual(self.q.peek(), 2)

    def test_is_empty(self):
        self.assertTrue(self.q.is_empty())
        self.q.enqueue(1)
        self.assertFalse(self.q.is_empty())

    def test_size(self):
        self.assertEqual(self.q.size(), 0)
        self.q.enqueue(1)
        self.q.enqueue(2)
        self.assertEqual(self.q.size(), 2)

    def test_dequeue_empty(self):
        with self.assertRaises(IndexError):
            self.q.dequeue()

if __name__ == "__main__":
    unittest.main()
