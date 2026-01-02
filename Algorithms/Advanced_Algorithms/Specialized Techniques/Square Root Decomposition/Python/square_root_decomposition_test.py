"""
Unit tests for Square Root Decomposition.
"""

import unittest
from square_root_decomposition import SqrtDecomposition


class TestSqrtDecomposition(unittest.TestCase):
    def test_query(self):
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        sd = SqrtDecomposition(arr)
        self.assertEqual(sd.query(0, 9), sum(arr))
        self.assertEqual(sd.query(2, 7), sum(arr[2:8]))

    def test_update(self):
        arr = [1, 2, 3, 4, 5]
        sd = SqrtDecomposition(arr)
        sd.update(2, 10)
        self.assertEqual(sd.arr[2], 10)
        self.assertEqual(sd.query(0, 4), 1 + 2 + 10 + 4 + 5)


if __name__ == "__main__":
    unittest.main()
