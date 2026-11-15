"""
Test cases for Strassen's Matrix Multiplication
"""

import unittest
from unittest import mock

import strassen_matrix
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

    def _random_matrix(self, n, seed):
        import random
        rng = random.Random(seed)
        return [[rng.randint(-9, 9) for _ in range(n)] for _ in range(n)]

    def test_seven_product_recursion_128(self):
        """n = 128 is above the naive cutoff, so the 7-product recursion runs"""
        A = self._random_matrix(128, 1)
        B = self._random_matrix(128, 2)
        self.assertEqual(strassen_multiply(A, B), matrix_multiply_naive(A, B))

    def test_odd_size_above_cutoff_65(self):
        """Regression: an odd n > 64 used to raise IndexError"""
        A = self._random_matrix(65, 3)
        B = self._random_matrix(65, 4)
        result = strassen_multiply(A, B)
        self.assertEqual(len(result), 65)
        self.assertEqual(result, matrix_multiply_naive(A, B))

    def test_odd_size_at_deeper_level_130(self):
        """Regression: 130 halves to the odd size 65"""
        A = self._random_matrix(130, 5)
        B = self._random_matrix(130, 6)
        self.assertEqual(strassen_multiply(A, B), matrix_multiply_naive(A, B))

    def test_small_cutoff_recurses_and_matches_naive(self):
        """cutoff=1 or 2 runs the seven-product recursion (and the odd-size padding) on small matrices"""
        for cutoff in (1, 2):
            for n, seed in ((4, 7), (3, 8)):
                A = self._random_matrix(n, seed)
                B = self._random_matrix(n, seed + 100)
                with mock.patch.object(strassen_matrix, "split_matrix", wraps=strassen_matrix.split_matrix) as split:
                    result = strassen_multiply(A, B, cutoff=cutoff)
                self.assertEqual(result, matrix_multiply_naive(A, B))
                self.assertGreater(split.call_count, 0, (n, cutoff))
        A = [[1, 2, 3], [4, 5, 6]]
        B = [[1, 2], [3, 4], [5, 6]]
        self.assertEqual(strassen_multiply_general(A, B, cutoff=1), [[22, 28], [49, 64]])

    def test_default_cutoff_is_64(self):
        """Without a cutoff, sizes up to 64 use the naive loop and the results are unchanged"""
        A = self._random_matrix(4, 9)
        B = self._random_matrix(4, 10)
        with mock.patch.object(strassen_matrix, "split_matrix", wraps=strassen_matrix.split_matrix) as split:
            result = strassen_multiply(A, B)
        self.assertEqual(split.call_count, 0)
        self.assertEqual(result, matrix_multiply_naive(A, B))
        A = self._random_matrix(65, 11)
        B = self._random_matrix(65, 12)
        self.assertEqual(strassen_multiply(A, B), strassen_multiply(A, B, cutoff=64))
        self.assertEqual(strassen_multiply(A, B), matrix_multiply_naive(A, B))

    def test_bad_cutoff_raises(self):
        """A cutoff below 1 is rejected by both functions"""
        for cutoff in (0, -1):
            with self.assertRaises(ValueError):
                strassen_multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]], cutoff=cutoff)
            with self.assertRaises(ValueError):
                strassen_multiply_general([[1, 2, 3]], [[1], [2], [3]], cutoff=cutoff)


if __name__ == '__main__':
    unittest.main()

