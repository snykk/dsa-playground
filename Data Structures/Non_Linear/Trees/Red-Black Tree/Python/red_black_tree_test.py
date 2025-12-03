import unittest
from red_black_tree import RedBlackTree

class TestRedBlackTree(unittest.TestCase):
    def setUp(self):
        self.rbt = RedBlackTree()

    def test_insert_and_search(self):
        self.rbt.insert(10)
        self.rbt.insert(20)
        self.rbt.insert(30)
        self.assertTrue(self.rbt.search(10))
        self.assertTrue(self.rbt.search(20))
        self.assertTrue(self.rbt.search(30))
        self.assertFalse(self.rbt.search(40))

    def test_is_empty(self):
        self.assertTrue(self.rbt.is_empty())
        self.rbt.insert(1)
        self.assertFalse(self.rbt.is_empty())

    def test_size(self):
        self.assertEqual(self.rbt.size(), 0)
        self.rbt.insert(10)
        self.rbt.insert(20)
        self.rbt.insert(30)
        self.assertEqual(self.rbt.size(), 3)

    def test_height(self):
        self.assertEqual(self.rbt.height(), 0)
        self.rbt.insert(10)
        self.assertEqual(self.rbt.height(), 1)
        self.rbt.insert(20)
        self.rbt.insert(30)
        # Tree should be balanced
        self.assertLessEqual(self.rbt.height(), 3)

    def test_find_min(self):
        self.assertIsNone(self.rbt.find_min())
        self.rbt.insert(10)
        self.rbt.insert(5)
        self.rbt.insert(15)
        self.assertEqual(self.rbt.find_min(), 5)

    def test_find_max(self):
        self.assertIsNone(self.rbt.find_max())
        self.rbt.insert(10)
        self.rbt.insert(5)
        self.rbt.insert(15)
        self.assertEqual(self.rbt.find_max(), 15)

    def test_inorder_traversal_sorted(self):
        self.rbt.insert(50)
        self.rbt.insert(30)
        self.rbt.insert(70)
        self.rbt.insert(20)
        self.rbt.insert(40)
        result = self.rbt.inorder_traversal()
        self.assertEqual(result, [20, 30, 40, 50, 70])

    def test_complex_insertion(self):
        values = [10, 20, 30, 40, 50, 25, 35]
        for val in values:
            self.rbt.insert(val)
        # Verify all inserted
        for val in values:
            self.assertTrue(self.rbt.search(val))
        # Verify sorted order
        result = self.rbt.inorder_traversal()
        self.assertEqual(result, sorted(values))

if __name__ == "__main__":
    unittest.main()

