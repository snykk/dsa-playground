"""
Test suite for Edmonds-Karp Algorithm implementation
"""

import unittest
from edmonds_karp import edmonds_karp


class TestEdmondsKarp(unittest.TestCase):
    
    def test_edmonds_karp_classic(self):
        graph = {
            0: {1: 16, 2: 13},
            1: {2: 10, 3: 12},
            2: {1: 4, 4: 14},
            3: {2: 9, 5: 20},
            4: {3: 7, 5: 4}
        }
        max_flow = edmonds_karp(graph, 0, 5)
        self.assertEqual(max_flow, 23)
    
    def test_edmonds_karp_same_source_sink(self):
        graph = {0: {1: 10}}
        max_flow = edmonds_karp(graph, 0, 0)
        self.assertEqual(max_flow, 0)


if __name__ == '__main__':
    unittest.main()

