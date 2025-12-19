"""
Unit tests for Modular Arithmetic
"""

import unittest
from modular_arithmetic import (
    mod_add, mod_subtract, mod_multiply, mod_divide,
    mod_inverse, mod_power
)


class TestModularArithmetic(unittest.TestCase):
    
    def test_mod_add(self):
        """Test modular addition"""
        self.assertEqual(mod_add(7, 5, 11), 1)
        self.assertEqual(mod_add(10, 5, 11), 4)
        self.assertEqual(mod_add(0, 0, 11), 0)
    
    def test_mod_subtract(self):
        """Test modular subtraction"""
        self.assertEqual(mod_subtract(7, 5, 11), 2)
        self.assertEqual(mod_subtract(3, 5, 11), 9)  # 3 - 5 = -2 ≡ 9 (mod 11)
        self.assertEqual(mod_subtract(0, 0, 11), 0)
    
    def test_mod_multiply(self):
        """Test modular multiplication"""
        self.assertEqual(mod_multiply(7, 5, 11), 2)
        self.assertEqual(mod_multiply(3, 4, 11), 1)
        self.assertEqual(mod_multiply(0, 5, 11), 0)
    
    def test_mod_divide(self):
        """Test modular division"""
        self.assertEqual(mod_divide(7, 5, 11), 8)  # 7/5 ≡ 7*9 ≡ 8 (mod 11)
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
        self.assertGreaterEqual(result, 0)
        self.assertLess(result, 1000)
    
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


if __name__ == '__main__':
    unittest.main()
