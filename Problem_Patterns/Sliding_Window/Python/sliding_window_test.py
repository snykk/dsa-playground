"""
Unit tests for Sliding Window.
"""

import unittest
from sliding_window import (
    max_sum_subarray,
    longest_substring_k_distinct,
    min_window_substring,
    longest_substring_no_repeat
)


class TestSlidingWindow(unittest.TestCase):
    def test_max_sum_subarray(self):
        arr = [1, 4, 2, 10, 23, 3, 1, 0, 20]
        self.assertEqual(max_sum_subarray(arr, 4), 39)
        
        arr = [100, 200, 300, 400]
        self.assertEqual(max_sum_subarray(arr, 2), 700)
        
        arr = [1, 2, 3]
        self.assertEqual(max_sum_subarray(arr, 5), 0)

    def test_max_sum_subarray_non_positive_k(self):
        # Regression: k <= 0 used to raise IndexError (Go panicked too).
        self.assertEqual(max_sum_subarray([1, 2, 3], 0), 0)
        self.assertEqual(max_sum_subarray([1, 2, 3], -1), 0)
        self.assertEqual(max_sum_subarray([], 1), 0)
        self.assertEqual(max_sum_subarray([-5, -2, -9], 2), -7)
    
    def test_longest_substring_k_distinct(self):
        self.assertEqual(longest_substring_k_distinct("eceba", 2), 3)
        self.assertEqual(longest_substring_k_distinct("aa", 1), 2)
        self.assertEqual(longest_substring_k_distinct("", 2), 0)
        self.assertEqual(longest_substring_k_distinct("a", 0), 0)
    
    def test_min_window_substring(self):
        self.assertEqual(min_window_substring("ADOBECODEBANC", "ABC"), "BANC")
        self.assertEqual(min_window_substring("a", "a"), "a")
        self.assertEqual(min_window_substring("a", "aa"), "")
        self.assertEqual(min_window_substring("", "a"), "")
    
    def test_longest_substring_no_repeat(self):
        self.assertEqual(longest_substring_no_repeat("abcabcbb"), 3)
        self.assertEqual(longest_substring_no_repeat("bbbbb"), 1)
        self.assertEqual(longest_substring_no_repeat("pwwkew"), 3)
        self.assertEqual(longest_substring_no_repeat(""), 0)


if __name__ == "__main__":
    unittest.main()

