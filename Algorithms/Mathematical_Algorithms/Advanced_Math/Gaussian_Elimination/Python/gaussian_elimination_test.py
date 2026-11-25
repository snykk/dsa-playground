"""
Unit tests for Gaussian elimination: random systems with a known solution (floating point
within the tolerance, exact modulo p), singular and inconsistent systems built on purpose, rank
and determinant against brute force (cofactor expansion in exact fractions), systems with more
or fewer equations than unknowns, the pivoting example, the edge cases (1 x 1, a zero matrix, a
zero right-hand side), the errors, and the values the C++ and Go tests pin. Three tests count
the work through the module-level helpers.
"""

import itertools
import random
import unittest
from fractions import Fraction

import gaussian_elimination as module
from gaussian_elimination import (
    EPS,
    Kind,
    Solution,
    determinant,
    determinant_mod,
    solve,
    solve_mod,
    solve_without_pivoting,
)

P64 = 18446744073709551557  # the largest prime below 2^64
PRIMES = [2, 3, 5, 7, 13, 97, 1009, 998244353, 10**9 + 7, 2**61 - 1, P64]
WORKED_A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]
WORKED_B = [8, -11, -3]
PIVOT_A = [[1e-08, 0, 1], [1, 1e-08, 0], [0, 1, 0]]
PIVOT_B = [1, 2, 3]


# ---------- brute force references ----------


def det_cofactor(M):
    """The determinant by cofactor expansion along the first row, in exact fractions."""
    n = len(M)
    if n == 1:
        return Fraction(M[0][0])
    total = Fraction(0)
    for j in range(n):
        if M[0][j] == 0:
            continue
        minor = [row[:j] + row[j + 1 :] for row in M[1:]]
        total += (-1) ** j * Fraction(M[0][j]) * det_cofactor(minor)
    return total


def rank_brute(M, p=None):
    """The largest k with a k x k minor that is not zero (modulo p when p is given)."""
    n, m = len(M), len(M[0])
    for k in range(min(n, m), 0, -1):
        for rows in itertools.combinations(range(n), k):
            for cols in itertools.combinations(range(m), k):
                d = det_cofactor([[M[r][c] for c in cols] for r in rows])
                if (d != 0) if p is None else (d.numerator % p != 0):
                    return k
    return 0


def residual(A, x, b):
    return max(abs(sum(a * v for a, v in zip(row, x)) - bi) for row, bi in zip(A, b))


def mat_vec_mod(A, x, p):
    return [sum(a * v for a, v in zip(row, x)) % p for row in A]


