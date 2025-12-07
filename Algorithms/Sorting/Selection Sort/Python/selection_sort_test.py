"""
Test cases for Selection Sort
"""

import unittest
from selection_sort import selection_sort


class TestSelectionSort(unittest.TestCase):
    
    def test_basic_sort(self):
        """Test basic sorting"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = selection_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_already_sorted(self):
        """Test with already sorted array"""
        arr = [1, 2, 3, 4, 5]
        expected = arr.copy()
        result = selection_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = selection_sort(arr.copy())
        self.assertEqual(result, [])
    
    def test_single_element(self):
        """Test with single element"""
        arr = [42]
        result = selection_sort(arr.copy())
        self.assertEqual(result, [42])


if __name__ == '__main__':
    unittest.main()

