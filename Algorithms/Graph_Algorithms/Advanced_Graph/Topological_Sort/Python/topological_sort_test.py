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

    def test_topological_sort_dfs_long_chain(self):
        # Regression: the recursive DFS raised RecursionError on a 1500-vertex chain
        chain = {i: [i + 1] for i in range(5000)}
        self.assertEqual(topological_sort_dfs(chain), list(range(5001)))
        chain[5000] = [0]  # close the chain into one big cycle
        self.assertIsNone(topological_sort_dfs(chain))

    def test_topological_sort_dfs_matches_recursive_order(self):
        # The iterative DFS must finish vertices in the same order as recursion
        graph = {5: [2, 0], 4: [0, 1], 2: [3], 3: [1]}
        self.assertEqual(topological_sort_dfs(graph), [4, 5, 0, 2, 3, 1])

    def test_all_orders_keeps_neighbor_only_vertices(self):
        # Regression: vertices that are not keys vanished from every ordering
        self.assertEqual(topological_sort_all_orders({0: [1]}), [[0, 1]])
        orders = topological_sort_all_orders({1: [2, 4], 2: [3]})
        self.assertEqual(sorted(orders), [[1, 2, 3, 4], [1, 2, 4, 3], [1, 4, 2, 3]])
        self.assertEqual(topological_sort_all_orders({1: [2], 2: [1]}), [])

    def test_all_orders_counts_every_ordering(self):
        self.assertEqual(len(topological_sort_all_orders(self.graph1)), 3)

    def test_longest_path_dag_empty_graph(self):
        # Regression: {} raised IndexError
        self.assertEqual(longest_path_dag({}, {}), {})

    def test_longest_path_dag_neighbor_only_vertex(self):
        # Regression: a vertex that is not a key raised KeyError
        self.assertEqual(longest_path_dag({0: [1]}, {}), {0: 0, 1: 1})

    def test_self_loop_is_a_cycle(self):
        self.assertIsNone(topological_sort_kahn({0: [0]}))
        self.assertIsNone(topological_sort_dfs({0: [0]}))
        self.assertFalse(is_dag({0: [0]}))

    def test_order_is_valid_with_neighbor_only_vertex(self):
        graph = {0: [1, 2], 1: [3], 2: [3], 3: [4], 5: [4]}
        for order in (topological_sort_kahn(graph), topological_sort_dfs(graph)):
            self.assertEqual(sorted(order), [0, 1, 2, 3, 4, 5])
            position = {v: i for i, v in enumerate(order)}
            for u, neighbors in graph.items():
                for v in neighbors:
                    self.assertLess(position[u], position[v])
        self.assertEqual(len(topological_sort_all_orders(graph)), 10)

    def test_longest_path_dag_every_source_starts_a_path(self):
        # Regression: only the first source counted, so 3 got 1 instead of 10
        graph = {1: [3], 2: [3], 3: []}
        weights = {(2, 3): 10}
        self.assertEqual(longest_path_dag(graph, weights), {1: 0, 2: 0, 3: 10})
        from_one = longest_path_dag(graph, weights, source=1)
        self.assertEqual(from_one, {1: 0, 2: float('-inf'), 3: 1})
        with self.assertRaises(ValueError):
            longest_path_dag(graph, weights, source=9)
        self.assertEqual(longest_path_dag(self.graph3, {}), {})  # cycle


if __name__ == '__main__':
    unittest.main()

