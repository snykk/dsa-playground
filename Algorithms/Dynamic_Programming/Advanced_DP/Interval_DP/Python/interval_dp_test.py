"""
Tests for interval_dp: the three problems against brute force, the merges read back and their
tie rule, the top-down form, the order of the fill, the edge cases and the work done.
"""

import random
import sys
import unittest
from itertools import permutations

import interval_dp as module
from interval_dp import burst_balloons, merge_piles, merge_piles_memo, merge_piles_plan, min_palindrome_cuts

# The worked example of the README: four piles.
PILES = [3, 2, 4, 1]

# "a", "e" with an acute accent (U+00E9, two bytes in UTF-8), "a".
ACCENTED = "a" + chr(0xE9) + "a"


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


def brute_burst(nums):
    """Every order of bursts, played out on a list."""
    best = 0
    for order in permutations(range(len(nums))):
        alive = list(range(len(nums)))
        coins = 0
        for b in order:
            p = alive.index(b)
            left = nums[alive[p - 1]] if p > 0 else 1
            right = nums[alive[p + 1]] if p + 1 < len(alive) else 1
            coins += left * nums[b] * right
            alive.pop(p)
        best = max(best, coins)
    return best


def brute_cuts(s):
    """Every set of cut positions: a cut after position p for each bit p of the mask."""
    n = len(s)
    if n == 0:
        return 0
    best = n - 1
    for mask in range(1 << (n - 1)):
        start, pieces_ok = 0, True
        for p in range(n):
            if p == n - 1 or mask >> p & 1:
                piece = s[start:p + 1]
                if piece != piece[::-1]:
                    pieces_ok = False
                    break
                start = p + 1
        if pieces_ok:
            best = min(best, bin(mask).count("1"))
    return best


def prefix_cuts(s):
    """The O(n^2) form over prefixes: best[e] = fewest cuts for s[:e], ending with a palindrome."""
    n = len(s)
    if n == 0:
        return 0
    pal = module._palindrome_table(s)
    best = [-1] + [n] * n  # best[0] = -1, so a whole palindrome costs -1 + 1 = 0 cuts
    for e in range(1, n + 1):
        for b in range(e):
            if pal[b][e - 1]:
                best[e] = min(best[e], best[b] + 1)
    return best[n]


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


def random_piles(rng, max_n, max_size):
    return [rng.randint(0, max_size) for _ in range(rng.randint(0, max_n))]


def spy_calls(test, name):
    """Replace the module-level helper `name` with a wrapper that records its arguments
    (without the tables); returns the list it appends to."""
    calls = []
    real = getattr(module, name)

    def spy(*args):
        calls.append(tuple(a for a in args if isinstance(a, int)))
        real(*args)

    setattr(module, name, spy)
    test.addCleanup(setattr, module, name, real)
    return calls


class TestWorkedExample(unittest.TestCase):
    def test_value_and_plan(self):
        self.assertEqual(merge_piles(PILES), 20)
        self.assertEqual(merge_piles_memo(PILES), 20)
        # Piles 3 and 2 (cost 5), piles 4 and 1 (cost 5), then the two piles of 5 (cost 10).
        self.assertEqual(merge_piles_plan(PILES), (20, [(0, 0, 1), (2, 2, 3), (0, 1, 3)]))

    def test_tables(self):
        dp, split, prefix = module._fill_merge(PILES)
        self.assertEqual(prefix, [0, 3, 5, 9, 10])
        self.assertEqual(dp, [[0, 5, 14, 20], [0, 0, 6, 12], [0, 0, 0, 5], [0, 0, 0, 0]])
        self.assertEqual(split, [[-1, 0, 1, 1], [-1, -1, 1, 1], [-1, -1, -1, 2], [-1, -1, -1, -1]])

    def test_every_split_in_order(self):
        # (i, k, j) for every candidate, with dp[i][j] before it and the candidate's cost.
        log = []
        real = module._try_split

        def spy(dp, split, prefix, i, k, j):
            log.append((i, k, j, dp[i][j], dp[i][k] + dp[k + 1][j] + prefix[j + 1] - prefix[i]))
            real(dp, split, prefix, i, k, j)

        module._try_split = spy
        self.addCleanup(setattr, module, "_try_split", real)
        merge_piles(PILES)
        inf = float("inf")
        self.assertEqual(log, [
            (0, 0, 1, inf, 5), (1, 1, 2, inf, 6), (2, 2, 3, inf, 5),
            (0, 0, 2, inf, 15), (0, 1, 2, 15, 14), (1, 1, 3, inf, 12), (1, 2, 3, 12, 13),
            (0, 0, 3, inf, 22), (0, 1, 3, 22, 20), (0, 2, 3, 20, 24),
        ])

    def test_other_examples(self):
        self.assertEqual(burst_balloons([3, 1, 5, 8]), 167)
        self.assertEqual(burst_balloons([1, 5]), 10)
        self.assertEqual(min_palindrome_cuts("aab"), 1)
        self.assertEqual(min_palindrome_cuts("banana"), 1)  # b | anana
        self.assertEqual(min_palindrome_cuts("abcde"), 4)


