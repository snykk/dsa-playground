"""
Unit tests for Chinese Remainder Theorem
"""

import unittest
from chinese_remainder_theorem import (
    chinese_remainder_theorem,
    chinese_remainder_theorem_pairwise,
    extended_gcd,
    verify_crt_solution
)
import math
import random


class TestChineseRemainderTheorem(unittest.TestCase):
    
    def test_basic_crt(self):
        """Test basic CRT problem"""
        remainders = [2, 3, 2]
        moduli = [3, 5, 7]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertEqual(solution, 23)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
    
    def test_two_congruences(self):
        """Test system with two congruences"""
        remainders = [1, 2]
        moduli = [3, 5]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertEqual(solution, 7)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
    
    def test_three_congruences(self):
        """Test system with three congruences"""
        remainders = [1, 2, 3]
        moduli = [3, 5, 7]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
    
    def test_not_coprime(self):
        """Test with moduli that are not pairwise coprime"""
        remainders = [1, 2]
        moduli = [4, 6]  # GCD(4, 6) = 2 != 1
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNone(solution)
    
    def test_pairwise_crt(self):
        """Test pairwise CRT function"""
        solution = chinese_remainder_theorem_pairwise(1, 3, 2, 5)
        self.assertIsNotNone(solution)
        self.assertEqual(solution, 7)
        self.assertEqual(solution % 3, 1)
        self.assertEqual(solution % 5, 2)
    
    def test_pairwise_crt_not_coprime(self):
        """Test pairwise CRT with non-coprime moduli"""
        solution = chinese_remainder_theorem_pairwise(1, 4, 2, 6)
        self.assertIsNone(solution)
    
    def test_verify_solution(self):
        """Test solution verification"""
        remainders = [2, 3, 2]
        moduli = [3, 5, 7]
        solution = 23
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
        
        # Wrong solution
        self.assertFalse(verify_crt_solution(22, remainders, moduli))
    
    def test_larger_moduli(self):
        """Test with larger moduli"""
        remainders = [1, 2, 3, 4]
        moduli = [5, 7, 11, 13]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
    
    def test_single_congruence(self):
        """Test with single congruence (trivial case)"""
        remainders = [5]
        moduli = [7]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertEqual(solution, 5)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))

    def test_extended_gcd_signed_identity(self):
        """a*x + b*y == gcd(a, b) for inputs of any sign"""
        rng = random.Random(12345)
        for _ in range(5000):
            a, b = rng.randint(-1000, 1000), rng.randint(-1000, 1000)
            g, x, y = extended_gcd(a, b)
            self.assertEqual(g, math.gcd(a, b))
            self.assertEqual(a * x + b * y, g)
        self.assertEqual(extended_gcd(-48, 18)[0], 6)

    def test_negative_remainder(self):
        self.assertEqual(chinese_remainder_theorem([-1], [7]), 6)
        self.assertEqual(chinese_remainder_theorem([-1, 2], [3, 5]), 2)

    def test_verify_normalizes_remainder(self):
        self.assertEqual(chinese_remainder_theorem([8], [3]), 2)
        self.assertTrue(verify_crt_solution(2, [8], [3]))
        self.assertTrue(verify_crt_solution(6, [-1], [7]))

    def test_large_moduli(self):
        r, m = [10**9 + 6, 998244352], [10**9 + 7, 998244353]
        x = chinese_remainder_theorem(r, m)
        self.assertEqual(x, 998244359987710470)
        self.assertTrue(verify_crt_solution(x, r, m))

    def test_non_coprime_solvable(self):
        """x = 1 (mod 4), x = 3 (mod 6) has the solution 9 (mod 12)"""
        self.assertEqual(chinese_remainder_theorem([1, 3], [4, 6]), 9)
        self.assertIsNone(chinese_remainder_theorem([1, 2], [4, 6]))
        self.assertEqual(chinese_remainder_theorem([5, 3, 8], [6, 10, 15]), 23)

    def test_random_against_brute_force(self):
        rng = random.Random(7)
        for _ in range(500):
            ms = [rng.randint(1, 20) for _ in range(rng.randint(1, 3))]
            rs = [rng.randint(-30, 30) for _ in ms]
            lcm = 1
            for m in ms:
                lcm = lcm * m // math.gcd(lcm, m)
            expected = [x for x in range(lcm)
                        if all((x - r) % m == 0 for r, m in zip(rs, ms))]
            got = chinese_remainder_theorem(rs, ms)
            self.assertEqual(got, expected[0] if expected else None)


if __name__ == '__main__':
    unittest.main()
