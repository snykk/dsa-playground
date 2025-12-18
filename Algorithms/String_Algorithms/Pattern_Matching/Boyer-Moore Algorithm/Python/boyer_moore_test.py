"""Unit tests for Boyer-Moore Algorithm"""
import unittest
from boyer_moore import boyer_moore_search

class TestBoyerMoore(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(boyer_moore_search("ABABDABACDABABCABC", "ABABCABC"), [10])
    def test_multiple(self):
        self.assertEqual(boyer_moore_search("AABAACAADAABAABA", "AABA"), [0, 9, 12])

if __name__ == '__main__':
    unittest.main()

