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
        # The best subarray is [4, -1, 2, 1] at indices 3..6.
        self.assertEqual((max_sum, start, end), (6, 3, 6))
        self.assertEqual(sum(arr[start:end + 1]), max_sum)

    def test_with_indices_all_negative(self):
        """All negative: the best subarray is the single largest element"""
        self.assertEqual(kadane_with_indices([-3, -1, -2]), (-1, 1, 1))

    def test_empty_input(self):
        """Empty input returns 0 (and indices -1, -1) by convention"""
        self.assertEqual(kadane_algorithm([]), 0)
        self.assertEqual(kadane_dp([]), 0)
        self.assertEqual(kadane_with_indices([]), (0, -1, -1))

    def test_all_approaches_agree(self):
        """The three functions agree, and the indices delimit a subarray with the max sum"""
        cases = [
            [-2, 1, -3, 4, -1, 2, 1, -5, 4],
            [5],
            [-7],
            [5, -9, 6, -2, 3],
            [2, -1, 2, -1, 2],
            [-1, 0, -2],
            [0, 0, 0],
        ]
        for arr in cases:
            with self.subTest(arr=arr):
                expected = kadane_algorithm(arr)
                self.assertEqual(kadane_dp(arr), expected)
                max_sum, start, end = kadane_with_indices(arr)
                self.assertEqual(max_sum, expected)
                self.assertEqual(sum(arr[start:end + 1]), expected)
    
    def test_dp_approach(self):
        """Test DP approach"""
        arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
        self.assertEqual(kadane_dp(arr), 6)


if __name__ == '__main__':
    unittest.main()

