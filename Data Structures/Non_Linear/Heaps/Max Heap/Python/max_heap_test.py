import unittest
from max_heap import MaxHeap

class TestMaxHeap(unittest.TestCase):
    def setUp(self):
        self.heap = MaxHeap()

    def test_insert_and_peek(self):
        self.heap.insert(5)
        self.heap.insert(3)
        self.heap.insert(7)
        self.assertEqual(self.heap.peek(), 7)
        
    def test_extract_max(self):
        self.heap.insert(5)
        self.heap.insert(3)
        self.heap.insert(7)
        self.heap.insert(1)
        
        self.assertEqual(self.heap.extract_max(), 7)
        self.assertEqual(self.heap.extract_max(), 5)
        self.assertEqual(self.heap.extract_max(), 3)
        self.assertEqual(self.heap.extract_max(), 1)
    
    def test_heapify(self):
        arr = [5, 3, 7, 1, 9, 2]
        heap = MaxHeap(arr)
        
        result = []
        while not heap.is_empty():
            result.append(heap.extract_max())
        
        self.assertEqual(result, [9, 7, 5, 3, 2, 1])
    
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
        self.assertEqual(self.heap.extract_max(), 5)
        self.assertTrue(self.heap.is_empty())
    
    def test_empty_heap_operations(self):
        with self.assertRaises(IndexError):
            self.heap.peek()
        with self.assertRaises(IndexError):
            self.heap.extract_max()

if __name__ == "__main__":
    unittest.main()

