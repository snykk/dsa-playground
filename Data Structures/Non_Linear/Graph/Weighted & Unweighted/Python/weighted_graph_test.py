"""Tests for Weighted Graph implementation."""

import unittest
from weighted_graph import WeightedGraph


class TestWeightedGraph(unittest.TestCase):
    """Test cases for WeightedGraph class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.undirected_graph = WeightedGraph(directed=False)
        self.directed_graph = WeightedGraph(directed=True)
    
    def test_add_vertex(self):
        """Test adding vertices."""
        self.undirected_graph.add_vertex(1)
        self.undirected_graph.add_vertex(2)
        
        self.assertIn(1, self.undirected_graph.get_vertices())
        self.assertIn(2, self.undirected_graph.get_vertices())
    
    def test_add_edge_unweighted(self):
        """Test adding unweighted edges (default weight = 1.0)."""
        self.undirected_graph.add_edge(1, 2)  # Default weight = 1.0
        
        self.assertTrue(self.undirected_graph.has_edge(1, 2))
        self.assertEqual(self.undirected_graph.get_weight(1, 2), 1.0)
    
    def test_add_edge_weighted(self):
        """Test adding weighted edges."""
        self.undirected_graph.add_edge(1, 2, weight=5.5)
        self.undirected_graph.add_edge(2, 3, weight=3.2)
        
        self.assertEqual(self.undirected_graph.get_weight(1, 2), 5.5)
        self.assertEqual(self.undirected_graph.get_weight(2, 3), 3.2)
        self.assertEqual(self.undirected_graph.get_weight(2, 1), 5.5)  # Undirected
    
    def test_add_edge_directed_weighted(self):
        """Test adding weighted edges in directed graph."""
        self.directed_graph.add_edge(1, 2, weight=5.0)
        self.directed_graph.add_edge(2, 1, weight=3.0)  # Different weight
        
        self.assertEqual(self.directed_graph.get_weight(1, 2), 5.0)
        self.assertEqual(self.directed_graph.get_weight(2, 1), 3.0)
    
    def test_get_weight_nonexistent(self):
        """Test getting weight of nonexistent edge."""
        self.assertIsNone(self.undirected_graph.get_weight(1, 2))
    
    def test_get_neighbors_with_weights(self):
        """Test getting neighbors with weights."""
        self.undirected_graph.add_edge(1, 2, weight=5.0)
        self.undirected_graph.add_edge(1, 3, weight=3.0)
        
        neighbors = self.undirected_graph.get_neighbors_with_weights(1)
        self.assertEqual(len(neighbors), 2)
        self.assertIn((2, 5.0), neighbors)
        self.assertIn((3, 3.0), neighbors)
    
    def test_get_edges(self):
        """Test getting all edges with weights."""
        self.undirected_graph.add_edge(1, 2, weight=5.0)
        self.undirected_graph.add_edge(2, 3, weight=3.0)
        
        edges = self.undirected_graph.get_edges()
        self.assertEqual(len(edges), 2)
        self.assertIn((1, 2, 5.0), edges)
        self.assertIn((2, 3, 3.0), edges)
    
    def test_update_edge_weight(self):
        """Test updating edge weight by re-adding edge."""
        self.undirected_graph.add_edge(1, 2, weight=5.0)
        self.undirected_graph.add_edge(1, 2, weight=10.0)  # Update weight
        
        self.assertEqual(self.undirected_graph.get_weight(1, 2), 10.0)
    
    def test_remove_edge(self):
        """Test removing edges."""
        self.undirected_graph.add_edge(1, 2, weight=5.0)
        self.undirected_graph.remove_edge(1, 2)
        
        self.assertFalse(self.undirected_graph.has_edge(1, 2))
        self.assertIsNone(self.undirected_graph.get_weight(1, 2))
    
    def test_bfs_weighted(self):
        """Test BFS traversal in weighted graph."""
        self.undirected_graph.add_edge(1, 2, weight=5.0)
        self.undirected_graph.add_edge(2, 3, weight=3.0)
        self.undirected_graph.add_edge(1, 4, weight=2.0)
        
        bfs_result = self.undirected_graph.bfs(1)
        self.assertEqual(bfs_result[0], 1)
        self.assertEqual(len(bfs_result), 4)
    
    def test_dfs_weighted(self):
        """Test DFS traversal in weighted graph."""
        self.undirected_graph.add_edge(1, 2, weight=5.0)
        self.undirected_graph.add_edge(2, 3, weight=3.0)
        self.undirected_graph.add_edge(1, 4, weight=2.0)
        
        dfs_result = self.undirected_graph.dfs(1)
        self.assertEqual(dfs_result[0], 1)
        self.assertEqual(len(dfs_result), 4)
    
    def test_get_total_weight(self):
        """Test getting total weight of all edges."""
        self.undirected_graph.add_edge(1, 2, weight=5.0)
        self.undirected_graph.add_edge(2, 3, weight=3.0)
        self.undirected_graph.add_edge(1, 4, weight=2.0)
        
        total = self.undirected_graph.get_total_weight()
        self.assertEqual(total, 10.0)  # 5.0 + 3.0 + 2.0
    
    def test_get_total_weight_directed(self):
        """Test getting total weight in directed graph."""
        self.directed_graph.add_edge(1, 2, weight=5.0)
        self.directed_graph.add_edge(2, 1, weight=3.0)  # Different edge
        
        total = self.directed_graph.get_total_weight()
        self.assertEqual(total, 8.0)  # 5.0 + 3.0 (both edges counted)
    
    def test_is_connected(self):
        """Test checking if weighted graph is connected."""
        self.undirected_graph.add_edge(1, 2, weight=5.0)
        self.undirected_graph.add_edge(2, 3, weight=3.0)
        self.assertTrue(self.undirected_graph.is_connected())
        
        disconnected = WeightedGraph(directed=False)
        disconnected.add_edge(1, 2, weight=5.0)
        disconnected.add_vertex(3)  # Isolated vertex
        self.assertFalse(disconnected.is_connected())


if __name__ == '__main__':
    unittest.main()

