"""
Tests for knuth_optimization: the narrowed DP against the plain O(n^3) interval DP and brute
force, the window and the monotone split table, the two conditions on the cost, a cost that
breaks them, the merges read back and their tie rule, the optimal binary search tree, the edge
cases and the exact number of splits tried.
"""

import math
import random
import unittest
from itertools import permutations

import knuth_optimization as module
from knuth_optimization import merge_piles, merge_piles_plan, optimal_bst, split_dp

# The worked example of the README, the same row as Interval DP's.
PILES = [3, 2, 4, 1]

# A row on which the square root of the merged size breaks the quadrangle inequality and the
# window misses the best split: 8 with the window, 7 with every split.
ROOT_PILES = [1, 1, 2, 1, 6]


def prefix_of(values):
    prefix = [0]
    for v in values:
        prefix.append(prefix[-1] + v)
    return prefix


def pile_cost(piles):
    """C(i, j) = sum(piles[i..j])."""
    prefix = prefix_of(piles)
    return lambda i, j: prefix[j + 1] - prefix[i]


def root_cost(piles):
    """C(i, j) = the square root of sum(piles[i..j]), rounded down: monotone, but concave."""
    prefix = prefix_of(piles)
    return lambda i, j: math.isqrt(prefix[j + 1] - prefix[i])


