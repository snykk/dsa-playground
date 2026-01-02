import unittest
from dp_patterns import knapsack_01, lcs, lis

class TestDPPatterns(unittest.TestCase):
    def test_knapsack(self):
        weights = [10, 20, 30]
        values = [60, 100, 120]
        self.assertEqual(knapsack_01(weights, values, 50), 220)
        self.assertEqual(knapsack_01(weights, values, 0), 0)
        self.assertEqual(knapsack_01([], [], 50), 0)

    def test_lcs(self):
        self.assertEqual(lcs("abcde", "ace"), 3)
        self.assertEqual(lcs("abc", "abc"), 3)
        self.assertEqual(lcs("abc", "def"), 0)
        self.assertEqual(lcs("", "abc"), 0)

    def test_lis(self):
        nums = [10, 9, 2, 5, 3, 7, 101, 18]
        self.assertEqual(lis(nums), 4)
        self.assertEqual(lis([0, 1, 0, 3, 2, 3]), 4)
        self.assertEqual(lis([7, 7, 7, 7]), 1) # Strictly increasing? "increasing" usually implies strictly. My implementation does bisect_left which replaces equal values, so strictly increasing. 
        # Check: bisect_left returns insertion point. 
        # [7], next 7 -> idx=0, [7]. Correct. 
        self.assertEqual(lis([]), 0)

if __name__ == '__main__':
    unittest.main()
