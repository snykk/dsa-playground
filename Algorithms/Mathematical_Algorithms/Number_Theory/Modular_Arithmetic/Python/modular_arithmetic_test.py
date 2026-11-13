"""
Unit tests for Modular Arithmetic
"""

import unittest
from modular_arithmetic import (
    mod_add, mod_subtract, mod_multiply, mod_divide,
    mod_inverse, mod_power, extended_gcd
)
import math
import random


class TestModularArithmetic(unittest.TestCase):
    
    def test_mod_add(self):
        """Test modular addition"""
        self.assertEqual(mod_add(7, 5, 11), 1)
        self.assertEqual(mod_add(10, 5, 11), 4)
        self.assertEqual(mod_add(0, 0, 11), 0)
    
    def test_mod_subtract(self):
        """Test modular subtraction"""
        self.assertEqual(mod_subtract(7, 5, 11), 2)
        self.assertEqual(mod_subtract(3, 5, 11), 9)  # 3 - 5 = -2, which is 9 (mod 11)
        self.assertEqual(mod_subtract(0, 0, 11), 0)
    
    def test_mod_multiply(self):
        """Test modular multiplication"""
        self.assertEqual(mod_multiply(7, 5, 11), 2)
        self.assertEqual(mod_multiply(3, 4, 11), 1)
        self.assertEqual(mod_multiply(0, 5, 11), 0)
    
    def test_mod_divide(self):
        """Test modular division"""
        self.assertEqual(mod_divide(7, 5, 11), 8)  # 7/5 = 7*9 = 8 (mod 11)
        self.assertEqual(mod_divide(6, 3, 11), 2)
        result = mod_divide(4, 8, 11)
        self.assertIsNotNone(result)
        self.assertEqual((result * 8) % 11, 4)
    
    def test_mod_divide_no_inverse(self):
        """Test modular division when inverse doesn't exist"""
        result = mod_divide(4, 8, 12)  # GCD(8, 12) = 4 != 1
        self.assertIsNone(result)
    
    def test_mod_inverse(self):
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
        self.assertIsNone(result)
    
    def test_mod_power(self):
        """Test modular exponentiation"""
        self.assertEqual(mod_power(2, 5, 11), 10)
        self.assertEqual(mod_power(3, 5, 7), 5)
        self.assertEqual(mod_power(5, 0, 11), 1)
    
    def test_mod_power_large_exponent(self):
        """Test modular exponentiation with large exponent"""
        result = mod_power(2, 100, 1000)
        self.assertEqual(result, 376)
    
    def test_mod_arithmetic_properties(self):
        """Test properties of modular arithmetic"""
        m = 11
        a, b, c = 7, 5, 3
        
        # Associativity of addition
        self.assertEqual(
            mod_add(mod_add(a, b, m), c, m),
            mod_add(a, mod_add(b, c, m), m)
        )
        
        # Associativity of multiplication
        self.assertEqual(
            mod_multiply(mod_multiply(a, b, m), c, m),
            mod_multiply(a, mod_multiply(b, c, m), m)
        )
        
        # Distributivity
        self.assertEqual(
            mod_multiply(a, mod_add(b, c, m), m),
            mod_add(mod_multiply(a, b, m), mod_multiply(a, c, m), m)
        )

    def test_negative_operands_give_residues_in_range(self):
        self.assertEqual(mod_add(-3, 1, 11), 9)
        self.assertEqual(mod_multiply(-3, 4, 11), 10)
        self.assertEqual(mod_power(-2, 3, 5), 2)
        self.assertEqual(mod_subtract(-3, -5, 11), 2)

    def test_extended_gcd_signed_identity(self):
        rng = random.Random(11)
        for _ in range(3000):
            a, b = rng.randint(-500, 500), rng.randint(-500, 500)
            g, x, y = extended_gcd(a, b)
            self.assertEqual(g, math.gcd(a, b))
            self.assertEqual(a * x + b * y, g)

    def test_inverse_of_negative_number(self):
        self.assertEqual(mod_inverse(-3, 11), 7)
        self.assertEqual(mod_divide(1, -3, 11), 7)
        for a in range(-30, 30):
            inv = mod_inverse(a, 11)
            if a % 11 == 0:
                self.assertIsNone(inv)
            else:
                self.assertEqual((a * inv) % 11, 1)

    def test_negative_exponent_is_inverse_power(self):
        self.assertEqual(mod_power(2, -1, 11), 6)
        self.assertEqual(mod_power(2, -3, 11), pow(2, -3, 11))
        self.assertIsNone(mod_power(2, -1, 12))

    def test_large_modulus(self):
        m = 10**18 + 3
        self.assertEqual(mod_multiply(10**12, 10**12, m), 999999999997000003)
        self.assertEqual(mod_power(3, 10**6, m), 390030038026333578)
        self.assertEqual(mod_power(2**100, 2, 1000), pow(2**100, 2, 1000))


if __name__ == '__main__':
    unittest.main()
