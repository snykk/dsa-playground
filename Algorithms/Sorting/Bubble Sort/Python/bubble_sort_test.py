"""
Test cases for Bubble Sort
"""

import unittest
from bubble_sort import bubble_sort, bubble_sort_optimized, bubble_sort_recursive


class TestBubbleSort(unittest.TestCase):
    
    def test_basic_sort(self):
        """Test basic sorting"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = bubble_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_already_sorted(self):
        """Test with already sorted array"""
        arr = [1, 2, 3, 4, 5]
        expected = arr.copy()
        result = bubble_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_reverse_sorted(self):
        """Test with reverse sorted array"""
        arr = [5, 4, 3, 2, 1]
        expected = [1, 2, 3, 4, 5]
        result = bubble_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = bubble_sort(arr.copy())
        self.assertEqual(result, [])
    
    def test_single_element(self):
        """Test with single element"""
        arr = [42]
        result = bubble_sort(arr.copy())
        self.assertEqual(result, [42])
    
    def test_duplicate_elements(self):
        """Test with duplicate elements"""
        arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
        expected = sorted(arr)
        result = bubble_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_negative_numbers(self):
        """Test with negative numbers"""
        arr = [-5, -2, -8, 1, 3, -1]
        expected = sorted(arr)
        result = bubble_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_optimized_version(self):
        """Test optimized version"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = bubble_sort_optimized(arr.copy())
        self.assertEqual(result, expected)
    
    def test_recursive_version(self):
        """Test recursive version"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = bubble_sort_recursive(arr.copy())
        self.assertEqual(result, expected)
    
    def test_recursive_empty_and_single(self):
        """Regression: the recursive version used to recurse forever on []"""
        self.assertEqual(bubble_sort_recursive([]), [])
        self.assertEqual(bubble_sort_recursive([7]), [7])
        self.assertEqual(bubble_sort_recursive([2, 1]), [1, 2])

    def test_in_place_sorting(self):
        """Test that original array is modified"""
        arr = [3, 1, 4, 1, 5]
        original = arr.copy()
        bubble_sort(arr)
        self.assertNotEqual(arr, original)
        self.assertEqual(arr, sorted(original))


if __name__ == '__main__':
    unittest.main()

