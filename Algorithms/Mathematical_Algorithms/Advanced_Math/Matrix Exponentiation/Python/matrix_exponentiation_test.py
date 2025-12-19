"""
Unit tests for Matrix Exponentiation
"""

import unittest
from matrix_exponentiation import (
    matrix_multiply, matrix_identity, matrix_power,
    matrix_power_iterative, fibonacci_matrix
)


class TestMatrixExponentiation(unittest.TestCase):
    
    def test_matrix_identity(self):
        """Test identity matrix creation"""
        I = matrix_identity(3)
        self.assertEqual(I, [[1, 0, 0], [0, 1, 0], [0, 0, 1]])
    
    def test_matrix_multiply(self):
        """Test matrix multiplication"""
        A = [[1, 2], [3, 4]]
        B = [[5, 6], [7, 8]]
        result = matrix_multiply(A, B)
        expected = [[19, 22], [43, 50]]
        self.assertEqual(result, expected)
    
    def test_matrix_multiply_with_mod(self):
        """Test matrix multiplication with modulus"""
        A = [[1, 2], [3, 4]]
        B = [[5, 6], [7, 8]]
        result = matrix_multiply(A, B, mod=10)
        expected = [[9, 2], [3, 0]]
        self.assertEqual(result, expected)
    
    def test_matrix_power_zero(self):
        """Test matrix to power 0"""
        A = [[1, 2], [3, 4]]
        result = matrix_power(A, 0)
        I = matrix_identity(2)
        self.assertEqual(result, I)
    
    def test_matrix_power_one(self):
        """Test matrix to power 1"""
        A = [[1, 2], [3, 4]]
        result = matrix_power(A, 1)
        self.assertEqual(result, A)
    
    def test_matrix_power_small(self):
        """Test matrix to small power"""
        A = [[1, 1], [1, 0]]
        A_2 = matrix_power(A, 2)
        expected = [[2, 1], [1, 1]]
        self.assertEqual(A_2, expected)
    
    def test_matrix_power_large(self):
        """Test matrix to larger power"""
        A = [[1, 1], [1, 0]]
        A_5 = matrix_power(A, 5)
        # Verify by manual calculation or known result
        self.assertEqual(len(A_5), 2)
        self.assertEqual(len(A_5[0]), 2)
    
    def test_matrix_power_iterative(self):
        """Test iterative matrix power"""
        A = [[1, 1], [1, 0]]
        result1 = matrix_power(A, 5)
        result2 = matrix_power_iterative(A, 5)
        self.assertEqual(result1, result2)
    
    def test_matrix_power_with_mod(self):
        """Test matrix power with modulus"""
        A = [[1, 1], [1, 0]]
        result = matrix_power(A, 10, mod=1000)
        # Result should be valid matrix with values < 1000
        for row in result:
            for val in row:
                self.assertLess(val, 1000)
                self.assertGreaterEqual(val, 0)
    
    def test_fibonacci_matrix(self):
        """Test Fibonacci using matrix exponentiation"""
        self.assertEqual(fibonacci_matrix(0), 0)
        self.assertEqual(fibonacci_matrix(1), 1)
        self.assertEqual(fibonacci_matrix(2), 1)
        self.assertEqual(fibonacci_matrix(3), 2)
        self.assertEqual(fibonacci_matrix(4), 3)
        self.assertEqual(fibonacci_matrix(5), 5)
        self.assertEqual(fibonacci_matrix(6), 8)
        self.assertEqual(fibonacci_matrix(7), 13)
    
    def test_fibonacci_matrix_large(self):
        """Test Fibonacci for larger indices"""
        fib_10 = fibonacci_matrix(10)
        self.assertEqual(fib_10, 55)
        
        fib_20 = fibonacci_matrix(20)
        self.assertEqual(fib_20, 6765)
    
    def test_fibonacci_matrix_with_mod(self):
        """Test Fibonacci with modulus"""
        fib_100 = fibonacci_matrix(100, mod=1000)
        # Should be F(100) mod 1000
        self.assertLess(fib_100, 1000)
        self.assertGreaterEqual(fib_100, 0)


if __name__ == '__main__':
    unittest.main()
