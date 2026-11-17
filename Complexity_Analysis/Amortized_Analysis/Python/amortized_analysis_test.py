"""
Test cases for Amortized Analysis examples
"""

import contextlib
import io
import re
import unittest
from amortized_analysis import DynamicArray, BinaryCounter, aggregate_method_example, accounting_method_example


class TestAmortizedAnalysis(unittest.TestCase):
    
    def test_dynamic_array(self):
        """Test dynamic array with amortized O(1) append"""
        arr = DynamicArray(initial_capacity=2)
        
        # Test appends
        for i in range(10):
            arr.append(i)
        
        self.assertEqual(arr.size, 10)
        self.assertGreaterEqual(arr.capacity, 10)
        
        # Test access
        self.assertEqual(arr.get(0), 0)
        self.assertEqual(arr.get(9), 9)
        
        # Test index error
        with self.assertRaises(IndexError):
            arr.get(10)
    
    def test_binary_counter(self):
        """Test binary counter with amortized O(1) increment"""
        counter = BinaryCounter(n_bits=4)
        
        # Test increments
        for i in range(5):
            counter.increment()
        
        self.assertEqual(counter.get_value(), 5)
        
        # Test more increments
        for i in range(10):
            counter.increment()
        
        # Value should wrap around for 4-bit counter
        self.assertGreaterEqual(counter.get_value(), 0)
        self.assertLess(counter.get_value(), 16)

    def test_zero_initial_capacity(self):
        """Regression: capacity 0 used to stay 0 after doubling and raise IndexError"""
        arr = DynamicArray(initial_capacity=0)
        for i in range(5):
            arr.append(i)
        self.assertEqual(arr.size, 5)
        self.assertEqual([arr.get(i) for i in range(5)], [0, 1, 2, 3, 4])

    def test_total_copy_cost_is_linear(self):
        """Aggregate bound: all resizes together copy fewer than 2n elements"""
        for n in (1, 10, 100, 1000):
            arr = DynamicArray(initial_capacity=1)
            for i in range(n):
                arr.append(i)
            self.assertLessEqual(arr.copies, 2 * n)
            self.assertLessEqual(n + arr.copies, 3 * n)

    def test_counter_flips_at_most_two_per_increment(self):
        """Aggregate bound: n increments flip at most 2n bits in total"""
        counter = BinaryCounter(n_bits=16)
        n = 1000
        for _ in range(n):
            counter.increment()
        self.assertLessEqual(counter.flips, 2 * n)
        self.assertEqual(counter.get_value(), n)

    def test_accounting_demo_counts_every_write(self):
        """Regression: the accounting demo dropped the writes of the resize appends and
        printed an impossible total ("Total cost: 6", "Amortized cost: 0.75")."""
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            accounting_method_example()
        text = out.getvalue()
        self.assertIn("Total actual cost: 14 (n writes + 6 copies)", text)
        self.assertIn("Actual cost per operation: 1.75", text)
        banks = [int(b) for b in re.findall(r"bank=(-?\d+)", text)]
        self.assertEqual(banks, [2, 4, 4, 6, 4, 6, 8, 10])

    def test_aggregate_demo_prints_the_operation_count(self):
        """Regression: a missing f prefix printed a literal "{operations}"."""
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            aggregate_method_example()
        self.assertIn("total cost O(n) / 10 operations = O(1)", out.getvalue())
        self.assertNotIn("{operations}", out.getvalue())


if __name__ == "__main__":
    unittest.main()


