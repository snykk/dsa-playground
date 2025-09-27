import unittest
from pattern_matching import *

class TestPatternMatching(unittest.TestCase):
    text = "ababcabcabc"
    pattern = "abc"

    def test_naive(self):
        self.assertEqual(naive_search(self.text,self.pattern), [2,5,8])

    def test_kmp(self):
        self.assertEqual(kmp_search(self.text,self.pattern), [2,5,8])

    def test_rabin_karp(self):
        self.assertEqual(rabin_karp_search(self.text,self.pattern), [2,5,8])

    def test_boyer_moore(self):
        self.assertEqual(boyer_moore_search(self.text,self.pattern), [2,5,8])

if __name__ == "__main__":
    unittest.main()
