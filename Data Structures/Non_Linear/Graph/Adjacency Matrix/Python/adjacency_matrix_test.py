"""Tests for Adjacency Matrix implementation."""

import unittest
from adjacency_matrix import AdjacencyMatrix


class TestAdjacencyMatrix(unittest.TestCase):
    """Test cases for AdjacencyMatrix class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.unweighted_undirected = AdjacencyMatrix(5, directed=False, weighted=False)
        self.weighted_undirected = AdjacencyMatrix(5, directed=False, weighted=True)
        self.unweighted_directed = AdjacencyMatrix(5, directed=True, weighted=False)
        self.weighted_directed = AdjacencyMatrix(5, directed=True, weighted=True)
    
    def test_add_edge_unweighted_undirected(self):
        """Test adding unweighted edges in undirected graph."""
        self.unweighted_undirected.add_edge(0, 1)
        self.unweighted_undirected.add_edge(1, 2)
        
        self.assertTrue(self.unweighted_undirected.has_edge(0, 1))
        self.assertTrue(self.unweighted_undirected.has_edge(1, 0))  # Bidirectional
        self.assertTrue(self.unweighted_undirected.has_edge(1, 2))
        self.assertFalse(self.unweighted_undirected.has_edge(0, 2))
    
    def test_add_edge_weighted_undirected(self):
        """Test adding weighted edges in undirected graph."""
        self.weighted_undirected.add_edge(0, 1, weight=5.0)
        self.weighted_undirected.add_edge(1, 2, weight=3.0)
        
        self.assertTrue(self.weighted_undirected.has_edge(0, 1))
        self.assertEqual(self.weighted_undirected.get_weight(0, 1), 5.0)
        self.assertEqual(self.weighted_undirected.get_weight(1, 0), 5.0)  # Undirected
    
    def test_add_edge_unweighted_directed(self):
        """Test adding unweighted edges in directed graph."""
        self.unweighted_directed.add_edge(0, 1)
        self.unweighted_directed.add_edge(1, 2)
        
        self.assertTrue(self.unweighted_directed.has_edge(0, 1))
        self.assertFalse(self.unweighted_directed.has_edge(1, 0))  # Not bidirectional
    
    def test_remove_edge(self):
        """Test removing edges."""
        self.unweighted_undirected.add_edge(0, 1)
        self.unweighted_undirected.remove_edge(0, 1)
        
        self.assertFalse(self.unweighted_undirected.has_edge(0, 1))
        self.assertFalse(self.unweighted_undirected.has_edge(1, 0))
    
    def test_get_neighbors(self):
        """Test getting neighbors."""
        self.unweighted_undirected.add_edge(0, 1)
        self.unweighted_undirected.add_edge(0, 2)
        
        neighbors = self.unweighted_undirected.get_neighbors(0)
        self.assertIn(1, neighbors)
        self.assertIn(2, neighbors)
        self.assertEqual(len(neighbors), 2)
    
    def test_get_degree(self):
        """Test getting vertex degree."""
        self.unweighted_undirected.add_edge(0, 1)
        self.unweighted_undirected.add_edge(0, 2)
        
        self.assertEqual(self.unweighted_undirected.get_degree(0), 2)
        self.assertEqual(self.unweighted_undirected.get_degree(1), 1)
    
    def test_get_degree_directed(self):
        """Test getting vertex degree in directed graph."""
        self.unweighted_directed.add_edge(0, 1)
        self.unweighted_directed.add_edge(1, 0)  # Reverse edge
        self.unweighted_directed.add_edge(0, 2)
        
        # Vertex 0: out-degree 2, in-degree 1
        self.assertEqual(self.unweighted_directed.get_degree(0), 3)
    
    def test_bfs(self):
        """Test BFS traversal."""
        self.unweighted_undirected.add_edge(0, 1)
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(0, 3)
        
        bfs_result = self.unweighted_undirected.bfs(0)
        self.assertEqual(bfs_result[0], 0)
        self.assertEqual(len(bfs_result), 4)
        self.assertIn(1, bfs_result)
        self.assertIn(2, bfs_result)
        self.assertIn(3, bfs_result)
    
    def test_dfs(self):
        """Test DFS traversal."""
        self.unweighted_undirected.add_edge(0, 1)
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(0, 3)
        
        dfs_result = self.unweighted_undirected.dfs(0)
        self.assertEqual(dfs_result[0], 0)
        self.assertEqual(len(dfs_result), 4)
    
    def test_dfs_recursive(self):
        """Test recursive DFS traversal."""
        self.unweighted_undirected.add_edge(0, 1)
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(0, 3)
        
        dfs_result = self.unweighted_undirected.dfs_recursive(0)
        self.assertEqual(dfs_result[0], 0)
        self.assertEqual(len(dfs_result), 4)
    
    def test_is_connected(self):
        """Test checking if graph is connected."""
        self.unweighted_undirected.add_edge(0, 1)
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        self.unweighted_undirected.add_edge(3, 4)
        self.assertTrue(self.unweighted_undirected.is_connected())
        
        disconnected = AdjacencyMatrix(4, directed=False, weighted=False)
        disconnected.add_edge(0, 1)
        # Vertex 2 and 3 are isolated
        self.assertFalse(disconnected.is_connected())
    
    def test_get_matrix(self):
        """Test getting the adjacency matrix."""
        self.unweighted_undirected.add_edge(0, 1)
        matrix = self.unweighted_undirected.get_matrix()
        
        self.assertEqual(matrix[0][1], 1)
        self.assertEqual(matrix[1][0], 1)
        self.assertEqual(matrix[0][0], 0)  # No self-loop
    
    def test_get_weight_unweighted(self):
        """Test getting weight from unweighted graph."""
        self.unweighted_undirected.add_edge(0, 1)
        self.assertIsNone(self.unweighted_undirected.get_weight(0, 1))
    
    def test_invalid_vertex(self):
        """Test operations with invalid vertex indices."""
        with self.assertRaises(ValueError):
            self.unweighted_undirected.add_edge(0, 10)  # Out of range
        
        self.assertFalse(self.unweighted_undirected.has_edge(0, 10))
        self.assertEqual(self.unweighted_undirected.get_neighbors(10), [])


if __name__ == '__main__':
    unittest.main()

