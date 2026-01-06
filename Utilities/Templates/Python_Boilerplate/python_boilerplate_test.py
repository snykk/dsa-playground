"""
Test suite for Python Boilerplate utilities
"""

import unittest
from python_boilerplate import (
    gcd, lcm, power, mod_inverse, is_prime, sieve,
    Combinatorics, DSU, SegTree, binary_search,
    MOD
)


class TestMathUtilities(unittest.TestCase):
    """Test cases for math utilities."""
    
    def test_gcd(self):
        """Test GCD function."""
        self.assertEqual(gcd(12, 18), 6)
        self.assertEqual(gcd(17, 13), 1)
        self.assertEqual(gcd(100, 25), 25)
        self.assertEqual(gcd(7, 7), 7)
    
    def test_lcm(self):
        """Test LCM function."""
        self.assertEqual(lcm(4, 6), 12)
        self.assertEqual(lcm(3, 5), 15)
        self.assertEqual(lcm(12, 18), 36)
        self.assertEqual(lcm(7, 1), 7)
    
    def test_power(self):
        """Test fast exponentiation."""
        self.assertEqual(power(2, 10), 1024)
        self.assertEqual(power(3, 5), 243)
        self.assertEqual(power(2, 0), 1)
        self.assertEqual(power(5, 1), 5)
        # Test with modular arithmetic
        self.assertEqual(power(2, 30, MOD), (2**30) % MOD)
    
    def test_mod_inverse(self):
        """Test modular inverse."""
        a = 12345
        inv = mod_inverse(a)
        self.assertEqual((a * inv) % MOD, 1)
        
        a = 1000000
        inv = mod_inverse(a)
        self.assertEqual((a * inv) % MOD, 1)
    
    def test_is_prime(self):
        """Test primality check."""
        self.assertFalse(is_prime(0))
        self.assertFalse(is_prime(1))
        self.assertTrue(is_prime(2))
        self.assertTrue(is_prime(3))
        self.assertFalse(is_prime(4))
        self.assertTrue(is_prime(17))
        self.assertFalse(is_prime(100))
    
    def test_sieve(self):
        """Test sieve of Eratosthenes."""
        primes = sieve(30)
        expected = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
        self.assertEqual(primes, expected)


class TestCombinatorics(unittest.TestCase):
    """Test cases for combinatorics."""
    
    def setUp(self):
        self.comb = Combinatorics(1000)
    
    def test_nCr(self):
        """Test combinations."""
        self.assertEqual(self.comb.nCr(5, 2), 10)
        self.assertEqual(self.comb.nCr(10, 5), 252)
        self.assertEqual(self.comb.nCr(5, 0), 1)
        self.assertEqual(self.comb.nCr(5, 5), 1)
        self.assertEqual(self.comb.nCr(5, 6), 0)
    
    def test_nPr(self):
        """Test permutations."""
        self.assertEqual(self.comb.nPr(5, 2), 20)
        self.assertEqual(self.comb.nPr(5, 5), 120)
        self.assertEqual(self.comb.nPr(5, 0), 1)


class TestDSU(unittest.TestCase):
    """Test cases for Disjoint Set Union."""
    
    def test_basic_operations(self):
        """Test basic DSU operations."""
        dsu = DSU(5)
        
        # Initially all elements in their own set
        self.assertEqual(dsu.find(0), 0)
        self.assertEqual(dsu.find(1), 1)
        
        # Unite 0 and 1
        self.assertTrue(dsu.unite(0, 1))
        self.assertTrue(dsu.connected(0, 1))
        
        # Unite 2 and 3
        dsu.unite(2, 3)
        self.assertTrue(dsu.connected(2, 3))
        
        # 0,1 and 2,3 are different sets
        self.assertFalse(dsu.connected(0, 2))
        
        # Unite the two sets
        dsu.unite(1, 3)
        self.assertTrue(dsu.connected(0, 2))
        
        # Cannot unite already connected elements
        self.assertFalse(dsu.unite(0, 2))
    
    def test_size(self):
        """Test component size tracking."""
        dsu = DSU(5)
        
        self.assertEqual(dsu.get_size(0), 1)
        
        dsu.unite(0, 1)
        self.assertEqual(dsu.get_size(0), 2)
        self.assertEqual(dsu.get_size(1), 2)
        
        dsu.unite(2, 3)
        dsu.unite(0, 2)
        self.assertEqual(dsu.get_size(0), 4)


class TestSegTree(unittest.TestCase):
    """Test cases for Segment Tree."""
    
    def test_point_update_and_query(self):
        """Test point updates and range queries."""
        st = SegTree(5)
        
        # Initial tree is all zeros
        self.assertEqual(st.range_query(0, 4), 0)
        
        # Update individual elements
        st.point_update(0, 1)
        st.point_update(1, 2)
        st.point_update(2, 3)
        st.point_update(3, 4)
        st.point_update(4, 5)
        
        # Test range queries
        self.assertEqual(st.range_query(0, 4), 15)  # 1+2+3+4+5
        self.assertEqual(st.range_query(0, 2), 6)   # 1+2+3
        self.assertEqual(st.range_query(2, 4), 12)  # 3+4+5
        self.assertEqual(st.range_query(1, 1), 2)   # Single element


class TestBinarySearch(unittest.TestCase):
    """Test cases for binary search."""
    
    def test_binary_search(self):
        """Test binary search."""
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        
        self.assertEqual(binary_search(arr, 5), 4)
        self.assertEqual(binary_search(arr, 1), 0)
        self.assertEqual(binary_search(arr, 10), 9)
        self.assertEqual(binary_search(arr, 11), -1)
        self.assertEqual(binary_search(arr, 0), -1)


if __name__ == '__main__':
    unittest.main()

