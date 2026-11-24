"""
Tests for divide_and_conquer_optimization: the worked example and its recursion, the optimized
DP against the plain DP and brute force, the groups, the quadrangle inequality and a cost that
breaks it, the tie rule, edge cases, and the number of cost evaluations.
"""

import math
import random
import unittest
from itertools import accumulate, combinations

import divide_and_conquer_optimization as module
from divide_and_conquer_optimization import min_cost_partition, min_cost_partition_plain, partition_dp

# The first eight digits of pi, split into three groups.
VALUES = [3, 1, 4, 1, 5, 9, 2, 6]


def square_cost(values):
    """C(j, i) = (sum of values[j:i])^2 from prefix sums, for partition_dp; any sign allowed."""
    prefix = list(accumulate(values, initial=0))
    return lambda j, i: (prefix[i] - prefix[j]) ** 2


def split_cost(values, bounds):
    return sum(sum(values[bounds[g]:bounds[g + 1]]) ** 2 for g in range(len(bounds) - 1))


def brute_force(values, k):
    """Every split into k groups: the best cost, and the best split whose last cut is smallest,
    then the cut before it, and so on (the documented tie rule)."""
    n = len(values)
    best = None
    for cuts in combinations(range(1, n), k - 1):
        bounds = [0, *cuts, n]
        key = (split_cost(values, bounds), tuple(reversed(cuts)))
        if best is None or key < best[0]:
            best = (key, bounds)
    return best[0][0], best[1]


def quadrangle_violation(n, cost):
    """The first (a, b, c, d) with a < b < c < d <= n and C(a, c) + C(b, d) > C(a, d) + C(b, c)."""
    for a, b, c, d in combinations(range(n + 1), 4):
        if cost(a, c) + cost(b, d) > cost(a, d) + cost(b, c):
            return a, b, c, d
    return None


def random_case(rng, max_n, negative=False):
    n = rng.randint(1, max_n)
    high = rng.choice([1, 3, 10, 100, 10 ** 6])
    values = [rng.randint(-high if negative else 0, high) for _ in range(n)]
    return values, rng.randint(1, n)


class Recorder:
    """Wraps the module-level helpers to record every call, the way the site's fixtures do."""

    def __init__(self, test):
        self.calls, self.splits = [], []
        real_solve, real_split = module._solve_range, module._best_split

        def solve(prev, cur, opt_row, cost, g, lo, hi, opt_lo, opt_hi):
            if lo <= hi:
                self.calls.append((g, lo, hi, opt_lo, opt_hi))
            real_solve(prev, cur, opt_row, cost, g, lo, hi, opt_lo, opt_hi)

        def split(prev, cost, i, j_lo, j_hi):
            result = real_split(prev, cost, i, j_lo, j_hi)
            self.splits.append((i, j_lo, j_hi) + result)
            return result

        module._solve_range, module._best_split = solve, split
        test.addCleanup(setattr, module, "_solve_range", real_solve)
        test.addCleanup(setattr, module, "_best_split", real_split)


