"""Unit tests for K-D Tree."""
import random
import unittest
from math import sqrt

from kd_tree import KDTree


def brute_nearest(points, query):
    return min(points, key=lambda p: sum((a - b) ** 2 for a, b in zip(p, query)))


def brute_range(points, lower, upper):
    return [
        p for p in points
        if all(lower[i] <= p[i] <= upper[i] for i in range(len(p)))
    ]


class TestKDTreeBuild(unittest.TestCase):
    def test_empty_tree(self):
        tree = KDTree()
        self.assertIsNone(tree.nearest((0, 0)))

    def test_single_point(self):
        tree = KDTree([(5.0, 5.0)])
        self.assertEqual(tree.nearest((0.0, 0.0)), (5.0, 5.0))

    def test_dimensionality_property(self):
        tree = KDTree([(1, 2, 3), (4, 5, 6)])
        self.assertEqual(tree.dimensionality, 3)

    def test_mixed_dimensions_raises(self):
        with self.assertRaises(ValueError):
            KDTree([(1, 2), (3, 4, 5)])


class TestKDTreeNearest(unittest.TestCase):
    def test_textbook_2d(self):
        pts = [(7, 2), (5, 4), (9, 6), (2, 3), (4, 7), (8, 1)]
        tree = KDTree(pts)
        # (6, 5): nearest is (5, 4) at distance sqrt(1 + 1) = sqrt(2)
        self.assertEqual(tree.nearest((6, 5)), (5, 4))

    def test_nearest_is_self(self):
        pts = [(1, 1), (2, 2), (3, 3)]
        tree = KDTree(pts)
        self.assertEqual(tree.nearest((2, 2)), (2, 2))

    def test_random_2d_cross_check_brute(self):
        rng = random.Random(42)
        pts = [(rng.uniform(-100, 100), rng.uniform(-100, 100))
               for _ in range(100)]
        tree = KDTree(pts)
        for _ in range(50):
            query = (rng.uniform(-100, 100), rng.uniform(-100, 100))
            self.assertEqual(tree.nearest(query), brute_nearest(pts, query))

    def test_random_3d_cross_check_brute(self):
        rng = random.Random(7)
        pts = [(rng.uniform(-10, 10), rng.uniform(-10, 10),
                rng.uniform(-10, 10)) for _ in range(60)]
        tree = KDTree(pts)
        for _ in range(30):
            q = (rng.uniform(-10, 10), rng.uniform(-10, 10),
                 rng.uniform(-10, 10))
            self.assertEqual(tree.nearest(q), brute_nearest(pts, q))


class TestKDTreeInsert(unittest.TestCase):
    def test_insert_into_empty(self):
        tree = KDTree()
        tree.insert((1, 2))
        self.assertEqual(tree.nearest((0, 0)), (1, 2))

    def test_incremental_insert(self):
        tree = KDTree([(5, 5)])
        tree.insert((1, 1))
        tree.insert((9, 9))
        # All three points present
        self.assertEqual(tree.nearest((0, 0)), (1, 1))
        self.assertEqual(tree.nearest((10, 10)), (9, 9))
        self.assertEqual(tree.nearest((5, 5)), (5, 5))

    def test_dim_mismatch_raises(self):
        tree = KDTree([(1, 2)])
        with self.assertRaises(ValueError):
            tree.insert((1, 2, 3))


class TestKDTreeRangeSearch(unittest.TestCase):
    def test_simple_range(self):
        pts = [(7, 2), (5, 4), (9, 6), (2, 3), (4, 7), (8, 1)]
        tree = KDTree(pts)
        result = set(tree.range_search((3, 3), (8, 7)))
        expected = {(5, 4), (4, 7), (7, 2)}
        # (7, 2) has y=2 which is below lower=3, so excluded
        expected = {(5, 4), (4, 7)}
        self.assertEqual(result, expected)

    def test_empty_range(self):
        pts = [(1, 1), (2, 2), (3, 3)]
        tree = KDTree(pts)
        self.assertEqual(tree.range_search((10, 10), (20, 20)), [])

    def test_all_points_in_range(self):
        pts = [(1, 1), (2, 2), (3, 3)]
        tree = KDTree(pts)
        self.assertEqual(sorted(tree.range_search((0, 0), (10, 10))),
                         sorted(pts))

    def test_random_range_cross_check(self):
        rng = random.Random(99)
        pts = [(rng.uniform(0, 100), rng.uniform(0, 100)) for _ in range(50)]
        tree = KDTree(pts)
        for _ in range(20):
            lo = (rng.uniform(0, 100), rng.uniform(0, 100))
            hi = (lo[0] + rng.uniform(0, 30), lo[1] + rng.uniform(0, 30))
            tree_result = sorted(tree.range_search(lo, hi))
            brute_result = sorted(brute_range(pts, lo, hi))
            self.assertEqual(tree_result, brute_result)


class TestKDTreeDeepChain(unittest.TestCase):
    def test_monotone_inserts_do_not_hit_recursion_limit(self):
        # Regression: queries were recursive, so a chain built by sorted
        # inserts raised RecursionError at about 1000 levels.
        tree = KDTree()
        for i in range(5000):
            tree.insert((float(i), float(i)))
        self.assertEqual(tree.nearest((4999.0, 4999.0)), (4999.0, 4999.0))
        self.assertEqual(tree.nearest((-10.0, -10.0)), (0.0, 0.0))
        found = tree.range_search((100.0, 100.0), (200.0, 200.0))
        self.assertEqual(len(found), 101)

    def test_range_search_keeps_preorder(self):
        pts = [(7, 2), (5, 4), (9, 6), (2, 3), (4, 7), (8, 1)]
        tree = KDTree(pts)
        self.assertEqual(tree.range_search((0, 0), (10, 10)),
                         [(7, 2), (5, 4), (2, 3), (4, 7), (9, 6), (8, 1)])


if __name__ == "__main__":
    unittest.main()
