"""
Unit tests for Heavy-Light Decomposition.
"""

import unittest
from heavy_light_decomposition import HLD


class TestHLD(unittest.TestCase):
    def test_build(self):
        n = 5
        adj = [
            [1, 2],
            [0, 3, 4],
            [0],
            [1],
            [1]
        ]
        hld = HLD(n, adj)
        hld.build(0)
        self.assertEqual(hld.head[0], 0)
        self.assertGreaterEqual(hld.depth[1], hld.depth[0])

    def test_lca(self):
        n = 5
        adj = [
            [1, 2],
            [0, 3, 4],
            [0],
            [1],
            [1]
        ]
        hld = HLD(n, adj)
        hld.build(0)
        lca = hld.lca(3, 4)
        self.assertEqual(lca, 1)  # Common parent of 3 and 4 is 1


if __name__ == "__main__":
    unittest.main()
