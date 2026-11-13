import unittest
from pattern_matching import *

class TestPatternMatching(unittest.TestCase):
    text = "ababcabcabc"
    pattern = "abc"

    def test_naive(self):
        self.assertEqual(naive_search(self.text,self.pattern), [2,5,8])

    def test_kmp(self):
        self.assertEqual(kmp_search(self.text,self.pattern), [2,5,8])

    def test_rabin_karp(self):
        self.assertEqual(rabin_karp_search(self.text,self.pattern), [2,5,8])

    def test_boyer_moore(self):
        self.assertEqual(boyer_moore_search(self.text,self.pattern), [2,5,8])

    def test_empty_pattern_occurs_at_every_position(self):
        # Regression: kmp_search raised IndexError on an empty pattern, and
        # boyer_moore_search returned [] while naive and Rabin-Karp gave 0..n.
        for search in (naive_search, kmp_search, rabin_karp_search, boyer_moore_search):
            with self.subTest(search=search.__name__):
                self.assertEqual(search("abc", ""), [0, 1, 2, 3])
                self.assertEqual(search("", ""), [0])

    def test_pattern_longer_than_text(self):
        # Regression: rabin_karp_search raised IndexError whenever m > n.
        for search in (naive_search, kmp_search, rabin_karp_search, boyer_moore_search):
            with self.subTest(search=search.__name__):
                self.assertEqual(search("ab", "abc"), [])
                self.assertEqual(search("", "a"), [])

    def test_overlapping_matches(self):
        for search in (naive_search, kmp_search, rabin_karp_search, boyer_moore_search):
            with self.subTest(search=search.__name__):
                self.assertEqual(search("aaaa", "aa"), [0, 1, 2])

if __name__ == "__main__":
    unittest.main()
