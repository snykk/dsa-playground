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

    def test_zero_initial_capacity(self):
        """Regression: capacity 0 used to stay 0 after doubling and raise IndexError"""
        arr = DynamicArray(initial_capacity=0)
        for i in range(5):
            arr.append(i)
        self.assertEqual(arr.size, 5)
        self.assertEqual([arr.get(i) for i in range(5)], [0, 1, 2, 3, 4])

    def test_total_copy_cost_is_linear(self):
        """Aggregate bound: all resizes together copy fewer than 2n elements"""
        for n in (1, 10, 100, 1000):
            arr = DynamicArray(initial_capacity=1)
            for i in range(n):
                arr.append(i)
            self.assertLessEqual(arr.copies, 2 * n)
            self.assertLessEqual(n + arr.copies, 3 * n)

    def test_counter_flips_at_most_two_per_increment(self):
        """Aggregate bound: n increments flip at most 2n bits in total"""
        counter = BinaryCounter(n_bits=16)
        n = 1000
        for _ in range(n):
            counter.increment()
        self.assertLessEqual(counter.flips, 2 * n)
        self.assertEqual(counter.get_value(), n)


if __name__ == "__main__":
    unittest.main()


