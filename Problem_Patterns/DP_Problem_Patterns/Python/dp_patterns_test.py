import unittest
from dp_patterns import knapsack_01, lcs, lis

class TestDPPatterns(unittest.TestCase):
    def test_knapsack(self):
        weights = [10, 20, 30]
        values = [60, 100, 120]
        self.assertEqual(knapsack_01(weights, values, 50), 220)
        self.assertEqual(knapsack_01(weights, values, 0), 0)
        self.assertEqual(knapsack_01([], [], 50), 0)

    def test_knapsack_zero_weight_item_fits_zero_capacity(self):
        self.assertEqual(knapsack_01([0], [5], 0), 5)
        self.assertEqual(knapsack_01([0, 3], [5, 4], 2), 5)

    def test_knapsack_each_item_used_once(self):
        self.assertEqual(knapsack_01([5], [10], 20), 10)
        self.assertEqual(knapsack_01([1, 3, 4, 5], [1, 4, 5, 7], 7), 9)

    def test_lcs(self):
        self.assertEqual(lcs("abcde", "ace"), 3)
        self.assertEqual(lcs("abc", "abc"), 3)
        self.assertEqual(lcs("abc", "def"), 0)
        self.assertEqual(lcs("", "abc"), 0)
        self.assertEqual(lcs("abcbdab", "bdcaba"), 4)
        self.assertEqual(lcs("ab", "ba"), 1)

    def test_lis(self):
        nums = [10, 9, 2, 5, 3, 7, 101, 18]
        self.assertEqual(lis(nums), 4)
        self.assertEqual(lis([0, 1, 0, 3, 2, 3]), 4)
        self.assertEqual(lis([7, 7, 7, 7]), 1)  # strictly increasing: equal values do not extend
        self.assertEqual(lis([]), 0)
        self.assertEqual(lis([10, 9, 2, 5, 3]), 2)
        self.assertEqual(lis([5, 4, 3, 2, 1]), 1)

if __name__ == '__main__':
    unittest.main()
