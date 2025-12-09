"""
Test cases for Bitmask DP
"""

import unittest
from bitmask_dp import traveling_salesman_dp


class TestBitmaskDP(unittest.TestCase):
    
    def test_tsp_small(self):
        """Test TSP with small graph"""
        distances = [
            [0, 10, 15, 20],
            [10, 0, 35, 25],
            [15, 35, 0, 30],
            [20, 25, 30, 0]
        ]
        result = traveling_salesman_dp(distances)
        self.assertGreater(result, 0)


if __name__ == '__main__':
    unittest.main()

