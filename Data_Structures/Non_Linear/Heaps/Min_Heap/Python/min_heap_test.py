import unittest
from min_heap import MinHeap

class TestMinHeap(unittest.TestCase):
    def setUp(self):
        self.heap = MinHeap()

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
    
    def test_heapify(self):
        arr = [5, 3, 7, 1, 9, 2]
        heap = MinHeap(arr)
        
        result = []
        while not heap.is_empty():
            result.append(heap.extract_min())
        
        self.assertEqual(result, [1, 2, 3, 5, 7, 9])
    
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

    def test_duplicates_and_negatives(self):
        vals = [4, -2, 4, 0, -2, 9, 9, 4, -7]
        for v in vals:
            self.heap.insert(v)
        out = [self.heap.extract_min() for _ in vals]
        self.assertEqual(out, sorted(vals))

    def test_random_heapify_matches_sorted(self):
        import random
        rng = random.Random(5)
        vals = [rng.randint(-100, 100) for _ in range(1000)]
        built = MinHeap(vals)
        self.assertEqual(built.size(), 1000)
        self.assertEqual([built.extract_min() for _ in vals], sorted(vals))

    def test_input_list_not_modified(self):
        vals = [3, 1, 2]
        MinHeap(vals)
        self.assertEqual(vals, [3, 1, 2])


if __name__ == "__main__":
    unittest.main()

