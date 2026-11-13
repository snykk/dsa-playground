"""Unit tests for Longest Common Substring"""
import unittest
from longest_common_substring import longest_common_substring

class TestLongestCommonSubstring(unittest.TestCase):
    def test_basic(self):
        result = longest_common_substring("ABABC", "BABCA")
        self.assertEqual(result[0], "BABC")
        self.assertEqual(result[1], 4)

    def test_returns_start_indices(self):
        # "BABC" starts at 1 in "ABABC" and at 0 in "BABCA".
        self.assertEqual(longest_common_substring("ABABC", "BABCA"), ("BABC", 4, 1, 0))

    def test_no_common_character(self):
        self.assertEqual(longest_common_substring("ABC", "XYZ"), ("", 0, 0, 0))
        self.assertEqual(longest_common_substring("", "ABC"), ("", 0, 0, 0))
        self.assertEqual(longest_common_substring("", ""), ("", 0, 0, 0))

    def test_tie_goes_to_the_earlier_substring(self):
        # "abc" and "xyz" both have length 3; "abc" ends first in s1.
        self.assertEqual(longest_common_substring("abcxyz", "xyzabc"), ("abc", 3, 0, 3))

    def test_not_a_subsequence(self):
        # "ace" is a common subsequence of the two, but the longest common substring is one character.
        self.assertEqual(longest_common_substring("abcde", "ace")[1], 1)

    def test_identical_and_contained(self):
        self.assertEqual(longest_common_substring("banana", "banana")[:2], ("banana", 6))
        self.assertEqual(longest_common_substring("xxabcxx", "abc"), ("abc", 3, 2, 0))

if __name__ == '__main__':
    unittest.main()

