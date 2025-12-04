"""Tests for Edge List implementation."""

import unittest
from edge_list import EdgeList


class TestEdgeList(unittest.TestCase):
    """Test cases for EdgeList class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.unweighted_undirected = EdgeList(directed=False, weighted=False)
        self.weighted_undirected = EdgeList(directed=False, weighted=True)
        self.unweighted_directed = EdgeList(directed=True, weighted=False)
        self.weighted_directed = EdgeList(directed=True, weighted=True)
    
    def test_add_edge_unweighted_undirected(self):
        """Test adding unweighted edges in undirected graph."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        
        self.assertTrue(self.unweighted_undirected.has_edge(1, 2))
        self.assertTrue(self.unweighted_undirected.has_edge(2, 1))  # Bidirectional
        self.assertEqual(self.unweighted_undirected.get_edge_count(), 2)
    
    def test_add_edge_weighted_undirected(self):
        """Test adding weighted edges in undirected graph."""
        self.weighted_undirected.add_edge(1, 2, weight=5.0)
        self.weighted_undirected.add_edge(2, 3, weight=3.0)
        
        self.assertTrue(self.weighted_undirected.has_edge(1, 2))
        self.assertEqual(self.weighted_undirected.get_weight(1, 2), 5.0)
        self.assertEqual(self.weighted_undirected.get_weight(2, 1), 5.0)  # Undirected
        self.assertEqual(self.weighted_undirected.get_edge_count(), 2)
    
    def test_add_edge_unweighted_directed(self):
        """Test adding unweighted edges in directed graph."""
        self.unweighted_directed.add_edge(1, 2)
        self.unweighted_directed.add_edge(2, 3)
        
        self.assertTrue(self.unweighted_directed.has_edge(1, 2))
        self.assertFalse(self.unweighted_directed.has_edge(2, 1))  # Not bidirectional
        self.assertEqual(self.unweighted_directed.get_edge_count(), 2)
    
    def test_add_edge_weighted_directed(self):
        """Test adding weighted edges in directed graph."""
        self.weighted_directed.add_edge(1, 2, weight=5.0)
        self.weighted_directed.add_edge(2, 1, weight=3.0)  # Different weight
        
        self.assertEqual(self.weighted_directed.get_weight(1, 2), 5.0)
        self.assertEqual(self.weighted_directed.get_weight(2, 1), 3.0)
        self.assertEqual(self.weighted_directed.get_edge_count(), 2)
    
    def test_remove_edge(self):
        """Test removing edges."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.remove_edge(1, 2)
        
        self.assertFalse(self.unweighted_undirected.has_edge(1, 2))
        self.assertFalse(self.unweighted_undirected.has_edge(2, 1))
    
    def test_get_neighbors(self):
        """Test getting neighbors."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(1, 3)
        
        neighbors = self.unweighted_undirected.get_neighbors(1)
        self.assertIn(2, neighbors)
        self.assertIn(3, neighbors)
        self.assertEqual(len(neighbors), 2)
    
    def test_get_edges(self):
        """Test getting all edges."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        
        edges = self.unweighted_undirected.get_edges()
        self.assertEqual(len(edges), 4)  # 2 edges * 2 (undirected)
        self.assertIn((1, 2), edges)
        self.assertIn((2, 1), edges)
        self.assertIn((2, 3), edges)
        self.assertIn((3, 2), edges)
    
    def test_get_edges_weighted(self):
        """Test getting all weighted edges."""
        self.weighted_undirected.add_edge(1, 2, weight=5.0)
        self.weighted_undirected.add_edge(2, 3, weight=3.0)
        
        edges = self.weighted_undirected.get_edges()
        self.assertEqual(len(edges), 4)  # 2 edges * 2 (undirected)
        self.assertIn((1, 2, 5.0), edges)
        self.assertIn((2, 1, 5.0), edges)
    
    def test_get_weight_unweighted(self):
        """Test getting weight from unweighted graph."""
        self.unweighted_undirected.add_edge(1, 2)
        self.assertIsNone(self.unweighted_undirected.get_weight(1, 2))
    
    def test_get_edge_count(self):
        """Test getting edge count."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        self.assertEqual(self.unweighted_undirected.get_edge_count(), 2)
        
        self.unweighted_directed.add_edge(1, 2)
        self.unweighted_directed.add_edge(2, 3)
        self.assertEqual(self.unweighted_directed.get_edge_count(), 2)
    
    def test_bfs(self):
        """Test BFS traversal."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        self.unweighted_undirected.add_edge(1, 4)
        
        bfs_result = self.unweighted_undirected.bfs(1)
        self.assertEqual(bfs_result[0], 1)
        self.assertEqual(len(bfs_result), 4)
    
    def test_dfs(self):
        """Test DFS traversal."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        self.unweighted_undirected.add_edge(1, 4)
        
        dfs_result = self.unweighted_undirected.dfs(1)
        self.assertEqual(dfs_result[0], 1)
        self.assertEqual(len(dfs_result), 4)
    
    def test_dfs_recursive(self):
        """Test recursive DFS traversal."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        self.unweighted_undirected.add_edge(1, 4)
        
        dfs_result = self.unweighted_undirected.dfs_recursive(1)
        self.assertEqual(dfs_result[0], 1)
        self.assertEqual(len(dfs_result), 4)
    
    def test_is_connected(self):
        """Test checking if graph is connected."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        self.assertTrue(self.unweighted_undirected.is_connected())
        
        disconnected = EdgeList(directed=False, weighted=False)
        disconnected.add_edge(1, 2)
        disconnected.add_edge(3, 4)  # Separate component
        self.assertFalse(disconnected.is_connected())
    
    def test_to_adjacency_list(self):
        """Test converting to adjacency list."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(1, 3)
        
        adj_list = self.unweighted_undirected.to_adjacency_list()
        self.assertIn(1, adj_list)
        self.assertIn(2, adj_list[1])
        self.assertIn(3, adj_list[1])
    
    def test_to_adjacency_list_weighted(self):
        """Test converting weighted graph to adjacency list."""
        self.weighted_undirected.add_edge(1, 2, weight=5.0)
        self.weighted_undirected.add_edge(1, 3, weight=3.0)
        
        adj_list = self.weighted_undirected.to_adjacency_list()
        self.assertIn(1, adj_list)
        self.assertIn((2, 5.0), adj_list[1])
        self.assertIn((3, 3.0), adj_list[1])


if __name__ == '__main__':
    unittest.main()

