"""
Test cases for Quick Sort
"""

import unittest
from quick_sort import quick_sort, quick_sort_hoare


class TestQuickSort(unittest.TestCase):
    
    def test_basic_sort(self):
        """Test basic sorting"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = quick_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_already_sorted(self):
        """Test with already sorted array"""
        arr = [1, 2, 3, 4, 5]
        expected = arr.copy()
        result = quick_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = quick_sort(arr.copy())
        self.assertEqual(result, [])
    
    def test_single_element(self):
        """Test with single element"""
        arr = [42]
        result = quick_sort(arr.copy())
        self.assertEqual(result, [42])
    
    def test_hoare_partition(self):
        """Test Hoare partition scheme"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = quick_sort_hoare(arr.copy())
        self.assertEqual(result, expected)

    def test_large_sorted_and_equal_input(self):
        """Regression: fixed pivots used to hit RecursionError at n = 2000"""
        n = 2000
        cases = [list(range(n)), list(range(n, 0, -1)), [5] * n]
        for arr in cases:
            self.assertEqual(quick_sort(arr.copy()), sorted(arr))
        for arr in cases[:2]:
            self.assertEqual(quick_sort_hoare(arr.copy()), sorted(arr))

    def test_duplicates_and_negatives(self):
        """Both partition schemes on duplicate-heavy input with negatives"""
        arr = [3, -1, 3, 0, -1, 3, 2, -7, 0, 3]
        self.assertEqual(quick_sort(arr.copy()), sorted(arr))
        self.assertEqual(quick_sort_hoare(arr.copy()), sorted(arr))


if __name__ == '__main__':
    unittest.main()