class TestAgainstBruteForce(unittest.TestCase):
    def test_merge_piles(self):
        rng = random.Random(1000)
        for _ in range(400):
            piles = random_piles(rng, 7, rng.choice([3, 9, 50]))
            want = brute_merge(piles)
            self.assertEqual(merge_piles(piles), want, piles)
            self.assertEqual(merge_piles_memo(piles), want, piles)
            self.assertEqual(merge_piles_plan(piles)[0], want, piles)

    def test_burst_balloons(self):
        rng = random.Random(312)
        for _ in range(300):
            nums = [rng.randint(0, rng.choice([3, 9, 20])) for _ in range(rng.randint(0, 6))]
            self.assertEqual(burst_balloons(nums), brute_burst(nums), nums)

    def test_min_palindrome_cuts(self):
        rng = random.Random(132)
        for _ in range(500):
            s = "".join(rng.choice(rng.choice(["ab", "abc", "abcd"])) for _ in range(rng.randint(0, 12)))
            want = brute_cuts(s)
            self.assertEqual(min_palindrome_cuts(s), want, s)
            self.assertEqual(prefix_cuts(s), want, s)


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

    def test_random_inputs(self):
        rng = random.Random(1547)
        for _ in range(600):
            self.assert_plan(random_piles(rng, 9, rng.choice([2, 9, 100])))

    def test_tie_rule_from_the_table(self):
        # split[i][j] is the smallest k whose two parts and the merge reach dp[i][j]; the parts'
        # values come from brute force, not from the table being checked.
        rng = random.Random(1039)
        for _ in range(250):
            piles = random_piles(rng, 6, rng.choice([1, 2, 5]))
            _, split, _ = module._fill_merge(piles)
            n = len(piles)
            for i in range(n):
                for j in range(i + 1, n):
                    best = brute_merge(piles[i:j + 1])
                    want = min(k for k in range(i, j)
                               if brute_merge(piles[i:k + 1]) + brute_merge(piles[k + 1:j + 1]) + sum(piles[i:j + 1]) == best)
                    self.assertEqual(split[i][j], want, (piles, i, j))

    def test_pinned_ties(self):
        # All equal: at [0..3] only k = 1 reaches 8; at [0..2] k = 0 and k = 1 both reach 5.
        self.assertEqual(merge_piles_plan([1, 1, 1, 1]), (8, [(0, 0, 1), (2, 2, 3), (0, 1, 3)]))
        self.assertEqual(merge_piles_plan([1, 1, 1]), (5, [(1, 1, 2), (0, 0, 2)]))
        # Five equal piles: k = 1 and k = 2 both reach 24 at the top; k = 1 is kept.
        self.assertEqual(merge_piles_plan([2, 2, 2, 2, 2]), (24, [(0, 0, 1), (3, 3, 4), (2, 2, 4), (0, 1, 4)]))
        # Zeros tie everywhere: the smallest k each time, so the right end is merged first.
        self.assertEqual(merge_piles_plan([0, 0, 0, 0]), (0, [(2, 2, 3), (1, 1, 3), (0, 0, 3)]))
        # A mirrored row gives the mirrored tree only when there is no tie.
        self.assertEqual(merge_piles_plan([1, 2, 3]), (9, [(0, 0, 1), (0, 1, 2)]))
        self.assertEqual(merge_piles_plan([3, 2, 1]), (9, [(1, 1, 2), (0, 0, 2)]))

    def test_post_order(self):
        # Each merge comes after the merges that built its two parts, and the left part's merges
        # come before the right part's.
        rng = random.Random(664)
        for _ in range(300):
            piles = random_piles(rng, 9, 30)
            merges = self.assert_plan(piles)
            position = {(i, j): t for t, (i, _, j) in enumerate(merges)}
            for t, (i, k, j) in enumerate(merges):
                left = position.get((i, k), -1)
                right = position.get((k + 1, j), -1)
                self.assertLess(left, t)
                self.assertLess(right, t)
                if k > i and k + 1 < j:
                    self.assertLess(left, min(position[(p, q)] for p, q in position if k + 1 <= p and q <= j))


