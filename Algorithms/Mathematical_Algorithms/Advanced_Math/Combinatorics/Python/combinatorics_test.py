"""
Unit tests for combinatorics: every formula against a brute-force enumeration on small inputs,
the three binomial methods against each other and against math.comb, the modular binomial
against math.comb reduced modulo p, the edge cases and errors, the 64-bit limits the C++ and
Go versions rely on, and the values those tests pin. Four tests count the work through the
module-level helpers: the additions of the triangle and of the one-row version, the steps of
the multiplicative formula, and the single modular inverse of ModBinomial.
"""

import decimal
import itertools
import math
import random
import unittest
from fractions import Fraction

import combinatorics as module
from combinatorics import (
    ModBinomial,
    binomial,
    binomial_pascal,
    catalan,
    catalan_numbers,
    derangement_numbers,
    pascal_triangle,
    stars_and_bars,
    stars_and_bars_positive,
)

U64_MAX = 2**64 - 1
I64_MAX = 2**63 - 1
MOD = 10**9 + 7
PRIMES = [2, 3, 5, 7, 11, 13, 101, 65537, MOD, 998244353, 2**61 - 1, 2**64 - 59]


def is_prime(n):
    return n >= 2 and all(n % d for d in range(2, math.isqrt(n) + 1))


# ---------- brute-force counts ----------


def subsets_of_size(n, k):
    """k-element subsets of {0..n-1}, counted over all 2^n bitmasks."""
    return sum(1 for mask in range(1 << n) if bin(mask).count("1") == k)


def balanced_strings(n):
    """Strings of n '(' and n ')' that never close more than they opened."""
    count = 0
    for s in itertools.product("()", repeat=2 * n):
        depth = 0
        for c in s:
            depth += 1 if c == "(" else -1
            if depth < 0:
                break
        else:
            count += depth == 0
    return count


def binary_tree_shapes(n):
    """Distinct binary trees with n nodes, as prefix-closed sets of L/R paths from the root.

    Grown one node at a time from the root, adding a missing child of any node, and collected
    as sets, so each shape counts once however it was grown.
    """
    if n == 0:
        return 1
    level = {frozenset([""])}
    for _ in range(n - 1):
        level = {shape | {path + side} for shape in level for path in shape for side in "LR" if path + side not in shape}
    return len(level)


def triangulations(n):
    """Triangulations of a convex polygon with n + 2 vertices, as sets of n - 1 pairwise
    non-crossing diagonals, out of every subset of that size."""
    v = n + 2
    if v < 4:
        return 1
    diagonals = [(a, b) for a in range(v) for b in range(a + 2, v) if not (a == 0 and b == v - 1)]

    def cross(d, e):
        (a, b), (c, d2) = d, e
        return a < c < b < d2 or c < a < d2 < b

    return sum(1 for chosen in itertools.combinations(diagonals, n - 1) if not any(cross(d, e) for d, e in itertools.combinations(chosen, 2)))


def distributions(n, k, at_least=0):
    """k-tuples of counts, each at least at_least, that add up to n."""
    if k == 0:
        return 1 if n == 0 else 0
    return sum(1 for t in itertools.product(range(at_least, n + 1), repeat=k) if sum(t) == n)


def derangements_by_enumeration(n):
    return sum(1 for p in itertools.permutations(range(n)) if all(p[i] != i for i in range(n)))


# ---------- the values the C++ and Go tests pin, all computed by this module ----------

