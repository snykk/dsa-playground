"""
Unit tests for Mo's Algorithm.
"""

import unittest
from mos_algorithm import count_distinct_in_ranges, MoSAlgorithm


class TestMoSAlgorithm(unittest.TestCase):
    def test_count_distinct(self):
        arr = [1, 1, 2, 1, 3, 4, 3, 3, 4]
        queries = [(0, 4), (1, 3), (2, 6), (0, 8)]
        results = count_distinct_in_ranges(arr, queries)
        self.assertEqual(results[0], 3)  # [1,1,2,1,3] has 3 distinct
        self.assertEqual(results[1], 2)   # [1,2,1] has 2 distinct
        self.assertEqual(results[2], 4)  # [2,1,3,4,3] has 4 distinct
        self.assertEqual(results[3], 4)  # entire array has 4 distinct

    def test_single_element(self):
        arr = [5, 5, 5, 5]
        queries = [(0, 3)]
        results = count_distinct_in_ranges(arr, queries)
        self.assertEqual(results[0], 1)

    def test_empty_range(self):
        arr = [1, 2, 3]
        queries = [(1, 0)]  # Invalid range
        results = count_distinct_in_ranges(arr, queries)
        # Should handle gracefully
        self.assertIsInstance(results[0], int)


if __name__ == "__main__":
    unittest.main()
