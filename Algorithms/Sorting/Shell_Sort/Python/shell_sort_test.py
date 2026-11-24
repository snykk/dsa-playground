"""
Test cases for Shell Sort
"""

import random
import unittest
from fractions import Fraction

import shell_sort as module
from shell_sort import (
    CIURA,
    CIURA_GAPS,
    DEFAULT_SEQUENCE,
    KNUTH,
    SEQUENCES,
    SHELL,
    ciura_gaps,
    gap_sequence,
    h_sort,
    knuth_gaps,
    shell_gaps,
    shell_sort,
)

EXAMPLE = [98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38]


class Counted:
    """A value whose > counts comparisons, and shifts (the comparisons that return True).

    h_sort shifts an element exactly when arr[j - gap] > key is True, so the
    two counters are the comparisons and the moves of the sort.
    """

    comparisons = 0
    shifts = 0
    __slots__ = ("value",)

    def __init__(self, value):
        self.value = value

    def __gt__(self, other):
        Counted.comparisons += 1
        result = self.value > other.value
        if result:
            Counted.shifts += 1
        return result


def count(values, sequence=DEFAULT_SEQUENCE):
    """Sort a copy of values; return (sorted values, comparisons, shifts)."""
    Counted.comparisons = Counted.shifts = 0
    arr = [Counted(v) for v in values]
    shell_sort(arr, sequence)
    return [c.value for c in arr], Counted.comparisons, Counted.shifts


def lcg_values(seed, n, mod):
    """The pseudo-random arrays the C++ and Go tests rebuild (64-bit LCG, top bits)."""
    x = seed
    out = []
    for _ in range(n):
        x = (x * 6364136223846793005 + 1442695040888963407) % (1 << 64)
        out.append((x >> 33) % mod)
    return out


def bad_input(n):
    """Shell's classic bad case for n a power of 2: 1, n/2 + 1, 2, n/2 + 2, ...

    The small half sits at even indices and the large half at odd ones. Every
    gap but the last is even, so no pass compares an even index with an odd one,
    and the final gap-1 pass is left with n(n - 2)/8 inversions.
    """
    half = n // 2
    out = []
    for i in range(half):
        out += [i + 1, half + i + 1]
    return out


# (seed, n, mod, sequence, comparisons, shifts) computed by this module; the C++ and
# Go tests pin the same numbers.
PINNED = [
    (1, 0, 10, SHELL, 0, 0),
    (2, 1, 10, CIURA, 0, 0),
    (3, 2, 10, KNUTH, 1, 1),
    (4, 5, 3, CIURA, 6, 2),
    (5, 7, 100, SHELL, 15, 7),
    (6, 9, 5, KNUTH, 15, 6),
    (7, 12, 1000, CIURA, 32, 16),
    (8, 16, 4, SHELL, 53, 6),
    (9, 20, 1000, KNUTH, 79, 45),
    (10, 24, 1000, CIURA, 92, 45),
    (11, 31, 2, SHELL, 105, 15),
    (12, 33, 50, KNUTH, 131, 66),
    (13, 40, 1000, CIURA, 229, 123),
    (14, 50, 7, SHELL, 285, 98),
    (15, 64, 1000, KNUTH, 386, 217),
    (16, 64, 1000, CIURA, 386, 184),
    (17, 64, 1000, SHELL, 486, 191),
    (18, 100, 100, CIURA, 676, 310),
    (19, 127, 1000000, KNUTH, 957, 564),
    (20, 128, 3, SHELL, 907, 172),
    (21, 200, 1000000, CIURA, 1859, 977),
    (22, 255, 10, KNUTH, 1679, 674),
    (23, 256, 1000000, SHELL, 3435, 1763),
    (24, 300, 1000000, CIURA, 2980, 1550),
    (25, 500, 1000000, KNUTH, 5693, 3436),
    (26, 500, 1000000, SHELL, 6145, 2898),
    (27, 701, 1000000, CIURA, 8359, 4304),
    (28, 702, 1000000, CIURA, 8622, 4584),
    (29, 1000, 1000000, SHELL, 14858, 7372),
    (30, 1000, 1000000, KNUTH, 14370, 9348),
    (31, 1000, 1000000, CIURA, 13104, 6783),
    (32, 1000, 2, CIURA, 7247, 610),
    (33, 1578, 1000000, CIURA, 22481, 11861),
    (34, 2000, 1000000, SHELL, 34406, 17379),
    (35, 2000, 1000000, KNUTH, 33207, 21781),
    (36, 2000, 1000000, CIURA, 29947, 15689),
    (37, 4096, 1000000, SHELL, 182694, 139731),
    (38, 4096, 1000000, KNUTH, 79480, 53326),
    (39, 4096, 1000000, CIURA, 68653, 35909),
    (40, 5000, 100, CIURA, 68396, 26992),
]


