"""Unit tests for Boyer-Moore Algorithm"""
import unittest
from boyer_moore import (
    boyer_moore_search,
    boyer_moore_search_count,
    boyer_moore_search_first,
    build_bad_char_table,
)


class TestBoyerMoore(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(boyer_moore_search("ABABDABACDABABCABC", "ABABCABC"), [10])

    def test_multiple(self):
        self.assertEqual(boyer_moore_search("AABAACAADAABAABA", "AABA"), [0, 9, 12])

    def test_textbook_example(self):
        self.assertEqual(boyer_moore_search("HERE IS A SIMPLE EXAMPLE", "EXAMPLE"), [17])

    def test_overlapping_matches(self):
        self.assertEqual(boyer_moore_search("aaaa", "aa"), [0, 1, 2])
        self.assertEqual(boyer_moore_search("AAAAAA", "AAA"), [0, 1, 2, 3])

    def test_no_match_and_edge_cases(self):
        self.assertEqual(boyer_moore_search("HELLO WORLD", "WORDS"), [])
        self.assertEqual(boyer_moore_search("AB", "ABC"), [])
        self.assertEqual(boyer_moore_search("", "A"), [])
        # An empty pattern returns [] in this implementation.
        self.assertEqual(boyer_moore_search("ABC", ""), [])

    def test_worst_case_input(self):
        # Pattern "baaa" against all a's: no match, but almost every alignment is tried.
        self.assertEqual(boyer_moore_search("a" * 40, "baaa"), [])
        self.assertEqual(boyer_moore_search("a" * 20 + "baaa", "baaa"), [20])

    def test_match_at_end_of_text(self):
        self.assertEqual(boyer_moore_search("xxabc", "abc"), [2])

    def test_bad_char_table(self):
        self.assertEqual(build_bad_char_table("EXAMPLE"),
                         {"E": 6, "X": 1, "A": 2, "M": 3, "P": 4, "L": 5})
        # The rightmost occurrence wins.
        self.assertEqual(build_bad_char_table("abca"), {"a": 3, "b": 1, "c": 2})

    def test_count_and_first(self):
        self.assertEqual(boyer_moore_search_count("AABAACAADAABAABA", "AABA"), 3)
        self.assertEqual(boyer_moore_search_first("AABAACAADAABAABA", "AABA"), 0)
        self.assertEqual(boyer_moore_search_first("ABC", "Z"), -1)


if __name__ == '__main__':
    unittest.main()
