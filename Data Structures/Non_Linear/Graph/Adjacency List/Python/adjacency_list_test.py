"""Tests for Adjacency List implementation."""

import unittest
from adjacency_list import AdjacencyList


class TestAdjacencyList(unittest.TestCase):
    """Test cases for AdjacencyList class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.unweighted_undirected = AdjacencyList(directed=False, weighted=False)
        self.weighted_undirected = AdjacencyList(directed=False, weighted=True)
        self.unweighted_directed = AdjacencyList(directed=True, weighted=False)
        self.weighted_directed = AdjacencyList(directed=True, weighted=True)
    
    def test_add_vertex(self):
        """Test adding vertices."""
        self.unweighted_undirected.add_vertex(1)
        self.unweighted_undirected.add_vertex(2)
        
        self.assertIn(1, self.unweighted_undirected.get_vertices())
        self.assertIn(2, self.unweighted_undirected.get_vertices())
    
    def test_add_edge_unweighted_undirected(self):
        """Test adding unweighted edges in undirected graph."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        
        self.assertTrue(self.unweighted_undirected.has_edge(1, 2))
        self.assertTrue(self.unweighted_undirected.has_edge(2, 1))  # Bidirectional
        self.assertTrue(self.unweighted_undirected.has_edge(2, 3))
        self.assertFalse(self.unweighted_undirected.has_edge(1, 3))
    
    def test_add_edge_weighted_undirected(self):
        """Test adding weighted edges in undirected graph."""
        self.weighted_undirected.add_edge(1, 2, weight=5.0)
        self.weighted_undirected.add_edge(2, 3, weight=3.0)
        
        self.assertTrue(self.weighted_undirected.has_edge(1, 2))
        self.assertEqual(self.weighted_undirected.get_weight(1, 2), 5.0)
        self.assertEqual(self.weighted_undirected.get_weight(2, 1), 5.0)  # Undirected
    
    def test_add_edge_unweighted_directed(self):
        """Test adding unweighted edges in directed graph."""
        self.unweighted_directed.add_edge(1, 2)
        self.unweighted_directed.add_edge(2, 3)
        
        self.assertTrue(self.unweighted_directed.has_edge(1, 2))
        self.assertFalse(self.unweighted_directed.has_edge(2, 1))  # Not bidirectional
    
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
    
    def test_get_neighbors_with_weights(self):
        """Test getting neighbors with weights."""
        self.weighted_undirected.add_edge(1, 2, weight=5.0)
        self.weighted_undirected.add_edge(1, 3, weight=3.0)
        
        neighbors = self.weighted_undirected.get_neighbors_with_weights(1)
        self.assertEqual(len(neighbors), 2)
        self.assertIn((2, 5.0), neighbors)
        self.assertIn((3, 3.0), neighbors)
    
    def test_get_degree(self):
        """Test getting vertex degree."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(1, 3)
        
        self.assertEqual(self.unweighted_undirected.get_degree(1), 2)
        self.assertEqual(self.unweighted_undirected.get_degree(2), 1)
    
    def test_get_degree_directed(self):
        """Test getting vertex degree in directed graph."""
        self.unweighted_directed.add_edge(1, 2)
        self.unweighted_directed.add_edge(2, 1)  # Reverse edge
        self.unweighted_directed.add_edge(1, 3)
        
        # Vertex 1: out-degree 2, in-degree 1
        self.assertEqual(self.unweighted_directed.get_degree(1), 3)
    
    def test_bfs(self):
        """Test BFS traversal."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        self.unweighted_undirected.add_edge(1, 4)
        
        bfs_result = self.unweighted_undirected.bfs(1)
        self.assertEqual(bfs_result[0], 1)
        self.assertEqual(len(bfs_result), 4)
        self.assertIn(2, bfs_result)
        self.assertIn(3, bfs_result)
        self.assertIn(4, bfs_result)
    
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
        
        disconnected = AdjacencyList(directed=False, weighted=False)
        disconnected.add_edge(1, 2)
        disconnected.add_vertex(3)  # Isolated vertex
        self.assertFalse(disconnected.is_connected())
    
    def test_get_edges(self):
        """Test getting all edges."""
        self.unweighted_undirected.add_edge(1, 2)
        self.unweighted_undirected.add_edge(2, 3)
        
        edges = self.unweighted_undirected.get_edges()
        self.assertEqual(len(edges), 2)  # Unique edges
        self.assertIn((1, 2), edges)
        self.assertIn((2, 3), edges)
    
    def test_get_edges_weighted(self):
        """Test getting all weighted edges."""
        self.weighted_undirected.add_edge(1, 2, weight=5.0)
        self.weighted_undirected.add_edge(2, 3, weight=3.0)
        
        edges = self.weighted_undirected.get_edges()
        self.assertEqual(len(edges), 2)
        self.assertIn((1, 2, 5.0), edges)
        self.assertIn((2, 3, 3.0), edges)
    
    def test_initialization_with_vertices(self):
        """Test initialization with fixed number of vertices."""
        graph = AdjacencyList(num_vertices=5, directed=False, weighted=False)
        self.assertEqual(len(graph.get_vertices()), 5)
        self.assertIn(0, graph.get_vertices())
        self.assertIn(4, graph.get_vertices())


if __name__ == '__main__':
    unittest.main()

