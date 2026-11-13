"""Unit tests for Monotonic Queue helpers."""
import random
import unittest

from monotonic_queue import MonotonicDeque, sliding_window_max, sliding_window_min


def window_via_class(arr, k, should_pop, evict_first):
    """Sliding-window extreme built on MonotonicDeque, evicting before or after the push."""
    dq = MonotonicDeque(should_pop)
    out = []
    for i, value in enumerate(arr):
        if evict_first and i >= k:
            dq.pop_front_if(arr[i - k])
        dq.push(value)
        if not evict_first and i >= k:
            dq.pop_front_if(arr[i - k])
        if i >= k - 1:
            out.append(dq.front())
    return out


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

    def test_repeated_values_in_window(self):
        # Regression: equal values collapsed and eviction went by value, so
        # evicting the outgoing 5 also removed the newer 5 still in the window
        # (window max of [5, 5, 1] with k = 2 came out as [5, 1]).
        for evict_first in (True, False):
            self.assertEqual(window_via_class([5, 5, 1], 2, lambda b, n: b <= n, evict_first), [5, 5])
            self.assertEqual(window_via_class([3, 3, 3, 1, 1], 3, lambda b, n: b <= n, evict_first), [3, 3, 3])
            self.assertEqual(window_via_class([1, 1, 5], 2, lambda b, n: b >= n, evict_first), [1, 1])

    def test_matches_brute_force_with_duplicates(self):
        rng = random.Random(11)
        rules = [
            (lambda b, n: b <= n, max),
            (lambda b, n: b < n, max),
            (lambda b, n: b >= n, min),
            (lambda b, n: b > n, min),
        ]
        for _ in range(300):
            arr = [rng.randint(0, 3) for _ in range(rng.randint(1, 12))]
            k = rng.randint(1, len(arr))
            windows = [arr[i:i + k] for i in range(len(arr) - k + 1)]
            for should_pop, pick in rules:
                expected = [pick(w) for w in windows]
                for evict_first in (True, False):
                    self.assertEqual(window_via_class(arr, k, should_pop, evict_first), expected)
            self.assertEqual(sliding_window_max(arr, k), [max(w) for w in windows])
            self.assertEqual(sliding_window_min(arr, k), [min(w) for w in windows])


if __name__ == "__main__":
    unittest.main()
