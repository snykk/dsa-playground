"""
Unit tests for Centroid Decomposition.
"""

import unittest
from centroid_decomposition import CentroidDecomposition


class TestCentroidDecomposition(unittest.TestCase):
    def test_build(self):
        n = 5
        adj = [
            [1, 2],
            [0, 3, 4],
            [0],
            [1],
            [1]
        ]
        cd = CentroidDecomposition(n, adj)
        cd.build(0)
        # All nodes should have been processed
        self.assertTrue(all(cd.removed))
        # Root should have parent -1
        self.assertEqual(cd.parent[0], -1)


if __name__ == "__main__":
    unittest.main()
