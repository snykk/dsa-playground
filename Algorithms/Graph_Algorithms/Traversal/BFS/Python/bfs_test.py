"""
Test suite for BFS implementation
"""

import unittest
from bfs import (
    bfs_adjacency_list,
    bfs_with_path,
    bfs_level_order,
    bfs_connected_components,
    bfs_shortest_distance
)


class TestBFS(unittest.TestCase):
    
    def setUp(self):
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
    
    def test_bfs_adjacency_list_basic(self):
        result = bfs_adjacency_list(self.graph1, 1)
        self.assertEqual(result, [1, 2, 4, 3])
    
    def test_bfs_adjacency_list_undirected(self):
        result = bfs_adjacency_list(self.graph2, 1)
        # Should visit all connected vertices
        self.assertEqual(len(result), 5)
        self.assertEqual(result[0], 1)
    
    def test_bfs_with_path_found(self):
        path = bfs_with_path(self.graph1, 1, 3)
        self.assertEqual(path, [1, 2, 3])
    
    def test_bfs_with_path_not_found(self):
        path = bfs_with_path(self.graph3, 1, 3)
        self.assertIsNone(path)
    
    def test_bfs_with_path_same_vertex(self):
        path = bfs_with_path(self.graph1, 1, 1)
        self.assertEqual(path, [1])
    
    def test_bfs_level_order(self):
        levels = bfs_level_order(self.graph1, 1)
        self.assertEqual(levels[0], [1])
        self.assertEqual(set(levels[1]), {2, 4})
        self.assertEqual(levels[2], [3])
    
    def test_bfs_connected_components(self):
        components = bfs_connected_components(self.graph3)
        self.assertEqual(len(components), 2)
        self.assertEqual(set(components[0]), {1, 2})
        self.assertEqual(set(components[1]), {3, 4})
    
    def test_bfs_shortest_distance(self):
        distances = bfs_shortest_distance(self.graph1, 1)
        self.assertEqual(distances[1], 0)
        self.assertEqual(distances[2], 1)
        self.assertEqual(distances[4], 1)
        self.assertEqual(distances[3], 2)
    
    def test_bfs_empty_graph(self):
        result = bfs_adjacency_list({}, 1)
        self.assertEqual(result, [])
    
    def test_bfs_single_vertex(self):
        graph = {1: []}
        result = bfs_adjacency_list(graph, 1)
        self.assertEqual(result, [1])


if __name__ == '__main__':
    unittest.main()

