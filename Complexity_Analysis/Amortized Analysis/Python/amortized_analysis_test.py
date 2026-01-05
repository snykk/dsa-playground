"""
Test cases for Amortized Analysis examples
"""

import unittest
from amortized_analysis import DynamicArray, BinaryCounter


class TestAmortizedAnalysis(unittest.TestCase):
    
    def test_dynamic_array(self):
        """Test dynamic array with amortized O(1) append"""
        arr = DynamicArray(initial_capacity=2)
        
        # Test appends
        for i in range(10):
            arr.append(i)
        
        self.assertEqual(arr.size, 10)
        self.assertGreaterEqual(arr.capacity, 10)
        
        # Test access
        self.assertEqual(arr.get(0), 0)
        self.assertEqual(arr.get(9), 9)
        
        # Test index error
        with self.assertRaises(IndexError):
            arr.get(10)
    
    def test_binary_counter(self):
        """Test binary counter with amortized O(1) increment"""
        counter = BinaryCounter(n_bits=4)
        
        # Test increments
        for i in range(5):
            counter.increment()
        
        self.assertEqual(counter.get_value(), 5)
        
        # Test more increments
        for i in range(10):
            counter.increment()
        
        # Value should wrap around for 4-bit counter
        self.assertGreaterEqual(counter.get_value(), 0)
        self.assertLess(counter.get_value(), 16)


if __name__ == "__main__":
    unittest.main()


