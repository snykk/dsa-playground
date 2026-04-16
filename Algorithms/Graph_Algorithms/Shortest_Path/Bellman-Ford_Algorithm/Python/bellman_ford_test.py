"""
Test suite for Bellman-Ford algorithm implementation
"""

import unittest
from bellman_ford import bellman_ford, bellman_ford_with_path


class TestBellmanFord(unittest.TestCase):
    """Test cases for Bellman-Ford algorithm implementation."""
    
    def setUp(self):
        """Set up test fixtures."""
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
        
        # Graph with multiple negative edges (no cycle)
        self.edges_multiple_negative = [
            (0, 1, 3),
            (1, 2, -2),
            (2, 3, -1),
            (0, 3, 5)
        ]
    
    def test_bellman_ford_basic(self):
        """Test basic Bellman-Ford algorithm."""
        distances = bellman_ford(self.edges, self.num_vertices, 0)
        self.assertIsNotNone(distances)
        self.assertEqual(distances[0], 0)
        self.assertEqual(distances[1], 4)
        self.assertEqual(distances[2], 2)
        self.assertEqual(distances[3], 3)  # 0 -> 2 -> 3 = 2 + 1 = 3
        self.assertEqual(len(distances), 4)
    
    def test_bellman_ford_negative_edge(self):
        """Test Bellman-Ford with negative edge weights."""
        distances = bellman_ford(self.edges_negative, 4, 0)
        self.assertIsNotNone(distances)
        self.assertEqual(distances[0], 0)
        self.assertEqual(distances[1], 4)
        self.assertEqual(distances[2], 2)
        self.assertEqual(distances[3], -1)  # 0 -> 1 -> 3 = 4 + (-5) = -1
    
    def test_bellman_ford_multiple_negative_edges(self):
        """Test Bellman-Ford with multiple negative edges."""
        distances = bellman_ford(self.edges_multiple_negative, 4, 0)
        self.assertIsNotNone(distances)
        self.assertEqual(distances[0], 0)
        self.assertEqual(distances[3], 0)  # 0 -> 1 -> 2 -> 3 = 3 + (-2) + (-1) = 0
    
    def test_bellman_ford_negative_cycle(self):
        """Test Bellman-Ford detects negative cycle."""
        distances = bellman_ford(self.edges_cycle, 3, 0)
        self.assertIsNone(distances)  # Negative cycle detected
    
    def test_bellman_ford_with_path(self):
        """Test Bellman-Ford with path reconstruction."""
        result = bellman_ford_with_path(self.edges, self.num_vertices, 0, 3)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 3)
        self.assertEqual(path, [0, 2, 3])
        self.assertEqual(path[0], 0)
        self.assertEqual(path[-1], 3)
    
    def test_bellman_ford_with_path_negative_edge(self):
        """Test path finding with negative edge weights."""
        result = bellman_ford_with_path(self.edges_negative, 4, 0, 3)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, -1)
        self.assertEqual(path, [0, 1, 3])
    
    def test_bellman_ford_with_path_negative_cycle(self):
        """Test path finding when negative cycle exists."""
        result = bellman_ford_with_path(self.edges_cycle, 3, 0, 2)
        self.assertIsNone(result)  # Negative cycle detected
    
    def test_bellman_ford_with_path_same_vertex(self):
        """Test path finding from vertex to itself."""
        result = bellman_ford_with_path(self.edges, self.num_vertices, 0, 0)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 0)
        self.assertEqual(path, [0])
    
    def test_bellman_ford_with_path_no_path(self):
        """Test path finding when no path exists."""
        isolated_edges = [
            (0, 1, 1),
            (2, 3, 1)
        ]
        result = bellman_ford_with_path(isolated_edges, 4, 0, 3)
        self.assertIsNone(result)  # No path exists
    
    def test_bellman_ford_single_vertex(self):
        """Test Bellman-Ford on graph with single vertex."""
        distances = bellman_ford([], 1, 0)
        self.assertIsNotNone(distances)
        self.assertEqual(distances[0], 0)
        self.assertEqual(len(distances), 1)
    
    def test_bellman_ford_empty_graph(self):
        """Test Bellman-Ford on empty graph (0 vertices)."""
        distances = bellman_ford([], 0, 0)
        self.assertIsNotNone(distances)
        # With 0 vertices, the distances dict is empty
        # but start vertex 0 still gets distance 0 assigned
        self.assertEqual(distances[0], 0)
    
    def test_bellman_ford_large_graph(self):
        """Test Bellman-Ford on larger graph."""
        large_edges = [
            (0, 1, 1),
            (1, 2, 2),
            (2, 3, 3),
            (0, 2, 5),
            (1, 3, 4)
        ]
        distances = bellman_ford(large_edges, 4, 0)
        self.assertIsNotNone(distances)
        self.assertEqual(distances[0], 0)
        self.assertEqual(distances[3], 5)  # 0 -> 1 -> 3 = 1 + 4 = 5


if __name__ == '__main__':
    unittest.main()


