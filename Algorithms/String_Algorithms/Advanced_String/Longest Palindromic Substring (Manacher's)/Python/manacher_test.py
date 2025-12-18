"""Unit tests for Manacher's Algorithm"""
import unittest
from manacher import manacher

class TestManacher(unittest.TestCase):
    def test_basic(self):
        result = manacher("babad")
        self.assertIn(result[0], ["bab", "aba"])
        self.assertEqual(result[2], 3)

if __name__ == '__main__':
    unittest.main()

