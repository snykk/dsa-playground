"""
Test suite for Bellman-Ford algorithm implementation
"""

import unittest
from bellman_ford import bellman_ford, bellman_ford_with_path


class TestBellmanFord(unittest.TestCase):
    
    def setUp(self):
        # Graph: 0 -> 1 (weight 4), 0 -> 2 (weight 2), 1 -> 3 (weight 5), 2 -> 3 (weight 1)
        self.edges = [
            (0, 1, 4),
            (0, 2, 2),
            (1, 3, 5),
            (2, 3, 1)
        ]
        self.num_vertices = 4
        
        # Graph with negative edge (no cycle)
        self.edges_negative = [
            (0, 1, 4),
            (0, 2, 2),
            (1, 3, -5),
            (2, 3, 1)
        ]
        
        # Graph with negative cycle
        self.edges_cycle = [
            (0, 1, 1),
            (1, 2, -2),
            (2, 0, -1)
        ]
    
    def test_bellman_ford_basic(self):
        distances = bellman_ford(self.edges, self.num_vertices, 0)
        self.assertIsNotNone(distances)
        self.assertEqual(distances[0], 0)
        self.assertEqual(distances[1], 4)
        self.assertEqual(distances[2], 2)
        self.assertEqual(distances[3], 3)  # 0 -> 2 -> 3 = 2 + 1 = 3
    
    def test_bellman_ford_negative_edge(self):
        distances = bellman_ford(self.edges_negative, 4, 0)
        self.assertIsNotNone(distances)
        self.assertEqual(distances[3], -1)  # 0 -> 1 -> 3 = 4 + (-5) = -1
    
    def test_bellman_ford_negative_cycle(self):
        distances = bellman_ford(self.edges_cycle, 3, 0)
        self.assertIsNone(distances)  # Negative cycle detected
    
    def test_bellman_ford_with_path(self):
        result = bellman_ford_with_path(self.edges, self.num_vertices, 0, 3)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 3)
        self.assertEqual(path, [0, 2, 3])


if __name__ == '__main__':
    unittest.main()


