"""
Test suite for Dijkstra's algorithm implementation
"""

import unittest
from dijkstra import dijkstra, dijkstra_with_path, dijkstra_all_pairs


class TestDijkstra(unittest.TestCase):
    
    def setUp(self):
        # Graph: 1 -> 2 (weight 4), 1 -> 3 (weight 2), 2 -> 4 (weight 5), 3 -> 4 (weight 1)
        self.graph = {
            1: [(2, 4), (3, 2)],
            2: [(4, 5)],
            3: [(4, 1)],
            4: []
        }
    
    def test_dijkstra_basic(self):
        distances = dijkstra(self.graph, 1)
        self.assertEqual(distances[1], 0)
        self.assertEqual(distances[2], 4)
        self.assertEqual(distances[3], 2)
        self.assertEqual(distances[4], 3)  # 1 -> 3 -> 4 = 2 + 1 = 3
    
    def test_dijkstra_with_path(self):
        result = dijkstra_with_path(self.graph, 1, 4)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 3)
        self.assertEqual(path, [1, 3, 4])
    
    def test_dijkstra_no_path(self):
        isolated_graph = {
            1: [(2, 1)],
            2: [],
            3: []
        }
        distances = dijkstra(isolated_graph, 1)
        self.assertEqual(distances[3], float('inf'))


if __name__ == '__main__':
    unittest.main()

