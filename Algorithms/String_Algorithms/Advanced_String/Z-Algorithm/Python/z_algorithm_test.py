"""Unit tests for Z-Algorithm."""
import unittest

from z_algorithm import build_z_array, z_algorithm_search


class TestZArray(unittest.TestCase):
    def test_empty_string(self):
        self.assertEqual(build_z_array(""), [])

    def test_single_character(self):
        self.assertEqual(build_z_array("a"), [0])

    def test_all_same_characters(self):
        # For "aaaa": Z[i] = n - i for every i >= 1
        self.assertEqual(build_z_array("aaaa"), [0, 3, 2, 1])

    def test_classic_example(self):
        # Standard textbook trace for "aabxaabxcaabxaabxay"
        z = build_z_array("aabxaabxcaabxaabxay")
        self.assertEqual(z[0], 0)
        self.assertEqual(z[4], 4)
        self.assertEqual(z[9], 8)

    def test_no_repetition(self):
        self.assertEqual(build_z_array("abcdef"), [0, 0, 0, 0, 0, 0])


class TestZAlgorithmSearch(unittest.TestCase):
    def test_basic_match(self):
        self.assertEqual(
            z_algorithm_search("ABABDABACDABABCABC", "ABABCABC"), [10]
        )

    def test_multiple_occurrences(self):
        self.assertEqual(z_algorithm_search("abababab", "ab"), [0, 2, 4, 6])

    def test_overlapping_patterns(self):
        # "aaa" appears at 0,1 in "aaaa" (overlap allowed)
        self.assertEqual(z_algorithm_search("aaaa", "aaa"), [0, 1])

    def test_pattern_at_end(self):
        self.assertEqual(z_algorithm_search("hellohello", "hello"), [0, 5])

    def test_empty_pattern(self):
        self.assertEqual(z_algorithm_search("abc", ""), [])

    def test_empty_text(self):
        self.assertEqual(z_algorithm_search("", "abc"), [])

    def test_pattern_longer_than_text(self):
        self.assertEqual(z_algorithm_search("ab", "abcdef"), [])

    def test_no_match(self):
        self.assertEqual(z_algorithm_search("hello world", "xyz"), [])

    def test_single_character_pattern(self):
        self.assertEqual(z_algorithm_search("banana", "a"), [1, 3, 5])

    def test_whole_text_matches(self):
        self.assertEqual(z_algorithm_search("abc", "abc"), [0])

    def test_unicode_characters(self):
        # Greek letters, built from code points to keep this file ASCII-only.
        alpha, beta, gamma = chr(0x3B1), chr(0x3B2), chr(0x3B3)
        text = alpha + beta + gamma + alpha + beta
        self.assertEqual(z_algorithm_search(text, alpha + beta), [0, 3])

    def test_separator_character_in_input(self):
        # Regression: with "$" in the input, Z[i] can run past the separator
        # (Z[i] > m); the old Z[i] == m test dropped these matches.
        self.assertEqual(z_algorithm_search("a$a", "a"), [0, 2])
        self.assertEqual(z_algorithm_search("$$", "$"), [0, 1])
        self.assertEqual(z_algorithm_search("ab$ab", "ab"), [0, 3])


if __name__ == "__main__":
    unittest.main()
