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

    def test_degenerate_chain_does_not_overflow_recursion(self):
        # Regression: sorted input builds a chain deeper than Python's recursion limit.
        for i in range(5000):
            self.bst.insert(i)
        self.assertTrue(self.bst.search(4999))
        self.assertEqual(self.bst.size(), 5000)
        self.assertEqual(self.bst.height(), 4999)
        self.assertEqual(self.bst.inorder_traversal(), list(range(5000)))
        self.assertEqual(self.bst.postorder_traversal()[-1], 0)
        self.bst.delete(0)
        self.bst.delete(2500)
        self.assertFalse(self.bst.search(2500))
        self.assertEqual(self.bst.size(), 4998)

    def test_random_ops_match_set(self):
        import random
        rng = random.Random(3)
        ref = set()
        for _ in range(3000):
            k = rng.randrange(120)
            if rng.random() < 0.4:
                self.bst.delete(k)
                ref.discard(k)
            else:
                self.bst.insert(k)
                ref.add(k)
        self.assertEqual(self.bst.inorder_traversal(), sorted(ref))
        self.assertEqual(self.bst.size(), len(ref))

    def test_traversal_orders_after_delete(self):
        for k in (50, 30, 70, 20, 40, 60, 80):
            self.bst.insert(k)
        self.bst.delete(50)
        self.assertEqual(self.bst.preorder_traversal(), [60, 30, 20, 40, 70, 80])
        self.assertEqual(self.bst.postorder_traversal(), [20, 40, 30, 80, 70, 60])
        self.assertEqual(self.bst.level_order_traversal(), [60, 30, 70, 20, 40, 80])

if __name__ == "__main__":
    unittest.main()

