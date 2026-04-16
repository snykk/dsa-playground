"""
Unit tests for Monotonic Stack.
"""

import unittest
from monotonic_stack import (
    next_greater_element,
    next_smaller_element,
    previous_greater_element,
    previous_smaller_element,
    largest_rectangle_histogram,
    daily_temperatures,
    stock_span
)


class TestNextGreaterElement(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(next_greater_element([4, 5, 2, 10, 8]), [5, 10, 10, -1, -1])

    def test_decreasing(self):
        self.assertEqual(next_greater_element([5, 4, 3, 2, 1]), [-1, -1, -1, -1, -1])

    def test_increasing(self):
        self.assertEqual(next_greater_element([1, 2, 3, 4, 5]), [2, 3, 4, 5, -1])

    def test_single_element(self):
        self.assertEqual(next_greater_element([42]), [-1])

    def test_empty(self):
        self.assertEqual(next_greater_element([]), [])

    def test_duplicates(self):
        self.assertEqual(next_greater_element([2, 2, 2]), [-1, -1, -1])

    def test_mixed(self):
        self.assertEqual(next_greater_element([1, 3, 2, 4]), [3, 4, 4, -1])


class TestNextSmallerElement(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(next_smaller_element([4, 5, 2, 10, 8]), [2, 2, -1, 8, -1])

    def test_increasing(self):
        self.assertEqual(next_smaller_element([1, 2, 3, 4, 5]), [-1, -1, -1, -1, -1])

    def test_decreasing(self):
        self.assertEqual(next_smaller_element([5, 4, 3, 2, 1]), [4, 3, 2, 1, -1])

    def test_single_element(self):
        self.assertEqual(next_smaller_element([42]), [-1])

    def test_empty(self):
        self.assertEqual(next_smaller_element([]), [])

    def test_duplicates(self):
        self.assertEqual(next_smaller_element([3, 3, 3]), [-1, -1, -1])


class TestPreviousGreaterElement(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(previous_greater_element([4, 5, 2, 10, 8]), [-1, -1, 5, -1, 10])

    def test_decreasing(self):
        self.assertEqual(previous_greater_element([5, 4, 3, 2, 1]), [-1, 5, 4, 3, 2])

    def test_increasing(self):
        self.assertEqual(previous_greater_element([1, 2, 3, 4, 5]), [-1, -1, -1, -1, -1])

    def test_single_element(self):
        self.assertEqual(previous_greater_element([42]), [-1])

    def test_empty(self):
        self.assertEqual(previous_greater_element([]), [])

    def test_duplicates(self):
        self.assertEqual(previous_greater_element([3, 3, 3]), [-1, -1, -1])


class TestPreviousSmallerElement(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(previous_smaller_element([4, 5, 2, 10, 8]), [-1, 4, -1, 2, 2])

    def test_increasing(self):
        self.assertEqual(previous_smaller_element([1, 2, 3, 4, 5]), [-1, 1, 2, 3, 4])

    def test_decreasing(self):
        self.assertEqual(previous_smaller_element([5, 4, 3, 2, 1]), [-1, -1, -1, -1, -1])

    def test_single_element(self):
        self.assertEqual(previous_smaller_element([42]), [-1])

    def test_empty(self):
        self.assertEqual(previous_smaller_element([]), [])

    def test_duplicates(self):
        self.assertEqual(previous_smaller_element([3, 3, 3]), [-1, -1, -1])


class TestLargestRectangleHistogram(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(largest_rectangle_histogram([2, 1, 5, 6, 2, 3]), 10)

    def test_single_bar(self):
        self.assertEqual(largest_rectangle_histogram([5]), 5)

    def test_equal_heights(self):
        self.assertEqual(largest_rectangle_histogram([3, 3, 3, 3]), 12)

    def test_increasing(self):
        self.assertEqual(largest_rectangle_histogram([1, 2, 3, 4, 5]), 9)

    def test_decreasing(self):
        self.assertEqual(largest_rectangle_histogram([5, 4, 3, 2, 1]), 9)

    def test_empty(self):
        self.assertEqual(largest_rectangle_histogram([]), 0)

    def test_two_bars(self):
        self.assertEqual(largest_rectangle_histogram([2, 4]), 4)

    def test_valley(self):
        self.assertEqual(largest_rectangle_histogram([6, 2, 5, 4, 5, 1, 6]), 12)


class TestDailyTemperatures(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(
            daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]),
            [1, 1, 4, 2, 1, 1, 0, 0]
        )

    def test_decreasing(self):
        self.assertEqual(daily_temperatures([5, 4, 3, 2, 1]), [0, 0, 0, 0, 0])

    def test_increasing(self):
        self.assertEqual(daily_temperatures([1, 2, 3, 4, 5]), [1, 1, 1, 1, 0])

    def test_single(self):
        self.assertEqual(daily_temperatures([30]), [0])

    def test_empty(self):
        self.assertEqual(daily_temperatures([]), [])

    def test_same_temps(self):
        self.assertEqual(daily_temperatures([70, 70, 70]), [0, 0, 0])


class TestStockSpan(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(stock_span([100, 80, 60, 70, 60, 75, 85]), [1, 1, 1, 2, 1, 4, 6])

    def test_increasing(self):
        self.assertEqual(stock_span([10, 20, 30, 40]), [1, 2, 3, 4])

    def test_decreasing(self):
        self.assertEqual(stock_span([40, 30, 20, 10]), [1, 1, 1, 1])

    def test_single(self):
        self.assertEqual(stock_span([100]), [1])

    def test_empty(self):
        self.assertEqual(stock_span([]), [])

    def test_same_prices(self):
        self.assertEqual(stock_span([50, 50, 50]), [1, 2, 3])


if __name__ == "__main__":
    unittest.main()
