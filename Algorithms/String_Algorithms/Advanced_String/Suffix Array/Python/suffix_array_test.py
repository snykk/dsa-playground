"""Unit tests for Suffix Array"""
import unittest
from suffix_array import build_suffix_array, search_pattern

class TestSuffixArray(unittest.TestCase):
    def test_build(self):
        sa = build_suffix_array("banana")
        self.assertEqual(len(sa), 6)
    def test_search(self):
        sa = build_suffix_array("banana")
        result = search_pattern(sa, "banana", "ana")
        self.assertEqual(len(result), 2)

    def test_banana_order_and_sortedness(self):
        text = "banana"
        sa = build_suffix_array(text)
        self.assertEqual(sa, [5, 3, 1, 0, 4, 2])
        suffixes = [text[i:] for i in sa]
        self.assertEqual(suffixes, sorted(suffixes))
        self.assertEqual(build_suffix_array("mississippi"),
                         [10, 7, 4, 1, 0, 9, 8, 6, 3, 5, 2])

    def test_search_exact_results(self):
        sa = build_suffix_array("banana")
        self.assertEqual(search_pattern(sa, "banana", "ana"), [1, 3])
        self.assertEqual(search_pattern(sa, "banana", "a"), [1, 3, 5])
        self.assertEqual(search_pattern(sa, "banana", "xyz"), [])
        self.assertEqual(search_pattern(sa, "banana", "bananas"), [])
        # Overlapping occurrences.
        self.assertEqual(search_pattern(build_suffix_array("aaaa"), "aaaa", "aa"), [0, 1, 2])

    def test_empty_pattern_and_empty_text(self):
        sa = build_suffix_array("banana")
        # The empty pattern is a prefix of every suffix: indices 0..n-1.
        self.assertEqual(search_pattern(sa, "banana", ""), [0, 1, 2, 3, 4, 5])
        self.assertEqual(build_suffix_array(""), [])
        self.assertEqual(search_pattern([], "", "a"), [])

if __name__ == '__main__':
    unittest.main()