class TestGapSequences(unittest.TestCase):
    def test_shell_gaps(self):
        self.assertEqual(shell_gaps(0), [])
        self.assertEqual(shell_gaps(1), [])
        self.assertEqual(shell_gaps(2), [1])
        self.assertEqual(shell_gaps(5), [2, 1])
        self.assertEqual(shell_gaps(12), [6, 3, 1])
        self.assertEqual(shell_gaps(16), [8, 4, 2, 1])
        self.assertEqual(shell_gaps(100), [50, 25, 12, 6, 3, 1])

    def test_knuth_gaps(self):
        self.assertEqual(knuth_gaps(1), [])
        self.assertEqual(knuth_gaps(4), [1])
        self.assertEqual(knuth_gaps(5), [4, 1])
        self.assertEqual(knuth_gaps(13), [4, 1])
        self.assertEqual(knuth_gaps(14), [13, 4, 1])
        self.assertEqual(knuth_gaps(100), [40, 13, 4, 1])
        self.assertEqual(knuth_gaps(100000), [88573, 29524, 9841, 3280, 1093, 364, 121, 40, 13, 4, 1])
        for h in knuth_gaps(10 ** 9):
            k = 0
            while (3 ** k - 1) // 2 < h:
                k += 1
            self.assertEqual(h, (3 ** k - 1) // 2)

    def test_ciura_gaps(self):
        self.assertEqual(ciura_gaps(1), [])
        self.assertEqual(ciura_gaps(2), [1])
        self.assertEqual(ciura_gaps(4), [1])
        self.assertEqual(ciura_gaps(5), [4, 1])
        self.assertEqual(ciura_gaps(10), [4, 1])
        self.assertEqual(ciura_gaps(11), [10, 4, 1])
        self.assertEqual(ciura_gaps(24), [23, 10, 4, 1])
        self.assertEqual(ciura_gaps(701), [301, 132, 57, 23, 10, 4, 1])
        self.assertEqual(ciura_gaps(702), [701, 301, 132, 57, 23, 10, 4, 1])
        self.assertEqual(ciura_gaps(1577), [701, 301, 132, 57, 23, 10, 4, 1])
        self.assertEqual(ciura_gaps(1578), [1577, 701, 301, 132, 57, 23, 10, 4, 1])
        self.assertEqual(
            ciura_gaps(100000),
            [90927, 40412, 17961, 7983, 3548, 1577, 701, 301, 132, 57, 23, 10, 4, 1],
        )

    def test_ciura_extension_is_floor_of_2_25_h(self):
        gaps = ciura_gaps(10 ** 18)[::-1]
        self.assertEqual(tuple(gaps[:8]), CIURA_GAPS)
        self.assertGreater(len(gaps), 40)
        for prev, h in zip(gaps[7:], gaps[8:]):
            self.assertEqual(h, int(Fraction(9, 4) * prev))
            self.assertEqual(h, 2 * prev + prev // 4)

    def test_properties_for_every_n(self):
        for n in range(0, 3000):
            for sequence in SEQUENCES:
                gaps = gap_sequence(n, sequence)
                if n < 2:
                    self.assertEqual(gaps, [], (n, sequence))
                    continue
                self.assertEqual(gaps[-1], 1, (n, sequence))
                self.assertLess(gaps[0], n, (n, sequence))
                self.assertTrue(all(a > b for a, b in zip(gaps, gaps[1:])), (n, sequence))

    def test_every_term_below_n_is_used(self):
        knuth_all, ciura_all = knuth_gaps(10 ** 9), ciura_gaps(10 ** 9)
        for n in (2, 5, 14, 100, 702, 1578, 5000, 100000):
            for gaps, everything in ((knuth_gaps(n), knuth_all), (ciura_gaps(n), ciura_all)):
                self.assertEqual(gaps, [h for h in everything if h < n])
            self.assertGreaterEqual(shell_gaps(n)[0] * 2, n - 1)

    def test_default_is_ciura(self):
        self.assertEqual(DEFAULT_SEQUENCE, CIURA)
        self.assertEqual(gap_sequence(1000), ciura_gaps(1000))
        values = lcg_values(99, 300, 1000)
        self.assertEqual(count(values), count(values, CIURA))

    def test_unknown_sequence_raises_value_error(self):
        for bad in ("Shell", "sedgewick", "", None):
            with self.assertRaises(ValueError):
                gap_sequence(10, bad)
            with self.assertRaises(ValueError):
                shell_sort([3, 1, 2], bad)
        with self.assertRaisesRegex(ValueError, "shell, knuth, ciura"):
            gap_sequence(10, "tokuda")

    def test_unknown_sequence_raises_even_for_short_lists(self):
        with self.assertRaises(ValueError):
            shell_sort([], "tokuda")


class TestShellSort(unittest.TestCase):
    CASES = [
        [64, 34, 25, 12, 22, 11, 90],
        [],
        [42],
        [2, 1],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
        [5, 5, 5, 5, 5, 5],
        [3, -1, 3, 0, -1, 2, 2],
        EXAMPLE,
    ]

    def test_cases_with_every_sequence(self):
        for sequence in SEQUENCES:
            for values in self.CASES:
                arr = list(values)
                result = shell_sort(arr, sequence)
                self.assertIs(result, arr)
                self.assertEqual(result, sorted(values), (sequence, values))

    def test_default_sequence(self):
        self.assertEqual(shell_sort(list(EXAMPLE)), sorted(EXAMPLE))

    def test_other_comparable_types(self):
        self.assertEqual(shell_sort([2.5, -1.0, 2.5, 0.0, 1e9]), [-1.0, 0.0, 2.5, 2.5, 1e9])
        words = ["pear", "fig", "apple", "kiwi", "date", "plum"]
        self.assertEqual(shell_sort(list(words), KNUTH), sorted(words))

    def test_random_arrays_against_sorted(self):
        rng = random.Random(20261124)
        for sequence in SEQUENCES:
            for _ in range(400):
                n = rng.randint(0, 150)
                spread = rng.choice([2, 10, 1000, 10 ** 9])
                values = [rng.randint(-spread, spread) for _ in range(n)]
                self.assertEqual(shell_sort(list(values), sequence), sorted(values), (sequence, values))

    def test_large_random_arrays_against_sorted(self):
        rng = random.Random(7)
        for sequence in SEQUENCES:
            for n in (1000, 5000, 20000):
                values = [rng.randint(0, n) for _ in range(n)]
                self.assertEqual(shell_sort(list(values), sequence), sorted(values))


class TestPasses(unittest.TestCase):
    """Wraps the module-level h_sort to look at the array after every pass."""

    def setUp(self):
        self.calls = []
        real = module.h_sort

        def recorded(arr, gap):
            real(arr, gap)
            self.calls.append((gap, list(arr)))
            return arr

        module.h_sort = recorded
        self.addCleanup(setattr, module, "h_sort", real)

    @staticmethod
    def is_h_sorted(arr, h):
        return all(not (arr[i] > arr[i + h]) for i in range(len(arr) - h))

    def test_each_pass_leaves_the_array_h_sorted(self):
        rng = random.Random(4)
        for sequence in SEQUENCES:
            for n in (0, 1, 2, 3, 10, 57, 200, 1000, 3000):
                self.calls.clear()
                values = [rng.randint(0, 50) for _ in range(n)]
                shell_sort(values, sequence)
                self.assertEqual([gap for gap, _ in self.calls], gap_sequence(n, sequence))
                done = []
                for gap, snapshot in self.calls:
                    done.append(gap)
                    # The pass's own gap, and every earlier gap: a later pass never
                    # undoes an earlier one.
                    for h in done:
                        self.assertTrue(self.is_h_sorted(snapshot, h), (sequence, n, gap, h))

    def test_worked_example_passes(self):
        shell_sort(list(EXAMPLE))
        self.assertEqual(
            self.calls,
            [
                (10, [93, 38, 74, 79, 60, 91, 41, 99, 18, 63, 98, 69]),
                (4, [18, 38, 41, 69, 60, 63, 74, 79, 93, 91, 98, 99]),
                (1, [18, 38, 41, 60, 63, 69, 74, 79, 91, 93, 98, 99]),
            ],
        )


class TestHSort(unittest.TestCase):
    def test_gap_one_is_insertion_sort(self):
        rng = random.Random(11)
        for _ in range(200):
            values = [rng.randint(0, 20) for _ in range(rng.randint(0, 40))]
            self.assertEqual(h_sort(list(values), 1), sorted(values))

    def test_one_pass_sorts_each_group(self):
        values = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
        self.assertEqual(h_sort(values, 3), [0, 2, 1, 3, 5, 4, 6, 8, 7, 9])

    def test_gap_at_least_n_changes_nothing(self):
        for gap in (5, 6, 100):
            self.assertEqual(h_sort([5, 4, 3, 2, 1], gap), [5, 4, 3, 2, 1])
        self.assertEqual(h_sort([], 1), [])

    def test_gap_below_one_raises_value_error(self):
        for gap in (0, -1, -5):
            with self.assertRaises(ValueError):
                h_sort([3, 2, 1], gap)


class TestStability(unittest.TestCase):
    class Rec:
        def __init__(self, key, tag):
            self.key, self.tag = key, tag

        def __gt__(self, other):
            return self.key > other.key

    def records(self):
        return [self.Rec(2, "a"), self.Rec(2, "b"), self.Rec(2, "c"), self.Rec(2, "d"), self.Rec(1, "e")]

    def test_not_stable(self):
        """[2a, 2b, 2c, 2d, 1e]: the gap-4 pass swaps 2a and 1e, carrying 2a past its twins"""
        for sequence, tags in ((CIURA, "ebcda"), (KNUTH, "ebcda"), (SHELL, "ebadc")):
            arr = self.records()
            shell_sort(arr, sequence)
            self.assertEqual([r.key for r in arr], [1, 2, 2, 2, 2])
            self.assertEqual("".join(r.tag for r in arr), tags, sequence)

    def test_the_gap_one_pass_alone_is_stable(self):
        arr = self.records()
        h_sort(arr, 1)
        self.assertEqual("".join(r.tag for r in arr), "eabcd")


class TestOperationCounts(unittest.TestCase):
    def test_sorted_input_one_comparison_per_element_per_pass(self):
        """The inner loop must stop at the first element that is not larger."""
        for sequence in SEQUENCES:
            for n in (1, 2, 10, 1000, 5000):
                _, comparisons, shifts = count(range(n), sequence)
                self.assertEqual(comparisons, sum(n - g for g in gap_sequence(n, sequence)))
                self.assertEqual(shifts, 0)

    def test_all_equal_input_never_shifts(self):
        for sequence in SEQUENCES:
            _, comparisons, shifts = count([7] * 500, sequence)
            self.assertEqual(shifts, 0)
            self.assertEqual(comparisons, sum(500 - g for g in gap_sequence(500, sequence)))

    def test_shell_gaps_are_quadratic_on_the_bad_input(self):
        """n(n - 2)/8 + (log2(n) - 1) n + 1 comparisons and n(n - 2)/8 shifts"""
        for k in range(2, 12):
            n = 2 ** k
            result, comparisons, shifts = count(bad_input(n), SHELL)
            self.assertEqual(result, list(range(1, n + 1)))
            self.assertEqual(shifts, n * (n - 2) // 8)
            self.assertEqual(comparisons, n * (n - 2) // 8 + (k - 1) * n + 1)

    def test_bad_input_counts_for_every_sequence(self):
        expected = {
            SHELL: (140033, 130816),
            KNUTH: (9447, 3912),
            CIURA: (10621, 4008),
        }
        for sequence, pair in expected.items():
            self.assertEqual(count(bad_input(1024), sequence)[1:], pair, sequence)

    def test_worked_example_counts(self):
        """27 comparisons and 12 shifts with Ciura's gaps; plain insertion sort needs 47 and 40"""
        self.assertEqual(count(EXAMPLE)[1:], (27, 12))
        self.assertEqual(count(EXAMPLE, KNUTH)[1:], (28, 14))
        self.assertEqual(count(EXAMPLE, SHELL)[1:], (38, 18))
        Counted.comparisons = Counted.shifts = 0
        h_sort([Counted(v) for v in EXAMPLE], 1)
        self.assertEqual((Counted.comparisons, Counted.shifts), (47, 40))

    def test_pinned_counts(self):
        """The table the C++ and Go tests pin: regenerate it here if the code changes"""
        for seed, n, mod, sequence, comparisons, shifts in PINNED:
            values = lcg_values(seed, n, mod)
            result, c, s = count(values, sequence)
            self.assertEqual(result, sorted(values))
            self.assertEqual((c, s), (comparisons, shifts), (seed, n, mod, sequence))

    def test_growing_random_inputs(self):
        """Ciura's gaps make the fewest comparisons; Shell's grow fastest"""
        rng = random.Random(2001)
        previous = None
        for n in (2000, 4000, 8000):
            values = rng.sample(range(n), n)
            comparisons = {s: count(values, s)[1] for s in SEQUENCES}
            self.assertLess(comparisons[CIURA], comparisons[KNUTH])
            self.assertLess(comparisons[KNUTH], comparisons[SHELL])
            if previous:
                # Doubling n more than doubles the work, by less than a factor of 4.
                for s in SEQUENCES:
                    self.assertTrue(2 < comparisons[s] / previous[s] < 4, (n, s))
            previous = comparisons


if __name__ == "__main__":
    unittest.main()
