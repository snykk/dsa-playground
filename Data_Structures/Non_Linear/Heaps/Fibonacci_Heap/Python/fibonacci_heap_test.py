import unittest
from fibonacci_heap import FibonacciHeap

class TestFibonacciHeap(unittest.TestCase):
    def setUp(self):
        self.heap = FibonacciHeap()

    def test_insert_and_peek(self):
        self.heap.insert(5)
        self.heap.insert(3)
        self.heap.insert(7)
        self.assertEqual(self.heap.peek(), 3)
        
    def test_extract_min(self):
        self.heap.insert(5)
        self.heap.insert(3)
        self.heap.insert(7)
        self.heap.insert(1)
        
        self.assertEqual(self.heap.extract_min(), 1)
        self.assertEqual(self.heap.extract_min(), 3)
        self.assertEqual(self.heap.extract_min(), 5)
        self.assertEqual(self.heap.extract_min(), 7)
    
    def test_is_empty(self):
        self.assertTrue(self.heap.is_empty())
        self.heap.insert(5)
        self.assertFalse(self.heap.is_empty())
    
    def test_size(self):
        self.assertEqual(self.heap.size(), 0)
        self.heap.insert(5)
        self.heap.insert(3)
        self.assertEqual(self.heap.size(), 2)
    
    def test_clear(self):
        self.heap.insert(5)
        self.heap.insert(3)
        self.heap.clear()
        self.assertTrue(self.heap.is_empty())
        self.assertEqual(self.heap.size(), 0)
    
    def test_single_element(self):
        self.heap.insert(5)
        self.assertEqual(self.heap.peek(), 5)
        self.assertEqual(self.heap.extract_min(), 5)
        self.assertTrue(self.heap.is_empty())
    
    def test_empty_heap_operations(self):
        with self.assertRaises(IndexError):
            self.heap.peek()
        with self.assertRaises(IndexError):
            self.heap.extract_min()
    
    def test_multiple_extracts(self):
        arr = [5, 3, 7, 1, 9, 2]
        for val in arr:
            self.heap.insert(val)
        
        result = []
        while not self.heap.is_empty():
            result.append(self.heap.extract_min())
        
        self.assertEqual(result, [1, 2, 3, 5, 7, 9])

    def test_scale_with_duplicates_and_negatives(self):
        import random
        rng = random.Random(7)
        vals = [rng.randint(-250, 250) for _ in range(2000)]
        for v in vals:
            self.heap.insert(v)
        out = [self.heap.extract_min() for _ in range(len(vals))]
        self.assertEqual(out, sorted(vals))
        self.assertTrue(self.heap.is_empty())

    def test_interleaved_insert_extract(self):
        import heapq
        import random
        rng = random.Random(11)
        ref = []
        for _ in range(1500):
            if ref and rng.random() < 0.4:
                self.assertEqual(self.heap.extract_min(), heapq.heappop(ref))
            else:
                v = rng.randint(-50, 50)
                self.heap.insert(v)
                heapq.heappush(ref, v)
            self.assertEqual(self.heap.size(), len(ref))


if __name__ == "__main__":
    unittest.main()

