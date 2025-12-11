"""
Test suite for Floyd-Warshall algorithm implementation
"""

import unittest
from floyd_warshall import floyd_warshall, floyd_warshall_path, reconstruct_path


class TestFloydWarshall(unittest.TestCase):
    
    def setUp(self):
        # Graph: 0 -> 1 (weight 4), 0 -> 2 (weight 2), 1 -> 3 (weight 5), 2 -> 3 (weight 1)
        self.graph = {
            0: [(1, 4), (2, 2)],
            1: [(3, 5)],
            2: [(3, 1)],
            3: []
        }
    
    def test_floyd_warshall_basic(self):
        dist = floyd_warshall(self.graph, 4)
        self.assertIsNotNone(dist)
        self.assertEqual(dist[0][0], 0)
        self.assertEqual(dist[0][1], 4)
        self.assertEqual(dist[0][2], 2)
        self.assertEqual(dist[0][3], 3)  # 0 -> 2 -> 3 = 2 + 1 = 3
    
    def test_floyd_warshall_path(self):
        dist, next_vertex = floyd_warshall_path(self.graph, 4)
        self.assertIsNotNone(dist)
        self.assertIsNotNone(next_vertex)
        
        path = reconstruct_path(next_vertex, 0, 3)
        self.assertIsNotNone(path)
        self.assertEqual(path, [0, 2, 3])


if __name__ == '__main__':
    unittest.main()


