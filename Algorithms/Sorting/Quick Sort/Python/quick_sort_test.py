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


if __name__ == '__main__':
    unittest.main()

