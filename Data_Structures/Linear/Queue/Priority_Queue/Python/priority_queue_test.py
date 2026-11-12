import unittest
from priority_queue import PriorityQueue

class TestPriorityQueue(unittest.TestCase):
    def setUp(self):
        self.pq = PriorityQueue()

    def test_enqueue_dequeue(self):
        self.pq.enqueue("task1", 3)
        self.pq.enqueue("task2", 1)
        self.pq.enqueue("task3", 2)
        # Should dequeue in order: task2 (1), task3 (2), task1 (3)
        self.assertEqual(self.pq.dequeue(), "task2")
        self.assertEqual(self.pq.dequeue(), "task3")
        self.assertEqual(self.pq.dequeue(), "task1")

    def test_peek(self):
        self.pq.enqueue("high", 1)
        self.pq.enqueue("low", 5)
        self.assertEqual(self.pq.peek(), "high")
        # Peek should not remove the element
        self.assertEqual(self.pq.size(), 2)

    def test_is_empty(self):
        self.assertTrue(self.pq.is_empty())
        self.pq.enqueue("item", 1)
        self.assertFalse(self.pq.is_empty())
        self.pq.dequeue()
        self.assertTrue(self.pq.is_empty())

    def test_size(self):
        self.assertEqual(self.pq.size(), 0)
        self.pq.enqueue("a", 1)
        self.pq.enqueue("b", 2)
        self.assertEqual(self.pq.size(), 2)
        self.pq.dequeue()
        self.assertEqual(self.pq.size(), 1)

    def test_same_priority(self):
        # Items with same priority should maintain insertion order
        self.pq.enqueue("first", 1)
        self.pq.enqueue("second", 1)
        self.pq.enqueue("third", 1)
        self.assertEqual(self.pq.dequeue(), "first")
        self.assertEqual(self.pq.dequeue(), "second")
        self.assertEqual(self.pq.dequeue(), "third")

    def test_mixed_priorities(self):
        self.pq.enqueue("low1", 10)
        self.pq.enqueue("high", 1)
        self.pq.enqueue("medium", 5)
        self.pq.enqueue("low2", 10)
        self.assertEqual(self.pq.dequeue(), "high")
        self.assertEqual(self.pq.dequeue(), "medium")
        self.assertEqual(self.pq.dequeue(), "low1")
        self.assertEqual(self.pq.dequeue(), "low2")

    def test_dequeue_empty(self):
        with self.assertRaises(IndexError):
            self.pq.dequeue()

    def test_peek_empty(self):
        with self.assertRaises(IndexError):
            self.pq.peek()

    def test_clear(self):
        self.pq.enqueue("a", 1)
        self.pq.enqueue("b", 2)
        self.pq.clear()
        self.assertTrue(self.pq.is_empty())
        self.assertEqual(self.pq.size(), 0)

if __name__ == "__main__":
    unittest.main()