def plain_tables(n, cost):
    """The plain interval DP of Interval DP, written out again: every k from i to j - 1, a
    strict < so the smallest best k is kept, cells filled by length."""
    dp = [[0] * n for _ in range(n)]
    split = [[-1] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            best = None
            for k in range(i, j):
                c = dp[i][k] + dp[k + 1][j] + cost(i, j)
                if best is None or c < best:
                    best, split[i][j] = c, k
            dp[i][j] = best
    return dp, split


def brute_merge(piles):
    """Every order of merges: merge any two neighbours, then go on with the shorter row."""
    if len(piles) <= 1:
        return 0
    best = None
    for t in range(len(piles) - 1):
        size = piles[t] + piles[t + 1]
        cost = size + brute_merge(piles[:t] + [size] + piles[t + 2:])
        best = cost if best is None else min(best, cost)
    return best


def brute_bst(freq, depth=1):
    """Every binary search tree on the keys, in order: each key in turn as the root."""
    if not freq:
        return 0
    return min(freq[r] * depth + brute_bst(freq[:r], depth + 1) + brute_bst(freq[r + 1:], depth + 1) for r in range(len(freq)))


def bst_by_insertion(freq):
    """Every tree is built by inserting the keys in some order: the least cost over all orders."""
    best = None
    for order in permutations(range(len(freq))):
        depth = {}
        for key in order:
            d, lo, hi = 1, -1, len(freq)
            # Walk down from the root: the keys already placed split the line into intervals.
            for other in order:
                if other == key:
                    break
                if lo < other < hi:
                    d += 1
                    if key < other:
                        hi = other
                    else:
                        lo = other
            depth[key] = d
        cost = sum(freq[t] * depth[t] for t in range(len(freq)))
        best = cost if best is None else min(best, cost)
    return best or 0


def apply_merges(piles, merges):
    """Play the merges out on the row of piles, checking that each one joins two neighbouring
    piles that are exactly i..k and k+1..j; returns the total cost and the final pile."""
    built = [(t, t) for t in range(len(piles))]
    total = 0
    for i, k, j in merges:
        p = built.index((i, k))
        assert built[p + 1] == (k + 1, j), (merges, built)
        built[p:p + 2] = [(i, j)]
        total += sum(piles[i:j + 1])
    return total, built


def quadrangle_violation(n, cost):
    """The first (a, b, c, d) with a <= b <= c <= d < n and C(a, c) + C(b, d) > C(a, d) + C(b, c),
    or None. Ranges of one point are included, with C(t, t) as the cost gives it."""
    for a in range(n):
        for b in range(a, n):
            for c in range(b, n):
                for d in range(c, n):
                    if cost(a, c) + cost(b, d) > cost(a, d) + cost(b, c):
                        return a, b, c, d
    return None


def monotone_violation(n, cost):
    """The first (a, b, c, d) with a <= b <= c <= d < n and C(b, c) > C(a, d), or None."""
    for a in range(n):
        for b in range(a, n):
            for c in range(b, n):
                for d in range(c, n):
                    if cost(b, c) > cost(a, d):
                        return a, b, c, d
    return None


def telescoped(split, n):
    """The number of splits the windows hold, from the final split table, one diagonal at a
    time: n - 1 for length 2, then (n - L + 1) + split[n-L+1][n-1] - split[0][L-2] for each
    length L, because the upper end of one cell's window is the lower end of the next one's."""
    total = max(0, n - 1)
    for length in range(3, n + 1):
        total += (n - length + 1) + split[n - length + 1][n - 1] - split[0][length - 2]
    return total


def window_bound(n):
    """The most a whole fill can try: n - 1, then (n - L + 1) + (n - 2) on each diagonal L >= 3,
    since split[n-L+1][n-1] <= n - 2 and split[0][L-2] >= 0. That sums to (3n^2 - 9n + 8) / 2."""
    return (3 * n * n - 9 * n + 8) // 2 if n >= 2 else 0


def random_piles(rng, max_n, max_size):
    return [rng.randint(0, max_size) for _ in range(rng.randint(0, max_n))]


def spy_calls(test):
    """Replace _try_split with a wrapper that records (i, k, j); returns the list it appends to."""
    calls = []
    real = module._try_split

    def spy(dp, split, join, i, k, j):
        calls.append((i, k, j))
        real(dp, split, join, i, k, j)

    module._try_split = spy
    test.addCleanup(setattr, module, "_try_split", real)
    return calls


class TestWorkedExample(unittest.TestCase):
    def test_value_and_plan(self):
        self.assertEqual(merge_piles(PILES), 20)
        self.assertEqual(merge_piles_plan(PILES), (20, [(0, 0, 1), (2, 2, 3), (0, 1, 3)]))
        self.assertEqual(split_dp(4, pile_cost(PILES)), 20)

    def test_tables_match_interval_dp(self):
        # The same tables as Interval DP's _fill_merge on this row.
        dp, split = module._fill_merge(PILES)
        self.assertEqual(dp, [[0, 5, 14, 20], [0, 0, 6, 12], [0, 0, 0, 5], [0, 0, 0, 0]])
        self.assertEqual(split, [[-1, 0, 1, 1], [-1, -1, 1, 1], [-1, -1, -1, 2], [-1, -1, -1, -1]])

    def test_every_split_in_order(self):
        # (i, k, j, dp[i][j] before, candidate): 8 candidates where the plain DP tries 10. The top
        # cell's window is split[0][2] = 1 to split[1][3] = 1, so k = 0 and k = 2 are skipped.
        log = []
        real = module._try_split

        def spy(dp, split, join, i, k, j):
            log.append((i, k, j, dp[i][j], dp[i][k] + dp[k + 1][j] + join))
            real(dp, split, join, i, k, j)

        module._try_split = spy
        self.addCleanup(setattr, module, "_try_split", real)
        merge_piles(PILES)
        inf = float("inf")
        self.assertEqual(log, [
            (0, 0, 1, inf, 5), (1, 1, 2, inf, 6), (2, 2, 3, inf, 5),
            (0, 0, 2, inf, 15), (0, 1, 2, 15, 14), (1, 1, 3, inf, 12), (1, 2, 3, 12, 13),
            (0, 1, 3, inf, 20),
        ])

    def test_optimal_bst_examples(self):
        # Keys searched 34, 8 and 50 times: the third key at the root (50 x 1), the first under it
        # (34 x 2) and the second at depth 3 (8 x 3).
        self.assertEqual(optimal_bst([34, 8, 50]), 142)
        self.assertEqual(optimal_bst([34, 50]), 118)
        dp, split = module._fill_bst([34, 8, 50])
        self.assertEqual(split[0][3], 2, "the root of the whole tree is key 2")
        self.assertEqual(split[0][2], 0, "then key 0, with key 1 under it")
        self.assertEqual(dp[0][3], 142)


class TestAgainstThePlainDp(unittest.TestCase):
    def test_same_tables_on_random_rows(self):
        rng = random.Random(1000)
        for _ in range(1500):
            piles = random_piles(rng, 14, rng.choice([1, 3, 9, 100, 10 ** 6]))
            want = plain_tables(len(piles), pile_cost(piles))
            self.assertEqual(module._fill_merge(piles), want, piles)

    def test_same_value_as_brute_force(self):
        rng = random.Random(1001)
        for _ in range(400):
            piles = random_piles(rng, 7, rng.choice([3, 9, 50]))
            self.assertEqual(merge_piles(piles), brute_merge(piles), piles)

    def test_knuth_false_is_the_plain_dp(self):
        rng = random.Random(1002)
        for _ in range(300):
            piles = random_piles(rng, 10, rng.choice([2, 9, 99]))
            n = len(piles)
            self.assertEqual(module._fill(n, pile_cost(piles), knuth=False), plain_tables(n, pile_cost(piles)))
            self.assertEqual(split_dp(n, pile_cost(piles), knuth=False), merge_piles(piles))

    def test_longer_rows(self):
        rng = random.Random(1003)
        for n in (40, 60):
            piles = [rng.randint(0, 10 ** 9) for _ in range(n)]
            self.assertEqual(module._fill_merge(piles), plain_tables(n, pile_cost(piles)))


class TestWindow(unittest.TestCase):
    def test_split_is_monotone_in_both_directions(self):
        # split[i][j-1] <= split[i][j] <= split[i+1][j]: along a row it never moves left, down a
        # column it never moves left either.
        rng = random.Random(1100)
        for _ in range(800):
            piles = random_piles(rng, 12, rng.choice([1, 5, 99]))
            _, split = module._fill_merge(piles)
            for i in range(len(piles)):
                for j in range(i + 2, len(piles)):
                    self.assertLessEqual(split[i][j - 1], split[i][j], (piles, i, j))
                    self.assertLessEqual(split[i][j], split[i + 1][j], (piles, i, j))

    def test_window_holds_the_smallest_best_k(self):
        # The plain DP's smallest best k, from its own table, lies inside the window built from
        # the plain table: so the window cannot miss it.
        rng = random.Random(1101)
        for _ in range(500):
            piles = random_piles(rng, 10, rng.choice([1, 4, 50]))
            n = len(piles)
            _, split = plain_tables(n, pile_cost(piles))
            for i in range(n):
                for j in range(i + 1, n):
                    lo, hi = module._window(split, i, j)
                    self.assertTrue(i <= lo <= split[i][j] <= hi <= j - 1, (piles, i, j, lo, hi))

    def test_every_window_is_inside_the_range_and_not_empty(self):
        calls = spy_calls(self)
        rng = random.Random(1102)
        for _ in range(200):
            calls.clear()
            piles = random_piles(rng, 12, 30)
            module._fill_merge(piles)
            tried = {}
            for i, k, j in calls:
                self.assertTrue(i <= k < j)
                tried.setdefault((i, j), []).append(k)
            n = len(piles)
            self.assertEqual(sorted(tried), sorted((i, j) for i in range(n) for j in range(i + 1, n)), "every cell tries a k")
            for ks in tried.values():
                self.assertEqual(ks, list(range(ks[0], ks[-1] + 1)), "a window is consecutive, in increasing order")


class TestConditions(unittest.TestCase):
    def test_range_sum_satisfies_both(self):
        # The pile cost: the quadrangle inequality holds with equality, and it is monotone
        # because no pile is below 0.
        rng = random.Random(1200)
        for _ in range(400):
            piles = random_piles(rng, 9, rng.choice([1, 9, 1000]))
            n, cost = len(piles), pile_cost(piles)
            self.assertIsNone(quadrangle_violation(n, cost), piles)
            self.assertIsNone(monotone_violation(n, cost), piles)
            for a in range(n):
                for b in range(a, n):
                    for c in range(b, n):
                        for d in range(c, n):
                            self.assertEqual(cost(a, c) + cost(b, d), cost(a, d) + cost(b, c))

    def test_optimal_bst_cost_satisfies_both(self):
        rng = random.Random(1201)
        for _ in range(300):
            freq = random_piles(rng, 8, 50)
            prefix = prefix_of(freq)

            def cost(i, j):
                return prefix[j] - prefix[i]

            self.assertIsNone(quadrangle_violation(len(freq) + 1, cost), freq)
            self.assertIsNone(monotone_violation(len(freq) + 1, cost), freq)

    def test_square_root_cost_breaks_the_inequality(self):
        cost = root_cost(ROOT_PILES)
        self.assertIsNone(monotone_violation(5, cost), "it is monotone")
        # C(0, 2) + C(1, 3) = 2 + 2 is more than C(0, 3) + C(1, 2) = 2 + 1.
        self.assertEqual(quadrangle_violation(5, cost), (0, 1, 2, 3))
        self.assertEqual((cost(0, 2), cost(1, 3), cost(0, 3), cost(1, 2)), (2, 2, 2, 1))

    def test_square_root_cost_gives_a_wrong_answer(self):
        cost = root_cost(ROOT_PILES)
        self.assertEqual(split_dp(5, cost, knuth=False), 7)
        self.assertEqual(split_dp(5, cost), 8)
        # The plain table: the best last split of the whole row is k = 3, but split[1][4] = 2,
        # so the window of dp[0][4] is split[0][3] = 1 to 2, and it misses k = 3.
        dp, split = plain_tables(5, cost)
        self.assertEqual((dp[0][4], split[0][4], split[0][3], split[1][4]), (7, 3, 1, 2))
        self.assertGreater(split[0][4], split[1][4], "the plain split table is not monotone")
        narrowed_dp, narrowed_split = module._fill(5, cost)
        self.assertEqual((narrowed_dp[0][4], narrowed_split[0][4]), (8, 1))

    def test_square_root_cost_often_differs(self):
        # On 2000 random rows of up to 10 piles the window misses the best split 55 times, and
        # the narrowed answer is then too large: it is the cost of a real merge order, not the least.
        rng = random.Random(1203)
        differ = 0
        for _ in range(2000):
            piles = random_piles(rng, 10, 20)
            cost = root_cost(piles)
            narrowed, plain = split_dp(len(piles), cost), split_dp(len(piles), cost, knuth=False)
            self.assertGreaterEqual(narrowed, plain)
            differ += narrowed != plain
        self.assertEqual(differ, 55)


class TestPlan(unittest.TestCase):
    def assert_plan(self, piles):
        cost, merges = merge_piles_plan(piles)
        self.assertEqual(cost, merge_piles(piles))
        self.assertEqual(len(merges), max(0, len(piles) - 1))
        total, built = apply_merges(piles, merges)
        self.assertEqual(total, cost, "the merges reach the value")
        if piles:
            self.assertEqual(built, [(0, len(piles) - 1)], "one pile at the end")
        return merges

    def test_random_rows(self):
        rng = random.Random(1547)
        for _ in range(600):
            self.assert_plan(random_piles(rng, 12, rng.choice([2, 9, 100])))

    def test_tie_rule_from_brute_force(self):
        # split[i][j] is the smallest k whose two parts and the merge reach dp[i][j]; the parts'
        # values come from brute force, not from the table being checked.
        rng = random.Random(1039)
        for _ in range(250):
            piles = random_piles(rng, 6, rng.choice([1, 2, 5]))
            _, split = module._fill_merge(piles)
            n = len(piles)
            for i in range(n):
                for j in range(i + 1, n):
                    best = brute_merge(piles[i:j + 1])
                    want = min(k for k in range(i, j)
                               if brute_merge(piles[i:k + 1]) + brute_merge(piles[k + 1:j + 1]) + sum(piles[i:j + 1]) == best)
                    self.assertEqual(split[i][j], want, (piles, i, j))

    def test_pinned_ties(self):
        # The same merges as Interval DP's merge_piles_plan on the rows its tests pin.
        self.assertEqual(merge_piles_plan([1, 1, 1, 1]), (8, [(0, 0, 1), (2, 2, 3), (0, 1, 3)]))
        self.assertEqual(merge_piles_plan([1, 1, 1]), (5, [(1, 1, 2), (0, 0, 2)]))
        self.assertEqual(merge_piles_plan([2, 2, 2, 2, 2]), (24, [(0, 0, 1), (3, 3, 4), (2, 2, 4), (0, 1, 4)]))
        self.assertEqual(merge_piles_plan([0, 0, 0, 0]), (0, [(2, 2, 3), (1, 1, 3), (0, 0, 3)]))
        self.assertEqual(merge_piles_plan([1, 2, 3]), (9, [(0, 0, 1), (0, 1, 2)]))
        self.assertEqual(merge_piles_plan([3, 2, 1]), (9, [(1, 1, 2), (0, 0, 2)]))
        self.assertEqual(merge_piles_plan([3, 2, 2, 3]), (20, [(0, 0, 1), (2, 2, 3), (0, 1, 3)]))


class TestOptimalBst(unittest.TestCase):
    def test_against_brute_force(self):
        rng = random.Random(1300)
        for _ in range(400):
            freq = random_piles(rng, 7, rng.choice([1, 9, 60]))
            self.assertEqual(optimal_bst(freq), brute_bst(freq), freq)

    def test_brute_force_by_insertion_orders(self):
        # A second, independent brute force for the small cases: the trees built by inserting
        # the keys in every order are all the binary search trees on them.
        rng = random.Random(1301)
        for _ in range(60):
            freq = random_piles(rng, 5, 20)
            self.assertEqual(brute_bst(freq), bst_by_insertion(freq), freq)

    def test_against_the_plain_dp(self):
        rng = random.Random(1302)
        for _ in range(500):
            freq = random_piles(rng, 14, rng.choice([1, 9, 10 ** 6]))
            prefix = prefix_of(freq)

            def cost(i, j):
                return prefix[j] - prefix[i]

            self.assertEqual(module._fill_bst(freq), plain_tables(len(freq) + 1, cost), freq)

    def test_edge_cases(self):
        self.assertEqual(optimal_bst([]), 0)
        self.assertEqual(optimal_bst([7]), 7)
        self.assertEqual(optimal_bst([0, 0, 0]), 0)
        self.assertEqual(optimal_bst([4, 9]), 9 + 2 * 4)  # the heavier key at the root
        self.assertEqual(optimal_bst([5] * 7), 5 * (1 + 2 * 2 + 4 * 3))  # a full tree of depth 3
        self.assertEqual(optimal_bst([2 ** 62, 2 ** 62]), 3 * 2 ** 62)
        with self.assertRaises(ValueError):
            optimal_bst([3, -1])


class TestEdgeCases(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(merge_piles([]), 0)
        self.assertEqual(merge_piles_plan([]), (0, []))
        self.assertEqual(split_dp(0, lambda i, j: 1), 0)

    def test_one_pile(self):
        self.assertEqual(merge_piles([7]), 0)
        self.assertEqual(merge_piles_plan([7]), (0, []))
        self.assertEqual(split_dp(1, lambda i, j: 1), 0)

    def test_two_piles(self):
        self.assertEqual(merge_piles_plan([4, 9]), (13, [(0, 0, 1)]))
        self.assertEqual(split_dp(2, lambda i, j: 5), 5)

    def test_equal_piles(self):
        self.assertEqual(merge_piles([5] * 8), 5 * 24)
        self.assertEqual(merge_piles([1] * 64), 64 * 6)
        self.assertEqual(merge_piles([0, 0, 0]), 0)

    def test_large_values_are_exact(self):
        # 2^63 does not fit in a signed 64-bit integer; Python's integers do not overflow (C++ and
        # Go raise their overflow error here and return 2^63 - 1 one step below).
        self.assertEqual(merge_piles([2 ** 62, 2 ** 62]), 2 ** 63)
        self.assertEqual(merge_piles([2 ** 62, 2 ** 62 - 1]), 2 ** 63 - 1)
        # The split after pile 1 would cost 2^63 + 1, but the minimum, after pile 0, fits.
        self.assertEqual(merge_piles_plan([2 ** 62, 0, 1]), (2 ** 62 + 2, [(1, 1, 2), (0, 0, 2)]))
        # Three piles of 2^61: every order costs 5 * 2^61. With a pile of 0 after them the total
        # still fits in 64 bits, but the cells dp[0][2] = 5 * 2^61 and dp[0][3] = 6 * 2^61 do not.
        self.assertEqual(merge_piles([2 ** 61] * 3), 5 * 2 ** 61)
        self.assertEqual(merge_piles_plan([2 ** 61] * 3 + [0]), (6 * 2 ** 61, [(2, 2, 3), (1, 1, 3), (0, 0, 3)]))
        self.assertEqual(merge_piles([2 ** 63 - 1]), 0)
        self.assertEqual(optimal_bst([2 ** 63 - 1]), 2 ** 63 - 1)
        self.assertEqual(optimal_bst([2 ** 62, 1]), 2 ** 62 + 2)

    def test_negative_values_are_rejected(self):
        for fn in (merge_piles, merge_piles_plan, optimal_bst):
            with self.assertRaises(ValueError, msg=fn.__name__):
                fn([3, -1, 2])
        with self.assertRaises(ValueError):
            split_dp(-1, lambda i, j: 0)
        with self.assertRaises(ValueError):
            split_dp(3, lambda i, j: j - i - 2)  # -1 for two points

    def test_cost_called_once_per_range(self):
        seen = []

        def cost(i, j):
            seen.append((i, j))
            return j - i

        split_dp(6, cost)
        self.assertEqual(sorted(seen), [(i, j) for i in range(6) for j in range(i + 1, 6)])
        lengths = [j - i for i, j in seen]
        self.assertEqual(lengths, sorted(lengths), "by increasing length")

    def test_inputs_are_not_modified(self):
        piles = list(PILES)
        merge_piles_plan(piles)
        optimal_bst(piles)
        self.assertEqual(piles, PILES)


class TestOperationCounts(unittest.TestCase):
    """The windows try exactly the telescoped number of splits: about n^2, not (n^3 - n) / 6."""

    def count(self, calls, fill):
        calls.clear()
        dp, split = fill()
        return len(calls), split

    def test_exactly_the_telescoped_sum(self):
        calls = spy_calls(self)
        rng = random.Random(1400)
        for _ in range(400):
            piles = random_piles(rng, 25, rng.choice([1, 9, 1000]))
            n = len(piles)
            tried, split = self.count(calls, lambda: module._fill_merge(piles))
            self.assertEqual(tried, telescoped(split, n), piles)
            self.assertLessEqual(tried, window_bound(n))

    def test_growing_n(self):
        calls = spy_calls(self)
        rng = random.Random(1401)
        for n in (10, 20, 40, 80, 160):
            # Equal piles: the windows hold exactly (n - 1)^2 splits.
            tried, split = self.count(calls, lambda: module._fill_merge([1] * n))
            self.assertEqual(tried, (n - 1) ** 2)
            self.assertEqual(tried, telescoped(split, n))
            # Random piles: the telescoped sum, at most window_bound(n), against (n^3 - n) / 6.
            piles = [rng.randint(0, 10 ** 6) for _ in range(n)]
            tried, split = self.count(calls, lambda: module._fill_merge(piles))
            self.assertEqual(tried, telescoped(split, n))
            self.assertLessEqual(tried, window_bound(n))
            self.assertLess(tried, 1.3 * n * n)
            plain, _ = self.count(calls, lambda: module._fill(n, pile_cost(piles), knuth=False))
            self.assertEqual(plain, (n ** 3 - n) // 6)

    def test_the_bound_is_reached(self):
        # Two heavy ends: every prefix is best split after its first pile and every suffix before
        # its last, so each diagonal's window spans the most it can.
        calls = spy_calls(self)
        for n in (4, 8, 20, 60):
            tried, split = self.count(calls, lambda: module._fill_merge([1000] + [1] * (n - 2) + [1000]))
            self.assertEqual(tried, window_bound(n))

    def test_a_fill_that_does_not_narrow_fails_the_count(self):
        # Trying every k gives the same tables but (n^3 - n) / 6 splits, which is not the
        # telescoped sum once n >= 4 (for n = 3 the one window is the whole range anyway).
        calls = spy_calls(self)
        for n in range(4, 30):
            piles = list(range(1, n + 1))
            tried, split = self.count(calls, lambda: module._fill(n, pile_cost(piles), knuth=False))
            self.assertEqual(tried, (n ** 3 - n) // 6)
            self.assertNotEqual(tried, telescoped(split, n), n)
            narrowed, _ = self.count(calls, lambda: module._fill_merge(piles))
            self.assertEqual(narrowed, telescoped(split, n), n)

    def test_optimal_bst_counts(self):
        calls = spy_calls(self)
        for n in (10, 40):
            freq = [1] * n
            tried, split = self.count(calls, lambda: module._fill_bst(freq))
            self.assertEqual(tried, telescoped(split, n + 1))
            self.assertLessEqual(tried, window_bound(n + 1))


if __name__ == "__main__":
    unittest.main()
