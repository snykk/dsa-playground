"""
Unit tests for Binary Search on Answer.
"""

import unittest
from binary_search_on_answer import (
    find_min_capacity,
    split_array_largest_sum
)


class TestBinarySearchOnAnswer(unittest.TestCase):
    def test_find_min_capacity(self):
        weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = find_min_capacity(weights, 5)
        self.assertEqual(result, 15)
        
        weights = [3, 2, 2, 4, 1, 4]
        result = find_min_capacity(weights, 3)
        self.assertEqual(result, 6)
    
    def test_split_array_largest_sum(self):
        nums = [7, 2, 5, 10, 8]
        result = split_array_largest_sum(nums, 2)
        self.assertEqual(result, 18)
        
        nums = [1, 2, 3, 4, 5]
        result = split_array_largest_sum(nums, 2)
        self.assertEqual(result, 9)


if __name__ == "__main__":
    unittest.main()

