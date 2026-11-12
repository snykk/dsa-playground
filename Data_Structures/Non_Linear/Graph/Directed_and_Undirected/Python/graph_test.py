"""Tests for Graph implementation."""

import unittest
from graph import Graph


class TestGraph(unittest.TestCase):
    """Test cases for Graph class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.undirected_graph = Graph(directed=False)
        self.directed_graph = Graph(directed=True)
    
    def test_add_vertex(self):
        """Test adding vertices."""
        self.undirected_graph.add_vertex(1)
        self.undirected_graph.add_vertex(2)
        
        self.assertIn(1, self.undirected_graph.get_vertices())
        self.assertIn(2, self.undirected_graph.get_vertices())
        self.assertEqual(len(self.undirected_graph.get_vertices()), 2)
    
    def test_add_edge_undirected(self):
        """Test adding edges in undirected graph."""
        self.undirected_graph.add_edge(1, 2)
        self.undirected_graph.add_edge(2, 3)
        
        self.assertTrue(self.undirected_graph.has_edge(1, 2))
        self.assertTrue(self.undirected_graph.has_edge(2, 1))  # Bidirectional
        self.assertTrue(self.undirected_graph.has_edge(2, 3))
        self.assertTrue(self.undirected_graph.has_edge(3, 2))  # Bidirectional
        self.assertFalse(self.undirected_graph.has_edge(1, 3))
    
    def test_add_edge_directed(self):
        """Test adding edges in directed graph."""
        self.directed_graph.add_edge(1, 2)
        self.directed_graph.add_edge(2, 3)
        
        self.assertTrue(self.directed_graph.has_edge(1, 2))
        self.assertFalse(self.directed_graph.has_edge(2, 1))  # Not bidirectional
        self.assertTrue(self.directed_graph.has_edge(2, 3))
        self.assertFalse(self.directed_graph.has_edge(3, 2))  # Not bidirectional
    
    def test_remove_edge_undirected(self):
        """Test removing edges in undirected graph."""
        self.undirected_graph.add_edge(1, 2)
        self.undirected_graph.remove_edge(1, 2)
        
        self.assertFalse(self.undirected_graph.has_edge(1, 2))
        self.assertFalse(self.undirected_graph.has_edge(2, 1))
    
    def test_remove_edge_directed(self):
        """Test removing edges in directed graph."""
        self.directed_graph.add_edge(1, 2)
        self.directed_graph.remove_edge(1, 2)
        
        self.assertFalse(self.directed_graph.has_edge(1, 2))
    
    def test_get_neighbors(self):
        """Test getting neighbors."""
        self.undirected_graph.add_edge(1, 2)
        self.undirected_graph.add_edge(1, 3)
        
        neighbors = self.undirected_graph.get_neighbors(1)
        self.assertIn(2, neighbors)
        self.assertIn(3, neighbors)
        self.assertEqual(len(neighbors), 2)
    
    def test_get_edges_undirected(self):
        """Test getting all edges in undirected graph."""
        self.undirected_graph.add_edge(1, 2)
        self.undirected_graph.add_edge(2, 3)
        
        edges = self.undirected_graph.get_edges()
        # Should have 2 unique edges (1-2, 2-3)
        self.assertEqual(len(edges), 2)
    
    def test_get_edges_directed(self):
        """Test getting all edges in directed graph."""
        self.directed_graph.add_edge(1, 2)
        self.directed_graph.add_edge(2, 3)
        
        edges = self.directed_graph.get_edges()
        # Should have 2 edges (1->2, 2->3)
        self.assertEqual(len(edges), 2)
    
    def test_bfs_undirected(self):
        """Test BFS traversal in undirected graph."""
        # Create graph: 1-2-3
        #              |
        #              4
        self.undirected_graph.add_edge(1, 2)
        self.undirected_graph.add_edge(2, 3)
        self.undirected_graph.add_edge(1, 4)
        
        bfs_result = self.undirected_graph.bfs(1)
        self.assertEqual(bfs_result[0], 1)  # Start vertex
        self.assertIn(2, bfs_result)
        self.assertIn(3, bfs_result)
        self.assertIn(4, bfs_result)
    
    def test_bfs_directed(self):
        """Test BFS traversal in directed graph."""
        # Create graph: 1->2->3
        #              |
        #              v
        #              4
        self.directed_graph.add_edge(1, 2)
        self.directed_graph.add_edge(2, 3)
        self.directed_graph.add_edge(1, 4)
        
        bfs_result = self.directed_graph.bfs(1)
        self.assertEqual(bfs_result[0], 1)
        self.assertIn(2, bfs_result)
        self.assertIn(3, bfs_result)
        self.assertIn(4, bfs_result)
    
    def test_dfs_undirected(self):
        """Test DFS traversal in undirected graph."""
        self.undirected_graph.add_edge(1, 2)
        self.undirected_graph.add_edge(2, 3)
        self.undirected_graph.add_edge(1, 4)
        
        dfs_result = self.undirected_graph.dfs(1)
        self.assertEqual(dfs_result[0], 1)
        self.assertEqual(len(dfs_result), 4)
        self.assertIn(2, dfs_result)
        self.assertIn(3, dfs_result)
        self.assertIn(4, dfs_result)
    
    def test_dfs_recursive(self):
        """Test recursive DFS traversal."""
        self.undirected_graph.add_edge(1, 2)
        self.undirected_graph.add_edge(2, 3)
        self.undirected_graph.add_edge(1, 4)
        
        dfs_result = self.undirected_graph.dfs_recursive(1)
        self.assertEqual(dfs_result[0], 1)
        self.assertEqual(len(dfs_result), 4)
    
    def test_is_connected(self):
        """Test checking if graph is connected."""
        # Connected graph
        self.undirected_graph.add_edge(1, 2)
        self.undirected_graph.add_edge(2, 3)
        self.assertTrue(self.undirected_graph.is_connected())
        
        # Disconnected graph
        disconnected = Graph(directed=False)
        disconnected.add_edge(1, 2)
        disconnected.add_vertex(3)  # Isolated vertex
        self.assertFalse(disconnected.is_connected())
    
    def test_get_degree_undirected(self):
        """Test getting vertex degree in undirected graph."""
        self.undirected_graph.add_edge(1, 2)
        self.undirected_graph.add_edge(1, 3)
        
        self.assertEqual(self.undirected_graph.get_degree(1), 2)
        self.assertEqual(self.undirected_graph.get_degree(2), 1)
    
    def test_get_degree_directed(self):
        """Test getting vertex degree in directed graph."""
        self.directed_graph.add_edge(1, 2)
        self.directed_graph.add_edge(2, 1)  # Reverse edge
        self.directed_graph.add_edge(1, 3)
        
        # Vertex 1 has out-degree 2 (to 2 and 3) and in-degree 1 (from 2)
        self.assertEqual(self.directed_graph.get_degree(1), 3)

    def test_get_neighbors_returns_copy(self):
        """Editing the returned list must not change the graph."""
        self.undirected_graph.add_edge(1, 2)
        neighbors = self.undirected_graph.get_neighbors(1)
        neighbors.append(99)
        self.assertEqual(self.undirected_graph.get_neighbors(1), [2])
        self.assertFalse(self.undirected_graph.has_edge(1, 99))


if __name__ == '__main__':
    unittest.main()

