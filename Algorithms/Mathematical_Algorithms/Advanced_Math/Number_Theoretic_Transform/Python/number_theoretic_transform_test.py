"""
Unit tests for the Number Theoretic Transform: the constants, the roots of unity, the bit-reversal
order against the FFT's recursion, the transform against the direct O(n^2) sum, the round trip,
the products against schoolbook multiplication modulo p and against the Fast Fourier Transform
topic's rounded products, the edge cases, the length limit, and a count of the butterflies.
"""

import importlib.util
import math
import random
import unittest
from pathlib import Path

import number_theoretic_transform as module
from number_theoretic_transform import (
    MAX_LENGTH,
    MOD,
    PRIMITIVE_ROOT,
    bit_reverse_permute,
    convolve,
    intt,
    multiply_polynomials,
    ntt,
    ntt_in_place,
    root_of_unity,
)

FFT_FILE = Path(__file__).resolve().parents[2] / "Fast_Fourier_Transform" / "Python" / "fast_fourier_transform.py"


def load_fft():
    """The Fast Fourier Transform topic's Python module, imported by path."""
    spec = importlib.util.spec_from_file_location("fast_fourier_transform", FFT_FILE)
    fft_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fft_module)
    return fft_module


def direct_transform(a, inverse=False):
    """The definition, X[k] = sum_j a[j] * w^(j*k) mod MOD, in O(n^2); the inverse divides by n."""
    n = len(a)
    w = root_of_unity(n, inverse)
    out = [sum(a[j] * pow(w, j * k, MOD) for j in range(n)) % MOD for k in range(n)]
    if inverse:
        n_inverse = pow(n, MOD - 2, MOD)
        out = [x * n_inverse % MOD for x in out]
    return out


def schoolbook(p, q):
    """The exact product, O(len(p) * len(q)); empty when either is empty."""
    if not p or not q:
        return []
    out = [0] * (len(p) + len(q) - 1)
    for i, x in enumerate(p):
        for j, y in enumerate(q):
            out[i + j] += x * y
    return out


def exact_product(p, q):
    """The exact product of non-negative coefficient lists by Kronecker substitution: one big-integer product."""
    bits = (max(p) * max(q) * min(len(p), len(q))).bit_length() + 1
    pack = lambda xs: sum(x << (bits * i) for i, x in enumerate(xs))
    r = pack(p) * pack(q)
    mask = (1 << bits) - 1
    return [(r >> (bits * i)) & mask for i in range(len(p) + len(q) - 1)]


def leaf_order(a):
    """The order in which the FFT's recursion reaches its single values: evens first, recursively."""
    if len(a) <= 1:
        return list(a)
    return leaf_order(a[0::2]) + leaf_order(a[1::2])


def next_power_of_two(n):
    size = 1
    while size < n:
        size <<= 1
    return size


# The values the C++ and Go tests pin, all computed by this module (ROOTS[k] = root_of_unity(2^k)).
PINNED_ROOTS = [
    1, 998244352, 911660635, 372528824, 929031873, 452798380, 922799308, 781712469, 476477967, 166035806, 258648936, 584193783,
    63912897, 350007156, 666702199, 968855178, 629671588, 24514907, 996173970, 363395222, 565042129, 733596141, 267099868, 15311432,
]
PINNED_TRANSFORMS = [
    ([1, 2, 3, 4], False, [10, 173167434, 998244351, 825076915]),
    ([10, 173167434, 998244351, 825076915], True, [1, 2, 3, 4]),
    ([1, 2, 3], False, [6, 825076915, 2, 173167434]),
    ([1, 0, 0, 0], False, [1, 1, 1, 1]),
    ([0, 1, 0, 0, 0, 0, 0, 0], False, [1, 372528824, 911660635, 488723995, 998244352, 625715529, 86583718, 509520358]),
    ([-1, -2, MOD, 2 * MOD + 5], False, [2, 606086025, 998244349, 392158326]),
    ([7], False, [7]),
    ([7], True, [7]),
    ([], False, []),
]
PINNED_PRODUCTS = [
    ([1, 2, 3], [4, 5], [4, 13, 22, 15]),
    ([1, 2], [3, 4], [3, 10, 8]),
    ([1, 1], [1, 1], [1, 2, 1]),
    ([1, -1], [1, 1], [1, 0, MOD - 1]),
    ([7], [3], [21]),
    ([0, 0, 0], [1, 2], [0, 0, 0, 0]),
    ([MOD - 1], [MOD - 1], [1]),
    ([MOD - 2], [MOD - 2], [4]),
    ([10**9], [10**9], [10**18 % MOD]),
    ([MOD - 1] * 3, [MOD - 1] * 3, [1, 2, 3, 2, 1]),
    ([], [], []),
    ([], [5], []),
    ([], [1, 2, 3], [0, 0]),
    ([73000000, 11000000, 53000000], [37000000, 55000000, 53000000], [341870250, 124700719, 457102099, 53946344, 285319180]),
]