PINNED_BINOMIALS = [
    (0, 0, 1), (1, 0, 1), (1, 1, 1), (5, 2, 10), (6, 3, 20), (10, 3, 120), (10, 7, 120), (10, -1, 0), (10, 11, 0), (-3, 2, 0),
    (-1, -1, 0), (20, 10, 184756), (30, 15, 155117520), (52, 5, 2598960), (60, 30, 118264581564861424),
    (62, 31, 465428353255261088), (64, 32, 1832624140942590534), (66, 33, 7219428434016265740),
    (67, 33, 14226520737620288370), (67, 34, 14226520737620288370),
    (100, 3, 161700), (100, 97, 161700), (1000, 2, 499500), (1000, 5, 8250291250200),
    (2**32, 2, 9223372034707292160), (10**9, 2, 499999999500000000), (10**18, 1, 10**18), (I64_MAX, 1, I64_MAX),
    (I64_MAX, I64_MAX - 1, I64_MAX), (I64_MAX, I64_MAX, 1),
]
# (n, k) whose C(n, k) does not fit in 64 bits: C++ and Go report an overflow.
PINNED_OVERFLOWS = [(68, 34), (68, 33), (100, 50), (10**18, 2), (2**33, 3), (I64_MAX, 2)]
PINNED_MOD = [
    # (n_max, p, [(n, k, C(n, k) mod p), ...], multiplications)
    (6, 13, [(6, 2, 2), (6, 3, 7), (5, 2, 10), (0, 0, 1), (6, 7, 0), (6, -1, 0)], 19),
    (10, MOD, [(10, 3, 120), (10, 5, 252), (7, 7, 1)], 65),
    (1000, MOD, [(1000, 500, 159835829), (1000, 3, 166167000), (999, 1, 999)], 2045),
    (12, 13, [(12, 6, 1), (12, 1, 12), (11, 4, 5)], 31),
    (50, 998244353, [(50, 25, 927528656), (40, 20, 88808106)], 158),
    (30, 2**61 - 1, [(30, 15, 155117520), (25, 12, 5200300)], 181),
    (20, 2**64 - 59, [(20, 10, 184756), (20, 1, 20)], 164),
    (1, 2, [(1, 0, 1), (1, 1, 1), (0, 0, 1)], 2),
    (0, 2, [(0, 0, 1), (0, 1, 0)], 0),
]
PASCAL_ROW_10 = [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1]
PINNED_STARS = [
    # (n, k, stars_and_bars, stars_and_bars_positive)
    (0, 0, 1, 1), (5, 0, 0, 0), (0, 3, 1, 0), (5, 3, 21, 6), (3, 5, 35, 0), (5, 5, 126, 1), (10, 4, 286, 84),
    (1, 1, 1, 1), (7, 1, 1, 1), (100, 10, 4263421511271, 1731030945644), (60, 8, 869648208, 341149446),
]
LARGEST_PASCAL_ROW_U64 = 67
LARGEST_PASCAL_ROW_I64 = 66
LARGEST_CATALAN_U64 = 36  # by the recurrence
LARGEST_CATALAN_CLOSED_FORM_U64 = 33  # C(2n, n) itself must fit
LARGEST_DERANGEMENT_U64 = 20


class TestPascalTriangle(unittest.TestCase):
    def test_small_rows(self):
        self.assertEqual(pascal_triangle(0), [[1]])
        self.assertEqual(pascal_triangle(1), [[1], [1, 1]])
        self.assertEqual(pascal_triangle(4), [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]])
        self.assertEqual(pascal_triangle(10)[10], PASCAL_ROW_10)

    def test_every_cell_is_math_comb(self):
        for r, row in enumerate(pascal_triangle(120)):
            self.assertEqual(row, [math.comb(r, j) for j in range(r + 1)], r)

    def test_rows_sum_to_powers_of_two_and_are_symmetric(self):
        for r, row in enumerate(pascal_triangle(80)):
            self.assertEqual(sum(row), 2**r)
            self.assertEqual(row, row[::-1])

    def test_negative_raises(self):
        with self.assertRaises(ValueError):
            pascal_triangle(-1)


