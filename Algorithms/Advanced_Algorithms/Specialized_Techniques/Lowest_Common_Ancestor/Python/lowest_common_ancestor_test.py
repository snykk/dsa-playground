"""
Unit tests for the lowest common ancestor: binary lifting and the Euler tour with a sparse table.

Both classes are checked against a naive LCA that walks up one parent at a time, on every
labelled tree with up to 6 nodes (every root, every pair) and on random trees with fixed seeds.
"""

import itertools
import random
import unittest

from lowest_common_ancestor import BinaryLiftingLCA, EulerTourLCA, rooted_tree

# The tree of the README and the demo, rooted at 0:
#         0
#       /   \
#      1     2
#     / \     \
#    3   4     5
#   / \         \
#  6   7         8
#  |
#  9
EDGES10 = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (3, 6), (3, 7), (5, 8), (6, 9)]


class Naive:
    """Parents and depths from a breadth-first walk, and the LCA by walking up one parent at a time."""

    def __init__(self, n, edges, root):
        adj = [[] for _ in range(n)]
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)
        self.parent = [-1] * n
        self.depth = [0] * n
        seen = {root}
        order = [root]
        for u in order:
            for v in adj[u]:
                if v not in seen:
                    seen.add(v)
                    self.parent[v] = u
                    self.depth[v] = self.depth[u] + 1
                    order.append(v)

    def lca(self, u, v):
        while self.depth[u] > self.depth[v]:
            u = self.parent[u]
        while self.depth[v] > self.depth[u]:
            v = self.parent[v]
        while u != v:
            u, v = self.parent[u], self.parent[v]
        return u

    def kth_ancestor(self, v, k):
        for _ in range(k):
            v = self.parent[v]
            if v == -1:
                return -1
        return v

    def distance(self, u, v):
        return self.depth[u] + self.depth[v] - 2 * self.depth[self.lca(u, v)]


def prufer_trees(n):
    """Every labelled tree on n nodes (n^(n-2) of them for n >= 2), each as a list of edges."""
    if n == 1:
        yield []
        return
    if n == 2:
        yield [(0, 1)]
        return
    for seq in itertools.product(range(n), repeat=n - 2):
        degree = [1] * n
        for x in seq:
            degree[x] += 1
        edges = []
        for x in seq:
            leaf = min(i for i in range(n) if degree[i] == 1)
            edges.append((leaf, x))
            degree[leaf] -= 1
            degree[x] -= 1
        u, v = [i for i in range(n) if degree[i] == 1]
        edges.append((u, v))
        yield edges


def random_tree(rng, n):
    """A random tree on 0..n-1 with shuffled labels and edges listed in random order and direction."""
    label = list(range(n))
    rng.shuffle(label)
    edges = []
    for v in range(1, n):
        u = rng.randrange(v) if rng.random() < 0.6 else max(0, v - 1 - rng.randrange(2))
        edges.append((label[u], label[v]) if rng.random() < 0.5 else (label[v], label[u]))
    rng.shuffle(edges)
    return edges


