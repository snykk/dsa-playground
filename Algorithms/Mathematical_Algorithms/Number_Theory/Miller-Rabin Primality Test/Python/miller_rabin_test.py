"""
Unit tests for Miller-Rabin Primality Test
"""

import unittest
from miller_rabin import miller_rabin, is_prime_miller_rabin, miller_rabin_deterministic


class TestMillerRabin(unittest.TestCase):
    
    def test_small_primes(self):
        """Test small prime numbers"""
        primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
        for p in primes:
            self.assertTrue(is_prime_miller_rabin(p), f"{p} should be prime")
    
    def test_small_composites(self):
        """Test small composite numbers"""
        composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25]
        for c in composites:
            self.assertFalse(is_prime_miller_rabin(c), f"{c} should be composite")
    
    def test_edge_cases(self):
        """Test edge cases"""
        self.assertFalse(is_prime_miller_rabin(0))
        self.assertFalse(is_prime_miller_rabin(1))
        self.assertTrue(is_prime_miller_rabin(2))
        self.assertTrue(is_prime_miller_rabin(3))
    
    def test_carmichael_numbers(self):
        """Test Carmichael numbers (composite but pass Fermat test)"""
        # Miller-Rabin should correctly identify these as composite
        carmichael = [561, 1105, 1729, 2465, 2821]
        for c in carmichael:
            self.assertFalse(is_prime_miller_rabin(c, k=10), f"{c} (Carmichael) should be composite")
    
    def test_large_primes(self):
        """Test larger prime numbers"""
        large_primes = [97, 101, 103, 107, 109, 113, 127, 131, 137, 139]
        for p in large_primes:
            self.assertTrue(is_prime_miller_rabin(p, k=10), f"{p} should be prime")
    
    def test_miller_rabin_function(self):
        """Test miller_rabin function directly"""
        self.assertTrue(miller_rabin(17, k=5))
        self.assertFalse(miller_rabin(15, k=5))
        self.assertTrue(miller_rabin(97, k=5))
    
    def test_deterministic_version(self):
        """Test deterministic version for small numbers"""
        primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 97, 101]
        for p in primes:
            self.assertTrue(miller_rabin_deterministic(p), f"{p} should be prime")
        
        composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 100]
        for c in composites:
            self.assertFalse(miller_rabin_deterministic(c), f"{c} should be composite")
    
    def test_consistency(self):
        """Test consistency between probabilistic and deterministic versions"""
        test_numbers = [17, 19, 23, 29, 31, 37, 41, 43, 47, 97, 101, 103]
        for n in test_numbers:
            prob_result = is_prime_miller_rabin(n, k=10)
            det_result = miller_rabin_deterministic(n)
            self.assertEqual(prob_result, det_result, f"Inconsistency for {n}")


if __name__ == '__main__':
    unittest.main()
