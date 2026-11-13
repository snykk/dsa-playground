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

    def test_sink_unreachable(self):
        self.assertEqual(edmonds_karp({0: {1: 5}, 2: {3: 5}}, 0, 3), 0)

    def test_sink_without_key(self):
        self.assertEqual(edmonds_karp({0: {1: 7}, 1: {2: 3}}, 0, 2), 3)

    def test_anti_parallel_edges(self):
        self.assertEqual(edmonds_karp({0: {1: 4}, 1: {0: 6, 2: 5}}, 0, 2), 4)

    def test_zero_capacity_edge(self):
        graph = {0: {1: 0, 2: 3}, 1: {3: 9}, 2: {3: 9}}
        self.assertEqual(edmonds_karp(graph, 0, 3), 3)

    def test_diamond_with_cross_edge(self):
        graph = {0: {1: 1000, 2: 1000}, 1: {2: 1, 3: 1000}, 2: {3: 1000}}
        self.assertEqual(edmonds_karp(graph, 0, 3), 2000)

    def test_input_is_not_modified(self):
        graph = {0: {1: 3}, 1: {2: 2}}
        edmonds_karp(graph, 0, 2)
        self.assertEqual(graph, {0: {1: 3}, 1: {2: 2}})


if __name__ == '__main__':
    unittest.main()

