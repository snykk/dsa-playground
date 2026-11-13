"""
Test cases for Tree DP
"""

import unittest
from tree_dp import TreeNode, tree_dp_max_independent_set, tree_dp_max_path_sum


class TestTreeDP(unittest.TestCase):
    
    def test_max_independent_set(self):
        """Test maximum independent set"""
        root = TreeNode(10, [
            TreeNode(20),
            TreeNode(30, [TreeNode(40)])
        ])
        result = tree_dp_max_independent_set(root)
        self.assertEqual(result, 60)  # 20 + 40; 30 and 40 are adjacent

    def test_max_independent_set_binary_tree(self):
        root = TreeNode(1, [TreeNode(2, [TreeNode(4), TreeNode(5)]), TreeNode(3)])
        self.assertEqual(tree_dp_max_independent_set(root), 12)  # 3 + 4 + 5

    def test_max_independent_set_edge_cases(self):
        self.assertEqual(tree_dp_max_independent_set(None), 0)
        self.assertEqual(tree_dp_max_independent_set(TreeNode(7)), 7)
        self.assertEqual(tree_dp_max_independent_set(TreeNode(-3, [TreeNode(-1)])), 0)
    
    def test_max_path_sum(self):
        """Test maximum path sum"""
        root = TreeNode(10, [
            TreeNode(20),
            TreeNode(30)
        ])
        result = tree_dp_max_path_sum(root)
        self.assertEqual(result, 60)

    def test_max_path_sum_uses_at_most_two_children(self):
        """A star: the best path is 3 - 1 - 4, not all three leaves"""
        root = TreeNode(1, [TreeNode(2), TreeNode(3), TreeNode(4)])
        self.assertEqual(tree_dp_max_path_sum(root), 8)

    def test_max_path_sum_spine(self):
        root = TreeNode(10, [TreeNode(20), TreeNode(30, [TreeNode(40)])])
        self.assertEqual(tree_dp_max_path_sum(root), 100)  # 20 - 10 - 30 - 40

    def test_max_path_sum_negative_values(self):
        self.assertEqual(tree_dp_max_path_sum(TreeNode(-5)), -5)
        root = TreeNode(-3, [TreeNode(-1), TreeNode(-2)])
        self.assertEqual(tree_dp_max_path_sum(root), -1)
        root = TreeNode(1, [TreeNode(-6), TreeNode(2), TreeNode(3)])
        self.assertEqual(tree_dp_max_path_sum(root), 6)

    def test_max_path_sum_visits_each_node_once(self):
        """Each node must be expanded once; visiting children twice is exponential"""
        expanded = []

        class CountingNode(TreeNode):
            def __init__(self, val):
                super().__init__(val)
                self._kids = []

            @property
            def children(self):
                expanded.append(self)
                return self._kids

            @children.setter
            def children(self, value):
                self._kids = value

        root = CountingNode(1)
        node = root
        for _ in range(16):
            child = CountingNode(1)
            node.children = [child]
            node = child
        expanded.clear()
        self.assertEqual(tree_dp_max_path_sum(root), 17)
        self.assertEqual(len(expanded), 17)

    def test_max_path_sum_empty_tree(self):
        self.assertEqual(tree_dp_max_path_sum(None), float('-inf'))


if __name__ == '__main__':
    unittest.main()

