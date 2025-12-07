"""
Test cases for Splay Tree
"""

import unittest
from splay_tree import SplayTree


class TestSplayTree(unittest.TestCase):
    
    def setUp(self):
        self.tree = SplayTree()
    
    def test_insert_and_search(self):
        """Test basic insert and search operations"""
        self.tree.insert(10, "ten")
        self.tree.insert(5, "five")
        self.tree.insert(15, "fifteen")
        
        self.assertEqual(self.tree.search(10), "ten")
        self.assertEqual(self.tree.search(5), "five")
        self.assertEqual(self.tree.search(15), "fifteen")
        self.assertIsNone(self.tree.search(20))
        
        # After search, accessed node should be at root
        self.assertEqual(self.tree.root.key, 15)
    
    def test_splay_operation(self):
        """Test that accessed nodes are splayed to root"""
        self.tree.insert(50)
        self.tree.insert(30)
        self.tree.insert(70)
        self.tree.insert(20)
        self.tree.insert(40)
        
        # Search for 20, should splay to root
        self.tree.search(20)
        self.assertEqual(self.tree.root.key, 20)
        
        # Search for 40, should splay to root
        self.tree.search(40)
        self.assertEqual(self.tree.root.key, 40)
    
    def test_delete(self):
        """Test delete operation"""
        self.tree.insert(10)
        self.tree.insert(5)
        self.tree.insert(15)
        self.tree.insert(3)
        self.tree.insert(7)
        
        # Delete leaf node
        self.assertTrue(self.tree.delete(3))
        self.assertIsNone(self.tree.search(3))
        
        # Delete node with one child
        self.assertTrue(self.tree.delete(5))
        self.assertIsNone(self.tree.search(5))
        
        # Delete node with two children
        self.assertTrue(self.tree.delete(10))
        self.assertIsNone(self.tree.search(10))
        
        # Delete non-existent key
        self.assertFalse(self.tree.delete(100))
    
    def test_find_min_max(self):
        """Test find minimum and maximum"""
        self.tree.insert(50)
        self.tree.insert(30)
        self.tree.insert(70)
        self.tree.insert(20)
        self.tree.insert(40)
        self.tree.insert(60)
        self.tree.insert(80)
        
        self.assertEqual(self.tree.find_min(), 20)
        self.assertEqual(self.tree.root.key, 20)  # Should be splayed to root
        
        self.assertEqual(self.tree.find_max(), 80)
        self.assertEqual(self.tree.root.key, 80)  # Should be splayed to root
    
    def test_inorder_traversal(self):
        """Test inorder traversal returns sorted keys"""
        keys = [50, 30, 70, 20, 40, 60, 80]
        for key in keys:
            self.tree.insert(key)
        
        result = self.tree.inorder_traversal()
        self.assertEqual(result, sorted(keys))
    
    def test_empty_tree(self):
        """Test operations on empty tree"""
        self.assertTrue(self.tree.is_empty())
        self.assertEqual(self.tree.size(), 0)
        self.assertIsNone(self.tree.search(10))
        self.assertIsNone(self.tree.find_min())
        self.assertIsNone(self.tree.find_max())
        self.assertEqual(self.tree.inorder_traversal(), [])
    
    def test_update_existing_key(self):
        """Test updating value of existing key"""
        self.tree.insert(10, "old")
        self.tree.insert(10, "new")
        
        self.assertEqual(self.tree.search(10), "new")
        self.assertEqual(self.tree.root.key, 10)
    
    def test_single_node(self):
        """Test tree with single node"""
        self.tree.insert(42)
        
        self.assertFalse(self.tree.is_empty())
        self.assertEqual(self.tree.size(), 1)
        self.assertEqual(self.tree.root.key, 42)
        self.assertEqual(self.tree.find_min(), 42)
        self.assertEqual(self.tree.find_max(), 42)
    
    def test_sequential_inserts(self):
        """Test sequential insertions maintain BST property"""
        for i in range(10):
            self.tree.insert(i)
        
        result = self.tree.inorder_traversal()
        self.assertEqual(result, list(range(10)))
        self.assertEqual(self.tree.size(), 10)
    
    def test_reverse_sequential_inserts(self):
        """Test reverse sequential insertions"""
        for i in range(9, -1, -1):
            self.tree.insert(i)
        
        result = self.tree.inorder_traversal()
        self.assertEqual(result, list(range(10)))
        self.assertEqual(self.tree.size(), 10)


if __name__ == '__main__':
    unittest.main()

