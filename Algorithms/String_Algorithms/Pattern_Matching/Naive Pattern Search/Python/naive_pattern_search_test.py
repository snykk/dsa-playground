"""
Unit tests for Naive Pattern Search
"""

import unittest
from naive_pattern_search import (
    naive_pattern_search,
    naive_pattern_search_count,
    naive_pattern_search_first
)


class TestNaivePatternSearch(unittest.TestCase):
    
    def test_basic_search(self):
        text = "ABABDABACDABABCABC"
        pattern = "ABABCABC"
        result = naive_pattern_search(text, pattern)
        self.assertEqual(result, [10])
    
    def test_multiple_occurrences(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        result = naive_pattern_search(text, pattern)
        self.assertEqual(result, [0, 9, 12])
    
    def test_no_match(self):
        text = "ABCDEFG"
        pattern = "XYZ"
        result = naive_pattern_search(text, pattern)
        self.assertEqual(result, [])
    
    def test_pattern_longer_than_text(self):
        text = "ABC"
        pattern = "ABCDEF"
        result = naive_pattern_search(text, pattern)
        self.assertEqual(result, [])
    
    def test_empty_pattern(self):
        text = "ABCDEF"
        pattern = ""
        result = naive_pattern_search(text, pattern)
        self.assertEqual(result, [])
    
    def test_empty_text(self):
        text = ""
        pattern = "ABC"
        result = naive_pattern_search(text, pattern)
        self.assertEqual(result, [])
    
    def test_pattern_equals_text(self):
        text = "ABC"
        pattern = "ABC"
        result = naive_pattern_search(text, pattern)
        self.assertEqual(result, [0])
    
    def test_single_character(self):
        text = "AAAAA"
        pattern = "A"
        result = naive_pattern_search(text, pattern)
        self.assertEqual(result, [0, 1, 2, 3, 4])
    
    def test_count(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        count = naive_pattern_search_count(text, pattern)
        self.assertEqual(count, 3)
    
    def test_first_occurrence(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        first = naive_pattern_search_first(text, pattern)
        self.assertEqual(first, 0)
    
    def test_first_occurrence_not_found(self):
        text = "ABCDEF"
        pattern = "XYZ"
        first = naive_pattern_search_first(text, pattern)
        self.assertEqual(first, -1)

    def test_overlapping_matches(self):
        self.assertEqual(naive_pattern_search("aaaa", "aa"), [0, 1, 2])
        self.assertEqual(naive_pattern_search("ABABABA", "ABABA"), [0, 2])

    def test_worst_case_input(self):
        # "AAAA...AB" against "AAAAB": every alignment compares the whole pattern.
        text = "A" * 19 + "B"
        self.assertEqual(naive_pattern_search(text, "AAAAB"), [15])

    def test_match_at_end(self):
        self.assertEqual(naive_pattern_search("xxabc", "abc"), [2])


if __name__ == '__main__':
    unittest.main()

