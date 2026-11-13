import unittest
from binary_tree import BinaryTree

class TestBinaryTree(unittest.TestCase):
    def setUp(self):
        self.tree = BinaryTree()

    def test_insert_and_search(self):
        self.tree.insert(1)
        self.tree.insert(2)
        self.tree.insert(3)
        self.assertTrue(self.tree.search(1))
        self.assertTrue(self.tree.search(2))
        self.assertTrue(self.tree.search(3))
        self.assertFalse(self.tree.search(4))

    def test_is_empty(self):
        self.assertTrue(self.tree.is_empty())
        self.tree.insert(1)
        self.assertFalse(self.tree.is_empty())

    def test_size(self):
        self.assertEqual(self.tree.size(), 0)
        self.tree.insert(1)
        self.tree.insert(2)
        self.tree.insert(3)
        self.assertEqual(self.tree.size(), 3)

    def test_height(self):
        self.assertEqual(self.tree.height(), -1)  # Empty tree
        self.tree.insert(1)
        self.assertEqual(self.tree.height(), 0)  # Only root
        self.tree.insert(2)
        self.tree.insert(3)
        self.assertEqual(self.tree.height(), 1)  # Root with 2 children

    def test_inorder_traversal(self):
        # Build tree:     1
        #                / \
        #               2   3
        #              / \
        #             4   5
        self.tree.insert(1)
        self.tree.insert(2)
        self.tree.insert(3)
        self.tree.insert(4)
        self.tree.insert(5)
        # Inorder: 4, 2, 5, 1, 3
        result = self.tree.inorder_traversal()
        self.assertEqual(result, [4, 2, 5, 1, 3])

    def test_preorder_traversal(self):
        # Build tree:     1
        #                / \
        #               2   3
        self.tree.insert(1)
        self.tree.insert(2)
        self.tree.insert(3)
        # Preorder: 1, 2, 3
        result = self.tree.preorder_traversal()
        self.assertEqual(result, [1, 2, 3])

    def test_postorder_traversal(self):
        # Build tree:     1
        #                / \
        #               2   3
        self.tree.insert(1)
        self.tree.insert(2)
        self.tree.insert(3)
        # Postorder: 2, 3, 1
        result = self.tree.postorder_traversal()
        self.assertEqual(result, [2, 3, 1])

    def test_level_order_traversal(self):
        # Build tree:     1
        #                / \
        #               2   3
        #              / \
        #             4   5
        self.tree.insert(1)
        self.tree.insert(2)
        self.tree.insert(3)
        self.tree.insert(4)
        self.tree.insert(5)
        # Level order: 1, 2, 3, 4, 5
        result = self.tree.level_order_traversal()
        self.assertEqual(result, [1, 2, 3, 4, 5])

    def test_complex_tree(self):
        # Build a more complex tree
        for i in range(1, 8):
            self.tree.insert(i)
        # Tree structure:
        #        1
        #       / \
        #      2   3
        #     / \ / \
        #    4  5 6  7
        self.assertEqual(self.tree.size(), 7)
        self.assertEqual(self.tree.height(), 2)
        self.assertTrue(self.tree.search(7))
        self.assertFalse(self.tree.search(8))

    def test_seven_nodes_all_traversals(self):
        for i in range(1, 8):
            self.tree.insert(i)
        self.assertEqual(self.tree.preorder_traversal(), [1, 2, 4, 5, 3, 6, 7])
        self.assertEqual(self.tree.inorder_traversal(), [4, 2, 5, 1, 6, 3, 7])
        self.assertEqual(self.tree.postorder_traversal(), [4, 5, 2, 6, 7, 3, 1])
        self.assertEqual(self.tree.level_order_traversal(), [1, 2, 3, 4, 5, 6, 7])

    def test_height_stays_logarithmic(self):
        for i in range(1, 1001):
            self.tree.insert(i)
        self.assertEqual(self.tree.size(), 1000)
        self.assertEqual(self.tree.height(), 9)

if __name__ == "__main__":
    unittest.main()