class TestWorkedExample(unittest.TestCase):
    def test_three_groups(self):
        # [3, 1, 4, 1] [5, 9] [2, 6]: 9^2 + 14^2 + 8^2 = 81 + 196 + 64 = 341.
        cost, bounds = min_cost_partition(VALUES, 3)
        self.assertEqual((cost, bounds), (341, [0, 4, 6, 8]))
        self.assertEqual([VALUES[bounds[g]:bounds[g + 1]] for g in range(3)], [[3, 1, 4, 1], [5, 9], [2, 6]])
        self.assertEqual(min_cost_partition_plain(VALUES, 3), (341, [0, 4, 6, 8]))

    def test_every_k(self):
        want = [(961, [0, 8]), (485, [0, 5, 8]), (341, [0, 4, 6, 8]), (245, [0, 3, 5, 6, 8]),
                (211, [0, 2, 4, 5, 6, 8]), (187, [0, 2, 4, 5, 6, 7, 8]), (179, [0, 2, 3, 4, 5, 6, 7, 8]),
                (173, [0, 1, 2, 3, 4, 5, 6, 7, 8])]
        self.assertEqual([min_cost_partition(VALUES, k) for k in range(1, 9)], want)

    def test_the_recursion_of_layer_2(self):
        # (g, lo, hi, opt_lo, opt_hi) of every non-empty call, in order: the middle cell first,
        # then the left half with j up to opt(mid), then the right half with j from opt(mid).
        rec = Recorder(self)
        min_cost_partition(VALUES, 2)
        self.assertEqual(rec.calls, [(2, 2, 8, 1, 7), (2, 2, 4, 1, 3), (2, 2, 2, 1, 2), (2, 4, 4, 2, 3),
                                     (2, 6, 8, 3, 7), (2, 6, 6, 3, 5), (2, 8, 8, 5, 7)])
        # (i, j_lo, j_hi, dp[2][i], opt(2, i)) of every cell, in the order it is solved.
        self.assertEqual(rec.splits, [(5, 1, 4, 100, 3), (3, 1, 2, 32, 2), (2, 1, 1, 10, 1), (4, 2, 3, 41, 2),
                                      (7, 3, 6, 317, 5), (6, 3, 5, 277, 4), (8, 5, 7, 485, 5)])

    def test_layer_3(self):
        rec = Recorder(self)
        min_cost_partition(VALUES, 3)
        layer3 = [s for s, c in zip(rec.splits, rec.calls) if c[0] == 3]
        self.assertEqual(layer3, [(5, 2, 4, 66, 4), (3, 2, 2, 26, 2), (4, 2, 3, 33, 3), (7, 4, 6, 221, 5),
                                  (6, 4, 5, 181, 5), (8, 5, 7, 341, 6)])

    def test_cost_evaluations(self):
        # Layer 1 costs 8, layer 2 costs 4 + 2 + 1 + 2 + 4 + 3 + 3 = 19 and layer 3 costs 14;
        # the plain DP tries every j: 8 + 28 + 21.
        self.assertEqual(count_evaluations(min_cost_partition, VALUES, 3, self), 41)
        self.assertEqual(count_evaluations(min_cost_partition_plain, VALUES, 3, self), 57)


def count_evaluations(fn, values, k, test):
    calls = [0]
    real = module._group_cost

    def counted(prefix, j, i):
        calls[0] += 1
        return real(prefix, j, i)

    module._group_cost = counted
    try:
        fn(values, k)
    finally:
        module._group_cost = real
    return calls[0]


class TestAgainstPlainAndBruteForce(unittest.TestCase):
    def test_optimized_equals_plain(self):
        rng = random.Random(20261124)
        for _ in range(1500):
            values, k = random_case(rng, 40)
            self.assertEqual(min_cost_partition(values, k), min_cost_partition_plain(values, k), (values, k))

    def test_both_equal_brute_force_with_the_tie_rule(self):
        rng = random.Random(2086)
        for _ in range(1500):
            values, k = random_case(rng, 9)
            want = brute_force(values, k)
            self.assertEqual(min_cost_partition(values, k), want, (values, k))
            self.assertEqual(min_cost_partition_plain(values, k), want, (values, k))

    def test_larger_inputs(self):
        rng = random.Random(321)
        for _ in range(20):
            n = rng.randint(100, 300)
            values = [rng.randint(0, 10 ** rng.randint(1, 9)) for _ in range(n)]
            k = rng.randint(1, 12)
            self.assertEqual(min_cost_partition(values, k), min_cost_partition_plain(values, k))


class TestGroups(unittest.TestCase):
    def assert_valid(self, values, k):
        cost, bounds = min_cost_partition(values, k)
        self.assertEqual(len(bounds), k + 1)
        self.assertEqual((bounds[0], bounds[-1]), (0, len(values)))
        self.assertTrue(all(bounds[g] < bounds[g + 1] for g in range(k)), "every group is non-empty")
        self.assertEqual(split_cost(values, bounds), cost, "the groups reach the cost")

    def test_random_inputs(self):
        rng = random.Random(868)
        for _ in range(1000):
            self.assert_valid(*random_case(rng, 30))


class TestQuadrangleInequality(unittest.TestCase):
    def test_holds_for_values_at_least_zero(self):
        rng = random.Random(1433)
        for _ in range(400):
            values, _ = random_case(rng, 12)
            self.assertIsNone(quadrangle_violation(len(values), square_cost(values)), values)

    def test_the_identity_behind_it(self):
        # C(a, c) + C(b, d) - C(a, d) - C(b, c) = -2 (P[b] - P[a]) (P[d] - P[c]), for any sign.
        rng = random.Random(7)
        for _ in range(200):
            values = [rng.randint(-9, 9) for _ in range(rng.randint(4, 10))]
            p = list(accumulate(values, initial=0))
            cost = square_cost(values)
            for a, b, c, d in combinations(range(len(values) + 1), 4):
                self.assertEqual(cost(a, c) + cost(b, d) - cost(a, d) - cost(b, c), -2 * (p[b] - p[a]) * (p[d] - p[c]))

    def test_opt_is_monotone_in_every_layer(self):
        # The smallest best j, from a full scan of every candidate, never moves left as i grows.
        rng = random.Random(1527)
        for _ in range(300):
            values, k = random_case(rng, 20)
            rec = Recorder(self)
            min_cost_partition_plain(values, k)
            n, i_seen, opts = len(values), [], []
            for i, _lo, _hi, _best, best_j in rec.splits:
                if i_seen and i < i_seen[-1]:
                    self.assertEqual(opts, sorted(opts))
                    i_seen, opts = [], []
                i_seen.append(i)
                opts.append(best_j)
            self.assertEqual(opts, sorted(opts), (values, k, n))


