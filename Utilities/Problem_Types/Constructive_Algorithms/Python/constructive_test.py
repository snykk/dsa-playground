"""Unit tests for the constructive algorithm helpers."""

import itertools
import random
import unittest

from constructive import (
    construct_array_with_sum,
    construct_balanced_string,
    construct_by_decomposition,
    construct_graph,
    construct_matrix,
    construct_permutation,
    construct_string,
    construct_tree,
    greedy_construction,
)


def distinct_diffs(perm):
    return len({abs(perm[i + 1] - perm[i]) for i in range(len(perm) - 1)})


def graphical(degrees):
    """Erdos-Gallai test."""
    d = sorted(degrees, reverse=True)
    if sum(d) % 2:
        return False
    for k in range(1, len(d) + 1):
        if sum(d[:k]) > k * (k - 1) + sum(min(x, k) for x in d[k:]):
            return False
    return True


class TestPermutation(unittest.TestCase):
    def test_all_small_n_and_k(self):
        for n in range(1, 13):
            for k in range(0, n + 2):
                perm = construct_permutation(n, k)
                valid = (n == 1 and k == 0) or (n >= 2 and 1 <= k <= n - 1)
                if not valid:
                    self.assertIsNone(perm, (n, k))
                    continue
                self.assertEqual(sorted(perm), list(range(1, n + 1)), (n, k))
                self.assertEqual(distinct_diffs(perm), k, (n, k, perm))

    def test_known_values(self):
        self.assertEqual(construct_permutation(5, 3), [1, 4, 2, 3, 5])
        self.assertEqual(construct_permutation(3, 1), [1, 2, 3])
        self.assertEqual(construct_permutation(5, 2), [1, 3, 2, 4, 5])


class TestArrayWithSum(unittest.TestCase):
    def test_basic(self):
        arr = construct_array_with_sum(5, 15, 1, 5)
        self.assertEqual(sum(arr), 15)
        self.assertTrue(all(1 <= x <= 5 for x in arr))

    def test_impossible(self):
        self.assertIsNone(construct_array_with_sum(3, 2, 1, 5))
        self.assertIsNone(construct_array_with_sum(3, 16, 1, 5))

    def test_random(self):
        rng = random.Random(1)
        for _ in range(300):
            n = rng.randint(1, 8)
            lo = rng.randint(-3, 3)
            hi = lo + rng.randint(0, 5)
            total = rng.randint(n * lo - 2, n * hi + 2)
            arr = construct_array_with_sum(n, total, lo, hi)
            if n * lo <= total <= n * hi:
                self.assertEqual(sum(arr), total)
                self.assertTrue(all(lo <= x <= hi for x in arr))
            else:
                self.assertIsNone(arr)


class TestGraph(unittest.TestCase):
    def test_matches_erdos_gallai(self):
        rng = random.Random(2)
        for _ in range(500):
            n = rng.randint(1, 7)
            degrees = [rng.randint(0, n) for _ in range(n)]
            edges = construct_graph(degrees)
            if not graphical(degrees):
                self.assertIsNone(edges, degrees)
                continue
            got = [0] * n
            seen = set()
            for u, v in edges:
                self.assertNotEqual(u, v)
                key = (min(u, v), max(u, v))
                self.assertNotIn(key, seen)
                seen.add(key)
                got[u] += 1
                got[v] += 1
            self.assertEqual(got, degrees)


class TestString(unittest.TestCase):
    def test_valid(self):
        for a, b in itertools.product(range(6), repeat=2):
            s = construct_string(a + b, a, b)
            if abs(a - b) > 1:
                self.assertIsNone(s)
                continue
            self.assertEqual((s.count("a"), s.count("b")), (a, b))
            self.assertTrue(all(s[i] != s[i + 1] for i in range(len(s) - 1)), s)

    def test_counts_must_add_up(self):
        self.assertIsNone(construct_string(5, 1, 1))
        self.assertIsNone(construct_string(1, 1, 1))


class TestBalancedString(unittest.TestCase):
    def test_unequal_counts_rejected(self):
        self.assertIsNone(construct_balanced_string("aaab"))
        self.assertIsNone(construct_balanced_string("aab"))

    def test_equal_counts(self):
        self.assertEqual(construct_balanced_string("baba"), "aabb")
        self.assertEqual(construct_balanced_string("abc"), "abc")

    def test_empty(self):
        self.assertEqual(construct_balanced_string(""), "")


class TestDecomposition(unittest.TestCase):
    def test_small(self):
        self.assertEqual(construct_by_decomposition(13), [1, 4, 8])
        self.assertEqual(construct_by_decomposition(0), [])
        self.assertEqual(construct_by_decomposition(-5), [])

    def test_high_bits(self):
        self.assertEqual(construct_by_decomposition(2 ** 31 + 1), [1, 2 ** 31])
        self.assertEqual(construct_by_decomposition(2 ** 40), [2 ** 40])
        for t in range(1, 300):
            self.assertEqual(sum(construct_by_decomposition(t)), t)


class TestOthers(unittest.TestCase):
    def test_greedy(self):
        self.assertEqual(greedy_construction(4, [2, 1, 3]), [2, 1, 3])
        self.assertEqual(greedy_construction(3, [2, 2, 2]), None)

    def test_matrix(self):
        m = construct_matrix([3, 2], [1, 4])
        self.assertEqual([sum(r) for r in m], [3, 2])
        self.assertEqual([sum(c) for c in zip(*m)], [1, 4])
        self.assertIsNone(construct_matrix([1], [2]))

    def test_tree(self):
        self.assertEqual(construct_tree(4, [0, 0, 0, 0]), [(0, 1), (1, 2), (2, 3)])
        self.assertIsNone(construct_tree(3, [0, 0, 2]))


if __name__ == "__main__":
    unittest.main()
