"""
Unit tests for string hashing: prefix hashes, substring hashes, equality, LCP, comparison,
distinct-substring counts, and the collisions of a small modulus and of hashing modulo 2^64.

Substring hashes are checked against the definition, sum of c_i * B^(m-1-i) mod M computed
with pow(); the queries against brute force on random strings with fixed seeds. The pinned
tables are the ones the C++ and Go tests pin too.
"""

import math
import random
import unittest

from string_hashing import (
    BASE1,
    BASE2,
    MAX_MOD,
    MOD1,
    MOD2,
    DoubleHash,
    PolynomialHash,
    overflow_hash,
    polynomial_hash,
    thue_morse_pair,
)


def definition_hash(codes, base, mod):
    """sum of c_i * base^(m-1-i) mod mod, term by term: independent of Horner's rule."""
    m = len(codes)
    return sum(c * pow(base, m - 1 - i, mod) for i, c in enumerate(codes)) % mod


def naive_lcp(s, i, j):
    k = 0
    while i + k < len(s) and j + k < len(s) and s[i + k] == s[j + k]:
        k += 1
    return k


def sign(x):
    return (x > 0) - (x < 0)


def random_string(rng, alphabet, lo, hi):
    return "".join(rng.choice(alphabet) for _ in range(rng.randint(lo, hi)))


# The parameters of the tests: the two pairs of DoubleHash, the largest modulus with the
# largest base, and small moduli that collide often.
PARAMS = [(BASE1, MOD1), (BASE2, MOD2), (MAX_MOD - 1, MAX_MOD), (31, 97), (31, 101), (2, 3), (1, 2)]


class TestTables(unittest.TestCase):
    def test_mississippi_tables(self):
        """The tables of the README trace; the C++ and Go tests pin the same numbers."""
        h = PolynomialHash("mississippi", 31, 97)
        self.assertEqual(h.codes, [109, 105, 115, 115, 105, 115, 115, 105, 112, 112, 105])
        self.assertEqual(h.prefix, [0, 12, 89, 61, 66, 17, 60, 35, 26, 45, 52, 68])
        self.assertEqual(h.power, [1, 31, 88, 12, 81, 86, 47, 2, 62, 79, 24, 65])
        self.assertEqual(h.get(1, 5), 15)
        self.assertEqual(h.get(4, 8), 15)
        self.assertEqual(h.get(0, 11), 68)

    def test_double_hash_values(self):
        d = DoubleHash("mississippi")
        self.assertEqual(d.get(0, 11), (788634571, 670713304))
        self.assertEqual(d.get(1, 5), (883654281, 445652627))
        self.assertEqual(d.get(4, 8), (883654281, 445652627))
        self.assertEqual(d.get(0, 0), (0, 0))

    def test_largest_modulus_values(self):
        """mod = 2^32 and base = 2^32 - 1: the largest factors C++ and Go multiply."""
        h = PolynomialHash("mississippi", MAX_MOD - 1, MAX_MOD)
        self.assertEqual(h.prefix, [0, 109, 4294967292, 119, 4294967292, 109, 6, 109, 4294967292, 116, 4294967292, 109])

    def test_prefix_is_hash_of_prefix(self):
        rng = random.Random(1)
        for _ in range(50):
            s = random_string(rng, "abcxyz", 0, 30)
            for base, mod in PARAMS:
                h = PolynomialHash(s, base, mod)
                self.assertEqual(len(h.prefix), len(s) + 1)
                for i in range(len(s) + 1):
                    self.assertEqual(h.prefix[i], definition_hash([ord(c) for c in s[:i]], base, mod))
                    self.assertEqual(h.power[i], pow(base, i, mod))


class TestSubstringHashes(unittest.TestCase):
    def test_every_substring_against_the_definition(self):
        rng = random.Random(2)
        for _ in range(60):
            s = random_string(rng, "abcdefgh", 0, 25)
            for base, mod in PARAMS:
                h = PolynomialHash(s, base, mod)
                for l in range(len(s) + 1):
                    for r in range(l, len(s) + 1):
                        want = definition_hash([ord(c) for c in s[l:r]], base, mod)
                        self.assertEqual(h.get(l, r), want)
                        self.assertEqual(polynomial_hash(s[l:r], base, mod), want)

    def test_double_hash_is_the_two_hashes(self):
        rng = random.Random(3)
        for _ in range(60):
            s = random_string(rng, "ab", 0, 25)
            d = DoubleHash(s)
            for l in range(len(s) + 1):
                for r in range(l, len(s) + 1):
                    codes = [ord(c) for c in s[l:r]]
                    self.assertEqual(d.get(l, r), (definition_hash(codes, BASE1, MOD1), definition_hash(codes, BASE2, MOD2)))

    def test_equal_substrings_have_equal_hashes(self):
        """Wherever the same substring occurs, it gets the same hash, whatever the modulus."""
        s = "abcabcabcabc"
        for base, mod in PARAMS:
            h = PolynomialHash(s, base, mod)
            for length in range(len(s) - 2):
                self.assertEqual(h.get(0, length), h.get(3, 3 + length))


