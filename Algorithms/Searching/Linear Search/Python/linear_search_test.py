"""
Test cases for Linear Search
"""

import unittest
from linear_search import (
    linear_search,
    linear_search_recursive,
    linear_search_all_occurrences
)


class TestLinearSearch(unittest.TestCase):
    
    def test_basic_search_found(self):
        """Test basic search when element is found"""
        arr = [10, 20, 30, 40, 50]
        result = linear_search(arr, 30)
        self.assertEqual(result, 2)
    
    def test_basic_search_not_found(self):
        """Test basic search when element is not found"""
        arr = [10, 20, 30, 40, 50]
        result = linear_search(arr, 25)
        self.assertEqual(result, -1)
    
    def test_first_element(self):
        """Test searching for first element"""
        arr = [10, 20, 30, 40, 50]
        result = linear_search(arr, 10)
        self.assertEqual(result, 0)
    
    def test_last_element(self):
        """Test searching for last element"""
        arr = [10, 20, 30, 40, 50]
        result = linear_search(arr, 50)
        self.assertEqual(result, 4)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = linear_search(arr, 10)
        self.assertEqual(result, -1)
    
    def test_single_element_found(self):
        """Test with single element array (found)"""
        arr = [42]
        result = linear_search(arr, 42)
        self.assertEqual(result, 0)
    
    def test_single_element_not_found(self):
        """Test with single element array (not found)"""
        arr = [42]
        result = linear_search(arr, 10)
        self.assertEqual(result, -1)
    
    def test_duplicate_elements(self):
        """Test with duplicate elements"""
        arr = [10, 20, 30, 20, 40, 20]
        result = linear_search(arr, 20)
        self.assertEqual(result, 1)  # Returns first occurrence
    
    def test_negative_numbers(self):
        """Test with negative numbers"""
        arr = [-5, -2, 0, 3, 7]
        result = linear_search(arr, -2)
        self.assertEqual(result, 1)
    
    def test_string_elements(self):
        """Test with string elements"""
        arr = ['apple', 'banana', 'cherry', 'date']
        result = linear_search(arr, 'cherry')
        self.assertEqual(result, 2)
    
    def test_recursive_search_found(self):
        """Test recursive search when element is found"""
        arr = [10, 20, 30, 40, 50]
        result = linear_search_recursive(arr, 30)
        self.assertEqual(result, 2)
    
    def test_recursive_search_not_found(self):
        """Test recursive search when element is not found"""
        arr = [10, 20, 30, 40, 50]
        result = linear_search_recursive(arr, 25)
        self.assertEqual(result, -1)
    
    def test_recursive_empty_array(self):
        """Test recursive search with empty array"""
        arr = []
        result = linear_search_recursive(arr, 10)
        self.assertEqual(result, -1)
    
    def test_all_occurrences(self):
        """Test finding all occurrences"""
        arr = [10, 20, 30, 20, 40, 20]
        result = linear_search_all_occurrences(arr, 20)
        self.assertEqual(result, [1, 3, 5])
    
    def test_all_occurrences_not_found(self):
        """Test finding all occurrences when not found"""
        arr = [10, 20, 30, 40, 50]
        result = linear_search_all_occurrences(arr, 25)
        self.assertEqual(result, [])
    
    def test_all_occurrences_single(self):
        """Test finding all occurrences (single occurrence)"""
        arr = [10, 20, 30, 40, 50]
        result = linear_search_all_occurrences(arr, 30)
        self.assertEqual(result, [2])


if __name__ == '__main__':
    unittest.main()

