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
        # Paths 0-1-3-5 (5), 0-1-4-5 (3), 0-2-4-5 (3); the minimum cut is also 11.
        self.assertEqual(max_flow, 11)
    
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

    def test_sink_unreachable(self):
        self.assertEqual(ford_fulkerson({0: {1: 5}, 2: {3: 5}}, 0, 3), 0)

    def test_sink_without_key(self):
        self.assertEqual(ford_fulkerson({0: {1: 7}, 1: {2: 3}}, 0, 2), 3)

    def test_anti_parallel_edges(self):
        self.assertEqual(ford_fulkerson({0: {1: 4}, 1: {0: 6, 2: 5}}, 0, 2), 4)

    def test_long_chain_does_not_recurse(self):
        # A recursive DFS raised RecursionError at about 1000 vertices.
        chain = {i: {i + 1: 5} for i in range(5000)}
        self.assertEqual(ford_fulkerson(chain, 0, 5000), 5)
        self.assertEqual(ford_fulkerson_with_path(chain, 0, 5000)[0], 5)
        self.assertEqual(min_cut(chain, 0, 5000)[0], 5)

    def test_min_cut_sides(self):
        cut_value, source_side, sink_side = min_cut(self.graph2, 0, 5)
        self.assertEqual(source_side, {0, 1, 2, 4})
        self.assertEqual(sink_side, {3, 5})

    def test_paths_account_for_the_flow(self):
        max_flow, paths = ford_fulkerson_with_path(self.graph2, 0, 5)
        self.assertEqual(sum(cap for _, cap in paths), max_flow)
        for path, _ in paths:
            self.assertEqual((path[0], path[-1]), (0, 5))


if __name__ == '__main__':
    unittest.main()