class TestQueriesAgainstBruteForce(unittest.TestCase):
    def test_equal(self):
        rng = random.Random(4)
        for _ in range(150):
            s = random_string(rng, rng.choice(["a", "ab", "abc"]), 0, 20)
            d = DoubleHash(s)
            n = len(s)
            for i in range(n + 1):
                for j in range(n + 1):
                    for length in range(n - max(i, j) + 1):
                        self.assertEqual(d.equal(i, j, length), s[i:i + length] == s[j:j + length])

    def test_lcp(self):
        rng = random.Random(5)
        for _ in range(300):
            s = random_string(rng, rng.choice(["a", "ab", "abc", "abcd"]), 0, 30)
            d = DoubleHash(s)
            for i in range(len(s) + 1):
                for j in range(len(s) + 1):
                    self.assertEqual(d.lcp(i, j), naive_lcp(s, i, j))

    def test_compare(self):
        rng = random.Random(6)
        for _ in range(200):
            s = random_string(rng, rng.choice(["ab", "abc", "aZz"]), 0, 20)
            d = DoubleHash(s)
            n = len(s)
            for _ in range(60):
                l1 = rng.randint(0, n)
                r1 = rng.randint(l1, n)
                l2 = rng.randint(0, n)
                r2 = rng.randint(l2, n)
                a, b = s[l1:r1], s[l2:r2]
                self.assertEqual(d.compare(l1, r1, l2, r2), (a > b) - (a < b))

    def test_count_distinct(self):
        rng = random.Random(7)
        for _ in range(150):
            s = random_string(rng, rng.choice(["a", "ab", "abc", "abcdefghij"]), 0, 40)
            d = DoubleHash(s)
            n = len(s)
            for length in range(n + 3):
                want = len({s[i:i + length] for i in range(n - length + 1)})
                self.assertEqual(d.count_distinct(length), want)

    def test_polynomial_hash_queries_with_a_large_modulus(self):
        """PolynomialHash answers the same queries; with MOD1 there is no collision on these inputs."""
        rng = random.Random(8)
        for _ in range(100):
            s = random_string(rng, "abc", 0, 20)
            h = PolynomialHash(s, BASE1, MOD1)
            n = len(s)
            for i in range(n + 1):
                for j in range(n + 1):
                    self.assertEqual(h.lcp(i, j), naive_lcp(s, i, j))
            for length in range(n + 1):
                self.assertEqual(h.count_distinct(length), len({s[i:i + length] for i in range(n - length + 1)}))