class TestDemoTree(unittest.TestCase):
    """Every table of the 10-node tree, as the README shows them."""

    def setUp(self):
        self.lifting = BinaryLiftingLCA(10, EDGES10)
        self.tour = EulerTourLCA(10, EDGES10)

    def test_depth_and_up_table(self):
        self.assertEqual(self.lifting.depth, [0, 1, 1, 2, 2, 2, 3, 3, 3, 4])
        self.assertEqual(self.lifting.levels, 4)
        self.assertEqual(self.lifting.up, [
            [0, 0, 0, 1, 1, 2, 3, 3, 5, 6],
            [0, 0, 0, 0, 0, 0, 1, 1, 2, 3],
            [0] * 10,
            [0] * 10,
        ])

    def test_euler_tour_first_and_sparse_table(self):
        self.assertEqual(self.tour.euler, [0, 1, 3, 6, 9, 6, 3, 7, 3, 1, 4, 1, 0, 2, 5, 8, 5, 2, 0])
        self.assertEqual(self.tour.first, [0, 1, 13, 2, 10, 14, 3, 7, 15, 4])
        self.assertEqual(self.tour.sparse, [
            [0, 1, 3, 6, 9, 6, 3, 7, 3, 1, 4, 1, 0, 2, 5, 8, 5, 2, 0],
            [0, 1, 3, 6, 6, 3, 3, 3, 1, 1, 1, 0, 0, 2, 5, 5, 2, 0],
            [0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 2, 2, 0],
            [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0],
        ])

    def test_queries(self):
        for (u, v), want, dist in [((9, 4), 1, 4), ((9, 8), 0, 7), ((7, 9), 3, 3), ((6, 7), 3, 2), ((8, 5), 5, 1)]:
            for lca in (self.lifting, self.tour):
                self.assertEqual(lca.lca(u, v), want)
                self.assertEqual(lca.lca(v, u), want)
                self.assertEqual(lca.distance(u, v), dist)

    def test_kth_ancestor(self):
        self.assertEqual([self.lifting.kth_ancestor(9, k) for k in range(7)], [9, 6, 3, 1, 0, -1, -1])
        self.assertEqual(self.lifting.kth_ancestor(8, 2), 2)
        self.assertEqual(self.lifting.kth_ancestor(0, 0), 0)
        self.assertEqual(self.lifting.kth_ancestor(0, 1), -1)
        self.assertEqual(self.lifting.kth_ancestor(4, 10 ** 9), -1)

    def test_same_node_and_ancestor(self):
        for lca in (self.lifting, self.tour):
            for v in range(10):
                self.assertEqual(lca.lca(v, v), v)
                self.assertEqual(lca.distance(v, v), 0)
                self.assertEqual(lca.lca(0, v), 0)
            # u is an ancestor of v, in both argument orders
            self.assertEqual(lca.lca(1, 9), 1)
            self.assertEqual(lca.lca(9, 1), 1)
            self.assertEqual(lca.lca(3, 9), 3)
            self.assertEqual(lca.lca(2, 8), 2)
            self.assertEqual(lca.distance(1, 9), 3)

    def test_another_root(self):
        naive = Naive(10, EDGES10, 4)
        lifting = BinaryLiftingLCA(10, EDGES10, root=4)
        tour = EulerTourLCA(10, EDGES10, root=4)
        self.assertEqual(lifting.depth, naive.depth)
        self.assertEqual(tour.euler, [4, 1, 0, 2, 5, 8, 5, 2, 0, 1, 3, 6, 9, 6, 3, 7, 3, 1, 4])
        self.assertEqual(lifting.lca(9, 8), 1)
        self.assertEqual(tour.lca(9, 8), 1)
        self.assertEqual(lifting.lca(0, 3), 1)
        self.assertEqual(tour.lca(0, 3), 1)
        # The distance does not depend on the root.
        self.assertEqual(lifting.distance(9, 8), 7)
        self.assertEqual(tour.distance(9, 8), 7)


