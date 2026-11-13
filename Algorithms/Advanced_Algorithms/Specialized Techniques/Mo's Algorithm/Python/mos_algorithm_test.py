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

    def test_empty_array_without_queries(self):
        self.assertEqual(count_distinct_in_ranges([], []), [])

    def test_answers_follow_input_order(self):
        arr = [1, 2, 1, 3, 2, 3, 4]
        queries = [(5, 6), (0, 0), (2, 4), (0, 6), (3, 3)]
        self.assertEqual(count_distinct_in_ranges(arr, queries), [2, 1, 3, 4, 1])

    def test_random_arrays_match_brute_force(self):
        import random
        rng = random.Random(11)
        for _ in range(300):
            n = rng.randint(1, 30)
            arr = [rng.randint(0, 6) for _ in range(n)]
            queries = []
            for _ in range(rng.randint(1, 20)):
                l = rng.randrange(n)
                r = rng.randrange(l, n)
                queries.append((l, r))
            expected = [len(set(arr[l:r + 1])) for l, r in queries]
            self.assertEqual(count_distinct_in_ranges(arr, queries), expected)


if __name__ == "__main__":
    unittest.main()
