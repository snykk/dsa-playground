"""
Test cases for Timsort
"""

import bisect
import platform
import random
import sys
import unittest

import timsort as module
from timsort import (
    MIN_GALLOP,
    MergeState,
    binary_insertion_sort,
    compute_minrun,
    count_run,
    gallop_left,
    gallop_right,
    invariants_hold,
    merge_at,
    reverse_range,
    timsort,
)


class Counted:
    """A value whose < counts the comparisons; tag is a payload that < ignores."""

    comparisons = 0
    __slots__ = ("key", "tag")

    def __init__(self, key, tag=None):
        self.key = key
        self.tag = tag

    def __lt__(self, other):
        Counted.comparisons += 1
        return self.key < other.key


def count(values, gallop=True, minrun=0):
    """Sort a copy of values; return (sorted keys, comparisons)."""
    Counted.comparisons = 0
    arr = [Counted(v) for v in values]
    timsort(arr, gallop, minrun)
    return [c.key for c in arr], Counted.comparisons


def tagged(values):
    """Each value with its index as the payload."""
    return [Counted(v, i) for i, v in enumerate(values)]


def lcg_values(seed, n, mod):
    """The pseudo-random arrays the C++ and Go tests rebuild (64-bit LCG, top bits)."""
    x = seed
    out = []
    for _ in range(n):
        x = (x * 6364136223846793005 + 1442695040888963407) % (1 << 64)
        out.append((x >> 33) % mod)
    return out