class TestBinomialMethodsAgree(unittest.TestCase):
    def test_against_subset_enumeration(self):
        for n in range(0, 13):
            for k in range(-2, n + 3):
                want = subsets_of_size(n, k) if 0 <= k <= n else 0
                self.assertEqual(binomial(n, k), want, (n, k))
                self.assertEqual(binomial_pascal(n, k), want, (n, k))

    def test_three_methods_and_math_comb(self):
        rows = pascal_triangle(150)
        table = ModBinomial(150, MOD)
        for n in range(0, 151):
            for k in range(-3, n + 4):
                exact = math.comb(n, k) if k >= 0 else 0
                self.assertEqual(binomial(n, k), exact, (n, k))
                self.assertEqual(binomial_pascal(n, k), exact, (n, k))
                if 0 <= k <= n:
                    self.assertEqual(rows[n][k], exact, (n, k))
                self.assertEqual(table.binomial(n, k), exact % MOD, (n, k))

    def test_large_arguments(self):
        rng = random.Random(7)
        for _ in range(300):
            n = rng.randrange(0, 10**12)
            k = rng.randrange(0, 40)
            self.assertEqual(binomial(n, k), math.comb(n, k), (n, k))
            self.assertEqual(binomial(n, n - k), math.comb(n, k), (n, k))
        for n in range(150, 400, 37):
            for k in range(0, n + 1, 11):
                self.assertEqual(binomial_pascal(n, k), math.comb(n, k), (n, k))

    def test_edge_cases(self):
        for f in (binomial, binomial_pascal):
            self.assertEqual(f(0, 0), 1)
            self.assertEqual(f(0, 1), 0)
            self.assertEqual(f(0, -1), 0)
            self.assertEqual(f(5, -1), 0)
            self.assertEqual(f(5, 6), 0)
            self.assertEqual(f(-4, 2), 0)  # a negative n falls under k > n
            self.assertEqual(f(-4, -5), 0)
            self.assertEqual(f(7, 0), 1)
            self.assertEqual(f(7, 7), 1)
            self.assertEqual(f(7, 1), 7)

    def test_pinned_values(self):
        for n, k, want in PINNED_BINOMIALS:
            self.assertEqual(binomial(n, k), want, (n, k))
            self.assertEqual(want, math.comb(n, k) if 0 <= k <= n else 0, (n, k))
        for n, k in PINNED_OVERFLOWS:
            self.assertGreater(binomial(n, k), U64_MAX, (n, k))