class TestWhenItFails(unittest.TestCase):
    """With a negative value the square of the sum breaks the quadrangle inequality."""

    def test_the_small_example(self):
        values = [1, 2, 4, -5]
        cost = square_cost(values)
        # The quadruple behind the wrong answer: C(1, 3) + C(2, 4) = 36 + 1 = 37 > C(1, 4) + C(2, 3) = 1 + 16 = 17.
        self.assertEqual((cost(1, 3), cost(2, 4), cost(1, 4), cost(2, 3)), (36, 1, 1, 16))
        self.assertEqual(quadrangle_violation(4, cost), (0, 1, 2, 4))  # the first one: 9 + 1 > 4 + 4
        # opt(2, 3) = 2 but opt(2, 4) = 1: the right half searches j from 2 and misses j = 1.
        self.assertEqual(partition_dp(4, 2, cost, optimized=True), (10, [0, 2, 4]))
        self.assertEqual(partition_dp(4, 2, cost, optimized=False), (2, [0, 1, 4]))

    def test_the_optimized_answer_differs_on_some_inputs(self):
        rng = random.Random(1603)
        differ = 0
        for _ in range(3000):
            values, k = random_case(rng, 9, negative=True)
            cost = square_cost(values)
            fast = partition_dp(len(values), k, cost, optimized=True)
            plain = partition_dp(len(values), k, cost, optimized=False)
            self.assertEqual(plain[0], brute_force(values, k)[0])
            # The recursion still returns a real split and its true cost, never one below the best.
            self.assertEqual(split_cost(values, fast[1]), fast[0])
            self.assertGreaterEqual(fast[0], plain[0])
            if fast != plain:
                differ += 1
                self.assertIsNotNone(quadrangle_violation(len(values), cost), values)
        self.assertEqual(differ, 219)

    def test_the_concrete_functions_reject_negative_values(self):
        for fn in (min_cost_partition, min_cost_partition_plain):
            with self.assertRaises(ValueError):
                fn([1, 2, 4, -5], 2)


class TestOtherCosts(unittest.TestCase):
    def test_costs_that_satisfy_the_inequality(self):
        # A convex function of the length, and the square of the sum plus a fixed price per group.
        rng = random.Random(1478)
        for _ in range(300):
            values, k = random_case(rng, 25)
            n = len(values)
            square = square_cost(values)
            for cost in (lambda j, i: (i - j) ** 3, lambda j, i: square(j, i) + 50):
                if n <= 10:
                    self.assertIsNone(quadrangle_violation(n, cost))
                self.assertEqual(partition_dp(n, k, cost, True), partition_dp(n, k, cost, False))

    def test_bad_k_is_rejected(self):
        for k in (0, -1, 5):
            with self.assertRaises(ValueError):
                partition_dp(4, k, lambda j, i: 0)