def pinned_input(seed, n, mod, drift, block):
    """lcg_values plus drift * index; with block > 0, every block of that many values is
    sorted, ascending in even blocks and descending in odd ones. C++ and Go rebuild it."""
    values = [v + drift * i for i, v in enumerate(lcg_values(seed, n, mod))]
    if block:
        for start in range(0, n, block):
            chunk = sorted(values[start:start + block])
            if (start // block) % 2:
                chunk.reverse()
            values[start:start + block] = chunk
    return values


def shapes(n, rng):
    """The structured inputs of the README, each a list of n integers."""
    half = n // 2
    blocks = sorted(rng.sample(range(1, n), 19)) if n > 20 else []
    cuts = [0] + blocks + [n]
    pieces = [list(range(cuts[i], cuts[i + 1])) for i in range(len(cuts) - 1)]
    rng.shuffle(pieces)
    few = rng.sample(range(n), n)
    quarter = max(1, n // 4)
    for s in range(0, n, quarter):
        few[s:s + quarter] = sorted(few[s:s + quarter])
    return {
        "random": rng.sample(range(n), n),
        "sorted": list(range(n)),
        "reversed": list(range(n, 0, -1)),
        "four runs": few,
        "sawtooth": [i % 100 for i in range(n)],
        "organ pipe": list(range(half)) + list(range(n - half, 0, -1)),
        "long runs": [v for piece in pieces for v in piece],
    }


# (seed, n, mod, drift, block, minrun, comparisons with galloping, without) computed by
# this module; the C++ and Go tests pin the same numbers.
PINNED = [
    (1, 0, 10, 0, 0, 0, 0, 0),
    (2, 1, 10, 0, 0, 0, 0, 0),
    (3, 2, 10, 0, 0, 0, 1, 1),
    (4, 5, 3, 0, 0, 0, 8, 8),
    (5, 12, 100, 0, 0, 4, 35, 35),
    (6, 16, 1000, 1, 4, 2, 39, 39),
    (7, 24, 4, 0, 0, 4, 91, 91),
    (8, 32, 1000, 50, 8, 4, 98, 98),
    (9, 63, 1000000, 0, 0, 0, 295, 295),
    (10, 64, 1000000, 0, 0, 0, 299, 299),
    (11, 65, 1000000, 0, 0, 0, 305, 305),
    (12, 100, 2, 0, 0, 0, 441, 453),
    (13, 128, 1000, 0, 32, 0, 491, 489),
    (14, 200, 1000, 5, 40, 0, 886, 884),
    (15, 255, 10, 0, 0, 0, 1564, 1637),
    (16, 256, 1000000, 0, 0, 0, 1716, 1716),
    (17, 300, 1000, 20, 100, 0, 730, 794),
    (18, 500, 1000000, 0, 0, 0, 3816, 3815),
    (19, 500, 1000, 0, 250, 0, 1955, 2147),
    (20, 640, 100, 3, 64, 0, 2196, 2289),
    (21, 1000, 1000000, 0, 0, 0, 8624, 8624),
    (22, 1000, 7, 0, 0, 0, 6285, 8040),
    (23, 1000, 1000000, 0, 77, 0, 4975, 4973),
    (24, 1000, 1000, 10, 50, 0, 4970, 5021),
    (25, 1000, 50, 1, 333, 0, 2695, 3145),
    (26, 1024, 1000000, 0, 0, 0, 8897, 8895),
    (27, 2000, 1000000, 0, 0, 0, 19269, 19264),
    (28, 2000, 1000, 100, 200, 0, 3028, 3439),
    (29, 2112, 1000000, 0, 0, 0, 20543, 20542),
    (30, 2500, 3, 0, 500, 0, 2769, 5709),
    (31, 3000, 1000000, 0, 1000, 0, 7990, 7992),
    (32, 3000, 1000000, 0, 0, 16, 31235, 31233),
    (33, 4096, 1000000, 0, 0, 0, 43833, 43830),
    (34, 4096, 100, 2, 128, 0, 12580, 14521),
    (35, 5000, 1000000, 0, 0, 0, 54951, 54948),
    (36, 5000, 1000, 1000, 5000, 0, 4999, 4999),
    (37, 5000, 1000000, 0, 0, 1, 58365, 58393),
    (38, 5000, 10, 0, 0, 0, 35244, 51217),
    (39, 6000, 1000, 50, 600, 0, 8705, 12877),
    (40, 8192, 1000000, 0, 0, 0, 95860, 95856),
]


class TestMinrun(unittest.TestCase):
    @staticmethod
    def cpython_formula(n):
        """listsort.txt: take the first 6 bits of n, and add 1 if any of the remaining bits are set."""
        if n < 64:
            return n
        shift = n.bit_length() - 6
        return (n >> shift) + (1 if n & ((1 << shift) - 1) else 0)

    def test_against_the_formula_for_every_n_up_to_70000(self):
        for n in range(70000):
            self.assertEqual(compute_minrun(n), self.cpython_formula(n), n)

    def test_large_n(self):
        rng = random.Random(64)
        for _ in range(2000):
            n = rng.randrange(1, 1 << 63)
            self.assertEqual(compute_minrun(n), self.cpython_formula(n), n)

    def test_known_values(self):
        """64 and every power of 2 above it give 32; 2112 gives 33 (listsort.txt's example)"""
        self.assertEqual([compute_minrun(n) for n in (0, 1, 5, 63)], [0, 1, 5, 63])
        for k in range(6, 63):
            self.assertEqual(compute_minrun(1 << k), 32)
        self.assertEqual(compute_minrun(65), 33)
        self.assertEqual(compute_minrun(100), 50)
        self.assertEqual(compute_minrun(1000), 63)
        self.assertEqual(compute_minrun(2112), 33)
        self.assertEqual(compute_minrun(10 ** 6), 62)

    def test_n_over_minrun_is_at_most_a_power_of_two(self):
        """From 64 on: 32 <= minrun <= 64 and (minrun - 1) * 2^s < n <= minrun * 2^s"""
        for n in range(64, 50000):
            m = compute_minrun(n)
            s = n.bit_length() - 6
            self.assertTrue(32 <= m <= 64, n)
            self.assertTrue((m - 1) << s < n <= m << s, n)


class TestRuns(unittest.TestCase):
    def test_count_run(self):
        cases = [
            ([5], (1, False)),
            ([1, 2], (2, False)),
            ([2, 1], (2, True)),
            ([2, 2], (2, False)),
            ([1, 2, 2, 3, 1], (4, False)),
            ([5, 4, 3, 3, 1], (3, True)),
            ([5, 4, 3, 2, 1], (5, True)),
            ([3, 3, 3, 2], (3, False)),
        ]
        for values, expected in cases:
            self.assertEqual(count_run(values, 0, len(values)), expected, values)
        self.assertEqual(count_run([9, 1, 2, 3, 0], 1, 5), (3, False))
        self.assertEqual(count_run([1, 2, 3, 4], 0, 2), (2, False))

    def test_count_run_comparisons(self):
        """length - 1 comparisons when the run reaches hi, length when a smaller element ends it"""
        Counted.comparisons = 0
        self.assertEqual(count_run(tagged(range(50)), 0, 50), (50, False))
        self.assertEqual(Counted.comparisons, 49)
        Counted.comparisons = 0
        self.assertEqual(count_run(tagged([3, 4, 5, 1]), 0, 4), (3, False))
        self.assertEqual(Counted.comparisons, 3)

    def test_descending_runs_are_strict_so_reversing_is_stable(self):
        arr = tagged([3, 2, 2, 1])
        n, descending = count_run(arr, 0, 4)
        self.assertEqual((n, descending), (2, True))
        arr = tagged([5, 4, 3, 3, 3, 1, 0])
        timsort(arr)
        self.assertEqual([(c.key, c.tag) for c in arr], [(0, 6), (1, 5), (3, 2), (3, 3), (3, 4), (4, 1), (5, 0)])

    def test_reverse_range(self):
        arr = [0, 1, 2, 3, 4, 5]
        reverse_range(arr, 1, 5)
        self.assertEqual(arr, [0, 4, 3, 2, 1, 5])
        reverse_range(arr, 2, 2)
        self.assertEqual(arr, [0, 4, 3, 2, 1, 5])

    def test_binary_insertion_sort(self):
        rng = random.Random(3)
        for _ in range(300):
            n = rng.randint(1, 40)
            start = rng.randint(0, n)
            values = [rng.randint(0, 9) for _ in range(n)]
            values[:start] = sorted(values[:start])
            arr = tagged(values)
            binary_insertion_sort(arr, 0, n, start)
            expected = sorted(tagged(values), key=lambda c: c.key)
            self.assertEqual([(c.key, c.tag) for c in arr], [(c.key, c.tag) for c in expected])

    def test_binary_insertion_sort_inside_a_larger_list(self):
        arr = [9, 9, 1, 4, 7, 3, 0, 9, 9]
        binary_insertion_sort(arr, 2, 7, 5)
        self.assertEqual(arr, [9, 9, 0, 1, 3, 4, 7, 9, 9])

    def test_binary_insertion_comparisons(self):
        """Inserting into k sorted elements takes floor(log2(k)) or ceil(log2(k + 1)) comparisons"""
        Counted.comparisons = 0
        arr = tagged(list(range(1, 16)) + [0])
        binary_insertion_sort(arr, 0, 16, 15)
        self.assertEqual(Counted.comparisons, 4)
        self.assertEqual([c.key for c in arr], list(range(16)))


class TestGallop(unittest.TestCase):
    def test_against_bisect_for_every_hint(self):
        rng = random.Random(5)
        for _ in range(300):
            n = rng.randint(1, 40)
            a = sorted(rng.randint(0, 15) for _ in range(n))
            base_pad = rng.randint(0, 3)
            padded = [-1] * base_pad + a + [99] * 2
            for key in range(-1, 17):
                for hint in range(n):
                    self.assertEqual(gallop_left(key, padded, base_pad, n, hint), bisect.bisect_left(a, key))
                    self.assertEqual(gallop_right(key, padded, base_pad, n, hint), bisect.bisect_right(a, key))

    def test_cost_is_logarithmic_in_the_distance(self):
        """From hint 0, position i costs 2 floor(log2(i)) + 2 comparisons (listsort.txt's table)"""
        a = tagged([2 * i for i in range(4096)])
        for i in range(0, 2048):
            for search in (gallop_left, gallop_right):
                Counted.comparisons = 0
                self.assertEqual(search(Counted(2 * i - 1), a, 0, 4096, 0), i)
                expected = 1 if i == 0 else 2 * (i.bit_length() - 1) + 2
                self.assertEqual(Counted.comparisons, expected, (search.__name__, i))

    def test_ties(self):
        a = [1, 3, 3, 3, 5]
        self.assertEqual([gallop_left(3, a, 0, 5, h) for h in range(5)], [1] * 5)
        self.assertEqual([gallop_right(3, a, 0, 5, h) for h in range(5)], [4] * 5)


class TestTimsort(unittest.TestCase):
    CASES = [
        [],
        [42],
        [2, 1],
        [1, 2],
        [64, 34, 25, 12, 22, 11, 90],
        [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
        [5, 5, 5, 5, 5, 5],
        [3, -1, 3, 0, -1, 2, 2],
        list(range(100)),
        list(range(100, 0, -1)),
    ]

    def test_cases(self):
        for values in self.CASES:
            for minrun in (0, 1, 2, 4, 32):
                arr = list(values)
                result = timsort(arr, minrun=minrun)
                self.assertIs(result, arr)
                self.assertEqual(result, sorted(values), (values, minrun))

    def test_other_comparable_types(self):
        self.assertEqual(timsort([2.5, -1.0, 2.5, 0.0, 1e9]), [-1.0, 0.0, 2.5, 2.5, 1e9])
        words = ["pear", "fig", "apple", "kiwi", "date", "plum", "fig"]
        self.assertEqual(timsort(list(words)), sorted(words))

    def test_negative_minrun_raises_value_error(self):
        for bad in (-1, -64):
            with self.assertRaises(ValueError):
                timsort([3, 1, 2], minrun=bad)
        with self.assertRaises(ValueError):
            timsort([], minrun=-1)

    def test_incomparable_items_raise_type_error(self):
        with self.assertRaises(TypeError):
            timsort([1, "a", 2])

    def test_random_arrays_against_sorted_with_payload(self):
        """sorted() is stable: equal keys must keep their input order here too"""
        rng = random.Random(20261124)
        for trial in range(1500):
            n = rng.choice([rng.randint(0, 70), rng.randint(64, 700), rng.randint(700, 3000)])
            spread = rng.choice([1, 3, 10, 1000, 10 ** 9])
            values = [rng.randint(0, spread) for _ in range(n)]
            gallop = trial % 2 == 0
            minrun = rng.choice([0, 0, 0, 1, 3, 8])
            arr = tagged(values)
            timsort(arr, gallop, minrun)
            expected = sorted(tagged(values), key=lambda c: c.key)
            self.assertEqual([(c.key, c.tag) for c in arr], [(c.key, c.tag) for c in expected], (n, spread, minrun))

    def test_structured_inputs_with_payload(self):
        rng = random.Random(7)
        for n in (0, 1, 2, 3, 63, 64, 65, 1000, 4097, 20000):
            for name, values in shapes(n, rng).items():
                for dups in (False, True):
                    keys = [v // 7 for v in values] if dups else values
                    for gallop in (True, False):
                        arr = tagged(keys)
                        timsort(arr, gallop)
                        expected = sorted(tagged(keys), key=lambda c: c.key)
                        self.assertEqual([c.tag for c in arr], [c.tag for c in expected], (name, n, dups, gallop))

    def test_galloping_on_and_off_give_the_same_output(self):
        rng = random.Random(11)
        for n in (100, 1000, 5000):
            for name, values in shapes(n, rng).items():
                keys = [v // 3 for v in values]
                on, off = tagged(keys), tagged(keys)
                timsort(on, True)
                timsort(off, False)
                self.assertEqual([c.tag for c in on], [c.tag for c in off], (name, n))


class TestComparisonCounts(unittest.TestCase):
    def test_sorted_input_takes_n_minus_1(self):
        for n in list(range(1, 130)) + [1000, 4096, 65537, 100000]:
            self.assertEqual(count(range(n))[1], n - 1, n)
            self.assertEqual(count([5] * n)[1], n - 1, n)

    def test_strictly_descending_input_takes_n_minus_1(self):
        for n in list(range(1, 130)) + [1000, 4096, 65537, 100000]:
            result, comparisons = count(range(n, 0, -1))
            self.assertEqual(result, list(range(1, n + 1)))
            self.assertEqual(comparisons, n - 1, n)

    def test_short_lists_cost_nothing(self):
        self.assertEqual(count([]), ([], 0))
        self.assertEqual(count([7]), ([7], 0))

    def test_worst_case_stays_below_n_log2_n(self):
        rng = random.Random(9)
        for n in (100, 1000, 10000):
            values = rng.sample(range(n), n)
            comparisons = count(values)[1]
            self.assertLess(comparisons, n * (n.bit_length()))

    def test_galloping_saves_comparisons_on_long_runs(self):
        """Long runs whose values do not interleave: galloping moves whole blocks"""
        rng = random.Random(12)
        for n in (2000, 20000):
            values = shapes(n, rng)["long runs"]
            with_gallop = count(values, True)[1]
            without = count(values, False)[1]
            self.assertLess(with_gallop * 2, without, n)

    def test_galloping_costs_little_on_random_input(self):
        """Random data rarely triggers it, and min_gallop rises when it does not pay"""
        rng = random.Random(13)
        for n in (2000, 20000):
            values = rng.sample(range(n), n)
            with_gallop = count(values, True)[1]
            without = count(values, False)[1]
            self.assertLess(abs(with_gallop - without), without // 100)

    def test_pinned_counts(self):
        """The table the C++ and Go tests pin: regenerate it here if the code changes"""
        for seed, n, mod, drift, block, minrun, on, off in PINNED:
            values = pinned_input(seed, n, mod, drift, block)
            result, c_on = count(values, True, minrun)
            self.assertEqual(result, sorted(values))
            self.assertEqual(count(values, False, minrun)[1], off, (seed, n))
            self.assertEqual(c_on, on, (seed, n))

    @unittest.skipUnless(
        platform.python_implementation() == "CPython" and sys.version_info < (3, 11),
        "list.sort() uses this merge policy only up to CPython 3.10",
    )
    def test_same_comparisons_as_list_sort(self):
        """On CPython 3.10 and earlier, list.sort() makes exactly these comparisons"""
        rng = random.Random(21)
        for n in (0, 1, 2, 50, 64, 65, 300, 2112, 5000):
            for values in list(shapes(n, rng).values()) + [[rng.randint(0, 5) for _ in range(n)]]:
                ours = tagged(values)
                theirs = tagged(values)
                Counted.comparisons = 0
                theirs.sort()
                expected = Counted.comparisons
                Counted.comparisons = 0
                timsort(ours)
                self.assertEqual(Counted.comparisons, expected, n)
                self.assertEqual([c.tag for c in ours], [c.tag for c in theirs])


class TestMergeStack(unittest.TestCase):
    """Wraps the module-level merge_collapse and merge_at to look at the stack."""

    def setUp(self):
        self.stacks = []
        self.merges = 0
        real_collapse, real_merge_at = module.merge_collapse, module.merge_at

        def collapse(ms):
            self.check_sorted(ms, len(ms.pending) - 1)  # the run just pushed
            real_collapse(ms)
            self.stacks.append([length for _, length in ms.pending])
            self.check_side_by_side(ms)

        def merge(ms, i):
            real_merge_at(ms, i)
            self.merges += 1
            self.check_sorted(ms, i)
            self.check_side_by_side(ms)

        module.merge_collapse = collapse
        module.merge_at = merge
        self.addCleanup(setattr, module, "merge_collapse", real_collapse)
        self.addCleanup(setattr, module, "merge_at", real_merge_at)

    def check_sorted(self, ms, i):
        base, length = ms.pending[i]
        run = ms.arr[base:base + length]
        self.assertTrue(all(not run[k + 1] < run[k] for k in range(length - 1)))

    def check_side_by_side(self, ms):
        """The runs on the stack lie side by side from index 0."""
        expected_base = 0
        for base, length in ms.pending:
            self.assertEqual(base, expected_base)
            expected_base += length

    def test_invariants_hold_after_every_collapse(self):
        rng = random.Random(17)
        for n in (100, 1000, 5000, 30000):
            for name, values in shapes(n, rng).items():
                for minrun in (0, 1, 2, 5):
                    self.stacks.clear()
                    timsort(list(values), minrun=minrun)
                    for stack in self.stacks:
                        self.assertTrue(invariants_hold(stack), (name, n, minrun, stack))

    def test_stack_stays_logarithmic(self):
        """Fibonacci growth: with runs of at least 1, the stack never holds more than
        log_phi(n) + 2 runs"""
        rng = random.Random(19)
        for n in (1000, 30000):
            for minrun in (1, 2):
                self.stacks.clear()
                values = [rng.randint(0, 3) for _ in range(n)]
                timsort(values, minrun=minrun)
                height = max(len(s) for s in self.stacks)
                bound = 2
                fib_a, fib_b = 1, 1
                while fib_b <= n:
                    fib_a, fib_b = fib_b, fib_a + fib_b
                    bound += 1
                self.assertLessEqual(height, bound)

    def test_one_run_means_no_merge(self):
        timsort(list(range(5000)))
        self.assertEqual(self.merges, 0)
        timsort(list(range(5000, 0, -1)))
        self.assertEqual(self.merges, 0)

    def test_the_three_run_check_breaks_the_invariant(self):
        """Runs of 240, 160, 50, 40, 60: the pre-2015 rule leaves 240, 160, 90, 60"""
        lengths = [240, 160, 50, 40, 60]
        values = []
        for j, length in enumerate(lengths):
            values += range((5 - j) * 1000, (5 - j) * 1000 + length)
        self.assertEqual(compute_minrun(len(values)), 35)

        def original_collapse(ms):
            # The rule before the 2015 fix: only A, B and C are checked.
            p = ms.pending
            while len(p) > 1:
                n = len(p) - 2
                if n > 0 and p[n - 1][1] <= p[n][1] + p[n + 1][1]:
                    if p[n - 1][1] < p[n + 1][1]:
                        n -= 1
                    module.merge_at(ms, n)
                elif p[n][1] <= p[n + 1][1]:
                    module.merge_at(ms, n)
                else:
                    break

        def recorded_original(ms):
            original_collapse(ms)
            self.stacks.append([length for _, length in ms.pending])

        corrected = module.merge_collapse  # setUp's recording wrapper around the real one
        for collapse, last in ((recorded_original, [240, 160, 90, 60]), (corrected, [550])):
            self.stacks.clear()
            module.merge_collapse = collapse
            arr = list(values)
            timsort(arr)
            self.assertEqual(arr, sorted(values))
            self.assertEqual(self.stacks[:4], [[240], [240, 160], [240, 160, 50], [240, 160, 50, 40]])
            self.assertEqual(self.stacks[4], last)
            # 240 <= 160 + 90 breaks the invariant; the corrected rule merged down to one run.
            self.assertEqual(invariants_hold(self.stacks[4]), collapse is corrected)


class TestMerges(unittest.TestCase):
    def merge_two(self, left, right, gallop=True):
        arr = tagged(left + right)
        ms = MergeState(arr, gallop)
        ms.pending = [(0, len(left)), (len(left), len(right))]
        merge_at(ms, 0)
        return arr, ms

    def test_merge_lo_and_merge_hi_are_stable(self):
        rng = random.Random(23)
        for _ in range(2000):
            left = sorted(rng.randint(0, 6) for _ in range(rng.randint(1, 30)))
            right = sorted(rng.randint(0, 6) for _ in range(rng.randint(1, 30)))
            for gallop in (True, False):
                arr, ms = self.merge_two(left, right, gallop)
                expected = sorted(tagged(left + right), key=lambda c: c.key)
                self.assertEqual([(c.key, c.tag) for c in arr], [(c.key, c.tag) for c in expected])
                self.assertEqual(ms.pending, [(0, len(left) + len(right))])

    def test_trimming_skips_what_is_in_place(self):
        """[1..5] + [6..10] is in order: the first search finds all of A in 4 comparisons"""
        Counted.comparisons = 0
        arr, _ = self.merge_two([1, 2, 3, 4, 5], [6, 7, 8, 9, 10])
        self.assertEqual(Counted.comparisons, 4)
        self.assertEqual([c.key for c in arr], list(range(1, 11)))
        # [1, 5, 9] + [2, 3, 10]: 1 and 10 are already in place; 5, 9 and 2, 3 are merged.
        Counted.comparisons = 0
        arr, _ = self.merge_two([1, 5, 9], [2, 3, 10])
        self.assertEqual([c.key for c in arr], [1, 2, 3, 5, 9, 10])

    def test_min_gallop_adapts(self):
        """It falls to 1 while galloping pays and rises above MIN_GALLOP on random data"""
        self.assertEqual(MIN_GALLOP, 7)
        # Blocks of 10 and 90 values take turns: every block is a long winning streak.
        left = [k * 100 + j for k in range(20) for j in range(10)]
        right = [k * 100 + 10 + j for k in range(20) for j in range(90)]
        for a, b in ((left, right), (right, left)):  # merge_lo, then merge_hi
            Counted.comparisons = 0
            _, ms = self.merge_two(a, b)
            with_gallop = Counted.comparisons
            self.assertEqual(ms.min_gallop, 1)
            Counted.comparisons = 0
            _, ms = self.merge_two(a, b, gallop=False)
            self.assertEqual(ms.min_gallop, MIN_GALLOP)
            self.assertLess(with_gallop * 4, Counted.comparisons)
        rng = random.Random(29)
        for _ in range(5):
            a = sorted(rng.sample(range(10 ** 6), 3000))
            b = sorted(rng.sample(range(10 ** 6), 3000))
            _, ms = self.merge_two(a, b)
            self.assertGreater(ms.min_gallop, MIN_GALLOP)


if __name__ == "__main__":
    unittest.main()
