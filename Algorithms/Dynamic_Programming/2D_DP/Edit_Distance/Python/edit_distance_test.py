"""
Test cases for Edit Distance
"""

import unittest
from edit_distance import edit_distance


class TestEditDistance(unittest.TestCase):
    
    def test_basic(self):
        """Test basic edit distance"""
        self.assertEqual(edit_distance("kitten", "sitting"), 3)
    
    def test_same_string(self):
        """Test same string"""
        self.assertEqual(edit_distance("abc", "abc"), 0)
    
    def test_one_empty(self):
        """Test one empty string"""
        self.assertEqual(edit_distance("abc", ""), 3)
        self.assertEqual(edit_distance("", "abc"), 3)

    def test_both_empty(self):
        """Two empty strings are already equal"""
        self.assertEqual(edit_distance("", ""), 0)

    def test_classic_pairs(self):
        """Exact distances for well-known pairs"""
        self.assertEqual(edit_distance("horse", "ros"), 3)
        self.assertEqual(edit_distance("intention", "execution"), 5)
        self.assertEqual(edit_distance("sunday", "saturday"), 3)
        self.assertEqual(edit_distance("flaw", "lawn"), 2)
        # No shared letters: 3 replacements + 3 insertions.
        self.assertEqual(edit_distance("cat", "feline"), 6)

    def test_symmetric(self):
        """Insert and delete mirror each other, so the distance is symmetric"""
        for a, b in [("kitten", "sitting"), ("ab", "ba"), ("flaw", "lawn")]:
            with self.subTest(a=a, b=b):
                self.assertEqual(edit_distance(a, b), edit_distance(b, a))


if __name__ == '__main__':
    unittest.main()

