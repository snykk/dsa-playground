"""
Test suite for Topological Sort implementation
"""

import unittest
from topological_sort import (
    topological_sort_kahn,
    topological_sort_dfs,
    topological_sort_all_orders,
    is_dag,
    longest_path_dag
)


class TestTopologicalSort(unittest.TestCase):
    
    def setUp(self):
        # Simple DAG: 1 -> 2 -> 3
        #             1 -> 4
        self.graph1 = {
            1: [2, 4],
            2: [3],
            3: [],
            4: []
        }
        
        # DAG with multiple paths
        self.graph2 = {
            0: [1, 2],
            1: [3],
            2: [3],
            3: [4],
            4: []
        }
        
        # Graph with cycle
        self.graph3 = {
            1: [2],
            2: [3],
            3: [1]  # Cycle: 1 -> 2 -> 3 -> 1
        }
        
        # Empty graph
        self.graph4 = {}
        
        # Single vertex
        self.graph5 = {1: []}
    
    def test_topological_sort_kahn_basic(self):
        result = topological_sort_kahn(self.graph1)
        self.assertIsNotNone(result)
        # Check ordering constraints
        self.assertLess(result.index(1), result.index(2))
        self.assertLess(result.index(1), result.index(4))
        self.assertLess(result.index(2), result.index(3))
    
    def test_topological_sort_kahn_multiple_paths(self):
        result = topological_sort_kahn(self.graph2)
        self.assertIsNotNone(result)
        self.assertEqual(len(result), 5)
        # 0 must come before 1, 2, 3, 4
        self.assertLess(result.index(0), result.index(1))
        self.assertLess(result.index(0), result.index(2))
        self.assertLess(result.index(1), result.index(3))
        self.assertLess(result.index(2), result.index(3))
        self.assertLess(result.index(3), result.index(4))
    
    def test_topological_sort_kahn_cycle(self):
        result = topological_sort_kahn(self.graph3)
        self.assertIsNone(result)  # Cycle detected
    
    def test_topological_sort_kahn_empty(self):
        result = topological_sort_kahn(self.graph4)
        self.assertEqual(result, [])
    
    def test_topological_sort_kahn_single_vertex(self):
        result = topological_sort_kahn(self.graph5)
        self.assertEqual(result, [1])
    
    def test_topological_sort_dfs_basic(self):
        result = topological_sort_dfs(self.graph1)
        self.assertIsNotNone(result)
        # Check ordering constraints
        self.assertLess(result.index(1), result.index(2))
        self.assertLess(result.index(1), result.index(4))
        self.assertLess(result.index(2), result.index(3))
    
    def test_topological_sort_dfs_cycle(self):
        result = topological_sort_dfs(self.graph3)
        self.assertIsNone(result)  # Cycle detected
    
    def test_topological_sort_all_orders(self):
        orders = topological_sort_all_orders(self.graph1)
        self.assertGreater(len(orders), 0)
        # All orders should be valid topological orderings
        for order in orders:
            self.assertEqual(len(order), 4)
            self.assertLess(order.index(1), order.index(2))
            self.assertLess(order.index(1), order.index(4))
            self.assertLess(order.index(2), order.index(3))
    
    def test_is_dag_true(self):
        self.assertTrue(is_dag(self.graph1))
        self.assertTrue(is_dag(self.graph2))
    
    def test_is_dag_false(self):
        self.assertFalse(is_dag(self.graph3))
    
    def test_longest_path_dag(self):
        graph = {
            0: [1, 2],
            1: [3],
            2: [3],
            3: []
        }
        weights = {
            (0, 1): 5,
            (0, 2): 3,
            (1, 3): 2,
            (2, 3): 4
        }
        distances = longest_path_dag(graph, weights)
        # Longest path: 0 -> 2 -> 3 = 3 + 4 = 7
        self.assertEqual(distances[3], 7)


if __name__ == '__main__':
    unittest.main()

