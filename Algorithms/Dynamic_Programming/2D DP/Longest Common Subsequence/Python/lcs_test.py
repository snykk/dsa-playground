"""
Test cases for Longest Common Subsequence
"""

import unittest
from lcs import lcs_length, lcs_sequence, lcs_optimized


def is_subsequence(small, big):
    """True if small can be read out of big in order"""
    it = iter(big)
    return all(ch in it for ch in small)


class TestLCS(unittest.TestCase):
    
    def test_basic(self):
        """Test basic LCS"""
        s1 = "ABCDGH"
        s2 = "AEDFHR"
        self.assertEqual(lcs_length(s1, s2), 3)
    
    def test_sequence(self):
        """Test getting actual sequence"""
        s1 = "ABCDGH"
        s2 = "AEDFHR"
        seq = lcs_sequence(s1, s2)
        self.assertEqual(len(seq), 3)
        self.assertTrue(is_subsequence(seq, s1) and is_subsequence(seq, s2))

    def test_sequence_tie_break(self):
        """On ties the traceback moves left, which gives BDAB here (BCAB is also an LCS)"""
        self.assertEqual(lcs_sequence("ABCBDAB", "BDCAB"), "BDAB")
        self.assertEqual(lcs_length("ABCBDAB", "BDCAB"), 4)

    def test_empty_and_order(self):
        """Empty input gives 0 and order matters"""
        self.assertEqual(lcs_length("", "abc"), 0)
        self.assertEqual(lcs_sequence("", ""), "")
        self.assertEqual(lcs_length("abc", "cba"), 1)
        self.assertEqual(lcs_length("AAAA", "AA"), 2)

    def test_all_versions_agree(self):
        """Length, sequence and two-row version agree"""
        for a, b in [("AGGTAB", "GXTXAYB"), ("ABCBDAB", "BDCAB"), ("abc", "abc"), ("a", "b")]:
            with self.subTest(a=a, b=b):
                n = lcs_length(a, b)
                self.assertEqual(lcs_optimized(a, b), n)
                self.assertEqual(len(lcs_sequence(a, b)), n)
    
    def test_same_string(self):
        """Test same string"""
        s = "ABCD"
        self.assertEqual(lcs_length(s, s), len(s))
    
    def test_no_common(self):
        """Test no common subsequence"""
        s1 = "ABCD"
        s2 = "EFGH"
        self.assertEqual(lcs_length(s1, s2), 0)
    
    def test_optimized(self):
        """Test optimized version"""
        s1 = "ABCDGH"
        s2 = "AEDFHR"
        self.assertEqual(lcs_optimized(s1, s2), 3)


if __name__ == '__main__':
    unittest.main()

