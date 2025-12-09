"""
Test cases for Longest Common Subsequence
"""

import unittest
from lcs import lcs_length, lcs_sequence, lcs_optimized


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