class TestTopDown(unittest.TestCase):
    def test_same_tables(self):
        rng = random.Random(877)
        for _ in range(300):
            piles = random_piles(rng, 10, rng.choice([2, 9, 99]))
            self.assertEqual(module._fill_merge_memo(piles), module._fill_merge(piles), piles)

    def test_same_candidates_in_another_order(self):
        calls = spy_calls(self, "_try_split")
        piles = [5, 1, 4, 2, 8, 3]
        merge_piles(piles)
        bottom_up = list(calls)
        calls.clear()
        merge_piles_memo(piles)
        self.assertEqual(sorted(calls), sorted(bottom_up))
        self.assertNotEqual(calls, bottom_up)

    def test_recursion_depth(self):
        # The recursion goes n calls deep: past the default limit, Python raises RecursionError
        # before doing much work, where the loops of merge_piles have no limit.
        with self.assertRaises(RecursionError):
            merge_piles_memo([1] * (sys.getrecursionlimit() + 10))


class TestOrderOfTheFill(unittest.TestCase):
    def test_every_cell_read_is_final(self):
        # Filled by length, every cell a candidate reads has had all of its candidates already.
        calls = spy_calls(self, "_try_split")
        merge_piles(list(range(1, 10)))
        last = {}
        for t, (i, k, j) in enumerate(calls):
            last[(i, j)] = t
        for t, (i, k, j) in enumerate(calls):
            self.assertLess(last.get((i, k), -1), t)
            self.assertLess(last.get((k + 1, j), -1), t)

    def test_by_row_from_the_top_reads_unfinished_cells(self):
        # The same loops with i going down the rows and j along them read dp[k+1][j] before it
        # is computed (it still holds 0), and get the wrong answer.
        def by_rows(piles):
            n = len(piles)
            prefix = module._prefix_sums(piles)
            dp = [[0] * n for _ in range(n)]
            for i in range(n):
                for j in range(i + 1, n):
                    dp[i][j] = min(dp[i][k] + dp[k + 1][j] + prefix[j + 1] - prefix[i] for k in range(i, j))
            return dp[0][n - 1]

        self.assertEqual(by_rows(PILES), 10)
        self.assertNotEqual(by_rows(PILES), merge_piles(PILES))

    def test_rows_from_the_bottom_also_work(self):
        # Any order that finishes shorter ranges first works: i from n - 1 down, j from i + 1 up.
        def bottom_rows(piles):
            n = len(piles)
            prefix = module._prefix_sums(piles)
            dp = [[0] * n for _ in range(n)]
            for i in range(n - 1, -1, -1):
                for j in range(i + 1, n):
                    dp[i][j] = min(dp[i][k] + dp[k + 1][j] + prefix[j + 1] - prefix[i] for k in range(i, j))
            return dp[0][n - 1] if n else 0

        rng = random.Random(2000)
        for _ in range(200):
            piles = random_piles(rng, 10, 50)
            self.assertEqual(bottom_rows(piles), merge_piles(piles))


