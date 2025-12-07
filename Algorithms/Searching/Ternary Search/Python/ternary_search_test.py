"""
Test cases for Ternary Search
"""

import unittest
from ternary_search import (
    ternary_search,
    ternary_search_recursive,
    ternary_search_unimodal
)


class TestTernarySearch(unittest.TestCase):
    
    def test_basic_search_found(self):
        """Test basic search when element is found"""
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = ternary_search(arr, 5)
        self.assertEqual(result, 4)
    
    def test_basic_search_not_found(self):
        """Test basic search when element is not found"""
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = ternary_search(arr, 11)
        self.assertEqual(result, -1)
    
    def test_first_element(self):
        """Test searching for first element"""
        arr = [1, 2, 3, 4, 5]
        result = ternary_search(arr, 1)
        self.assertEqual(result, 0)
    
    def test_last_element(self):
        """Test searching for last element"""
        arr = [1, 2, 3, 4, 5]
        result = ternary_search(arr, 5)
        self.assertEqual(result, 4)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = ternary_search(arr, 10)
        self.assertEqual(result, -1)
    
    def test_single_element_found(self):
        """Test with single element array (found)"""
        arr = [42]
        result = ternary_search(arr, 42)
        self.assertEqual(result, 0)
    
    def test_single_element_not_found(self):
        """Test with single element array (not found)"""
        arr = [42]
        result = ternary_search(arr, 10)
        self.assertEqual(result, -1)
    
    def test_middle_element(self):
        """Test searching for middle element"""
        arr = [1, 2, 3, 4, 5, 6, 7]
        result = ternary_search(arr, 4)
        self.assertEqual(result, 3)
    
    def test_recursive_search_found(self):
        """Test recursive search when element is found"""
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = ternary_search_recursive(arr, 7)
        self.assertEqual(result, 6)
    
    def test_recursive_search_not_found(self):
        """Test recursive search when element is not found"""
        arr = [1, 2, 3, 4, 5]
        result = ternary_search_recursive(arr, 10)
        self.assertEqual(result, -1)
    
    def test_unimodal_function_maximum(self):
        """Test finding maximum of unimodal function"""
        # Unimodal function: -x^2 + 10x (maximum at x=5)
        def func(x):
            return -(x - 5) ** 2 + 25
        
        result = ternary_search_unimodal(func, 0, 10)
        # Should be close to 5
        self.assertAlmostEqual(result, 5, delta=1)
    
    def test_unimodal_function_negative(self):
        """Test unimodal function with negative values"""
        # Function with maximum at x=3
        def func(x):
            return -(x - 3) ** 2
        
        result = ternary_search_unimodal(func, 0, 10)
        # Should be close to 3
        self.assertAlmostEqual(result, 3, delta=1)


if __name__ == '__main__':
    unittest.main()

