"""
Test cases for Fibonacci Numbers
"""

import unittest
from fibonacci import (
    fibonacci_naive,
    fibonacci_memoization,
    fibonacci_tabulation,
    fibonacci_optimized,
    fibonacci_matrix,
    fibonacci_sequence
)


class TestFibonacci(unittest.TestCase):
    
    def test_base_cases(self):
        """Test base cases"""
        self.assertEqual(fibonacci_tabulation(0), 0)
        self.assertEqual(fibonacci_tabulation(1), 1)
    
    def test_small_values(self):
        """Test small Fibonacci numbers"""
        self.assertEqual(fibonacci_tabulation(2), 1)
        self.assertEqual(fibonacci_tabulation(3), 2)
        self.assertEqual(fibonacci_tabulation(4), 3)
        self.assertEqual(fibonacci_tabulation(5), 5)
        self.assertEqual(fibonacci_tabulation(6), 8)
    
    def test_memoization(self):
        """Test memoization approach"""
        self.assertEqual(fibonacci_memoization(10), 55)
        self.assertEqual(fibonacci_memoization(20), 6765)
    
    def test_tabulation(self):
        """Test tabulation approach"""
        self.assertEqual(fibonacci_tabulation(10), 55)
        self.assertEqual(fibonacci_tabulation(20), 6765)
    
    def test_optimized(self):
        """Test space-optimized approach"""
        self.assertEqual(fibonacci_optimized(10), 55)
        self.assertEqual(fibonacci_optimized(20), 6765)
    
    def test_matrix_exponentiation(self):
        """Test matrix exponentiation approach"""
        self.assertEqual(fibonacci_matrix(10), 55)
        self.assertEqual(fibonacci_matrix(20), 6765)
    
    def test_all_approaches_same_result(self):
        """Test all approaches give same result"""
        n = 15
        naive = fibonacci_naive(n)
        memo = fibonacci_memoization(n)
        tab = fibonacci_tabulation(n)
        opt = fibonacci_optimized(n)
        mat = fibonacci_matrix(n)
        
        self.assertEqual(naive, memo)
        self.assertEqual(memo, tab)
        self.assertEqual(tab, opt)
        self.assertEqual(opt, mat)
    
    def test_fibonacci_sequence(self):
        """Test sequence generation"""
        seq = fibonacci_sequence(10)
        expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
        self.assertEqual(seq, expected)

    def test_sequence_non_positive_length(self):
        """A sequence of zero or fewer numbers is empty"""
        self.assertEqual(fibonacci_sequence(0), [])
        self.assertEqual(fibonacci_sequence(-3), [])

    def test_negative_n_raises(self):
        """Regression: negative n used to be returned unchanged (F(-5) gave -5)"""
        for fn in (fibonacci_naive, fibonacci_memoization, fibonacci_tabulation,
                   fibonacci_optimized, fibonacci_matrix):
            for n in (-1, -5):
                with self.subTest(fn=fn.__name__, n=n):
                    with self.assertRaises(ValueError):
                        fn(n)

    def test_approaches_agree_on_range(self):
        """Every approach matches the sequence for n = 0..25"""
        seq = fibonacci_sequence(26)
        for n in range(26):
            with self.subTest(n=n):
                self.assertEqual(fibonacci_naive(n), seq[n])
                self.assertEqual(fibonacci_memoization(n), seq[n])
                self.assertEqual(fibonacci_tabulation(n), seq[n])
                self.assertEqual(fibonacci_optimized(n), seq[n])
                self.assertEqual(fibonacci_matrix(n), seq[n])

    def test_large_n(self):
        """Python integers do not overflow: F(100) is exact"""
        expected = 354224848179261915075
        self.assertEqual(fibonacci_tabulation(100), expected)
        self.assertEqual(fibonacci_optimized(100), expected)
        self.assertEqual(fibonacci_matrix(100), expected)
        self.assertEqual(fibonacci_memoization(100), expected)


if __name__ == '__main__':
    unittest.main()

