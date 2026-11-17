"""
Test cases for Big-Omega notation examples
"""

import unittest

import big_omega
from big_omega import (
    linear_search_best_case,
    bubble_sort_best_case,
    quick_sort_best_case,
    matrix_traversal_lower_bound
)


class TestBigOmega(unittest.TestCase):
    
    def test_linear_search_best_case(self):
        """Test Omega(1) best case for linear search"""
        arr = [5, 3, 8, 1, 9]
        # Best case: target at first position
        self.assertEqual(linear_search_best_case(arr, 5), 0)
        
        # Worst case: target at last position
        self.assertEqual(linear_search_best_case(arr, 9), 4)
        
        # Not found
        self.assertEqual(linear_search_best_case(arr, 10), -1)
    
    def test_bubble_sort_best_case(self):
        """Test Omega(n) best case for bubble sort"""
        # Already sorted (best case)
        arr = [1, 2, 3, 4, 5]
        result = bubble_sort_best_case(arr.copy())
        self.assertEqual(result, [1, 2, 3, 4, 5])
        
        # Reverse sorted (worst case)
        arr = [5, 4, 3, 2, 1]
        result = bubble_sort_best_case(arr.copy())
        self.assertEqual(result, [1, 2, 3, 4, 5])
    
    def test_quick_sort_best_case(self):
        """Three-way quick sort sorts distinct keys (its best case is all-equal keys, Theta(n))"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        sorted_arr = quick_sort_best_case(arr)
        self.assertEqual(sorted_arr, [11, 12, 22, 25, 34, 64, 90])
        
        arr = [5, 2, 8, 1, 9]
        sorted_arr = quick_sort_best_case(arr)
        self.assertEqual(sorted_arr, [1, 2, 5, 8, 9])
    
    def test_quick_sort_all_equal_keys_is_one_partition(self):
        """All-equal input is sorted without any deeper recursion (best case Theta(n))"""
        calls = []
        original = big_omega.quick_sort_best_case

        def counting(arr):
            calls.append(len(arr))
            return original(arr)

        big_omega.quick_sort_best_case = counting
        try:
            result = counting([7] * 1000)
        finally:
            big_omega.quick_sort_best_case = original
        self.assertEqual(result, [7] * 1000)
        # the call on the whole array plus two calls on empty left/right parts
        self.assertEqual(calls, [1000, 0, 0])

    def test_matrix_traversal_lower_bound(self):
        """Test Omega(n^2) lower bound for matrix traversal"""
        matrix = [[1, 2], [3, 4]]
        self.assertEqual(matrix_traversal_lower_bound(matrix), 10)
        
        matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        self.assertEqual(matrix_traversal_lower_bound(matrix), 45)


if __name__ == "__main__":
    unittest.main()
