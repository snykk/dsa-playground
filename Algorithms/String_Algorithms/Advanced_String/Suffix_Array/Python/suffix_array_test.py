"""Unit tests for Suffix Array"""
import unittest
import random
from suffix_array import (SuffixArray, build_suffix_array, get_suffixes,
                          longest_common_prefix, search_pattern)

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

    def test_get_suffixes(self):
        sa = build_suffix_array("banana")
        self.assertEqual(get_suffixes(sa, "banana"),
                         ["a", "ana", "anana", "banana", "na", "nana"])

    def test_longest_common_prefix(self):
        self.assertEqual(longest_common_prefix("banana", 0, 3), 0)
        self.assertEqual(longest_common_prefix("banana", 1, 1), 5)
        self.assertEqual(longest_common_prefix("banana", 3, 1), 3)

    def test_class_view(self):
        sa = SuffixArray("banana")
        self.assertEqual(sa.suffix_array, [5, 3, 1, 0, 4, 2])
        self.assertEqual(sa.search("ana"), [1, 3])
        self.assertEqual(sa.search("a"), [1, 3, 5])
        self.assertEqual(sa.search("nan"), [2])
        self.assertEqual(sa.search(""), [0, 1, 2, 3, 4, 5])
        self.assertEqual(sa.get_suffixes()[0], "a")
        self.assertEqual(sa.longest_common_prefix(3, 1), 3)
        self.assertEqual(SuffixArray("").search("a"), [])

    def test_random_against_brute_force(self):
        rng = random.Random(7)
        for _ in range(300):
            text = "".join(rng.choice("ab") for _ in range(rng.randint(0, 12)))
            sa = build_suffix_array(text)
            self.assertEqual(sa, sorted(range(len(text)), key=lambda i: text[i:]))
            for _ in range(8):
                pat = "".join(rng.choice("abc") for _ in range(rng.randint(0, 4)))
                want = [i for i in range(len(text)) if text.startswith(pat, i)]
                self.assertEqual(search_pattern(sa, text, pat), want)

if __name__ == '__main__':
    unittest.main()

