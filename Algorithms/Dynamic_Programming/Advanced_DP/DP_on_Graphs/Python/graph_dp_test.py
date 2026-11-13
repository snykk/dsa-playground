"""
Test cases for Graph DP
"""

import unittest
from graph_dp import dag_longest_path


class TestGraphDP(unittest.TestCase):
    
    def test_dag_longest_path(self):
        """Test longest path in DAG"""
        graph = {
            0: [1, 2],
            1: [3],
            2: [3],
            3: []
        }
        result = dag_longest_path(graph, 0)
        self.assertEqual(result, 2)

    def test_larger_dag(self):
        graph = {0: [1, 2, 3], 1: [2, 4], 2: [4, 5], 3: [5], 4: [6], 5: [6], 6: []}
        self.assertEqual(dag_longest_path(graph, 0), 4)
        self.assertEqual(dag_longest_path(graph, 3), 2)
        self.assertEqual(dag_longest_path(graph, 6), 0)

    def test_missing_node_is_a_sink(self):
        self.assertEqual(dag_longest_path({}, 5), 0)
        self.assertEqual(dag_longest_path({0: [1]}, 0), 1)

    def test_cycle_raises(self):
        """A cycle is an error, not a path of length 2"""
        with self.assertRaises(ValueError):
            dag_longest_path({0: [1], 1: [2], 2: [0]}, 0)

    def test_self_loop_raises(self):
        with self.assertRaises(ValueError):
            dag_longest_path({0: [0]}, 0)

    def test_cycle_not_reachable_is_ignored(self):
        graph = {0: [1], 1: [], 5: [6], 6: [5]}
        self.assertEqual(dag_longest_path(graph, 0), 1)

    def test_shared_node_visited_once_is_not_a_cycle(self):
        graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
        self.assertEqual(dag_longest_path(graph, 0), 2)


if __name__ == '__main__':
    unittest.main()

