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


if __name__ == '__main__':
    unittest.main()

