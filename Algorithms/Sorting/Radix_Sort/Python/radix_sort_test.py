"""
Test cases for Radix Sort
"""

import random
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

    def test_negative_numbers(self):
        """Regression: negatives were left unsorted or put after positives"""
        cases = [[-3, -1, -2], [3, -1, 2], [-170, 45, -75, 0, 802, -2, 2],
                 [-5, -5], [0, -10, 10, -100, 100]]
        for arr in cases:
            self.assertEqual(radix_sort(arr.copy()), sorted(arr))

    def test_zeros_and_large_values(self):
        """All zeros, and values with ten or more digits"""
        self.assertEqual(radix_sort([0, 0, 0]), [0, 0, 0])
        arr = [2_000_000_000, 7, 1_999_999_999, -2_147_483_648, 2_147_483_647]
        self.assertEqual(radix_sort(arr.copy()), sorted(arr))

    def test_random_against_sorted(self):
        """Random mixed-sign input matches sorted()"""
        rng = random.Random(11)
        for _ in range(300):
            arr = [rng.randint(-5000, 5000) for _ in range(rng.randint(0, 30))]
            self.assertEqual(radix_sort(arr.copy()), sorted(arr))


if __name__ == '__main__':
    unittest.main()

