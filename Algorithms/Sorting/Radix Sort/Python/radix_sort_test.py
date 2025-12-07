"""
Test cases for Radix Sort
"""

import unittest
from radix_sort import radix_sort


class TestRadixSort(unittest.TestCase):
    
    def test_basic_sort(self):
        """Test basic sorting"""
        arr = [170, 45, 75, 90, 802, 24, 2, 66]
        expected = sorted(arr)
        result = radix_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_already_sorted(self):
        """Test with already sorted array"""
        arr = [1, 12, 123, 1234]
        expected = arr.copy()
        result = radix_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = radix_sort(arr.copy())
        self.assertEqual(result, [])
    
    def test_single_element(self):
        """Test with single element"""
        arr = [42]
        result = radix_sort(arr.copy())
        self.assertEqual(result, [42])


if __name__ == '__main__':
    unittest.main()