class TestModBinomial(unittest.TestCase):
    def test_against_math_comb_mod_p(self):
        for p in PRIMES:
            n_max = min(p - 1, 300)
            table = ModBinomial(n_max, p)
            for n in range(0, n_max + 1, 1 if n_max < 40 else 7):
                for k in range(-1, n + 2):
                    want = math.comb(n, k) % p if k >= 0 else 0
                    self.assertEqual(table.binomial(n, k), want, (n, k, p))

    def test_random_queries_up_to_a_million(self):
        table = ModBinomial(10**6, MOD)
        rng = random.Random(2026)
        for _ in range(60):
            # math.comb is slow for a large middle k on older Pythons, so k or n - k stays small.
            n = rng.randrange(0, 10**6 + 1)
            side = rng.randrange(0, min(n, 400) + 1)
            for k in (side, n - side):
                self.assertEqual(table.binomial(n, k), math.comb(n, k) % MOD, (n, k))
        for n in (20000, 20001):
            self.assertEqual(table.binomial(n, n // 2), math.comb(n, n // 2) % MOD, n)

    def test_tables(self):
        t = ModBinomial(6, 13)
        self.assertEqual(t.fact, [1, 1, 2, 6, 11, 3, 5])  # 4! = 24 = 11, 5! = 120 = 3, 6! = 720 = 5 (mod 13)
        self.assertEqual(t.inv_fact, [1, 1, 7, 11, 6, 9, 8])
        for i in range(7):
            self.assertEqual(t.fact[i] * t.inv_fact[i] % 13, 1, i)
        self.assertEqual((t.n_max, t.p), (6, 13))

    def test_every_prime_up_to_200_and_largest_table(self):
        for p in (q for q in range(2, 200) if is_prime(q)):
            table = ModBinomial(p - 1, p)  # the largest table p allows
            for n in range(p):
                for k in range(n + 1):
                    self.assertEqual(table.binomial(n, k), math.comb(n, k) % p, (n, k, p))

    def test_n_at_least_p_raises_and_lucas_takes_over(self):
        for n_max, p in ((7, 7), (9, 7), (13, 13), (2, 2), (100, 97)):
            with self.assertRaises(ValueError) as ctx:
                ModBinomial(n_max, p)
            self.assertIn("Lucas", str(ctx.exception))
        # Why: from n = p on, n! is 0 modulo p, yet C(n, k) mod p need not be 0. Lucas's theorem
        # gives it from the base-p digits: C(9, 4) mod 7 = C(1, 0) * C(2, 4) = 0, C(8, 1) mod 7 = 1.
        self.assertEqual(math.factorial(7) % 7, 0)
        self.assertEqual(math.comb(8, 1) % 7, 1)
        self.assertEqual(math.comb(9, 4) % 7, 0)
        self.assertEqual(math.comb(7, 7) % 7, 1)

    def test_composite_modulus_raises_or_is_still_right(self):
        accepted = 0
        for m in range(2, 160):
            for n_max in range(0, min(m, 25)):
                try:
                    table = ModBinomial(n_max, m)
                except ValueError as e:
                    self.assertFalse(is_prime(m), (n_max, m))
                    self.assertIn("is not prime", str(e))
                    continue
                accepted += not is_prime(m)
                for n in range(n_max + 1):
                    for k in range(n + 1):
                        self.assertEqual(table.binomial(n, k), math.comb(n, k) % m, (n, k, m))
        self.assertGreater(accepted, 0)  # n_max <= 1 always passes: 0! = 1! = 1 is its own inverse
        with self.assertRaises(ValueError) as ctx:
            ModBinomial(6, 8)
        self.assertEqual(str(ctx.exception), "p = 8 is not prime: 0 * 0 % 8 = 0, so the power p - 2 did not invert 6! modulo p")
        with self.assertRaises(ValueError) as ctx:
            ModBinomial(2, 9)
        self.assertEqual(str(ctx.exception), "p = 9 is not prime: 2 * 2 % 9 = 4, so the power p - 2 did not invert 2! modulo p")

    def test_errors(self):
        with self.assertRaises(ValueError):
            ModBinomial(-1, 13)
        for p in (1, 0, -7):
            with self.assertRaises(ValueError) as ctx:
                ModBinomial(0, p)
            self.assertIn("is not prime", str(ctx.exception))
        t = ModBinomial(5, 13)
        with self.assertRaises(ValueError) as ctx:
            t.binomial(6, 2)
        self.assertEqual(str(ctx.exception), "n = 6 is past the table: it was built for n <= 5")
        self.assertEqual(t.binomial(6, 7), 0)  # the guard comes first: k > n needs no table
        self.assertEqual(t.binomial(-1, 0), 0)

    def test_pinned_values(self):
        for n_max, p, queries, mults in PINNED_MOD:
            t = ModBinomial(n_max, p)
            self.assertEqual(t.multiplications, mults, (n_max, p))
            for n, k, want in queries:
                self.assertEqual(t.binomial(n, k), want, (n, k, p))
                self.assertEqual(want, math.comb(n, k) % p if k >= 0 else 0)


class TestWork(unittest.TestCase):
    """Counts the work through the module-level helpers, so a lost shortcut fails a test."""

    def wrap(self, name):
        real = getattr(module, name)
        calls = []

        def counted(*args):
            calls.append(args)
            return real(*args)

        setattr(module, name, counted)
        self.addCleanup(setattr, module, name, real)
        return calls

    def test_triangle_adds_once_per_interior_cell(self):
        calls = self.wrap("_pascal_cell")
        for n in range(0, 60):
            del calls[:]
            pascal_triangle(n)
            self.assertEqual(len(calls), n * (n - 1) // 2, n)

    def test_one_row_uses_the_smaller_side(self):
        calls = self.wrap("_add_left")
        for n in range(0, 70):
            for k in range(0, n + 1):
                del calls[:]
                binomial_pascal(n, k)
                side = min(k, n - k)
                self.assertEqual(len(calls), sum(min(r, side) for r in range(1, n + 1)), (n, k))
                self.assertLessEqual(len(calls), n * side)
        del calls[:]
        binomial_pascal(1000, 998)  # C(1000, 2): about 2 additions per row, not 998
        self.assertEqual(len(calls), 1999)

    def test_multiplicative_formula_takes_min_k_steps(self):
        calls = self.wrap("_times_over")
        for n in range(0, 120):
            for k in range(-1, n + 2):
                del calls[:]
                binomial(n, k)
                self.assertEqual(len(calls), min(k, n - k) if 0 <= k <= n else 0, (n, k))
        del calls[:]
        binomial(10**18, 10**18 - 3)
        self.assertEqual(len(calls), 3)

    def test_every_step_is_a_binomial_no_larger_than_the_answer(self):
        real = module._times_over
        seen = []

        def recorded(value, m, i):
            out = real(value, m, i)
            seen.append(out)
            return out

        module._times_over = recorded
        self.addCleanup(setattr, module, "_times_over", real)
        for n in range(0, 90):
            for k in range(0, n + 1):
                del seen[:]
                answer = binomial(n, k)
                side = min(k, n - k)
                self.assertEqual(seen, [math.comb(n - side + i, i) for i in range(1, side + 1)], (n, k))
                self.assertTrue(all(v <= answer for v in seen))

    def test_one_modular_inverse_per_table(self):
        calls = self.wrap("_power")
        for n_max, p in ((0, 2), (10, 13), (1000, MOD), (10**5, 998244353)):
            del calls[:]
            t = ModBinomial(n_max, p)
            self.assertEqual(len(calls), 1, (n_max, p))
            self.assertLessEqual(t.multiplications, 2 * n_max + 2 * (p - 2).bit_length())
            self.assertGreaterEqual(t.multiplications, 2 * n_max)

    def test_power_counts(self):
        self.assertEqual(module._power(3, 0, 7), (1, 0))
        self.assertEqual(module._power(5, 0, 1), (0, 0))
        self.assertEqual(module._power(2, 10, 1000), (24, 6))  # 4 squarings + 2 set bits
        self.assertEqual(module._power(720 % 13, 11, 13), (8, 7))  # 11 = 1011b: 4 squarings, 3 products


class TestCatalan(unittest.TestCase):
    FIRST = [1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862, 16796, 58786, 208012, 742900, 2674440, 9694845]

    def test_first_values(self):
        # OEIS A000108.
        self.assertEqual(catalan_numbers(15), self.FIRST)
        self.assertEqual([catalan(n) for n in range(16)], self.FIRST)

    def test_recurrence_and_closed_form_agree(self):
        table = catalan_numbers(300)
        for n in range(301):
            self.assertEqual(catalan(n), table[n], n)
            self.assertEqual(table[n] * (n + 1), math.comb(2 * n, n), n)
            self.assertEqual(table[n], math.comb(2 * n, n) - math.comb(2 * n, n + 1), n)

    def test_balanced_parentheses(self):
        for n in range(0, 10):
            self.assertEqual(balanced_strings(n), catalan(n), n)

    def test_binary_tree_shapes(self):
        for n in range(0, 10):
            self.assertEqual(binary_tree_shapes(n), catalan(n), n)

    def test_polygon_triangulations(self):
        for n in range(0, 7):
            self.assertEqual(triangulations(n), catalan(n), n)

    def test_edges_and_errors(self):
        self.assertEqual(catalan_numbers(0), [1])
        self.assertEqual(catalan(0), 1)
        self.assertEqual(catalan(1), 1)
        for f in (catalan, catalan_numbers):
            with self.assertRaises(ValueError):
                f(-1)

    def test_64_bit_limits(self):
        cat = catalan_numbers(40)
        self.assertEqual(max(n for n in range(41) if cat[n] <= U64_MAX), LARGEST_CATALAN_U64)
        self.assertEqual(cat[36], 11959798385860453492)
        # The closed form passes through C(2n, n), n + 1 times the answer: it stops fitting at n = 34.
        self.assertEqual(max(n for n in range(41) if math.comb(2 * n, n) <= U64_MAX), LARGEST_CATALAN_CLOSED_FORM_U64)


class TestStarsAndBars(unittest.TestCase):
    def test_against_enumeration(self):
        for n in range(0, 9):
            for k in range(0, 6):
                self.assertEqual(stars_and_bars(n, k), distributions(n, k), (n, k))
                self.assertEqual(stars_and_bars_positive(n, k), distributions(n, k, at_least=1), (n, k))

    def test_formulas(self):
        for n in range(0, 60):
            for k in range(1, 30):
                self.assertEqual(stars_and_bars(n, k), math.comb(n + k - 1, k - 1))
                self.assertEqual(stars_and_bars_positive(n, k), math.comb(n - 1, k - 1) if n >= 1 else 0)
                if n >= k:
                    self.assertEqual(stars_and_bars_positive(n, k), stars_and_bars(n - k, k))

    def test_edges_and_errors(self):
        self.assertEqual(stars_and_bars(0, 0), 1)
        self.assertEqual(stars_and_bars(4, 0), 0)
        self.assertEqual(stars_and_bars(0, 4), 1)
        self.assertEqual(stars_and_bars_positive(0, 0), 1)
        self.assertEqual(stars_and_bars_positive(3, 4), 0)
        self.assertEqual(stars_and_bars_positive(4, 4), 1)
        for f in (stars_and_bars, stars_and_bars_positive):
            for n, k in ((-1, 3), (3, -1), (-1, -1)):
                with self.assertRaises(ValueError):
                    f(n, k)

    def test_pinned_values(self):
        for n, k, plain, positive in PINNED_STARS:
            self.assertEqual(stars_and_bars(n, k), plain, (n, k))
            self.assertEqual(stars_and_bars_positive(n, k), positive, (n, k))


class TestDerangements(unittest.TestCase):
    def test_first_values(self):
        # OEIS A000166.
        self.assertEqual(derangement_numbers(12), [1, 0, 1, 2, 9, 44, 265, 1854, 14833, 133496, 1334961, 14684570, 176214841])
        self.assertEqual(derangement_numbers(0), [1])
        self.assertEqual(derangement_numbers(1), [1, 0])

    def test_against_enumeration(self):
        d = derangement_numbers(8)
        for n in range(0, 9):
            self.assertEqual(d[n], derangements_by_enumeration(n), n)

    def test_inclusion_exclusion_and_rounding(self):
        d = derangement_numbers(120)
        for n in range(121):
            # Inclusion-exclusion over the items left in place: sum of (-1)^i n! / i!.
            self.assertEqual(d[n], sum((-1) ** i * (math.factorial(n) // math.factorial(i)) for i in range(n + 1)), n)
        context = decimal.Context(prec=80)
        e = context.exp(decimal.Decimal(1))
        for n in range(1, 41):
            # |D(n) - n!/e| < 1/(n + 1) <= 1/2 for n >= 1, so n!/e rounds to D(n).
            self.assertEqual(d[n], int(context.divide(decimal.Decimal(math.factorial(n)), e).to_integral_value(decimal.ROUND_HALF_EVEN)), n)

    def test_ratio_approaches_one_over_e(self):
        d = derangement_numbers(30)
        # 1/e = sum of (-1)^i / i!; D(n)/n! is that sum cut after i = n, so the error is below 1/(n+1)!.
        e_inverse_lo = sum(Fraction((-1) ** i, math.factorial(i)) for i in range(60))
        for n in range(1, 31):
            ratio = Fraction(d[n], math.factorial(n))
            self.assertLess(abs(ratio - e_inverse_lo), Fraction(1, math.factorial(n + 1)), n)
            if n >= 2:
                previous = Fraction(d[n - 1], math.factorial(n - 1))
                self.assertLess(abs(ratio - e_inverse_lo), abs(previous - e_inverse_lo), n)
                self.assertNotEqual(ratio > e_inverse_lo, previous > e_inverse_lo, n)  # the error alternates in sign
        self.assertAlmostEqual(d[15] / math.factorial(15), 1 / math.e, places=13)

    def test_errors_and_64_bit_limit(self):
        with self.assertRaises(ValueError):
            derangement_numbers(-1)
        d = derangement_numbers(25)
        self.assertEqual(max(n for n in range(26) if d[n] <= U64_MAX), LARGEST_DERANGEMENT_U64)
        self.assertEqual(d[20], 895014631192902121)


class Test64BitLimits(unittest.TestCase):
    """The limits the C++ and Go tests check: computed here from the exact values."""

    def test_largest_pascal_row(self):
        rows = pascal_triangle(70)
        fits_u64 = [r for r in range(71) if max(rows[r]) <= U64_MAX]
        fits_i64 = [r for r in range(71) if max(rows[r]) <= I64_MAX]
        self.assertEqual(fits_u64, list(range(LARGEST_PASCAL_ROW_U64 + 1)))
        self.assertEqual(fits_i64, list(range(LARGEST_PASCAL_ROW_I64 + 1)))
        self.assertEqual(max(rows[67]), 14226520737620288370)
        self.assertEqual(max(rows[68]), 28453041475240576740)
        # Row 68 overflows in columns 31 to 37; the first sum that wraps around is C(68, 31).
        self.assertEqual([j for j in range(69) if rows[68][j] > U64_MAX], list(range(31, 38)))

    def test_a_large_side_always_overflows(self):
        # binomial_pascal in C++ and Go reports an overflow at once for min(k, n - k) >= 34,
        # since then C(n, k) >= C(2 * 34, 34) > 2^64 - 1.
        self.assertGreater(math.comb(68, 34), U64_MAX)
        self.assertLessEqual(math.comb(66, 33), U64_MAX)


if __name__ == "__main__":
    unittest.main()
