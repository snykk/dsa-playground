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
    
    def test_small(self):
        """Test small chain"""
        dims = [10, 20, 30]
        result = matrix_chain_multiplication(dims)
        self.assertEqual(result, 6000)


if __name__ == '__main__':
    unittest.main()

