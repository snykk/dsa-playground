"""Unit tests for Monotonic Queue helpers."""
import unittest

from monotonic_queue import MonotonicDeque, sliding_window_max, sliding_window_min


class TestSlidingWindowMax(unittest.TestCase):
    def test_leetcode_example(self):
        self.assertEqual(
            sliding_window_max([1, 3, -1, -3, 5, 3, 6, 7], 3),
            [3, 3, 5, 5, 6, 7],
        )

    def test_window_equals_length(self):
        self.assertEqual(sliding_window_max([2, 1, 3], 3), [3])

    def test_window_size_one(self):
        self.assertEqual(sliding_window_max([1, 2, 3], 1), [1, 2, 3])

    def test_all_equal(self):
        self.assertEqual(sliding_window_max([5, 5, 5, 5], 2), [5, 5, 5])

    def test_decreasing_array(self):
        self.assertEqual(sliding_window_max([5, 4, 3, 2, 1], 3), [5, 4, 3])

    def test_increasing_array(self):
        self.assertEqual(sliding_window_max([1, 2, 3, 4, 5], 3), [3, 4, 5])

    def test_empty_array(self):
        self.assertEqual(sliding_window_max([], 3), [])

    def test_window_larger_than_array(self):
        self.assertEqual(sliding_window_max([1, 2], 3), [])

    def test_window_zero(self):
        self.assertEqual(sliding_window_max([1, 2, 3], 0), [])

    def test_negative_values(self):
        self.assertEqual(
            sliding_window_max([-5, -3, -8, -1, -2, -7], 3),
            [-3, -1, -1, -1],
        )


class TestSlidingWindowMin(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(
            sliding_window_min([1, 3, -1, -3, 5, 3, 6, 7], 3),
            [-1, -3, -3, -3, 3, 3],
        )

    def test_all_equal(self):
        self.assertEqual(sliding_window_min([5, 5, 5, 5], 2), [5, 5, 5])

    def test_window_size_one(self):
        self.assertEqual(sliding_window_min([3, 1, 2], 1), [3, 1, 2])


class TestMonotonicDeque(unittest.TestCase):
    def test_max_deque_semantics(self):
        dq = MonotonicDeque(lambda back, new: back <= new)
        for v in [1, 3, 2, 5, 4]:
            dq.push(v)
        # Front should be the max of everything pushed so far: 5
        self.assertEqual(dq.front(), 5)

    def test_min_deque_semantics(self):
        dq = MonotonicDeque(lambda back, new: back >= new)
        for v in [3, 1, 4, 1, 5]:
            dq.push(v)
        self.assertEqual(dq.front(), 1)


if __name__ == "__main__":
    unittest.main()
