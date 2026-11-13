"""
Test cases for Fractional Knapsack
"""

import unittest
from fractional_knapsack import (
    fractional_knapsack,
    fractional_knapsack_value_only
)


class TestFractionalKnapsack(unittest.TestCase):
    
    def test_basic_knapsack(self):
        """Test basic fractional knapsack"""
        items = [(60, 10), (100, 20), (120, 30)]
        capacity = 50
        max_value, selected = fractional_knapsack(items, capacity)
        self.assertAlmostEqual(max_value, 240.0, places=2)
        # Ratios 6, 5, 4: two whole items, then 20/30 of the last one
        self.assertEqual(selected[:2], [(60, 10, 1.0), (100, 20, 1.0)])
        self.assertEqual(selected[2][:2], (120, 30))
        self.assertAlmostEqual(selected[2][2], 2 / 3)

    def test_all_items_fit(self):
        """Test when all items fit"""
        items = [(10, 5), (20, 10)]
        capacity = 20
        max_value, selected = fractional_knapsack(items, capacity)
        self.assertAlmostEqual(max_value, 30.0, places=2)
    
    def test_no_items_fit(self):
        """No item fits whole: the best-ratio item is cut to the capacity"""
        items = [(10, 20), (20, 30)]
        capacity = 5
        max_value, selected = fractional_knapsack(items, capacity)
        self.assertAlmostEqual(max_value, 20 * 5 / 30)
        self.assertEqual(len(selected), 1)
        self.assertAlmostEqual(selected[0][2], 5 / 30)
    
    def test_empty_items(self):
        """Test with empty items"""
        items = []
        capacity = 10
        max_value, selected = fractional_knapsack(items, capacity)
        self.assertEqual(max_value, 0)
    
    def test_zero_capacity(self):
        """Test with zero capacity"""
        items = [(10, 5), (20, 10)]
        capacity = 0
        max_value, selected = fractional_knapsack(items, capacity)
        self.assertEqual(max_value, 0)
    
    def test_value_only(self):
        """Test value-only function"""
        items = [(60, 10), (100, 20), (120, 30)]
        capacity = 50
        max_value = fractional_knapsack_value_only(items, capacity)
        self.assertAlmostEqual(max_value, 240.0, places=2)

    def test_input_is_not_modified(self):
        """Python sorts a copy of the items"""
        items = [(100, 20), (60, 10), (120, 30)]
        fractional_knapsack(items, 50)
        fractional_knapsack_value_only(items, 50)
        self.assertEqual(items, [(100, 20), (60, 10), (120, 30)])

    def test_greedy_is_not_the_01_answer(self):
        """The fractional optimum (240) beats the 0/1 optimum (220) on the same items"""
        items = [(60, 10), (100, 20), (120, 30)]
        self.assertGreater(fractional_knapsack(items, 50)[0], 220)

    def test_zero_weight_items(self):
        """Regression: a zero-weight item raised ZeroDivisionError. It uses no
        capacity, so it is always taken whole."""
        items = [(10, 0), (60, 10)]
        max_value, selected = fractional_knapsack(items, 5)
        self.assertAlmostEqual(max_value, 40.0)
        self.assertEqual(selected, [(10, 0, 1.0), (60, 10, 0.5)])
        self.assertAlmostEqual(fractional_knapsack_value_only(items, 5), 40.0)
        # A worthless zero-weight item must not turn the total into NaN.
        items = [(0, 0), (60, 10)]
        self.assertAlmostEqual(fractional_knapsack(items, 5)[0], 30.0)
        self.assertAlmostEqual(fractional_knapsack_value_only(items, 5), 30.0)


if __name__ == '__main__':
    unittest.main()

