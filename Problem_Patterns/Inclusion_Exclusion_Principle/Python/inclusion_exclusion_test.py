"""
Unit tests for Inclusion-Exclusion Principle Pattern.
"""

import unittest
from inclusion_exclusion import count_divisible, count_union_sets, gcd


class TestInclusionExclusion(unittest.TestCase):
    def test_gcd(self):
        self.assertEqual(gcd(12, 18), 6)
        self.assertEqual(gcd(7, 5), 1)
    
    def test_count_divisible(self):
        result = count_divisible(100, [2, 3])
        # Numbers divisible by 2 or 3: 50 + 33 - 16 = 67
        self.assertEqual(result, 67)
        self.assertEqual(count_divisible(100, [2, 3, 5]), 74)
        self.assertEqual(count_divisible(30, [4, 6]), 10)  # 7 + 5 - 2 (lcm 12)

    def test_count_divisible_many_primes(self):
        primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]
        self.assertEqual(count_divisible(10**9, primes[:11]), 847147843)
        self.assertEqual(count_divisible(10**9, primes[:12]), 851278987)

    def test_count_union_sets(self):
        # Regression: every term used to be intersected with sets[0] as well.
        self.assertEqual(count_union_sets([[1, 2, 3], [2, 3, 4], [3, 4, 5]]), 5)
        self.assertEqual(count_union_sets([[1], [2]]), 2)
        self.assertEqual(count_union_sets([[1, 2], [1, 2]]), 2)
        self.assertEqual(count_union_sets([[], [7]]), 1)
        self.assertEqual(count_union_sets([]), 0)


if __name__ == "__main__":
    unittest.main()