class TestEdgeCases(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(merge_piles([]), 0)
        self.assertEqual(merge_piles_plan([]), (0, []))
        self.assertEqual(merge_piles_memo([]), 0)
        self.assertEqual(burst_balloons([]), 0)
        self.assertEqual(min_palindrome_cuts(""), 0)

    def test_one_element(self):
        self.assertEqual(merge_piles([7]), 0)
        self.assertEqual(merge_piles_plan([7]), (0, []))
        self.assertEqual(merge_piles_memo([7]), 0)
        self.assertEqual(burst_balloons([7]), 7)
        self.assertEqual(min_palindrome_cuts("x"), 0)

    def test_two_elements(self):
        self.assertEqual(merge_piles_plan([4, 9]), (13, [(0, 0, 1)]))
        self.assertEqual(merge_piles_memo([4, 9]), 13)
        self.assertEqual(burst_balloons([4, 9]), 4 * 9 + 9)  # the smaller one first
        self.assertEqual(min_palindrome_cuts("ab"), 1)
        self.assertEqual(min_palindrome_cuts("aa"), 0)

    def test_all_equal(self):
        self.assertEqual(merge_piles([5] * 8), 5 * 24)
        self.assertEqual(burst_balloons([2, 2, 2, 2]), 8 + 8 + 4 + 2)
        self.assertEqual(min_palindrome_cuts("aaaaaa"), 0)

    def test_zeros(self):
        self.assertEqual(merge_piles([0, 0, 0]), 0)
        self.assertEqual(burst_balloons([0, 0]), 0)
        self.assertEqual(burst_balloons([0, 5, 0]), 5)

    def test_negative_values_are_rejected(self):
        for fn in (merge_piles, merge_piles_plan, merge_piles_memo, burst_balloons):
            with self.assertRaises(ValueError, msg=fn.__name__):
                fn([3, -1, 2])

    def test_inputs_are_not_modified(self):
        piles = list(PILES)
        merge_piles_plan(piles)
        merge_piles_memo(piles)
        burst_balloons(piles)
        self.assertEqual(piles, PILES)

    def test_large_values_are_exact(self):
        # 2^63 does not fit in a signed 64-bit integer; Python's integers do not overflow (C++ and
        # Go raise their overflow error here and return 2^63 - 1 one step below).
        self.assertEqual(merge_piles([2 ** 62, 2 ** 62]), 2 ** 63)
        self.assertEqual(merge_piles([2 ** 62, 2 ** 62 - 1]), 2 ** 63 - 1)
        # The split after pile 1 would cost 2^63 + 1, but the minimum, after pile 0, fits.
        self.assertEqual(merge_piles_plan([2 ** 62, 0, 1]), (2 ** 62 + 2, [(1, 1, 2), (0, 0, 2)]))
        self.assertEqual(burst_balloons([3037000499, 3037000499]), 9223372033963249500)
        self.assertEqual(burst_balloons([3037000500, 3037000500]), 9223372040037250500)
        self.assertEqual(burst_balloons([2 ** 63 - 1]), 2 ** 63 - 1)

    def test_bytes_and_code_points(self):
        # A str is compared by code point; C++ and Go compare the UTF-8 bytes and return 3 here.
        self.assertEqual(min_palindrome_cuts(ACCENTED), 0)
        self.assertEqual(min_palindrome_cuts(ACCENTED.encode("utf-8")), 3)

    def test_longer_inputs(self):
        self.assertEqual(merge_piles([1] * 64), 64 * 6)
        self.assertEqual(min_palindrome_cuts("ab" * 30), 1)


class TestOperationCounts(unittest.TestCase):
    """The loops make exactly the number of candidates their bounds give, and no more."""

    def test_merge_piles(self):
        calls = spy_calls(self, "_try_split")
        for n in range(0, 26):
            for fn in (merge_piles, merge_piles_memo, merge_piles_plan):
                calls.clear()
                fn([1] * n)
                # sum over lengths L of (n - L + 1) ranges times (L - 1) splits = (n^3 - n) / 6
                self.assertEqual(len(calls), (n ** 3 - n) // 6, (fn.__name__, n))

    def test_every_range_and_split_once(self):
        calls = spy_calls(self, "_try_split")
        n = 9
        merge_piles(list(range(n)))
        self.assertEqual(sorted(calls), sorted((i, k, j) for i in range(n) for j in range(i + 1, n) for k in range(i, j)))
        lengths = [j - i + 1 for i, _, j in calls]
        self.assertEqual(lengths, sorted(lengths), "shorter ranges first")

    def test_burst_balloons(self):
        calls = spy_calls(self, "_try_last")
        for n in range(0, 22):
            calls.clear()
            burst_balloons([1] * n)
            # (n + 2) boundaries: sum over gaps g of (n + 2 - g) pairs times (g - 1) choices
            self.assertEqual(len(calls), n * (n + 1) * (n + 2) // 6, n)

    def test_min_palindrome_cuts(self):
        calls = spy_calls(self, "_try_cut")
        rng = random.Random(131)
        for _ in range(200):
            s = "".join(rng.choice("abc") for _ in range(rng.randint(0, 14)))
            calls.clear()
            min_palindrome_cuts(s)
            # Only a range that is not a palindrome tries its j - i cuts.
            want = sum(j - i for i in range(len(s)) for j in range(i + 1, len(s)) if s[i:j + 1] != s[i:j + 1][::-1])
            self.assertEqual(len(calls), want, s)
        for n in range(0, 20):
            calls.clear()
            min_palindrome_cuts("".join(chr(65 + t) for t in range(n)))  # no palindrome longer than 1
            self.assertEqual(len(calls), (n ** 3 - n) // 6)
            calls.clear()
            min_palindrome_cuts("a" * n)  # every range is a palindrome
            self.assertEqual(len(calls), 0)

    def test_work_grows_as_n_cubed(self):
        calls = spy_calls(self, "_try_split")
        counts = []
        for n in (10, 20, 40, 80):
            calls.clear()
            merge_piles([1] * n)
            counts.append(len(calls))
        self.assertEqual(counts, [165, 1330, 10660, 85320])


if __name__ == "__main__":
    unittest.main()
