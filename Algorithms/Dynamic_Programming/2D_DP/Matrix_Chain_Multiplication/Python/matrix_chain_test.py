"""
Test cases for Matrix Chain Multiplication
"""

import unittest
from matrix_chain import matrix_chain_multiplication


class TestMatrixChain(unittest.TestCase):
    
    def test_basic(self):
        """Test basic matrix chain"""
        dims = [1, 2, 3, 4, 3]
        result = matrix_chain_multiplication(dims)
        self.assertGreater(result, 0)
        # ((A1 A2) A3) A4: 1*2*3 + 1*3*4 + 1*4*3 = 6 + 12 + 12
        self.assertEqual(result, 30)
    
    def test_small(self):
        """Test small chain"""
        dims = [10, 20, 30]
        result = matrix_chain_multiplication(dims)
        self.assertEqual(result, 6000)

    def test_classic_chains(self):
        """Exact costs for textbook chains"""
        self.assertEqual(matrix_chain_multiplication([30, 35, 15, 5, 10, 20, 25]), 15125)
        self.assertEqual(matrix_chain_multiplication([40, 20, 30, 10, 30]), 26000)
        self.assertEqual(matrix_chain_multiplication([10, 20, 30, 40, 30]), 30000)
        self.assertEqual(matrix_chain_multiplication([1, 2, 3, 4]), 18)

    def test_fewer_than_two_matrices(self):
        """Regression: [] and [5] used to raise IndexError; nothing to multiply costs 0"""
        self.assertEqual(matrix_chain_multiplication([]), 0)
        self.assertEqual(matrix_chain_multiplication([5]), 0)
        self.assertEqual(matrix_chain_multiplication([5, 10]), 0)

    def test_large_dimensions(self):
        """Costs above 2^31 are exact (the C++ and Go versions used to overflow or cap here)"""
        self.assertEqual(matrix_chain_multiplication([2000, 2000, 2000]), 8000000000)
        self.assertEqual(matrix_chain_multiplication([1000] * 5), 3000000000)


if __name__ == '__main__':
    unittest.main()

