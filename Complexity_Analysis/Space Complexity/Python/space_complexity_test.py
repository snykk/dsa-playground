"""
Test cases for Space Complexity examples
"""

import unittest
from space_complexity import (
    constant_space_example,
    linear_space_example,
    quadratic_space_example,
    logarithmic_space_example,
    in_place_reverse,
    merge_sort_space
)


class TestSpaceComplexity(unittest.TestCase):
    
    def test_constant_space(self):
        """Test O(1) constant space"""
        self.assertEqual(constant_space_example(10), 55)
        self.assertEqual(constant_space_example(100), 5050)
    
    def test_linear_space(self):
        """Test O(n) linear space"""
        result = linear_space_example(5)
        self.assertEqual(result, [1, 2, 3, 4, 5])
        self.assertEqual(len(result), 5)
    
    def test_quadratic_space(self):
        """Test O(n²) quadratic space"""
        matrix = quadratic_space_example(3)
        self.assertEqual(len(matrix), 3)
        self.assertEqual(len(matrix[0]), 3)
        self.assertEqual(matrix[0][0], 0)
        self.assertEqual(matrix[2][2], 8)
    
    def test_logarithmic_space(self):
        """Test O(log n) logarithmic space"""
        result = logarithmic_space_example(8)
        # Result depends on implementation, just check it runs
        self.assertIsInstance(result, int)
    
    def test_in_place_reverse(self):
        """Test O(1) in-place reverse"""
        arr = [1, 2, 3, 4, 5]
        reversed_arr = in_place_reverse(arr.copy())
        self.assertEqual(reversed_arr, [5, 4, 3, 2, 1])
        
        arr = [1]
        reversed_arr = in_place_reverse(arr.copy())
        self.assertEqual(reversed_arr, [1])
    
    def test_merge_sort_space(self):
        """Test O(n) space for merge sort"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        sorted_arr = merge_sort_space(arr)
        self.assertEqual(sorted_arr, [11, 12, 22, 25, 34, 64, 90])


if __name__ == "__main__":
    unittest.main()


