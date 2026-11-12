"""
Unit tests for KMP Algorithm
"""

import unittest
from kmp import kmp_search, kmp_search_count, kmp_search_first, build_lps


class TestKMP(unittest.TestCase):
    
    def test_basic_search(self):
        text = "ABABDABACDABABCABC"
        pattern = "ABABCABC"
        result = kmp_search(text, pattern)
        self.assertEqual(result, [10])
    
    def test_multiple_occurrences(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        result = kmp_search(text, pattern)
        self.assertEqual(result, [0, 9, 12])
    
    def test_no_match(self):
        text = "ABCDEFG"
        pattern = "XYZ"
        result = kmp_search(text, pattern)
        self.assertEqual(result, [])
    
    def test_lps_array(self):
        pattern = "ABABCABC"
        lps = build_lps(pattern)
        self.assertEqual(lps, [0, 0, 1, 2, 0, 1, 2, 0])
    
    def test_lps_aaaa(self):
        pattern = "AAAA"
        lps = build_lps(pattern)
        self.assertEqual(lps, [0, 1, 2, 3])
    
    def test_count(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        count = kmp_search_count(text, pattern)
        self.assertEqual(count, 3)
    
    def test_first_occurrence(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        first = kmp_search_first(text, pattern)
        self.assertEqual(first, 0)

    def test_overlapping_matches(self):
        self.assertEqual(kmp_search("aaaa", "aa"), [0, 1, 2])
        self.assertEqual(kmp_search("ABABABA", "ABABA"), [0, 2])

    def test_empty_inputs_and_longer_pattern(self):
        # An empty pattern returns [] in this implementation.
        self.assertEqual(kmp_search("ABC", ""), [])
        self.assertEqual(kmp_search("", "A"), [])
        self.assertEqual(kmp_search("AB", "ABC"), [])
        self.assertEqual(build_lps(""), [])

    def test_lps_more_patterns(self):
        self.assertEqual(build_lps("ABABAC"), [0, 0, 1, 2, 3, 0])
        self.assertEqual(build_lps("AABAAAB"), [0, 1, 0, 1, 2, 2, 3])
        self.assertEqual(build_lps("A"), [0])

    def test_match_at_end_and_whole_text(self):
        self.assertEqual(kmp_search("xxabc", "abc"), [2])
        self.assertEqual(kmp_search("abc", "abc"), [0])
        self.assertEqual(kmp_search("ABABDABACDABABCABC", "ABABCABC"), [10])


if __name__ == '__main__':
    unittest.main()

