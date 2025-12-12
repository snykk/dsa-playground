"""
Test suite for Ford-Fulkerson Algorithm implementation
"""

import unittest
from ford_fulkerson import (
    ford_fulkerson,
    ford_fulkerson_with_path,
    min_cut
)


class TestFordFulkerson(unittest.TestCase):
    
    def setUp(self):
        # Simple flow network
        #   0 --10--> 1 --5--> 3
        #   |         |         |
        #   5         3         8
        #   |         |         |
        #   v         v         v
        #   2 --7-->  4 --6-->  5
        self.graph1 = {
            0: {1: 10, 2: 5},
            1: {3: 5, 4: 3},
            2: {4: 7},
            3: {5: 8},
            4: {5: 6}
        }
        
        # Classic example: max flow = 23
        self.graph2 = {
            0: {1: 16, 2: 13},
            1: {2: 10, 3: 12},
            2: {1: 4, 4: 14},
            3: {2: 9, 5: 20},
            4: {3: 7, 5: 4}
        }
    
    def test_ford_fulkerson_basic(self):
        max_flow = ford_fulkerson(self.graph1, 0, 5)
        self.assertGreater(max_flow, 0)
        # Expected max flow should be at least 5 (minimum of paths)
        self.assertGreaterEqual(max_flow, 5)
    
    def test_ford_fulkerson_classic(self):
        max_flow = ford_fulkerson(self.graph2, 0, 5)
        # Classic example has max flow of 23
        self.assertEqual(max_flow, 23)
    
    def test_ford_fulkerson_same_source_sink(self):
        max_flow = ford_fulkerson(self.graph1, 0, 0)
        self.assertEqual(max_flow, 0)
    
    def test_ford_fulkerson_with_path(self):
        max_flow, paths = ford_fulkerson_with_path(self.graph2, 0, 5)
        self.assertEqual(max_flow, 23)
        self.assertGreater(len(paths), 0)
    
    def test_min_cut(self):
        cut_value, source_side, sink_side = min_cut(self.graph2, 0, 5)
        self.assertEqual(cut_value, 23)
        self.assertIn(0, source_side)
        self.assertIn(5, sink_side)


if __name__ == '__main__':
    unittest.main()

