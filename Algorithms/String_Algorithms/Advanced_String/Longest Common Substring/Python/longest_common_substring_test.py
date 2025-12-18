"""Unit tests for Longest Common Substring"""
import unittest
from longest_common_substring import longest_common_substring

class TestLongestCommonSubstring(unittest.TestCase):
    def test_basic(self):
        result = longest_common_substring("ABABC", "BABCA")
        self.assertEqual(result[0], "BABC")
        self.assertEqual(result[1], 4)

if __name__ == '__main__':
    unittest.main()

