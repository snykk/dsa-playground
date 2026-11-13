"""
Test cases for Longest Increasing Subsequence
"""

import unittest
from lis import lis_naive, lis_dp, lis_binary_search, lis_with_sequence


class TestLIS(unittest.TestCase):
    
    def test_basic(self):
        """Test basic LIS"""
        arr = [10, 9, 2, 5, 3, 7, 101, 18]
        self.assertEqual(lis_dp(arr), 4)
        self.assertEqual(lis_binary_search(arr), 4)
    
    def test_sorted_array(self):
        """Test sorted array"""
        arr = [1, 2, 3, 4, 5]
        self.assertEqual(lis_dp(arr), 5)
        self.assertEqual(lis_binary_search(arr), 5)
    
    def test_reverse_sorted(self):
        """Test reverse sorted array"""
        arr = [5, 4, 3, 2, 1]
        self.assertEqual(lis_dp(arr), 1)
        self.assertEqual(lis_binary_search(arr), 1)
    
    def test_single_element(self):
        """Test single element"""
        arr = [1]
        self.assertEqual(lis_dp(arr), 1)
    
    def test_empty(self):
        """Test empty array"""
        arr = []
        self.assertEqual(lis_dp(arr), 0)
    
    def test_with_sequence(self):
        """Test getting actual sequence"""
        arr = [10, 9, 2, 5, 3, 7, 101, 18]
        length, seq = lis_with_sequence(arr)
        self.assertEqual(length, 4)
        self.assertTrue(all(seq[i] < seq[i+1] for i in range(len(seq)-1)))
        # The first index with the maximum dp value ends the reconstructed LIS.
        self.assertEqual(seq, [2, 5, 7, 101])

    def test_with_sequence_empty(self):
        """Empty input has an empty LIS"""
        self.assertEqual(lis_with_sequence([]), (0, []))

    def test_duplicates_are_not_increasing(self):
        """Strictly increasing: equal values cannot both be in the subsequence"""
        for fn in (lis_naive, lis_dp, lis_binary_search):
            with self.subTest(fn=fn.__name__):
                self.assertEqual(fn([7, 7, 7, 7]), 1)
                self.assertEqual(fn([1, 3, 3, 5]), 3)
                self.assertEqual(fn([2, 2, 3, 3, 4]), 3)
        self.assertEqual(lis_with_sequence([2, 2, 3, 3, 4]), (3, [2, 3, 4]))

    def test_all_approaches_agree(self):
        """lis_naive (previously untested) agrees with the DP and binary-search versions"""
        cases = [
            [10, 9, 2, 5, 3, 7, 101, 18],
            [0, 1, 0, 3, 2, 3],
            [-5, -3, -4, 0, -1, 2],
            [3, 10, 2, 1, 20],
            [50, 3, 10, 7, 40, 80],
            [],
        ]
        for arr in cases:
            with self.subTest(arr=arr):
                expected = lis_dp(arr)
                self.assertEqual(lis_naive(arr), expected)
                self.assertEqual(lis_binary_search(arr), expected)
                self.assertEqual(lis_with_sequence(arr)[0], expected)


if __name__ == '__main__':
    unittest.main()

