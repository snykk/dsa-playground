"""
Unit tests for Euler's totient: phi against a count of gcds, the linear sieve against phi, the
properties the code relies on, Euler's theorem and the inverse against the extended Euclidean
one, the edge cases and the 64-bit limits. Two tests count the work: the candidates trial
division tries, and how often the linear sieve crosses out each number.
"""

import math
import random
import unittest
from collections import Counter

import eulers_totient as module
from eulers_totient import TotientSieve, linear_sieve, mod_inverse_euler, phi, prime_factors

U64_MAX = 2**64 - 1


def phi_by_gcd(n):
    """The definition: how many k in 1..n have gcd(k, n) = 1."""
    return sum(1 for k in range(1, n + 1) if math.gcd(k, n) == 1)


def is_prime(n):
    return n >= 2 and all(n % d for d in range(2, math.isqrt(n) + 1))


def divisors(n):
    small = [d for d in range(1, math.isqrt(n) + 1) if n % d == 0]
    return sorted(set(small + [n // d for d in small]))


def divisors_from_factors(factors):
    ds = [1]
    for p, k in factors:
        ds = [d * p**e for d in ds for e in range(k + 1)]
    return sorted(ds)


def extended_gcd(a, b):
    """(g, x, y) with a*x + b*y = g = gcd(a, b), for a, b >= 0: the reference inverse."""
    old_r, r, old_x, x, old_y, y = a, b, 1, 0, 0, 1
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_x, x = x, old_x - q * x
        old_y, y = y, old_y - q * y
    return old_r, old_x, old_y


def inverse_by_extended_gcd(a, n):
    g, x, _ = extended_gcd(a % n, n)
    if g != 1:
        return None
    return x % n


# The values the C++ and Go tests pin, all computed by this module.
PINNED_PHI = [
    (1, 1), (2, 1), (3, 2), (4, 2), (5, 4), (6, 2), (7, 6), (8, 4), (9, 6), (10, 4), (12, 4), (30, 8),
    (36, 12), (97, 96), (100, 40), (360, 96), (1024, 512), (1001, 720), (65536, 32768), (65537, 65536),
    (999983, 999982), (4294967291, 4294967290), (12884901873, 8589934580), (999999999989, 999999999988),
    (10**18, 400000000000000000), (2**63, 2**62), (3**40, 2 * 3**39), (2**63 - 1, 7713001620195508224),
    (2**64 - 2, 7713001620195508224), (1048573 * 17592186044399, 1048572 * 17592186044398),
    (U64_MAX, 9208981628670443520),
]
PINNED_FACTORS = [
    (1, []), (2, [(2, 1)]), (360, [(2, 3), (3, 2), (5, 1)]), (1001, [(7, 1), (11, 1), (13, 1)]),
    (2**63, [(2, 63)]), (10**18, [(2, 18), (5, 18)]),
    (2**63 - 1, [(7, 2), (73, 1), (127, 1), (337, 1), (92737, 1), (649657, 1)]),
    (U64_MAX, [(3, 1), (5, 1), (17, 1), (257, 1), (641, 1), (65537, 1), (6700417, 1)]),
]
PINNED_INVERSES = [
    (3, 7, 5), (7, 360, 103), (2, U64_MAX, 2**63), (1, 1, 0), (5, 1, 0), (10, 17, 12),
    (3, 10**18, 666666666666666667), (999999999999999999, 10**18, 999999999999999999),
    (12345, 2**63, 5288216061308878345), (2, 4294967291, 2147483646), (7, U64_MAX, 15811494920322472813),
]


class TestPhi(unittest.TestCase):
    def test_first_values(self):
        # OEIS A000010.
        self.assertEqual([phi(n) for n in range(1, 21)], [1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4, 12, 6, 8, 8, 16, 6, 18, 8])

    def test_against_the_gcd_count(self):
        for n in range(1, 3001):
            self.assertEqual(phi(n), phi_by_gcd(n), n)

    def test_worked_example(self):
        self.assertEqual(prime_factors(360), [(2, 3), (3, 2), (5, 1)])
        self.assertEqual(phi(360), 96)  # 360 * 1/2 * 2/3 * 4/5

    def test_one(self):
        self.assertEqual(phi(1), 1)
        self.assertEqual(prime_factors(1), [])

    def test_zero_and_negative_raise(self):
        for n in (0, -1, -360):
            with self.assertRaises(ValueError) as ctx:
                phi(n)
            self.assertIn("undefined", str(ctx.exception))
            with self.assertRaises(ValueError):
                prime_factors(n)

    def test_primes(self):
        for p in [q for q in range(2, 2000) if is_prime(q)] + [65537, 999983, 4294967291, 999999999989]:
            self.assertEqual(phi(p), p - 1, p)
            self.assertEqual(prime_factors(p), [(p, 1)])

    def test_prime_powers(self):
        # phi(p^k) = p^k - p^(k-1): of the p^k numbers, the multiples of p are the ones that share a factor.
        for p in (2, 3, 5, 7, 11, 13, 101, 65537):
            k = 1
            while p**k <= U64_MAX:
                self.assertEqual(phi(p**k), p**k - p ** (k - 1), (p, k))
                self.assertEqual(prime_factors(p**k), [(p, k)])
                k += 1
        self.assertEqual(phi(2**63), 2**62)
        self.assertEqual(phi(3**40), 3**40 - 3**39)

    def test_multiplicative_on_coprime_pairs(self):
        for m in range(1, 121):
            for n in range(1, 121):
                g = math.gcd(m, n)
                if g == 1:
                    self.assertEqual(phi(m * n), phi(m) * phi(n), (m, n))
                else:
                    # The general rule: phi(mn) * phi(g) = phi(m) * phi(n) * g.
                    self.assertEqual(phi(m * n) * phi(g), phi(m) * phi(n) * g, (m, n))
        self.assertNotEqual(phi(4), phi(2) * phi(2))  # 2 and 2 are not coprime

    def test_divisor_sum_is_n(self):
        for n in range(1, 3001):
            self.assertEqual(sum(phi(d) for d in divisors(n)), n, n)

    def test_divisor_sum_at_64_bits(self):
        for n in (2**63, 10**18, 2**63 - 1, U64_MAX):
            ds = divisors_from_factors(prime_factors(n))
            self.assertEqual(sum(phi(d) for d in ds), n, n)

    def test_factors_multiply_back(self):
        for n in range(1, 5001):
            factors = prime_factors(n)
            self.assertEqual(math.prod(p**k for p, k in factors), n)
            self.assertEqual([p for p, _ in factors], sorted(p for p, _ in factors))
            self.assertTrue(all(is_prime(p) and k >= 1 for p, k in factors), n)

    def test_largest_64_bit_n(self):
        # 2^64 - 1 is the largest n the C++ and Go versions accept.
        self.assertEqual(phi(U64_MAX), 9208981628670443520)
        self.assertEqual(phi(U64_MAX), 2 * 4 * 16 * 256 * 640 * 65536 * 6700416)

    def test_python_goes_past_64_bits(self):
        self.assertEqual(phi(2**64), 2**63)
        self.assertEqual(phi(2**100 * 3**50), 2**99 * 2 * 3**49)

    def test_pinned_values(self):
        for n, want in PINNED_PHI:
            self.assertEqual(phi(n), want, n)
        for n, want in PINNED_FACTORS:
            self.assertEqual(prime_factors(n), want, n)


class TestTrialDivisionWork(unittest.TestCase):
    """Counts the candidates trial division tries, through the module-level _divide_out."""

    def setUp(self):
        real = module._divide_out
        self.tried = []

        def counted(n, p):
            self.tried.append(p)
            return real(n, p)

        module._divide_out = counted
        self.addCleanup(setattr, module, "_divide_out", real)

    def candidates(self, n):
        del self.tried[:]
        prime_factors(n)
        return list(self.tried)

    def test_never_more_than_sqrt_n(self):
        for n in range(1, 20001):
            self.assertLessEqual(len(self.candidates(n)), max(0, math.isqrt(n) - 1), n)

    def test_a_prime_tries_every_candidate_up_to_its_root(self):
        for p in (2, 3, 5, 97, 65537, 999983):
            self.assertEqual(self.candidates(p), list(range(2, math.isqrt(p) + 1)), p)

    def test_the_bound_shrinks_with_n(self):
        # 2^k is done after one candidate: once the 2s are divided out, 1 is left. A loop bound
        # on the original n would try 2^(k/2) - 1 candidates instead.
        for k in range(2, 64):
            self.assertEqual(self.candidates(2**k), [2], k)
        self.assertEqual(self.candidates(360), [2, 3])  # 5 is left, and 4 * 4 > 5
        self.assertEqual(len(self.candidates(U64_MAX)), 65536)  # up to 65537; 6700417 is left


class TestLinearSieve(unittest.TestCase):
    def test_table_up_to_30(self):
        t = linear_sieve(30)
        self.assertIsInstance(t, TotientSieve)
        self.assertEqual(t.phi, [0, 1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4, 12, 6, 8, 8, 16, 6, 18, 8, 12, 10, 22, 8, 20, 12, 18, 12, 28, 8])
        self.assertEqual(t.spf, [0, 0, 2, 3, 2, 5, 2, 7, 2, 3, 2, 11, 2, 13, 2, 3, 2, 17, 2, 19, 2, 3, 2, 23, 2, 5, 2, 3, 2, 29, 2])
        self.assertEqual(t.primes, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29])
        self.assertEqual(t.crossings, 19)

    def test_against_single_n_phi(self):
        n = 5000
        t = linear_sieve(n)
        self.assertEqual(len(t.phi), n + 1)
        self.assertEqual(len(t.spf), n + 1)
        for i in range(1, n + 1):
            self.assertEqual(t.phi[i], phi(i), i)
        for i in range(2, n + 1):
            self.assertEqual(t.spf[i], prime_factors(i)[0][0], i)
        self.assertEqual(t.primes, [i for i in range(2, n + 1) if is_prime(i)])

    def test_every_prefix_agrees(self):
        # The table for n is the first n + 1 entries of any larger table.
        big = linear_sieve(400)
        for n in range(0, 401):
            t = linear_sieve(n)
            self.assertEqual(t.phi, big.phi[: n + 1], n)
            self.assertEqual(t.spf, big.spf[: n + 1], n)
            self.assertEqual(t.primes, [p for p in big.primes if p <= n], n)

    def test_edge_limits(self):
        self.assertEqual(linear_sieve(0), TotientSieve([0], [0], [], 0))
        self.assertEqual(linear_sieve(1), TotientSieve([0, 1], [0, 0], [], 0))
        self.assertEqual(linear_sieve(2), TotientSieve([0, 1, 1], [0, 0, 2], [2], 0))
        self.assertEqual(linear_sieve(4), TotientSieve([0, 1, 1, 2, 2], [0, 0, 2, 3, 2], [2, 3], 1))

    def test_negative_limit_raises(self):
        with self.assertRaises(ValueError):
            linear_sieve(-1)

    def test_divisor_sum_from_the_table(self):
        n = 20000
        t = linear_sieve(n)
        sums = [0] * (n + 1)
        for d in range(1, n + 1):
            for m in range(d, n + 1, d):
                sums[m] += t.phi[d]
        self.assertEqual(sums[1:], list(range(1, n + 1)))

    def test_a_million(self):
        t = linear_sieve(10**6)
        self.assertEqual(len(t.primes), 78498)
        self.assertEqual(t.crossings, 10**6 - 1 - 78498)
        self.assertEqual(sum(t.phi), 303963552392)  # sum of phi(k) for k <= 10^6


class TestEachCompositeOnce(unittest.TestCase):
    """Records every i * p the sieve crosses out, through the module-level _cross_out."""

    def setUp(self):
        real = module._cross_out
        self.crossed = Counter()

        def recorded(phi_table, spf, i, p):
            self.assertLessEqual(p, spf[i], "p must not exceed the smallest prime factor of i")
            self.crossed[i * p] += 1
            real(phi_table, spf, i, p)

        module._cross_out = recorded
        self.addCleanup(setattr, module, "_cross_out", real)

    def test_each_composite_is_crossed_out_exactly_once(self):
        for n in (0, 1, 2, 3, 4, 5, 9, 30, 100, 1000, 10007, 65536):
            self.crossed.clear()
            t = linear_sieve(n)
            composites = [m for m in range(4, n + 1) if not is_prime(m)]
            self.assertEqual(sorted(self.crossed), composites, n)
            self.assertEqual(set(self.crossed.values()) | {1}, {1}, f"a composite crossed out twice for n = {n}")
            self.assertEqual(t.crossings, len(composites), n)
            self.assertEqual(t.crossings, max(0, n - 1) - len(t.primes), n)

    def test_by_its_smallest_prime_factor(self):
        log = []
        real = module._cross_out

        def by_whom(phi_table, spf, i, p):
            log.append((i * p, i, p))
            real(phi_table, spf, i, p)

        module._cross_out = by_whom
        linear_sieve(30)
        module._cross_out = real
        self.assertEqual(log[:6], [(4, 2, 2), (6, 3, 2), (9, 3, 3), (8, 4, 2), (10, 5, 2), (15, 5, 3)])
        for m, i, p in log:
            self.assertEqual(p, prime_factors(m)[0][0], m)
            self.assertEqual(i, m // p, m)


class TestEulersTheorem(unittest.TestCase):
    def test_power_phi_is_one_for_coprime_a(self):
        for n in range(1, 301):
            f = phi(n)
            for a in range(n):
                if math.gcd(a, n) == 1:
                    self.assertEqual(pow(a, f, n), 1 % n, (a, n))  # 1 % 1 = 0: modulo 1 every number is 0
                elif n > 1:
                    self.assertNotEqual(pow(a, f, n), 1, (a, n))  # a power of a shares the factor gcd(a, n)

    def test_at_64_bits(self):
        for n in (U64_MAX, 2**63, 10**18, 4294967291):
            f = phi(n)
            for a in (2, 3, 7, 10**9 + 7, U64_MAX - 2):
                if math.gcd(a, n) == 1:
                    self.assertEqual(pow(a, f, n), 1, (a, n))


class TestInverse(unittest.TestCase):
    def test_against_extended_euclid(self):
        for n in range(1, 401):
            for a in range(-n, 2 * n):
                want = inverse_by_extended_gcd(a, n)
                if want is None:
                    with self.assertRaises(ValueError):
                        mod_inverse_euler(a, n)
                else:
                    got = mod_inverse_euler(a, n)
                    self.assertEqual(got, want, (a, n))
                    self.assertEqual(a * got % n, 1 % n, (a, n))

    def test_against_python_pow(self):
        rng = random.Random(2026)
        for _ in range(300):
            n = rng.randrange(2, 10**7)
            a = rng.randrange(1, n)
            if math.gcd(a, n) == 1:
                self.assertEqual(mod_inverse_euler(a, n), pow(a, -1, n), (a, n))

    def test_prime_modulus_is_fermat(self):
        p = 4294967291
        for a in (2, 3, 12345, p - 1):
            self.assertEqual(mod_inverse_euler(a, p), pow(a, p - 2, p))

    def test_pinned_and_64_bit(self):
        for a, n, want in PINNED_INVERSES:
            self.assertEqual(mod_inverse_euler(a, n), want, (a, n))
            self.assertEqual(want, inverse_by_extended_gcd(a, n), (a, n))

    def test_modulus_one_and_negative_a(self):
        self.assertEqual(mod_inverse_euler(0, 1), 0)
        self.assertEqual(mod_inverse_euler(5, 1), 0)
        self.assertEqual(mod_inverse_euler(-3, 7), 2)  # -3 = 4 (mod 7), and 4 * 2 = 8 = 1
        self.assertEqual(mod_inverse_euler(10, 7), 5)

    def test_errors(self):
        with self.assertRaises(ValueError) as ctx:
            mod_inverse_euler(6, 9)
        self.assertIn("gcd(6, 9) = 3", str(ctx.exception))
        with self.assertRaises(ValueError):
            mod_inverse_euler(0, 5)
        for n in (0, -7):
            with self.assertRaises(ValueError):
                mod_inverse_euler(3, n)


if __name__ == "__main__":
    unittest.main()
