"""
Test cases for Coin Change
"""

import unittest
from coin_change import (
    coin_change_min_coins,
    coin_change_ways,
    coin_change_01
)


class TestCoinChange(unittest.TestCase):
    
    def test_min_coins(self):
        """Test minimum coins"""
        coins = [1, 2, 5]
        amount = 11
        self.assertEqual(coin_change_min_coins(coins, amount), 3)
    
    def test_impossible(self):
        """Test impossible amount"""
        coins = [2]
        amount = 3
        self.assertEqual(coin_change_min_coins(coins, amount), -1)
    
    def test_ways(self):
        """Test number of ways"""
        coins = [1, 2, 5]
        amount = 5
        ways = coin_change_ways(coins, amount)
        self.assertGreater(ways, 0)
    
    def test_01_knapsack(self):
        """Test 0/1 variant"""
        coins = [1, 2, 5]
        amount = 8
        result = coin_change_01(coins, amount)
        # Should be possible: 1+2+5 = 8
        self.assertGreaterEqual(result, 0)


if __name__ == '__main__':
    unittest.main()

