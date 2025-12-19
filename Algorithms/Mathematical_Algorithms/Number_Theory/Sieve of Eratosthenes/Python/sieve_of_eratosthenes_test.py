"""
Unit tests for Sieve of Eratosthenes
"""

import unittest
from sieve_of_eratosthenes import sieve_of_eratosthenes, sieve_boolean, is_prime_sieve


class TestSieveOfEratosthenes(unittest.TestCase):
    
    def test_sieve_small(self):
        """Test sieve with small limit"""
        primes = sieve_of_eratosthenes(10)
        expected = [2, 3, 5, 7]
        self.assertEqual(primes, expected)
    
    def test_sieve_medium(self):
        """Test sieve with medium limit"""
        primes = sieve_of_eratosthenes(30)
        expected = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
        self.assertEqual(primes, expected)
    
    def test_sieve_count(self):
        """Test count of primes"""
        primes_100 = sieve_of_eratosthenes(100)
        self.assertEqual(len(primes_100), 25)
        
        primes_50 = sieve_of_eratosthenes(50)
        self.assertEqual(len(primes_50), 15)
    
    def test_sieve_empty(self):
        """Test sieve with n < 2"""
        self.assertEqual(sieve_of_eratosthenes(1), [])
        self.assertEqual(sieve_of_eratosthenes(0), [])
    
    def test_sieve_boolean(self):
        """Test boolean sieve"""
        sieve = sieve_boolean(20)
        self.assertFalse(sieve[0])
        self.assertFalse(sieve[1])
        self.assertTrue(sieve[2])
        self.assertTrue(sieve[3])
        self.assertFalse(sieve[4])
        self.assertTrue(sieve[5])
        self.assertFalse(sieve[6])
        self.assertTrue(sieve[7])
        self.assertFalse(sieve[8])
        self.assertFalse(sieve[9])
        self.assertFalse(sieve[10])
        self.assertTrue(sieve[11])
    
    def test_is_prime_sieve(self):
        """Test prime checking with sieve"""
        sieve = sieve_boolean(100)
        self.assertTrue(is_prime_sieve(17, sieve))
        self.assertTrue(is_prime_sieve(29, sieve))
        self.assertFalse(is_prime_sieve(20, sieve))
        self.assertFalse(is_prime_sieve(1, sieve))
        self.assertFalse(is_prime_sieve(0, sieve))
    
    def test_sieve_consistency(self):
        """Test that sieve and boolean array are consistent"""
        n = 50
        primes = sieve_of_eratosthenes(n)
        sieve = sieve_boolean(n)
        
        # All numbers in primes list should be marked as prime
        for p in primes:
            self.assertTrue(sieve[p])
        
        # Count primes in boolean array
        count = sum(1 for i in range(2, n + 1) if sieve[i])
        self.assertEqual(count, len(primes))


if __name__ == '__main__':
    unittest.main()
