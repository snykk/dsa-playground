"""
Test cases for Longest Increasing Subsequence
"""

import unittest
from lis import lis_dp, lis_binary_search, lis_with_sequence


class TestLIS(unittest.TestCase):
    
    def test_basic(self):
        """Test basic LIS"""
        arr = [10, 9, 2, 5, 3, 7, 101, 18]
        self.assertEqual(lis_dp(arr), 4)
        self.assertEqual(lis_binary_search(arr), 4)
    
    def test_sorted_array(self):
        """Test sorted array"""
        arr = [1, 2, 3, 4, 5]
        self.assertEqual(lis_dp(arr), 5)
        self.assertEqual(lis_binary_search(arr), 5)
    
    def test_reverse_sorted(self):
        """Test reverse sorted array"""
        arr = [5, 4, 3, 2, 1]
        self.assertEqual(lis_dp(arr), 1)
        self.assertEqual(lis_binary_search(arr), 1)
    
    def test_single_element(self):
        """Test single element"""
        arr = [1]
        self.assertEqual(lis_dp(arr), 1)
    
    def test_empty(self):
        """Test empty array"""
        arr = []
        self.assertEqual(lis_dp(arr), 0)
    
    def test_with_sequence(self):
        """Test getting actual sequence"""
        arr = [10, 9, 2, 5, 3, 7, 101, 18]
        length, seq = lis_with_sequence(arr)
        self.assertEqual(length, 4)
        self.assertTrue(all(seq[i] < seq[i+1] for i in range(len(seq)-1)))


if __name__ == '__main__':
    unittest.main()

