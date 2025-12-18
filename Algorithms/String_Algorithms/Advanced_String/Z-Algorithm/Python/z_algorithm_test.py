"""Unit tests for Z-Algorithm"""
import unittest
from z_algorithm import z_algorithm_search, build_z_array

class TestZAlgorithm(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(z_algorithm_search("ABABDABACDABABCABC", "ABABCABC"), [10])
    def test_z_array(self):
        z = build_z_array("aabxaabxcaabxaabxay")
        self.assertEqual(z[0], 0)

if __name__ == '__main__':
    unittest.main()

