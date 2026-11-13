"""
Unit tests for Modular Exponentiation
"""

import unittest
import math
import random
from modular_exponentiation import (
    mod_pow, mod_pow_recursive, mod_inverse, extended_gcd_inline
)


class TestModularExponentiation(unittest.TestCase):
    
    def test_mod_pow_basic(self):
        """Test basic modular exponentiation"""
        self.assertEqual(mod_pow(2, 10, 1000), 24)
        self.assertEqual(mod_pow(3, 5, 7), 5)
        self.assertEqual(mod_pow(5, 13, 11), 4)
    
    def test_mod_pow_exponent_zero(self):
        """Test with exponent zero"""
        self.assertEqual(mod_pow(5, 0, 7), 1)
        self.assertEqual(mod_pow(10, 0, 100), 1)
    
    def test_mod_pow_base_zero(self):
        """Test with base zero"""
        self.assertEqual(mod_pow(0, 5, 7), 0)
        self.assertEqual(mod_pow(0, 0, 7), 1)  # 0^0 = 1
    
    def test_mod_pow_modulus_one(self):
        """Test with modulus one"""
        self.assertEqual(mod_pow(5, 10, 1), 0)
    
    def test_mod_pow_large_exponent(self):
        """Test with large exponent"""
        # 2^100 mod 1000
        self.assertEqual(mod_pow(2, 100, 1000), 376)
        self.assertEqual(mod_pow_recursive(2, 100, 1000), 376)
    
    def test_mod_pow_recursive(self):
        """Test recursive version"""
        self.assertEqual(mod_pow_recursive(2, 10, 1000), 24)
        self.assertEqual(mod_pow_recursive(3, 5, 7), 5)
        # Should match iterative version
        self.assertEqual(mod_pow_recursive(2, 10, 1000), mod_pow(2, 10, 1000))
    
    def test_mod_inverse_basic(self):
        """Test modular inverse"""
        result = mod_inverse(3, 11)
        self.assertEqual(result, 4)
        self.assertEqual((3 * result) % 11, 1)
    
    def test_mod_inverse_coprime(self):
        """Test modular inverse with coprime numbers"""
        result = mod_inverse(7, 13)
        self.assertIsNotNone(result)
        self.assertEqual((7 * result) % 13, 1)
    
    def test_mod_inverse_not_coprime(self):
        """Test modular inverse when numbers are not coprime"""
        result = mod_inverse(4, 8)
        self.assertIsNone(result)  # GCD(4, 8) = 4 != 1
    
    def test_mod_inverse_verification(self):
        """Test that inverse property holds"""
        a, m = 5, 17
        inv = mod_inverse(a, m)
        self.assertIsNotNone(inv)
        self.assertEqual((a * inv) % m, 1)

    def test_negative_base(self):
        self.assertEqual(mod_pow(-2, 3, 5), 2)
        self.assertEqual(mod_pow_recursive(-2, 3, 5), 2)

    def test_negative_exponent_is_inverse_power(self):
        self.assertEqual(mod_pow(2, -1, 11), 6)
        self.assertEqual(mod_pow(2, -3, 11), pow(2, -3, 11))
        self.assertEqual(mod_pow_recursive(2, -1, 11), 6)
        self.assertIsNone(mod_pow(2, -1, 12))

    def test_inverse_of_negative_number(self):
        self.assertEqual(mod_inverse(-3, 11), 7)

    def test_extended_gcd_signed_identity(self):
        rng = random.Random(5)
        for _ in range(3000):
            a, b = rng.randint(-500, 500), rng.randint(-500, 500)
            g, x, y = extended_gcd_inline(a, b)
            self.assertEqual(g, math.gcd(a, b))
            self.assertEqual(a * x + b * y, g)

    def test_large_modulus_against_builtin(self):
        self.assertEqual(mod_pow(3, 10**6, 10**18 + 3), 390030038026333578)
        rng = random.Random(9)
        for _ in range(500):
            b = rng.randint(-10**12, 10**12)
            e = rng.randint(0, 10**12)
            m = rng.randint(1, 10**12)
            self.assertEqual(mod_pow(b, e, m), pow(b, e, m))
            self.assertEqual(mod_pow_recursive(b, e, m), pow(b, e, m))


if __name__ == '__main__':
    unittest.main()