# The values the C++ and Go tests pin, all computed by this module.
PINNED_MOD = [
    ([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3], 7, Kind.UNIQUE, [2, 3, 6], 3, [0, 1, 2], 0, 8),
    ([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3], 1000000007, Kind.UNIQUE, [2, 3, 1000000006], 3, [0, 1, 2], 0, 8),
    ([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3], 2, Kind.UNIQUE, [0, 1, 1], 3, [0, 1, 2], 1, 2),
    ([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3], 3, Kind.UNIQUE, [2, 0, 2], 3, [0, 1, 2], 0, 5),
    ([[1, 2], [2, 4]], [3, 6], 13, Kind.INFINITE, [3, 0], 1, [0], 0, 2),
    ([[1, 2], [2, 4]], [3, 7], 13, Kind.NO_SOLUTION, None, 1, [0], 0, 2),
    ([[5]], [3], 7, Kind.UNIQUE, [2], 1, [0], 0, 0),
    ([[0]], [0], 5, Kind.INFINITE, [0], 0, [], 0, 0),
    ([[0]], [4], 5, Kind.NO_SOLUTION, None, 0, [], 0, 0),
    ([[7]], [3], 7, Kind.NO_SOLUTION, None, 0, [], 0, 0),
    ([[0, 0, 0], [0, 0, 0]], [0, 0], 11, Kind.INFINITE, [0, 0, 0], 0, [], 0, 0),
    ([[0, 0], [0, 0], [0, 0]], [0, 1, 0], 11, Kind.NO_SOLUTION, None, 0, [], 0, 0),
    ([[1, 2, 3], [0, 1, 4], [5, 6, 0]], [0, 0, 0], 101, Kind.UNIQUE, [0, 0, 0], 3, [0, 1, 2], 0, 5),
    ([[1, 2, 3], [2, 4, 6], [1, 0, 1]], [0, 0, 0], 101, Kind.INFINITE, [0, 0, 0], 2, [0, 1], 1, 6),
    ([[1, 1], [1, 2], [2, 3], [3, 5]], [3, 5, 8, 13], 1009, Kind.UNIQUE, [1, 2], 2, [0, 1], 0, 8),
    ([[1, 1], [1, 2], [2, 3], [3, 5]], [3, 5, 8, 14], 1009, Kind.NO_SOLUTION, None, 2, [0, 1], 0, 8),
    ([[1, 2, 3, 4], [5, 6, 7, 8]], [1, 2], 1009, Kind.INFINITE, [504, 253, 0, 0], 2, [0, 1], 0, 4),
    ([[1, 2, 3, 4], [2, 4, 7, 9]], [5, 11], 1009, Kind.INFINITE, [2, 0, 1, 0], 2, [0, 2], 0, 4),
    ([[-1, -2], [-3, -4]], [-5, -6], 1000000007, Kind.UNIQUE, [1000000003, 500000008], 2, [0, 1], 0, 2),
    ([[0, 1], [1, 0]], [2, 3], 5, Kind.UNIQUE, [3, 2], 2, [0, 1], 1, 0),
    ([[0, 1, 2], [0, 2, 5], [0, 3, 7]], [1, 2, 3], 13, Kind.INFINITE, [0, 1, 0], 2, [1, 2], 0, 5),
    ([[3, 1], [6, 2]], [1, 2], 3, Kind.INFINITE, [0, 1], 1, [1], 0, 1),
    ([[-28, 36, -50, -45], [36, 38, -33, 27], [9, 12, -30, 47], [6, 4, 49, 22]], [-19, -41, 42, -50], 998244353, Kind.UNIQUE, [515992288, 296635012, 558304060, 649083976], 4, [0, 1, 2, 3], 0, 20),
    ([[9223372036854775807, 2, 3], [5, -9223372036854775807, 7], [11, 13, 9223372036854775806]], [9223372036854775807, -9223372036854775808, 1], 2305843009213693951, Kind.UNIQUE, [2120702329641791514, 2053378446161099725, 353450388273631922], 3, [0, 1, 2], 0, 8),
    ([[9223372036854775807, -9223372036854775808, 3], [5, 9223372036854775800, -11], [-9223372036854775807, 13, 9223372036854775807]], [1, 9223372036854775807, -9223372036854775808], 18446744073709551557, Kind.UNIQUE, [10136804533795096339, 18128638826461175054, 17401701131164709028], 3, [0, 1, 2], 0, 8),
    ([[0, 0, 1, 1], [0, 1, 1, 0], [0, 1, 0, 1], [1, 0, 1, 1]], [1, 1, 0, 1], 2, Kind.INFINITE, [0, 0, 1, 0], 3, [0, 1, 2], 1, 5),
    ([[-9, 0, -8, -5, -9], [0, 7, 5, 3, 6], [3, 7, 4, -3, 1], [-3, -4, -6, -3, 6], [3, -3, -7, 4, -4]], [4, 3, 6, -6, 5], 13, Kind.UNIQUE, [4, 1, 6, 4, 1], 5, [0, 1, 2, 3, 4], 0, 35),
    ([[-91, 24, 94, 6, 47], [94, -75, -91, 26, -44], [43, -6, 27, -57, 72], [-63, 89, 20, 75, -17]], [-91, -32, 4, -1], 10007, Kind.INFINITE, [6203, 8653, 5038, 537, 0], 4, [0, 1, 2, 3], 0, 26),
    ([[2, 7, 1], [9, -7, -9], [-7, -5, 8], [-1, -2, 4], [8, 7, -7]], [-3, -8, 5, -8, -9], 97, Kind.NO_SOLUTION, None, 3, [0, 1, 2], 0, 20),
    ([[2, 4, 6], [1, 2, 3], [3, 6, 9]], [2, 1, 3], 7, Kind.INFINITE, [1, 0, 0], 1, [0], 0, 6),
    ([[2, 4, 6], [1, 2, 3], [3, 6, 9]], [2, 1, 4], 7, Kind.NO_SOLUTION, None, 1, [0], 0, 6),
    ([[1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], [4, 5, 6], 1000003, Kind.INFINITE, [4, 0, 5, 6], 3, [0, 2, 3], 0, 0),
    ([[1, 5, 0], [6, 3, -3], [3, -2, -3], [5, -1, -3], [2, 2, -1]], [227, 147, -84, -35, 94], 97, Kind.UNIQUE, [2, 45, 0], 3, [0, 1, 2], 0, 20),
]
PINNED_DET_MOD = [
    ([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], 7, 6),
    ([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], 1000000007, 1000000006),
    ([[0, 1], [1, 0]], 5, 4),
    ([[1, 2], [2, 4]], 13, 0),
    ([[-3]], 7, 4),
    ([[0]], 2, 0),
    ([[1, 1, 0], [0, 1, 1], [1, 0, 1]], 2, 0),
    ([[75, 27, -14, 47], [-1, 68, 68, -96], [90, -65, 61, -50], [79, -40, -45, 98]], 998244353, 4733599),
    ([[9223372036854775807, -9223372036854775808, 3], [5, 9223372036854775800, -11], [-9223372036854775807, 13, 9223372036854775807]], 18446744073709551557, 16140901064495876140),
    ([[0, 0, 1], [0, 1, 0], [1, 0, 0]], 1000003, 1000002),
]
PINNED_FLOAT = [
    ([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3], Kind.UNIQUE, [2.0, 3.0000000000000004, -0.9999999999999999], 3, [0, 1, 2], 2, 8),
    ([[1e-08, 0, 1], [1, 1e-08, 0], [0, 1, 0]], [1, 2, 3], Kind.UNIQUE, [1.99999997, 3.0, 0.9999999800000003], 3, [0, 1, 2], 2, 5),
    ([[1, 2], [2, 4]], [3, 6], Kind.INFINITE, [3.0, 0.0], 1, [0], 1, 2),
    ([[1, 2], [2, 4]], [3, 7], Kind.NO_SOLUTION, None, 1, [0], 1, 2),
    ([[1, 1], [1, 2], [2, 3], [3, 5]], [3, 5, 8, 13], Kind.UNIQUE, [1.0, 2.0], 2, [0, 1], 2, 8),
    ([[1, 1], [1, 2], [2, 3], [3, 5]], [3, 5, 8, 14], Kind.NO_SOLUTION, None, 2, [0, 1], 2, 8),
    ([[1, 2, 3, 4], [2, 4, 7, 9]], [5, 11], Kind.INFINITE, [2.0, 0.0, 1.0, 0.0], 2, [0, 2], 1, 4),
    ([[1, 1], [-1, 1]], [2, 0], Kind.UNIQUE, [1.0, 1.0], 2, [0, 1], 0, 2),
    ([[4]], [2], Kind.UNIQUE, [0.5], 1, [0], 0, 0),
    ([[1e-10]], [1], Kind.NO_SOLUTION, None, 0, [], 0, 0),
    ([[0, 0], [0, 0]], [0, 0], Kind.INFINITE, [0.0, 0.0], 0, [], 0, 0),
    ([[0.5, -1.25, 2], [3, 0.75, -1], [-2, 4, 0.125]], [1, -2, 3], Kind.UNIQUE, [-0.4800462695199537, 0.48120300751879697, 0.9207634470792365], 3, [0, 1, 2], 2, 8),
]
PINNED_DET = [
    ([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], -0.9999999999999993),
    ([[0, 1], [1, 0]], -1.0),
    ([[1, 2], [2, 4]], 0.0),
    ([[2, -1, 0, 3], [1, 4, -2, 0], [0, 5, 1, -1], [3, 0, 2, 2]], -74.0),
    ([[7.5]], 7.5),
]


class TestSolveFloat(unittest.TestCase):
    def test_worked_example(self):
        s = solve(WORKED_A, WORKED_B)
        self.assertIsInstance(s, Solution)
        self.assertEqual(s.kind, Kind.UNIQUE)
        self.assertEqual((s.rank, s.pivot_cols, s.swaps, s.updates), (3, [0, 1, 2], 2, 8))
        for got, want in zip(s.x, [2, 3, -1]):
            self.assertAlmostEqual(got, want, delta=EPS)
        self.assertEqual(s.x, [2.0, 3.0000000000000004, -0.9999999999999999])  # the exact doubles

    def test_random_systems_with_a_known_solution(self):
        rng = random.Random(1)
        for trial in range(400):
            n = rng.randint(1, 6)
            A = [[rng.randint(-9, 9) for _ in range(n)] for _ in range(n)]
            if det_cofactor(A) == 0:
                continue
            x_true = [rng.randint(-9, 9) for _ in range(n)]
            b = [sum(a * v for a, v in zip(row, x_true)) for row in A]
            s = solve(A, b)
            self.assertEqual(s.kind, Kind.UNIQUE, trial)
            self.assertEqual(s.rank, n)
            self.assertLessEqual(max(abs(g - w) for g, w in zip(s.x, x_true)), EPS, (A, b))

    def test_random_real_entries(self):
        rng = random.Random(2)
        for _ in range(300):
            n = rng.randint(1, 10)
            A = [[rng.uniform(-10, 10) for _ in range(n)] for _ in range(n)]
            x_true = [rng.uniform(-10, 10) for _ in range(n)]
            b = [sum(a * v for a, v in zip(row, x_true)) for row in A]
            s = solve(A, b)
            self.assertEqual(s.kind, Kind.UNIQUE)
            self.assertLessEqual(max(abs(g - w) for g, w in zip(s.x, x_true)), 1e-6)
            self.assertLessEqual(residual(A, s.x, b), EPS)

    def test_singular_and_inconsistent_built_on_purpose(self):
        rng = random.Random(3)
        for _ in range(300):
            n = rng.randint(2, 6)
            m = rng.randint(2, 6)
            A = [[rng.randint(-5, 5) for _ in range(m)] for _ in range(n - 1)]
            # The last row is a combination of the others, so the rank stays below n.
            weights = [rng.randint(-3, 3) for _ in range(n - 1)]
            A.append([sum(w * A[i][j] for i, w in enumerate(weights)) for j in range(m)])
            x_true = [rng.randint(-5, 5) for _ in range(m)]
            b = [sum(a * v for a, v in zip(row, x_true)) for row in A]
            s = solve(A, b)
            self.assertNotEqual(s.kind, Kind.NO_SOLUTION)
            self.assertEqual(s.rank, rank_brute(A[: n - 1]) if n - 1 <= 4 and m <= 4 else s.rank)
            self.assertLess(s.rank, n)
            self.assertLessEqual(residual(A, s.x, b), 1e-7)
            self.assertEqual(s.kind, Kind.UNIQUE if s.rank == m else Kind.INFINITE)
            b_bad = b[:-1] + [b[-1] + 1]  # the combination of the equations no longer holds
            bad = solve(A, b_bad)
            self.assertEqual(bad.kind, Kind.NO_SOLUTION, (A, b_bad))
            self.assertIsNone(bad.x)

    def test_rank_against_brute_force(self):
        rng = random.Random(4)
        for _ in range(500):
            n, m = rng.randint(1, 4), rng.randint(1, 4)
            A = [[rng.choice([0, 0, 1, -1, 2, 3]) for _ in range(m)] for _ in range(n)]
            if rng.random() < 0.3 and n > 1:
                A[-1] = [A[0][j] * 2 for j in range(m)]
            self.assertEqual(solve(A, [0] * n).rank, rank_brute(A), A)

    def test_determinant_against_cofactor_expansion(self):
        rng = random.Random(5)
        for _ in range(400):
            n = rng.randint(1, 6)
            A = [[rng.randint(-9, 9) for _ in range(n)] for _ in range(n)]
            if rng.random() < 0.2 and n > 1:
                A[-1] = A[0][:]
            want = det_cofactor(A)
            got = determinant(A)
            self.assertLessEqual(abs(got - float(want)), 1e-9 * max(1.0, abs(float(want))), A)

    def test_more_equations_than_unknowns(self):
        A = [[1, 1], [1, 2], [2, 3], [3, 5]]
        s = solve(A, [3, 5, 8, 13])
        self.assertEqual((s.kind, s.rank), (Kind.UNIQUE, 2))
        self.assertEqual(s.x, [1.0, 2.0])
        self.assertEqual(solve(A, [3, 5, 8, 14]).kind, Kind.NO_SOLUTION)
        same_column = [[1, 1], [2, 2], [3, 3]]
        s = solve(same_column, [2, 4, 6])
        self.assertEqual((s.kind, s.rank, s.pivot_cols), (Kind.INFINITE, 1, [0]))
        self.assertLessEqual(residual(same_column, s.x, [2, 4, 6]), EPS)

    def test_fewer_equations_than_unknowns(self):
        rng = random.Random(6)
        for _ in range(200):
            n = rng.randint(1, 4)
            m = rng.randint(n + 1, 6)
            A = [[rng.randint(-5, 5) for _ in range(m)] for _ in range(n)]
            b = [rng.randint(-5, 5) for _ in range(n)]
            s = solve(A, b)
            self.assertNotEqual(s.kind, Kind.UNIQUE)  # rank <= n < m: a free unknown is left
            if s.kind == Kind.INFINITE:
                self.assertLessEqual(residual(A, s.x, b), 1e-7)
                for c in set(range(m)) - set(s.pivot_cols):
                    self.assertEqual(s.x[c], 0.0)  # free unknowns are set to 0
        s = solve([[1, 2, 3, 4], [2, 4, 7, 9]], [5, 11])
        self.assertEqual((s.kind, s.pivot_cols, s.x), (Kind.INFINITE, [0, 2], [2.0, 0.0, 1.0, 0.0]))

    def test_the_pivoting_example(self):
        # Every pivot without pivoting is above EPS (1e-8, 1e-8, then about 1e16), yet the
        # multipliers of 1e8 make entries near 1e16, and x1 = 3 (the last equation) is lost.
        naive = solve_without_pivoting(PIVOT_A, PIVOT_B)
        good = solve(PIVOT_A, PIVOT_B)
        self.assertEqual(naive.kind, Kind.UNIQUE)
        self.assertEqual(naive.swaps, 0)
        self.assertEqual(naive.x, [1.9999999545383673, 4.470348358154297, 0.9999999800000005])
        self.assertGreater(abs(naive.x[1] - 3), 1)
        self.assertEqual(good.x, [1.99999997, 3.0, 0.9999999800000003])
        self.assertEqual(good.swaps, 2)
        exact = [Fraction(2) - 3 * Fraction(1e-08), Fraction(3), 1 - Fraction(1e-08) * (Fraction(2) - 3 * Fraction(1e-08))]
        self.assertLessEqual(max(abs(Fraction(g) - e) for g, e in zip(good.x, exact)), Fraction(1, 10**15))

    def test_without_pivoting_agrees_on_tame_systems(self):
        # On a diagonally dominant matrix both take the diagonal, and give the same answer.
        A = [[10, 1, 2], [1, 12, -3], [2, -1, 9]]
        b = [1, 2, 3]
        self.assertEqual(solve(A, b).x, solve_without_pivoting(A, b).x)
        self.assertEqual(solve(A, b).swaps, 0)

    def test_without_pivoting_still_skips_a_zero(self):
        s = solve_without_pivoting([[0, 1], [1, 0]], [2, 3])
        self.assertEqual((s.kind, s.x, s.swaps), (Kind.UNIQUE, [3.0, 2.0], 1))

    def test_tolerance(self):
        # 1e-10 <= EPS counts as zero: the equation reads 0 = 1.
        s = solve([[1e-10]], [1])
        self.assertEqual((s.kind, s.rank), (Kind.NO_SOLUTION, 0))
        s = solve([[1e-10]], [1], eps=1e-12)
        self.assertEqual((s.kind, s.x), (Kind.UNIQUE, [1e10]))
        self.assertEqual(solve([[1e-10]], [1e-10]).kind, Kind.INFINITE)

    def test_tie_keeps_the_upper_row(self):
        s = solve([[1, 1], [-1, 1]], [2, 0])
        self.assertEqual((s.swaps, s.x), (0, [1.0, 1.0]))
        s = solve([[1, 2], [3, 4]], [5, 6])
        self.assertEqual(s.swaps, 1)

    def test_one_by_one(self):
        self.assertEqual(solve([[4]], [2]), Solution(Kind.UNIQUE, [0.5], 1, [0], 0, 0))
        self.assertEqual(solve([[0]], [0]), Solution(Kind.INFINITE, [0.0], 0, [], 0, 0))
        self.assertEqual(solve([[0]], [3]), Solution(Kind.NO_SOLUTION, None, 0, [], 0, 0))
        self.assertEqual(determinant([[-2.5]]), -2.5)
        self.assertEqual(determinant([[0]]), 0.0)

    def test_zero_matrix(self):
        for n, m in ((1, 3), (3, 1), (3, 3), (2, 5)):
            Z = [[0] * m for _ in range(n)]
            s = solve(Z, [0] * n)
            self.assertEqual((s.kind, s.x, s.rank, s.updates), (Kind.INFINITE, [0.0] * m, 0, 0))
            self.assertEqual(solve(Z, [0] * (n - 1) + [1]).kind, Kind.NO_SOLUTION)
        self.assertEqual(determinant([[0, 0], [0, 0]]), 0.0)

    def test_zero_right_hand_side(self):
        s = solve([[1, 2], [3, 4]], [0, 0])
        self.assertEqual((s.kind, s.x), (Kind.UNIQUE, [0.0, 0.0]))
        s = solve([[1, 2, 3], [2, 4, 6], [1, 0, 1]], [0, 0, 0])
        self.assertEqual((s.kind, s.rank), (Kind.INFINITE, 2))
        self.assertEqual([abs(v) for v in s.x], [0.0, 0.0, 0.0])  # x = 0 always solves a homogeneous system

    def test_input_is_not_modified(self):
        A = [row[:] for row in WORKED_A]
        b = WORKED_B[:]
        solve(A, b)
        determinant(A)
        solve_mod(A, b, 7)
        self.assertEqual((A, b), (WORKED_A, WORKED_B))

    def test_errors(self):
        cases = [
            ([], [], "no rows"),
            ([[]], [1], "no columns"),
            ([[1, 2], [3]], [1, 2], "row 1 of A has 1 entries"),
            ([[1, 2], [3, 4]], [1], "b has 1 entries"),
        ]
        for A, b, message in cases:
            for call in (lambda: solve(A, b), lambda: solve_without_pivoting(A, b), lambda: solve_mod(A, b, 7)):
                with self.assertRaises(ValueError) as ctx:
                    call()
                self.assertIn(message, str(ctx.exception))
        for A in ([], [[1, 2]], [[1, 2], [3]]):
            with self.assertRaises(ValueError):
                determinant(A)
            with self.assertRaises(ValueError):
                determinant_mod(A, 7)

    def test_pinned_values(self):
        for A, b, kind, x, rank, pivots, swaps, updates in PINNED_FLOAT:
            s = solve(A, b)
            self.assertEqual((s.kind, s.x, s.rank, s.pivot_cols, s.swaps, s.updates), (kind, x, rank, pivots, swaps, updates), (A, b))
        for A, want in PINNED_DET:
            self.assertEqual(determinant(A), want, A)


class TestSolveMod(unittest.TestCase):
    def test_worked_example(self):
        s = solve_mod(WORKED_A, WORKED_B, 7)
        self.assertEqual(s, Solution(Kind.UNIQUE, [2, 3, 6], 3, [0, 1, 2], 0, 8))  # -1 = 6 (mod 7)
        self.assertEqual(determinant_mod(WORKED_A, 7), 6)
        self.assertEqual(solve_mod(WORKED_A, WORKED_B, 10**9 + 7).x, [2, 3, 10**9 + 6])

    def test_random_systems_with_a_known_solution(self):
        rng = random.Random(7)
        for p in PRIMES:
            for _ in range(60):
                n = rng.randint(1, 6)
                m = rng.randint(1, 6)
                A = [[rng.randrange(-p, 2 * p) for _ in range(m)] for _ in range(n)]
                x_true = [rng.randrange(p) for _ in range(m)]
                b = mat_vec_mod(A, x_true, p)
                s = solve_mod(A, b, p)
                self.assertNotEqual(s.kind, Kind.NO_SOLUTION, (A, b, p))
                self.assertEqual(mat_vec_mod(A, s.x, p), [v % p for v in b])
                self.assertTrue(all(0 <= v < p for v in s.x))
                if s.rank == m:
                    self.assertEqual((s.kind, s.x), (Kind.UNIQUE, x_true))
                else:
                    self.assertEqual(s.kind, Kind.INFINITE)

    def test_rank_against_brute_force(self):
        rng = random.Random(8)
        for p in (2, 3, 5, 7, 1009):
            for _ in range(150):
                n, m = rng.randint(1, 4), rng.randint(1, 4)
                A = [[rng.randrange(p) if rng.random() < 0.7 else 0 for _ in range(m)] for _ in range(n)]
                self.assertEqual(solve_mod(A, [0] * n, p).rank, rank_brute(A, p), (A, p))

    def test_determinant_against_cofactor_expansion(self):
        rng = random.Random(9)
        for p in PRIMES:
            for _ in range(40):
                n = rng.randint(1, 5)
                A = [[rng.randrange(-p, p) for _ in range(n)] for _ in range(n)]
                if rng.random() < 0.2 and n > 1:
                    A[-1] = [3 * v for v in A[0]]
                self.assertEqual(determinant_mod(A, p), det_cofactor(A).numerator % p, (A, p))

    def test_singular_and_inconsistent_built_on_purpose(self):
        rng = random.Random(10)
        for p in (5, 13, 998244353):
            for _ in range(80):
                n, m = rng.randint(2, 5), rng.randint(1, 5)
                A = [[rng.randrange(p) for _ in range(m)] for _ in range(n - 1)]
                w = [rng.randrange(p) for _ in range(n - 1)]
                A.append([sum(wi * A[i][j] for i, wi in enumerate(w)) % p for j in range(m)])
                x_true = [rng.randrange(p) for _ in range(m)]
                b = mat_vec_mod(A, x_true, p)
                s = solve_mod(A, b, p)
                self.assertLess(s.rank, n)
                self.assertEqual(mat_vec_mod(A, s.x, p), b)
                bad = solve_mod(A, b[:-1] + [(b[-1] + 1) % p], p)
                self.assertEqual((bad.kind, bad.x), (Kind.NO_SOLUTION, None))

    def test_a_zero_pivot_is_skipped_and_columns_can_be_free(self):
        s = solve_mod([[0, 1, 2], [0, 2, 5], [0, 3, 7]], [1, 2, 3], 13)
        self.assertEqual((s.kind, s.pivot_cols, s.x), (Kind.INFINITE, [1, 2], [0, 1, 0]))
        s = solve_mod([[1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], [4, 5, 6], 1000003)
        self.assertEqual((s.pivot_cols, s.x), ([0, 2, 3], [4, 0, 5, 6]))

    def test_entries_equal_to_p_are_zero(self):
        self.assertEqual(solve_mod([[7]], [3], 7).kind, Kind.NO_SOLUTION)
        self.assertEqual(solve_mod([[7]], [14], 7), Solution(Kind.INFINITE, [0], 0, [], 0, 0))
        self.assertEqual(solve_mod([[-1, -2], [-3, -4]], [-5, -6], 10**9 + 7).x, [10**9 + 3, 500000008])

    def test_64_bit_modulus(self):
        A = [[2**63 - 1, -(2**63), 3], [5, 2**63 - 8, -11], [-(2**63) + 1, 13, 2**63 - 1]]
        b = [1, 2**63 - 1, -(2**63)]
        s = solve_mod(A, b, P64)
        self.assertEqual(s.kind, Kind.UNIQUE)
        self.assertEqual(mat_vec_mod(A, s.x, P64), [v % P64 for v in b])

    def test_one_by_one_and_zero_matrix(self):
        self.assertEqual(solve_mod([[5]], [3], 7), Solution(Kind.UNIQUE, [2], 1, [0], 0, 0))  # 5 * 2 = 10 = 3
        self.assertEqual(solve_mod([[0]], [0], 5), Solution(Kind.INFINITE, [0], 0, [], 0, 0))
        self.assertEqual(solve_mod([[0]], [4], 5), Solution(Kind.NO_SOLUTION, None, 0, [], 0, 0))
        self.assertEqual(solve_mod([[0, 0, 0], [0, 0, 0]], [0, 0], 11).x, [0, 0, 0])
        self.assertEqual(determinant_mod([[0, 0], [0, 0]], 11), 0)
        self.assertEqual(determinant_mod([[-3]], 7), 4)

    def test_zero_right_hand_side(self):
        self.assertEqual(solve_mod([[1, 2, 3], [0, 1, 4], [5, 6, 0]], [0, 0, 0], 101).x, [0, 0, 0])
        self.assertEqual(solve_mod([[1, 2, 3], [2, 4, 6], [1, 0, 1]], [0, 0, 0], 101).kind, Kind.INFINITE)

    def test_swap_flips_the_sign(self):
        self.assertEqual(determinant_mod([[0, 1], [1, 0]], 5), 4)  # -1
        self.assertEqual(determinant_mod([[0, 1], [1, 0]], 2), 1)  # -1 = 1 modulo 2
        self.assertEqual(determinant_mod([[0, 0, 1], [0, 1, 0], [1, 0, 0]], 1000003), 1000002)

    def test_errors(self):
        for p in (1, 0, -7):
            with self.assertRaises(ValueError) as ctx:
                solve_mod([[1]], [1], p)
            self.assertIn("at least 2", str(ctx.exception))
            with self.assertRaises(ValueError):
                determinant_mod([[1]], p)
        # 4 is not prime: 2 has no inverse modulo 4, and the check of the Fermat inverse says so.
        with self.assertRaises(ValueError) as ctx:
            solve_mod([[2]], [1], 4)
        self.assertIn("p must be prime", str(ctx.exception))
        with self.assertRaises(ValueError):
            determinant_mod([[3, 1], [1, 1]], 9)

    def test_pinned_values(self):
        for A, b, p, kind, x, rank, pivots, swaps, updates in PINNED_MOD:
            self.assertEqual(solve_mod(A, b, p), Solution(kind, x, rank, pivots, swaps, updates), (A, b, p))
        for A, p, want in PINNED_DET_MOD:
            self.assertEqual(determinant_mod(A, p), want, (A, p))
            self.assertEqual(want, det_cofactor(A).numerator % p)


class CountingRow(list):
    """A row that counts the entries written into it."""

    writes = 0

    def __setitem__(self, index, value):
        self.writes += 1
        super().__setitem__(index, value)


class TestWork(unittest.TestCase):
    """Counts the row operations through the module-level _subtract_row and _inverse, and the
    entries each one really writes (the target row is swapped for a CountingRow meanwhile)."""

    def setUp(self):
        self.calls = []
        self.writes = 0
        real_float, real_mod, real_inverse = module._subtract_row, module._subtract_row_mod, module._inverse

        def counted(M, target, source, col, factor):
            self.calls.append((target, source, col))
            row = CountingRow(M[target])
            M[target] = row
            done = real_float(M, target, source, col, factor)
            M[target] = list(row)
            self.writes += row.writes - 1  # the pivot column is set to 0, not computed
            return done

        def counted_mod(M, target, source, col, factor, p):
            self.calls.append((target, source, col))
            return real_mod(M, target, source, col, factor, p)

        self.inverses = 0

        def counted_inverse(a, p):
            self.inverses += 1
            return real_inverse(a, p)

        module._subtract_row, module._subtract_row_mod, module._inverse = counted, counted_mod, counted_inverse
        self.addCleanup(setattr, module, "_subtract_row", real_float)
        self.addCleanup(setattr, module, "_subtract_row_mod", real_mod)
        self.addCleanup(setattr, module, "_inverse", real_inverse)

    def test_dense_square_is_cubic(self):
        # Pivot k: n - 1 - k rows below it, each with n - k entries right of the pivot column
        # (the last one is b). The sum is (n - 1) n (n + 1) / 3, about n^3 / 3.
        rng = random.Random(11)
        for n in (1, 2, 3, 5, 10, 20, 40, 80):
            A = [[rng.uniform(1, 2) for _ in range(n)] for _ in range(n)]
            del self.calls[:]
            self.writes = 0
            s = solve(A, [1.0] * n)
            self.assertEqual(s.updates, (n - 1) * n * (n + 1) // 3, n)
            self.assertEqual(self.writes, s.updates, n)  # only the entries right of the pivot column
            self.assertEqual(len(self.calls), n * (n - 1) // 2, n)
            for target, source, col in self.calls:
                self.assertEqual(source, col)  # full rank: the pivot of column col sits in row col
                self.assertGreater(target, source)

    def test_non_square_count(self):
        rng = random.Random(12)
        for n, m in ((5, 3), (3, 5), (8, 2), (2, 8)):
            A = [[rng.uniform(1, 2) for _ in range(m)] for _ in range(n)]
            want = sum((n - 1 - k) * (m - k) for k in range(min(n, m)))
            self.writes = 0
            self.assertEqual(solve(A, [0.0] * n).updates, want, (n, m))
            self.assertEqual(self.writes, want, (n, m))

    def test_rows_that_are_already_zero_are_skipped(self):
        # Losing the "already zero" check would make n (n - 1) / 2 calls on these.
        for n in (1, 4, 9):
            identity = [[float(i == j) for j in range(n)] for i in range(n)]
            upper = [[float(j >= i) for j in range(n)] for i in range(n)]
            for A in (identity, upper):
                del self.calls[:]
                self.assertEqual(solve(A, [1.0] * n).updates, 0)
                self.assertEqual(self.calls, [])
        del self.calls[:]
        solve_mod([[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2, 3], 7)
        self.assertEqual(self.calls, [])

    def test_one_inverse_per_pivot(self):
        rng = random.Random(13)
        for _ in range(100):
            n, m = rng.randint(1, 7), rng.randint(1, 7)
            A = [[rng.randrange(5) for _ in range(m)] for _ in range(n)]
            self.inverses = 0
            s = solve_mod(A, [rng.randrange(5) for _ in range(n)], 5)
            self.assertEqual(self.inverses, s.rank, A)  # reused for every row and for x


if __name__ == "__main__":
    unittest.main()
