"""
Test cases for Selection Sort
"""

import unittest
from selection_sort import selection_sort


class TestSelectionSort(unittest.TestCase):
    
    def test_basic_sort(self):
        """Test basic sorting"""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = sorted(arr)
        result = selection_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_already_sorted(self):
        """Test with already sorted array"""
        arr = [1, 2, 3, 4, 5]
        expected = arr.copy()
        result = selection_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = selection_sort(arr.copy())
        self.assertEqual(result, [])
    
    def test_single_element(self):
        """Test with single element"""
        arr = [42]
        result = selection_sort(arr.copy())
        self.assertEqual(result, [42])


class TestSelectionSortProperties(unittest.TestCase):

    def test_sorted_input_is_never_written(self):
        """Regression: the code used to swap every element with itself"""
        class CountingList(list):
            writes = 0

            def __setitem__(self, index, value):
                CountingList.writes += 1
                super().__setitem__(index, value)

        arr = CountingList([1, 2, 3, 4, 5])
        selection_sort(arr)
        self.assertEqual(CountingList.writes, 0)

    def test_at_most_n_minus_one_swaps(self):
        """A reversed list of n elements needs n // 2 swaps, never more than n - 1"""
        class CountingList(list):
            writes = 0

            def __setitem__(self, index, value):
                CountingList.writes += 1
                super().__setitem__(index, value)

        arr = CountingList([5, 4, 3, 2, 1])
        selection_sort(arr)
        self.assertEqual(list(arr), [1, 2, 3, 4, 5])
        self.assertEqual(CountingList.writes, 2 * 2)  # 2 swaps, 2 writes each

    def test_not_stable(self):
        """Documents the instability: [2a, 2b, 1] becomes [1, 2b, 2a]"""
        class Rec:
            def __init__(self, key, tag):
                self.key, self.tag = key, tag

            def __lt__(self, other):
                return self.key < other.key

        arr = [Rec(2, 'a'), Rec(2, 'b'), Rec(1, 'c')]
        selection_sort(arr)
        self.assertEqual([r.tag for r in arr], ['c', 'b', 'a'])


if __name__ == '__main__':
    unittest.main()

