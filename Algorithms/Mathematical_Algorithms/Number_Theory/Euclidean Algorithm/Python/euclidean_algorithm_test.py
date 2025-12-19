"""
Unit tests for Euclidean Algorithm
"""

import unittest
from euclidean_algorithm import gcd, gcd_iterative, lcm, extended_gcd


class TestEuclideanAlgorithm(unittest.TestCase):
    
    def test_gcd_basic(self):
        """Test basic GCD computation"""
        self.assertEqual(gcd(48, 18), 6)
        self.assertEqual(gcd(100, 25), 25)
        self.assertEqual(gcd(17, 13), 1)
    
    def test_gcd_commutative(self):
        """Test that GCD is commutative"""
        self.assertEqual(gcd(48, 18), gcd(18, 48))
        self.assertEqual(gcd(100, 25), gcd(25, 100))
    
    def test_gcd_with_zero(self):
        """Test GCD with zero"""
        self.assertEqual(gcd(0, 5), 5)
        self.assertEqual(gcd(5, 0), 5)
        self.assertEqual(gcd(0, 0), 0)
    
    def test_gcd_negative(self):
        """Test GCD with negative numbers"""
        self.assertEqual(gcd(-48, 18), 6)
        self.assertEqual(gcd(48, -18), 6)
        self.assertEqual(gcd(-48, -18), 6)
    
    def test_gcd_same_number(self):
        """Test GCD of same number"""
        self.assertEqual(gcd(42, 42), 42)
        self.assertEqual(gcd(1, 1), 1)
    
    def test_gcd_iterative(self):
        """Test iterative GCD"""
        self.assertEqual(gcd_iterative(48, 18), 6)
        self.assertEqual(gcd_iterative(100, 25), 25)
        self.assertEqual(gcd_iterative(17, 13), 1)
        # Should match recursive version
        self.assertEqual(gcd_iterative(48, 18), gcd(48, 18))
    
    def test_lcm_basic(self):
        """Test basic LCM computation"""
        self.assertEqual(lcm(12, 18), 36)
        self.assertEqual(lcm(7, 5), 35)
        self.assertEqual(lcm(4, 6), 12)
    
    def test_lcm_commutative(self):
        """Test that LCM is commutative"""
        self.assertEqual(lcm(12, 18), lcm(18, 12))
        self.assertEqual(lcm(7, 5), lcm(5, 7))
    
    def test_lcm_with_zero(self):
        """Test LCM with zero"""
        self.assertEqual(lcm(0, 5), 0)
        self.assertEqual(lcm(5, 0), 0)
    
    def test_lcm_same_number(self):
        """Test LCM of same number"""
        self.assertEqual(lcm(42, 42), 42)
        self.assertEqual(lcm(1, 1), 1)
    
    def test_lcm_gcd_relationship(self):
        """Test relationship: LCM(a, b) * GCD(a, b) = |a * b|"""
        a, b = 12, 18
        self.assertEqual(lcm(a, b) * gcd(a, b), abs(a * b))
        
        a, b = 7, 5
        self.assertEqual(lcm(a, b) * gcd(a, b), abs(a * b))
    
    def test_extended_gcd(self):
        """Test Extended Euclidean Algorithm"""
        gcd_val, x, y = extended_gcd(48, 18)
        self.assertEqual(gcd_val, 6)
        # Verify Bézout's identity: ax + by = gcd
        self.assertEqual(48 * x + 18 * y, gcd_val)
        
        gcd_val, x, y = extended_gcd(100, 25)
        self.assertEqual(gcd_val, 25)
        self.assertEqual(100 * x + 25 * y, gcd_val)
    
    def test_extended_gcd_coprime(self):
        """Test Extended GCD with coprime numbers"""
        gcd_val, x, y = extended_gcd(17, 13)
        self.assertEqual(gcd_val, 1)
        self.assertEqual(17 * x + 13 * y, 1)


if __name__ == '__main__':
    unittest.main()
