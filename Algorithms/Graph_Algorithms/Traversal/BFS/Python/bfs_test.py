"""
Test suite for BFS implementation
"""

import time
import unittest
from bfs import (
    bfs_adjacency_list,
    bfs_with_path,
    bfs_level_order,
    bfs_connected_components,
    bfs_shortest_distance
)


class TestBFS(unittest.TestCase):
    """Test cases for BFS (Breadth-First Search) implementation."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Simple graph: 1 -> 2 -> 3
        #               1 -> 4
        self.graph1 = {
            1: [2, 4],
            2: [3],
            3: [],
            4: []
        }
        
        # Undirected graph: 1-2-3-4
        #                   1-5
        self.graph2 = {
            1: [2, 5],
            2: [1, 3],
            3: [2, 4],
            4: [3],
            5: [1]
        }
        
        # Disconnected graph
        self.graph3 = {
            1: [2],
            2: [1],
            3: [4],
            4: [3]
        }
        
        # Large graph for comprehensive testing
        self.graph4 = {
            1: [2, 3],
            2: [4, 5],
            3: [6],
            4: [7],
            5: [7],
            6: [8],
            7: [9],
            8: [9],
            9: []
        }
    
    def test_bfs_adjacency_list_basic(self):
        """Test basic BFS traversal on simple graph."""
        result = bfs_adjacency_list(self.graph1, 1)
        self.assertEqual(result, [1, 2, 4, 3])
        self.assertEqual(len(result), 4)
        self.assertEqual(result[0], 1)
        self.assertEqual(result[-1], 3)
    
    def test_bfs_adjacency_list_undirected(self):
        """Test BFS on undirected graph."""
        result = bfs_adjacency_list(self.graph2, 1)
        # Should visit all connected vertices
        self.assertEqual(len(result), 5)
        self.assertEqual(result[0], 1)
        self.assertIn(2, result)
        self.assertIn(3, result)
        self.assertIn(4, result)
        self.assertIn(5, result)
    
    def test_bfs_adjacency_list_large_graph(self):
        """Test BFS on larger graph."""
        result = bfs_adjacency_list(self.graph4, 1)
        self.assertEqual(len(result), 9)
        self.assertEqual(result[0], 1)
        self.assertIn(9, result)
    
    def test_bfs_with_path_found(self):
        """Test finding path when path exists."""
        path = bfs_with_path(self.graph1, 1, 3)
        self.assertIsNotNone(path)
        self.assertEqual(path, [1, 2, 3])
        self.assertEqual(path[0], 1)
        self.assertEqual(path[-1], 3)
    
    def test_bfs_with_path_not_found(self):
        """Test finding path when no path exists."""
        path = bfs_with_path(self.graph3, 1, 3)
        self.assertIsNone(path)
    
    def test_bfs_with_path_same_vertex(self):
        """Test finding path from vertex to itself."""
        path = bfs_with_path(self.graph1, 1, 1)
        self.assertIsNotNone(path)
        self.assertEqual(path, [1])
        self.assertEqual(len(path), 1)
    
    def test_bfs_with_path_direct_edge(self):
        """Test finding path with direct edge."""
        path = bfs_with_path(self.graph1, 1, 2)
        self.assertIsNotNone(path)
        self.assertEqual(path, [1, 2])
    
    def test_bfs_level_order(self):
        """Test BFS level-order traversal."""
        levels = bfs_level_order(self.graph1, 1)
        self.assertEqual(len(levels), 3)
        self.assertEqual(levels[0], [1])
        self.assertEqual(set(levels[1]), {2, 4})
        self.assertEqual(levels[2], [3])
    
    def test_bfs_level_order_large_graph(self):
        """Test level-order on larger graph."""
        levels = bfs_level_order(self.graph4, 1)
        self.assertEqual(len(levels), 5)
        self.assertEqual(levels[0], [1])
        self.assertEqual(set(levels[1]), {2, 3})
        self.assertEqual(set(levels[2]), {4, 5, 6})
    
    def test_bfs_connected_components(self):
        """Test finding connected components."""
        components = bfs_connected_components(self.graph3)
        self.assertEqual(len(components), 2)
        self.assertEqual(set(components[0]), {1, 2})
        self.assertEqual(set(components[1]), {3, 4})
    
    def test_bfs_connected_components_single_component(self):
        """Test connected components on connected graph."""
        components = bfs_connected_components(self.graph1)
        self.assertEqual(len(components), 1)
        self.assertEqual(set(components[0]), {1, 2, 3, 4})
    
    def test_bfs_shortest_distance(self):
        """Test finding shortest distances."""
        distances = bfs_shortest_distance(self.graph1, 1)
        self.assertEqual(distances[1], 0)
        self.assertEqual(distances[2], 1)
        self.assertEqual(distances[4], 1)
        self.assertEqual(distances[3], 2)
        self.assertEqual(len(distances), 4)
    
    def test_bfs_shortest_distance_large_graph(self):
        """Test shortest distances on larger graph."""
        distances = bfs_shortest_distance(self.graph4, 1)
        self.assertEqual(distances[1], 0)
        self.assertEqual(distances[2], 1)
        self.assertEqual(distances[3], 1)
        self.assertEqual(distances[9], 4)
    
    def test_bfs_empty_graph(self):
        """Test BFS on empty graph."""
        result = bfs_adjacency_list({}, 1)
        self.assertEqual(result, [])
    
    def test_bfs_single_vertex(self):
        """Test BFS on graph with single vertex."""
        graph = {1: []}
        result = bfs_adjacency_list(graph, 1)
        self.assertEqual(result, [1])
        self.assertEqual(len(result), 1)
    
    def test_bfs_isolated_vertices(self):
        """Test BFS with isolated vertices."""
        graph = {
            1: [],
            2: [],
            3: []
        }
        result = bfs_adjacency_list(graph, 1)
        self.assertEqual(result, [1])
        self.assertEqual(len(result), 1)
    
    def test_bfs_start_not_in_graph(self):
        """Test BFS when start vertex not in graph."""
        result = bfs_adjacency_list(self.graph1, 99)
        self.assertEqual(result, [])
    
    def test_bfs_with_path_start_not_in_graph(self):
        """Test path finding when start not in graph."""
        path = bfs_with_path(self.graph1, 99, 1)
        self.assertIsNone(path)
    
    def test_bfs_with_path_target_not_in_graph(self):
        """Test path finding when target not in graph."""
        path = bfs_with_path(self.graph1, 1, 99)
        self.assertIsNone(path)

    def test_bfs_with_path_neighbor_only_target(self):
        """A target that only appears in neighbor lists (no key) is still reachable."""
        self.assertEqual(bfs_with_path({0: [1]}, 0, 1), [0, 1])
        self.assertEqual(bfs_with_path({0: [1], 1: [2]}, 0, 2), [0, 1, 2])
        # Agrees with the other BFS functions on the same graph
        self.assertIn(1, bfs_shortest_distance({0: [1]}, 0))

    def test_bfs_with_path_long_path_linear_time(self):
        """No path copy per enqueue: a 50000-vertex path takes well under a second."""
        n = 50000
        graph = {i: [i + 1] for i in range(n - 1)}
        graph[n - 1] = []
        started = time.perf_counter()
        path = bfs_with_path(graph, 0, n - 1)
        elapsed = time.perf_counter() - started
        self.assertEqual(path, list(range(n)))
        # The old path-copying version needed several seconds here (O(V^2)).
        self.assertLess(elapsed, 1.0)

    def test_bfs_connected_components_directed_no_overlap(self):
        """One shared visited set: no vertex is reported in two components."""
        components = bfs_connected_components({0: [1], 1: [], 2: [1]})
        self.assertEqual(components, [[0, 1], [2]])
        flat = [v for component in components for v in component]
        self.assertEqual(len(flat), len(set(flat)))


if __name__ == '__main__':
    unittest.main()

