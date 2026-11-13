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
        self.assertEqual(result, 80)

    def test_tsp_no_tour_is_infinite(self):
        """A city with no edges to the others: no tour exists (not a free tour)"""
        inf = float('inf')
        distances = [[0, 1, inf], [1, 0, inf], [inf, inf, 0]]
        self.assertEqual(traveling_salesman_dp(distances), inf)

    def test_tsp_trivial_sizes(self):
        self.assertEqual(traveling_salesman_dp([]), 0)
        self.assertEqual(traveling_salesman_dp([[0]]), 0)
        self.assertEqual(traveling_salesman_dp([[0, 7], [7, 0]]), 14)

    def test_tsp_triangle(self):
        distances = [[0, 1, 4], [1, 0, 2], [4, 2, 0]]
        self.assertEqual(traveling_salesman_dp(distances), 7)


if __name__ == '__main__':
    unittest.main()

