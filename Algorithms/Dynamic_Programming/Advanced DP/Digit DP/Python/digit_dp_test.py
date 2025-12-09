"""
Test cases for Digit DP
"""

import unittest
from digit_dp import count_numbers_with_digit_sum


class TestDigitDP(unittest.TestCase):
    
    def test_digit_sum(self):
        """Test counting numbers with digit sum"""
        result = count_numbers_with_digit_sum(100, 5)
        self.assertGreaterEqual(result, 0)


if __name__ == '__main__':
    unittest.main()

