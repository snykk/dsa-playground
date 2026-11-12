"""Unit tests for Manacher's Algorithm"""
import unittest
from manacher import manacher


def brute_force(s):
    """(start, length) of the first longest palindromic substring, by checking every substring."""
    best = (0, 0)
    for i in range(len(s)):
        for j in range(i + 1, len(s) + 1):
            t = s[i:j]
            if t == t[::-1] and j - i > best[1]:
                best = (i, j - i)
    return best


class TestManacher(unittest.TestCase):
    def test_basic(self):
        result = manacher("babad")
        self.assertIn(result[0], ["bab", "aba"])
        self.assertEqual(result[2], 3)

    def test_tuple_and_tie_breaking(self):
        # "bab" and "aba" tie; the earlier one wins.
        self.assertEqual(manacher("babad"), ("bab", 0, 3))
        self.assertEqual(manacher("cbbd"), ("bb", 1, 2))

    def test_edge_cases(self):
        self.assertEqual(manacher(""), ("", 0, 0))
        self.assertEqual(manacher("a"), ("a", 0, 1))
        self.assertEqual(manacher("abc"), ("a", 0, 1))
        self.assertEqual(manacher("aaaa"), ("aaaa", 0, 4))
        self.assertEqual(manacher("racecar"), ("racecar", 0, 7))

    def test_sentinel_characters_in_input(self):
        # Regression: "^" and "$" were used as sentinels, so inputs containing them
        # expanded past the sentinel ("b^a^b^a" gave the non-palindrome "b^a^b^") or
        # raised IndexError ("$a").
        self.assertEqual(manacher("b^a^b^a"), ("b^a^b", 0, 5))
        self.assertEqual(manacher("a^"), ("a", 0, 1))
        self.assertEqual(manacher("$a"), ("$", 0, 1))
        self.assertEqual(manacher("^^"), ("^^", 0, 2))
        self.assertEqual(manacher("$a$"), ("$a$", 0, 3))

    def test_matches_brute_force(self):
        import itertools
        for length in range(0, 8):
            for chars in itertools.product("ab^$", repeat=length):
                s = "".join(chars)
                sub, start, size = manacher(s)
                self.assertEqual((start, size), brute_force(s), s)
                self.assertEqual(sub, s[start:start + size])


if __name__ == '__main__':
    unittest.main()
