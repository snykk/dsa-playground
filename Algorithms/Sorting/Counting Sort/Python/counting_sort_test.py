"""
Test cases for Counting Sort
"""

import unittest
from counting_sort import counting_sort, counting_sort_simple


class TestCountingSort(unittest.TestCase):
    
    def test_basic_sort(self):
        """Test basic sorting"""
        arr = [4, 2, 2, 8, 3, 3, 1]
        expected = sorted(arr)
        result = counting_sort(arr)
        self.assertEqual(result, expected)
    
    def test_already_sorted(self):
        """Test with already sorted array"""
        arr = [1, 2, 3, 4, 5]
        expected = arr.copy()
        result = counting_sort(arr)
        self.assertEqual(result, expected)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = counting_sort(arr)
        self.assertEqual(result, [])
    
    def test_single_element(self):
        """Test with single element"""
        arr = [42]
        result = counting_sort(arr)
        self.assertEqual(result, [42])
    
    def test_duplicate_elements(self):
        """Test with duplicate elements"""
        arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
        expected = sorted(arr)
        result = counting_sort(arr)
        self.assertEqual(result, expected)
    
    def test_simple_version(self):
        """Test simplified version"""
        arr = [4, 2, 2, 8, 3, 3, 1]
        expected = sorted(arr)
        result = counting_sort_simple(arr)
        self.assertEqual(result, expected)


if __name__ == '__main__':
    unittest.main()

