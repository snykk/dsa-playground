import unittest
from graph_traversal import (bfs_shortest_path, dfs_recursive, get_dfs_traversal,
                             num_islands, topological_sort)

class TestGraphTraversal(unittest.TestCase):
    def setUp(self):
        self.graph = {
            0: [1, 2],
            1: [0, 3],
            2: [0, 3, 4],
            3: [1, 2],
            4: [2]
        }

    def test_bfs(self):
        self.assertEqual(bfs_shortest_path(self.graph, 0, 3), 2) # 0->1->3
        self.assertEqual(bfs_shortest_path(self.graph, 0, 4), 2) # 0->2->4
        self.assertEqual(bfs_shortest_path(self.graph, 0, 5), -1) # 5 not in graph

    def test_dfs(self):
        order = get_dfs_traversal(self.graph, 0)
        self.assertEqual(len(order), 5)
        self.assertIn(0, order)
        self.assertIn(4, order)
        # Order depends on iteration order of dict/list, so check length and containment mostly
        
    def test_num_islands(self):
        grid1 = [
            ["1","1","1","1","0"],
            ["1","1","0","1","0"],
            ["1","1","0","0","0"],
            ["0","0","0","0","0"]
        ]
        self.assertEqual(num_islands(grid1), 1)
        
        grid2 = [
            ["1","1","0","0","0"],
            ["1","1","0","0","0"],
            ["0","0","1","0","0"],
            ["0","0","0","1","1"]
        ]
        self.assertEqual(num_islands(grid2), 3)

    def test_topological_sort(self):
        # 0 -> 1 -> 2
        edges = [[0, 1], [1, 2]]
        self.assertEqual(topological_sort(3, edges), [0, 1, 2])
        
        # Cycle: 0 -> 1 -> 0
        edges_cycle = [[0, 1], [1, 0]]
        self.assertEqual(topological_sort(2, edges_cycle), [])

    def test_bfs_reaches_sink_nodes_of_a_directed_graph(self):
        # Regression: a target that is not a dict key (no outgoing edges) was
        # reported unreachable.
        self.assertEqual(bfs_shortest_path({0: [1]}, 0, 1), 1)
        self.assertEqual(bfs_shortest_path({0: [1], 1: [2]}, 0, 2), 2)
        self.assertEqual(bfs_shortest_path({0: [1]}, 0, 7), -1)

    def test_dfs_order_matches_the_recursive_version(self):
        visited, expected = set(), []
        dfs_recursive(self.graph, 0, visited, expected)
        self.assertEqual(get_dfs_traversal(self.graph, 0), expected)
        self.assertEqual(get_dfs_traversal(self.graph, 9), [])

    def test_deep_inputs_do_not_hit_the_recursion_limit(self):
        # Regression: both used to raise RecursionError.
        path = {i: [i + 1] for i in range(1500)}
        path[1500] = []
        self.assertEqual(get_dfs_traversal(path, 0), list(range(1501)))
        grid = [["1"] * 60 for _ in range(60)]
        self.assertEqual(num_islands(grid), 1)


if __name__ == '__main__':
    unittest.main()
