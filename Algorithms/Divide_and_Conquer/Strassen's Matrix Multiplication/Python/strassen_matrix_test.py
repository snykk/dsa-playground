"""
Test cases for Strassen's Matrix Multiplication
"""

import unittest
from strassen_matrix import (
    strassen_multiply,
    strassen_multiply_general,
    matrix_multiply_naive
)


class TestStrassenMatrix(unittest.TestCase):
    
    def test_1x1_matrix(self):
        """Test with 1x1 matrices"""
        A = [[2]]
        B = [[3]]
        result = strassen_multiply(A, B)
        expected = [[6]]
        self.assertEqual(result, expected)
    
    def test_2x2_matrix(self):
        """Test with 2x2 matrices"""
        A = [[1, 2], [3, 4]]
        B = [[5, 6], [7, 8]]
        result = strassen_multiply(A, B)
        expected = [[19, 22], [43, 50]]
        self.assertEqual(result, expected)
    
    def test_4x4_matrix(self):
        """Test with 4x4 matrices"""
        A = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]
        B = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
        result = strassen_multiply(A, B)
        self.assertEqual(result, A)  # Identity matrix
    
    def test_compare_with_naive(self):
        """Compare Strassen's with naive multiplication"""
        A = [[1, 2], [3, 4]]
        B = [[5, 6], [7, 8]]
        strassen_result = strassen_multiply(A, B)
        naive_result = matrix_multiply_naive(A, B)
        self.assertEqual(strassen_result, naive_result)
    
    def test_compare_with_naive_4x4(self):
        """Compare Strassen's with naive for 4x4"""
        A = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]
        B = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1]]
        strassen_result = strassen_multiply(A, B)
        naive_result = matrix_multiply_naive(A, B)
        self.assertEqual(strassen_result, naive_result)
    
    def test_general_size_3x3(self):
        """Test general size 3x3 (not power of 2)"""
        A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        B = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
        result = strassen_multiply_general(A, B)
        self.assertEqual(result, A)  # Identity matrix
    
    def test_general_size_5x5(self):
        """Test general size 5x5"""
        A = [[1] * 5 for _ in range(5)]
        B = [[1] * 5 for _ in range(5)]
        result = strassen_multiply_general(A, B)
        expected = [[5] * 5 for _ in range(5)]
        self.assertEqual(result, expected)
    
    def test_zero_matrix(self):
        """Test with zero matrix"""
        A = [[0, 0], [0, 0]]
        B = [[1, 2], [3, 4]]
        result = strassen_multiply(A, B)
        expected = [[0, 0], [0, 0]]
        self.assertEqual(result, expected)
    
    def test_identity_matrix(self):
        """Test with identity matrix"""
        A = [[1, 2], [3, 4]]
        I = [[1, 0], [0, 1]]
        result = strassen_multiply(A, I)
        self.assertEqual(result, A)
    
    def test_rectangular_matrices(self):
        """Test with rectangular matrices"""
        A = [[1, 2, 3], [4, 5, 6]]
        B = [[1, 2], [3, 4], [5, 6]]
        result = strassen_multiply_general(A, B)
        expected = [[22, 28], [49, 64]]
        self.assertEqual(result, expected)


if __name__ == '__main__':
    unittest.main()

