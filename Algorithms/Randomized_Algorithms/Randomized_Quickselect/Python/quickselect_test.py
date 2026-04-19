"""Unit tests for Randomized Quickselect."""
import random
import unittest

from quickselect import quickselect, top_k_smallest


class TestQuickselect(unittest.TestCase):
    def test_single_element(self):
        self.assertEqual(quickselect([42], 0), 42)

    def test_smallest(self):
        self.assertEqual(quickselect([3, 1, 4, 1, 5, 9, 2, 6], 0), 1)

    def test_largest(self):
        arr = [3, 1, 4, 1, 5, 9, 2, 6]
        self.assertEqual(quickselect(list(arr), len(arr) - 1), 9)

    def test_median(self):
        arr = [7, 2, 1, 8, 6, 3, 5, 4]
        # Sorted: [1, 2, 3, 4, 5, 6, 7, 8]; median at index 3 or 4
        self.assertEqual(quickselect(list(arr), 3), 4)
        self.assertEqual(quickselect(list(arr), 4), 5)

    def test_matches_sort_on_random_data(self):
        rng = random.Random(42)
        for _ in range(10):
            n = rng.randint(1, 200)
            arr = [rng.randint(-1000, 1000) for _ in range(n)]
            sorted_arr = sorted(arr)
            for k in range(n):
                self.assertEqual(quickselect(list(arr), k, rng),
                                 sorted_arr[k], f"arr={arr}, k={k}")

    def test_duplicates(self):
        arr = [5, 5, 5, 5, 5]
        for k in range(5):
            self.assertEqual(quickselect(list(arr), k), 5)

    def test_already_sorted(self):
        arr = list(range(20))
        for k in range(20):
            self.assertEqual(quickselect(list(arr), k), k)

    def test_reverse_sorted(self):
        arr = list(range(19, -1, -1))
        for k in range(20):
            self.assertEqual(quickselect(list(arr), k), k)

    def test_negative_k_raises(self):
        with self.assertRaises(IndexError):
            quickselect([1, 2, 3], -1)

    def test_k_too_large_raises(self):
        with self.assertRaises(IndexError):
            quickselect([1, 2, 3], 3)

    def test_empty_raises(self):
        with self.assertRaises(ValueError):
            quickselect([], 0)


class TestTopKSmallest(unittest.TestCase):
    def test_top_k_basic(self):
        result = top_k_smallest([3, 1, 4, 1, 5, 9, 2, 6], 3)
        self.assertEqual(sorted(result), [1, 1, 2])

    def test_k_zero(self):
        self.assertEqual(top_k_smallest([1, 2, 3], 0), [])

    def test_k_exceeds_length(self):
        self.assertEqual(sorted(top_k_smallest([2, 1, 3], 10)), [1, 2, 3])

    def test_does_not_mutate_input(self):
        arr = [5, 1, 3, 2, 4]
        original = list(arr)
        top_k_smallest(arr, 2)
        self.assertEqual(arr, original)


if __name__ == "__main__":
    unittest.main()
