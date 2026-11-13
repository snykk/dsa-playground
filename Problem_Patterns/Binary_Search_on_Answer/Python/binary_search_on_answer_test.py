"""
Unit tests for Binary Search on Answer.
"""

import random
import unittest
from binary_search_on_answer import (
    binary_search_answer,
    find_kth_smallest_distance,
    find_min_capacity,
    split_array_largest_sum
)


def days_needed(weights, capacity):
    """Greedy day count, written independently of the code under test."""
    days, load = 1, 0
    for w in weights:
        if load + w > capacity:
            days, load = days + 1, 0
        load += w
    return days


class TestBinarySearchOnAnswer(unittest.TestCase):
    def test_find_min_capacity(self):
        weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = find_min_capacity(weights, 5)
        self.assertEqual(result, 15)
        
        weights = [3, 2, 2, 4, 1, 4]
        result = find_min_capacity(weights, 3)
        self.assertEqual(result, 6)
    
    def test_split_array_largest_sum(self):
        nums = [7, 2, 5, 10, 8]
        result = split_array_largest_sum(nums, 2)
        self.assertEqual(result, 18)
        
        nums = [1, 2, 3, 4, 5]
        result = split_array_largest_sum(nums, 2)
        self.assertEqual(result, 9)

    def test_infeasible_returns_minus_one(self):
        # Regression: the search used to start from result = right, so when no
        # candidate was feasible it returned `right` as if it were an answer.
        # C++ and Go return -1.
        self.assertEqual(binary_search_answer(1, 10, lambda x: False), -1)
        self.assertEqual(find_min_capacity([1, 2, 3], 0), -1)
        self.assertEqual(split_array_largest_sum([1, 2, 3], 0), -1)

    def test_find_kth_smallest_distance(self):
        self.assertEqual(find_kth_smallest_distance([1, 3, 1], 1), 0)
        self.assertEqual(find_kth_smallest_distance([1, 3, 1], 3), 2)
        self.assertEqual(find_kth_smallest_distance([1, 6, 1], 2), 5)
        # Fewer than k pairs: -1, as in C++ and Go (it used to return 2 and 0).
        self.assertEqual(find_kth_smallest_distance([1, 3, 1], 5), -1)
        self.assertEqual(find_kth_smallest_distance([4], 1), -1)

    def test_min_capacity_matches_brute_force(self):
        rng = random.Random(7)
        for _ in range(300):
            weights = [rng.randint(1, 12) for _ in range(rng.randint(1, 8))]
            days = rng.randint(0, len(weights) + 1)
            fits = [c for c in range(max(weights), sum(weights) + 1)
                    if days_needed(weights, c) <= days]
            expected = fits[0] if fits else -1
            self.assertEqual(find_min_capacity(weights, days), expected)
            self.assertEqual(split_array_largest_sum(weights, days), expected)


if __name__ == "__main__":
    unittest.main()