class TestEdgeCases(unittest.TestCase):
    def test_one_group(self):
        self.assertEqual(min_cost_partition(VALUES, 1), (31 ** 2, [0, 8]))
        self.assertEqual(min_cost_partition([7], 1), (49, [0, 1]))

    def test_one_group_per_value(self):
        self.assertEqual(min_cost_partition(VALUES, 8), (sum(v * v for v in VALUES), list(range(9))))
        self.assertEqual(min_cost_partition_plain(VALUES, 8), (173, list(range(9))))

    def test_more_groups_than_values(self):
        # Groups are not empty, so k > n is an error, not k = n.
        for fn in (min_cost_partition, min_cost_partition_plain):
            with self.assertRaises(ValueError):
                fn([1, 2, 3], 4)

    def test_empty_list(self):
        for fn in (min_cost_partition, min_cost_partition_plain):
            for k in (0, 1):
                with self.assertRaises(ValueError):
                    fn([], k)

    def test_k_below_one(self):
        for fn in (min_cost_partition, min_cost_partition_plain):
            with self.assertRaises(ValueError):
                fn([1, 2], 0)

    def test_equal_values(self):
        # 2 + 3 and 3 + 2 both cost 4 + 9 = 13; the last cut is the smallest possible.
        self.assertEqual(min_cost_partition([1] * 5, 2), (13, [0, 2, 5]))
        self.assertEqual(min_cost_partition([1] * 7, 3), (17, [0, 2, 4, 7]))
        self.assertEqual(min_cost_partition([0, 0, 0, 0], 2), (0, [0, 1, 4]))
        self.assertEqual(min_cost_partition([0, 0, 0, 0], 3), (0, [0, 1, 2, 4]))
        self.assertEqual(min_cost_partition([5, 0, 0, 5], 2), (50, [0, 1, 4]))

    def test_zeros_and_one_big_value(self):
        self.assertEqual(min_cost_partition([0, 0, 9, 0, 0], 2), (81, [0, 1, 5]))
        self.assertEqual(min_cost_partition([0, 0, 9, 0, 0], 3), (81, [0, 1, 2, 5]))

    def test_large_values_are_exact(self):
        # 3037000499^2 is the largest square that fits in a signed 64-bit integer; C++ and Go
        # report an overflow once the total passes it. Python's integers are exact.
        self.assertEqual(min_cost_partition([3037000499], 1), (9223372030926249001, [0, 1]))
        self.assertEqual(min_cost_partition([3037000499, 1], 2), (9223372030926249002, [0, 1, 2]))
        self.assertEqual(min_cost_partition([3037000500], 1), (9223372037000250000, [0, 1]))
        self.assertEqual(min_cost_partition([10 ** 18] * 4, 2), (8 * 10 ** 36, [0, 2, 4]))

    def test_inputs_are_not_modified(self):
        values = list(VALUES)
        min_cost_partition(values, 3)
        min_cost_partition_plain(values, 3)
        self.assertEqual(values, VALUES)


class TestCostEvaluations(unittest.TestCase):
    """At most m (log2 m + 2) cost evaluations for a layer of m cells, against m (m + 1) / 2."""

    @staticmethod
    def bound(n, k):
        return n + sum((n - g + 1) * (math.floor(math.log2(n - g + 1)) + 2) for g in range(2, k + 1))

    @staticmethod
    def plain(n, k):
        return n + sum((n - g + 1) * (n - g + 2) // 2 for g in range(2, k + 1))

    @staticmethod
    def counting_values(n):
        return [(37 * t + 11) % 101 for t in range(n)]

    def test_within_the_bound_on_growing_n(self):
        counts = []
        for n in (64, 256, 1024, 4096):
            count = count_evaluations(min_cost_partition, self.counting_values(n), 4, self)
            self.assertLessEqual(count, self.bound(n, 4))
            counts.append(count)
        self.assertEqual(counts, [1140, 6225, 31234, 149749])
        self.assertEqual([self.plain(n, 4) for n in (64, 256, 1024, 4096)], [5924, 97412, 1569284, 25151492])

    def test_within_the_bound_on_random_inputs(self):
        rng = random.Random(833)
        for _ in range(150):
            values, k = random_case(rng, 200)
            self.assertLessEqual(count_evaluations(min_cost_partition, values, k, self), self.bound(len(values), k))

    def test_the_plain_dp_tries_every_j(self):
        for n in (8, 64, 256):
            self.assertEqual(count_evaluations(min_cost_partition_plain, self.counting_values(n), 4, self), self.plain(n, 4))

    def test_a_recursion_that_does_not_narrow_fails_the_bound(self):
        # Pass every call the whole range [g - 1, n - 1] instead of [opt_lo, opt_hi]: the answer
        # stays right, but each cell tries every j, exactly as many evaluations as the plain DP.
        real = module._solve_range

        def wide(prev, cur, opt_row, cost, g, lo, hi, opt_lo, opt_hi):
            real(prev, cur, opt_row, cost, g, lo, hi, g - 1, len(prev) - 2)

        module._solve_range = wide
        self.addCleanup(setattr, module, "_solve_range", real)
        values = self.counting_values(256)
        count = count_evaluations(min_cost_partition, values, 4, self)
        self.assertEqual(count, self.plain(256, 4))
        self.assertGreater(count, self.bound(256, 4))
        module._solve_range = real
        self.assertEqual(min_cost_partition(values, 4), min_cost_partition_plain(values, 4))


if __name__ == "__main__":
    unittest.main()