class TestConstants(unittest.TestCase):
    def test_the_prime(self):
        self.assertEqual(MOD, 119 * 2**23 + 1)
        self.assertTrue(all(MOD % d for d in range(2, math.isqrt(MOD) + 1)))

    def test_three_is_a_primitive_root(self):
        # MOD - 1 = 2^23 * 7 * 17: 3 generates every nonzero residue when no 3^((MOD - 1) / q) is 1.
        self.assertEqual((MOD - 1), 2**23 * 7 * 17)
        self.assertEqual(PRIMITIVE_ROOT, 3)
        for q in (2, 7, 17):
            self.assertNotEqual(pow(3, (MOD - 1) // q, MOD), 1, q)
        self.assertEqual(pow(3, MOD - 1, MOD), 1)

    def test_max_length_is_the_largest_power_of_two_in_p_minus_1(self):
        self.assertEqual(MAX_LENGTH, 2**23)
        self.assertEqual((MOD - 1) % MAX_LENGTH, 0)
        self.assertNotEqual((MOD - 1) % (2 * MAX_LENGTH), 0)


class TestRootOfUnity(unittest.TestCase):
    def test_every_order_from_1_to_2_23(self):
        for k in range(24):
            n = 2**k
            w = root_of_unity(n)
            self.assertEqual(w, pow(3, (MOD - 1) // n, MOD))
            self.assertEqual(pow(w, n, MOD), 1, n)
            if n >= 2:
                # w^(n/2) = -1, so the order of w is exactly n: a primitive n-th root.
                self.assertEqual(pow(w, n // 2, MOD), MOD - 1, n)
            self.assertEqual(w * root_of_unity(n, inverse=True) % MOD, 1, n)

    def test_small_roots(self):
        self.assertEqual(root_of_unity(1), 1)
        self.assertEqual(root_of_unity(2), MOD - 1)
        self.assertEqual(root_of_unity(4), 911660635)
        self.assertEqual(911660635 * 911660635 % MOD, MOD - 1)  # a square root of -1, the FFT's -i
        self.assertEqual(root_of_unity(4, inverse=True), 86583718)

    def test_squaring_halves_the_order(self):
        # The FFT's fact: the squares of the n-th roots are the n/2-th roots.
        for k in range(1, 24):
            self.assertEqual(root_of_unity(2**k) ** 2 % MOD, root_of_unity(2 ** (k - 1)), k)

    def test_pinned(self):
        self.assertEqual([root_of_unity(2**k) for k in range(24)], PINNED_ROOTS)

    def test_bad_orders_raise(self):
        for n in (0, -4, 3, 6, 12, 2**24, 2**25):
            with self.assertRaises(ValueError):
                root_of_unity(n)


class TestBitReversal(unittest.TestCase):
    def test_eight(self):
        a = list(range(8))
        bit_reverse_permute(a)
        self.assertEqual(a, [0, 4, 2, 6, 1, 5, 3, 7])

    def test_is_the_recursions_leaf_order(self):
        for k in range(0, 11):
            a = list(range(2**k))
            bit_reverse_permute(a)
            self.assertEqual(a, leaf_order(list(range(2**k))), k)
            self.assertEqual(a, [int(format(i, f"0{k}b")[::-1] or "0", 2) for i in range(2**k)], k)

    def test_twice_is_the_identity_and_empty_is_fine(self):
        a = list(range(64))
        bit_reverse_permute(a)
        bit_reverse_permute(a)
        self.assertEqual(a, list(range(64)))
        empty = []
        bit_reverse_permute(empty)
        self.assertEqual(empty, [])


class TestTransform(unittest.TestCase):
    def test_worked_example(self):
        self.assertEqual(ntt([1, 2, 3, 4]), [10, 173167434, 998244351, 825076915])
        w = root_of_unity(4)
        self.assertEqual(ntt([1, 2, 3, 4])[1], (-2 - 2 * w) % MOD)  # the FFT's -2 + 2i with w = -i
        self.assertEqual(ntt([1, 2, 3, 4])[2], MOD - 2)

    def test_against_the_direct_sum(self):
        rng = random.Random(20261124)
        for n in range(1, 65):
            a = [rng.randrange(MOD) for _ in range(n)]
            size = next_power_of_two(n)
            padded = a + [0] * (size - n)
            self.assertEqual(ntt(a), direct_transform(padded), n)
            if size == n:
                self.assertEqual(intt(a), direct_transform(a, inverse=True), n)

    def test_round_trip(self):
        rng = random.Random(1)
        for k in range(0, 13):
            n = 2**k
            for _ in range(3):
                a = [rng.randrange(-(10**12), 10**12) for _ in range(n)]
                self.assertEqual(intt(ntt(a)), [x % MOD for x in a], n)
                self.assertEqual(ntt(intt(a)), [x % MOD for x in a], n)

    def test_round_trip_after_padding(self):
        rng = random.Random(2)
        for n in (3, 5, 6, 7, 9, 100, 1000):
            a = [rng.randrange(MOD) for _ in range(n)]
            self.assertEqual(intt(ntt(a)), a + [0] * (next_power_of_two(n) - n), n)

    def test_delta_and_shifted_delta(self):
        self.assertEqual(ntt([1] + [0] * 15), [1] * 16)
        w = root_of_unity(16)
        self.assertEqual(ntt([0, 1] + [0] * 14), [pow(w, k, MOD) for k in range(16)])

    def test_edge_lengths(self):
        self.assertEqual(ntt([]), [])
        self.assertEqual(intt([]), [])
        self.assertEqual(ntt([5]), [5])
        self.assertEqual(intt([5]), [5])
        self.assertEqual(ntt([-1]), [MOD - 1])
        self.assertEqual(len(ntt([1, 2, 3])), 4)

    def test_inputs_are_reduced(self):
        self.assertEqual(ntt([-1, -2, MOD, 2 * MOD + 5]), ntt([MOD - 1, MOD - 2, 0, 5]))
        self.assertEqual(ntt([MOD - 1] * 4), [MOD - 4, 0, 0, 0])

    def test_pinned(self):
        for a, inverse, want in PINNED_TRANSFORMS:
            self.assertEqual(ntt(a, inverse), want, (a, inverse))

    def test_errors(self):
        with self.assertRaises(ValueError) as ctx:
            intt([1, 2, 3])
        self.assertIn("power-of-two", str(ctx.exception))
        with self.assertRaises(TypeError):
            ntt([1.5, 2])
        with self.assertRaises(ValueError) as ctx:
            ntt([0] * (MAX_LENGTH + 1))
        self.assertIn("2^23", str(ctx.exception))
        for bad in ([], [1, 2, 3]):
            with self.assertRaises(ValueError):
                ntt_in_place(bad)

    def test_in_place(self):
        a = [5, 1, 4, 2, 3, 0, 0, 7]
        want = ntt(a)
        same = a
        self.assertEqual(ntt_in_place(a), 12)
        self.assertIs(a, same)
        self.assertEqual(a, want)
        self.assertEqual(ntt_in_place(a, inverse=True), 12)
        self.assertEqual(a, [5, 1, 4, 2, 3, 0, 0, 7])


class TestButterflyCount(unittest.TestCase):
    """Counts the butterflies through the module-level _butterfly: (n / 2) log2 n per transform."""

    def setUp(self):
        real = module._butterfly
        self.pairs = []

        def counted(a, i, j, w):
            self.pairs.append((i, j))
            real(a, i, j, w)

        module._butterfly = counted
        self.addCleanup(setattr, module, "_butterfly", real)

    def test_exactly_n_over_2_log_n(self):
        rng = random.Random(3)
        for k in range(0, 13):
            n = 2**k
            for inverse in (False, True):
                del self.pairs[:]
                returned = ntt_in_place([rng.randrange(MOD) for _ in range(n)], inverse)
                self.assertEqual(len(self.pairs), n // 2 * k, (n, inverse))
                self.assertEqual(returned, n // 2 * k)

    def test_each_stage_touches_every_index_once(self):
        n = 64
        ntt_in_place(list(range(n)))
        stages = [self.pairs[s * n // 2 : (s + 1) * n // 2] for s in range(6)]
        for s, stage in enumerate(stages):
            half = 2**s
            touched = sorted(i for pair in stage for i in pair)
            self.assertEqual(touched, list(range(n)), s)
            self.assertTrue(all(j - i == half for i, j in stage), s)

    def test_a_product_is_three_transforms(self):
        for lp, lq in ((1, 1), (3, 2), (5, 4), (17, 16), (100, 29)):
            del self.pairs[:]
            multiply_polynomials(list(range(1, lp + 1)), list(range(1, lq + 1)))
            n = next_power_of_two(lp + lq - 1)
            self.assertEqual(len(self.pairs), 3 * (n // 2) * int(math.log2(n)), (lp, lq))

    def test_one_root_per_stage(self):
        # root_of_unity is computed once per stage, log2(n) times, not once per block or butterfly.
        real = module.root_of_unity
        calls = []

        def recorded(n, inverse=False):
            calls.append(n)
            return real(n, inverse)

        module.root_of_unity = recorded
        self.addCleanup(setattr, module, "root_of_unity", real)
        for k in range(0, 11):
            del calls[:]
            ntt_in_place([1] * 2**k)
            self.assertEqual(calls, [2**s for s in range(1, k + 1)], k)

    def test_growth_is_n_log_n(self):
        counts = {}
        for k in (8, 10, 12):
            del self.pairs[:]
            ntt([1] * 2**k)
            counts[k] = len(self.pairs)
        self.assertEqual(counts, {8: 1024, 10: 5120, 12: 24576})


class TestMultiply(unittest.TestCase):
    def test_worked_examples(self):
        self.assertEqual(multiply_polynomials([1, 2, 3], [4, 5]), [4, 13, 22, 15])
        self.assertEqual(multiply_polynomials([1, 2], [3, 4]), [3, 10, 8])
        self.assertEqual(convolve([1, 2, 3], [4, 5]), multiply_polynomials([1, 2, 3], [4, 5]))

    def test_against_schoolbook_modulo_p(self):
        # 6 seeds x 60 rounds x 2 pairs: residues of lengths 1..40, then signed values up to 10^15.
        for seed in range(6):
            rng = random.Random(seed)
            for _ in range(60):
                p = [rng.randrange(MOD) for _ in range(rng.randint(1, 40))]
                q = [rng.randrange(MOD) for _ in range(rng.randint(1, 40))]
                self.assertEqual(multiply_polynomials(p, q), [x % MOD for x in schoolbook(p, q)], (seed, p, q))
                p = [rng.randint(-(10**15), 10**15) for _ in range(rng.randint(1, 20))]
                q = [rng.randint(-(10**15), 10**15) for _ in range(rng.randint(1, 20))]
                self.assertEqual(multiply_polynomials(p, q), [x % MOD for x in schoolbook(p, q)], (seed, p, q))

    def test_a_long_product(self):
        rng = random.Random(11)
        p = [rng.randrange(MOD) for _ in range(700)]
        q = [rng.randrange(MOD) for _ in range(900)]
        self.assertEqual(multiply_polynomials(p, q), [x % MOD for x in schoolbook(p, q)])

    def test_edge_cases(self):
        self.assertEqual(multiply_polynomials([], []), [])
        self.assertEqual(multiply_polynomials([], [5]), [])
        self.assertEqual(multiply_polynomials([], [1, 2, 3]), [0, 0])
        self.assertEqual(multiply_polynomials([1, 2, 3], []), [0, 0])
        self.assertEqual(multiply_polynomials([7], [3]), [21])
        self.assertEqual(multiply_polynomials([0, 0, 0], [1, 2]), [0, 0, 0, 0])
        self.assertEqual(multiply_polynomials([0, 1, 0, 2], [3, 0, 0, 0, 1]), [0, 3, 0, 6, 0, 1, 0, 2])
        self.assertEqual(multiply_polynomials([MOD - 1], [MOD - 1]), [1])
        # (sum of -x^i)^2: coefficient k is (k + 1) or (2m - 1 - k), positive because (-1)^2 = 1.
        self.assertEqual(multiply_polynomials([MOD - 1] * 5, [MOD - 1] * 3), [1, 2, 3, 3, 3, 2, 1])
        # 1000 coefficients of MOD - 1 on each side: every butterfly multiplies residues near 2^30.
        self.assertEqual(multiply_polynomials([MOD - 1] * 1000, [MOD - 1] * 1000), [min(k + 1, 1999 - k) for k in range(1999)])

    def test_lengths_that_are_not_powers_of_two(self):
        rng = random.Random(12)
        for lp, lq in ((3, 6), (5, 5), (2, 7), (9, 8), (33, 1), (1, 1)):
            p = [rng.randrange(MOD) for _ in range(lp)]
            q = [rng.randrange(MOD) for _ in range(lq)]
            got = multiply_polynomials(p, q)
            self.assertEqual(len(got), lp + lq - 1)
            self.assertEqual(got, [x % MOD for x in schoolbook(p, q)])

    def test_results_above_p_come_out_reduced(self):
        self.assertEqual(multiply_polynomials([10**9], [10**9]), [10**18 % MOD])
        self.assertEqual(multiply_polynomials([1, -1], [1, 1]), [1, 0, MOD - 1])  # 1 - x^2: -1 is MOD - 1

    def test_pinned(self):
        for p, q, want in PINNED_PRODUCTS:
            self.assertEqual(multiply_polynomials(p, q), want, (p, q))

    def test_the_length_limit(self):
        with self.assertRaises(ValueError) as ctx:
            multiply_polynomials([1], [0] * (MAX_LENGTH + 1))
        self.assertIn("8388609 coefficients", str(ctx.exception))
        with self.assertRaises(ValueError):
            multiply_polynomials([], [0] * (MAX_LENGTH + 2))


class TestAgainstTheFft(unittest.TestCase):
    """The Fast Fourier Transform topic's multiply_polynomials, rounded from doubles, against the NTT."""

    @classmethod
    def setUpClass(cls):
        cls.fft = load_fft()

    def test_equal_when_the_fft_is_exact(self):
        rng = random.Random(13)
        for _ in range(200):
            p = [rng.randint(0, 1000) for _ in range(rng.randint(1, 64))]
            q = [rng.randint(0, 1000) for _ in range(rng.randint(1, 64))]
            rounded = self.fft.multiply_polynomials(p, q)
            self.assertEqual(rounded, schoolbook(p, q))  # every result is below 64 * 10^6 < MOD
            self.assertEqual(multiply_polynomials(p, q), rounded)

    def test_negative_coefficients_agree_modulo_p(self):
        rng = random.Random(14)
        for _ in range(200):
            p = [rng.randint(-1000, 1000) for _ in range(rng.randint(1, 32))]
            q = [rng.randint(-1000, 1000) for _ in range(rng.randint(1, 32))]
            self.assertEqual(multiply_polynomials(p, q), [x % MOD for x in self.fft.multiply_polynomials(p, q)])

    def test_empty_inputs_give_the_same_lengths(self):
        for p, q in (([], []), ([], [5]), ([], [1, 2]), ([], [1, 2, 3]), ([4, 5, 6], [])):
            self.assertEqual(multiply_polynomials(p, q), self.fft.multiply_polynomials(p, q), (p, q))

    def test_one_coefficient_above_2_53(self):
        # (MOD - 2)^2 is odd and above 2^53, so no double holds it: the FFT is off by one, and
        # therefore wrong modulo MOD too. The NTT returns (-2)^2 = 4, the true value modulo MOD.
        x = MOD - 2
        rounded = self.fft.multiply_polynomials([x], [x])
        self.assertGreater(x * x, 2**53)
        self.assertEqual(rounded, [x * x - 1])
        self.assertEqual(rounded[0] % MOD, 3)
        self.assertEqual(multiply_polynomials([x], [x]), [4])
        self.assertEqual(x * x % MOD, 4)

    def test_rounding_errors_below_2_53(self):
        # 4096 coefficients up to 2 * 10^6 on each side: every true coefficient is below 2^53, but
        # the FFT's errors grow with n and thousands of its rounded coefficients are wrong.
        rng = random.Random(15)
        p = [rng.randint(0, 2 * 10**6) for _ in range(4096)]
        q = [rng.randint(0, 2 * 10**6) for _ in range(4096)]
        true = exact_product(p, q)
        self.assertLess(max(true), 2**53)
        self.assertEqual(true[:50], schoolbook(p[:50], q[:50])[:50])
        rounded = self.fft.multiply_polynomials(p, q)
        wrong = sum(1 for x, y in zip(rounded, true) if x != y)
        self.assertGreater(wrong, 1000)
        self.assertEqual(sum(1 for x, y in zip(rounded, true) if x % MOD != y % MOD), wrong)
        self.assertEqual(multiply_polynomials(p, q), [y % MOD for y in true])

    def test_the_small_example_modulo_p(self):
        # All five true coefficients lie between MOD and 2^53, so the NTT returns their residues.
        p, q = [73000000, 11000000, 53000000], [37000000, 55000000, 53000000]
        true = schoolbook(p, q)
        self.assertEqual(true, [2701 * 10**12, 4422 * 10**12, 6435 * 10**12, 3498 * 10**12, 2809 * 10**12])
        self.assertTrue(all(MOD < y < 2**53 for y in true))
        self.assertEqual(multiply_polynomials(p, q), [y % MOD for y in true])


if __name__ == "__main__":
    unittest.main()
