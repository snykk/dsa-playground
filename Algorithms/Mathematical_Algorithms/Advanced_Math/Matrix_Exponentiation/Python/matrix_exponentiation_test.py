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
        # [[1,1],[1,0]]^5 = [[F(6), F(5)], [F(5), F(4)]]
        self.assertEqual(A_5, [[8, 5], [5, 3]])
    
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
        # [[1,1],[1,0]]^10 = [[89, 55], [55, 34]]
        self.assertEqual(result, [[89, 55], [55, 34]])
        # 11th power: [[144, 89], [89, 55]] mod 100
        self.assertEqual(matrix_power(A, 11, mod=100), [[44, 89], [89, 55]])
    
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
        # F(100) = 354224848179261915075 ends in ...521
        self.assertEqual(fib_100, 354224848179261915075 % 1000)
        self.assertEqual(fibonacci_matrix(100, mod=10**9 + 7), 354224848179261915075 % (10**9 + 7))

    def test_negative_entries_reduce_into_range(self):
        """Negative entries give a result in [0, mod)"""
        self.assertEqual(matrix_power([[-1]], 3, mod=5), [[4]])
        self.assertEqual(matrix_power_iterative([[-1]], 3, mod=5), [[4]])

    def test_large_modulus_exact(self):
        """Moduli above 2^32 need exact big-integer products"""
        mod = 5000000011
        result = matrix_power([[4000000000, 1], [1, 0]], 2, mod)
        self.assertEqual(result[0][0], (4000000000 ** 2 + 1) % mod)

    def test_negative_exponent_rejected(self):
        with self.assertRaises(ValueError):
            matrix_power([[1, 1], [1, 0]], -1)
        with self.assertRaises(ValueError):
            matrix_power_iterative([[1, 1], [1, 0]], -1)
        with self.assertRaises(ValueError):
            fibonacci_matrix(-1)

    def test_modulus_one_gives_zero_matrix(self):
        """Everything is 0 modulo 1, including A^0"""
        A = [[1, 1], [1, 0]]
        self.assertEqual(matrix_power(A, 0, mod=1), [[0, 0], [0, 0]])
        self.assertEqual(matrix_power_iterative(A, 0, mod=1), [[0, 0], [0, 0]])
        self.assertEqual(matrix_power(A, 5, mod=1), [[0, 0], [0, 0]])

    def test_zero_modulus_means_no_modulus(self):
        A = [[1, 1], [1, 0]]
        self.assertEqual(matrix_power(A, 5, mod=0), [[8, 5], [5, 3]])
        self.assertEqual(matrix_power_iterative(A, 5, mod=0), [[8, 5], [5, 3]])


if __name__ == '__main__':
    unittest.main()
