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


if __name__ == '__main__':
    unittest.main()

