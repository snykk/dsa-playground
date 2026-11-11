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
        # 5, 2+2+1, 2+1+1+1, 1+1+1+1+1
        self.assertEqual(ways, 4)
    
    def test_01_knapsack(self):
        """Test 0/1 variant"""
        coins = [1, 2, 5]
        amount = 8
        result = coin_change_01(coins, amount)
        # Possible with each coin used once: 1+2+5 = 8
        self.assertEqual(result, 3)

    def test_01_unreachable(self):
        """0/1 variant: each coin at most once, so 11 cannot be made from [1, 2, 5]"""
        self.assertEqual(coin_change_01([1, 2, 5], 11), -1)
        self.assertEqual(coin_change_01([1, 2, 5], 7), 2)

    def test_zero_amount(self):
        """Amount 0 needs no coins and has exactly one way (the empty set)"""
        self.assertEqual(coin_change_min_coins([1, 2, 5], 0), 0)
        self.assertEqual(coin_change_ways([1, 2, 5], 0), 1)
        self.assertEqual(coin_change_01([1, 2, 5], 0), 0)

    def test_min_coins_more_cases(self):
        """Exact answers for a few classic inputs"""
        self.assertEqual(coin_change_min_coins([2, 5, 10, 1], 27), 4)
        self.assertEqual(coin_change_min_coins([186, 419, 83, 408], 6249), 20)
        self.assertEqual(coin_change_min_coins([5], 3), -1)
        self.assertEqual(coin_change_min_coins([], 5), -1)

    def test_negative_amount_raises(self):
        """Regression: a negative amount used to crash with IndexError"""
        for fn in (coin_change_min_coins, coin_change_ways, coin_change_01):
            with self.subTest(fn=fn.__name__):
                with self.assertRaises(ValueError):
                    fn([1, 2, 5], -1)


if __name__ == '__main__':
    unittest.main()