class TestEdgeCases(unittest.TestCase):
    def test_empty_string(self):
        for h in (PolynomialHash("", 31, 97), DoubleHash("")):
            self.assertEqual(h.n, 0)
            self.assertEqual(h.lcp(0, 0), 0)
            self.assertTrue(h.equal(0, 0, 0))
            self.assertEqual(h.compare(0, 0, 0, 0), 0)
            self.assertEqual(h.count_distinct(0), 1)
            self.assertEqual(h.count_distinct(1), 0)
        h = PolynomialHash("", 31, 97)
        self.assertEqual(h.prefix, [0])
        self.assertEqual(h.power, [1])
        self.assertEqual(h.get(0, 0), 0)
        self.assertEqual(DoubleHash("").get(0, 0), (0, 0))

    def test_one_character(self):
        h = PolynomialHash("z", 31, 97)
        self.assertEqual(h.prefix, [0, 122 % 97])
        self.assertEqual(h.get(0, 1), 25)
        d = DoubleHash("z")
        self.assertEqual(d.get(0, 1), (122, 122))
        self.assertEqual(d.lcp(0, 0), 1)
        self.assertEqual(d.lcp(0, 1), 0)
        self.assertEqual(d.compare(0, 1, 0, 0), 1)
        self.assertEqual(d.compare(0, 0, 0, 1), -1)
        self.assertEqual([d.count_distinct(k) for k in range(3)], [1, 1, 0])

    def test_all_characters_equal(self):
        n = 50
        s = "a" * n
        d = DoubleHash(s)
        for i in range(n + 1):
            for j in range(n + 1):
                self.assertEqual(d.lcp(i, j), n - max(i, j))
        for length in range(1, n + 1):
            self.assertEqual(d.count_distinct(length), 1)
        self.assertEqual(d.compare(0, 3, 10, 12), 1)
        self.assertEqual(d.compare(5, 7, 0, 2), 0)

    def test_empty_ranges_are_equal_everywhere(self):
        d = DoubleHash("abc")
        self.assertTrue(d.equal(0, 3, 0))
        self.assertEqual(d.get(1, 1), d.get(3, 3))
        self.assertEqual(d.compare(2, 2, 0, 0), 0)
        self.assertEqual(d.compare(2, 2, 0, 1), -1)

    def test_characters_outside_ascii(self):
        """A str hashes code points; its UTF-8 bytes give the numbers C++ and Go compute."""
        s = "h\xe9llo"
        h = PolynomialHash(s, 31, 97)
        self.assertEqual(h.codes, [104, 233, 108, 108, 111])
        self.assertEqual(h.prefix, [0, 7, 62, 90, 85, 30])
        b = PolynomialHash(s.encode("utf-8"), 31, 97)
        self.assertEqual(b.codes, [104, 195, 169, 108, 108, 111])
        self.assertEqual(b.prefix, [0, 7, 24, 40, 87, 89, 57])
        self.assertEqual(DoubleHash(s.encode("utf-8")).get(0, 6), (180144647, 254344828))
        # e-acute (U+00E9) and e-grave (U+00E8) differ as characters, but their UTF-8
        # encodings share the lead byte 0xC3.
        self.assertEqual(DoubleHash("\xe9\xe8").lcp(0, 1), 0)
        self.assertEqual(DoubleHash("\xe9\xe8".encode("utf-8")).lcp(0, 2), 1)
        # A code point above U+FFFF is one character with one value.
        emoji = "a\U0001F600a"
        d = DoubleHash(emoji)
        self.assertEqual(d.n, 3)
        self.assertEqual(d.get(1, 2), (0x1F600, 0x1F600))
        self.assertEqual(d.compare(1, 2, 0, 1), 1)

    def test_largest_ranges(self):
        n = 100_000
        s = "".join(chr(97 + (i * i + 3 * i) % 26) for i in range(n))
        d = DoubleHash(s)
        self.assertEqual(d.get(0, n), (polynomial_hash(s, BASE1, MOD1), polynomial_hash(s, BASE2, MOD2)))
        self.assertEqual(d.get(0, n), (439513216, 315805692))
        self.assertEqual(d.get(12345, 99999), (239334980, 556481625))
        self.assertEqual(d.lcp(0, 0), n)
        self.assertEqual(d.lcp(n, n), 0)
        self.assertEqual(d.compare(0, n, 0, n), 0)
        self.assertEqual(d.count_distinct(n), 1)
        a = DoubleHash("a" * n)
        self.assertEqual(a.lcp(0, 1), n - 1)
        self.assertEqual(a.compare(0, n, 1, n), 1)
        self.assertEqual(a.count_distinct(n // 2), 1)


class TestErrors(unittest.TestCase):
    def test_bad_parameters(self):
        for base, mod in [(1, 1), (1, 0), (1, MAX_MOD + 1), (0, 97), (97, 97), (-1, 97)]:
            with self.assertRaises(ValueError):
                PolynomialHash("abc", base, mod)
            with self.assertRaises(ValueError):
                polynomial_hash("abc", base, mod)

    def test_not_a_string(self):
        with self.assertRaises(TypeError):
            PolynomialHash([1, 2, 3], 31, 97)

    def test_bad_ranges(self):
        for h in (PolynomialHash("abcd", 31, 97), DoubleHash("abcd")):
            for l, r in [(-1, 2), (3, 2), (0, 5), (5, 5)]:
                with self.assertRaises(IndexError):
                    h.get(l, r)
                with self.assertRaises(IndexError):
                    h.compare(l, r, 0, 1)
            with self.assertRaises(IndexError):
                h.equal(1, 2, 3)
            with self.assertRaises(IndexError):
                h.equal(-1, 0, 1)
            with self.assertRaises(ValueError):
                h.equal(0, 0, -1)
            with self.assertRaises(IndexError):
                h.lcp(5, 0)
            with self.assertRaises(IndexError):
                h.lcp(0, -1)
            with self.assertRaises(ValueError):
                h.count_distinct(-1)

    def test_overflow_hash_and_thue_morse_arguments(self):
        for base in (-1, 1 << 64):
            with self.assertRaises(ValueError):
                overflow_hash("abc", base)
        for k in (-1, 31):
            with self.assertRaises(ValueError):
                thue_morse_pair(k)


class TestCollisions(unittest.TestCase):
    def test_small_modulus_collision(self):
        """With base 31 and mod 101, "abra" and "brac" share hash 57: one distinct count is wrong."""
        s = "abracadabra"
        h = PolynomialHash(s, 31, 101)
        self.assertEqual(h.get(0, 4), 57)
        self.assertEqual(h.get(1, 5), 57)
        self.assertEqual(h.count_distinct(4), 6)
        self.assertEqual(len({s[i:i + 4] for i in range(8)}), 7)
        self.assertEqual(DoubleHash(s).count_distinct(4), 7)

    def test_small_modulus_misleads_the_binary_search(self):
        """With base 7 and mod 11, "abra" and "cada" collide, and lcp(0, 4) reports 4 instead of 0."""
        h = PolynomialHash("abracadabra", 7, 11)
        self.assertEqual(h.get(0, 4), h.get(4, 8))
        self.assertEqual(h.lcp(0, 4), 4)
        self.assertEqual(naive_lcp("abracadabra", 0, 4), 0)
        self.assertEqual(DoubleHash("abracadabra").lcp(0, 4), 0)

    def test_one_pair_has_at_most_n_minus_1_bad_bases(self):
        """hash(x) - hash(y) is a nonzero polynomial of degree <= n - 1 in the base: <= n - 1 roots mod a prime."""
        rng = random.Random(9)
        mod = 1009
        for _ in range(150):
            n = rng.randint(1, 10)
            x = random_string(rng, "ab", n, n)
            y = random_string(rng, "ab", n, n)
            if x == y:
                continue
            bad = sum(polynomial_hash(x, b, mod) == polynomial_hash(y, b, mod) for b in range(1, mod))
            self.assertLessEqual(bad, n - 1)

    def test_birthday_bound(self):
        """k random strings, a random base, mod 10007: about k(k-1)/2 / M colliding pairs on average."""
        rng = random.Random(10)
        mod, k, trials = 10007, 300, 200
        total = 0
        for _ in range(trials):
            base = rng.randrange(256, mod)
            strings = set()
            while len(strings) < k:
                strings.add(random_string(rng, "abcdefghijklmnopqrstuvwxyz", 12, 12))
            counts = {}
            for s in strings:
                v = polynomial_hash(s, base, mod)
                counts[v] = counts.get(v, 0) + 1
            total += sum(c * (c - 1) // 2 for c in counts.values())
        expected = k * (k - 1) / 2 / mod  # 4.48
        self.assertLess(abs(total / trials - expected), 1.0)
        self.assertLess(1 - math.exp(-expected), 1.0)

    def test_thue_morse_breaks_hashing_modulo_2_64(self):
        """Every odd base: the Thue-Morse pair of length 1024 collides modulo 2^64."""
        a, b = thue_morse_pair(10)
        self.assertEqual(len(a), 1024)
        self.assertNotEqual(a, b)
        rng = random.Random(11)
        bases = [1, 3, 31, 131, BASE1, BASE2, (1 << 64) - 1] + [rng.randrange(1 << 64) | 1 for _ in range(200)]
        for base in bases:
            self.assertEqual(overflow_hash(a, base), overflow_hash(b, base))
        self.assertNotEqual(DoubleHash(a).get(0, 1024), DoubleHash(b).get(0, 1024))
        self.assertNotEqual(DoubleHash(a + b).get(0, 1024), DoubleHash(a + b).get(1024, 2048))

    def test_thue_morse_pinned_values(self):
        self.assertEqual(thue_morse_pair(3), ("abbabaab", "baababba"))
        a, b = thue_morse_pair(10)
        self.assertEqual(overflow_hash(a, 131), overflow_hash(b, 131))
        self.assertEqual(overflow_hash("abracadabra", 131), 6494918133703025106)

    def test_shorter_thue_morse_does_not_always_collide(self):
        """Length 512 is not enough: 2^53 divides the difference, and only some bases add 11 more factors of 2."""
        a, b = thue_morse_pair(9)
        self.assertNotEqual(overflow_hash(a, 3), overflow_hash(b, 3))

    def test_even_base_keeps_only_the_last_64_characters(self):
        x = "x" + "a" * 64
        y = "y" + "a" * 64
        for base in (2, 256, 1000, 1 << 32):
            self.assertEqual(overflow_hash(x, base), overflow_hash(y, base))
        self.assertNotEqual(overflow_hash(x, 131), overflow_hash(y, 131))


if __name__ == "__main__":
    unittest.main()
