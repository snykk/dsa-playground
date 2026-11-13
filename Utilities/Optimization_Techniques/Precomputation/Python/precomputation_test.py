"""Unit tests for the Python precomputation helpers."""

import unittest
from math import comb, gcd

from precomputation import (
    Factorials, sieve, compute_spf, factorize, PrefixSum, PrefixSum2D,
    SparseTable, LCA, POW2, MOD,
)


class TestFactorials(unittest.TestCase):
    def test_values(self):
        f = Factorials(20)
        self.assertEqual(f.fact[5], 120)
        self.assertEqual(f.nCr(10, 3), 120)
        self.assertEqual(f.nPr(10, 3), 720)
        self.assertEqual(f.nCr(5, 7), 0)
        self.assertEqual(f.nCr(5, -1), 0)

    def test_against_exact_binomials(self):
        f = Factorials(80)
        for n in range(0, 81, 9):
            for r in range(0, n + 1, 4):
                self.assertEqual(f.nCr(n, r), comb(n, r) % MOD)


class TestSieve(unittest.TestCase):
    def test_primes_up_to_30(self):
        primes, is_prime = sieve(30)
        self.assertEqual(primes, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29])
        self.assertTrue(is_prime[29])
        self.assertFalse(is_prime[1])
        self.assertFalse(is_prime[0])
        self.assertEqual(len(is_prime), 31)

    def test_small_limits(self):
        """sieve(0) used to raise IndexError"""
        self.assertEqual(sieve(0), ([], [False]))
        self.assertEqual(sieve(1), ([], [False, False]))
        self.assertEqual(sieve(2), ([2], [False, False, True]))
        self.assertEqual(sieve(-5), ([], []))

    def test_prime_count(self):
        primes, _ = sieve(10000)
        self.assertEqual(len(primes), 1229)


class TestSpf(unittest.TestCase):
    def test_spf_values(self):
        spf = compute_spf(30)
        self.assertEqual(spf[12], 2)
        self.assertEqual(spf[15], 3)
        self.assertEqual(spf[29], 29)
        self.assertEqual(spf[1], 1)

    def test_factorize(self):
        spf = compute_spf(1000)
        self.assertEqual(factorize(12, spf), [(2, 2), (3, 1)])
        self.assertEqual(factorize(97, spf), [(97, 1)])
        self.assertEqual(factorize(1, spf), [])
        self.assertEqual(factorize(720, spf), [(2, 4), (3, 2), (5, 1)])

    def test_compute_spf_zero(self):
        self.assertEqual(compute_spf(0), [0])


class TestPrefixSums(unittest.TestCase):
    def test_1d(self):
        ps = PrefixSum([1, 2, 3, 4, 5])
        self.assertEqual(ps.range_sum(0, 2), 6)
        self.assertEqual(ps.range_sum(0, 4), 15)
        self.assertEqual(ps.range_sum(3, 3), 4)

    def test_2d(self):
        grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        ps = PrefixSum2D(grid)
        self.assertEqual(ps.rect_sum(0, 0, 2, 2), 45)
        self.assertEqual(ps.rect_sum(1, 1, 2, 2), 28)
        self.assertEqual(ps.rect_sum(0, 1, 1, 2), 16)
        self.assertEqual(ps.rect_sum(2, 0, 2, 0), 7)


class TestSparseTable(unittest.TestCase):
    def test_min_and_max(self):
        arr = [5, 2, 8, 1, 9, 3, 7]
        mn, mx = SparseTable(arr, min), SparseTable(arr, max)
        for l in range(len(arr)):
            for r in range(l, len(arr)):
                self.assertEqual(mn.query(l, r), min(arr[l:r + 1]))
                self.assertEqual(mx.query(l, r), max(arr[l:r + 1]))

    def test_gcd_is_idempotent(self):
        arr = [12, 18, 24, 36, 48]
        t = SparseTable(arr, gcd)
        self.assertEqual(t.query(0, 4), 6)
        self.assertEqual(t.query(2, 3), 12)

    def test_single_element(self):
        self.assertEqual(SparseTable([7]).query(0, 0), 7)


class TestLca(unittest.TestCase):
    def test_small_tree(self):
        #        0
        #      /   \
        #     1     2
        #    / \     \
        #   3   4     5
        adj = [[1, 2], [0, 3, 4], [0, 5], [1], [1], [2]]
        lca = LCA(6, adj, root=0)
        self.assertEqual(lca.query(3, 4), 1)
        self.assertEqual(lca.query(3, 5), 0)
        self.assertEqual(lca.query(1, 3), 1)
        self.assertEqual(lca.query(4, 4), 4)
        self.assertEqual(lca.query(5, 0), 0)

    def test_path(self):
        n = 50
        adj = [[] for _ in range(n)]
        for i in range(n - 1):
            adj[i].append(i + 1)
            adj[i + 1].append(i)
        lca = LCA(n, adj)
        self.assertEqual(lca.query(10, 40), 10)
        self.assertEqual(lca.query(49, 0), 0)

    def test_single_node(self):
        self.assertEqual(LCA(1, [[]]).query(0, 0), 0)


class TestPowers(unittest.TestCase):
    def test_pow2(self):
        self.assertEqual(POW2[10], 1024)
        self.assertEqual(POW2[63], 2 ** 63)
        self.assertEqual(len(POW2), 64)


if __name__ == "__main__":
    unittest.main()
