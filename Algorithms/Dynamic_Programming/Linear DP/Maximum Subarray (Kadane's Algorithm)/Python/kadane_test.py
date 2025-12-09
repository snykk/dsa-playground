"""
Test cases for Kadane's Algorithm
"""

import unittest
from kadane import kadane_algorithm, kadane_with_indices, kadane_dp


class TestKadane(unittest.TestCase):
    
    def test_basic(self):
        """Test basic Kadane's"""
        arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
        self.assertEqual(kadane_algorithm(arr), 6)
    
    def test_all_negative(self):
        """Test all negative numbers"""
        arr = [-1, -2, -3]
        self.assertEqual(kadane_algorithm(arr), -1)
    
    def test_all_positive(self):
        """Test all positive numbers"""
        arr = [1, 2, 3, 4]
        self.assertEqual(kadane_algorithm(arr), 10)
    
    def test_with_indices(self):
        """Test getting indices"""
        arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
        max_sum, start, end = kadane_with_indices(arr)
        self.assertEqual(max_sum, 6)
        self.assertGreaterEqual(end, start)
    
    def test_dp_approach(self):
        """Test DP approach"""
        arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
        self.assertEqual(kadane_dp(arr), 6)


if __name__ == '__main__':
    unittest.main()

