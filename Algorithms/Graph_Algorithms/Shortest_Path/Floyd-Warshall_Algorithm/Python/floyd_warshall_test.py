"""
Test suite for Floyd-Warshall algorithm implementation
"""

import unittest
from floyd_warshall import floyd_warshall, floyd_warshall_path, reconstruct_path
import sys


class TestFloydWarshall(unittest.TestCase):
    """Test cases for Floyd-Warshall algorithm implementation."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Graph: 0 -> 1 (weight 4), 0 -> 2 (weight 2), 1 -> 3 (weight 5), 2 -> 3 (weight 1)
        self.graph = {
            0: [(1, 4), (2, 2)],
            1: [(3, 5)],
            2: [(3, 1)],
            3: []
        }
        
        # Graph with negative edges (no cycle)
        self.graph_negative = {
            0: [(1, 4), (2, 2)],
            1: [(3, -5)],
            2: [(3, 1)],
            3: []
        }
        
        # Complete graph
        self.graph_complete = {
            0: [(1, 1), (2, 3)],
            1: [(0, 1), (2, 1)],
            2: [(0, 3), (1, 1)]
        }
    
    def test_floyd_warshall_basic(self):
        """Test basic Floyd-Warshall algorithm."""
        dist = floyd_warshall(self.graph, 4)
        self.assertIsNotNone(dist)
        self.assertEqual(dist[0][0], 0)
        self.assertEqual(dist[1][1], 0)
        self.assertEqual(dist[2][2], 0)
        self.assertEqual(dist[3][3], 0)
        self.assertEqual(dist[0][1], 4)
        self.assertEqual(dist[0][2], 2)
        self.assertEqual(dist[0][3], 3)  # 0 -> 2 -> 3 = 2 + 1 = 3
        self.assertEqual(dist[1][3], 5)
        self.assertEqual(dist[2][3], 1)
    
    def test_floyd_warshall_all_pairs(self):
        """Test Floyd-Warshall finds all pairs shortest paths."""
        dist = floyd_warshall(self.graph, 4)
        # Test all pairs
        for i in range(4):
            self.assertEqual(dist[i][i], 0)
        # Test specific paths
        self.assertEqual(dist[1][0], sys.maxsize)  # No path from 1 to 0
        self.assertEqual(dist[2][0], sys.maxsize)  # No path from 2 to 0
        self.assertEqual(dist[3][0], sys.maxsize)  # No path from 3 to 0
    
    def test_floyd_warshall_negative_edges(self):
        """Test Floyd-Warshall with negative edge weights."""
        dist = floyd_warshall(self.graph_negative, 4)
        self.assertIsNotNone(dist)
        self.assertEqual(dist[0][3], -1)  # 0 -> 1 -> 3 = 4 + (-5) = -1
    
    def test_floyd_warshall_complete_graph(self):
        """Test Floyd-Warshall on complete graph."""
        dist = floyd_warshall(self.graph_complete, 3)
        self.assertIsNotNone(dist)
        self.assertEqual(dist[0][1], 1)
        self.assertEqual(dist[0][2], 2)  # 0 -> 1 -> 2 = 1 + 1 = 2
        self.assertEqual(dist[1][2], 1)
    
    def test_floyd_warshall_path(self):
        """Test Floyd-Warshall with path reconstruction."""
        dist, next_vertex = floyd_warshall_path(self.graph, 4)
        self.assertIsNotNone(dist)
        self.assertIsNotNone(next_vertex)
        
        path = reconstruct_path(next_vertex, 0, 3)
        self.assertIsNotNone(path)
        self.assertEqual(path, [0, 2, 3])
        self.assertEqual(path[0], 0)
        self.assertEqual(path[-1], 3)
    
    def test_floyd_warshall_path_multiple_paths(self):
        """Test path reconstruction with multiple possible paths."""
        dist, next_vertex = floyd_warshall_path(self.graph_complete, 3)
        path = reconstruct_path(next_vertex, 0, 2)
        self.assertIsNotNone(path)
        self.assertEqual(path[0], 0)
        self.assertEqual(path[-1], 2)
    
    def test_floyd_warshall_path_same_vertex(self):
        """Test path reconstruction from vertex to itself."""
        dist, next_vertex = floyd_warshall_path(self.graph, 4)
        path = reconstruct_path(next_vertex, 0, 0)
        self.assertIsNotNone(path)
        self.assertEqual(path, [0])
    
    def test_floyd_warshall_path_no_path(self):
        """Test path reconstruction when no path exists."""
        dist, next_vertex = floyd_warshall_path(self.graph, 4)
        path = reconstruct_path(next_vertex, 1, 0)
        self.assertIsNone(path)
    
    def test_floyd_warshall_single_vertex(self):
        """Test Floyd-Warshall on graph with single vertex."""
        graph = {0: []}
        dist = floyd_warshall(graph, 1)
        self.assertIsNotNone(dist)
        self.assertEqual(dist[0][0], 0)
    
    def test_floyd_warshall_empty_graph(self):
        """Test Floyd-Warshall on empty graph."""
        dist = floyd_warshall({}, 0)
        self.assertIsNotNone(dist)
        self.assertEqual(len(dist), 0)
    
    def test_reconstruct_path_invalid(self):
        """Test path reconstruction with invalid next_vertex."""
        next_vertex = [[-1] * 4 for _ in range(4)]
        path = reconstruct_path(next_vertex, 0, 3)
        self.assertIsNone(path)


if __name__ == '__main__':
    unittest.main()


