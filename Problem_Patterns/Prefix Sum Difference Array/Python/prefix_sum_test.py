"""
Unit tests for Prefix Sum / Difference Array Pattern.
"""

import unittest
from prefix_sum import PrefixSum, DifferenceArray, range_sum_queries, range_updates


class TestPrefixSum(unittest.TestCase):
    def test_prefix_sum(self):
        arr = [1, 2, 3, 4, 5]
        ps = PrefixSum(arr)
        self.assertEqual(ps.query(0, 4), 15)
        self.assertEqual(ps.query(1, 3), 9)
    
    def test_difference_array(self):
        da = DifferenceArray(5)
        da.update(0, 2, 5)
        da.update(1, 3, 3)
        result = da.get_array()
        self.assertEqual(result, [5, 8, 8, 3, 0])
    
    def test_range_sum_queries(self):
        arr = [1, 2, 3, 4, 5]
        queries = [(0, 4), (1, 3)]
        results = range_sum_queries(arr, queries)
        self.assertEqual(results, [15, 9])
    
    def test_range_updates(self):
        arr = [0] * 5
        updates = [(0, 2, 5), (1, 3, 3)]
        result = range_updates(arr, updates)
        self.assertEqual(result, [5, 8, 8, 3, 0])


if __name__ == "__main__":
    unittest.main()

