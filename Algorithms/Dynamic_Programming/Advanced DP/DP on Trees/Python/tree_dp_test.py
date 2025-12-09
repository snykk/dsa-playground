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
        self.assertGreater(result, 0)
    
    def test_max_path_sum(self):
        """Test maximum path sum"""
        root = TreeNode(10, [
            TreeNode(20),
            TreeNode(30)
        ])
        result = tree_dp_max_path_sum(root)
        self.assertGreater(result, 0)


if __name__ == '__main__':
    unittest.main()

