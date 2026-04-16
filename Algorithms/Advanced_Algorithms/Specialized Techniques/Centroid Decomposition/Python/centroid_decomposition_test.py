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
        # The centroid of the whole tree should have parent -1
        root_count = sum(1 for p in cd.parent if p == -1)
        self.assertEqual(root_count, 1)


if __name__ == "__main__":
    unittest.main()
