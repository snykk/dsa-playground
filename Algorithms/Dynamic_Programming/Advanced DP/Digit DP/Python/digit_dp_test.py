"""
Test cases for Digit DP
"""

import unittest
from digit_dp import count_numbers_with_digit_sum


class TestDigitDP(unittest.TestCase):
    
    def test_digit_sum(self):
        """Test counting numbers with digit sum"""
        result = count_numbers_with_digit_sum(100, 5)
        self.assertEqual(result, 6)

    def test_matches_brute_force(self):
        for n in (0, 9, 10, 99, 100, 123, 999, 1000, 4321):
            for target in (0, 1, 5, 9, 18, 27):
                expected = sum(1 for x in range(n + 1) if sum(map(int, str(x))) == target)
                self.assertEqual(count_numbers_with_digit_sum(n, target), expected, (n, target))

    def test_zero_and_target_zero(self):
        self.assertEqual(count_numbers_with_digit_sum(0, 0), 1)
        self.assertEqual(count_numbers_with_digit_sum(0, 3), 0)
        self.assertEqual(count_numbers_with_digit_sum(1000, 0), 1)

    def test_negative_bound_counts_nothing(self):
        """count(R) - count(L - 1) must work for L = 0"""
        self.assertEqual(count_numbers_with_digit_sum(-1, 0), 0)
        self.assertEqual(count_numbers_with_digit_sum(100, 5) - count_numbers_with_digit_sum(-1, 5), 6)

    def test_unreachable_target(self):
        self.assertEqual(count_numbers_with_digit_sum(99, 19), 0)


if __name__ == '__main__':
    unittest.main()

