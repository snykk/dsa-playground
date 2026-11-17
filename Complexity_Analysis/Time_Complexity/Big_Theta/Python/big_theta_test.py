"""
Test cases for Big-Theta notation examples
"""

import unittest
from big_theta import (
    tight_bound_example,
    merge_sort_example,
    binary_search_example,
    matrix_multiplication_naive
)


class CountingList(list):
    """A list that counts element reads, to observe how much work a search does."""

    reads = 0

    def __getitem__(self, index):
        self.reads += 1
        return list.__getitem__(self, index)


class TestBigTheta(unittest.TestCase):

    def test_binary_search_best_case_is_constant(self):
        """Best case Theta(1): a target at the first middle probe is found with one read.
        Worst case Theta(log n): an absent target needs about log2(n) probes."""
        n = 1023
        arr = CountingList(range(n))
        self.assertEqual(binary_search_example(arr, 511), 511)
        self.assertEqual(arr.reads, 1)

        arr.reads = 0
        self.assertEqual(binary_search_example(arr, -1), -1)
        # 10 probes, each with at least one read
        self.assertGreaterEqual(arr.reads, 10)
    
    def test_tight_bound_linear(self):
        """Test Theta(n) tight bound"""
        arr = [1, 2, 3, 4, 5]
        self.assertEqual(tight_bound_example(arr), 15)
        
        arr = [10, 20, 30]
        self.assertEqual(tight_bound_example(arr), 60)
        
        arr = []
        self.assertEqual(tight_bound_example(arr), 0)
    
    def test_merge_sort_tight_bound(self):
        """Test Theta(n log n) tight bound for merge sort"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        sorted_arr = merge_sort_example(arr)
        self.assertEqual(sorted_arr, [11, 12, 22, 25, 34, 64, 90])
        
        arr = [5, 2, 8, 1, 9]
        sorted_arr = merge_sort_example(arr)
        self.assertEqual(sorted_arr, [1, 2, 5, 8, 9])
        
        arr = [1]
        sorted_arr = merge_sort_example(arr)
        self.assertEqual(sorted_arr, [1])
    
    def test_binary_search_tight_bound(self):
        """Binary search finds present targets and reports absent ones (worst case Theta(log n))"""
        arr = [1, 3, 5, 7, 9, 11, 13, 15]
        
        # Found cases
        self.assertEqual(binary_search_example(arr, 1), 0)
        self.assertEqual(binary_search_example(arr, 7), 3)
        self.assertEqual(binary_search_example(arr, 15), 7)
        
        # Not found cases
        self.assertEqual(binary_search_example(arr, 0), -1)
        self.assertEqual(binary_search_example(arr, 20), -1)
        self.assertEqual(binary_search_example(arr, 6), -1)
    
    def test_matrix_multiplication_tight_bound(self):
        """Test Theta(n^3) tight bound for matrix multiplication"""
        A = [[1, 2], [3, 4]]
        B = [[5, 6], [7, 8]]
        C = matrix_multiplication_naive(A, B)
        
        # Expected: [[19, 22], [43, 50]]
        self.assertEqual(C[0][0], 19)
        self.assertEqual(C[0][1], 22)
        self.assertEqual(C[1][0], 43)
        self.assertEqual(C[1][1], 50)
        
        # Identity matrix test
        I = [[1, 0], [0, 1]]
        A = [[1, 2], [3, 4]]
        result = matrix_multiplication_naive(A, I)
        self.assertEqual(result, A)


if __name__ == "__main__":
    unittest.main()


