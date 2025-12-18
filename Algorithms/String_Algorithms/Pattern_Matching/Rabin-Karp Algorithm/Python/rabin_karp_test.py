"""
Unit tests for Rabin-Karp Algorithm
"""

import unittest
from rabin_karp import rabin_karp_search, rabin_karp_search_count, rabin_karp_search_first


class TestRabinKarp(unittest.TestCase):
    
    def test_basic_search(self):
        text = "ABABDABACDABABCABC"
        pattern = "ABABCABC"
        result = rabin_karp_search(text, pattern)
        self.assertEqual(result, [10])
    
    def test_multiple_occurrences(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        result = rabin_karp_search(text, pattern)
        self.assertEqual(result, [0, 9, 12])
    
    def test_no_match(self):
        text = "ABCDEFG"
        pattern = "XYZ"
        result = rabin_karp_search(text, pattern)
        self.assertEqual(result, [])
    
    def test_count(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        count = rabin_karp_search_count(text, pattern)
        self.assertEqual(count, 3)
    
    def test_first_occurrence(self):
        text = "AABAACAADAABAABA"
        pattern = "AABA"
        first = rabin_karp_search_first(text, pattern)
        self.assertEqual(first, 0)


if __name__ == '__main__':
    unittest.main()

