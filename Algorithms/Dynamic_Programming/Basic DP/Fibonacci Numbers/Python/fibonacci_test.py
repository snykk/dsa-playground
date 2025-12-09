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


if __name__ == '__main__':
    unittest.main()

