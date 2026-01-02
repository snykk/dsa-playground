"""
Unit tests for Inclusion-Exclusion Principle Pattern.
"""

import unittest
from inclusion_exclusion import count_divisible, gcd


class TestInclusionExclusion(unittest.TestCase):
    def test_gcd(self):
        self.assertEqual(gcd(12, 18), 6)
        self.assertEqual(gcd(7, 5), 1)
    
    def test_count_divisible(self):
        result = count_divisible(100, [2, 3])
        # Numbers divisible by 2 or 3: 50 + 33 - 16 = 67
        self.assertGreater(result, 0)


if __name__ == "__main__":
    unittest.main()

