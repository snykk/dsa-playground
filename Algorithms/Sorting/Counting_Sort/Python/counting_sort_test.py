"""
Test cases for Counting Sort
"""

import random
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

    def test_negative_numbers(self):
        """Regression: negative values used to index count from the end"""
        cases = [[3, -1, 2], [-3, -1, -2], [-5, 0, 5, -5, 0], [0, 0], [-7]]
        for arr in cases:
            self.assertEqual(counting_sort(arr), sorted(arr))
            self.assertEqual(counting_sort_simple(arr), sorted(arr))

    def test_max_val_smaller_than_maximum(self):
        """Regression: a too small max_val used to raise IndexError"""
        with self.assertRaises(ValueError):
            counting_sort([5, 1], max_val=3)
        with self.assertRaises(ValueError):
            counting_sort_simple([5, 1], max_val=3)
        # A larger max_val than needed is fine
        self.assertEqual(counting_sort([5, -1, 1], max_val=9), [-1, 1, 5])

    def test_random_against_sorted(self):
        """Random mixed-sign input matches sorted()"""
        rng = random.Random(7)
        for _ in range(300):
            arr = [rng.randint(-20, 20) for _ in range(rng.randint(0, 30))]
            self.assertEqual(counting_sort(arr), sorted(arr))
            self.assertEqual(counting_sort_simple(arr), sorted(arr))


if __name__ == '__main__':
    unittest.main()

