"""
Test cases for Interpolation Search
"""

import unittest
from interpolation_search import (
    interpolation_search,
    interpolation_search_recursive
)


class TestInterpolationSearch(unittest.TestCase):
    
    def test_basic_search_found(self):
        """Test basic search when element is found"""
        arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        result = interpolation_search(arr, 50)
        self.assertEqual(result, 4)
    
    def test_basic_search_not_found(self):
        """Test basic search when element is not found"""
        arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        result = interpolation_search(arr, 55)
        self.assertEqual(result, -1)
    
    def test_first_element(self):
        """Test searching for first element"""
        arr = [10, 20, 30, 40, 50]
        result = interpolation_search(arr, 10)
        self.assertEqual(result, 0)
    
    def test_last_element(self):
        """Test searching for last element"""
        arr = [10, 20, 30, 40, 50]
        result = interpolation_search(arr, 50)
        self.assertEqual(result, 4)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = interpolation_search(arr, 10)
        self.assertEqual(result, -1)
    
    def test_single_element_found(self):
        """Test with single element array (found)"""
        arr = [42]
        result = interpolation_search(arr, 42)
        self.assertEqual(result, 0)
    
    def test_single_element_not_found(self):
        """Test with single element array (not found)"""
        arr = [42]
        result = interpolation_search(arr, 10)
        self.assertEqual(result, -1)
    
    def test_uniformly_distributed(self):
        """Test with uniformly distributed array"""
        arr = list(range(0, 100, 5))  # [0, 5, 10, 15, ..., 95]
        result = interpolation_search(arr, 50)
        self.assertEqual(result, 10)
    
    def test_target_out_of_range_low(self):
        """Test with target below array range"""
        arr = [10, 20, 30, 40, 50]
        result = interpolation_search(arr, 5)
        self.assertEqual(result, -1)
    
    def test_target_out_of_range_high(self):
        """Test with target above array range"""
        arr = [10, 20, 30, 40, 50]
        result = interpolation_search(arr, 100)
        self.assertEqual(result, -1)
    
    def test_recursive_search_found(self):
        """Test recursive search when element is found"""
        arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        result = interpolation_search_recursive(arr, 70)
        self.assertEqual(result, 6)
    
    def test_recursive_search_not_found(self):
        """Test recursive search when element is not found"""
        arr = [10, 20, 30, 40, 50]
        result = interpolation_search_recursive(arr, 25)
        self.assertEqual(result, -1)
    
    def test_non_uniform_distribution(self):
        """Test with non-uniformly distributed array (still works)"""
        arr = [1, 2, 3, 10, 20, 30, 100, 200, 300]
        result = interpolation_search(arr, 20)
        self.assertEqual(result, 4)

    def test_all_equal_values(self):
        """Regression: equal window ends used to raise ZeroDivisionError"""
        for search in (interpolation_search, interpolation_search_recursive):
            with self.subTest(search=search.__name__):
                self.assertEqual(search([5, 5, 5], 5), 0)
                self.assertEqual(search([5, 5, 5], 4), -1)
                self.assertEqual(search([5, 5, 5], 6), -1)

    def test_duplicates(self):
        """Duplicates: any index holding the target is a correct answer"""
        arr = [1, 2, 2, 2, 2, 3, 7, 7, 9]
        for search in (interpolation_search, interpolation_search_recursive):
            for target in set(arr):
                with self.subTest(search=search.__name__, target=target):
                    self.assertEqual(arr[search(arr, target)], target)
            self.assertEqual(search(arr, 5), -1)

    def test_huge_float_keys(self):
        """Regression: huge float keys made the probe formula inf or NaN, and int() raised"""
        arr = [-1e308, 0.0, 1e308, 1.5e308]
        for search in (interpolation_search, interpolation_search_recursive):
            for i, target in enumerate(arr):
                with self.subTest(search=search.__name__, target=target):
                    self.assertEqual(search(arr, target), i)
            self.assertEqual(search(arr, 5.0), -1)


if __name__ == '__main__':
    unittest.main()

