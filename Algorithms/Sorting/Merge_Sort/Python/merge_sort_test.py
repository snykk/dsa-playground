"""
Test cases for Merge Sort
"""

import unittest
from merge_sort import merge_sort, merge_sort_iterative


class TestMergeSort(unittest.TestCase):
    
    def test_basic_sort(self):
        """Test basic sorting"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = merge_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_already_sorted(self):
        """Test with already sorted array"""
        arr = [1, 2, 3, 4, 5]
        expected = arr.copy()
        result = merge_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = merge_sort(arr.copy())
        self.assertEqual(result, [])
    
    def test_single_element(self):
        """Test with single element"""
        arr = [42]
        result = merge_sort(arr.copy())
        self.assertEqual(result, [42])
    
    def test_iterative_version(self):
        """Test iterative version"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = merge_sort_iterative(arr.copy())
        self.assertEqual(result, expected)


class TestMergeSortStability(unittest.TestCase):

    def test_stable_with_equal_keys(self):
        """Equal keys keep their original order (both versions)"""
        class Rec:
            def __init__(self, key, tag):
                self.key, self.tag = key, tag

            def __le__(self, other):
                return self.key <= other.key

            def __gt__(self, other):
                return self.key > other.key

        for sort in (merge_sort, merge_sort_iterative):
            arr = [Rec(2, 'a'), Rec(1, 'x'), Rec(2, 'b'), Rec(1, 'y'), Rec(2, 'c')]
            sort(arr)
            self.assertEqual([r.tag for r in arr], ['x', 'y', 'a', 'b', 'c'])


if __name__ == '__main__':
    unittest.main()

