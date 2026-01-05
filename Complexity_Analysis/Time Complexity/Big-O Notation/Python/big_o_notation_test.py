"""
Test cases for Big-O Notation examples
"""

import unittest
from big_o_notation import (
    constant_time_example,
    logarithmic_time_example,
    linear_time_example,
    linearithmic_time_example,
    quadratic_time_example,
    cubic_time_example,
    exponential_time_example,
    factorial_time_example
)


class TestBigONotation(unittest.TestCase):
    
    def test_constant_time(self):
        """Test O(1) constant time complexity"""
        self.assertEqual(constant_time_example(100), 42)
        self.assertEqual(constant_time_example(1000), 42)
        self.assertEqual(constant_time_example(10000), 42)
    
    def test_logarithmic_time(self):
        """Test O(log n) logarithmic time complexity"""
        self.assertEqual(logarithmic_time_example(8), 3)
        self.assertEqual(logarithmic_time_example(16), 4)
        self.assertEqual(logarithmic_time_example(32), 5)
        self.assertEqual(logarithmic_time_example(64), 6)
    
    def test_linear_time(self):
        """Test O(n) linear time complexity"""
        self.assertEqual(linear_time_example([1, 2, 3]), 6)
        self.assertEqual(linear_time_example([10, 20, 30, 40]), 100)
        self.assertEqual(linear_time_example([]), 0)
    
    def test_linearithmic_time(self):
        """Test O(n log n) linearithmic time complexity"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        sorted_arr = linearithmic_time_example(arr)
        self.assertEqual(sorted_arr, [11, 12, 22, 25, 34, 64, 90])
        
        arr = [5, 2, 8, 1, 9]
        sorted_arr = linearithmic_time_example(arr)
        self.assertEqual(sorted_arr, [1, 2, 5, 8, 9])
        
        arr = [1]
        sorted_arr = linearithmic_time_example(arr)
        self.assertEqual(sorted_arr, [1])
        
        arr = []
        sorted_arr = linearithmic_time_example(arr)
        self.assertEqual(sorted_arr, [])
    
    def test_quadratic_time(self):
        """Test O(n²) quadratic time complexity"""
        arr = [1, 2, 3]
        pairs = quadratic_time_example(arr)
        self.assertEqual(len(pairs), 3)  # C(3,2) = 3
        self.assertIn((1, 2), pairs)
        self.assertIn((1, 3), pairs)
        self.assertIn((2, 3), pairs)
        
        arr = [1, 2, 3, 4]
        pairs = quadratic_time_example(arr)
        self.assertEqual(len(pairs), 6)  # C(4,2) = 6
    
    def test_cubic_time(self):
        """Test O(n³) cubic time complexity"""
        self.assertEqual(cubic_time_example(1), 1)
        self.assertEqual(cubic_time_example(2), 8)
        self.assertEqual(cubic_time_example(3), 27)
        self.assertEqual(cubic_time_example(5), 125)
    
    def test_exponential_time(self):
        """Test O(2ⁿ) exponential time complexity"""
        self.assertEqual(exponential_time_example(0), 0)
        self.assertEqual(exponential_time_example(1), 1)
        self.assertEqual(exponential_time_example(2), 1)
        self.assertEqual(exponential_time_example(3), 2)
        self.assertEqual(exponential_time_example(4), 3)
        self.assertEqual(exponential_time_example(5), 5)
        self.assertEqual(exponential_time_example(6), 8)
    
    def test_factorial_time(self):
        """Test O(n!) factorial time complexity"""
        perms = factorial_time_example(1)
        self.assertEqual(len(perms), 1)
        
        perms = factorial_time_example(2)
        self.assertEqual(len(perms), 2)
        
        perms = factorial_time_example(3)
        self.assertEqual(len(perms), 6)  # 3! = 6
        
        perms = factorial_time_example(4)
        self.assertEqual(len(perms), 24)  # 4! = 24


if __name__ == "__main__":
    unittest.main()


