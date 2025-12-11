"""
Test suite for DFS implementation
"""

import unittest
from dfs import (
    dfs_adjacency_list,
    dfs_recursive,
    dfs_with_path,
    dfs_connected_components,
    dfs_detect_cycle,
    dfs_topological_sort
)


class TestDFS(unittest.TestCase):
    
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
        
        # DAG for topological sort
        self.dag = {
            1: [2, 3],
            2: [4],
            3: [4],
            4: []
        }
        
        # Graph with cycle
        self.cyclic_graph = {
            1: [2],
            2: [3],
            3: [1]
        }
    
    def test_dfs_adjacency_list_basic(self):
        result = dfs_adjacency_list(self.graph1, 1)
        # DFS order may vary, but should contain all vertices
        self.assertEqual(len(result), 4)
        self.assertEqual(result[0], 1)
        self.assertEqual(set(result), {1, 2, 3, 4})
    
    def test_dfs_recursive(self):
        result = dfs_recursive(self.graph1, 1)
        self.assertEqual(len(result), 4)
        self.assertEqual(result[0], 1)
        self.assertEqual(set(result), {1, 2, 3, 4})
    
    def test_dfs_with_path_found(self):
        path = dfs_with_path(self.graph1, 1, 3)
        self.assertIsNotNone(path)
        self.assertEqual(path[0], 1)
        self.assertEqual(path[-1], 3)
    
    def test_dfs_with_path_not_found(self):
        path = dfs_with_path(self.graph3, 1, 3)
        self.assertIsNone(path)
    
    def test_dfs_connected_components(self):
        components = dfs_connected_components(self.graph3)
        self.assertEqual(len(components), 2)
        self.assertEqual(set(components[0]), {1, 2})
        self.assertEqual(set(components[1]), {3, 4})
    
    def test_dfs_detect_cycle_undirected(self):
        has_cycle = dfs_detect_cycle(self.cyclic_graph, directed=False)
        self.assertTrue(has_cycle)
        
        no_cycle = dfs_detect_cycle(self.graph1, directed=False)
        self.assertFalse(no_cycle)
    
    def test_dfs_detect_cycle_directed(self):
        has_cycle = dfs_detect_cycle(self.cyclic_graph, directed=True)
        self.assertTrue(has_cycle)
        
        no_cycle = dfs_detect_cycle(self.dag, directed=True)
        self.assertFalse(no_cycle)
    
    def test_dfs_topological_sort(self):
        topo_order = dfs_topological_sort(self.dag)
        self.assertIsNotNone(topo_order)
        # Check that all vertices are present
        self.assertEqual(set(topo_order), {1, 2, 3, 4})
        # Check that 1 comes before 2, 3, 4
        self.assertLess(topo_order.index(1), topo_order.index(2))
        self.assertLess(topo_order.index(1), topo_order.index(3))
        # Check that 2, 3 come before 4
        self.assertLess(topo_order.index(2), topo_order.index(4))
        self.assertLess(topo_order.index(3), topo_order.index(4))
    
    def test_dfs_topological_sort_cyclic(self):
        topo_order = dfs_topological_sort(self.cyclic_graph)
        self.assertIsNone(topo_order)


if __name__ == '__main__':
    unittest.main()

