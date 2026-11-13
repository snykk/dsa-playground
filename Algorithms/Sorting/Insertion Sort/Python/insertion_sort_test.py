"""
Test cases for Insertion Sort
"""

import unittest
from insertion_sort import insertion_sort, insertion_sort_recursive


class TestInsertionSort(unittest.TestCase):
    
    def test_basic_sort(self):
        """Test basic sorting"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = insertion_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_already_sorted(self):
        """Test with already sorted array"""
        arr = [1, 2, 3, 4, 5]
        expected = arr.copy()
        result = insertion_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_reverse_sorted(self):
        """Test with reverse sorted array"""
        arr = [5, 4, 3, 2, 1]
        expected = [1, 2, 3, 4, 5]
        result = insertion_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = insertion_sort(arr.copy())
        self.assertEqual(result, [])
    
    def test_single_element(self):
        """Test with single element"""
        arr = [42]
        result = insertion_sort(arr.copy())
        self.assertEqual(result, [42])
    
    def test_duplicate_elements(self):
        """Test with duplicate elements"""
        arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
        expected = sorted(arr)
        result = insertion_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_recursive_version(self):
        """Test recursive version"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = insertion_sort_recursive(arr.copy())
        self.assertEqual(result, expected)


class TestInsertionSortStability(unittest.TestCase):

    def test_stable_with_equal_keys(self):
        """Equal keys keep their original order"""
        class Rec:
            def __init__(self, key, tag):
                self.key, self.tag = key, tag

            def __gt__(self, other):
                return self.key > other.key

        arr = [Rec(2, 'a'), Rec(1, 'x'), Rec(2, 'b'), Rec(1, 'y'), Rec(2, 'c')]
        insertion_sort(arr)
        self.assertEqual([r.tag for r in arr], ['x', 'y', 'a', 'b', 'c'])


if __name__ == '__main__':
    unittest.main()