class TestAgainstNaive(unittest.TestCase):
    def check(self, n, edges, root, pairs):
        naive = Naive(n, edges, root)
        lifting = BinaryLiftingLCA(n, edges, root)
        tour = EulerTourLCA(n, edges, root)
        self.assertEqual(lifting.depth, naive.depth)
        self.assertEqual(lifting.parent, naive.parent)
        for u, v in pairs:
            want = naive.lca(u, v)
            self.assertEqual(lifting.lca(u, v), want, (n, edges, root, u, v))
            self.assertEqual(tour.lca(u, v), want, (n, edges, root, u, v))
            dist = naive.distance(u, v)
            self.assertEqual(lifting.distance(u, v), dist)
            self.assertEqual(tour.distance(u, v), dist)
        return naive, lifting, tour

    def test_every_tree_up_to_six_nodes_every_root_every_pair(self):
        trees = 0
        for n in range(1, 7):
            pairs = [(u, v) for u in range(n) for v in range(n)]
            for edges in prufer_trees(n):
                trees += 1
                for root in range(n):
                    naive, lifting, _ = self.check(n, edges, root, pairs)
                    for v in range(n):
                        for k in range(n + 1):
                            self.assertEqual(lifting.kth_ancestor(v, k), naive.kth_ancestor(v, k))
        self.assertEqual(trees, 1 + 1 + 3 + 16 + 125 + 1296)

    def test_random_trees_fixed_seeds(self):
        for seed in range(3):
            rng = random.Random(seed)
            for _ in range(100):
                n = rng.randint(1, 120)
                edges = random_tree(rng, n)
                root = rng.randrange(n)
                pairs = [(rng.randrange(n), rng.randrange(n)) for _ in range(40)]
                naive, lifting, _ = self.check(n, edges, root, pairs)
                for _ in range(20):
                    v, k = rng.randrange(n), rng.randrange(n + 2)
                    self.assertEqual(lifting.kth_ancestor(v, k), naive.kth_ancestor(v, k))

    def test_euler_tour_shape_and_unique_window_minimum(self):
        rng = random.Random(11)
        for _ in range(150):
            n = rng.randint(1, 60)
            edges = random_tree(rng, n)
            tour = EulerTourLCA(n, edges, rng.randrange(n))
            euler = tour.euler
            self.assertEqual(len(euler), 2 * n - 1)
            for v in range(n):
                self.assertEqual(euler.index(v), tour.first[v])
            for a, b in zip(euler, euler[1:]):
                # consecutive entries are a parent and its child
                self.assertTrue(tour.parent[a] == b or tour.parent[b] == a)
            # Every window has one shallowest node: the tie rule never chooses between two nodes.
            for k, row in enumerate(tour.sparse):
                for i, node in enumerate(row):
                    window = euler[i:i + (1 << k)]
                    best = min(tour.depth[x] for x in window)
                    self.assertEqual({x for x in window if tour.depth[x] == best}, {node})


