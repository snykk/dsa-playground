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

    def test_build_twice_gives_same_result(self):
        adj = [[1, 2], [0, 3, 4], [0], [1], [1]]
        cd = CentroidDecomposition(5, adj)
        cd.build(0)
        first = list(cd.parent)
        cd.build(0)
        self.assertEqual(cd.parent, first)
        self.assertEqual(sum(1 for p in cd.parent if p == -1), 1)

    def test_long_path_does_not_overflow_recursion(self):
        n = 5000
        adj = [[] for _ in range(n)]
        for i in range(n - 1):
            adj[i].append(i + 1)
            adj[i + 1].append(i)
        cd = CentroidDecomposition(n, adj)
        cd.build(0)
        self.assertEqual(sum(1 for p in cd.parent if p == -1), 1)
        depth = 0
        for v in range(n):
            d, x = 1, v
            while cd.parent[x] != -1:
                x = cd.parent[x]
                d += 1
            depth = max(depth, d)
        self.assertLessEqual(depth, n.bit_length())

    def test_centroid_tree_depth_is_logarithmic_on_random_trees(self):
        import random
        rng = random.Random(7)
        for _ in range(200):
            n = rng.randint(1, 40)
            adj = [[] for _ in range(n)]
            for v in range(1, n):
                u = rng.randrange(v)
                adj[u].append(v)
                adj[v].append(u)
            cd = CentroidDecomposition(n, adj)
            cd.build(0)
            self.assertEqual(sum(1 for p in cd.parent if p == -1), 1)
            for v in range(n):
                d, x = 1, v
                while cd.parent[x] != -1:
                    x = cd.parent[x]
                    d += 1
                self.assertLessEqual(d, n.bit_length())


if __name__ == "__main__":
    unittest.main()
