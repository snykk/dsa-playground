"""
Test cases for Binary Search
"""

import unittest
from binary_search import (
    binary_search,
    binary_search_recursive,
    binary_search_first_occurrence,
    binary_search_last_occurrence,
    binary_search_closest
)


class TestBinarySearch(unittest.TestCase):
    
    def test_basic_search_found(self):
        """Test basic search when element is found"""
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = binary_search(arr, 5)
        self.assertEqual(result, 4)
    
    def test_basic_search_not_found(self):
        """Test basic search when element is not found"""
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = binary_search(arr, 11)
        self.assertEqual(result, -1)
    
    def test_first_element(self):
        """Test searching for first element"""
        arr = [1, 2, 3, 4, 5]
        result = binary_search(arr, 1)
        self.assertEqual(result, 0)
    
    def test_last_element(self):
        """Test searching for last element"""
        arr = [1, 2, 3, 4, 5]
        result = binary_search(arr, 5)
        self.assertEqual(result, 4)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = binary_search(arr, 10)
        self.assertEqual(result, -1)
    
    def test_single_element_found(self):
        """Test with single element array (found)"""
        arr = [42]
        result = binary_search(arr, 42)
        self.assertEqual(result, 0)
    
    def test_single_element_not_found(self):
        """Test with single element array (not found)"""
        arr = [42]
        result = binary_search(arr, 10)
        self.assertEqual(result, -1)
    
    def test_negative_numbers(self):
        """Test with negative numbers"""
        arr = [-10, -5, -2, 0, 3, 7]
        result = binary_search(arr, -2)
        self.assertEqual(result, 2)
    
    def test_large_array(self):
        """Test with large array"""
        arr = list(range(1, 1001))
        result = binary_search(arr, 500)
        self.assertEqual(result, 499)
    
    def test_recursive_search_found(self):
        """Test recursive search when element is found"""
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = binary_search_recursive(arr, 7)
        self.assertEqual(result, 6)
    
    def test_recursive_search_not_found(self):
        """Test recursive search when element is not found"""
        arr = [1, 2, 3, 4, 5]
        result = binary_search_recursive(arr, 10)
        self.assertEqual(result, -1)
    
    def test_first_occurrence(self):
        """Test finding first occurrence"""
        arr = [1, 2, 2, 2, 3, 4, 5]
        result = binary_search_first_occurrence(arr, 2)
        self.assertEqual(result, 1)
    
    def test_last_occurrence(self):
        """Test finding last occurrence"""
        arr = [1, 2, 2, 2, 3, 4, 5]
        result = binary_search_last_occurrence(arr, 2)
        self.assertEqual(result, 3)
    
    def test_closest_element(self):
        """Test finding closest element"""
        arr = [1, 3, 5, 7, 9]
        result = binary_search_closest(arr, 4)
        self.assertEqual(result, 2)  # 3 and 5 are both 1 away; the larger one wins
    
    def test_closest_element_at_end(self):
        """Test closest element at end"""
        arr = [1, 3, 5, 7, 9]
        result = binary_search_closest(arr, 10)
        self.assertEqual(result, 4)  # 9 is closest
    
    def test_closest_element_at_start(self):
        """Test closest element at start"""
        arr = [1, 3, 5, 7, 9]
        result = binary_search_closest(arr, 0)
        self.assertEqual(result, 0)  # 1 is closest

    def test_closest_element_empty_array(self):
        """Regression: an empty array used to return 0, which is not a valid index"""
        self.assertEqual(binary_search_closest([], 5), -1)

    def test_closest_element_single(self):
        """A single element is always the closest one"""
        self.assertEqual(binary_search_closest([42], -100), 0)
        self.assertEqual(binary_search_closest([42], 100), 0)


if __name__ == '__main__':
    unittest.main()

