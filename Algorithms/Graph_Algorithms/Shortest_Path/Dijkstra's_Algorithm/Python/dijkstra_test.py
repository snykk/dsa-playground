"""
Test suite for Dijkstra's algorithm implementation
"""

import unittest
from dijkstra import dijkstra, dijkstra_with_path, dijkstra_all_pairs


class TestDijkstra(unittest.TestCase):
    """Test cases for Dijkstra's algorithm implementation."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Graph: 1 -> 2 (weight 4), 1 -> 3 (weight 2), 2 -> 4 (weight 5), 3 -> 4 (weight 1)
        self.graph = {
            1: [(2, 4), (3, 2)],
            2: [(4, 5)],
            3: [(4, 1)],
            4: []
        }
        
        # Graph with multiple paths
        self.graph2 = {
            1: [(2, 1), (3, 4)],
            2: [(3, 2), (4, 5)],
            3: [(4, 1)],
            4: []
        }
        
        # Graph with self-loops (should be ignored in shortest path)
        self.graph3 = {
            1: [(1, 0), (2, 3)],
            2: [(3, 1)],
            3: []
        }
    
    def test_dijkstra_basic(self):
        """Test basic Dijkstra's algorithm."""
        distances = dijkstra(self.graph, 1)
        self.assertEqual(distances[1], 0)
        self.assertEqual(distances[2], 4)
        self.assertEqual(distances[3], 2)
        self.assertEqual(distances[4], 3)  # 1 -> 3 -> 4 = 2 + 1 = 3
        self.assertEqual(len(distances), 4)
    
    def test_dijkstra_multiple_paths(self):
        """Test Dijkstra's with multiple paths to same vertex."""
        distances = dijkstra(self.graph2, 1)
        self.assertEqual(distances[1], 0)
        self.assertEqual(distances[2], 1)
        self.assertEqual(distances[3], 3)  # 1 -> 2 -> 3 = 1 + 2 = 3 (better than 1 -> 3 = 4)
        self.assertEqual(distances[4], 4)  # 1 -> 2 -> 3 -> 4 = 1 + 2 + 1 = 4
    
    def test_dijkstra_with_path(self):
        """Test Dijkstra's with path reconstruction."""
        result = dijkstra_with_path(self.graph, 1, 4)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 3)
        self.assertEqual(path, [1, 3, 4])
        self.assertEqual(path[0], 1)
        self.assertEqual(path[-1], 4)
    
    def test_dijkstra_with_path_multiple_paths(self):
        """Test path finding with multiple possible paths."""
        result = dijkstra_with_path(self.graph2, 1, 4)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 4)
        self.assertEqual(path, [1, 2, 3, 4])
    
    def test_dijkstra_with_path_same_vertex(self):
        """Test path finding from vertex to itself."""
        result = dijkstra_with_path(self.graph, 1, 1)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 0)
        self.assertEqual(path, [1])
    
    def test_dijkstra_no_path(self):
        """Test Dijkstra's when no path exists."""
        isolated_graph = {
            1: [(2, 1)],
            2: [],
            3: []
        }
        distances = dijkstra(isolated_graph, 1)
        self.assertEqual(distances[1], 0)
        self.assertEqual(distances[2], 1)
        self.assertEqual(distances[3], float('inf'))
    
    def test_dijkstra_no_path_with_path(self):
        """Test path finding when no path exists."""
        isolated_graph = {
            1: [(2, 1)],
            2: [],
            3: []
        }
        result = dijkstra_with_path(isolated_graph, 1, 3)
        self.assertIsNone(result)
    
    def test_dijkstra_single_vertex(self):
        """Test Dijkstra's on graph with single vertex."""
        graph = {1: []}
        distances = dijkstra(graph, 1)
        self.assertEqual(distances[1], 0)
        self.assertEqual(len(distances), 1)
    
    def test_dijkstra_all_pairs(self):
        """Test all pairs shortest paths."""
        all_distances = dijkstra_all_pairs(self.graph)
        self.assertIn(1, all_distances)
        self.assertIn(2, all_distances)
        self.assertIn(3, all_distances)
        self.assertIn(4, all_distances)
        self.assertEqual(all_distances[1][1], 0)
        self.assertEqual(all_distances[1][4], 3)
    
    def test_dijkstra_empty_graph(self):
        """Test Dijkstra's on empty graph."""
        distances = dijkstra({}, 1)
        self.assertEqual(len(distances), 1)
        self.assertEqual(distances[1], 0)
    
    def test_dijkstra_start_not_in_graph(self):
        """Test Dijkstra's when start vertex not in graph."""
        distances = dijkstra(self.graph, 99)
        self.assertEqual(len(distances), 5)
        self.assertEqual(distances[99], 0)
        # All other vertices should be unreachable
        self.assertEqual(distances[1], float('inf'))


if __name__ == '__main__':
    unittest.main()

