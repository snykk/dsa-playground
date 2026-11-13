"""
Test cases for 0/1 Knapsack
"""

import unittest
from knapsack_01 import knapsack_01, knapsack_01_optimized


class TestKnapsack01(unittest.TestCase):
    
    def test_basic(self):
        """Test basic knapsack"""
        weights = [1, 3, 4, 5]
        values = [1, 4, 5, 7]
        capacity = 7
        self.assertEqual(knapsack_01(weights, values, capacity), 9)
    
    def test_optimized(self):
        """Test optimized version"""
        weights = [1, 3, 4, 5]
        values = [1, 4, 5, 7]
        capacity = 7
        self.assertEqual(knapsack_01_optimized(weights, values, capacity), 9)
    
    def test_empty(self):
        """Test empty knapsack"""
        weights = []
        values = []
        capacity = 10
        self.assertEqual(knapsack_01(weights, values, capacity), 0)

    def test_greedy_by_ratio_fails(self):
        """Best ratio first gives 160; the optimum is 220"""
        weights, values = [10, 20, 30], [60, 100, 120]
        self.assertEqual(knapsack_01(weights, values, 50), 220)
        self.assertEqual(knapsack_01_optimized(weights, values, 50), 220)

    def test_zero_capacity_and_zero_weight(self):
        """Nothing fits in capacity 0, except items that weigh nothing"""
        self.assertEqual(knapsack_01([1, 2], [5, 6], 0), 0)
        self.assertEqual(knapsack_01([0, 2], [5, 6], 0), 5)
        self.assertEqual(knapsack_01_optimized([0, 2], [5, 6], 0), 5)

    def test_single_item(self):
        """An item either fits exactly, or is too heavy"""
        self.assertEqual(knapsack_01([4], [9], 4), 9)
        self.assertEqual(knapsack_01([5], [9], 4), 0)
        self.assertEqual(knapsack_01_optimized([5], [9], 4), 0)

    def test_item_is_not_reused(self):
        """One item of weight 2 in capacity 4 is taken once (a forward 1D loop would give 6)"""
        self.assertEqual(knapsack_01([2], [3], 4), 3)
        self.assertEqual(knapsack_01_optimized([2], [3], 4), 3)


if __name__ == '__main__':
    unittest.main()

