import unittest
from graph_traversal import bfs_shortest_path, get_dfs_traversal, num_islands, topological_sort

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

if __name__ == '__main__':
    unittest.main()
