"""Unit tests for the Python modular arithmetic helpers."""

import unittest
from math import comb, gcd

from modular_tricks import (
    MOD, mod, add, sub, mul, power, mod_inverse, ext_gcd, mod_inverse_ext_gcd,
    div_mod, Factorials, lucas_nCr, chinese_remainder, matrix_mult,
    matrix_power, fibonacci,
)


class TestBasics(unittest.TestCase):
    def test_mod_handles_negatives(self):
        self.assertEqual(mod(-5, MOD), MOD - 5)
        self.assertEqual(mod(-5, 3), 1)
        self.assertEqual(mod(10, 3), 1)

    def test_add_sub_mul(self):
        self.assertEqual(add(MOD - 1, 5), 4)
        self.assertEqual(sub(3, 5), MOD - 2)
        self.assertEqual(sub(-3, -5), 2)
        self.assertEqual(mul(MOD - 1, MOD - 1), 1)
        self.assertEqual(mul(-2, 3, 7), 1)

    def test_power(self):
        self.assertEqual(power(2, 10), 1024)
        self.assertEqual(power(2, 100, 10 ** 9 + 7), pow(2, 100, 10 ** 9 + 7))
        self.assertEqual(power(0, 0, 7), 1)
        self.assertEqual(power(3, 0, 7), 1)

    def test_power_modulus_one(self):
        """Everything is 0 modulo 1, including x^0"""
        self.assertEqual(power(5, 0, 1), 0)
        self.assertEqual(power(5, 3, 1), 0)


class TestInverse(unittest.TestCase):
    def test_fermat_inverse(self):
        for a in (1, 2, 3, 12345, MOD - 1):
            self.assertEqual(mul(a, mod_inverse(a)), 1)

    def test_ext_gcd(self):
        g, x, y = ext_gcd(240, 46)
        self.assertEqual(g, 2)
        self.assertEqual(240 * x + 46 * y, 2)

    def test_inverse_with_composite_modulus(self):
        self.assertEqual(mod_inverse_ext_gcd(3, 10), 7)
        self.assertEqual(mod_inverse_ext_gcd(2, 10), -1)

    def test_div_mod(self):
        self.assertEqual(div_mod(10, 5), 2)
        self.assertEqual(mul(div_mod(7, 3), 3), 7)


class TestFactorials(unittest.TestCase):
    def test_small_values(self):
        f = Factorials(20)
        self.assertEqual(f.fact[5], 120)
        self.assertEqual(f.nCr(10, 3), 120)
        self.assertEqual(f.nPr(10, 3), 720)
        self.assertEqual(f.nCr(5, 7), 0)
        self.assertEqual(f.nCr(5, -1), 0)

    def test_matches_exact_binomials(self):
        f = Factorials(60)
        for n in range(0, 61, 7):
            for r in range(0, n + 1, 5):
                self.assertEqual(f.nCr(n, r), comb(n, r) % MOD)


class TestLucas(unittest.TestCase):
    def test_matches_exact_binomials(self):
        p = 37
        f = Factorials(p - 1, p)
        for n in (36, 40, 100, 1000, 12345):
            for r in (0, 1, 5, 18, 36, 37, 74, n // 2, n):
                self.assertEqual(lucas_nCr(n, r, p, f), comb(n, r) % p, (n, r))

    def test_r_greater_than_n(self):
        f = Factorials(6, 7)
        self.assertEqual(lucas_nCr(5, 9, 7, f), 0)

    def test_wrong_factorial_table_rejected(self):
        """A table built for another modulus or size must not be used silently"""
        with self.assertRaises(ValueError):
            lucas_nCr(36, 18, 37, Factorials(36))          # default modulus 1e9+7
        with self.assertRaises(ValueError):
            lucas_nCr(36, 18, 37, Factorials(10, 37))      # too short
        with self.assertRaises(ValueError):
            lucas_nCr(36, 18, 37, Factorials(40, 37))      # reaches p


class TestCrt(unittest.TestCase):
    def test_coprime(self):
        self.assertEqual(chinese_remainder([2, 3, 2], [3, 5, 7]), 23)

    def test_non_coprime_consistent(self):
        """x = 1 (mod 2), x = 3 (mod 4) has the solution 3"""
        self.assertEqual(chinese_remainder([1, 3], [2, 4]), 3)
        x = chinese_remainder([2, 4, 1], [6, 8, 5])
        self.assertEqual((x % 6, x % 8, x % 5), (2, 4, 1))

    def test_non_coprime_inconsistent(self):
        with self.assertRaises(ValueError):
            chinese_remainder([1, 2], [2, 4])

    def test_empty_and_single(self):
        self.assertEqual(chinese_remainder([], []), 0)
        self.assertEqual(chinese_remainder([7], [5]), 2)

    def test_random_systems_against_brute_force(self):
        import random
        rng = random.Random(1)
        for _ in range(300):
            ms = [rng.randint(1, 12) for _ in range(rng.randint(1, 3))]
            rs = [rng.randint(0, 20) for _ in ms]
            lcm = 1
            for m in ms:
                lcm = lcm * m // gcd(lcm, m)
            brute = next((x for x in range(lcm)
                          if all(x % m == r % m for r, m in zip(rs, ms))), None)
            if brute is None:
                with self.assertRaises(ValueError):
                    chinese_remainder(rs, ms)
            else:
                self.assertEqual(chinese_remainder(rs, ms), brute)


class TestMatrixAndFibonacci(unittest.TestCase):
    def test_matrix_power(self):
        self.assertEqual(matrix_power([[1, 1], [1, 0]], 10, 1000), [[89, 55], [55, 34]])
        self.assertEqual(matrix_mult([[1, 2], [3, 4]], [[5, 6], [7, 8]], 100), [[19, 22], [43, 50]])

    def test_fibonacci(self):
        self.assertEqual([fibonacci(i) for i in range(10)], [0, 1, 1, 2, 3, 5, 8, 13, 21, 34])
        a, b = 0, 1
        for _ in range(200):
            a, b = b, a + b
        self.assertEqual(fibonacci(200), a % MOD)


if __name__ == "__main__":
    unittest.main()
