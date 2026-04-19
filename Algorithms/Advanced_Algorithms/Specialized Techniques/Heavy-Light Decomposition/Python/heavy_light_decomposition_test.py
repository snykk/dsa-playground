"""Unit tests for Heavy-Light Decomposition."""
import unittest

from heavy_light_decomposition import HLD


def make_chain(n):
    """Adjacency list for a linear chain 0-1-2-...-(n-1)."""
    adj = [[] for _ in range(n)]
    for i in range(n - 1):
        adj[i].append(i + 1)
        adj[i + 1].append(i)
    return adj


def make_star(n):
    """Adjacency list for a star: center 0, leaves 1..n-1."""
    adj = [[] for _ in range(n)]
    for i in range(1, n):
        adj[0].append(i)
        adj[i].append(0)
    return adj


class TestHLDBuild(unittest.TestCase):
    def test_single_node(self):
        hld = HLD(1, [[]])
        hld.build(0)
        self.assertEqual(hld.depth[0], 0)
        self.assertEqual(hld.head[0], 0)

    def test_chain(self):
        n = 5
        hld = HLD(n, make_chain(n))
        hld.build(0)
        for i in range(n):
            self.assertEqual(hld.depth[i], i)

    def test_sample_tree_properties(self):
        adj = [[1, 2], [0, 3, 4], [0], [1], [1]]
        hld = HLD(5, adj)
        hld.build(0)
        self.assertEqual(hld.head[0], 0)
        self.assertGreaterEqual(hld.depth[1], hld.depth[0])


class TestHLDLCA(unittest.TestCase):
    def _tree(self):
        adj = [[1, 2], [0, 3, 4], [0], [1], [1]]
        hld = HLD(5, adj)
        hld.build(0)
        return hld

    def test_lca_siblings(self):
        self.assertEqual(self._tree().lca(3, 4), 1)

    def test_lca_ancestor(self):
        hld = self._tree()
        self.assertEqual(hld.lca(3, 1), 1)
        self.assertEqual(hld.lca(1, 3), 1)

    def test_lca_root(self):
        self.assertEqual(self._tree().lca(0, 3), 0)

    def test_lca_same_node(self):
        self.assertEqual(self._tree().lca(3, 3), 3)

    def test_lca_far_apart(self):
        adj = [
            [1, 2],      # 0
            [0, 3, 4],   # 1
            [0, 5],      # 2
            [1, 6],      # 3
            [1],         # 4
            [2],         # 5
            [3],         # 6
        ]
        hld = HLD(7, adj)
        hld.build(0)
        self.assertEqual(hld.lca(6, 5), 0)
        self.assertEqual(hld.lca(6, 4), 1)
        self.assertEqual(hld.lca(4, 5), 0)

    def test_lca_chain(self):
        n = 6
        hld = HLD(n, make_chain(n))
        hld.build(0)
        self.assertEqual(hld.lca(1, 3), 1)
        self.assertEqual(hld.lca(2, 5), 2)
        self.assertEqual(hld.lca(0, 5), 0)

    def test_lca_star(self):
        n = 6
        hld = HLD(n, make_star(n))
        hld.build(0)
        self.assertEqual(hld.lca(1, 2), 0)
        self.assertEqual(hld.lca(3, 5), 0)


class TestHLDPositions(unittest.TestCase):
    def test_positions_unique(self):
        adj = [[1, 2], [0, 3, 4], [0], [1], [1]]
        hld = HLD(5, adj)
        hld.build(0)
        self.assertEqual(sorted(hld.pos), list(range(5)))

    def test_chain_single_heavy_chain(self):
        n = 5
        hld = HLD(n, make_chain(n))
        hld.build(0)
        for i in range(n):
            self.assertEqual(hld.head[i], 0)


if __name__ == "__main__":
    unittest.main()
