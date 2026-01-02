"""
Unit tests for Two Pointers.
"""

import unittest
from two_pointers import (
    two_sum_sorted,
    three_sum,
    is_palindrome,
    remove_duplicates,
    container_with_most_water
)


class TestTwoPointers(unittest.TestCase):
    def test_two_sum_sorted(self):
        arr = [2, 7, 11, 15]
        result = two_sum_sorted(arr, 9)
        self.assertEqual(result, [0, 1])
        
        result = two_sum_sorted(arr, 10)
        self.assertIsNone(result)
    
    def test_three_sum(self):
        arr = [-1, 0, 1, 2, -1, -4]
        result = three_sum(arr, 0)
        self.assertEqual(len(result), 2)
        self.assertIn([-1, -1, 2], result)
        self.assertIn([-1, 0, 1], result)
    
    def test_is_palindrome(self):
        self.assertTrue(is_palindrome("A man, a plan, a canal: Panama"))
        self.assertTrue(is_palindrome("race a car") == False)
        self.assertTrue(is_palindrome(""))
        self.assertTrue(is_palindrome("a"))
    
    def test_remove_duplicates(self):
        arr = [1, 1, 2, 2, 3, 4, 4, 5]
        length = remove_duplicates(arr)
        self.assertEqual(length, 5)
        self.assertEqual(arr[:length], [1, 2, 3, 4, 5])
    
    def test_container_with_most_water(self):
        heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
        result = container_with_most_water(heights)
        self.assertEqual(result, 49)


if __name__ == "__main__":
    unittest.main()

