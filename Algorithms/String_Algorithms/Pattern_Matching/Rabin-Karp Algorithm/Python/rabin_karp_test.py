"""
Unit tests for Rabin-Karp Algorithm
"""

import unittest
from rabin_karp import rabin_karp_search, rabin_karp_search_count, rabin_karp_search_first


class TestRabinKarp(unittest.TestCase):
    
    def test_basic_search(self):
        text = "ABABDABACDABABCABC"
        pattern = "ABABCABC"
        result = rabin_karp_search(text, pattern)
        self.assertEqual(result, [10])
    
    def test_multiple_occurrences(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        result = rabin_karp_search(text, pattern)
        self.assertEqual(result, [0, 9, 12])
    
    def test_no_match(self):
        text = "ABCDEFG"
        pattern = "XYZ"
        result = rabin_karp_search(text, pattern)
        self.assertEqual(result, [])
    
    def test_count(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        count = rabin_karp_search_count(text, pattern)
        self.assertEqual(count, 3)
    
    def test_first_occurrence(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        first = rabin_karp_search_first(text, pattern)
        self.assertEqual(first, 0)

    def test_overlapping_matches(self):
        self.assertEqual(rabin_karp_search("aaaa", "aa"), [0, 1, 2])
        self.assertEqual(rabin_karp_search("AAAAA", "AAA"), [0, 1, 2])

    def test_empty_inputs_and_longer_pattern(self):
        # An empty pattern returns [] in this implementation.
        self.assertEqual(rabin_karp_search("ABC", ""), [])
        self.assertEqual(rabin_karp_search("", "A"), [])
        self.assertEqual(rabin_karp_search("AB", "ABC"), [])

    def test_spurious_hit_is_rejected(self):
        # With base 256 and mod 101, "JU" and "AB" have the same hash (41) but differ.
        self.assertEqual(rabin_karp_search("XJUAB", "AB"), [3])

    def test_forced_collisions_stay_correct(self):
        # mod=1 makes every window collide: the character check must still decide.
        text, pattern = "ABABDABACDABABCABC", "ABABCABC"
        self.assertEqual(rabin_karp_search(text, pattern, mod=1), [10])
        self.assertEqual(rabin_karp_search(text, pattern, mod=2), [10])
        self.assertEqual(rabin_karp_search("AABAACAADAABAABA", "AABA", mod=1), [0, 9, 12])

    def test_non_ascii(self):
        self.assertEqual(rabin_karp_search("caf\u00e9 caf\u00e9", "caf\u00e9"), [0, 5])

    def test_match_at_end(self):
        self.assertEqual(rabin_karp_search("xxabc", "abc"), [2])


if __name__ == '__main__':
    unittest.main()

