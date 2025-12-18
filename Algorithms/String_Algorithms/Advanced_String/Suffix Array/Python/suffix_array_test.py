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

if __name__ == '__main__':
    unittest.main()

