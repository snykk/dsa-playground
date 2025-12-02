import unittest
from bst import BinarySearchTree

class TestBinarySearchTree(unittest.TestCase):
    def setUp(self):
        self.bst = BinarySearchTree()

    def test_insert_and_search(self):
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        self.assertTrue(self.bst.search(5))
        self.assertTrue(self.bst.search(3))
        self.assertTrue(self.bst.search(7))
        self.assertFalse(self.bst.search(4))

    def test_is_empty(self):
        self.assertTrue(self.bst.is_empty())
        self.bst.insert(1)
        self.assertFalse(self.bst.is_empty())

    def test_size(self):
        self.assertEqual(self.bst.size(), 0)
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        self.assertEqual(self.bst.size(), 3)

    def test_height(self):
        self.assertEqual(self.bst.height(), -1)
        self.bst.insert(5)
        self.assertEqual(self.bst.height(), 0)
        self.bst.insert(3)
        self.bst.insert(7)
        self.assertEqual(self.bst.height(), 1)

    def test_find_min(self):
        self.assertIsNone(self.bst.find_min())
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        self.bst.insert(1)
        self.assertEqual(self.bst.find_min(), 1)

    def test_find_max(self):
        self.assertIsNone(self.bst.find_max())
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        self.bst.insert(9)
        self.assertEqual(self.bst.find_max(), 9)

    def test_inorder_traversal_sorted(self):
        # Insert in random order
        self.bst.insert(5)
        self.bst.insert(2)
        self.bst.insert(8)
        self.bst.insert(1)
        self.bst.insert(3)
        # Inorder should produce sorted order
        result = self.bst.inorder_traversal()
        self.assertEqual(result, [1, 2, 3, 5, 8])

    def test_preorder_traversal(self):
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        result = self.bst.preorder_traversal()
        self.assertEqual(result, [5, 3, 7])

    def test_postorder_traversal(self):
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        result = self.bst.postorder_traversal()
        self.assertEqual(result, [3, 7, 5])

    def test_level_order_traversal(self):
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        result = self.bst.level_order_traversal()
        self.assertEqual(result, [5, 3, 7])

    def test_delete_leaf(self):
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        self.bst.delete(3)
        self.assertFalse(self.bst.search(3))
        self.assertTrue(self.bst.search(5))
        self.assertTrue(self.bst.search(7))
        self.assertEqual(self.bst.size(), 2)

    def test_delete_one_child(self):
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(2)
        self.bst.delete(3)
        self.assertFalse(self.bst.search(3))
        self.assertTrue(self.bst.search(2))
        self.assertEqual(self.bst.size(), 2)

    def test_delete_two_children(self):
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        self.bst.insert(2)
        self.bst.insert(4)
        self.bst.delete(3)
        self.assertFalse(self.bst.search(3))
        self.assertTrue(self.bst.search(2))
        self.assertTrue(self.bst.search(4))
        self.assertEqual(self.bst.size(), 4)

    def test_delete_root(self):
        self.bst.insert(5)
        self.bst.insert(3)
        self.bst.insert(7)
        self.bst.delete(5)
        self.assertFalse(self.bst.search(5))
        self.assertTrue(self.bst.search(3))
        self.assertTrue(self.bst.search(7))

if __name__ == "__main__":
    unittest.main()