class TestShapes(unittest.TestCase):
    def test_single_node(self):
        lifting = BinaryLiftingLCA(1, [])
        tour = EulerTourLCA(1, [])
        self.assertEqual(lifting.up, [[0]])
        self.assertEqual(tour.euler, [0])
        self.assertEqual(tour.sparse, [[0]])
        for lca in (lifting, tour):
            self.assertEqual(lca.lca(0, 0), 0)
            self.assertEqual(lca.distance(0, 0), 0)
        self.assertEqual(lifting.kth_ancestor(0, 0), 0)
        self.assertEqual(lifting.kth_ancestor(0, 1), -1)

    def test_two_nodes_rooted_at_either_end(self):
        for root, child in ((0, 1), (1, 0)):
            lifting = BinaryLiftingLCA(2, [(0, 1)], root)
            tour = EulerTourLCA(2, [(0, 1)], root)
            self.assertEqual(tour.euler, [root, child, root])
            for lca in (lifting, tour):
                self.assertEqual(lca.lca(0, 1), root)
                self.assertEqual(lca.distance(1, 0), 1)
            self.assertEqual(lifting.kth_ancestor(child, 1), root)

    def test_star(self):
        n = 50
        edges = [(0, i) for i in range(1, n)]
        for root in (0, 17):
            naive = Naive(n, edges, root)
            lifting = BinaryLiftingLCA(n, edges, root)
            tour = EulerTourLCA(n, edges, root)
            for u in range(n):
                for v in range(n):
                    self.assertEqual(lifting.lca(u, v), naive.lca(u, v))
                    self.assertEqual(tour.lca(u, v), naive.lca(u, v))
        tour = EulerTourLCA(n, edges)
        self.assertEqual(tour.euler[:5], [0, 1, 0, 2, 0])
        self.assertEqual(max(BinaryLiftingLCA(n, edges).depth), 1)

    def test_path_of_100000_nodes_does_not_recurse(self):
        n = 100_000
        edges = [(i, i + 1) for i in range(n - 1)]
        lifting = BinaryLiftingLCA(n, edges)
        tour = EulerTourLCA(n, edges)
        self.assertEqual(lifting.depth[n - 1], n - 1)
        self.assertEqual(len(tour.euler), 2 * n - 1)
        for lca in (lifting, tour):
            self.assertEqual(lca.lca(n - 1, 0), 0)
            self.assertEqual(lca.lca(n - 1, 54_321), 54_321)
            self.assertEqual(lca.lca(77_777, 12_345), 12_345)
            self.assertEqual(lca.distance(n - 1, 0), n - 1)
        self.assertEqual(lifting.kth_ancestor(n - 1, n - 1), 0)
        self.assertEqual(lifting.kth_ancestor(n - 1, 65_537), n - 1 - 65_537)
        self.assertEqual(lifting.kth_ancestor(n - 1, n), -1)
        # Rooted in the middle: the two halves meet at the root.
        middle = BinaryLiftingLCA(n, edges, root=n // 2)
        middle_tour = EulerTourLCA(n, edges, root=n // 2)
        self.assertEqual(middle.lca(0, n - 1), n // 2)
        self.assertEqual(middle_tour.lca(0, n - 1), n // 2)
        self.assertEqual(middle_tour.lca(10, 20), 20)


class TestInvalidInput(unittest.TestCase):
    def assert_not_a_tree(self, n, edges, root=0):
        with self.assertRaises(ValueError):
            BinaryLiftingLCA(n, edges, root)
        with self.assertRaises(ValueError):
            EulerTourLCA(n, edges, root)
        with self.assertRaises(ValueError):
            rooted_tree(n, edges, root)

    def test_no_nodes(self):
        self.assert_not_a_tree(0, [])

    def test_root_outside_the_tree(self):
        self.assert_not_a_tree(3, [(0, 1), (1, 2)], root=3)
        self.assert_not_a_tree(3, [(0, 1), (1, 2)], root=-1)

    def test_endpoint_outside_the_tree(self):
        self.assert_not_a_tree(3, [(0, 1), (1, 3)])
        self.assert_not_a_tree(3, [(0, 1), (-1, 2)])

    def test_wrong_number_of_edges(self):
        self.assert_not_a_tree(4, [(0, 1), (2, 3)])  # a forest of two trees
        self.assert_not_a_tree(3, [(0, 1), (1, 2), (2, 0)])  # a cycle with n edges

    def test_cycle_or_forest_with_n_minus_1_edges(self):
        self.assert_not_a_tree(4, [(0, 1), (1, 2), (2, 0)])  # a triangle and a lone node 3
        self.assert_not_a_tree(3, [(0, 1), (0, 1)])  # the same edge twice
        self.assert_not_a_tree(3, [(0, 1), (2, 2)])  # a loop
        # The root sees only its own part: 1-2-3 is a cycle away from root 0.
        self.assert_not_a_tree(4, [(1, 2), (2, 3), (3, 1)], root=0)

    def test_query_node_outside_the_tree(self):
        lifting = BinaryLiftingLCA(3, [(0, 1), (1, 2)])
        tour = EulerTourLCA(3, [(0, 1), (1, 2)])
        for lca in (lifting, tour):
            for u, v in ((3, 0), (0, 3), (-1, 0), (0, -1)):
                with self.assertRaises(IndexError):
                    lca.lca(u, v)
                with self.assertRaises(IndexError):
                    lca.distance(u, v)
        with self.assertRaises(IndexError):
            lifting.kth_ancestor(3, 0)
        with self.assertRaises(IndexError):
            lifting.kth_ancestor(-1, 0)

    def test_negative_k(self):
        with self.assertRaises(ValueError):
            BinaryLiftingLCA(3, [(0, 1), (1, 2)]).kth_ancestor(2, -1)


if __name__ == "__main__":
    unittest.main()
