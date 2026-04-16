"""
Unit tests for Modular Exponentiation
"""

import unittest
from modular_exponentiation import mod_pow, mod_pow_recursive, mod_inverse


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
        result = mod_pow(2, 100, 1000)
        self.assertGreaterEqual(result, 0)
        self.assertLess(result, 1000)
    
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


if __name__ == '__main__':
    unittest.main()
