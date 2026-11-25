"""
Tests for unbounded_knapsack: the one-row table going up and going down, the multiset read
back from choice[], the 2D table, the two counts, the edge cases and the work done.
"""

import random
import unittest
from itertools import product

import unbounded_knapsack as module
from unbounded_knapsack import (
    count_combinations,
    count_permutations,
    unbounded_knapsack,
    unbounded_knapsack_items,
    unbounded_knapsack_table,
    zero_one_knapsack,
)

# The items of the 0/1 Knapsack topic: (weight, value) = (1, 1), (3, 4), (4, 5), (5, 7).
WEIGHTS, VALUES = [1, 3, 4, 5], [1, 4, 5, 7]


def brute_unbounded(weights, values, capacity):
    """Every multiset that fits: up to capacity // weight copies of each item."""
    best = 0
    ranges = [range(capacity // w + 1) for w in weights]
    for copies in product(*ranges):
        if sum(c * w for c, w in zip(copies, weights)) <= capacity:
            best = max(best, sum(c * v for c, v in zip(copies, values)))
    return best


def brute_zero_one(weights, values, capacity):
    """Every subset that fits."""
    best = 0
    for mask in range(1 << len(weights)):
        chosen = [i for i in range(len(weights)) if mask >> i & 1]
        if sum(weights[i] for i in chosen) <= capacity:
            best = max(best, sum(values[i] for i in chosen))
    return best


def brute_combinations(weights, target):
    """Multisets by item position whose weights add up to target."""
    ranges = [range(target // w + 1) for w in weights]
    return sum(1 for copies in product(*ranges) if sum(c * w for c, w in zip(copies, weights)) == target)


def brute_permutations(weights, target):
    """Sequences of items whose weights add up to target, by recursion on the first item."""
    if target == 0:
        return 1
    return sum(brute_permutations(weights, target - w) for w in weights if w <= target)


def random_items(rng, max_items, max_weight, max_value, max_capacity):
    n = rng.randint(0, max_items)
    weights = [rng.randint(1, max_weight) for _ in range(n)]
    values = [rng.randint(0, max_value) for _ in range(n)]
    return weights, values, rng.randint(0, max_capacity)


class TestWorkedExample(unittest.TestCase):
    def test_value_and_items(self):
        # Item 3 (weight 5, value 7) twice: weight 10, value 14.
        self.assertEqual(unbounded_knapsack(WEIGHTS, VALUES, 10), 14)
        self.assertEqual(unbounded_knapsack_items(WEIGHTS, VALUES, 10), (14, [0, 0, 0, 2]))

    def test_each_item_once_gives_less(self):
        # Going down, item 3 is taken once: the best subset is items 0, 2 and 3, value 13.
        self.assertEqual(zero_one_knapsack(WEIGHTS, VALUES, 10), 13)
        self.assertEqual(brute_zero_one(WEIGHTS, VALUES, 10), 13)

    def test_at_capacity_7_reuse_does_not_help(self):
        # The 0/1 Knapsack topic's example: both directions give 9.
        self.assertEqual(unbounded_knapsack(WEIGHTS, VALUES, 7), 9)
        self.assertEqual(zero_one_knapsack(WEIGHTS, VALUES, 7), 9)
        self.assertEqual(unbounded_knapsack_items(WEIGHTS, VALUES, 7), (9, [1, 2, 0, 0]))

    def test_every_capacity(self):
        want = [0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14]
        self.assertEqual([unbounded_knapsack(WEIGHTS, VALUES, w) for w in range(11)], want)
        self.assertEqual(module._fill_row(WEIGHTS, VALUES, 10, upward=True), (want, [-1, 0, 0, 1, 1, 3, 1, 1, 3, 1, 3]))

    def test_table(self):
        self.assertEqual(unbounded_knapsack_table(WEIGHTS, VALUES, 10), [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13],
            [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13],
            [0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14],
        ])

    def test_relaxations_in_order(self):
        # Every dp[w] = max(dp[w], dp[w - weight] + value) as (item, w, old dp[w], candidate).
        calls = []
        real = module._relax

        def spy(dp, choice, item, w, rest, value):
            calls.append((item, w, dp[w], dp[rest] + value))
            real(dp, choice, item, w, rest, value)

        module._relax = spy
        self.addCleanup(setattr, module, "_relax", real)
        unbounded_knapsack(WEIGHTS, VALUES, 10)
        self.assertEqual(len(calls), 10 + 8 + 7 + 6)
        self.assertEqual(calls[10:18], [(1, w, w, c) for w, c in zip(range(3, 11), [4, 5, 6, 8, 9, 10, 12, 13])])
        self.assertEqual(calls[-6:], [(3, 5, 6, 7), (3, 6, 8, 8), (3, 7, 9, 9), (3, 8, 10, 11), (3, 9, 12, 12), (3, 10, 13, 14)])


class TestLoopDirection(unittest.TestCase):
    def test_one_item_reused_or_not(self):
        # Weight 2, value 3, capacity 4: going up takes it twice, going down once.
        self.assertEqual(unbounded_knapsack([2], [3], 4), 6)
        self.assertEqual(zero_one_knapsack([2], [3], 4), 3)

    def test_upward_matches_brute_force(self):
        rng = random.Random(20261124)
        for _ in range(600):
            weights, values, capacity = random_items(rng, 4, 8, 20, 20)
            self.assertEqual(unbounded_knapsack(weights, values, capacity), brute_unbounded(weights, values, capacity), (weights, values, capacity))

    def test_downward_is_the_zero_one_knapsack(self):
        rng = random.Random(416)
        for _ in range(600):
            weights, values, capacity = random_items(rng, 7, 10, 30, 25)
            self.assertEqual(zero_one_knapsack(weights, values, capacity), brute_zero_one(weights, values, capacity), (weights, values, capacity))

    def test_downward_never_beats_upward(self):
        rng = random.Random(1158)
        for _ in range(300):
            weights, values, capacity = random_items(rng, 6, 10, 30, 30)
            self.assertLessEqual(zero_one_knapsack(weights, values, capacity), unbounded_knapsack(weights, values, capacity))

    def test_the_cell_read_holds_the_item_only_going_up(self):
        # Going up, dp[w - weight] can already have been raised by the same item in this pass;
        # going down it never has, because w - weight is visited after w.
        for upward in (True, False):
            raised_in_pass = []
            reads_of_own_item = []
            real = module._relax

            def spy(dp, choice, item, w, rest, value):
                if (item, rest) in raised_in_pass:
                    reads_of_own_item.append((item, w))
                before = dp[w]
                real(dp, choice, item, w, rest, value)
                if dp[w] != before:
                    raised_in_pass.append((item, w))

            module._relax = spy
            try:
                module._fill_row(WEIGHTS, VALUES, 10, upward)
            finally:
                module._relax = real
            if upward:
                self.assertIn((3, 10), reads_of_own_item)  # dp[10] reads dp[5], raised by item 3
            else:
                self.assertEqual(reads_of_own_item, [])


class TestReconstruction(unittest.TestCase):
    def assert_valid(self, weights, values, capacity):
        value, counts = unbounded_knapsack_items(weights, values, capacity)
        self.assertEqual(value, unbounded_knapsack(weights, values, capacity))
        self.assertEqual(len(counts), len(weights))
        self.assertTrue(all(c >= 0 for c in counts))
        self.assertEqual(sum(c * v for c, v in zip(counts, values)), value, "the multiset reaches the value")
        self.assertLessEqual(sum(c * w for c, w in zip(counts, weights)), capacity, "the multiset fits")
        return counts

    def test_random_inputs(self):
        rng = random.Random(1449)
        for _ in range(800):
            self.assert_valid(*random_items(rng, 6, 12, 50, 40))

    def test_tie_rule_from_the_table(self):
        # choice[w] is the first item i whose prefix 0..i already reaches the best value for w,
        # and -1 when the best value is 0.
        rng = random.Random(322)
        for _ in range(400):
            weights, values, capacity = random_items(rng, 5, 6, 9, 18)
            table = unbounded_knapsack_table(weights, values, capacity)
            dp, choice = module._fill_row(weights, values, capacity, upward=True)
            n = len(weights)
            for w in range(capacity + 1):
                best = table[n][w]
                want = -1 if best == 0 else min(i for i in range(n) if table[i + 1][w] == best)
                self.assertEqual(choice[w], want, (weights, values, capacity, w))
                self.assertEqual(dp[w], best)

    def test_duplicates_keep_the_first(self):
        self.assertEqual(unbounded_knapsack_items([3, 3], [4, 4], 9), (12, [3, 0]))
        self.assertEqual(unbounded_knapsack_items([2, 4, 2], [3, 6, 3], 8), (12, [4, 0, 0]))
        # The later copy of an item never changes the value.
        self.assertEqual(unbounded_knapsack([1, 3, 4, 5, 5], [1, 4, 5, 7, 7], 10), 14)

    def test_pinned_ties(self):
        # 2 + 2 and 4 are both worth 6 at capacity 4; item 0 reaches it first.
        self.assertEqual(unbounded_knapsack_items([2, 4], [3, 6], 4), (6, [2, 0]))
        self.assertEqual(unbounded_knapsack_items([4, 2], [6, 3], 4), (6, [1, 0]))
        # Weight 3 + 3 (value 8) against 5 + 1 (value 8) at capacity 6.
        self.assertEqual(unbounded_knapsack_items(WEIGHTS, VALUES, 6), (8, [0, 2, 0, 0]))
        # The best within 7 does not fill 7: weight 6 is left at 6.
        self.assertEqual(unbounded_knapsack_items([3], [5], 7), (10, [2]))

    def test_walk_meets_items_in_non_increasing_order(self):
        rng = random.Random(1636)
        for _ in range(300):
            weights, values, capacity = random_items(rng, 6, 9, 30, 30)
            _, choice = module._fill_row(weights, values, capacity, upward=True)
            taken, w = [], capacity
            while choice[w] != -1:
                taken.append(choice[w])
                w -= weights[choice[w]]
            self.assertEqual(taken, sorted(taken, reverse=True))


class TestTable(unittest.TestCase):
    def test_one_row_after_item_i_is_row_i_plus_1(self):
        rng = random.Random(474)
        for _ in range(300):
            weights, values, capacity = random_items(rng, 6, 10, 40, 30)
            table = unbounded_knapsack_table(weights, values, capacity)
            self.assertEqual(len(table), len(weights) + 1)
            for i in range(len(weights) + 1):
                row, _ = module._fill_row(weights[:i], values[:i], capacity, upward=True)
                self.assertEqual(table[i], row)
            self.assertEqual(table[-1][capacity], unbounded_knapsack(weights, values, capacity))

    def test_rows_never_decrease(self):
        rng = random.Random(279)
        for _ in range(200):
            weights, values, capacity = random_items(rng, 5, 10, 40, 30)
            table = unbounded_knapsack_table(weights, values, capacity)
            for i, row in enumerate(table):
                self.assertEqual(row, sorted(row), "best within w never drops as w grows")
                if i:
                    self.assertTrue(all(a <= b for a, b in zip(table[i - 1], row)), "an extra item never hurts")


class TestEdgeCases(unittest.TestCase):
    def test_capacity_zero(self):
        self.assertEqual(unbounded_knapsack(WEIGHTS, VALUES, 0), 0)
        self.assertEqual(unbounded_knapsack_items(WEIGHTS, VALUES, 0), (0, [0, 0, 0, 0]))
        self.assertEqual(zero_one_knapsack(WEIGHTS, VALUES, 0), 0)
        self.assertEqual(unbounded_knapsack_table(WEIGHTS, VALUES, 0), [[0]] * 5)

    def test_no_items(self):
        self.assertEqual(unbounded_knapsack([], [], 10), 0)
        self.assertEqual(unbounded_knapsack_items([], [], 10), (0, []))
        self.assertEqual(zero_one_knapsack([], [], 10), 0)
        self.assertEqual(unbounded_knapsack_table([], [], 3), [[0, 0, 0, 0]])

    def test_items_heavier_than_capacity(self):
        self.assertEqual(unbounded_knapsack_items([8, 9], [100, 200], 7), (0, [0, 0]))
        self.assertEqual(unbounded_knapsack_items([8, 2], [100, 1], 7), (3, [0, 3]))
        self.assertEqual(zero_one_knapsack([8, 9], [100, 200], 7), 0)

    def test_one_item(self):
        self.assertEqual(unbounded_knapsack_items([3], [5], 3), (5, [1]))
        self.assertEqual(unbounded_knapsack_items([3], [5], 2), (0, [0]))
        self.assertEqual(unbounded_knapsack_items([1], [5], 6), (30, [6]))

    def test_values_zero_or_negative_are_never_taken(self):
        self.assertEqual(unbounded_knapsack_items([1, 2], [0, -3], 5), (0, [0, 0]))
        self.assertEqual(unbounded_knapsack_items([1, 2], [-1, 3], 5), (6, [0, 2]))
        self.assertEqual(zero_one_knapsack([1, 2], [-1, 3], 5), 3)

    def test_weight_zero_is_rejected(self):
        # Weight 0 with a positive value could be taken without end; every function refuses it.
        for weights, values in (([0], [5]), ([2, 0], [3, 0]), ([1, -2], [1, 1])):
            for fn in (unbounded_knapsack, unbounded_knapsack_items, unbounded_knapsack_table, zero_one_knapsack):
                with self.assertRaises(ValueError, msg=(fn.__name__, weights)):
                    fn(weights, values, 4)
        for fn in (count_combinations, count_permutations):
            with self.assertRaises(ValueError):
                fn([1, 0], 3)

    def test_bad_input_is_rejected(self):
        for fn in (unbounded_knapsack, unbounded_knapsack_items, unbounded_knapsack_table, zero_one_knapsack):
            with self.assertRaises(ValueError):
                fn([1, 2], [3], 4)  # lengths differ
            with self.assertRaises(ValueError):
                fn([1], [3], -1)  # negative capacity
        for fn in (count_combinations, count_permutations):
            with self.assertRaises(ValueError):
                fn([1, 2], -1)

    def test_inputs_are_not_modified(self):
        weights, values = list(WEIGHTS), list(VALUES)
        unbounded_knapsack_items(weights, values, 10)
        unbounded_knapsack_table(weights, values, 10)
        count_permutations(weights, 10)
        self.assertEqual((weights, values), (WEIGHTS, VALUES))

    def test_large_values_are_exact(self):
        # Two copies of 2^62 make 2^63, one more than a signed 64-bit integer holds; Python's
        # integers do not overflow (C++ and Go raise their overflow error here).
        self.assertEqual(unbounded_knapsack([1], [2 ** 62], 2), 2 ** 63)
        self.assertEqual(unbounded_knapsack([1], [10 ** 12], 100000), 10 ** 17)
        self.assertEqual(zero_one_knapsack([1], [2 ** 62], 2), 2 ** 62)

    def test_large_capacity(self):
        self.assertEqual(unbounded_knapsack_items([7, 10], [9, 13], 100000), (130000, [0, 10000]))


class TestCounts(unittest.TestCase):
    def test_coin_change_example(self):
        # Coins 1, 2 and 5 making 5: 4 combinations, 9 orders (as in the Coin Change topic).
        self.assertEqual(count_combinations([1, 2, 5], 5), 4)
        self.assertEqual(count_permutations([1, 2, 5], 5), 9)

    def test_against_brute_force(self):
        rng = random.Random(1635)
        for _ in range(500):
            weights = [rng.randint(1, 6) for _ in range(rng.randint(0, 4))]
            target = rng.randint(0, 14)
            self.assertEqual(count_combinations(weights, target), brute_combinations(weights, target), (weights, target))
            self.assertEqual(count_permutations(weights, target), brute_permutations(weights, target), (weights, target))

    def test_order_of_the_items_does_not_matter(self):
        rng = random.Random(377)
        for _ in range(200):
            weights = [rng.randint(1, 7) for _ in range(rng.randint(1, 5))]
            target = rng.randint(0, 30)
            shuffled = weights[:]
            rng.shuffle(shuffled)
            self.assertEqual(count_combinations(shuffled, target), count_combinations(weights, target))
            self.assertEqual(count_permutations(shuffled, target), count_permutations(weights, target))

    def test_edge_cases(self):
        self.assertEqual(count_combinations([], 0), 1)
        self.assertEqual(count_permutations([], 0), 1)
        self.assertEqual(count_combinations([], 5), 0)
        self.assertEqual(count_permutations([], 5), 0)
        self.assertEqual(count_combinations([3, 5], 0), 1)
        self.assertEqual(count_combinations([2, 4], 7), 0)
        self.assertEqual(count_permutations([2, 4], 7), 0)
        self.assertEqual(count_combinations([9], 4), 0)  # heavier than the target
        self.assertEqual(count_permutations([1], 50), 1)

    def test_duplicate_weights_are_different_items(self):
        # Items a and b both weigh 2: {a, a}, {a, b}, {b, b}; in order aa, ab, ba, bb.
        self.assertEqual(count_combinations([2, 2], 4), 3)
        self.assertEqual(count_permutations([2, 2], 4), 4)

    def test_permutations_of_1_and_2_are_fibonacci(self):
        fib = [0, 1]
        while len(fib) < 102:
            fib.append(fib[-1] + fib[-2])
        for target in range(0, 101):
            self.assertEqual(count_permutations([1, 2], target), fib[target + 1])
            self.assertEqual(count_combinations([1, 2], target), target // 2 + 1)
        # Past 2^63 - 1: exact here (C++ and Go raise their overflow error).
        self.assertEqual(count_permutations([1, 2], 91), 7540113804746346429)
        self.assertEqual(count_permutations([1, 2], 92), 12200160415121876738)
        self.assertGreater(count_permutations([1, 2], 92), 2 ** 63 - 1)


class TestOperationCounts(unittest.TestCase):
    """Each item costs W - weight + 1 relaxations, in either direction, and nothing more."""

    def setUp(self):
        self.calls = 0
        real = module._relax

        def counted(*args):
            self.calls += 1
            real(*args)

        module._relax = counted
        self.addCleanup(setattr, module, "_relax", real)

    def count(self, fn, weights, values, capacity):
        self.calls = 0
        fn(weights, values, capacity)
        return self.calls

    def test_exact_count(self):
        rng = random.Random(1634)
        for _ in range(300):
            weights, values, capacity = random_items(rng, 8, 30, 50, 60)
            want = sum(max(0, capacity - w + 1) for w in weights)
            self.assertEqual(self.count(unbounded_knapsack, weights, values, capacity), want)
            self.assertEqual(self.count(zero_one_knapsack, weights, values, capacity), want)
            self.assertEqual(self.count(unbounded_knapsack_items, weights, values, capacity), want)

    def test_heavy_items_cost_nothing(self):
        self.assertEqual(self.count(unbounded_knapsack, [11, 50, 3], [1, 1, 1], 10), 8)

    def test_work_grows_with_the_value_of_w(self):
        # Pseudo-polynomial: W written in one more bit doubles the work.
        counts = [self.count(unbounded_knapsack, WEIGHTS, VALUES, 1000 * 2 ** k) for k in range(5)]
        self.assertEqual(counts, [3991, 7991, 15991, 31991, 63991])


if __name__ == "__main__":
    unittest.main()
