import unittest
from avl_tree import AVLTree

class TestAVLTree(unittest.TestCase):
    def setUp(self):
        self.avl = AVLTree()

    def test_insert_and_search(self):
        self.avl.insert(10)
        self.avl.insert(20)
        self.avl.insert(30)
        self.assertTrue(self.avl.search(10))
        self.assertTrue(self.avl.search(20))
        self.assertTrue(self.avl.search(30))
        self.assertFalse(self.avl.search(40))
        # Tree should be balanced after insertions
        self.assertTrue(self.avl.is_balanced())

    def test_is_empty(self):
        self.assertTrue(self.avl.is_empty())
        self.avl.insert(1)
        self.assertFalse(self.avl.is_empty())

    def test_size(self):
        self.assertEqual(self.avl.size(), 0)
        self.avl.insert(10)
        self.avl.insert(20)
        self.avl.insert(30)
        self.assertEqual(self.avl.size(), 3)

    def test_height_balanced(self):
        self.assertEqual(self.avl.height(), 0)
        self.avl.insert(10)
        self.assertEqual(self.avl.height(), 1)
        self.avl.insert(20)
        self.avl.insert(30)
        # After balancing, height should be 2 (not 3)
        self.assertEqual(self.avl.height(), 2)
        self.assertTrue(self.avl.is_balanced())

    def test_find_min(self):
        self.assertIsNone(self.avl.find_min())
        self.avl.insert(10)
        self.avl.insert(5)
        self.avl.insert(15)
        self.assertEqual(self.avl.find_min(), 5)

    def test_find_max(self):
        self.assertIsNone(self.avl.find_max())
        self.avl.insert(10)
        self.avl.insert(5)
        self.avl.insert(15)
        self.assertEqual(self.avl.find_max(), 15)

    def test_inorder_traversal_sorted(self):
        # Insert in random order
        self.avl.insert(50)
        self.avl.insert(30)
        self.avl.insert(70)
        self.avl.insert(20)
        self.avl.insert(40)
        # Inorder should produce sorted order
        result = self.avl.inorder_traversal()
        self.assertEqual(result, [20, 30, 40, 50, 70])
        self.assertTrue(self.avl.is_balanced())

    def test_left_rotation(self):
        # Insert to trigger left rotation
        self.avl.insert(10)
        self.avl.insert(20)
        self.avl.insert(30)
        # Tree should be balanced
        self.assertTrue(self.avl.is_balanced())
        self.assertEqual(self.avl.height(), 2)

    def test_right_rotation(self):
        # Insert to trigger right rotation
        self.avl.insert(30)
        self.avl.insert(20)
        self.avl.insert(10)
        # Tree should be balanced
        self.assertTrue(self.avl.is_balanced())
        self.assertEqual(self.avl.height(), 2)

    def test_left_right_rotation(self):
        # Insert to trigger left-right rotation
        self.avl.insert(30)
        self.avl.insert(10)
        self.avl.insert(20)
        # Tree should be balanced
        self.assertTrue(self.avl.is_balanced())

    def test_right_left_rotation(self):
        # Insert to trigger right-left rotation
        self.avl.insert(10)
        self.avl.insert(30)
        self.avl.insert(20)
        # Tree should be balanced
        self.assertTrue(self.avl.is_balanced())

    def test_delete_leaf(self):
        self.avl.insert(10)
        self.avl.insert(5)
        self.avl.insert(15)
        self.avl.delete(5)
        self.assertFalse(self.avl.search(5))
        self.assertTrue(self.avl.is_balanced())
        self.assertEqual(self.avl.size(), 2)

    def test_delete_one_child(self):
        self.avl.insert(10)
        self.avl.insert(5)
        self.avl.insert(15)
        self.avl.insert(3)
        self.avl.delete(5)
        self.assertFalse(self.avl.search(5))
        self.assertTrue(self.avl.is_balanced())
        self.assertEqual(self.avl.size(), 3)

    def test_delete_two_children(self):
        self.avl.insert(10)
        self.avl.insert(5)
        self.avl.insert(15)
        self.avl.insert(3)
        self.avl.insert(7)
        self.avl.delete(5)
        self.assertFalse(self.avl.search(5))
        self.assertTrue(self.avl.is_balanced())
        self.assertEqual(self.avl.size(), 4)

    def test_delete_maintains_balance(self):
        # Insert multiple nodes
        for i in [10, 20, 30, 40, 50, 25]:
            self.avl.insert(i)
        self.assertTrue(self.avl.is_balanced())
        
        # Delete and check balance
        self.avl.delete(25)
        self.assertTrue(self.avl.is_balanced())
        
        self.avl.delete(40)
        self.assertTrue(self.avl.is_balanced())

    def test_complex_insertion_sequence(self):
        # Insert sequence that requires multiple rotations
        values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]
        for val in values:
            self.avl.insert(val)
            self.assertTrue(self.avl.is_balanced(), 
                          f"Tree unbalanced after inserting {val}")
        
        # Verify sorted order
        result = self.avl.inorder_traversal()
        self.assertEqual(result, sorted(values))

    def test_preorder_traversal(self):
        self.avl.insert(10)
        self.avl.insert(5)
        self.avl.insert(15)
        result = self.avl.preorder_traversal()
        # Should contain all elements
        self.assertEqual(len(result), 3)
        self.assertIn(10, result)
        self.assertIn(5, result)
        self.assertIn(15, result)

    def test_postorder_traversal(self):
        self.avl.insert(10)
        self.avl.insert(5)
        self.avl.insert(15)
        result = self.avl.postorder_traversal()
        # Should contain all elements
        self.assertEqual(len(result), 3)
        self.assertIn(10, result)
        self.assertIn(5, result)
        self.assertIn(15, result)

    def test_level_order_traversal(self):
        self.avl.insert(10)
        self.avl.insert(5)
        self.avl.insert(15)
        result = self.avl.level_order_traversal()
        # Should contain all elements
        self.assertEqual(len(result), 3)
        self.assertIn(10, result)
        self.assertIn(5, result)
        self.assertIn(15, result)

if __name__ == "__main__":
    unittest.main()

