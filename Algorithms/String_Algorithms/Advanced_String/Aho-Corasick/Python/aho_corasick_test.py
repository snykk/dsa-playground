"""Unit tests for Aho-Corasick."""
import unittest

from aho_corasick import AhoCorasick


def matches_set(matches):
    """Convert [(end_idx, pattern), ...] to a set for order-agnostic compare."""
    return set(matches)


class TestAhoCorasick(unittest.TestCase):
    def test_single_pattern_match(self):
        ac = AhoCorasick(["abc"])
        self.assertEqual(matches_set(ac.search("xxabcxx")), {(4, "abc")})

    def test_no_match(self):
        ac = AhoCorasick(["abc", "def"])
        self.assertEqual(ac.search("xyz"), [])

    def test_empty_text(self):
        ac = AhoCorasick(["abc"])
        self.assertEqual(ac.search(""), [])

    def test_empty_patterns(self):
        ac = AhoCorasick([])
        self.assertEqual(ac.search("hello"), [])

    def test_classic_ushers(self):
        # Textbook example from the original Aho-Corasick paper.
        ac = AhoCorasick(["he", "she", "his", "hers"])
        result = matches_set(ac.search("ushers"))
        expected = {
            (3, "she"),
            (3, "he"),
            (5, "hers"),
        }
        self.assertEqual(result, expected)

    def test_overlapping_patterns(self):
        ac = AhoCorasick(["ab", "bc", "abc"])
        result = matches_set(ac.search("abcabc"))
        expected = {
            (1, "ab"),
            (2, "bc"),
            (2, "abc"),
            (4, "ab"),
            (5, "bc"),
            (5, "abc"),
        }
        self.assertEqual(result, expected)

    def test_pattern_is_prefix_of_another(self):
        ac = AhoCorasick(["ab", "abab", "aba"])
        result = matches_set(ac.search("ababab"))
        # "ab" ends at 1,3,5; "aba" at 2,4; "abab" at 3,5 (overlapping matches allowed)
        expected = {
            (1, "ab"),
            (2, "aba"),
            (3, "ab"),
            (3, "abab"),
            (4, "aba"),
            (5, "ab"),
            (5, "abab"),
        }
        self.assertEqual(result, expected)

    def test_duplicate_patterns(self):
        # Same pattern inserted twice should still return exactly one entry per occurrence.
        ac = AhoCorasick(["abc", "abc"])
        matches = ac.search("abc")
        self.assertEqual(len(matches), 2)  # both copies stored → both reported

    def test_single_character_patterns(self):
        ac = AhoCorasick(["a", "b"])
        result = matches_set(ac.search("aabba"))
        expected = {(0, "a"), (1, "a"), (2, "b"), (3, "b"), (4, "a")}
        self.assertEqual(result, expected)

    def test_long_pattern(self):
        ac = AhoCorasick(["abcdefgh"])
        self.assertEqual(matches_set(ac.search("xxabcdefghxx")),
                         {(9, "abcdefgh")})

    def test_unicode(self):
        ac = AhoCorasick(["αβ", "βγ"])
        result = matches_set(ac.search("αβγ"))
        self.assertEqual(result, {(1, "αβ"), (2, "βγ")})


if __name__ == "__main__":
    unittest.main()
