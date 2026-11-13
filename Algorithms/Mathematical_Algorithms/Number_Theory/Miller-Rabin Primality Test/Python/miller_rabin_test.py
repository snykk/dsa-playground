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

    def test_matches_trial_division(self):
        """Both versions agree with trial division for 0..5000"""
        def trial(n):
            if n < 2:
                return False
            i = 2
            while i * i <= n:
                if n % i == 0:
                    return False
                i += 1
            return True
        for n in range(5001):
            self.assertEqual(miller_rabin_deterministic(n), trial(n), n)
            self.assertEqual(is_prime_miller_rabin(n, k=10), trial(n), n)

    def test_large_primes(self):
        """Primes above 2^32 and up to 2^64 (known primes)"""
        for p in [4294967291, 4294967311, 1000000000039, 2**61 - 1,
                  2**63 - 25, 2**64 - 59]:
            self.assertTrue(miller_rabin_deterministic(p), p)
            self.assertTrue(is_prime_miller_rabin(p, k=10), p)

    def test_strong_pseudoprimes(self):
        """Composites that fool several fixed bases"""
        # 3215031751 = 151 * 751 * 28351 is a strong pseudoprime to 2, 3, 5, 7.
        # 3825123056546413051 fools the first nine primes (2..23).
        for c in [3215031751, 3825123056546413051, 2**61 + 1, 2**32 + 1]:
            self.assertFalse(miller_rabin_deterministic(c), c)
            self.assertFalse(is_prime_miller_rabin(c, k=20), c)

    def test_deterministic_bound(self):
        """Twelve bases are exact below 318665857834031151167461, not above"""
        liar = 399165290221 * 798330580441
        self.assertEqual(liar, 318665857834031151167461)
        self.assertTrue(miller_rabin_deterministic(liar))  # wrong answer, by design of the bound
        self.assertFalse(miller_rabin_deterministic(liar + 1))  # even


if __name__ == '__main__':
    unittest.main()
